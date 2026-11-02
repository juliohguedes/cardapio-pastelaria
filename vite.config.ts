import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Caminhos relativos: o site funciona no GitHub Pages, dentro de /cardapio-pastelaria/
export default defineConfig({ base: "./", plugins: [react()] });
