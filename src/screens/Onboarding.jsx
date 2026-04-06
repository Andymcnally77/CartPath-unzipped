import { useState, useEffect, useRef } from "react";
import { S, NEARBY_STORES } from "../utils.js";

const SLIDES = [
  { id:"list",  color:"#4ade80", icon:"✦", headline:"Your smartest\nshopping list.",    sub:"Tell the AI what you're cooking. Get a complete, aisle-sorted list in seconds.", visual:"list" },
  { id:"nav",   color:"#38bdf8", icon:"◎", headline:"Navigate the\nstore like a pro.", sub:"Optimized aisle-by-aisle routing so you never backtrack.",                        visual:"map"  },
  { id:"scan",  color:"#fb923c", icon:"⊡", headline:"Scan as you\nshop.",              sub:"Scan barcodes to add items. Skip the checkout line with scan-and-go.",             visual:"scan" },
  { id:"exit",  color:"#a78bfa", icon:"✓", headline:"Walk out\nverified.",             sub:"One QR scan at the door confirms your payment. Fast, honest, frictionless.",       visual:"qr"   },
];

function ListVisual({ color }) {
  const items = [{emoji:"🍎",name:"Roma Tomatoes",aisle:"A1",w:70},{emoji:"🍞",name:"Sourdough",aisle:"A2",w:55},{emoji:"🥛",name:"Whole Milk",aisle:"B1",w:85},{emoji:"🍗",name:"Chicken Breast",aisle:"B3",w:62}];
  return (
    <div style={{width:"100%",maxWidth:280,margin:"0 auto"}}>
      {items.map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",marginBottom:6,background:S.card,border:`1px solid ${S.border}`,borderRadius:10,animation:`slideInLeft 0.4s ease ${i*0.1}s both`}}>
          <span style={{fontSize:20}}>{item.emoji}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:S.text,marginBottom:4}}>{item.name}</div>
            <div style={{height:3,background:S.border,borderRadius:3}}><div style={{height:"100%",width:`${item.w}%`,background:color,borderRadius:3,animation:`growBar 0.6s ease ${0.3+i*0.1}s both`}}/></div>
          </div>
          <div style={{fontSize:8,color,letterSpacing:1,fontFamily:"monospace"}}>{item.aisle}</div>
        </div>
      ))}
    </div>
  );
}

function MapVisual({ color }) {
  const cells=[{x:0,y:0,label:"A1"},{x:1,y:0,label:"A2"},{x:2,y:0,label:"A3"},{x:0,y:1,label:"B1"},{x:1,y:1,label:"B2"},{x:2,y:1,label:"B3"},{x:0,y:2,label:"C1"},{x:1,y:2,label:"C2"},{x:2,y:2,label:"C3"}];
  const route=["A1","B1","B3","C2","C3"];
  return (
    <div style={{display:"flex",justifyContent:"center"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:6}}>
        {cells.map((cell,i)=>{const ri=route.indexOf(cell.label);const inRoute=ri>=0;return(
          <div key={i} style={{height:60,borderRadius:8,background:inRoute?`${color}18`:S.card,border:inRoute?`1.5px solid ${color}66`:`1px solid ${S.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,animation:`fadeInScale 0.3s ease ${i*0.06}s both`,boxShadow:inRoute?`0 0 10px ${color}22`:"none",position:"relative"}}>
            {inRoute&&<div style={{position:"absolute",top:4,right:5,width:14,height:14,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:S.bg}}>{ri+1}</div>}
            <div style={{fontSize:11,fontWeight:700,color:inRoute?color:S.muted,fontFamily:"'DM Mono','Courier New',monospace"}}>{cell.label}</div>
            <div style={{width:24,height:2,background:inRoute?color:S.border,borderRadius:2}}/>
          </div>
        );})}
      </div>
    </div>
  );
}

function ScanVisual({ color }) {
  const [sl,setSl]=useState(0);
  useEffect(()=>{let d=1,p=0;const iv=setInterval(()=>{p+=d*3;if(p>=100)d=-1;if(p<=0)d=1;setSl(p);},20);return()=>clearInterval(iv);},[]);
  return (
    <div style={{display:"flex",justifyContent:"center"}}>
      <div style={{width:220,height:140,background:"#0a0c0f",borderRadius:16,border:`1.5px solid ${color}44`,position:"relative",overflow:"hidden",boxShadow:`0 0 30px ${color}22`}}>
        <div style={{position:"absolute",inset:"20px 40px",display:"flex",gap:2,alignItems:"stretch"}}>
          {Array.from({length:28}).map((_,i)=><div key={i} style={{flex:i%3===0?2:1,background:`${color}${i%5===0?"cc":"44"}`,borderRadius:1}}/>)}
        </div>
        <div style={{position:"absolute",left:8,right:8,top:`${sl}%`,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`,boxShadow:`0 0 8px ${color}`,transition:"top 0.02s linear"}}/>
        {[["tl","top:8,left:8","borderTop","borderLeft"],["tr","top:8,right:8","borderTop","borderRight"],["bl","bottom:8,left:8","borderBottom","borderLeft"],["br","bottom:8,right:8","borderBottom","borderRight"]].map(([k,pos,...b])=>(
          <div key={k} style={{position:"absolute",...Object.fromEntries(pos.split(",").map(p=>p.split(":").map(s=>s.trim()))),width:18,height:18,...Object.fromEntries(b.map(x=>[x,`2px solid ${color}`]))}}/>
        ))}
      </div>
    </div>
  );
}

function QRVisual({ color }) {
  const [verified,setVerified]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVerified(true),2000);return()=>clearTimeout(t);},[]);
  const qr=[[1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],[1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],[1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1],[1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],[1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],[1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1,1,0,1,1,0],[0,1,0,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]];
  const CELL=9;
  return (
    <div style={{display:"flex",justifyContent:"center"}}>
      <div style={{background:"#fff",padding:12,borderRadius:12,boxShadow:verified?`0 0 30px ${color}88`:"none",transition:"box-shadow 0.5s ease",position:"relative"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(21,${CELL}px)`}}>
          {qr.map((row,r)=>row.map((cell,c)=><div key={`${r}-${c}`} style={{width:CELL,height:CELL,background:cell?"#000":"#fff"}}/>))}
          {Array.from({length:11}).map((_,r)=>Array.from({length:21}).map((_,c)=><div key={`x${r}-${c}`} style={{width:CELL,height:CELL,background:((r+c+r*c)%3===0)?"#000":"#fff"}}/>))}
        </div>
        {verified&&<div style={{position:"absolute",inset:0,borderRadius:12,background:"#4ade8022",display:"flex",alignItems:"center",justifyContent:"center",animation:"verifyPop 0.4s ease"}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:S.bg,fontWeight:900,animation:"checkBounce 0.4s ease"}}>✓</div>
        </div>}
      </div>
    </div>
  );
}

function SplashScreen({ onNext }) {
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setLoaded(true),100);return()=>clearTimeout(t);},[]);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,#4ade8018 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,opacity:0.04,pointerEvents:"none",backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
      <div style={{width:80,height:80,borderRadius:22,background:"linear-gradient(135deg,#4ade80,#38bdf8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:900,color:S.bg,marginBottom:24,boxShadow:"0 0 40px #4ade8044",opacity:loaded?1:0,transform:loaded?"scale(1)":"scale(0.7)",transition:"all 0.6s cubic-bezier(0.34,1.56,0.64,1)"}}>C</div>
      <div style={{opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(16px)",transition:"all 0.5s ease 0.2s"}}>
        <div style={{fontSize:38,fontWeight:700,color:"#f1f5f9",letterSpacing:-1,marginBottom:8,fontFamily:"'DM Mono','Courier New',monospace"}}>CartPath</div>
        <div style={{fontSize:14,color:S.muted,marginBottom:48,lineHeight:1.6}}>The smarter way to grocery shop.</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:280,marginBottom:48,opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(20px)",transition:"all 0.5s ease 0.4s"}}>
        {[[S.green,"✦","AI-powered shopping lists"],[S.blue,"◎","In-store navigation"],[S.orange,"⊡","Scan-as-you-shop checkout"]].map(([color,icon,text])=>(
          <div key={text} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:S.card,border:`1px solid ${S.border}`,borderRadius:12}}>
            <div style={{width:28,height:28,borderRadius:7,background:`${color}18`,border:`1px solid ${color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color,flexShrink:0}}>{icon}</div>
            <span style={{fontSize:12,color:S.text}}>{text}</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} style={{width:"100%",maxWidth:280,padding:"14px",background:S.green,border:"none",borderRadius:14,color:S.bg,fontSize:13,fontWeight:700,letterSpacing:2,cursor:"pointer",fontFamily:"'DM Mono','Courier New',monospace",boxShadow:"0 0 24px #4ade8044",opacity:loaded?1:0,transition:"all 0.5s ease 0.6s"}}>GET STARTED</button>
      <div style={{fontSize:10,color:"#2d3748",marginTop:16,letterSpacing:1}}>FREE · NO ADS · YOUR DATA STAYS YOURS</div>
    </div>
  );
}

function SlidesScreen({ onNext }) {
  const [current,setCurrent]=useState(0);
  const touchStart=useRef(null);
  const slide=SLIDES[current];
  const next=()=>{if(current<SLIDES.length-1)setCurrent(c=>c+1);else onNext();};
  const prev=()=>{if(current>0)setCurrent(c=>c-1);};
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}} onTouchStart={e=>touchStart.current=e.touches[0].clientX} onTouchEnd={e=>{const diff=touchStart.current-e.changedTouches[0].clientX;if(diff>50)next();if(diff<-50)prev();touchStart.current=null;}}>
      <div style={{padding:"16px 28px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:6}}>{SLIDES.map((_,i)=><div key={i} style={{height:3,borderRadius:3,width:i===current?24:8,background:i===current?slide.color:S.border,transition:"all 0.3s ease"}}/>)}</div>
        <button onClick={onNext} style={{background:"none",border:"none",color:S.muted,fontSize:11,cursor:"pointer",letterSpacing:2,fontFamily:"'DM Mono','Courier New',monospace"}}>SKIP</button>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",overflow:"hidden",padding:"0 28px"}}>
        <div style={{width:"100%"}}>
          <div style={{marginBottom:28,minHeight:170,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {slide.visual==="list"&&<ListVisual color={slide.color}/>}
            {slide.visual==="map"&&<MapVisual color={slide.color}/>}
            {slide.visual==="scan"&&<ScanVisual color={slide.color}/>}
            {slide.visual==="qr"&&<QRVisual color={slide.color}/>}
          </div>
          <div style={{width:44,height:44,borderRadius:12,background:`${slide.color}18`,border:`1.5px solid ${slide.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:slide.color,marginBottom:16}}>{slide.icon}</div>
          <div style={{fontSize:28,fontWeight:700,color:"#f1f5f9",letterSpacing:-0.5,lineHeight:1.2,marginBottom:12,whiteSpace:"pre-line"}}>{slide.headline}</div>
          <div style={{fontSize:13,color:S.muted,lineHeight:1.7}}>{slide.sub}</div>
        </div>
      </div>
      <div style={{padding:"20px 28px 32px",display:"flex",gap:10}}>
        {current>0&&<button onClick={prev} style={{flex:1,padding:"13px",background:S.card,border:`1px solid ${S.border}`,borderRadius:12,color:S.muted,fontSize:11,cursor:"pointer",letterSpacing:2,fontFamily:"'DM Mono','Courier New',monospace"}}>← BACK</button>}
        <button onClick={next} style={{flex:3,padding:"13px",background:slide.color,border:"none",borderRadius:12,color:S.bg,fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:2,fontFamily:"'DM Mono','Courier New',monospace",boxShadow:`0 0 20px ${slide.color}44`,transition:"all 0.3s ease"}}>{current===SLIDES.length-1?"LET'S GO →":"NEXT →"}</button>
      </div>
    </div>
  );
}

function StoreSelectScreen({ onNext }) {
  const [selected,setSelected]=useState(null);
  const [query,setQuery]=useState("");
  const filtered=NEARBY_STORES.filter(s=>s.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"24px 28px 16px"}}>
        <div style={{fontSize:9,letterSpacing:3,color:S.muted,marginBottom:8}}>STEP 1 OF 2</div>
        <div style={{fontSize:26,fontWeight:700,color:"#f1f5f9",letterSpacing:-0.5,marginBottom:6}}>Choose your store</div>
        <div style={{fontSize:12,color:S.muted,lineHeight:1.6}}>Select the store you shop at most. You can add more later.</div>
      </div>
      <div style={{padding:"0 28px 12px"}}>
        <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:10,padding:"9px 12px",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{color:S.muted}}>⌕</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search stores near you…" style={{flex:1,background:"none",border:"none",outline:"none",color:S.text,fontSize:12,fontFamily:"'DM Mono','Courier New',monospace"}}/>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 28px"}}>
        <div style={{fontSize:9,letterSpacing:3,color:S.muted,marginBottom:10}}>📍 NEARBY STORES</div>
        {filtered.map((store,i)=>{const isSel=selected===store.id;return(
          <div key={store.id} onClick={()=>setSelected(store.id)} style={{padding:"14px 16px",marginBottom:8,background:isSel?"#0e2a1a":S.card,border:`1.5px solid ${isSel?S.green:S.border}`,borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.2s",boxShadow:isSel?"0 0 16px #4ade8022":"none",animation:`slideInLeft 0.3s ease ${i*0.06}s both`}}>
            <div style={{width:40,height:40,borderRadius:10,flexShrink:0,background:isSel?"#4ade8022":"#ffffff0a",border:`1px solid ${isSel?S.green+"44":S.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏪</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:isSel?S.green:S.text}}>{store.name}</div>
              <div style={{fontSize:10,color:S.muted,marginTop:2,letterSpacing:1}}>{store.distance} · {store.aisles} aisles mapped</div>
            </div>
            <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${isSel?S.green:"#2d3748"}`,background:isSel?S.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:S.bg,fontWeight:900,flexShrink:0}}>{isSel?"✓":""}</div>
          </div>
        );})}
      </div>
      <div style={{padding:"16px 28px 28px"}}>
        <button onClick={()=>selected&&onNext(NEARBY_STORES.find(s=>s.id===selected))} disabled={!selected} style={{width:"100%",padding:"14px",background:selected?S.green:"#1a2a1a",border:"none",borderRadius:12,color:selected?S.bg:"#2d4a2d",fontSize:12,fontWeight:700,letterSpacing:2,cursor:selected?"pointer":"not-allowed",fontFamily:"'DM Mono','Courier New',monospace",transition:"all 0.2s",boxShadow:selected?"0 0 20px #4ade8033":"none"}}>{selected?"CONFIRM STORE →":"SELECT A STORE"}</button>
      </div>
    </div>
  );
}

function AccountScreen({ store, onComplete }) {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [focused,setFocused]=useState(null);
  const [loading,setLoading]=useState(false);
  const valid=name.trim().length>1&&email.includes("@");
  const handleSubmit=()=>{if(!valid)return;setLoading(true);setTimeout(()=>{setLoading(false);onComplete({name,email});},1400);};
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"24px 28px 20px"}}>
        <div style={{fontSize:9,letterSpacing:3,color:S.muted,marginBottom:8}}>STEP 2 OF 2</div>
        <div style={{fontSize:26,fontWeight:700,color:"#f1f5f9",letterSpacing:-0.5,marginBottom:6}}>Create your account</div>
        <div style={{fontSize:12,color:S.muted,lineHeight:1.6}}>Your profile links your lists, history, and exit passes across devices.</div>
      </div>
      <div style={{margin:"0 28px 20px",background:"#0a1520",border:"1px solid #1e3a5a",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>🏪</span>
        <div><div style={{fontSize:11,color:S.blue,fontWeight:700}}>{store?.name}</div><div style={{fontSize:9,color:S.muted,letterSpacing:1}}>YOUR HOME STORE · {store?.distance}</div></div>
        <div style={{marginLeft:"auto",fontSize:9,color:S.green,letterSpacing:1}}>✓ SET</div>
      </div>
      <div style={{padding:"0 28px",flex:1}}>
        {[{key:"name",label:"YOUR NAME",placeholder:"e.g. Alex",value:name,set:setName,type:"text"},{key:"email",label:"EMAIL",placeholder:"you@email.com",value:email,set:setEmail,type:"email"}].map(field=>(
          <div key={field.key} style={{marginBottom:16}}>
            <div style={{fontSize:9,letterSpacing:3,color:S.muted,marginBottom:6}}>{field.label}</div>
            <div style={{background:S.card,border:`1.5px solid ${focused===field.key?S.green:S.border}`,borderRadius:10,padding:"11px 14px",transition:"border-color 0.2s"}}>
              <input type={field.type} value={field.value} onChange={e=>field.set(e.target.value)} onFocus={()=>setFocused(field.key)} onBlur={()=>setFocused(null)} placeholder={field.placeholder} style={{width:"100%",background:"none",border:"none",outline:"none",color:S.text,fontSize:13,fontFamily:"'DM Mono','Courier New',monospace"}}/>
            </div>
          </div>
        ))}
        <div style={{padding:"10px 14px",background:"#0d1420",border:"1px solid #1e2d40",borderRadius:8,display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:14,flexShrink:0}}>🔒</span>
          <div style={{fontSize:10,color:S.muted,lineHeight:1.6}}>CartPath never sells your data. Your shopping history is private to you.</div>
        </div>
      </div>
      <div style={{padding:"20px 28px 32px"}}>
        <button onClick={handleSubmit} disabled={!valid||loading} style={{width:"100%",padding:"14px",background:valid&&!loading?S.green:"#1a2a1a",border:"none",borderRadius:12,color:valid&&!loading?S.bg:"#2d4a2d",fontSize:12,fontWeight:700,letterSpacing:2,cursor:valid&&!loading?"pointer":"not-allowed",fontFamily:"'DM Mono','Courier New',monospace",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading?<><div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${S.bg}`,borderTopColor:"transparent",animation:"spin 0.7s linear infinite"}}/>SETTING UP…</>:"CREATE ACCOUNT →"}
        </button>
      </div>
    </div>
  );
}

function WelcomeScreen({ user, store, onStart }) {
  const [show,setShow]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setShow(true),100);return()=>clearTimeout(t);},[]);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",textAlign:"center"}}>
      <div style={{position:"relative",marginBottom:24,opacity:show?1:0,transition:"opacity 0.4s ease"}}>
        <div style={{position:"absolute",inset:-20,borderRadius:"50%",border:`2px solid ${S.green}`,animation:"ringPulse 2s ease infinite"}}/>
        <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#0e2a1a,#0d2010)",border:`2px solid ${S.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,boxShadow:"0 0 30px #4ade8044"}}>{user.name.charAt(0).toUpperCase()}</div>
      </div>
      <div style={{opacity:show?1:0,transform:show?"translateY(0)":"translateY(16px)",transition:"all 0.5s ease 0.2s"}}>
        <div style={{fontSize:11,letterSpacing:3,color:S.muted,marginBottom:8}}>WELCOME TO CARTPATH</div>
        <div style={{fontSize:28,fontWeight:700,color:"#f1f5f9",letterSpacing:-0.5,marginBottom:6}}>Hey, {user.name.split(" ")[0]}! 👋</div>
        <div style={{fontSize:13,color:S.muted,lineHeight:1.7,marginBottom:32}}>You're all set to shop smarter at<br/><span style={{color:S.blue}}>{store.name}</span>.</div>
      </div>
      <div style={{display:"flex",gap:10,width:"100%",maxWidth:300,marginBottom:36,opacity:show?1:0,transition:"opacity 0.5s ease 0.4s"}}>
        {[[S.green,"✦","AI Lists","Ready"],[S.blue,"◎","Navigation","Mapped"],[S.orange,"⊡","Scan & Go","Enabled"]].map(([color,icon,label,status])=>(
          <div key={label} style={{flex:1,padding:"12px 8px",background:S.card,border:`1px solid ${S.border}`,borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:16,color,marginBottom:4}}>{icon}</div>
            <div style={{fontSize:9,color:S.text,fontWeight:700}}>{label}</div>
            <div style={{fontSize:8,color,marginTop:2,letterSpacing:1}}>{status}</div>
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{width:"100%",maxWidth:300,padding:"14px",background:S.green,border:"none",borderRadius:14,color:S.bg,fontSize:13,fontWeight:700,letterSpacing:2,cursor:"pointer",fontFamily:"'DM Mono','Courier New',monospace",boxShadow:"0 0 24px #4ade8044",opacity:show?1:0,transition:"opacity 0.5s ease 0.6s"}}>START SHOPPING →</button>
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const [step,setStep]=useState("splash");
  const [store,setStore]=useState(null);

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:S.bg,fontFamily:"'DM Mono','Courier New',monospace",color:S.text,maxWidth:480,margin:"0 auto",overflow:"hidden"}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
        @keyframes fadeInScale{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
        @keyframes growBar{from{width:0}}
        @keyframes verifyPop{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
        @keyframes checkBounce{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes ringPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.15);opacity:0.1}}
      `}</style>
      <div style={{height:3,background:"linear-gradient(90deg,#4ade80,#38bdf8,#fb923c)",flexShrink:0}}/>
      {step==="splash"  && <SplashScreen  onNext={()=>setStep("slides")}/>}
      {step==="slides"  && <SlidesScreen  onNext={()=>setStep("store")}/>}
      {step==="store"   && <StoreSelectScreen onNext={s=>{setStore(s);setStep("account");}}/>}
      {step==="account" && <AccountScreen store={store} onComplete={u=>setStep({u,s:store})||onComplete(u,store)}/>}
      {step==="welcome" && <WelcomeScreen user={step?.u} store={store} onStart={()=>onComplete(step?.u,store)}/>}
    </div>
  );
}
