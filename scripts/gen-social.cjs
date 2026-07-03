/* Generates shareable 1080x1350 infographic PNGs into assets/social/.
   Run: node scripts/gen-social.cjs   (sharp is already a dependency) */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "assets", "social");
fs.mkdirSync(OUT, { recursive: true });

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Signpost brand mark, scaled/translated into place.
function mark(x, y, s) {
  const u = s / 64;
  return `<g transform="translate(${x},${y}) scale(${u})">
    <rect width="64" height="64" rx="14.4" fill="#1A1A1A"/>
    <rect x="30.25" y="9.5" width="3.5" height="45" rx="1.75" fill="#F6F4EF"/>
    <path d="M14 15 H42 L50 22 L42 29 H14 Z" fill="#FFCE00"/>
    <path d="M50 33 H22 L14 40 L22 47 H50 Z" fill="#DD0000"/>
  </g>`;
}

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function svg({ titleLines, subtitle, items, numbered, accent }) {
  const W = 1080,
    H = 1350;
  let y = 280;
  const title = titleLines
    .map((t, i) => {
      const ty = y + i * 82;
      return `<text x="80" y="${ty}" font-family="${FONT}" font-size="70" font-weight="800" fill="#1A1A1A">${esc(
        t
      )}</text>`;
    })
    .join("");
  y += titleLines.length * 82 + 6;
  // accent underline
  const underline = `<rect x="82" y="${y}" width="140" height="12" rx="6" fill="${accent}"/>`;
  y += 60;
  const sub = subtitle
    ? `<text x="80" y="${y}" font-family="${FONT}" font-size="38" font-weight="500" fill="#555">${esc(
        subtitle
      )}</text>`
    : "";
  if (subtitle) y += 70;
  y += 40;

  const rows = items
    .map((it, i) => {
      const ry = y + i * 116;
      const badge = numbered
        ? `<circle cx="118" cy="${ry - 14}" r="34" fill="${accent}"/>
           <text x="118" y="${ry - 1}" text-anchor="middle" font-family="${FONT}" font-size="38" font-weight="800" fill="${
             accent === "#FFCE00" ? "#1A1A1A" : "#fff"
           }">${i + 1}</text>`
        : `<circle cx="118" cy="${ry - 14}" r="10" fill="${accent}"/>`;
      return `${badge}
        <text x="184" y="${ry}" font-family="${FONT}" font-size="42" font-weight="600" fill="#1A1A1A">${esc(
        it
      )}</text>`;
    })
    .join("");

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#F6F4EF"/>
    ${mark(80, 90, 72)}
    <text x="172" y="140" font-family="${FONT}" font-size="40" font-weight="800" fill="#1A1A1A">Germany <tspan font-weight="500" fill="#777">Guide</tspan></text>
    ${title}${underline}${sub}${rows}
    <rect x="0" y="${H - 130}" width="${W}" height="130" fill="#1A1A1A"/>
    <text x="80" y="${H - 68}" font-family="${FONT}" font-size="44" font-weight="800" fill="#FFCE00">germanyguide.net</text>
    <text x="80" y="${H - 30}" font-family="${FONT}" font-size="30" font-weight="500" fill="#F6F4EF">Free, city-by-city guide to German bureaucracy</text>
  </svg>`);
}

const GRAPHICS = [
  {
    file: "01-first-steps",
    titleLines: ["New in Germany?", "Do these 6 things first"],
    numbered: true,
    accent: "#FFCE00",
    items: [
      "Register your address (Anmeldung)",
      "Get your tax ID (Steuer-ID)",
      "Open a bank account",
      "Sign up for health insurance",
      "Apply for your residence permit",
      "Register for the Rundfunkbeitrag",
    ],
  },
  {
    file: "02-anmeldung-steps",
    titleLines: ["Anmeldung", "in 5 steps"],
    subtitle: "Register your address within 14 days of moving",
    numbered: true,
    accent: "#DD0000",
    items: [
      "Book an appointment (or walk in)",
      "Get your landlord's confirmation",
      "Fill out the registration form",
      "Bring your passport + the form",
      "Receive your Anmeldebestätigung",
    ],
  },
  {
    file: "03-blocked-account",
    titleLines: ["Blocked account", "(Sperrkonto)"],
    subtitle: "Proof you can support yourself — for your visa",
    numbered: false,
    accent: "#FFCE00",
    items: [
      "Required for most student visas",
      "Deposit a set amount before you arrive",
      "Withdraw a fixed sum each month",
      "Set it up online before you fly",
      "Providers: Expatrio, Fintiba",
    ],
  },
  {
    file: "04-health-insurance",
    titleLines: ["Public vs private", "health insurance"],
    subtitle: "It's mandatory from day one — choose carefully",
    numbered: false,
    accent: "#DD0000",
    items: [
      "Public (GKV): income-based, open to most",
      "Private (PKV): risk-based, mainly high earners",
      "Students: public is usually the safe choice",
      "Switching back to public is often hard",
      "Get advice before you pick private",
    ],
  },
  {
    file: "05-scary-letters",
    titleLines: ["5 German letters", "you must NOT ignore"],
    numbered: true,
    accent: "#DD0000",
    items: [
      "Mahnung — overdue payment reminder",
      "Festsetzungsbescheid — fee assessment",
      "Mahnbescheid — court dunning order",
      "Ausländerbehörde — document request",
      "Kündigung — contract termination",
    ],
  },
];

(async () => {
  for (const g of GRAPHICS) {
    const out = path.join(OUT, `${g.file}.png`);
    await sharp(svg(g)).png().toFile(out);
    console.log("wrote", out);
  }
})();
