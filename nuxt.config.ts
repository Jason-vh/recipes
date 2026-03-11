// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  nitro: {
    preset: "bun",
  },
  runtimeConfig: {
    appSecret: process.env.APP_SECRET || "",
    databaseUrl: process.env.DATABASE_URL || "",
    public: {
      appUrl: process.env.APP_URL || "http://localhost:3000",
    },
  },
  app: {
    head: {
      title: "Recipes",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Personal recipe collection" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap",
        },
      ],
    },
  },
});
