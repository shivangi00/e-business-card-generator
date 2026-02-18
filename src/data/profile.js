// src/data/profile.js
import myphoto from "../assets/images/IMG_7306.jpg";

export const COLOR_PALETTES = [
  {
    id: "light",
    name: "Light",
    background: "#ffffff",
    text: "#111827",
  },
  {
    id: "midnight",
    name: "Midnight",
    background: "#0d0d14",
    text: "#f0eff5",
  },
  {
    id: "slate",
    name: "Slate",
    background: "#1e293b",
    text: "#f1f5f9",
  },
  {
    id: "cream",
    name: "Cream",
    background: "#faf6f0",
    text: "#2c2218",
  },
  {
    id: "forest",
    name: "Forest",
    background: "#1a2e1f",
    text: "#d4f0db",
  },
  {
    id: "rose",
    name: "Rose",
    background: "#fff1f2",
    text: "#4c0519",
  },
];

export const PROFILE = {
  name: "Shivangi Malik",
  title: "Software Developer",
  location: "London, UK",
  photo: myphoto,
  cvUrl: "/ShivangiMalik.pdf",
  paletteId: "light",
  status: {
    label: "Available for work",
    type: "work",
  },
  cardSize: "md",
  showImage: true,
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
