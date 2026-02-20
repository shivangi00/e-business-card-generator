// src/data/profile.js
import myphoto from "../assets/images/sample.jpg";

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
  company: "Tech Corp",
  companyLogo: "", // NEW: Company logo (base64 or URL)
  location: "London, UK",
  email: "shi00codes@gmail.com",
  emailType: "work",
  phone: "",
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
      id: "professional-1234",
      label: "Professional",
      iconClass: "fa-solid fa-briefcase",
      isNested: false,
      href: "https://linkedin.com/in/your-handle",
      nestedIcons: [], // Always initialize this
    },
    {
      id: "portfolio-5678",
      label: "Portfolio",
      iconClass: "fa-solid fa-code",
      isNested: false,
      href: "https://your-portfolio.com",
      nestedIcons: [],
    },
    {
      id: "social-9012",
      label: "Social",
      iconClass: "fa-brands fa-instagram",
      isNested: false,
      href: "https://instagram.com/your-handle",
      nestedIcons: [],
    },
    {
      id: "contact-3456",
      label: "Contact",
      iconClass: "fa-solid fa-envelope",
      isNested: false,
      href: "mailto:shi00codes@gmail.com",
      nestedIcons: [],
    },
  ],
};
