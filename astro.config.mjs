import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import serviceWorker from "astrojs-service-worker";

// const DEV_PORT = 2121;

// https://astro.build/config
export default defineConfig({
	site: process.env.CI
		? 'https://apsixmath.sredsol.com'
		: `http://localhost:4321`,
	// base: process.env.CI ? '/' : undefined,

	// output: 'server',

	/* Like Vercel, Netlify,… Mimicking for dev. server */
	// trailingSlash: 'always',

	// server: {
	// 	/* Dev. server only */
	// 	port: DEV_PORT,
	// },

	integrations: [
		//
		sitemap(),
		tailwind(),
		serviceWorker(),
	],
});
