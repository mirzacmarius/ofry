// Generates SVG placeholder photos for seed listings, so demo data needs no network access.

// Studio-style "product on a soft backdrop" look that matches the Ofry design
// system: a pale, slightly tinted grey per category, never a saturated fill.
const THEMES: Record<string, { tint: string; emoji: string }> = {
  imobiliare: { tint: "#e9eef0", emoji: "🏠" },
  auto: { tint: "#efece8", emoji: "🚗" },
  electronice: { tint: "#ecebef", emoji: "📱" },
  "casa-gradina": { tint: "#e8eee9", emoji: "🛋️" },
  moda: { tint: "#efe9eb", emoji: "👗" },
  copii: { tint: "#efede6", emoji: "🧸" },
  "sport-hobby": { tint: "#e7eeec", emoji: "🚲" },
  animale: { tint: "#eeebe6", emoji: "🐾" },
  "locuri-de-munca": { tint: "#eaecee", emoji: "💼" },
  servicii: { tint: "#eeeae8", emoji: "🛠️" },
};

const FALLBACK = { tint: "#eceeec", emoji: "📦" };

const SUBCATEGORY_EMOJI: Record<string, string> = {
  case: "🏡",
  terenuri: "🌳",
  "spatii-comerciale": "🏢",
  motociclete: "🏍️",
  "piese-auto": "🛞",
  rulote: "🚐",
  ambarcatiuni: "🚤",
  laptopuri: "💻",
  "tv-audio": "📺",
  foto: "📷",
  console: "🎮",
  electrocasnice: "🧺",
  decoratiuni: "🖼️",
  gradina: "🌿",
  bricolaj: "🔨",
  "haine-barbati": "🧥",
  incaltaminte: "👟",
  accesorii: "👜",
  "haine-copii": "👕",
  carucioare: "👶",
  fitness: "🏋️",
  carti: "📚",
  instrumente: "🎸",
  colectii: "🪙",
  caini: "🐕",
  pisici: "🐈",
  transport: "🚚",
  meditatii: "📐",
};

/** An 800x600 SVG photo placeholder; `index` varies the composition between photos. */
export function placeholderSvg(opts: {
  title: string;
  category: string;
  subcategory?: string;
  index: number;
  total: number;
  seed: number;
}) {
  const theme = THEMES[opts.category] ?? FALLBACK;
  const emoji = (opts.subcategory && SUBCATEGORY_EMOJI[opts.subcategory]) || theme.emoji;
  // Shift the object and light a little per photo so a gallery doesn't look like copies.
  const k = opts.seed * 13 + opts.index * 7;
  const dx = ((k * 37) % 120) - 60;
  const size = 190 + ((k * 17) % 50);
  const lightX = 20 + ((k * 23) % 60);
  const cx = 400 + dx;
  const baseY = 300 + size * 0.42;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs>
<radialGradient id="l" cx="${lightX}%" cy="20%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="s"><stop offset="0" stop-color="#1f2a22" stop-opacity="0.22"/><stop offset="1" stop-color="#1f2a22" stop-opacity="0"/></radialGradient>
</defs>
<rect width="800" height="600" fill="${theme.tint}"/>
<rect width="800" height="600" fill="url(#l)"/>
<ellipse cx="${cx}" cy="${baseY}" rx="${size * 0.55}" ry="${size * 0.09}" fill="url(#s)"/>
<text x="${cx}" y="${300 + size * 0.36}" font-size="${size}" text-anchor="middle">${emoji}</text>
<text x="400" y="572" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="18" fill="#1f2a22" opacity="0.4" text-anchor="middle">Imagine demonstrativă · ${opts.index + 1}/${opts.total}</text>
</svg>`;
}
