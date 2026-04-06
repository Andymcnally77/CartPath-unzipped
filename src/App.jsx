import { useState, useEffect } from "react";
import Onboarding from "./screens/Onboarding.jsx";
import MainApp from "./screens/MainApp.jsx";

const ONBOARDING_KEY = "cartpath_onboarded";

async function sGet(key) {
  try { const r = await window.storage?.get(key); return r ? JSON.parse(r.value) : null; }
  catch { return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null; }
}
async function sSet(key, val) {
  try { await window.storage?.set(key, JSON.stringify(val)); }
  catch { localStorage.setItem(key, JSON.stringify(val)); }
}

export default function App() {
  const [onboarded, setOnboarded] = useState(null);
  const [user,  setUser]  = useState(null);
  const [store, setStore] = useState(null);

  useEffect(() => {
    (async () => {
      const profile = await sGet(ONBOARDING_KEY);
      if (profile) { setUser(profile.user); setStore(profile.store); setOnboarded(true); }
      else setOnboarded(false);
    })();
  }, []);

  const handleOnboardingComplete = async (userData, storeData) => {
    const profile = { user: userData, store: storeData };
    await sSet(ONBOARDING_KEY, profile);
    setUser(userData); setStore(storeData); setOnboarded(true);
  };

  if (onboarded === null) return (
    <div style={{ height:"100vh", background:"#080a0d", display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'DM Mono','Courier New',monospace", color:"#4a5568" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:12 }}>🛒</div>
        <div style={{ fontSize:10, letterSpacing:3 }}>LOADING…</div>
      </div>
    </div>
  );

  if (!onboarded) return <Onboarding onComplete={handleOnboardingComplete} />;
  return <MainApp user={user} store={store} />;
}
