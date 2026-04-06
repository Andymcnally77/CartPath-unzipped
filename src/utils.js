// ── STORE DATA (Albertsons) ───────────────────────────────────────────────────
export const STORE_AISLES = {
  "1": "Wine & Beer",
  "2": "Household",
  "3": "Cleaning & Health",
  "4": "Baby & Vitamins",
  "5": "Baby & Toys",
  "6": "Seasonal",
  "7": "Party & Outdoor",
  "8": "Frozen & Desserts",
  "9": "Organic & Water",
  "10": "Pet & Paper",
  "11": "Drinks & Snacks",
  "12": "Soup & Candy",
  "13": "International & Rice",
  "14": "Canned Goods",
  "15": "Cereal & Baking",
  "16": "Bread & Condiments",
  "DAIRY": "Dairy & Eggs",
  "DELI": "Deli & Hot Foods",
  "PROD": "Produce",
};

export const ROUTE_ORDER = ["PROD","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","DAIRY","DELI"];

export const AISLE_COLORS = {
  "1":"#c084fc",  "2":"#60a5fa",  "3":"#34d399",  "4":"#f9a8d4",
  "5":"#fbbf24",  "6":"#fb923c",  "7":"#a3e635",  "8":"#818cf8",
  "9":"#4ade80",  "10":"#f87171", "11":"#38bdf8", "12":"#facc15",
  "13":"#e879f9", "14":"#fb7185", "15":"#94a3b8", "16":"#d97706",
  "DAIRY":"#bfdbfe", "DELI":"#fca5a5", "PROD":"#86efac",
};

export const STORE_LAYOUT = [
  // Row 1: Aisles 1–4
  {id:"1", label:"1\nWine/Beer",  x:0,y:0,w:1,h:2},
  {id:"2", label:"2\nHome",       x:1,y:0,w:1,h:2},
  {id:"3", label:"3\nCleaning",   x:2,y:0,w:1,h:2},
  {id:"4", label:"4\nBaby/Vit",   x:3,y:0,w:1,h:2},
  // Row 2: Aisles 5–8
  {id:"5", label:"5\nBaby/Toy",   x:0,y:2,w:1,h:2},
  {id:"6", label:"6\nSeasonal",   x:1,y:2,w:1,h:2},
  {id:"7", label:"7\nParty",      x:2,y:2,w:1,h:2},
  {id:"8", label:"8\nFrozen",     x:3,y:2,w:1,h:2},
  // Row 3: Aisles 9–12
  {id:"9", label:"9\nOrganic",    x:0,y:4,w:1,h:2},
  {id:"10",label:"10\nPet/Paper", x:1,y:4,w:1,h:2},
  {id:"11",label:"11\nDrinks",    x:2,y:4,w:1,h:2},
  {id:"12",label:"12\nSoup",      x:3,y:4,w:1,h:2},
  // Row 4: Aisles 13–16
  {id:"13",label:"13\nIntl",      x:0,y:6,w:1,h:2},
  {id:"14",label:"14\nCanned",    x:1,y:6,w:1,h:2},
  {id:"15",label:"15\nCereal",    x:2,y:6,w:1,h:2},
  {id:"16",label:"16\nBread",     x:3,y:6,w:1,h:2},
  // Perimeter
  {id:"DAIRY",label:"DAIRY · EGGS · JUICE",x:0,y:8,w:4,h:1,type:"special"},
  {id:"DELI", label:"DELI & HOT FOODS",    x:0,y:9,w:2,h:1,type:"special"},
  {id:"PROD", label:"PRODUCE",             x:2,y:9,w:2,h:1,type:"special"},
  {id:"entrance",label:"ENTRANCE",         x:2,y:10,w:2,h:1,type:"special"},
  {id:"checkout",label:"CHECKOUT",         x:0,y:10,w:2,h:1,type:"special"},
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
  { id:"albertsons", name:"Albertsons",          distance:"0.3 mi", aisles:16 },
  { id:"valley",     name:"Valley Fresh Market", distance:"0.8 mi", aisles:12 },
  { id:"green",      name:"Green Leaf Grocery",  distance:"1.2 mi", aisles:9  },
  { id:"star",       name:"Star Market",         distance:"1.5 mi", aisles:14 },
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
  budget:  "cartpath_budget",
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
    method:"POST", headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-allow-browser":"true"},
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
    method:"POST", headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-allow-browser":"true"},
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


