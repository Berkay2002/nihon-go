import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Custom plugin to inject mobile detection for Lovable tagger
const conditionalLovableTagger = () => {
  return {
    name: 'conditional-lovable-tagger',
    transformIndexHtml(html: string) {
      // Add script to conditionally load Lovable tagger based on device type
      const scriptTag = `
        <script>
          window.isDesktopDevice = function() {
            return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
          };
        </script>
      `;
      return html.replace('</head>', `${scriptTag}</head>`);
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only inject the tagger in development mode
    mode === 'development' && conditionalLovableTagger(),
    // Only initialize the tagger if it's development mode
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
