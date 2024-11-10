import { getPlaylist, getPlaylists, getTracks, type Playlist, type Track } from './api';
import { authorizedRequest } from './authorization';

export class RequestCacher {
	private unresolved_cache: Map<string, Promise<any>> = new Map();
	private resolved_cache: Map<string, any> = new Map();

	private makeRequest = async <T>(
		url: string,
		method: 'GET' | 'POST' | 'PUT' | 'DELETE',
		handle_response: (response: Response) => Promise<T>,
		content_type?: string,
		body?: string
	): Promise<T> => {
		const key = `${url} ${method} ${content_type} ${body}`;
		if (this.resolved_cache.has(key)) {
			return this.resolved_cache.get(key)!;
		}
		if (this.unresolved_cache.has(key)) {
			return await this.unresolved_cache.get(key)!;
		}
		const unresolved_response = authorizedRequest(url, method, handle_response, content_type, body);
		this.unresolved_cache.set(key, unresolved_response);
		const response = await unresolved_response;
		this.resolved_cache.set(key, response);
		return response;
	};

	getPlaylist = async (playlist_id: string): Promise<Playlist> => {
		return await getPlaylist(playlist_id, this.makeRequest);
	};

	getTracks = async (playlist_id: string): Promise<Track[]> => {
		return await getTracks(playlist_id, this.makeRequest);
	};
}
