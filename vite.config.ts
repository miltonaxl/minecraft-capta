import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [react(), svgr()],
    server: {
        port: 3000,
    },
    css: {
        modules: {
            exportGlobals: false,
            // Prefijo determinista para facilitar pruebas de CSS Modules
            generateScopedName: (name: string) => name + '__test',
        },
    },
});
