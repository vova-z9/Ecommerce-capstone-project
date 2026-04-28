import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        // Спробуй додати src/ попереду, якщо папка html всередині src
        about: './src/html/about.html',
        cart: './src/html/cart.html',
        catalog: './src/html/catalog.html',
        contact: './src/html/contact.html',
        productDetails: './src/html/product-details.html',
      },
    },
  },
});