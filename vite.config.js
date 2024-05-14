import { resolve } from "path";
import glsl from "vite-plugin-glsl";

export default {
  root: "src/",
  publicDir: "../static/",
  base: "./",
  build: {
    outDir: "../dist", // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        coffee: resolve(__dirname, "src/pages/coffeeSmoke.html"),
        fluid: resolve(__dirname, "src/pages/fluidSphere.html"),
        holo: resolve(__dirname, "src/pages/hologram.html"),
        modMaterials: resolve(__dirname, "src/pages/modifyMaterials.html"),
        fireworks: resolve(__dirname, "src/pages/fireworks.html"),
      },
    },
  },
  plugins: [glsl()],
};
