import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulse, Global News Intelligence",
    short_name: "Pulse",
    description:
      "Interactive 3D globe visualizing breaking news with AI-powered briefings.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#00f0ff",
    orientation: "landscape",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
