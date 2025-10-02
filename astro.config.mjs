import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import serviceWorker from "astrojs-service-worker";
import starlightThemeRapide from "starlight-theme-rapide";
import starlightThemeObsidian from "starlight-theme-obsidian";

// const DEV_PORT = 2121;

// https://astro.build/config
export default defineConfig({
  site: process.env.CI
    ? "https://sredsol-com.shsarmaknl.workers.dev"
    : `http://localhost:4321`,
  // base: process.env.CI ? '/' : undefined,

  // output: 'server',
  output: "server",
  adapter: node({
    mode: "standalone",
    experimentalStaticHeaders: true,
  }),
  security: {
    checkOrigin: true,
  },
  /* Like Vercel, Netlify,… Mimicking for dev. server */
  // trailingSlash: 'always',

  // server: {
  // 	/* Dev. server only */
  // 	port: DEV_PORT,
  // },

  integrations: [
    //
    starlight({
      //plugins: [starlightThemeRapide()],
      plugins: [starlightThemeObsidian()],
      logo: {
        src: "./src/assets/logo.svg",
      },
      title: "sredsol docs",
      favicon: "/images/favicon.svg",
      prerender: false,
      components: {
        Head: "./src/overrides/Head.astro",
        // Pagination: "./src/overrides/Pagination.astro",
        // Sidebar: "./src/overrides/Sidebar.astro",
        // ThemeSelect: "./src/overrides/ThemeSelect.astro",
      },
      customCss: [
        // Relative path to your custom CSS file
        "./src/styles/global.css",
        "./src/styles/custom.css",
      ],
      head: [
        // Add ICO favicon fallback for Safari.
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/images/favicon.ico",
            sizes: "32x32",
          },
        },
      ],
      sidebar: [
        // A single link item labelled “Home”.
        { label: "Home", link: "/docs" },
        // A group labelled “Start Here” containing four links.
        {
          label: "Start Here",
          items: [
            { label: "Introduction", slug: "docs/intro" },
            { label: "Purchase", slug: "docs/procurement" },
            { label: "Installation", slug: "docs/installation" },
            { label: "Admin Dashboard", slug: "docs/admin-dash" },
            { label: "Teacher Dashboard", slug: "docs/teacher-dash" },
          ],
        },
        {
          label: "AP State Board",
          collapsed: true,
          items: [
            { label: "6 math", slug: "apstate/6math" },
            { label: "7 math", slug: "apstate/7math" },
            { label: "8 math", slug: "apstate/8math" },
            { label: "9 math", slug: "apstate/9math" },
            { label: "10 math", slug: "apstate/10math" },
            { label: "6 science", slug: "apstate/6sci" },
            { label: "7 science", slug: "apstate/7sci" },
            { label: "8 science", slug: "apstate/8sci" },
            { label: "9 science", slug: "apstate/9sci" },
            { label: "10 science", slug: "apstate/10sci" },
          ],
        },
        {
          label: "Example Activities",
          collapsed: true,
          items: [
            { label: "6 math", slug: "examples/6math" },
            { label: "6 science", slug: "examples/6sci" },
            { label: "7 math", slug: "examples/7math" },
            { label: "7 science", slug: "examples/7sci" },
            { label: "8 math", slug: "examples/8math" },
            { label: "8 science", slug: "examples/8sci" },
            { label: "9 math", slug: "examples/9math" },
            { label: "9 science", slug: "examples/9sci" },
            { label: "10 math", slug: "examples/10math" },
            { label: "10 science", slug: "examples/10sci" },
          ],
        },
      ],
      social: [
        {
          href: "https://bsky.app/profile/sredsol.bsky.social",
          icon: "blueSky",
          label: "Bluesky",
        },
        {
          href: "https://github.com/sredsol",
          icon: "github",
          label: "GitHub",
        },
      ],
    }),
    sitemap(),
    tailwind(),
    serviceWorker(),
  ],
});
