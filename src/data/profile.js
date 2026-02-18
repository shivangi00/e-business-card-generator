// src/data/profile.js
import myphoto from "../assets/images/IMG_7306.jpg";

export const COLOR_PALETTES = [
  {
    id: "light",
    name: "Light",
    background: "#ffffff",
    text: "#111827",
    accent: "#111827",
  },
  {
    id: "midnight",
    name: "Midnight",
    background: "#020617",
    text: "#f9fafb",
    accent: "#38bdf8",
  },
  {
    id: "sunset",
    name: "Sunset",
    background: "#f97316",
    text: "#111827",
    accent: "#1f2937",
  },
];

export const PROFILE = {
  name: "Shivangi Malik",
  title: "Software Developer",
  location: "London, UK",
  photo: myphoto,
  cvUrl: "/ShivangiMalik.pdf",
  paletteId: "light", // <– NEW
  status: {
    label: "Available",
    type: "work",
  },
  cardSize: "md", // "sm" | "md" | "lg"
  showImage: true,
  paletteId: "default",
    socials: [
      {
        id: "email",
        href: "mailto:shi00codes@gmail.com",
        iconClass: "fa-sharp fa-solid fa-envelope",
      },
      {
        id: "portfolio",
        href: "https://your-portfolio-url.com",
        iconClass: "fa-solid fa-code",
      },
      {
        id: "github",
        href: "https://github.com/your-username",
        iconClass: "fa-brands fa-github",
      },
      {
        id: "linkedin",
        href: "https://www.linkedin.com/in/your-handle",
        iconClass: "fa-brands fa-square-linkedin",
      },
    ],
};
