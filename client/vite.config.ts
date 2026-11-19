import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "node:fs";
import path from "node:path";
import removeConsole from "vite-plugin-remove-console";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";

const isDefined = typeof __dirname !== "undefined";
const _dirname = isDefined ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// HTTPS local (simulación de producción): si se definen certificado y clave,
// tanto el dev server como el preview escuchan con TLS (p. ej. certs de mkcert).
function getHttpsOptions() {
  const certPath = process.env.HTTPS_CERT_PATH;
  const keyPath = process.env.HTTPS_KEY_PATH;

  if (!certPath || !keyPath) {
    return undefined;
  }

  // Rutas provistas por el desarrollador vía variables de entorno (certs de mkcert).
  return {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    cert: readFileSync(certPath),
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    key: readFileSync(keyPath),
  };
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: getHttpsOptions(),
  },
  preview: {
    https: getHttpsOptions(),
  },
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
      include: "**/*.svg",
    }),
    checker({
      typescript: true,
    }),
    removeConsole(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(_dirname, "./src/"),
      "@assets": path.resolve(_dirname, "./src/assets"),
      "@components": path.resolve(_dirname, "./src/components"),
      "@ui": path.resolve(_dirname, "./src/components/ui"),
      "@general": path.resolve(_dirname, "./src/components/general"),
      "@common": path.resolve(_dirname, "./src/components/common"),
      "@hooks": path.resolve(_dirname, "./src/hooks"),
      "@pages": path.resolve(_dirname, "./src/pages"),
      "@styles": path.resolve(_dirname, "./src/styles"),
      "@config": path.resolve(_dirname, "./src/config"),
      "@utils": path.resolve(_dirname, "./src/utils"),
      "@public": path.resolve(_dirname, "./public"),
      "@interfaces": path.resolve(_dirname, "./src/types"),
      "@context": path.resolve(_dirname, "./src/context"),
    },
  },
});
