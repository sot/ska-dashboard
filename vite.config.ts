import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === "serve") {
    var base = "/"
  } else {
    // command === 'build'
    var base = "/mta/ASPECT/skare3/dashboard-2/";
  }
  return {
    plugins: [react()],
    // this is the magic sauce that replaces paths in index.html
    base: base,
  }
})
