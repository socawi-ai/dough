const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3001;
const INDEX_PATH = path.join(__dirname, 'public', 'index.html');
const DATA_DIR = path.join(__dirname, 'data');
const RECIPES_PATH = path.join(DATA_DIR, 'recipes.json');

const defaultRecipes = [
  {
    id: 'pizza-classic',
    name: 'Classic Pizza',
    category: 'pizza',
    pieces: 4,
    pieceWeight: 260,
    hydration: 65,
    salt: 2.5,
    yeast: 0.25,
    oil: 2,
    milk: 0,
    butter: 0,
  },
  {
    id: 'loaf-country',
    name: 'Country Loaf',
    category: 'loaf',
    pieces: 2,
    pieceWeight: 800,
    hydration: 70,
    salt: 2,
    yeast: 1,
    oil: 3,
    milk: 0,
    butter: 0,
  },
  {
    id: 'breadmachine-basic-1000',
    name: 'Bakmaskin Basic 1000g',
    category: 'breadmachine',
    pieces: 1,
    pieceWeight: 1000,
    hydration: 62,
    salt: 1.8,
    yeast: 1.2,
    oil: 2,
    milk: 0,
    butter: 0,
  },
  {
    id: 'breadmachine-mjolkbrod-1000',
    name: 'Bakmaskin Mjölkbröd 1000g',
    category: 'breadmachine',
    pieces: 1,
    pieceWeight: 1000,
    hydration: 60,
    salt: 1.8,
    yeast: 1.4,
    oil: 2,
    milk: 18,
    butter: 0,
  },
  {
    id: 'breadmachine-brioche-1000',
    name: 'Bakmaskin Brioche 1000g',
    category: 'breadmachine',
    pieces: 1,
    pieceWeight: 1000,
    hydration: 52,
    salt: 1.7,
    yeast: 1.8,
    oil: 0,
    milk: 12,
    butter: 18,
  },
];

async function ensureRecipeDb() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  if (!fs.existsSync(RECIPES_PATH)) {
    await fsp.writeFile(RECIPES_PATH, JSON.stringify(defaultRecipes, null, 2), 'utf8');
    return;
  }

  const raw = await fsp.readFile(RECIPES_PATH, 'utf8');
  const existing = JSON.parse(raw);
  if (!Array.isArray(existing)) {
    await fsp.writeFile(RECIPES_PATH, JSON.stringify(defaultRecipes, null, 2), 'utf8');
    return;
  }

  const ids = new Set(existing.map((r) => r.id));
  let changed = false;
  for (const recipe of defaultRecipes) {
    if (!ids.has(recipe.id)) {
      existing.push(recipe);
      changed = true;
    }
  }
  if (changed) {
    await fsp.writeFile(RECIPES_PATH, JSON.stringify(existing, null, 2), 'utf8');
  }
}

async function readRecipes() {
  await ensureRecipeDb();
  const raw = await fsp.readFile(RECIPES_PATH, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

async function writeRecipes(recipes) {
  await fsp.writeFile(RECIPES_PATH, JSON.stringify(recipes, null, 2), 'utf8');
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sanitizeRecipe(input) {
  const toNum = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const name = String(input.name || '').trim();
  const category = String(input.category || '').trim().toLowerCase();

  if (!name) {
    throw new Error('Recipe name is required');
  }
  if (!['pizza', 'loaf', 'breadmachine'].includes(category)) {
    throw new Error('Category must be pizza, loaf or breadmachine');
  }

  return {
    name,
    category,
    pieces: Math.max(1, Math.round(toNum(input.pieces, 1))),
    pieceWeight: Math.max(1, Math.round(toNum(input.pieceWeight, 1))),
    hydration: Math.max(0, toNum(input.hydration, 0)),
    salt: Math.max(0, toNum(input.salt, 0)),
    yeast: Math.max(0, toNum(input.yeast, 0)),
    oil: Math.max(0, toNum(input.oil, 0)),
    milk: Math.max(0, toNum(input.milk, 0)),
    butter: Math.max(0, toNum(input.butter, 0)),
  };
}

function makeId(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = await fsp.readFile(INDEX_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/recipes') {
      const recipes = await readRecipes();
      sendJson(res, 200, recipes);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/recipes') {
      const body = await readBody(req);
      const recipe = sanitizeRecipe(body);
      const recipes = await readRecipes();
      const created = { id: makeId(recipe.name), ...recipe };
      recipes.push(created);
      await writeRecipes(recipes);
      sendJson(res, 201, created);
      return;
    }

    if (req.method === 'PUT' && url.pathname.startsWith('/api/recipes/')) {
      const recipeId = decodeURIComponent(url.pathname.replace('/api/recipes/', ''));
      if (!recipeId) {
        sendJson(res, 400, { error: 'Recipe id is required' });
        return;
      }

      const body = await readBody(req);
      const updates = sanitizeRecipe(body);
      const recipes = await readRecipes();
      const idx = recipes.findIndex((r) => r.id === recipeId);

      if (idx === -1) {
        sendJson(res, 404, { error: 'Recipe not found' });
        return;
      }

      recipes[idx] = { ...recipes[idx], ...updates };
      await writeRecipes(recipes);
      sendJson(res, 200, recipes[idx]);
      return;
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/api/recipes/')) {
      const recipeId = decodeURIComponent(url.pathname.replace('/api/recipes/', ''));
      if (!recipeId) {
        sendJson(res, 400, { error: 'Recipe id is required' });
        return;
      }

      const recipes = await readRecipes();
      const idx = recipes.findIndex((r) => r.id === recipeId);

      if (idx === -1) {
        sendJson(res, 404, { error: 'Recipe not found' });
        return;
      }

      const deleted = recipes[idx];
      recipes.splice(idx, 1);
      await writeRecipes(recipes);
      sendJson(res, 200, { deleted });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
});

ensureRecipeDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize recipe database:', err.message);
    process.exit(1);
  });
