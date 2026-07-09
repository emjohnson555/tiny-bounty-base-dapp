import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  bg: "#f4efe7",
  paper: "#fffdf8",
  ink: "#27211c",
  brown: "#8f4731",
  gold: "#f0c15c",
  sand: "#efe5d6",
  cream: "#f6ead8",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function frame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <path d="M0 340H1284M0 680H1284M0 1020H1284M0 1360H1284M0 1700H1284M0 2040H1284M0 2380H1284" stroke="rgba(39,33,28,0.06)" stroke-width="3"/>
    ${content}
  </svg>`;
}

function heading(title, subtitle) {
  return `
    <text x="76" y="128" font-family="Courier New, monospace" font-size="31" font-weight="900" letter-spacing="7" fill="${c.brown}">TINY BOUNTY</text>
    <text x="76" y="240" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <text x="80" y="308" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="${c.brown}">${esc(subtitle)}</text>
  `;
}

function noteCard(x, y, task, reward, deadline, category, note) {
  const lines = wrap(note, 35).slice(0, 5);
  return `
    <rect x="${x}" y="${y}" width="1080" height="1140" rx="22" fill="${c.paper}" stroke="rgba(39,33,28,0.14)" stroke-width="6"/>
    <rect x="${x + 72}" y="${y + 58}" width="940" height="1020" rx="18" fill="${c.paper}" stroke="rgba(39,33,28,0.1)" stroke-width="4"/>
    <circle cx="${x + 112}" cy="${y + 92}" r="14" fill="${c.brown}"/>
    <circle cx="${x + 962}" cy="${y + 104}" r="14" fill="${c.brown}"/>
    <text x="${x + 92}" y="${y + 154}" font-family="Courier New, monospace" font-size="24" font-weight="900" letter-spacing="6" fill="${c.brown}">SMALL TASK NOTE</text>
    <text x="${x + 92}" y="${y + 280}" font-family="Arial, sans-serif" font-size="60" font-weight="900" fill="${c.ink}">${esc(task)}</text>
    <rect x="${x + 92}" y="${y + 378}" width="270" height="124" rx="16" fill="${c.cream}"/>
    <text x="${x + 118}" y="${y + 428}" font-family="Courier New, monospace" font-size="20" font-weight="900" fill="${c.brown}">REWARD NOTE</text>
    <text x="${x + 118}" y="${y + 478}" font-family="Arial, sans-serif" font-size="29" font-weight="900" fill="${c.ink}">${esc(reward)}</text>
    <rect x="${x + 394}" y="${y + 378}" width="270" height="124" rx="16" fill="${c.gold}"/>
    <text x="${x + 420}" y="${y + 428}" font-family="Courier New, monospace" font-size="20" font-weight="900" fill="${c.brown}">DEADLINE</text>
    <text x="${x + 420}" y="${y + 478}" font-family="Arial, sans-serif" font-size="29" font-weight="900" fill="${c.ink}">${esc(deadline)}</text>
    <rect x="${x + 696}" y="${y + 378}" width="270" height="124" rx="16" fill="${c.sand}"/>
    <text x="${x + 722}" y="${y + 428}" font-family="Courier New, monospace" font-size="20" font-weight="900" fill="${c.brown}">CATEGORY</text>
    <text x="${x + 722}" y="${y + 478}" font-family="Arial, sans-serif" font-size="29" font-weight="900" fill="${c.ink}">${esc(category)}</text>
    <rect x="${x + 92}" y="${y + 556}" width="874" height="360" rx="18" fill="${c.paper}" stroke="rgba(39,33,28,0.12)" stroke-width="4"/>
    <text x="${x + 122}" y="${y + 620}" font-family="Courier New, monospace" font-size="21" font-weight="900" fill="${c.brown}">NOTE</text>
    ${lines.map((line, i) => `<text x="${x + 122}" y="${y + 694 + i * 38}" font-family="Arial, sans-serif" font-size="30" font-weight="820" fill="${c.ink}">${esc(line)}</text>`).join("")}
  `;
}

function feature(x, y, title, body, fill) {
  return `
    <rect x="${x}" y="${y}" width="540" height="220" rx="18" fill="${fill}" stroke="rgba(39,33,28,0.12)" stroke-width="5"/>
    <text x="${x + 34}" y="${y + 78}" font-family="Arial, sans-serif" font-size="39" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    ${wrap(body, 31).slice(0, 3).map((line, i) => `<text x="${x + 34}" y="${y + 132 + i * 34}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="${c.brown}">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return frame(`
    ${heading("Post a small task.", "Save task, reward note, deadline, category, wallet, and timestamp on Base.")}
    ${noteCard(102, 430, "Write 3 sharp taglines for a Base app", "tip after pick", "today", "copy", "Need three short options that feel crisp inside mobile UI. No generic startup slogans.")}
    ${feature(82, 1740, "One task", "Keep the ask focused and light.", c.paper)}
    ${feature(662, 1740, "Base record", "Wallet and time stay visible by ID.", c.sand)}
  `);
}

function screenshot2() {
  return frame(`
    ${heading("Load any bounty.", "Open a posted task card by ID.")}
    ${feature(82, 390, "Bounty ID", "Reload a public request in one field.", c.gold)}
    ${feature(662, 390, "Deadline", "Make timing obvious at a glance.", c.paper)}
    ${noteCard(102, 740, "Trim one landing hero to a cleaner layout", "feedback swap", "48 hours", "design", "Looking for a quick cleanup pass on spacing, hierarchy, and CTA placement for one screen.")}
  `);
}

function screenshot3() {
  return frame(`
    ${heading("Ask without noise.", "Use one neat note instead of a long thread.")}
    ${noteCard(102, 430, "Check wallet connect flow on Android", "small USDC later", "this week", "qa", "Need one person to test connect, sign, and return state inside Base App and send notes.")}
    ${feature(82, 1740, "Clear ask", "Task, reward note, deadline, done.", c.paper)}
    ${feature(662, 1740, "Lightweight", "A tiny bounty note on Base.", c.sand)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.bg}"/>
    <rect x="132" y="132" width="760" height="760" rx="72" fill="${c.paper}" stroke="rgba(39,33,28,0.14)" stroke-width="28"/>
    <rect x="220" y="236" width="584" height="548" rx="36" fill="${c.paper}" stroke="rgba(39,33,28,0.12)" stroke-width="20"/>
    <circle cx="286" cy="286" r="28" fill="${c.brown}"/>
    <circle cx="738" cy="308" r="28" fill="${c.brown}"/>
    <rect x="270" y="396" width="490" height="74" rx="18" fill="${c.cream}"/>
    <rect x="270" y="516" width="390" height="74" rx="18" fill="${c.gold}"/>
    <rect x="270" y="636" width="440" height="74" rx="18" fill="${c.sand}"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <text x="94" y="150" font-family="Arial, sans-serif" font-size="116" font-weight="900" fill="${c.ink}">Tiny Bounty</text>
    <text x="102" y="252" font-family="Arial, sans-serif" font-size="43" font-weight="800" fill="${c.brown}">Post compact task notes on Base.</text>
    ${feature(96, 390, "Task", "One small request with a clear ask.", c.paper)}
    ${feature(96, 660, "Deadline", "Let helpers know when it matters.", c.sand)}
    ${noteCard(770, 90, "Write 3 sharp taglines for a Base app", "tip after pick", "today", "copy", "Need three short options that feel crisp inside mobile UI. No generic startup slogans.")}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2), "utf8");
await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Tiny Bounty",
    "",
    "App Name: Tiny Bounty",
    "Tagline: Post a task",
    "Description: Post a compact task bounty with task, reward note, deadline, note, wallet, and timestamp on Base.",
    "",
    "Domain: https://tiny-bounty.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
  ].join("\n"),
  "utf8",
);

for (const file of files) console.log(file);
