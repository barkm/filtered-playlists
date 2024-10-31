import { readJpegComment, writeJpegComment, removeDataUrlPrefix } from './jpeg/comment';
import { generateSingleColorJpeg } from './jpeg/generate';
import { fetchImageData } from './jpeg/download';
import {
	addPlaylistCoverImage,
	addTracks,
	createPlaylist,
	getPlaylist,
	getPlaylists,
	getTracks,
	replaceTracks,
	type Playlist,
	type Track
} from './spotify/api';

export interface SynchronizedPlaylist {
	playlist: Playlist;
	included_playlists: Playlist[];
	excluded_playlists: Playlist[];
	required_playlists: Playlist[];
}

export const createSynchronizedPlaylist = async (
	name: string,
	included_playlists: Playlist[],
	excluded_playlists: Playlist[],
	required_playlists: Playlist[]
): Promise<SynchronizedPlaylist> => {
	const description = '@synchronized';
	const playlist = await createPlaylist(name, description);
	const synchronized_playlist = {
		playlist,
		included_playlists,
		excluded_playlists,
		required_playlists
	};
	const definition = {
		included_playlist_ids: included_playlists.map((playlist) => playlist.id),
		excluded_playlist_ids: excluded_playlists.map((playlist) => playlist.id),
		required_playlist_ids: required_playlists.map((playlist) => playlist.id)
	};
	const black = generateSingleColorJpeg(20, 20, 'black');
	const cover = writeJpegComment(black, JSON.stringify(definition));
	const cover_base64 = removeDataUrlPrefix(cover);
	await addPlaylistCoverImage(playlist.id, cover_base64);
	const tracks = await getAndFilterTracks(synchronized_playlist);
	addTracks(
		playlist.id,
		tracks.map((track) => track.uri)
	);
	return {
		playlist,
		included_playlists,
		excluded_playlists,
		required_playlists
	};
};

export const getSynchronizedPlaylists = async (): Promise<SynchronizedPlaylist[]> => {
	const playlists = await getPlaylists();
	return await Promise.all(playlists.filter(isSynchronizedPlaylist).map(toSynchronizedPlaylist));
};

const isSynchronizedPlaylist = (playlist: Playlist): boolean => {
	return playlist.description === '@synchronized' && playlist.cover_url !== null;
};

const toSynchronizedPlaylist = async (playlist: Playlist): Promise<SynchronizedPlaylist> => {
	if (!playlist.cover_url) {
		throw new Error('Playlist has no cover URL');
	}
	const dataUrl = await fetchImageData(playlist.cover_url);
	const comment = readJpegComment(dataUrl);
	const definition = JSON.parse(comment.toString());
	const included_playlists = await Promise.all(definition.included_playlist_ids.map(getPlaylist));
	const excluded_playlists = await Promise.all(definition.excluded_playlist_ids.map(getPlaylist));
	const required_playlists = await Promise.all(definition.required_playlist_ids.map(getPlaylist));
	return {
		playlist,
		included_playlists,
		excluded_playlists,
		required_playlists
	};
};

export const synchronize = async (synchronized_playlist: SynchronizedPlaylist): Promise<void> => {
	const tracks = await getAndFilterTracks(synchronized_playlist);
	replaceTracks(
		synchronized_playlist.playlist.id,
		tracks.map((track) => track.uri)
	);
};

const getAndFilterTracks = async (
	synchronized_playlist: SynchronizedPlaylist
): Promise<Track[]> => {
	const included_tracks = await getTracksFromPlaylists(synchronized_playlist.included_playlists);
	const excluded_tracks = await getTracksFromPlaylists(synchronized_playlist.excluded_playlists);
	const required_tracks = await getTracksFromPlaylists(synchronized_playlist.required_playlists);
	return filterTracks(included_tracks, excluded_tracks, required_tracks);
};

export const filterTracks = (
	included_tracks: Track[],
	excluded_tracks: Track[],
	required_tracks: Track[]
): Track[] => {
	let tracks = difference(included_tracks, excluded_tracks, (track) => track.uri);
	if (required_tracks.length > 0) {
		tracks = intersection(tracks, required_tracks, (track) => track.uri);
	}
	return tracks;
};

const getTracksFromPlaylists = async (playlists: Playlist[]): Promise<Track[]> => {
	const tracks = await Promise.all(playlists.map((playlist) => getTracks(playlist.id)));
	return tracks.flat();
};

const intersection = <T, S>(a: Array<T>, b: Array<T>, key: (x: T) => S): Array<T> => {
	const converted_b = new Set([...b].map(key));
	return [...a].filter((x) => converted_b.has(key(x)));
};

const difference = <T, S>(a: Array<T>, b: Array<T>, key: (x: T) => S): Array<T> => {
	const converted_b = new Set([...b].map(key));
	return [...a].filter((x) => !converted_b.has(key(x)));
};
