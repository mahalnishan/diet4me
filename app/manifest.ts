import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const name = "Diet4Me";
  const short_name = "Diet4Me";
  const start_url = "/";
  const display = "standalone" as const;
  const background_color = "#0a0a0a";
  const theme_color = "#0a0a0a";

  return {
    name,
    short_name,
    start_url,
    display,
    background_color,
    theme_color,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}


