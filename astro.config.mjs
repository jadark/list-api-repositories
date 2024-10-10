import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({
		webAnalytics: {
			enabled: true,
		},
	}),
  integrations: [react(), tailwind({
    applyBaseStyles: false,
  })],
});