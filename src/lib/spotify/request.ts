export type MakeRequest = <T>(
	url: string,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE',
	handle_response: (response: Response) => Promise<T>,
	body?: string,
	content_type?: string
) => Promise<T>;
