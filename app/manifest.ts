import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dreamweaver Oracle Engine - AI Roleplay Platform",
    short_name: "Oracle Engine",
    description:
      "Advanced AI-powered roleplay engine with multi-character adventures, world building, and intelligent character memory systems",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0514",
    theme_color: "#b16ae8",
    orientation: "portrait-primary",
    categories: ["entertainment", "productivity", "social"],
    icons: [
      {
        src: "/icons/icon-72x72.jpg",
        sizes: "72x72",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-96x96.jpg",
        sizes: "96x96",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-128x128.jpg",
        sizes: "128x128",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-144x144.jpg",
        sizes: "144x144",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-152x152.jpg",
        sizes: "152x152",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-192x192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-384x384.jpg",
        sizes: "384x384",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-512x512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable any",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Go to Oracle Dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-96x96.jpg", sizes: "96x96", type: "image/jpeg" }],
      },
      {
        name: "Characters",
        short_name: "Characters",
        description: "View your characters",
        url: "/characters",
        icons: [{ src: "/icons/icon-96x96.jpg", sizes: "96x96", type: "image/jpeg" }],
      },
      {
        name: "Embark Modes",
        short_name: "Embark",
        description: "Start an adventure",
        url: "/embark-modes",
        icons: [{ src: "/icons/icon-96x96.jpg", sizes: "96x96", type: "image/jpeg" }],
      },
    ],
  }
}
