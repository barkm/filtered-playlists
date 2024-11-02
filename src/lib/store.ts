import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const is_logged_in: Writable<boolean | null> = writable(null);
