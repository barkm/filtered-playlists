import { authorizedRequest } from './authorization';
import type { MakeRequest } from './request';

export class NoAccessError extends Error {}

export interface User {
	id: string;
	display_name: string;
}

export const getUser = async (): Promise<User> => {
	return await authorizedRequest('https://api.spotify.com/v1/me', 'GET', handleGetUserResponse);
};

const handleGetUserResponse = async (response: Response): Promise<User> => {
	if (response.status == 403) {
		throw new NoAccessError();
	}
	if (response.status != 200) {
		throw new Error('Failed to fetch user');
	}
	return await response.json();
};

export interface Playlist {
	id: string;
	name: string;
	description: string;
	cover?: CoverImage;
	spotify_url: string;
}

export const getPlaylist = async (
	playlist_id: string,
	make_request: MakeRequest = authorizedRequest
): Promise<Playlist> => {
	return await make_request(
		`https://api.spotify.com/v1/playlists/${playlist_id}`,
		'GET',
		handleGetPlaylistResponse
	);
};

const handleGetPlaylistResponse = async (response: Response): Promise<Playlist> => {
	if (response.status != 200) {
		throw new Error('Failed to fetch playlist');
	}
	const body = await response.json();
	return parsePlaylistFromItem(body);
};

export const getPlaylists = async (): Promise<Playlist[]> => {
	let playlists: Playlist[] = [];
	let url: string | null = 'https://api.spotify.com/v1/me/playlists';
	while (url) {
		const response: PlaylistsResponse = await authorizedRequest(
			url,
			'GET',
			handleGetPlaylistsResponse
		);
		playlists = playlists.concat(response.playlists);
		url = response.next;
	}
	return playlists;
};

interface PlaylistsResponse {
	playlists: Playlist[];
	next: string | null;
}

const handleGetPlaylistsResponse = async (response: Response): Promise<PlaylistsResponse> => {
	if (response.status != 200) {
		throw new Error('Failed to fetch playlists');
	}
	const body = await response.json();
	return { playlists: body.items.map(parsePlaylistFromItem), next: body.next };
};

const parsePlaylistFromItem = (item: any): Playlist => ({
	id: item.id,
	name: item.name,
	description: item.description,
	cover: item.images?.length > 0 ? item.images[item.images.length - 1] : null,
	spotify_url: item.external_urls.spotify
});

export const createPlaylist = async (
	name: string,
	is_public: boolean,
	description: string
): Promise<Playlist> => {
	const user = await getUser();
	return await authorizedRequest(
		`https://api.spotify.com/v1/users/${user.id}/playlists`,
		'POST',
		handleCreatePlaylistResponse,
		'application/json',
		JSON.stringify({
			name: name,
			public: is_public,
			description: description
		})
	);
};

const handleCreatePlaylistResponse = async (response: Response): Promise<Playlist> => {
	if (response.status != 201) {
		throw new Error('Failed to create playlist');
	}
	const body = await response.json();
	return parsePlaylistFromItem(body);
};

export const unfollowPlaylist = async (playlist_id: string): Promise<void> => {
	await authorizedRequest(
		`https://api.spotify.com/v1/playlists/${playlist_id}/followers`,
		'DELETE',
		handleUnfollowPlaylistResponse,
		'application/json'
	);
};

const handleUnfollowPlaylistResponse = async (response: Response): Promise<void> => {
	if (response.status != 200) {
		throw new Error('Failed to unfollow playlist');
	}
};

export interface Track {
	uri: string;
	name: string;
}

export const getTracks = async (
	playlist_id: string,
	make_request: MakeRequest = authorizedRequest
): Promise<Track[]> => {
	let url: string | null = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
	let tracks: Track[] = [];
	while (url) {
		const response: GetTracksResponse = await make_request(url, 'GET', handleGetTracksResponse);
		url = response.next;
		tracks = tracks.concat(response.tracks);
	}
	return tracks;
};

interface GetTracksResponse {
	tracks: Track[];
	next: string | null;
}

const handleGetTracksResponse = async (response: Response): Promise<GetTracksResponse> => {
	if (response.status != 200) {
		throw new Error('Failed to fetch tracks');
	}
	const body = await response.json();
	const tracks: Track[] = body.items.map(
		(item: any): Track => ({
			uri: item.track.uri,
			name: item.track.name
		})
	);
	return {
		tracks: tracks,
		next: body.next
	};
};

export const addTracks = async (playlist_id: string, track_uris: string[]): Promise<void> => {
	const track_uris_chunks = chunkArray(track_uris, 100);
	for (const chunk of track_uris_chunks) {
		await addTracksChunk(playlist_id, chunk);
	}
};

const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		result.push(array.slice(i, i + chunkSize));
	}
	return result;
};

const addTracksChunk = async (playlist_id: string, track_uris: string[]): Promise<void> => {
	const response = await authorizedRequest(
		`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
		'POST',
		handleAddTracksChunkResponse,
		'application/json',
		JSON.stringify({
			uris: track_uris
		})
	);
};

const handleAddTracksChunkResponse = async (response: Response): Promise<void> => {
	if (response.status != 201) {
		throw new Error('Failed to add tracks');
	}
};

export const replaceTracks = async (playlist_id: string, track_uris: string[]): Promise<void> => {
	await authorizedRequest(
		`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
		'PUT',
		handleReplaceTracksResponse,
		'application/json',
		JSON.stringify({
			uris: []
		})
	);
	await addTracks(playlist_id, track_uris);
};

const handleReplaceTracksResponse = async (response: Response): Promise<void> => {
	if (response.status != 201 && response.status != 200) {
		throw new Error('Failed to replace tracks');
	}
};

export const addPlaylistCoverImage = async (
	playlist_id: string,
	image_data: string
): Promise<void> => {
	await authorizedRequest(
		`https://api.spotify.com/v1/playlists/${playlist_id}/images`,
		'PUT',
		handAddPlaylistCoverImageResponse,
		'image/jpeg',
		image_data
	);
};

const handAddPlaylistCoverImageResponse = async (response: Response): Promise<void> => {
	if (response.status != 202) {
		throw new Error('Failed to add cover image');
	}
};

export interface CoverImage {
	url: string;
	width: number | null;
	height: number | null;
}

export const getPlaylistCoverImage = async (
	playlist_id: string
): Promise<CoverImage | undefined> => {
	return await authorizedRequest(
		`https://api.spotify.com/v1/playlists/${playlist_id}/images`,
		'GET',
		handleGetPlaylistCoverImageResponse
	);
};

const handleGetPlaylistCoverImageResponse = async (
	response: Response
): Promise<CoverImage | undefined> => {
	if (response.status != 200) {
		throw new Error('Failed to fetch cover image');
	}
	const images = await response.json();
	if (images.length == 0) {
		return undefined;
	}
	const image = images[images.length - 1];
	return {
		url: image.url,
		width: image.width,
		height: image.height
	};
};
