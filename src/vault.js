// Media vault: a plain folder on disk that can hold thousands of files.
const fs = require('fs');
const path = require('path');
const { app, shell, dialog } = require('electron');

const CATEGORIES = {
  wallpapers: ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.avif'],
  gifs: ['.gif', '.webp'],
  'gifs-4k': ['.gif', '.webp', '.mp4', '.webm'],
};

function root() {
  // Default: Pictures\Definitive 1 PC Vault  (change with NIGHTCITY_VAULT env var)
  return process.env.NIGHTCITY_VAULT || path.join(app.getPath('pictures'), 'Definitive 1 PC Vault');
}

function ensure() {
  for (const c of Object.keys(CATEGORIES)) fs.mkdirSync(path.join(root(), c), { recursive: true });
  return root();
}

function safe(category, name = '') {
  if (!CATEGORIES[category]) throw new Error('bad category');
  const dir = path.join(root(), category);
  const full = path.resolve(dir, name);
  if (!full.startsWith(dir)) throw new Error('bad path');
  return full;
}

async function list(category, { offset = 0, limit = 120, q = '' } = {}) {
  const dir = safe(category);
  const exts = CATEGORIES[category];
  const all = (await fs.promises.readdir(dir, { withFileTypes: true }))
    .filter(d => d.isFile() && exts.includes(path.extname(d.name).toLowerCase()))
    .map(d => d.name)
    .filter(n => !q || n.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return {
    total: all.length,
    items: all.slice(offset, offset + limit).map(name => ({
      name,
      url: `vault://${category}/${encodeURIComponent(name)}`,
    })),
  };
}

async function stats() {
  const out = {};
  for (const c of Object.keys(CATEGORIES)) {
    const files = await fs.promises.readdir(safe(c)).catch(() => []);
    out[c] = files.length;
  }
  return out;
}

async function importFiles(win, category) {
  const exts = CATEGORIES[category].map(e => e.slice(1));
  const r = await dialog.showOpenDialog(win, {
    title: `Add to ${category}`,
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Media', extensions: exts }],
  });
  if (r.canceled) return 0;
  return copyIn(category, r.filePaths);
}

async function copyIn(category, files) {
  let n = 0;
  for (const f of files) {
    if (!CATEGORIES[category].includes(path.extname(f).toLowerCase())) continue;
    let dest = safe(category, path.basename(f));
    for (let i = 1; fs.existsSync(dest); i++) {
      const { name, ext } = path.parse(f);
      dest = safe(category, `${name} (${i})${ext}`);
    }
    await fs.promises.copyFile(f, dest);
    n++;
  }
  return n;
}

async function importFolder(win, category) {
  const r = await dialog.showOpenDialog(win, { title: 'Import a whole folder', properties: ['openDirectory'] });
  if (r.canceled) return 0;
  const files = (await fs.promises.readdir(r.filePaths[0])).map(n => path.join(r.filePaths[0], n));
  return copyIn(category, files);
}

const openFolder = (category) => shell.openPath(category ? safe(category) : root());

module.exports = { CATEGORIES, ensure, root, safe, list, stats, importFiles, importFolder, copyIn, openFolder };
