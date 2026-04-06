// ── STORE DATA ────────────────────────────────────────────────────────────────
export const STORE_AISLES = {
  A1:"Produce", A2:"Bakery", A3:"Deli",
  B1:"Dairy",   B2:"Frozen", B3:"Meats",
  C1:"Canned",  C2:"Snacks", C3:"Beverages",
  D1:"Breakfast", D2:"Pasta & Rice", D3:"Condiments",
};

export const ROUTE_ORDER = ["A1","A2","A3","B1","B2","B3","C1","C2","C3","D1","D2","D3"];

export const AISLE_COLORS = {
  A1:"#4ade80", A2:"#fb923c", A3:"#f472b6",
  B1:"#60a5fa", B2:"#818cf8", B3:"#f87171",
  C1:"#facc15", C2:"#34d399", C3:"#38bdf8",
  D1:"#fbbf24", D2:"#a78bfa", D3:"#e879f9",
};

export const STORE_LAYOUT = [
  {id:"A1",label:"A1\nProduce",  x:0,y:0,w:2,h:2},
  {id:"A2",label:"A2\nBakery",   x:2,y:0,w:2,h:2},
  {id:"A3",label:"A3\nDeli",     x:4,y:0,w:2,h:2},
  {id:"B1",label:"B1\nDairy",    x:0,y:3,w:2,h:2},
  {id:"B2",label:"B2\nFrozen",   x:2,y:3,w:2,h:2},
  {id:"B3",label:"B3\nMeats",    x:4,y:3,w:2,h:2},
  {id:"C1",label:"C1\nCanned",   x:0,y:6,w:2,h:2},
  {id:"C2",label:"C2\nSnacks",   x:2,y:6,w:2,h:2},
  {id:"C3",label:"C3\nBeverages",x:4,y:6,w:2,h:2},
  {id:"entrance",label:"ENTRANCE",x:3,y:9,w:3,h:1,type:"special"},
  {id:"checkout",label:"CHECKOUT",x:0,y:9,w:3,h:1,type:"special"},
];

export const QUICK_PROMPTS = [
  {label:"Taco Night 🌮", prompt:"ingredients for taco night for 4 people"},
  {label:"Healthy Week 🥗", prompt:"healthy meal prep groceries for the week"},
  {label:"BBQ Party 🔥", prompt:"backyard BBQ for 8 people"},
  {label:"Breakfast 🍳", prompt:"breakfast items for the week"},
  {label:"Italian 🍝", prompt:"ingredients for pasta and italian dinner"},
  {label:"Smoothies 🥤", prompt:"smoothie ingredients for the week"},
];

export const NEARBY_STORES = [
  { id:"valley", name:"Valley Fresh Market", distance:"0.3 mi", aisles:12 },
  { id:"green",  name:"Green Leaf Grocery",  distance:"0.8 mi", aisles:9  },
  { id:"star",   name:"Star Market",         distance:"1.2 mi", aisles:14 },
  { id:"grove",  name:"Grove Co-op",         distance:"1.5 mi", aisles:8  },
];

// ── THEME ─────────────────────────────────────────────────────────────────────
export const S = {
  bg:"#080a0d", surface:"#0d1117", card:"#111827", border:"#1e2530",
  text:"#e2e8f0", muted:"#4a5568", green:"#4ade80", blue:"#38bdf8",
  orange:"#fb923c", red:"#f87171", purple:"#a78bfa",
};

// ── STORAGE ───────────────────────────────────────────────────────────────────
export const SK = {
  lists:   "cartpath_saved_lists",
  history: "cartpath_history",
  current: "cartpath_current",
};

export async function sGet(key) {
  try {
    if (window.storage) { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
    const v = localStorage.getItem(key); return v ? JSON.parse(v) : null;
  } catch { return null; }
}

export async function sSet(key, val) {
  try {
    if (window.storage) { await window.storage.set(key, JSON.stringify(val)); return; }
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// ── AI HELPERS ────────────────────────────────────────────────────────────────
export async function fetchAISuggestions(prompt, existing) {
  const sys = `You are a grocery assistant for CartPath. Aisles: ${JSON.stringify(STORE_AISLES)}.
Return ONLY raw JSON array of 6-10 items: { name, aisle (one of [${Object.keys(STORE_AISLES).join(",")}]), category, qty, emoji }
Be specific. Exclude: ${existing.map(i=>i.name).join(",")||"none"}.`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
      system:sys, messages:[{role:"user",content:prompt}] })
  });
  const d = await r.json();
  return JSON.parse((d.content?.[0]?.text||"[]").replace(/```json|```/g,"").trim());
}

export async function lookupBarcode(barcode) {
  const sys = `You are a grocery product database. Aisles: ${JSON.stringify(STORE_AISLES)}.
Given a barcode return ONLY raw JSON: { name, brand, aisle (one of [${Object.keys(STORE_AISLES).join(",")}]), category, qty:"1", emoji, description }`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:400,
      system:sys, messages:[{role:"user",content:`Barcode: ${barcode}`}] })
  });
  const d = await r.json();
  return JSON.parse((d.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim());
}

// ── QR PATTERN ────────────────────────────────────────────────────────────────
export function generateQRPattern(data) {
  const size = 21;
  const grid = [];
  let hash = 0;
  for (let i = 0; i < data.length; i++) { hash = ((hash << 5) - hash) + data.charCodeAt(i); hash |= 0; }
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      const inFinder = (r < 8 && c < 8) || (r < 8 && c >= size-8) || (r >= size-8 && c < 8);
      if (inFinder) {
        const lr = r < 8 ? r : r-(size-8), lc = c < 8 ? c : c-(size-8);
        grid[r][c] = (lr===0||lr===6||lc===0||lc===6)||(lr>=2&&lr<=4&&lc>=2&&lc<=4) ? 1 : 0;
      } else {
        const seed = (hash ^ (r*31+c*17) ^ (r*c)) >>> 0;
        grid[r][c] = seed % 3 === 0 ? 1 : 0;
      }
    }
  }
  return grid;
}
