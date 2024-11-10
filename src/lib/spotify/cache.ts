import type { MakeRequest } from './request';

export class RequestCacher {
	private unresolved_cache: Map<string, Promise<any>> = new Map();
	private resolved_cache: Map<string, any> = new Map();
	private make_request: MakeRequest;

	constructor(make_request: MakeRequest) {
		this.make_request = make_request;
	}

	makeRequest = async <T>(
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
		const unresolved_response = this.make_request(url, method, handle_response, content_type, body);
		this.unresolved_cache.set(key, unresolved_response);
		const response = await unresolved_response;
		this.resolved_cache.set(key, response);
		return response;
	};
}
