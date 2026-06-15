import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Briefly — AI Email & Calendar Workspace",
    short_name: "Briefly",
    description: "Manage Gmail and Google Calendar with AI-powered workflows, smart prioritization, meeting preparation, and executive briefings.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#09090B",
    theme_color: "#8B5CF6",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
