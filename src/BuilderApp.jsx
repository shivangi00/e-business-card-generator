// src/BuilderApp.jsx - AUTO-FETCH LOGO + ALL FIXES
import { PROFILE as DEFAULT_PROFILE, COLOR_PALETTES } from "./data/profile.js";
import "./App.css";
import Contact from "./eCard/Contact.jsx";
import ProfileInfo from "./eCard/ProfileInfo.jsx";
import { CARD_SIZES } from "./data/cardSizes";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  generateCardId,
  saveCard,
  updateCard,
  loadCard,
  getCardUrl,
  getUserCards,
} from "./utils/cardHelpers";
import { resizeAndConvertImage } from "./utils/imageHelpers";
import { useAuth } from "./contexts/AuthContext";
import SignIn from "./components/SignIn";
import UserProfile from "./components/UserProfile";

const EMBED_FORMATS = ["HTML", "React", "Vue"];
const MAX_SOCIALS = 4;

const STATUS_PRESETS = [
  { label: "Available for work", type: "work" },
  { label: "Open to collaboration", type: "collab" },
];

const ICON_CATALOGUE = [
  {
    group: "Communication",
    icons: [
      { label: "Email", fa: "fa-sharp fa-solid fa-envelope" },
      { label: "Phone", fa: "fa-solid fa-phone" },
      { label: "WhatsApp", fa: "fa-brands fa-whatsapp" },
      { label: "Telegram", fa: "fa-brands fa-telegram" },
      { label: "Discord", fa: "fa-brands fa-discord" },
      { label: "Slack", fa: "fa-brands fa-slack" },
    ],
  },
  {
    group: "Portfolio & Code",
    icons: [
      { label: "Website", fa: "fa-solid fa-code" },
      { label: "GitHub", fa: "fa-brands fa-github" },
      { label: "GitLab", fa: "fa-brands fa-gitlab" },
      { label: "CodePen", fa: "fa-brands fa-codepen" },
      { label: "Stack Overflow", fa: "fa-brands fa-stack-overflow" },
    ],
  },
  {
    group: "Social",
    icons: [
      { label: "LinkedIn", fa: "fa-brands fa-square-linkedin" },
      { label: "X / Twitter", fa: "fa-brands fa-x-twitter" },
      { label: "Instagram", fa: "fa-brands fa-instagram" },
      { label: "Facebook", fa: "fa-brands fa-facebook" },
      { label: "TikTok", fa: "fa-brands fa-tiktok" },
    ],
  },
  {
    group: "Creative & Design",
    icons: [
      { label: "Figma", fa: "fa-brands fa-figma" },
      { label: "Dribbble", fa: "fa-brands fa-dribbble" },
      { label: "Behance", fa: "fa-brands fa-behance" },
      { label: "Medium", fa: "fa-brands fa-medium" },
      { label: "YouTube", fa: "fa-brands fa-youtube" },
      { label: "Spotify", fa: "fa-brands fa-spotify" },
    ],
  },
  {
    group: "Professional",
    icons: [
      { label: "CV / Resume", fa: "fa-solid fa-file-lines" },
      { label: "Calendar", fa: "fa-solid fa-calendar-days" },
      { label: "Buy me a coffee", fa: "fa-solid fa-mug-hot" },
      { label: "Patreon", fa: "fa-brands fa-patreon" },
    ],
  },
];

// Helper: Fetch company logo from Clearbit
async function fetchCompanyLogo(companyName) {
  if (!companyName || companyName.trim().length === 0) return null;
  
  try {
    // Convert company name to domain guess
    const domain = companyName.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\w]/g, '') + '.com';
    
    // Clearbit Logo API (free tier)
    const logoUrl = `https://logo.clearbit.com/${domain}`;
    
    // Test if image exists
    const response = await fetch(logoUrl, { method: 'HEAD' });
    if (response.ok) {
      return logoUrl;
    }
    return null;
  } catch (err) {
    console.error('Logo fetch error:', err);
    return null;
  }
}

function FocalPointPicker({ src, focal, onChange, onClose }) {
  const imgRef = useRef(null);
  const handleClick = useCallback(
    (e) => {
      const rect = imgRef.current.getBoundingClientRect();
      onChange({
        x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
        y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
      });
    },
    [onChange]
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="focal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-title">Set focus point</p>
            <p className="modal-subtitle">Click anywhere on the image to set where the card crops</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="focal-img-wrap" onClick={handleClick}>
          <img ref={imgRef} src={src} alt="focal" draggable={false} />
          <div className="focal-crosshair" style={{ left: `${focal.x}%`, top: `${focal.y}%` }}>
            <div className="focal-ring" />
            <div className="focal-dot" />
          </div>
          <div className="focal-line focal-line-h" style={{ top: `${focal.y}%` }} />
          <div className="focal-line focal-line-v" style={{ left: `${focal.x}%` }} />
        </div>
        <div className="modal-footer">
          <span className="mono-hint">Focus: {focal.x}% · {focal.y}%</span>
          <button className="btn-primary" onClick={onClose}>Apply focus</button>
        </div>
      </div>
    </div>
  );
}

function IconPickerModal({ onAdd, onClose, isNested = false }) {
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState(null);

  const handleAdd = () => {
    if (!selected) return;
    
    if (isNested) {
      onAdd({
        label: selected.label,
        fa: selected.fa,
        url: url || "#"
      });
    } else {
      const isEmail = selected.label === "Email";
      onAdd({
        id: selected.label.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
        label: selected.label,
        href: isEmail ? `mailto:${url}` : url || "#",
        iconClass: selected.fa,
        isNested: false,
        nestedIcons: [],
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="icon-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-title">{isNested ? "Add sub-icon" : "Add social link"}</p>
            <p className="modal-subtitle">Pick an icon, enter your URL, then add</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="icon-picker-body">
          {ICON_CATALOGUE.map((group) => (
            <div key={group.group} className="icon-group">
              <p className="icon-group-label">{group.group}</p>
              <div className="icon-grid">
                {group.icons.map((icon) => (
                  <button key={icon.fa} type="button"
                    className={`icon-tile ${selected?.fa === icon.fa ? "icon-tile-active" : ""}`}
                    onClick={() => setSelected(icon)} title={icon.label}>
                    <i className={icon.fa} />
                    <span>{icon.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="icon-picker-url-row">
          {selected ? (
            <i className={selected.fa} style={{ color: "var(--accent)", fontSize: "1.1rem", flexShrink: 0 }} />
          ) : (
            <i className="fa-solid fa-link" style={{ color: "var(--text-3)", fontSize: "1rem", flexShrink: 0 }} />
          )}
          <input type="text" autoFocus
            placeholder={selected?.label === "Email" ? "email@example.com" : "https://..."}
            value={url} onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>

        <div className="modal-footer">
          <span className="mono-hint">{selected ? `Selected: ${selected.label}` : "Select an icon above"}</span>
          <button className="btn-primary" onClick={handleAdd} disabled={!selected}>
            {isNested ? "Add sub-icon" : "Add to card"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function downloadCardAsPng() {
  try {
    const { default: html2canvas } = await import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js");
    const el = document.getElementById("ecard-preview");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const canvas = await html2canvas(el, {
      scale: 2, useCORS: true, backgroundColor: null,
      width: rect.width, height: rect.height, x: 0, y: 0,
      scrollX: -window.scrollX, scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
    });
    const link = document.createElement("a");
    link.download = "ecard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    alert("PNG export failed. Try the embed code instead.\n" + err.message);
  }
}

function BuilderApp() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [embedFormat, setEmbedFormat] = useState("HTML");
  const [copied, setCopied] = useState(false);
  const [showFocalPicker, setShowFocalPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showNestedIconPicker, setShowNestedIconPicker] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [myCardId, setMyCardId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoFetching, setLogoFetching] = useState(false);

  const focal = profile.focalPoint || { x: 50, y: 30 };
  const sizeKey = profile.cardSize || "md";
  const isCustom = sizeKey === "custom";
  const size = isCustom
    ? { ...CARD_SIZES.md, width: profile.customWidth || 350, height: profile.customHeight || 370,
        photoHeight: Math.round((profile.customHeight || 370) * 0.43) }
    : CARD_SIZES[sizeKey] || CARD_SIZES.md;

  const selectedPalette = COLOR_PALETTES.find((p) => p.id === profile.paletteId) || COLOR_PALETTES[0];

  // Auto-fetch company logo when company name changes
  useEffect(() => {
    const fetchLogo = async () => {
      if (!profile.company || profile.company.trim().length === 0) {
        return;
      }
      
      // Don't fetch if user already uploaded a custom logo
      if (profile.companyLogo && profile.companyLogo.startsWith('data:image')) {
        return;
      }
      
      setLogoFetching(true);
      const logoUrl = await fetchCompanyLogo(profile.company);
      if (logoUrl) {
        setProfile((prev) => ({ ...prev, companyLogo: logoUrl }));
      }
      setLogoFetching(false);
    };

    const debounceTimer = setTimeout(fetchLogo, 800);
    return () => clearTimeout(debounceTimer);
  }, [profile.company]);

  useEffect(() => {
    const loadExistingCard = async () => {
      if (!isAuthenticated || !user?.uid) return;
      const storageKey = `myCardId:${user.uid}`;
      const storedCardId = localStorage.getItem(storageKey);
      if (storedCardId) {
        const result = await loadCard(storedCardId);
        if (result.success && result.data.userId === user.uid) {
          setMyCardId(storedCardId);
          setProfile(result.data.profile);
          setPublishedUrl(getCardUrl(storedCardId));
          return;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
      const userCardsResult = await getUserCards(user.uid);
      if (userCardsResult.success && userCardsResult.cards.length > 0) {
        const latestCard = userCardsResult.cards[0];
        setMyCardId(latestCard.id);
        setProfile(latestCard.profile);
        setPublishedUrl(getCardUrl(latestCard.id));
        localStorage.setItem(storageKey, latestCard.id);
      }
    };
    loadExistingCard();
  }, [isAuthenticated, user]);

  useEffect(() => {
    localStorage.setItem("ecard-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(DEFAULT_PROFILE);
      setMyCardId(null);
      setPublishedUrl("");
    }
  }, [isAuthenticated]);

  const handleChange = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }));

  const handleRemoveSocial = (index) =>
    setProfile((prev) => ({ ...prev, socials: prev.socials.filter((_, i) => i !== index) }));

  const handleAddSocial = (newSocial) => {
    if (profile.socials.length >= MAX_SOCIALS) return;
    setProfile((prev) => ({ ...prev, socials: [...prev.socials, newSocial] }));
  };

  const handleAddNestedIcon = (socialIndex, iconData) => {
    setProfile((prev) => {
      const socials = [...prev.socials];
      if (!socials[socialIndex].nestedIcons) {
        socials[socialIndex].nestedIcons = [];
      }
      if (socials[socialIndex].nestedIcons.length < 3) {
        socials[socialIndex].nestedIcons.push({
          id: iconData.label.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
          label: iconData.label,
          iconClass: iconData.fa,
          href: iconData.url
        });
      }
      return { ...prev, socials };
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const base64Image = await resizeAndConvertImage(file, 800, 800);
      setProfile((prev) => ({ ...prev, photo: base64Image, focalPoint: { x: 50, y: 30 } }));
      setTimeout(() => setShowFocalPicker(true), 100);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again with a different image.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const base64Logo = await resizeAndConvertImage(file, 200, 200);
      setProfile((prev) => ({ ...prev, companyLogo: base64Logo }));
    } catch (error) {
      console.error("Error processing logo:", error);
      alert("Failed to process logo. Please try again.");
    } finally {
      setLogoUploading(false);
    }
  };

  const statusLabel = profile.status?.label || "Available for work";
  const matchedPreset = STATUS_PRESETS.find((p) => p.label === statusLabel);
  const isCustomStatus = profile.status?.type === "custom";

  const setStatusPreset = (preset) =>
    setProfile((prev) => ({ ...prev, status: { label: preset.label, type: preset.type } }));

  const setStatusCustom = (text) =>
    setProfile((prev) => ({ ...prev, status: { label: text, type: "custom" } }));

  const handlePublish = async () => {
    if (!user?.uid) {
      alert("Auth not ready. Please wait a moment and try again.");
      return;
    }
    setPublishing(true);
    try {
      let cardId = myCardId;
      let result;
      const storageKey = `myCardId:${user.uid}`;
      if (cardId) {
        result = await updateCard(cardId, profile, user.uid);
      } else {
        cardId = generateCardId();
        result = await saveCard(cardId, profile, user.uid);
        if (result.success) {
          setMyCardId(cardId);
          localStorage.setItem(storageKey, cardId);
        }
      }
      if (result.success) {
        const url = getCardUrl(cardId);
        setPublishedUrl(url);
        alert(myCardId ? "✅ Card updated successfully!" : "🎉 Card published successfully!\n\nShare your card with the link below.");
      } else {
        throw new Error(result.error || "Failed to save card");
      }
    } catch (error) {
      console.error("Publish error:", error);
      alert("❌ Failed to publish card. Please try again.\n\nError: " + error.message);
    } finally {
      setPublishing(false);
    }
  };

  const cardUrl = typeof window !== "undefined"
    ? myCardId ? getCardUrl(myCardId, true) : `${window.location.origin}/card?embed=true`
    : "https://your-deployed-url.com/card?embed=true";

  const getEmbedCode = () => {
    const w = size.width, h = size.height;
    if (embedFormat === "HTML") return `<iframe\n  src="${cardUrl}"\n  width="${w}" height="${h}"\n  style="border:0;border-radius:18px;overflow:hidden;display:block;"\n  loading="lazy" title="eCard"\n></iframe>`;
    if (embedFormat === "React") return `<iframe\n  src="${cardUrl}"\n  width={${w}} height={${h}}\n  style={{ border:0, borderRadius:18, overflow:"hidden", display:"block" }}\n  loading="lazy" title="eCard"\n/>`;
    if (embedFormat === "Vue") return `<iframe\n  :src="'${cardUrl}'" :width="${w}" :height="${h}"\n  style="border:0;border-radius:18px;overflow:hidden;display:block;"\n  loading="lazy" title="eCard"\n/>`;
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy manually:\n\n" + text);
    }
  };

  const handleDownloadPng = async () => {
    setDownloading(true);
    await downloadCardAsPng();
    setDownloading(false);
  };

  const handleFlipChange = (flipped) => {
    setIsFlipped(flipped);
  };

  const handleFlipBack = () => {
    setIsFlipped(false);
  };

  const getQRCodeUrl = () => {
    const url = publishedUrl || window.location.href;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const atLimit = profile.socials.length >= MAX_SOCIALS;

  return (
    <>
      {showFocalPicker && profile.photo && (
        <FocalPointPicker src={profile.photo} focal={focal}
          onChange={(pt) => handleChange("focalPoint", pt)}
          onClose={() => setShowFocalPicker(false)}
        />
      )}
      {showIconPicker && !atLimit && (
        <IconPickerModal onAdd={handleAddSocial} onClose={() => setShowIconPicker(false)} isNested={false} />
      )}
      {showNestedIconPicker !== null && (
        <IconPickerModal 
          onAdd={(iconData) => handleAddNestedIcon(showNestedIconPicker, iconData)} 
          onClose={() => setShowNestedIconPicker(null)}
          isNested={true}
        />
      )}

      <div className="app-root">
        <div className="builder-panel">
          <div className="builder-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div>
                <div className="logo-mark">
                  <h1>🐝 buzz</h1>
                </div>
                <h4>We know you're <i>buzzy</i> - <br />share what matters!</h4>
                <p>Customize - Create - Connect</p>
              </div>
              <UserProfile />
            </div>
          </div>

          <div className="builder-body">
            {!isAuthenticated && <SignIn />}

            {isAuthenticated && (
              <>
                <div className="form-section">
                  <h3>Identity</h3>

                  {["name","title","location","cvUrl"].map((field) => (
                    <div className="form-field" key={field}>
                      <label>
                        {field === "cvUrl" ? "CV / Résumé URL" 
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input type="text" value={profile[field] || ""}
                        placeholder={field === "cvUrl" ? "https://..." : ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                      />
                    </div>
                  ))}

                  {/* Company with AUTO-FETCH */}
                  <div className="form-field">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      Company / Institute
                      {logoFetching && (
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "0.7rem", color: "var(--accent)" }} />
                      )}
                    </label>
                    <input type="text" value={profile.company || ""}
                      placeholder="e.g. Google, Microsoft, Apple..."
                      onChange={(e) => handleChange("company", e.target.value)}
                    />
                    <p style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: "0.25rem" }}>
                      💡 Logo auto-fetches from web. Upload custom logo below if needed.
                    </p>
                  </div>

                  {/* Manual Logo Upload Override */}
                  {profile.company && (
                    <div style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
                      <label className={`upload-label ${logoUploading ? "disabled" : ""}`}
                        style={{ padding: "6px 10px", fontSize: "0.75rem" }}>
                        {logoUploading ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-building" />
                            {profile.companyLogo ? "Replace logo" : "Upload custom logo"}
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} />
                      </label>
                      {profile.companyLogo && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", 
                          padding: "0.5rem", background: "var(--surface-2)", borderRadius: "6px" }}>
                          <img src={profile.companyLogo} alt="Company logo" 
                            style={{ width: "24px", height: "24px", objectFit: "cover", borderRadius: "50%", 
                              border: "1px solid var(--border)" }} />
                          <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>Logo preview (circular)</span>
                          <button type="button"
                            onClick={() => handleChange("companyLogo", "")}
                            style={{ marginLeft: "auto", padding: "0.25rem 0.5rem", background: "transparent",
                              border: "1px solid var(--border)", borderRadius: "4px",
                              color: "var(--text-3)", cursor: "pointer", fontSize: "0.7rem" }}>
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-field">
                    <label>Email</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input type="email" value={profile.email || ""} placeholder="your@email.com"
                        onChange={(e) => handleChange("email", e.target.value)} style={{ flex: 1 }}
                      />
                      <select value={profile.emailType || "work"}
                        onChange={(e) => handleChange("emailType", e.target.value)} style={{ width: "auto" }}>
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Phone (Optional)</label>
                    <input type="tel" value={profile.phone || ""} placeholder="+1 234 567 8900"
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Availability status</label>
                    <div className="status-option-row">
                      {STATUS_PRESETS.map((preset) => (
                        <button key={preset.label} type="button"
                          className={`status-option-btn ${statusLabel === preset.label && !isCustomStatus ? "active" : ""}`}
                          onClick={() => setStatusPreset(preset)}>
                          <span className="status-option-dot" />
                          {preset.label}
                        </button>
                      ))}
                      <button type="button"
                        className={`status-option-btn ${isCustomStatus ? "active" : ""}`}
                        onClick={() => {
                          if (!isCustomStatus) {
                            setProfile((prev) => ({ ...prev, status: { label: "", type: "custom" } }));
                          }
                        }}>
                        <i className="fa-solid fa-pen" style={{ fontSize:"0.62rem" }} />
                        Custom
                      </button>
                    </div>
                    {isCustomStatus && (
                      <div style={{ marginTop: 6, position: "relative" }}>
                        <input type="text" placeholder="e.g. Freelancing, On sabbatical…"
                          value={statusLabel || ""}
                          onChange={(e) => {
                            const text = e.target.value;
                            if (text.length <= 28) {
                              setStatusCustom(text);
                            }
                          }}
                          maxLength={28} autoFocus
                        />
                        <span style={{
                          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                          fontSize: "0.7rem",
                          color: (statusLabel?.length || 0) >= 28 ? "#ef4444" : "var(--text-3)",
                          fontWeight: (statusLabel?.length || 0) >= 28 ? 600 : 400,
                        }}>
                          {statusLabel?.length || 0}/28
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="photo-upload-row">
                    <label className={`upload-label ${imageUploading ? "disabled" : ""}`}>
                      {imageUploading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin" />
                          Processing image...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-image" />
                          {profile.photo ? "Change photo" : "Upload photo"}
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={imageUploading} />
                    </label>
                    {profile.photo && !imageUploading && (
                      <button type="button" className="btn-ghost focal-trigger-btn"
                        onClick={() => setShowFocalPicker(true)}>
                        <i className="fa-solid fa-crosshairs" /> Set focus
                      </button>
                    )}
                  </div>
                  {profile.photo && (
                    <div className="focal-mini-preview">
                      <div className="focal-mini-img" style={{
                        backgroundImage: `url(${profile.photo})`,
                        backgroundSize: "cover",
                        backgroundPosition: `${focal.x}% ${focal.y}%`,
                      }} />
                      <span className="focal-mini-label">Crop preview · click "Set focus" to adjust</span>
                    </div>
                  )}
                  <label className="checkbox-row" style={{ marginTop: 8 }}>
                    <input type="checkbox" checked={profile.showImage}
                      onChange={(e) => handleChange("showImage", e.target.checked)}
                    />
                    Show profile image
                  </label>
                </div>

                {/* APPEARANCE */}
                <div className="form-section">
                  <h3>Appearance</h3>
                  <div className="form-field">
                    <label>Card size</label>
                    <select value={sizeKey} onChange={(e) => handleChange("cardSize", e.target.value)}>
                      {Object.entries(CARD_SIZES).map(([key, p]) => (
                        <option key={key} value={key}>{p.label}</option>
                      ))}
                      <option value="custom">Custom…</option>
                    </select>
                  </div>

                  {isCustom && (
                    <div className="custom-size-row">
                      <div className="form-field">
                        <label>Width (px)</label>
                        <input type="number" min={200} max={800}
                          value={profile.customWidth || 350}
                          onChange={(e) => handleChange("customWidth", Number(e.target.value))}
                        />
                      </div>
                      <div className="form-field">
                        <label>Height (px)</label>
                        <input type="number" min={200} max={900}
                          value={profile.customHeight || 370}
                          onChange={(e) => handleChange("customHeight", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}

                  <label style={{ fontSize: "0.75rem", color: "var(--text-2)", marginBottom: 8, display: "block" }}>
                    Color palette
                  </label>
                  <div className="palette-swatches">
                    {COLOR_PALETTES.map((p) => (
                      <button key={p.id} type="button"
                        className={`palette-swatch ${p.id === profile.paletteId ? "active" : ""}`}
                        style={{ background: p.background, color: p.text }}
                        onClick={() => handleChange("paletteId", p.id)}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SOCIAL LINKS */}
                <div className="form-section">
                  <div className="section-header-row">
                    <h3>Social links</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="socials-cap-badge">{profile.socials.length}/{MAX_SOCIALS}</span>
                      <button type="button"
                        className={`add-icon-btn ${atLimit ? "add-icon-btn-disabled" : ""}`}
                        onClick={() => !atLimit && setShowIconPicker(true)}
                        title={atLimit ? "Remove a link to add another" : "Add social link"}
                        disabled={atLimit}>
                        <i className="fa-solid fa-plus" />
                      </button>
                    </div>
                  </div>

                  {profile.socials.length === 0 && (
                    <p className="empty-hint">No links yet — click <strong>+</strong> to add one (max {MAX_SOCIALS}).</p>
                  )}

                  {profile.socials.map((social, index) => {
                    const hasNested = profile.socials.filter(s => s.isNested).length > 0;
                    const canEnableNested = !hasNested || social.isNested;
                    
                    return (
                      <div key={social.id} className="social-edit-row">
                        <div className="social-row-top">
                          <i className={social.iconClass}
                            style={{ color:"var(--accent)", width:18, textAlign:"center", flexShrink:0 }} />
                          <input type="text" value={social.href || ""}
                            onChange={(e) => {
                              setProfile((prev) => {
                                const s = [...prev.socials];
                                s[index] = { ...s[index], href: e.target.value };
                                return { ...prev, socials: s };
                              });
                            }}
                            placeholder="https://..."
                          />
                          <button type="button" className="social-remove-btn"
                            onClick={() => handleRemoveSocial(index)} title="Remove">
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </div>
                        
                        <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)",
                          display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <label style={{ fontSize: "0.75rem", color: "var(--text-2)",
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            cursor: canEnableNested ? "pointer" : "not-allowed",
                            opacity: canEnableNested ? 1 : 0.5 }}>
                            <input type="checkbox" checked={social.isNested || false}
                              disabled={!canEnableNested}
                              onChange={(e) => {
                                setProfile((prev) => {
                                  const s = [...prev.socials];
                                  s[index] = { 
                                    ...s[index], 
                                    isNested: e.target.checked,
                                    nestedIcons: e.target.checked ? (s[index].nestedIcons || []) : []
                                  };
                                  return { ...prev, socials: s };
                                });
                              }}
                            />
                            Add up to 3 sub-icons (fan animation)
                            {!canEnableNested && (
                              <span style={{ fontSize: "0.65rem", opacity: 0.6 }}>(1 allowed in free version)</span>
                            )}
                          </label>
                        </div>

                        {social.isNested && (
                          <div style={{ marginTop: "0.5rem", padding: "0.5rem",
                            background: "var(--surface-2)", borderRadius: "6px" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-2)", marginBottom: "0.5rem" }}>
                              Sub-icons ({social.nestedIcons?.length || 0}/3)
                            </div>
                            
                            {social.nestedIcons?.map((nested, nestedIdx) => (
                              <div key={nested.id} style={{ display: "flex", alignItems: "center",
                                gap: "0.5rem", marginBottom: "0.25rem" }}>
                                <i className={nested.iconClass} style={{ fontSize: "0.875rem", width: 16 }} />
                                <input type="text" value={nested.href}
                                  onChange={(e) => {
                                    setProfile((prev) => {
                                      const s = [...prev.socials];
                                      const n = [...s[index].nestedIcons];
                                      n[nestedIdx] = { ...n[nestedIdx], href: e.target.value };
                                      s[index] = { ...s[index], nestedIcons: n };
                                      return { ...prev, socials: s };
                                    });
                                  }}
                                  placeholder="https://..."
                                  style={{ flex: 1, fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
                                />
                                <button type="button"
                                  onClick={() => {
                                    setProfile((prev) => {
                                      const s = [...prev.socials];
                                      s[index].nestedIcons = s[index].nestedIcons.filter((_, i) => i !== nestedIdx);
                                      return { ...prev, socials: s };
                                    });
                                  }}
                                  style={{ padding: "0.25rem 0.5rem", background: "transparent",
                                    border: "1px solid var(--border)", borderRadius: "4px",
                                    color: "var(--text-3)", cursor: "pointer", fontSize: "0.7rem" }}>
                                  ✕
                                </button>
                              </div>
                            ))}
                            
                            {(!social.nestedIcons || social.nestedIcons.length < 3) && (
                              <button type="button"
                                onClick={() => setShowNestedIconPicker(index)}
                                style={{ width: "100%", padding: "0.4rem",
                                  background: "var(--surface)", border: "1px dashed var(--border)",
                                  borderRadius: "4px", color: "var(--text-2)",
                                  cursor: "pointer", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                + Add sub-icon
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {atLimit && (
                    <p className="limit-hint">
                      <i className="fa-solid fa-circle-info" /> Max {MAX_SOCIALS} links reached.
                      Remove one to add a different icon.
                    </p>
                  )}
                </div>

                {/* PUBLISH & SHARE */}
                <div className="form-section">
                  <h3>Publish &amp; Share</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-2)", marginBottom: "1rem", lineHeight: 1.5 }}>
                    {myCardId
                      ? "Your card is published! Update it anytime or share your unique link."
                      : "Publish your card to get a unique shareable link that works everywhere."}
                  </p>

                  <button className="btn-primary" onClick={handlePublish} disabled={publishing}
                    style={{ width: "100%", padding: "0.875rem", marginBottom: "1rem",
                      fontSize: "1rem", fontWeight: 600, display: "flex",
                      alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    {publishing ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />
                        {myCardId ? "Updating..." : "Publishing..."}
                      </>
                    ) : (
                      <>
                        <i className={myCardId ? "fa-solid fa-arrows-rotate" : "fa-solid fa-rocket"} />
                        {myCardId ? "Update Card" : "Publish Card"}
                      </>
                    )}
                  </button>

                  {publishedUrl && (
                    <div style={{ padding: "1rem", background: "#f0fdf4",
                      border: "1px solid #86efac", borderRadius: "8px", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <i className="fa-solid fa-circle-check" style={{ color: "#22c55e" }} />
                        <p style={{ margin: 0, fontWeight: 600, color: "#166534", fontSize: "0.875rem" }}>
                          {myCardId ? "Card Updated!" : "Card Published!"}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input type="text" readOnly value={publishedUrl}
                          style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem",
                            border: "1px solid #86efac", borderRadius: "4px",
                            background: "white", color: "#166534", fontFamily: "monospace" }}
                          onClick={(e) => e.target.select()}
                        />
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(publishedUrl);
                              alert("✅ Link copied!");
                            } catch (err) {
                              alert("Please copy the link manually");
                            }
                          }}
                          style={{ padding: "0.5rem 0.75rem", background: "#22c55e",
                            color: "white", border: "none", borderRadius: "4px",
                            cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* EMBED & EXPORT */}
                <div className="form-section">
                  <h3>Embed &amp; Export</h3>
                  {!myCardId ? (
                    <div style={{ padding: "1.5rem", background: "#fef3c7",
                      border: "1px solid #fbbf24", borderRadius: "8px", textAlign: "center" }}>
                      <i className="fa-solid fa-circle-info"
                        style={{ fontSize: "1.5rem", color: "#d97706", marginBottom: "0.5rem" }} />
                      <p style={{ margin: 0, color: "#78350f", fontWeight: 600 }}>
                        Publish your card first to get the embed code
                      </p>
                    </div>
                  ) : (
                    <div className="embed-block">
                      <div className="embed-tabs">
                        {EMBED_FORMATS.map((fmt) => (
                          <button key={fmt} className={`embed-tab ${embedFormat === fmt ? "active" : ""}`}
                            onClick={() => setEmbedFormat(fmt)}>{fmt}</button>
                        ))}
                      </div>
                      <textarea readOnly className="embed-textarea" value={getEmbedCode()} />
                      <div className="embed-actions">
                        <button className="btn-primary" onClick={() => handleCopy(getEmbedCode())}>
                          {copied ? "✓ Copied!" : "Copy embed code"}
                        </button>
                        <button className="btn-ghost btn-export-png" onClick={handleDownloadPng}
                          disabled={downloading} title="Download card as PNG image">
                          <i className="fa-solid fa-download" />
                          {downloading ? "Exporting…" : "Export PNG"}
                        </button>
                      </div>
                      <p className="export-note">
                        <i className="fa-solid fa-circle-info" />
                        {" "}PNG export captures the live preview at 2× resolution — great
                        for sharing on LinkedIn, email signatures, or slide decks.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="preview-pane">
            <div className="preview-label">Live Preview</div>
            <div className="preview-wrapper">
              <div className="preview-glow" />
              <div id="ecard-preview" className={`ecard ecard-${sizeKey}`}
                style={{ 
                  width: `${size.width}px`, 
                  minHeight: `${size.height}px`,
                  background: selectedPalette.background, 
                  color: selectedPalette.text,
                  "--card-bg": selectedPalette.background, 
                  "--card-text": selectedPalette.text,
                  position: "relative",
                  overflow: "hidden"
                }}>
                
                {/* FRONT SIDE - Only when NOT flipped */}
                {!isFlipped && (
                  <>
                    {profile.showImage && size.photoHeight > 0 && (
                      <div style={{
                        height: size.photoHeight,
                        width: "100%",
                        overflow: "hidden",
                        flexShrink: 0,
                        borderRadius: "12px 12px 0 0",
                        backgroundImage: `url(${profile.photo})`,
                        backgroundSize: "cover",
                        backgroundPosition: `${(profile.focalPoint || { x: 50, y: 30 }).x}% ${(profile.focalPoint || { x: 50, y: 30 }).y}%`,
                        backgroundRepeat: "no-repeat",
                      }} />
                    )}

                    <div style={{ 
                      flex: 1, 
                      display: "flex", 
                      flexDirection: "column", 
                      padding: "14px 16px 14px" 
                    }}>
                      <ProfileInfo profile={profile} size={size} />
                      <Contact 
                        profile={profile} 
                        onShare={() => handleCopy(window.location.href)}
                        cardUrl={publishedUrl || window.location.href}
                        onFlipChange={handleFlipChange}
                      />
                    </div>
                  </>
                )}

                {/* BACK SIDE - QR Code - Only when flipped */}
                {isFlipped && (
                  <div 
                    onClick={handleFlipBack}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "2rem 1.5rem",
                      cursor: "pointer",
                      animation: "flipIn 0.5s ease-out",
                      background: selectedPalette.background,
                      color: selectedPalette.text,
                      zIndex: 100,
                      borderRadius: "12px",
                    }}
                    className="card-back"
                  >
                    {/* Name at top */}
                    <div style={{
                      position: "absolute",
                      top: "1.5rem",
                      left: 0,
                      right: 0,
                      textAlign: "center",
                    }}>
                      <h3 style={{
                        fontSize: "1.25rem",
                        fontFamily: "'DM Serif Display', Georgia, serif",
                        fontWeight: 400,
                        margin: 0,
                        color: "inherit",
                      }}>
                        {profile.name}
                      </h3>
                      <p style={{
                        fontSize: "0.85rem",
                        margin: "0.25rem 0 0 0",
                        color: "inherit",
                        opacity: 0.6,
                      }}>
                        {profile.title}
                      </p>
                    </div>

                    {/* QR Code in center */}
                    <div style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "5px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}>
                      {publishedUrl ? (
                        <>
                          <img 
                            src={getQRCodeUrl()} 
                            alt="QR Code"
                            style={{
                              width: "100px",
                              height: "100px",
                              display: "block",
                            }}
                          />
                          <p style={{
                            fontSize: "0.7rem",
                            color: "#6b7280",
                            margin: 0,
                            textAlign: "center",
                          }}>
                            Scan to view card
                          </p>
                        </>
                      ) : (
                        <div style={{
                          width: "180px",
                          height: "180px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f3f4f6",
                          borderRadius: "8px",
                          color: "#6b7280",
                          fontSize: "0.85rem",
                          textAlign: "center",
                          padding: "1rem",
                        }}>
                          Publish card to generate QR code
                        </div>
                      )}
                    </div>

                    {/* Line at bottom */}
                    <div style={{
                      position: "absolute",
                      bottom: "1.5rem",
                      left: "2rem",
                      right: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}>
                      <div style={{
                        flex: 1,
                        height: "1px",
                        background: "currentColor",
                        opacity: 0.2,
                      }} />
                      <span style={{
                        fontSize: "0.7rem",
                        opacity: 0.4,
                        whiteSpace: "nowrap",
                      }}>
                        Tap to return
                      </span>
                      <div style={{
                        flex: 1,
                        height: "1px",
                        background: "currentColor",
                        opacity: 0.2,
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BuilderApp;
