import { useState, useEffect, useRef } from "react";
import { S, SK, STORE_AISLES, STORE_LAYOUT, ROUTE_ORDER, AISLE_COLORS, QUICK_PROMPTS, sGet, sSet, fetchAISuggestions, lookupBarcode, generateQRPattern } from "../utils.js";

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function BottomNav({ screen, setScreen, itemCount }) {
  const tabs = [{id:"list",icon:"≡",label:"LIST"},{id:"navigate",icon:"◎",label:"NAVIGATE"},{id:"checkout",icon:"✦",label:"CHECKOUT"}];
  return (
    <div style={{display:"flex",background:S.surface,borderTop:`1px solid ${S.border}`,flexShrink:0}}>
      {tabs.map(tab => {
        const active = screen === tab.id;
        return (
          <button key={tab.id} onClick={() => setScreen(tab.id)} style={{flex:1,padding:"10px 0",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
            {tab.id==="list" && itemCount>0 && <div style={{position:"absolute",top:6,right:"calc(50% - 16px)",background:S.green,color:S.bg,borderRadius:10,fontSize:8,fontWeight:900,padding:"1px 5px",minWidth:14,textAlign:"center"}}>{itemCount}</div>}
            <span style={{fontSize:16,color:active?S.green:S.muted}}>{tab.icon}</span>
            <span style={{fontSize:8,letterSpacing:2,color:active?S.green:S.muted,fontFamily:"'DM Mono','Courier New',monospace"}}>{tab.label}</span>
            {active && <div style={{position:"absolute",bottom:0,left:"20%",right:"20%",height:2,background:S.green,borderRadius:2}}/>}
          </button>
        );
      })}
    </div>
  );
}

function SaveModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"#000a",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:14,padding:"22px",width:"100%",maxWidth:340}}>
        <div style={{fontSize:13,fontWeight:700,color:S.text,marginBottom:4}}>Save This List</div>
        <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&name.trim()&&onSave(name.trim())} placeholder="e.g. Taco Night, Weekly Shop…" autoFocus style={{width:"100%",background:S.surface,border:`1px solid ${S.border}`,borderRadius:8,padding:"9px 12px",color:S.text,fontSize:12,fontFamily:"'DM Mono','Courier New',monospace",outline:"none",boxSizing:"border-box",marginBottom:12}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"9px",background:"none",border:`1px solid ${S.border}`,borderRadius:8,color:S.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={()=>name.trim()&&onSave(name.trim())} disabled={!name.trim()} style={{flex:2,padding:"9px",background:name.trim()?"#0e2a1a":"#111",border:`1px solid ${name.trim()?"#2d5a2d":S.border}`,borderRadius:8,color:name.trim()?S.green:"#2d3748",fontSize:11,fontWeight:700,cursor:name.trim()?"pointer":"not-allowed",fontFamily:"inherit",letterSpacing:1}}>SAVE LIST</button>
        </div>
      </div>
    </div>
  );
}

function SavedPanel({ savedLists, history, onLoad, onDelete, onClose }) {
  const [tab, setTab] = useState("saved");
  const all = tab==="saved" ? savedLists : history;
  return (
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{background:S.surface,borderRadius:"16px 16px 0 0",border:`1px solid ${S.border}`,maxHeight:"75vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:14,fontWeight:700,color:S.text}}>Your Lists</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:S.muted,fontSize:18,cursor:"pointer"}}>×</button>
        </div>
        <div style={{display:"flex",padding:"10px 20px 0",borderBottom:`1px solid ${S.border}`}}>
          {["saved","history"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"7px 0",background:"none",border:"none",borderBottom:`2px solid ${tab===t?S.green:"transparent"}`,color:tab===t?S.green:S.muted,fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"inherit",fontWeight:700,marginBottom:-1,transition:"all 0.2s"}}>
              {t==="saved"?"💾 SAVED":"🕘 HISTORY"}
            </button>
          ))}
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"10px 20px 20px"}}>
          {all.length===0 ? (
            <div style={{textAlign:"center",padding:"30px 0",color:"#2d3748"}}><div style={{fontSize:24,marginBottom:8}}>{tab==="saved"?"💾":"🕘"}</div><div style={{fontSize:10,letterSpacing:2}}>{tab==="saved"?"NO SAVED LISTS":"NO HISTORY YET"}</div></div>
          ) : all.map((list,i) => (
            <div key={list.id||i} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:S.text,fontWeight:700}}>{list.name}</div>
                <div style={{fontSize:9,color:S.muted,marginTop:2,letterSpacing:1}}>{list.items?.length||0} ITEMS · {list.date}</div>
                <div style={{display:"flex",gap:4,marginTop:5}}>{(list.items||[]).slice(0,5).map((item,j)=><span key={j} style={{fontSize:14}}>{item.emoji}</span>)}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <button onClick={()=>onLoad(list)} style={{background:"#0e2a1a",border:"1px solid #2d5a2d",borderRadius:7,padding:"5px 12px",color:S.green,fontSize:9,cursor:"pointer",letterSpacing:1,fontFamily:"inherit",fontWeight:700}}>LOAD</button>
                {tab==="saved" && <button onClick={()=>onDelete(list.id)} style={{background:"none",border:"1px solid #3a1a1a",borderRadius:7,padding:"5px 12px",color:S.red,fontSize:9,cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>DEL</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── BARCODE SCANNER ───────────────────────────────────────────────────────────
function BarcodeScanner({ onScan, onClose }) {
  const videoRef=useRef(null),canvasRef=useRef(null),streamRef=useRef(null),readerRef=useRef(null),scanningRef=useRef(true);
  const [status,setStatus]=useState("starting");
  const [lastScan,setLastScan]=useState(null);
  const [scanLine,setScanLine]=useState(0);
  useEffect(()=>{let d=1,p=0;const iv=setInterval(()=>{p+=d*2;if(p>=100)d=-1;if(p<=0)d=1;setScanLine(p);},16);return()=>clearInterval(iv);},[]);
  useEffect(()=>{
    let mounted=true;
    const start=async()=>{
      try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});streamRef.current=stream;if(videoRef.current&&mounted){videoRef.current.srcObject=stream;await videoRef.current.play();setStatus("scanning");scan();}}
      catch{if(mounted)setStatus("error");}
    };
    const loadZXing=()=>new Promise((res,rej)=>{if(window.ZXing)return res();const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/zxing-js/0.20.0/zxing.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    const scan=async()=>{
      try{
        await loadZXing();
        const hints=new Map();hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS,[window.ZXing.BarcodeFormat.EAN_13,window.ZXing.BarcodeFormat.UPC_A,window.ZXing.BarcodeFormat.CODE_128,window.ZXing.BarcodeFormat.QR_CODE]);hints.set(window.ZXing.DecodeHintType.TRY_HARDER,true);
        const reader=new window.ZXing.MultiFormatReader();reader.setHints(hints);readerRef.current=reader;
        const loop=()=>{
          if(!scanningRef.current||!mounted)return;
          const v=videoRef.current,c=canvasRef.current;if(!v||!c||v.readyState<2){requestAnimationFrame(loop);return;}
          const ctx=c.getContext("2d");c.width=v.videoWidth;c.height=v.videoHeight;ctx.drawImage(v,0,0);
          try{const img=ctx.getImageData(0,0,c.width,c.height);const lum=new window.ZXing.RGBLuminanceSource(img.data,c.width,c.height);const bmp=new window.ZXing.BinaryBitmap(new window.ZXing.HybridBinarizer(lum));const result=reader.decode(bmp);if(result&&mounted){scanningRef.current=false;handleDetected(result.getText());return;}}catch{}
          requestAnimationFrame(loop);
        };requestAnimationFrame(loop);
      }catch{if(mounted)setStatus("error");}
    };
    start();
    return()=>{mounted=false;scanningRef.current=false;if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());};
  },[]);
  const handleDetected=async(code)=>{setLastScan(code);setStatus("found");try{const p=await lookupBarcode(code);onScan({...p,barcode:code});}catch{onScan({name:`Product ${code}`,aisle:"C2",category:"Snacks",qty:"1",emoji:"🛒",barcode:code});}};
  return (
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:300,display:"flex",flexDirection:"column",fontFamily:"'DM Mono','Courier New',monospace"}}>
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
        <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover"}} playsInline muted/>
        <canvas ref={canvasRef} style={{display:"none"}}/>
        <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
          <div style={{position:"absolute",inset:0,background:"#000a"}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-55%)",width:260,height:160,boxShadow:"0 0 0 9999px #000a",borderRadius:12}}>
            {[["tl","top:8,left:8","borderTop","borderLeft"],["tr","top:8,right:8","borderTop","borderRight"],["bl","bottom:8,left:8","borderBottom","borderLeft"],["br","bottom:8,right:8","borderBottom","borderRight"]].map(([k,pos,...b])=>(
              <div key={k} style={{position:"absolute",...Object.fromEntries(pos.split(",").map(p=>p.split(":").map(s=>s.trim()))),width:22,height:22,...Object.fromEntries(b.map(x=>[x,`3px solid ${S.green}`]))}}/>
            ))}
            {status==="scanning"&&<div style={{position:"absolute",left:4,right:4,top:`${scanLine}%`,height:2,background:`linear-gradient(90deg,transparent,${S.green},transparent)`,boxShadow:`0 0 8px ${S.green}`,transition:"top 0.016s linear"}}/>}
            {status==="found"&&<div style={{position:"absolute",inset:0,borderRadius:10,background:`${S.green}22`,border:`2px solid ${S.green}`}}/>}
          </div>
        </div>
        <div style={{position:"absolute",top:0,left:0,right:0,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(#000c,transparent)"}}>
          <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>Barcode Scanner</div>
          <button onClick={onClose} style={{width:36,height:36,borderRadius:"50%",background:"#ffffff18",border:"1px solid #ffffff22",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {status==="error"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:"0 40px",textAlign:"center"}}>
          <div style={{fontSize:36}}>📷</div>
          <div style={{fontSize:13,color:"#fff",fontWeight:700}}>Camera Not Available</div>
          <div style={{fontSize:11,color:S.muted,lineHeight:1.5}}>Please allow camera access in your browser settings, then reload.</div>
          <button onClick={onClose} style={{background:"#0e2a1a",border:`1px solid ${S.green}`,borderRadius:10,padding:"10px 24px",color:S.green,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:2,fontFamily:"inherit",marginTop:8}}>BACK TO LIST</button>
        </div>}
      </div>
      {status!=="error"&&<div style={{background:S.surface,borderTop:`1px solid ${S.border}`,padding:"16px 20px"}}>
        {lastScan?<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:9,letterSpacing:2,color:S.muted,marginBottom:3}}>LAST SCANNED</div><div style={{fontSize:11,color:S.blue,fontFamily:"monospace"}}>{lastScan}</div></div><button onClick={()=>{setStatus("scanning");setLastScan(null);scanningRef.current=true;}} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"8px 16px",color:"#94a3b8",fontSize:10,cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>SCAN AGAIN</button></div>:<div style={{textAlign:"center",color:S.muted,fontSize:11}}>Hold a barcode steady in the frame</div>}
      </div>}
    </div>
  );
}

function ScanResult({ product, onAdd, onDiscard, onScanAgain }) {
  const color = AISLE_COLORS[product.aisle]||S.blue;
  return (
    <div style={{position:"fixed",inset:0,background:"#000c",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center",fontFamily:"'DM Mono','Courier New',monospace"}}>
      <div style={{background:S.surface,borderRadius:"16px 16px 0 0",border:`1px solid ${S.border}`,width:"100%",maxWidth:480,padding:"22px 20px 28px",animation:"slideUp 0.3s ease"}}>
        <div style={{fontSize:9,letterSpacing:3,color:S.muted,marginBottom:12}}>PRODUCT FOUND</div>
        <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:18}}>
          <div style={{fontSize:44,lineHeight:1}}>{product.emoji}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:S.text,marginBottom:3}}>{product.name}</div>
            {product.brand&&<div style={{fontSize:11,color:S.muted,marginBottom:6}}>{product.brand}</div>}
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${color}18`,border:`1px solid ${color}44`,borderRadius:20,padding:"3px 10px"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:color}}/>
              <span style={{fontSize:9,color,letterSpacing:1}}>AISLE {product.aisle} — {product.category?.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onDiscard} style={{flex:1,padding:"11px",background:"none",border:`1px solid ${S.border}`,borderRadius:10,color:S.muted,fontSize:11,cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>DISCARD</button>
          <button onClick={onScanAgain} style={{flex:1,padding:"11px",background:S.card,border:`1px solid ${S.border}`,borderRadius:10,color:"#94a3b8",fontSize:11,cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>SCAN MORE</button>
          <button onClick={onAdd} style={{flex:2,padding:"11px",background:"#0e2a1a",border:"1px solid #2d5a2d",borderRadius:10,color:S.green,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>+ ADD TO LIST</button>
        </div>
      </div>
    </div>
  );
}

// ── QR CANVAS ─────────────────────────────────────────────────────────────────
function QRCanvas({ data, size=200 }) {
  const canvasRef = useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d"),grid=generateQRPattern(data),cells=grid.length,cell=size/cells;
    ctx.fillStyle="#ffffff";ctx.fillRect(0,0,size,size);ctx.fillStyle="#000000";
    grid.forEach((row,r)=>row.forEach((val,c)=>{if(val)ctx.fillRect(c*cell,r*cell,cell,cell);}));
  },[data,size]);
  return <canvas ref={canvasRef} width={size} height={size} style={{display:"block"}}/>;
}

// ── EXIT PASS ─────────────────────────────────────────────────────────────────
function ExitPassScreen({ receipt, onDone }) {
  const [verified,setVerified]=useState(false);
  const receiptCode=`CP-${receipt.date.replace(/\//g,"")}${Math.abs(receipt.total*100|0).toString().slice(-4)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const qrData=JSON.stringify({code:receiptCode,total:receipt.total,items:receipt.itemCount,ts:Date.now()});
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:verified?"linear-gradient(180deg,#030f06,#080a0d)":S.bg,transition:"background 0.8s"}}>
      <div style={{padding:"16px 20px 12px",background:S.surface,borderBottom:`1px solid ${S.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:S.green,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:S.bg}}>C</div>
          <div><div style={{fontSize:17,fontWeight:700,color:"#f1f5f9"}}>CartPath</div><div style={{fontSize:8,letterSpacing:3,color:S.muted}}>EXIT PASS</div></div>
          <div style={{marginLeft:"auto"}}>
            {verified?<div style={{display:"flex",alignItems:"center",gap:5,background:"#0e2a1a",border:"1px solid #2d5a2d",borderRadius:20,padding:"4px 10px"}}><div style={{width:6,height:6,borderRadius:"50%",background:S.green,boxShadow:`0 0 6px ${S.green}`}}/><span style={{fontSize:9,color:S.green,letterSpacing:2,fontWeight:700}}>VERIFIED</span></div>
            :<div style={{display:"flex",alignItems:"center",gap:5,background:"#1a130a",border:`1px solid ${S.orange}44`,borderRadius:20,padding:"4px 10px"}}><div style={{width:6,height:6,borderRadius:"50%",background:S.orange}}/><span style={{fontSize:9,color:S.orange,letterSpacing:2}}>AWAITING SCAN</span></div>}
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        {!verified?(
          <>
            <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:13,color:S.text,fontWeight:700,marginBottom:6}}>Show this to the exit attendant</div><div style={{fontSize:10,color:S.muted,lineHeight:1.6}}>A team member will scan your QR code<br/>to confirm payment before you leave</div></div>
            <div style={{background:"#fff",borderRadius:16,padding:20,marginBottom:20,boxShadow:`0 0 20px #4ade8033`}}>
              <div style={{position:"relative",overflow:"hidden",borderRadius:8}}><QRCanvas data={qrData} size={220}/></div>
              <div style={{marginTop:12,textAlign:"center"}}><div style={{fontSize:10,color:"#000",fontWeight:700,letterSpacing:1}}>CARTPATH</div><div style={{fontSize:9,color:"#666",fontFamily:"monospace",marginTop:2}}>{receiptCode}</div></div>
            </div>
            <div style={{width:"100%",maxWidth:320,background:S.card,border:`1px solid ${S.border}`,borderRadius:12,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div><div style={{fontSize:9,color:S.muted,letterSpacing:2,marginBottom:3}}>TOTAL PAID</div><div style={{fontSize:22,fontWeight:700,color:S.green}}>${receipt.total.toFixed(2)}</div>{receipt.saved>0&&<div style={{fontSize:9,color:S.orange,marginTop:2}}>Saved ${receipt.saved.toFixed(2)}</div>}</div>
              <div style={{textAlign:"right"}}><div style={{fontSize:9,color:S.muted,letterSpacing:2,marginBottom:3}}>ITEMS</div><div style={{fontSize:22,fontWeight:700,color:S.blue}}>{receipt.itemCount}</div><div style={{fontSize:9,color:S.muted,marginTop:2}}>{receipt.date}</div></div>
            </div>
            <div style={{width:"100%",maxWidth:320,background:"#0d1420",border:"1px solid #1e2d40",borderRadius:10,padding:"10px 14px",display:"flex",gap:10,marginBottom:20}}>
              <span style={{fontSize:16,flexShrink:0}}>🔒</span>
              <div style={{fontSize:10,color:S.muted,lineHeight:1.6}}>This QR code is <span style={{color:S.blue}}>single-use</span> and expires in <span style={{color:S.orange}}>15 minutes</span>.</div>
            </div>
            <button onClick={()=>setVerified(true)} style={{background:"none",border:`1px dashed ${S.border}`,borderRadius:8,padding:"8px 20px",color:"#2d3748",fontSize:9,cursor:"pointer",letterSpacing:2,fontFamily:"inherit"}}>[ DEMO: SIMULATE STAFF SCAN ]</button>
          </>
        ):(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,textAlign:"center"}}>
            <div style={{width:100,height:100,borderRadius:"50%",background:"linear-gradient(135deg,#0d2a0d,#0a1f0a)",border:`3px solid ${S.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,marginBottom:24,boxShadow:`0 0 40px ${S.green}44`}}>✓</div>
            <div style={{fontSize:22,fontWeight:700,color:S.green,letterSpacing:-0.5,marginBottom:8}}>You're good to go!</div>
            <div style={{fontSize:12,color:S.muted,marginBottom:32,lineHeight:1.6}}>Payment verified.<br/>Thank you for shopping with CartPath!</div>
            <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:14,padding:"18px 24px",width:"100%",maxWidth:300,marginBottom:24}}>
              {[["Items purchased",receipt.itemCount],["Date",receipt.date],["Receipt",receiptCode]].map(([label,val])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:11}}><span style={{color:S.muted}}>{label}</span><span style={{color:S.text,fontFamily:label==="Receipt"?"monospace":"inherit",fontSize:label==="Receipt"?9:11}}>{val}</span></div>
              ))}
              <div style={{height:1,background:S.border,margin:"10px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:700}}><span style={{color:S.text}}>Total paid</span><span style={{color:S.green}}>${receipt.total.toFixed(2)}</span></div>
            </div>
            <button onClick={onDone} style={{background:"#0e2a1a",border:`1px solid #2d5a2d`,borderRadius:10,padding:"12px 32px",color:S.green,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:2,fontFamily:"inherit"}}>START NEW TRIP →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LIST SCREEN ───────────────────────────────────────────────────────────────
function ListScreen({ items, setItems, setScreen, savedLists, setSavedLists, history, setHistory, storeName }) {
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [loadMsg,setLoadMsg]=useState("");
  const [suggested,setSugg]=useState([]);
  const [error,setError]=useState(null);
  const [showSave,setShowSave]=useState(false);
  const [showPanel,setPanel]=useState(false);
  const [saveOk,setSaveOk]=useState(false);
  const [scanning,setScanning]=useState(false);
  const [scanResult,setScanResult]=useState(null);
  const msgs=["Scanning aisles…","Thinking…","Building your list…","Almost there…"];

  const handleSubmit=async(prompt)=>{const q=prompt||input.trim();if(!q)return;setInput("");setLoading(true);setError(null);setSugg([]);let i=0;setLoadMsg(msgs[0]);const iv=setInterval(()=>{i=(i+1)%msgs.length;setLoadMsg(msgs[i]);},1100);try{setSugg(await fetchAISuggestions(q,items));}catch{setError("AI unavailable — try again.");}finally{clearInterval(iv);setLoading(false);}};
  const addItem=(item)=>{const ni={...item,id:Date.now()+Math.random(),checked:false};setItems(p=>{const u=[...p,ni];sSet(SK.current,u);return u;});setSugg(p=>p.filter(s=>s.name!==item.name));};
  const addAll=()=>{suggested.forEach(s=>addItem(s));setSugg([]);};
  const remove=(id)=>setItems(p=>{const u=p.filter(i=>i.id!==id);sSet(SK.current,u);return u;});
  const toggle=(id)=>setItems(p=>{const u=p.map(i=>i.id===id?{...i,checked:!i.checked}:i);sSet(SK.current,u);return u;});
  const clearList=()=>{setItems([]);setSugg([]);sSet(SK.current,[]);};
  const handleSave=(name)=>{const e={id:Date.now(),name,date:new Date().toLocaleDateString(),items:items.map(i=>({...i,checked:false}))};const u=[e,...savedLists];setSavedLists(u);sSet(SK.lists,u);setShowSave(false);setSaveOk(true);setTimeout(()=>setSaveOk(false),2000);};
  const handleDelete=(id)=>{const u=savedLists.filter(l=>l.id!==id);setSavedLists(u);sSet(SK.lists,u);};
  const handleLoad=(list)=>{const loaded=list.items.map(i=>({...i,id:Date.now()+Math.random(),checked:false}));setItems(loaded);sSet(SK.current,loaded);setPanel(false);};

  const grouped=ROUTE_ORDER.reduce((acc,aisle)=>{const ai=items.filter(i=>i.aisle===aisle);if(ai.length)acc[aisle]=ai;return acc;},{});
  const checked=items.filter(i=>i.checked).length;

  return (
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
      {showSave&&<SaveModal onSave={handleSave} onClose={()=>setShowSave(false)}/>}
      {showPanel&&<SavedPanel savedLists={savedLists} history={history} onLoad={handleLoad} onDelete={handleDelete} onClose={()=>setPanel(false)}/>}
      {scanning&&<BarcodeScanner onScan={p=>{setScanning(false);setScanResult(p);}} onClose={()=>setScanning(false)}/>}
      {scanResult&&<ScanResult product={scanResult} onAdd={()=>{addItem(scanResult);setScanResult(null);}} onDiscard={()=>setScanResult(null)} onScanAgain={()=>{setScanResult(null);setScanning(true);}}/>}

      <div style={{padding:"16px 20px 12px",background:S.surface,borderBottom:`1px solid ${S.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:30,height:30,borderRadius:8,background:S.green,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:S.bg}}>C</div>
          <div><div style={{fontSize:17,fontWeight:700,color:"#f1f5f9",letterSpacing:-0.5}}>CartPath</div><div style={{fontSize:8,letterSpacing:3,color:S.muted}}>{storeName?.toUpperCase()}</div></div>
          <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
            {saveOk&&<span style={{fontSize:9,color:S.green,letterSpacing:1}}>✓ SAVED</span>}
            <button onClick={()=>setPanel(true)} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"5px 10px",color:"#94a3b8",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>📋</button>
            {items.length>0&&<button onClick={()=>setShowSave(true)} style={{background:"#0e2a1a",border:"1px solid #2d5a2d",borderRadius:8,padding:"5px 10px",color:S.green,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>💾</button>}
          </div>
        </div>
        <div style={{background:S.card,border:"1px solid #1e2d40",borderRadius:12,padding:"9px 12px",display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <span style={{color:S.blue,fontSize:14}}>✦</span>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="What are you making? Or add items…" style={{flex:1,background:"none",border:"none",outline:"none",color:S.text,fontSize:12,fontFamily:"'DM Mono','Courier New',monospace"}}/>
          <button onClick={()=>setScanning(true)} style={{background:"#0e1a2a",border:"1px solid #1e3a5a",borderRadius:7,padding:"5px 10px",color:S.blue,fontSize:14,cursor:"pointer"}}>⊡</button>
          <button onClick={()=>handleSubmit()} disabled={loading||!input.trim()} style={{background:input.trim()&&!loading?S.green:"#1a2a1a",border:"none",borderRadius:7,padding:"5px 12px",color:input.trim()&&!loading?S.bg:"#2d4a2d",fontSize:10,fontWeight:700,letterSpacing:1,cursor:"pointer",fontFamily:"inherit"}}>{loading?"…":"GO"}</button>
        </div>
        <button onClick={()=>setScanning(true)} style={{width:"100%",padding:"7px",background:"#0a1520",border:"1px solid #1e3a5a",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",marginBottom:8}}>
          <span style={{fontSize:14}}>⊡</span><span style={{fontSize:10,color:S.blue,letterSpacing:2,fontFamily:"inherit",fontWeight:700}}>SCAN BARCODE TO ADD ITEM</span>
        </button>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {QUICK_PROMPTS.map(qp=><button key={qp.label} onClick={()=>handleSubmit(qp.prompt)} disabled={loading} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:20,padding:"3px 9px",color:"#94a3b8",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{qp.label}</button>)}
        </div>
      </div>

      <div style={{padding:"14px 20px",flex:1}}>
        {loading&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px",background:"#0d1420",border:"1px solid #1e2d40",borderRadius:10,marginBottom:12}}><div style={{width:15,height:15,borderRadius:"50%",border:`2px solid ${S.blue}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/><span style={{fontSize:11,color:S.muted}}>{loadMsg}</span></div>}
        {error&&<div style={{padding:"10px",background:"#1a0a0a",border:"1px solid #3a1a1a",borderRadius:8,color:S.red,fontSize:11,marginBottom:12}}>{error}</div>}
        {suggested.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
              <span style={{fontSize:8,letterSpacing:3,color:S.blue}}>✦ AI SUGGESTIONS</span>
              <button onClick={addAll} style={{background:"#0e2a1a",border:"1px solid #2d5a2d",borderRadius:6,padding:"3px 10px",color:S.green,fontSize:9,cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>ADD ALL</button>
            </div>
            {suggested.map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",marginBottom:5,background:"#0d1420",border:`1px solid ${AISLE_COLORS[item.aisle]||S.border}33`,borderRadius:9,animation:`fi 0.3s ease ${i*0.04}s both`}}>
                <span style={{fontSize:18}}>{item.emoji}</span>
                <div style={{flex:1}}><div style={{fontSize:12,color:S.text}}>{item.name}</div><div style={{fontSize:9,color:AISLE_COLORS[item.aisle]||S.muted,letterSpacing:1}}>{item.aisle} · {item.category} · {item.qty}</div></div>
                <button onClick={()=>addItem(item)} style={{width:26,height:26,borderRadius:6,background:S.card,border:`1px solid ${S.border}`,color:S.green,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
            ))}
          </div>
        )}
        {items.length===0&&!loading&&suggested.length===0&&(
          <div style={{textAlign:"center",padding:"36px 20px",color:S.muted}}><div style={{fontSize:32,marginBottom:10}}>🛒</div><div style={{fontSize:10,letterSpacing:2,color:"#2d3748"}}>YOUR LIST IS EMPTY</div><div style={{fontSize:10,marginTop:5,color:"#1e2530"}}>Ask AI, scan a barcode, or load a saved list</div></div>
        )}
        {Object.entries(grouped).map(([aisle,aisleItems])=>{
          const color=AISLE_COLORS[aisle]||S.muted;
          return (<div key={aisle} style={{marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><div style={{width:5,height:5,borderRadius:"50%",background:color}}/><span style={{fontSize:8,letterSpacing:3,color}}>{STORE_AISLES[aisle]?.toUpperCase()} — AISLE {aisle}</span><span style={{fontSize:8,color:"#2d3748",marginLeft:"auto"}}>{aisleItems.filter(i=>i.checked).length}/{aisleItems.length}</span></div>
            {aisleItems.map(item=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",marginBottom:4,background:item.checked?"#0a0d0a":S.surface,border:`1px solid ${item.checked?"#1a2a1a":S.border}`,borderRadius:9,opacity:item.checked?0.45:1,transition:"all 0.2s"}}>
                <button onClick={()=>toggle(item.id)} style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${item.checked?S.green:"#2d3748"}`,background:item.checked?S.green:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:S.bg,flexShrink:0}}>{item.checked?"✓":""}</button>
                <span style={{fontSize:17}}>{item.emoji}</span>
                <div style={{flex:1}}><div style={{fontSize:12,color:item.checked?"#4a5568":S.text,textDecoration:item.checked?"line-through":"none"}}>{item.name}</div><div style={{fontSize:9,color:S.muted}}>{item.qty}{item.barcode?" · 📷":""}</div></div>
                <button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:S.muted,fontSize:15,cursor:"pointer",padding:"1px 3px"}}>×</button>
              </div>
            ))}
          </div>);
        })}
        {items.length>0&&<button onClick={clearList} style={{width:"100%",padding:"8px",background:"none",border:"1px solid #2d1a1a",borderRadius:8,color:"#4a2a2a",fontSize:9,cursor:"pointer",letterSpacing:2,fontFamily:"inherit",marginTop:4}}>CLEAR LIST</button>}
      </div>

      {items.length>0&&(
        <div style={{padding:"12px 20px",background:S.surface,borderTop:`1px solid ${S.border}`,display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
          <div style={{flex:1}}><div style={{height:3,background:"#1a2030",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(checked/items.length)*100}%`,background:`linear-gradient(90deg,${S.blue},${S.green})`,borderRadius:3,transition:"width 0.4s"}}/></div><div style={{fontSize:8,color:S.muted,marginTop:3,letterSpacing:1}}>{checked} OF {items.length} COLLECTED</div></div>
          <button onClick={()=>setScreen("navigate")} style={{background:"#0e2a1a",border:"1px solid #2d5a2d",borderRadius:9,padding:"9px 18px",color:S.green,fontSize:10,fontWeight:700,cursor:"pointer",letterSpacing:2,fontFamily:"inherit"}}>NAVIGATE →</button>
        </div>
      )}
    </div>
  );
}

// ── NAVIGATE SCREEN ───────────────────────────────────────────────────────────
function NavigateScreen({ items, setItems, setScreen, setHistory, storeName }) {
  const [step,setStep]=useState(0);
  const [animRoute,setAnim]=useState([]);
  const remaining=ROUTE_ORDER.filter(a=>items.some(i=>i.aisle===a&&!i.checked));
  useEffect(()=>{setAnim([]);remaining.forEach((a,i)=>setTimeout(()=>setAnim(p=>[...p,a]),i*100));},[items.map(i=>i.checked).join("")]);
  useEffect(()=>{if(step>=remaining.length&&remaining.length>0)setStep(Math.max(0,remaining.length-1));},[remaining.length]);
  const currentAisle=remaining[step]||null;
  const currentItems=items.filter(i=>i.aisle===currentAisle&&!i.checked);
  const toggle=(id)=>setItems(p=>{const u=p.map(i=>i.id===id?{...i,checked:!i.checked}:i);sSet(SK.current,u);return u;});
  const allDone=items.length>0&&items.every(i=>i.checked);
  useEffect(()=>{if(allDone&&items.length>0){setHistory(prev=>{const e={id:Date.now(),name:`Shop — ${new Date().toLocaleDateString()}`,date:new Date().toLocaleDateString(),items};const u=[e,...prev].slice(0,20);sSet(SK.history,u);return u;});}}, [allDone]);
  const CELL=50,GAP=5;
  return (
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"14px 20px 10px",background:S.surface,borderBottom:`1px solid ${S.border}`,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:8,letterSpacing:3,color:S.muted}}>IN-STORE MODE</div><div style={{fontSize:16,fontWeight:700,color:"#f1f5f9"}}>{storeName}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:700,color:S.blue}}>{Math.round((items.filter(i=>i.checked).length/Math.max(items.length,1))*100)}%</div><div style={{fontSize:8,color:S.muted,letterSpacing:1}}>DONE</div></div>
        </div>
        <div style={{height:3,background:"#1a2030",borderRadius:3,overflow:"hidden",marginTop:8}}><div style={{height:"100%",width:`${(items.filter(i=>i.checked).length/Math.max(items.length,1))*100}%`,background:`linear-gradient(90deg,${S.blue},${S.green})`,borderRadius:3,transition:"width 0.5s"}}/></div>
      </div>
      <div style={{padding:"12px 20px",borderBottom:`1px solid ${S.border}`}}>
        <div style={{fontSize:8,letterSpacing:3,color:S.muted,marginBottom:8}}>STORE MAP</div>
        <div style={{position:"relative",width:(CELL*6)+(GAP*5),height:(CELL*10)+(GAP*9),margin:"0 auto"}}>
          {STORE_LAYOUT.map(sec=>{
            const isActive=sec.id===currentAisle,inRoute=animRoute.includes(sec.id);
            const done=sec.type!=="special"&&items.filter(i=>i.aisle===sec.id).length>0&&items.filter(i=>i.aisle===sec.id).every(i=>i.checked);
            const color=AISLE_COLORS[sec.id],special=sec.type==="special";
            return(<div key={sec.id} style={{position:"absolute",left:sec.x*(CELL+GAP),top:sec.y*(CELL+GAP),width:sec.w*CELL+(sec.w-1)*GAP,height:sec.h*CELL+(sec.h-1)*GAP,background:special?"#111827":isActive?`${color}22`:done?"#0d1f0d":inRoute?"#111827":"#111520",border:special?"1px solid #1e2530":isActive?`2px solid ${color}`:done?"1px solid #1a3a1a":inRoute?`1px solid ${color}55`:"1px solid #1a1f2e",borderRadius:7,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"all 0.25s",boxShadow:isActive?`0 0 14px ${color}33`:"none"}}>
              {done&&<div style={{fontSize:11,color:"#2d6a2d"}}>✓</div>}
              <div style={{fontSize:7,fontWeight:700,textAlign:"center",whiteSpace:"pre",lineHeight:1.4,color:special?"#4a5568":isActive?color:done?"#2d6a2d":inRoute?`${color}cc`:"#2d3748"}}>{sec.label}</div>
              {inRoute&&!done&&!isActive&&<div style={{width:4,height:4,borderRadius:"50%",background:color,marginTop:2,opacity:0.8}}/>}
            </div>);
          })}
        </div>
      </div>
      {allDone?(
        <div style={{margin:"16px 20px",background:"linear-gradient(135deg,#0d2a0d,#0a1f0a)",border:"1px solid #2d5a2d",borderRadius:12,padding:"20px",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>🎉</div><div style={{fontSize:14,fontWeight:700,color:S.green,letterSpacing:1}}>ALL ITEMS COLLECTED</div>
          <div style={{fontSize:10,color:S.muted,marginTop:4,marginBottom:14,letterSpacing:2}}>TRIP SAVED TO HISTORY</div>
          <button onClick={()=>setScreen("checkout")} style={{background:"#0e2a1a",border:`1px solid ${S.green}`,borderRadius:10,padding:"10px 24px",color:S.green,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:2,fontFamily:"inherit"}}>GO TO CHECKOUT →</button>
        </div>
      ):currentAisle?(
        <div style={{margin:"14px 20px",background:"#0d1420",border:`1px solid ${AISLE_COLORS[currentAisle]}44`,borderRadius:12,overflow:"hidden"}}>
          <div style={{background:`${AISLE_COLORS[currentAisle]}18`,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${AISLE_COLORS[currentAisle]}22`}}>
            <div><div style={{fontSize:8,letterSpacing:3,color:S.muted}}>CURRENT STOP</div><div style={{fontSize:15,fontWeight:700,color:AISLE_COLORS[currentAisle]}}>Aisle {currentAisle} — {STORE_AISLES[currentAisle]}</div></div>
            <div style={{fontSize:9,color:S.muted,background:S.card,padding:"3px 7px",borderRadius:5,letterSpacing:1}}>{step+1} / {remaining.length}</div>
          </div>
          {currentItems.map(item=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:`1px solid ${S.border}`}}>
              <span style={{fontSize:18}}>{item.emoji}</span>
              <div style={{flex:1}}><span style={{fontSize:13,color:S.text}}>{item.name}</span>{item.barcode&&<div style={{fontSize:9,color:S.muted}}>📷 Scanned</div>}</div>
              <button onClick={()=>toggle(item.id)} style={{background:"#1a2a1a",border:"1px solid #2d4a2d",borderRadius:6,color:S.green,fontSize:10,padding:"4px 10px",cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>GRAB</button>
            </div>
          ))}
          <div style={{display:"flex",gap:7,padding:10}}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{flex:1,padding:"8px",background:S.card,border:`1px solid ${S.border}`,borderRadius:7,color:step===0?"#2d3748":"#94a3b8",cursor:step===0?"not-allowed":"pointer",fontSize:10,letterSpacing:1,fontFamily:"inherit"}}>← PREV</button>
            <button onClick={()=>setStep(s=>Math.min(remaining.length-1,s+1))} disabled={step>=remaining.length-1} style={{flex:2,padding:"8px",background:step>=remaining.length-1?"#111":"#0e2a1a",border:`1px solid ${step>=remaining.length-1?S.border:"#2d5a2d"}`,borderRadius:7,color:step>=remaining.length-1?"#2d3748":S.green,cursor:step>=remaining.length-1?"not-allowed":"pointer",fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"inherit"}}>NEXT STOP →</button>
          </div>
        </div>
      ):items.length===0?(
        <div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:30,marginBottom:8}}>🗺️</div><button onClick={()=>setScreen("list")} style={{marginTop:12,background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"8px 16px",color:"#94a3b8",fontSize:10,cursor:"pointer",fontFamily:"inherit",letterSpacing:1}}>← BUILD YOUR LIST</button></div>
      ):null}
    </div>
  );
}

// ── CHECKOUT SCREEN ───────────────────────────────────────────────────────────
function CheckoutScreen({ items, onPaymentComplete }) {
  const [scanned,setScanned]=useState({});
  const [coupon,setCoupon]=useState(false);
  const subtotal=items.reduce((sum,item)=>sum+(item.name.length%5)+2.49+(item.name.charCodeAt(0)%10)*0.1,0);
  const discount=coupon?subtotal*0.08:0;
  const tax=(subtotal-discount)*0.0875;
  const total=subtotal-discount+tax;
  const allScanned=items.length>0&&items.every(i=>scanned[i.id]);
  const handlePay=()=>{if(!allScanned)return;onPaymentComplete({total,saved:discount,itemCount:items.length,date:new Date().toLocaleDateString()});};
  return (
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"14px 20px 10px",background:S.surface,borderBottom:`1px solid ${S.border}`,flexShrink:0}}><div style={{fontSize:8,letterSpacing:3,color:S.muted,marginBottom:2}}>CHECKOUT</div><div style={{fontSize:16,fontWeight:700,color:"#f1f5f9"}}>Review & Pay</div></div>
      <div style={{padding:"14px 20px",flex:1}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:8,letterSpacing:3,color:S.muted}}>SCANNED ITEMS</span>
          {!allScanned&&<button onClick={()=>{const s={};items.forEach(i=>s[i.id]=true);setScanned(s);}} style={{background:"#0e1a2a",border:"1px solid #1e3a5a",borderRadius:6,padding:"3px 10px",color:S.blue,fontSize:9,cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>SCAN ALL</button>}
        </div>
        {items.length===0?<div style={{textAlign:"center",padding:"30px",color:"#2d3748"}}><div style={{fontSize:28,marginBottom:8}}>🧾</div><div style={{fontSize:10,letterSpacing:2}}>NO ITEMS</div></div>:items.map(item=>{
          const price=(item.name.length%5)+2.49+(item.name.charCodeAt(0)%10)*0.1,done=scanned[item.id];
          return(<div key={item.id} onClick={()=>setScanned(p=>({...p,[item.id]:!p[item.id]}))} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",marginBottom:4,background:done?"#0a130a":S.surface,border:`1px solid ${done?"#1a3a1a":S.border}`,borderRadius:9,cursor:"pointer",transition:"all 0.2s",opacity:done?0.7:1}}>
            <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,border:`2px solid ${done?S.green:"#2d3748"}`,background:done?S.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:S.bg}}>{done?"✓":""}</div>
            <span style={{fontSize:17}}>{item.emoji}</span>
            <div style={{flex:1}}><div style={{fontSize:12,color:done?"#4a5568":S.text,textDecoration:done?"line-through":"none"}}>{item.name}</div><div style={{fontSize:9,color:S.muted}}>{item.qty}{item.barcode?" · 📷":""}</div></div>
            <div style={{fontSize:12,color:done?S.green:S.muted,fontWeight:700}}>${price.toFixed(2)}</div>
          </div>);
        })}
        {items.length>0&&(<>
          <div style={{marginTop:12,padding:"12px 14px",background:coupon?"#0d1f0a":"#0e1420",border:`1px solid ${coupon?"#2d5a2d":"#1e2d40"}`,borderRadius:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:11,color:coupon?S.green:S.blue,fontWeight:700}}>{coupon?"✓ CartPath Deal Applied!":"🏷️ CartPath Deal Available"}</div><div style={{fontSize:9,color:S.muted,marginTop:2}}>{coupon?`Saving $${discount.toFixed(2)}`:"8% off your total order today"}</div></div>
              {!coupon&&<button onClick={()=>setCoupon(true)} style={{background:"#0e2a1a",border:"1px solid #2d5a2d",borderRadius:7,padding:"6px 12px",color:S.green,fontSize:10,cursor:"pointer",letterSpacing:1,fontFamily:"inherit",fontWeight:700}}>APPLY</button>}
            </div>
          </div>
          <div style={{marginTop:12,padding:"14px",background:S.card,border:`1px solid ${S.border}`,borderRadius:10}}>
            <div style={{fontSize:8,letterSpacing:3,color:S.muted,marginBottom:10}}>ORDER SUMMARY</div>
            {[["Subtotal",`$${subtotal.toFixed(2)}`,S.text],...(coupon?[["Deal (8%)",`-$${discount.toFixed(2)}`,S.green]]:[]),["Tax",`$${tax.toFixed(2)}`,S.muted]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:11}}><span style={{color:S.muted}}>{l}</span><span style={{color:c}}>{v}</span></div>
            ))}
            <div style={{height:1,background:S.border,margin:"8px 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700}}><span style={{color:S.text}}>Total</span><span style={{color:S.green}}>${total.toFixed(2)}</span></div>
          </div>
        </>)}
      </div>
      {items.length>0&&(
        <div style={{padding:"12px 20px",background:S.surface,borderTop:`1px solid ${S.border}`,flexShrink:0}}>
          {!allScanned&&<div style={{fontSize:10,color:S.orange,textAlign:"center",marginBottom:8,letterSpacing:1}}>⚠ Scan all items before paying</div>}
          <div style={{display:"flex",gap:8}}>
            {[["🍎 Apple Pay","#000","#333","#fff"],["G Pay","#1a3a1a",S.green,S.green]].map(([label,bg,border,color])=>(
              <button key={label} onClick={handlePay} style={{flex:1,padding:"12px",background:allScanned?bg:"#111",border:`1px solid ${allScanned?border:S.border}`,borderRadius:10,color:allScanned?color:"#2d3748",fontSize:12,fontWeight:700,cursor:allScanned?"pointer":"not-allowed",letterSpacing:1,fontFamily:"inherit"}}>{label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ROOT ─────────────────────────────────────────────────────────────
export default function MainApp({ user, store }) {
  const [screen,setScreen]         = useState("list");
  const [items,setItems]           = useState([]);
  const [savedLists,setSavedLists] = useState([]);
  const [history,setHistory]       = useState([]);
  const [loaded,setLoaded]         = useState(false);
  const [receipt,setReceipt]       = useState(null);

  useEffect(()=>{
    (async()=>{
      const [cur,lists,hist]=await Promise.all([sGet(SK.current),sGet(SK.lists),sGet(SK.history)]);
      if(cur)setItems(cur);if(lists)setSavedLists(lists);if(hist)setHistory(hist);setLoaded(true);
    })();
  },[]);

  const handleNewTrip=()=>{setItems([]);sSet(SK.current,[]);setReceipt(null);setScreen("list");};

  if(!loaded) return(
    <div style={{height:"100vh",background:S.bg,display:"flex",alignItems:"center",justifyContent:"center",color:S.muted,fontFamily:"'DM Mono','Courier New',monospace"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:28,marginBottom:12}}>🛒</div><div style={{fontSize:10,letterSpacing:3}}>LOADING…</div></div>
    </div>
  );

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:S.bg,fontFamily:"'DM Mono','Courier New',monospace",color:S.text,maxWidth:480,margin:"0 auto",overflow:"hidden"}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
      `}</style>
      <div style={{height:3,background:`linear-gradient(90deg,${S.green},${S.blue},${S.orange})`,flexShrink:0}}/>
      {receipt?(
        <ExitPassScreen receipt={receipt} onDone={handleNewTrip}/>
      ):(
        <>
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            {screen==="list"     && <ListScreen     items={items} setItems={setItems} setScreen={setScreen} savedLists={savedLists} setSavedLists={setSavedLists} history={history} setHistory={setHistory} storeName={store?.name}/>}
            {screen==="navigate" && <NavigateScreen items={items} setItems={setItems} setScreen={setScreen} setHistory={setHistory} storeName={store?.name}/>}
            {screen==="checkout" && <CheckoutScreen items={items} onPaymentComplete={setReceipt}/>}
          </div>
          <BottomNav screen={screen} setScreen={setScreen} itemCount={items.length}/>
        </>
      )}
    </div>
  );
}
