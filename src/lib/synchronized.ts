import type { DurationLimits } from './duration';
import { readJpegComment, writeJpegComment, removeDataUrlPrefix } from './jpeg/comment';
import { fetchImageData } from './jpeg/download';
import {
	addPlaylistCoverImage,
	addTracks,
	createPlaylist,
	getPlaylist,
	getPlaylistCoverImage,
	getTracks,
	replaceTracks,
	type Playlist,
	type Track
} from './spotify/api';
import type { MakeRequest } from './spotify/request';

export interface SynchronizedPlaylist {
	playlist: Playlist;
	included_playlists: Playlist[];
	excluded_playlists: Playlist[];
	required_playlists: Playlist[];
	duration_limits: DurationLimits;
	synchronizing: boolean;
}

export const createSynchronizedPlaylist = async (
	make_request: MakeRequest,
	cover_data: string,
	name: string,
	included_playlists: Playlist[],
	excluded_playlists: Playlist[],
	required_playlists: Playlist[],
	is_public: boolean,
	duration_limits: DurationLimits
): Promise<SynchronizedPlaylist> => {
	const playlist = await createPlaylist(name, is_public, '');
	const synchronized_playlist: SynchronizedPlaylist = {
		playlist: playlist,
		included_playlists: included_playlists,
		excluded_playlists: excluded_playlists,
		required_playlists: required_playlists,
		duration_limits: duration_limits,
		synchronizing: false
	};
	const definition = {
		included_playlist_ids: included_playlists.map((playlist) => playlist.id),
		excluded_playlist_ids: excluded_playlists.map((playlist) => playlist.id),
		required_playlist_ids: required_playlists.map((playlist) => playlist.id),
		duration_limits: duration_limits
	};
	const cover = writeJpegComment(cover_data, JSON.stringify(definition));
	const cover_base64 = removeDataUrlPrefix(cover);
	let success = false;
	while (!success) {
		try {
			await addPlaylistCoverImage(playlist.id, cover_base64);
			success = true;
		} catch (error) {
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}
	const tracks = await getAndFilterTracks(make_request, synchronized_playlist);
	addTracks(
		playlist.id,
		tracks.map((track) => track.uri)
	);
	let cover_url = undefined;
	let retries = 0;
	while (cover_url === undefined && retries < 5) {
		const cover = await getPlaylistCoverImage(playlist.id);
		if (cover && cover?.height === null) {
			cover_url = cover.url;
			break;
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
		retries++;
	}
	playlist.cover = cover_url
		? {
				url: cover_url,
				width: null,
				height: null
			}
		: undefined;
	return {
		playlist: playlist,
		included_playlists: included_playlists,
		excluded_playlists: excluded_playlists,
		required_playlists: required_playlists,
		duration_limits: duration_limits,
		synchronizing: false
	};
};

export const filterSychronizedPlaylists = async (
	make_request: MakeRequest,
	playlists: Playlist[]
): Promise<SynchronizedPlaylist[]> => {
	const valid_playlists = await asyncFilter(playlists, isSynchronizedPlaylist);
	return await Promise.all(valid_playlists.map((p) => toSynchronizedPlaylist(make_request, p)));
};

const asyncFilter = async <T>(array: T[], filter: (x: T) => Promise<boolean>): Promise<T[]> => {
	const filter_array = await Promise.all(array.map(filter));
	return array.filter((_, i) => filter_array[i]);
};

const isSynchronizedPlaylist = async (playlist: Playlist): Promise<boolean> => {
	try {
		if (!playlist.cover || playlist.cover.width !== null || playlist.cover.height !== null) {
			return false;
		}
		const data_url = await fetchImageData(playlist.cover.url);
		const comment = readJpegComment(data_url);
		const definition = JSON.parse(comment.toString());
		if (
			!Array.isArray(definition.included_playlist_ids) ||
			!Array.isArray(definition.excluded_playlist_ids) ||
			!Array.isArray(definition.required_playlist_ids)
		) {
			return false;
		}
	} catch (error) {
		return false;
	}
	return true;
};

const toSynchronizedPlaylist = async (
	make_request: MakeRequest,
	playlist: Playlist
): Promise<SynchronizedPlaylist> => {
	if (!playlist.cover) {
		throw new Error('Playlist has no cover');
	}
	const dataUrl = await fetchImageData(playlist.cover.url);
	const comment = readJpegComment(dataUrl);
	const definition = JSON.parse(comment.toString());
	const included_playlists = await Promise.all(
		definition.included_playlist_ids.map((id: string) => getPlaylist(id, make_request))
	);
	const excluded_playlists = await Promise.all(
		definition.excluded_playlist_ids.map((id: string) => getPlaylist(id, make_request))
	);
	const required_playlists = await Promise.all(
		definition.required_playlist_ids.map((id: string) => getPlaylist(id, make_request))
	);
	let duration_limits = { min: 0, max: Infinity };
	if ('duration_limits' in definition) {
		duration_limits = {
			min: definition.duration_limits.min,
			max: definition.duration_limits.max === null ? Infinity : definition.duration_limits.max
		};
	}
	return {
		playlist: playlist,
		included_playlists: included_playlists,
		excluded_playlists: excluded_playlists,
		required_playlists: required_playlists,
		duration_limits: duration_limits,
		synchronizing: false
	};
};

export const synchronize = async (
	synchronized_playlist: SynchronizedPlaylist,
	make_request: MakeRequest
): Promise<void> => {
	synchronized_playlist.synchronizing = true;
	const tracks = await getAndFilterTracks(make_request, synchronized_playlist);
	replaceTracks(
		synchronized_playlist.playlist.id,
		tracks.map((track) => track.uri)
	);
	synchronized_playlist.synchronizing = false;
};

const getAndFilterTracks = async (
	make_request: MakeRequest,
	synchronized_playlist: SynchronizedPlaylist
): Promise<Track[]> => {
	const included_tracks = await getTracksFromPlaylists(
		make_request,
		synchronized_playlist.included_playlists
	);
	const excluded_tracks = await getTracksFromPlaylists(
		make_request,
		synchronized_playlist.excluded_playlists
	);
	const required_tracks = await getTracksFromPlaylists(
		make_request,
		synchronized_playlist.required_playlists
	);
	return filterTracks(
		included_tracks,
		excluded_tracks,
		required_tracks,
		synchronized_playlist.duration_limits
	);
};

export const filterTracks = (
	included_tracks: Track[],
	excluded_tracks: Track[],
	required_tracks: Track[],
	duration_limits: { min: number; max: number }
): Track[] => {
	let tracks = removeDuplicates(included_tracks, (track) => track.uri);
	tracks = tracks.filter((track) => {
		return track.duration_ms >= duration_limits.min && track.duration_ms <= duration_limits.max;
	});
	tracks = difference(tracks, excluded_tracks, (track) => track.uri);
	if (required_tracks.length > 0) {
		tracks = intersection(tracks, required_tracks, (track) => track.uri);
	}
	return tracks;
};

export const getTracksFromPlaylists = async (
	make_request: MakeRequest,
	playlists: Playlist[]
): Promise<Track[]> => {
	const tracks = await Promise.all(
		playlists.map((playlist) => getTracks(playlist.id, make_request))
	);
	return tracks.flat();
};

const removeDuplicates = <T, S>(array: Array<T>, key: (x: T) => S): Array<T> => {
	const seen = new Set<S>();
	return array.filter((x) => {
		const k = key(x);
		return seen.has(k) ? false : seen.add(k);
	});
};

const intersection = <T, S>(a: Array<T>, b: Array<T>, key: (x: T) => S): Array<T> => {
	const converted_b = new Set([...b].map(key));
	return [...a].filter((x) => converted_b.has(key(x)));
};

const difference = <T, S>(a: Array<T>, b: Array<T>, key: (x: T) => S): Array<T> => {
	const converted_b = new Set([...b].map(key));
	return [...a].filter((x) => !converted_b.has(key(x)));
};
