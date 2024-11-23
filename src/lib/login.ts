import { writable } from 'svelte/store';
import { AuthorizationError, isLoggedIn, logout } from './spotify/authorization';
import { base } from '$app/paths';

export const is_logged_in = writable(isLoggedIn());

export const logged_in_guard = <T>(
	fn: (...args: any) => Promise<T>
): ((...args: any) => Promise<T | undefined>) => {
	const wrapped = async (...args: any) => {
		try {
			return await fn(...args);
		} catch (e) {
			if (e instanceof AuthorizationError) {
				logout();
				is_logged_in.set(Promise.resolve(false));
			} else {
				throw e;
			}
		}
	};
	return wrapped;
};
