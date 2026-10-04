import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import Generouted from '@generouted/react-router/plugin'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), Generouted(), tsconfigPaths()],
})
