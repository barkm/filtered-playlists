import { getAccessToken } from './authorization';

export const isLoggedIn = async (): Promise<boolean> => {
	return (await getAccessToken()) !== null;
};

export interface User {
	id: string;
	display_name: string;
}

export const getUser = async (): Promise<User> => {
	const access_token = await getAccessToken();
	if (!access_token) {
		throw new Error('No access token');
	}
	const response = await fetch('https://api.spotify.com/v1/me', {
		headers: {
			Authorization: `Bearer ${access_token}`
		}
	});
	if (response.status != 200) {
		throw new Error('Failed to fetch user');
	}
	return await response.json();
};

export interface Playlist {
	id: string;
	name: string;
	description: string;
	cover_url?: string;
}

export const getPlaylist = async (playlist_id: string): Promise<Playlist> => {
	const access_token = await getAccessToken();
	if (!access_token) {
		throw new Error('No access token');
	}
	const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
		headers: {
			Authorization: `Bearer ${access_token}`
		}
	});
	if (response.status != 200) {
		throw new Error('Failed to fetch playlist');
	}
	const body = await response.json();
	return {
		id: body.id,
		name: body.name,
		description: body.description,
		cover_url: body.images ? body.images[0].url : null
	};
};

export const getPlaylists = async (): Promise<Playlist[]> => {
	const access_token = await getAccessToken();
	if (!access_token) {
		throw new Error('No access token');
	}
	let playlists: Playlist[] = [];
	let url = 'https://api.spotify.com/v1/me/playlists';
	while (url) {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${access_token}`
			}
		});
		if (response.status != 200) {
			throw new Error('Failed to fetch playlists');
		}
		const body = await response.json();
		playlists = playlists.concat(
			body.items.map((item: any) => ({
				id: item.id,
				name: item.name,
				description: item.description,
				cover_url: item.images ? item.images[0].url : null
			}))
		);
		url = body.next;
	}
	return playlists;
};

export const createPlaylist = async (name: string, description: string): Promise<Playlist> => {
	const access_token = await getAccessToken();
	if (!access_token) {
		throw new Error('No access token');
	}
	const user = await getUser();
	const response = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${access_token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			name: name,
			description: description
		})
	});
	if (response.status != 201) {
		throw new Error('Failed to create playlist');
	}
	const body = await response.json();
	return {
		id: body.id,
		name: body.name,
		description: body.description
	};
};

export interface Track {
	uri: string;
	name: string;
}

export const getTracks = async (playlist_id: string): Promise<Track[]> => {
	const access_token = await getAccessToken();
	if (!access_token) {
		throw new Error('No access token');
	}
	let url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
	let tracks: Track[] = [];
	while (url) {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${access_token}`
			}
		});
		if (response.status != 200) {
			throw new Error('Failed to fetch tracks');
		}
		const body = await response.json();
		url = body.next;
		tracks = tracks.concat(
			body.items.map((item: any) => ({
				uri: item.track.uri,
				name: item.track.name
			}))
		);
	}
	return tracks;
};

export const addTracks = async (playlist_id: string, track_uris: string[]): Promise<void> => {
	const access_token = await getAccessToken();
	if (!access_token) {
		throw new Error('No access token');
	}
	const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${access_token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			uris: track_uris
		})
	});
	if (response.status != 201) {
		throw new Error('Failed to add tracks');
	}
};

export const replaceTracks = async (playlist_id: string, track_uris: string[]): Promise<void> => {
	const access_token = await getAccessToken();
	if (!access_token) {
		throw new Error('No access token');
	}
	const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${access_token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			uris: track_uris
		})
	});
	if (response.status != 201 && response.status != 200) {
		throw new Error('Failed to replace tracks');
	}
};

export const addPlaylistCoverImage = async (
	playlist_id: string,
	image_data: string
): Promise<void> => {
	const access_token = await getAccessToken();
	if (!access_token) {
		throw new Error('No access token');
	}
	const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/images`, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${access_token}`,
			'Content-Type': 'image/jpeg'
		},
		body: image_data
	});
	if (response.status != 202) {
		throw new Error('Failed to add cover image');
	}
};
