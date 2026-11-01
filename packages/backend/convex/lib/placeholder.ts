// Generates SVG placeholder photos for seed listings, so demo data needs no network access.

const THEMES: Record<string, { from: string; to: string; emoji: string }> = {
  imobiliare: { from: "#38bdf8", to: "#1d4ed8", emoji: "🏠" },
  auto: { from: "#fb923c", to: "#c2410c", emoji: "🚗" },
  electronice: { from: "#a78bfa", to: "#6d28d9", emoji: "📱" },
  "casa-gradina": { from: "#4ade80", to: "#15803d", emoji: "🛋️" },
  moda: { from: "#f472b6", to: "#be185d", emoji: "👗" },
  copii: { from: "#facc15", to: "#ca8a04", emoji: "🧸" },
  "sport-hobby": { from: "#2dd4bf", to: "#0f766e", emoji: "🚲" },
  animale: { from: "#fbbf24", to: "#b45309", emoji: "🐾" },
  "locuri-de-munca": { from: "#94a3b8", to: "#334155", emoji: "💼" },
  servicii: { from: "#f87171", to: "#b91c1c", emoji: "🛠️" },
};

const FALLBACK = { from: "#cbd5e1", to: "#475569", emoji: "📦" };

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

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Splits text into at most `maxLines` lines of roughly `width` characters. */
function wrap(text: string, width: number, maxLines: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1]!.replace(/[\s,.;:]+$/, "")}…`;
  }
  return lines;
}

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
  const angle = (opts.seed * 37 + opts.index * 70) % 360;
  const rad = (angle * Math.PI) / 180;
  const x2 = 50 + 50 * Math.cos(rad);
  const y2 = 50 + 50 * Math.sin(rad);
  const circles = [0, 1, 2]
    .map((i) => {
      const k = opts.seed * 13 + opts.index * 7 + i * 29;
      const cx = (k * 97) % 800;
      const cy = (k * 61) % 600;
      const r = 80 + ((k * 17) % 160);
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" opacity="0.08"/>`;
    })
    .join("");
  const titleLines = wrap(opts.title, 30, 2)
    .map((l, i) => `<tspan x="400" dy="${i === 0 ? 0 : 44}">${escapeXml(l)}</tspan>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs><linearGradient id="g" x1="${100 - x2}%" y1="${100 - y2}%" x2="${x2}%" y2="${y2}%">
<stop offset="0" stop-color="${theme.from}"/><stop offset="1" stop-color="${theme.to}"/>
</linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>${circles}
<text x="400" y="270" font-size="150" text-anchor="middle">${emoji}</text>
<text x="400" y="390" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="34" font-weight="600" fill="#fff" text-anchor="middle">${titleLines}</text>
<text x="400" y="560" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="20" fill="#fff" opacity="0.8" text-anchor="middle">Imagine demonstrativă · ${opts.index + 1}/${opts.total}</text>
</svg>`;
}
