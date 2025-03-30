import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      CORS_ORIGIN: 'http://127.0.0.1:8787',
    },
    DATABASE_URL: '',
  },
  devServer: {
    host: '0.0.0.0',
  },
  srcDir: 'src',
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
  },
});
