import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type UserConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

const user_config: UserConfig = {
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
};

if (process.argv.includes('dev')) {
	user_config.plugins!.push(basicSsl());
	user_config.server = { proxy: {} };
}

export default defineConfig(user_config);
