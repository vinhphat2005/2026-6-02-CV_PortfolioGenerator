import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: false,
  esbuild: {
    // @ts-expect-error Vite 8 still forwards this required JSX transform option but omits it from ESBuildOptions.
    jsx: "automatic"
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
