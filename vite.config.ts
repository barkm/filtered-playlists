import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			// Provide the buffer polyfill for use in the browser
			buffer: 'buffer'
		}
	},
	optimizeDeps: {
		include: ['buffer']
	}
});
