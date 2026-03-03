import { useState, useRef, useEffect } from "react";

// ── localStorage helpers (works on Replit) ──
const cGet = k => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch { return null; } };
const cSet = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };

// ── Triangle Logo ──
function Tri({ size=20, spin=false }) {
  const c=size/2, r=size*0.38;
  const pts=[0,1,2].map(i=>{const a=(i*120-90)*Math.PI/180;return `${c+r*Math.cos(a)},${c+r*Math.sin(a)}`;}).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{display:"block",overflow:"visible",flexShrink:0,
        animation:spin?"spinTri 1.2s linear infinite":"floatTri 4s ease-in-out infinite"}}>
      <polygon points={pts} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Data ──
const SUBJ = {
  math:  { n:"Mathematics",      s:"Math",    t:["Number System","Percentage","Ratio & Proportion","Simple Interest","Compound Interest","Profit & Loss","Time & Work","Speed Time Distance","Geometry","Trigonometry","Algebra","Statistics"] },
  eng:   { n:"English",          s:"English", t:["Reading Comprehension","Fill in Blanks","Error Spotting","Synonyms","Antonyms","Idioms & Phrases","One Word Sub.","Active/Passive","Sentence Improvement","Cloze Test"] },
  gk:    { n:"General Knowledge",s:"GK",      t:["Indian History","Geography","Polity","Economics","Physics","Chemistry","Biology","Current Affairs","Sports","Books & Authors","Dates","Art & Culture"] },
  logic: { n:"Reasoning",        s:"Logic",   t:["Analogy","Series","Blood Relations","Direction","Seating Arrangement","Coding-Decoding","Syllogism","Matrix","Venn Diagrams","Statement & Conclusion"] },
};

const QDB = {
  math:[
    {q:"20% discount ke baad ₹800 mila. Marked price kya tha?",o:["₹900","₹960","₹1000","₹1050"],a:2,exp:"MP × 0.8 = 800 → MP = ₹1000",c:"SP = MP(1 − D/100)",t:"Profit & Loss",d:"easy"},
    {q:"A 12 din mein, B 15 din mein kaam karta hai. Milkar?",o:["6.5 din","6.67 din","7 din","5 din"],a:1,exp:"ab/(a+b) = 180/27 ≈ 6.67",c:"Together = ab/(a+b)",t:"Time & Work",d:"medium"},
    {q:"15% of 240 + 25% of 160 = ?",o:["72","76","78","80"],a:1,exp:"36 + 40 = 76",c:"X% of Y = XY/100",t:"Percentage",d:"easy"},
    {q:"₹5000, 2 saal, 10% p.a. Compound Interest?",o:["₹1000","₹1050","₹1100","₹1500"],a:1,exp:"5000[(1.1)²−1] = ₹1050",c:"CI = P[(1+R/100)ᵀ−1]",t:"Compound Interest",d:"medium"},
    {q:"x²−5x+6=0 ke roots?",o:["2, 3","1, 6","2, 4","3, 4"],a:0,exp:"(x−2)(x−3)=0",c:"Factor: product=c, sum=−b",t:"Algebra",d:"easy"},
    {q:"Train 72km/h se 200m bridge cross kare. Train 100m. Time?",o:["10 sec","15 sec","20 sec","25 sec"],a:1,exp:"Total=300m, Speed=20m/s, T=15s",c:"Total dist = Bridge + Train",t:"Speed Time Distance",d:"medium"},
  ],
  eng:[
    {q:"'Ameliorate' ka matlab?",o:["Worsen","Improve","Ignore","Delay"],a:1,exp:"Latin melior = better",c:"Root: Melior = better",t:"Synonyms",d:"medium"},
    {q:"Error: 'Each of the boys have completed their work.'",o:["Each of","the boys","have completed","their work"],a:2,exp:"Each = singular → 'has completed'",c:"Each/Every → singular verb",t:"Error Spotting",d:"medium"},
    {q:"'Bite the bullet' ka matlab?",o:["Kuch khaana","Endure bravely","Dar jaana","Nahi maanna"],a:1,exp:"Endure painful situation with courage",c:"Bullet=dard, accept karo!",t:"Idioms",d:"easy"},
    {q:"Passive: 'They are building a new bridge.'",o:["was being built","is being built","has been built","will be built"],a:1,exp:"Pres. Cont. Passive = is/are being + V3",c:"is being + V3",t:"Active/Passive",d:"medium"},
    {q:"Antonym of 'Verbose':",o:["Talkative","Concise","Loud","Boring"],a:1,exp:"Verbose=many words. Concise=brief.",c:"CAVE: Concise Antonym Verbose Easy",t:"Antonyms",d:"easy"},
    {q:"Fill: 'He is addicted ___ smoking.'",o:["of","to","for","with"],a:1,exp:"Addicted to = correct preposition",c:"Addicted TO always!",t:"Fill in Blanks",d:"easy"},
  ],
  gk:[
    {q:"Bharat ka pehla Governor General?",o:["Lord Mountbatten","Lord Canning","Warren Hastings","Cornwallis"],a:2,exp:"Warren Hastings 1773-1785",c:"W pehla → Warren Hastings pehla GG!",t:"History",d:"easy"},
    {q:"Rajya Sabha minimum age?",o:["21","25","30","35"],a:2,exp:"RS = 30 saal",c:"RS=30, LS=25, President=35",t:"Polity",d:"easy"},
    {q:"'Discovery of India' kisne likhi?",o:["Gandhi","Nehru","Tagore","Ambedkar"],a:1,exp:"Nehru, 1944, Ahmednagar jail",c:"Nehru: Discovery of India",t:"Books",d:"easy"},
    {q:"India ki sabse badi freshwater lake?",o:["Dal Lake","Chilika","Wular Lake","Loktak"],a:2,exp:"Wular Lake, J&K",c:"Freshwater=Wular, Brackish=Chilika",t:"Geography",d:"medium"},
    {q:"Vitamin C ki kami se?",o:["Rickets","Scurvy","Night blindness","Beriberi"],a:1,exp:"Vitamin C → Scurvy",c:"A=Night blind, C=Scurvy, D=Rickets",t:"Science",d:"easy"},
    {q:"Fundamental Rights kaunse Articles mein?",o:["Art 12-35","Art 36-51","Art 1-11","Art 52-65"],a:0,exp:"Art 12-35 = Fundamental Rights",c:"FR=12-35, DPSP=36-51",t:"Polity",d:"medium"},
  ],
  logic:[
    {q:"2, 6, 12, 20, 30, __?",o:["40","42","44","45"],a:1,exp:"+4,+6,+8,+10,+12 → 42",c:"Difference series: gap +2",t:"Series",d:"easy"},
    {q:"Ramesh ki maa ke bhai ki beti ka rishta?",o:["Mausi","Cousin","Behen","Nani"],a:1,exp:"Mama ki beti = Cousin",c:"Family tree draw karo!",t:"Blood Relations",d:"medium"},
    {q:"N 5km → E 3km → S 5km. Start se kitna?",o:["3km East","3km West","0km","8km"],a:0,exp:"N+S cancel → 3km East",c:"Opposite directions cancel!",t:"Direction",d:"medium"},
    {q:"1, 4, 9, 16, 25, __?",o:["30","36","49","35"],a:1,exp:"n²: 6²=36",c:"Perfect squares",t:"Series",d:"easy"},
    {q:"ROSE=6821, CHAIR=73456. REACH=?",o:["68473","68374","64873","86473"],a:0,exp:"R=6,E=8,A=4,C=7,H=3 → 68473",c:"Table banao: har letter ka code",t:"Coding",d:"hard"},
  ],
};

// ── Guru Offline Responses ──
const GR = {
  percent:`**PERCENTAGE — Shortcuts 🎯**

Sabse important rule:
→ X% of Y = Y% of X (swap trick!)
Example: 18% of 50 = 50% of 18 = **9** ✅

**Fractions yaad karo:**
• 10%=1/10 · 20%=1/5 · 25%=1/4 · 33%=1/3

**Successive change:**
A% phir B% = A+B+AB/100
Example: 20% up phir 20% down = **-4% loss**

Roz 5 questions → 2 weeks mein master! 💪`,

  profit:`**PROFIT & LOSS 📊**

→ Profit% = (Profit/CP) × 100
→ SP = CP × (100+P%)/100

**Same SP trick (SSC favorite!):**
Ek pe P% profit, ek pe P% loss → HAMESHA loss
Loss% = **(P/10)²**
Example: 20%+20% → Loss = 4%

**Fake weight:**
900g ko 1kg bolta hai → Profit = 11.11%

Yeh dono tricks SSC mein guaranteed aate hain! 🔥`,

  work:`**TIME & WORK 🔧**

A aur B milkar = **ab/(a+b)** din
Example: A=12, B=15 → 12×15/27 = **6.67 din**

**Efficiency method:**
A → 1/12 per day
B → 1/15 per day
Together = 1/12+1/15 = 9/60
Days = **6.67** ✅

Roz 3-4 questions → 1 week mein perfect! 💪`,

  interest:`**SI & CI 💰**

SI = PRT/100
CI = P(1+R/100)ᵀ − P

**2 saal shortcut:**
CI − SI = P × **(R/100)²**
Example: P=10000, R=10% → CI-SI = **₹100**

Yeh formula yaad karo — guaranteed question! 🎯`,

  english:`**ENGLISH RULES 📝**

**Subject-Verb:**
• Each, Every, Either, Neither → **Singular** verb
• "The number of" → singular

**Prepositions:**
• Addicted **TO** · Afraid **OF** · Agree **WITH**
• Angry **WITH** (person) · Apologize **FOR**

**Common errors:**
• "Despite **of**" ❌ → "Despite" ✅
• "Although... **but**" ❌ → Only "Although" ✅

Daily 10 errors spot karo! 🔥`,

  gk:`**GK — Must Know 🌍**

**History:**
• 1757 Plassey · 1857 War · 1885 INC
• 1919 Jallianwala · 1930 Dandi · 1947 Independence

**Polity:**
• FR = Art **12-35** · DPSP = **36-51**
• Art 352 = National Emergency
• LS = 543 · RS = 245 seats

**Vitamins:**
A=Night blind · C=Scurvy · D=Rickets · B1=Beriberi

Har topic se 2 facts daily! 📚`,

  reasoning:`**REASONING TRICKS 🧠**

**Series types:**
• Arithmetic: same gap (+3,+3)
• Difference: gap badhta hai (+2,+4,+6)
• Squares: 1,4,9,16,25,36...

**Blood Relations:**
Hamesha family tree draw karo!
Mama ki beti = Cousin

**Direction:**
X-Y axis draw karo. Opposite cancel!
N+S = 0 · E+W = 0

**Coding:** Table banao pehle, phir pattern! 💪`,

  plan:`**Aaj Ka Plan 📅**

**Morning (2 hrs):**
• 1hr — Math (weak topics pehle)
• 1hr — GK (Lucent se 2 chapters)

**Afternoon (2 hrs):**
• 1hr — English (grammar + vocab)
• 1hr — Reasoning (mixed)

**Evening (1 hr):**
• 30min — Previous year questions
• 30min — Quiz attempt

**Daily target:**
5 Math + 5 Reasoning + 10 GK + 5 English

Consistency > Intensity! 🔥`,

  weak:`**Weak Subject Strategy 💡**

**5-Step method:**
1. Concept samjho (formula ratta nahi)
2. 5 solved examples dekho
3. 5 khud solve karo
4. Galti analyze karo
5. Agle din repeat karo

**Resources:**
• Math → Abhinay Sharma YouTube (free!)
• English → Neetu Singh notes
• GK → Lucent ek baar complete
• Reasoning → MK Pandey book

Tu kar sakta hai! 💪`,

  default:[
    `Specific topic batao bhai!\n\nExample:\n• "Percentage shortcut"\n• "Blood relation samjhao"\n• "English error rules"\n\nMain detail mein explain karunga! 🎯`,
    `Kaunsa subject weak hai?\n\nMain step by step bataunga:\n→ Concept → Formula → Shortcut → Example\n\nBata kya problem hai! 🤔`,
  ],
};

function getResp(input, weak) {
  const q=input.toLowerCase();
  let r="";
  if(/percent|%/.test(q)) r=GR.percent;
  else if(/profit|loss|discount/.test(q)) r=GR.profit;
  else if(/work|pipe/.test(q)) r=GR.work;
  else if(/interest|si\b|ci\b|compound/.test(q)) r=GR.interest;
  else if(/english|grammar|verb|error|preposition|idiom|vocab/.test(q)) r=GR.english;
  else if(/gk|history|polity|geography|science/.test(q)) r=GR.gk;
  else if(/reason|series|blood|direction|coding|logic/.test(q)) r=GR.reasoning;
  else if(/plan|schedule|aaj|kya padh/.test(q)) r=GR.plan;
  else if(/weak|improve|help|kaise|strong/.test(q)) r=GR.weak;
  else if(/math|algebra|geometry|number/.test(q)) r=GR.percent;
  else r=GR.default[Math.floor(Math.random()*GR.default.length)];
  if(weak.length>0&&Math.random()>.5) r+=`\n\n**Tera data:** ${weak.join(", ")} mein extra practice kar! 💪`;
  return r;
}

const TEACHERS = [
  {id:"ry",  name:"Rakesh Yadav",   sub:"Mathematics",      tag:"Shortcuts King",   students:"2M+",   rating:"4.9",price:499, desc:"SSC Math ke liye India ka #1 teacher. Speed tricks aur shortcuts ka legend."},
  {id:"ab",  name:"Abhinay Sharma", sub:"Mathematics",      tag:"Profit Loss Guru", students:"3M+",   rating:"4.9",price:549, desc:"Percentage, Profit/Loss, Time-Work — India ka most-loved math teacher."},
  {id:"ns",  name:"Neetu Singh",    sub:"English",          tag:"Grammar Expert",   students:"1.5M+", rating:"4.8",price:399, desc:"KD Campus ki top faculty. Grammar aur error spotting ka best approach."},
  {id:"mk",  name:"MK Pandey",      sub:"Reasoning",        tag:"Logic Master",     students:"1M+",   rating:"4.7",price:349, desc:"Analytical Reasoning ka systematic approach. Pattern recognition tricks."},
  {id:"lu",  name:"Lucent GK Team", sub:"General Knowledge",tag:"GK Bible",         students:"5M+",   rating:"4.9",price:299, desc:"SSC GK ka sabse comprehensive source. Ek baar karo — set ho jao."},
  {id:"rm",  name:"Rani Mam",       sub:"English",          tag:"RC Specialist",    students:"800K+", rating:"4.7",price:449, desc:"Reading comprehension aur error detection specialist."},
];

// ── Design tokens ──
const F={serif:'"Instrument Serif",Georgia,serif',sans:'"Geist","DM Sans",system-ui,sans-serif',mono:'"JetBrains Mono",monospace'};

// ── Atoms ──
const PBar=({v,max=100,color="#fff",h=3})=>(
  <div style={{height:h,background:"rgba(255,255,255,0.07)",borderRadius:99}}>
    <div style={{height:"100%",width:`${Math.min(100,max>0?(v/max)*100:0)}%`,background:color,borderRadius:99,transition:"width 1s ease"}}/>
  </div>
);

const Btn=({children,onClick,disabled,ghost,small,style:s})=>(
  <button onClick={onClick} disabled={disabled} style={{fontFamily:F.sans,fontWeight:700,border:"none",cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",transition:"opacity .15s,transform .12s",opacity:disabled?.4:1,fontSize:small?15:17,padding:small?"11px 20px":"15px 28px",borderRadius:13,background:ghost?"rgba(255,255,255,0.08)":"#fff",color:ghost?"rgba(255,255,255,0.65)":"#000",width:!ghost&&!small?"100%":"auto",...s}}>{children}</button>
);

const SH=({children,sub})=>(
  <div style={{marginBottom:26}}>
    <div style={{fontFamily:F.serif,fontSize:34,fontWeight:400,color:"#fff",lineHeight:1.1,letterSpacing:-.3}}>{children}</div>
    {sub&&<div style={{fontFamily:F.sans,fontSize:15,color:"rgba(255,255,255,0.38)",marginTop:7}}>{sub}</div>}
  </div>
);

const SL=({children})=><div style={{fontFamily:F.sans,fontSize:12,color:"rgba(255,255,255,0.3)",letterSpacing:1.1,textTransform:"uppercase",marginBottom:12}}>{children}</div>;
const HR=({my=24})=><div style={{height:1,background:"rgba(255,255,255,0.07)",margin:`${my}px 0`}}/>;
const PTab=({children,active,onClick})=>(
  <button onClick={onClick} style={{fontFamily:F.sans,fontSize:15,fontWeight:active?700:400,background:active?"#fff":"transparent",color:active?"#000":"rgba(255,255,255,0.3)",padding:"9px 20px",borderRadius:99,border:"none",cursor:"pointer",transition:"all .18s",flexShrink:0}}>{children}</button>
);

// ── HOME ──
function Home({topics,qh,goTo}){
  const total=Object.values(SUBJ).reduce((a,s)=>a+s.t.length,0);
  const done=Object.values(topics).flat().filter(Boolean).length;
  const pct=Math.round(done/total*100);
  const avgs={};
  Object.entries(qh).forEach(([k,sc])=>{if(sc.length)avgs[k]=Math.round(sc.reduce((a,s)=>a+(s.score/s.total)*100,0)/sc.length);});
  const weak=Object.entries(avgs).filter(([,v])=>v<60).map(([k])=>k);
  const strong=Object.entries(avgs).filter(([,v])=>v>=75).map(([k])=>k);
  const tests=Object.values(qh).flat().length;
  const gAvg=Object.values(avgs).length?Math.round(Object.values(avgs).reduce((a,b)=>a+b,0)/Object.values(avgs).length):null;
  const hr=new Date().getHours();
  const time=hr<12?"Morning":hr<17?"Afternoon":"Evening";
  const next=[];
  Object.entries(SUBJ).forEach(([k,s])=>{const i=s.t.findIndex((_,idx)=>!topics[k]?.[idx]);if(i!==-1)next.push({k,topic:s.t[i],weak:weak.includes(k)});});

  return(
    <div style={{paddingBottom:32}}>
      <div style={{paddingBottom:36}}>
        <div style={{fontFamily:F.sans,fontSize:13,color:"rgba(255,255,255,0.28)",letterSpacing:1.2,textTransform:"uppercase",marginBottom:14}}>Good {time}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={{fontFamily:F.serif,fontSize:44,color:"#fff",lineHeight:1.05,letterSpacing:-.5}}>Your<br/>Progress</div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:F.serif,fontSize:72,color:"#fff",letterSpacing:-4,lineHeight:.88}}>{pct}</div>
            <div style={{fontFamily:F.sans,fontSize:18,color:"rgba(255,255,255,0.38)",marginTop:8}}>% complete</div>
          </div>
        </div>
        <div style={{marginTop:22}}><PBar v={pct} h={4}/></div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:40}}>
        {[{v:`${done}/${total}`,l:"Topics Done"},{v:String(tests||0),l:"Tests Taken"},{v:gAvg!=null?`${gAvg}%`:"—",l:"Quiz Average"},{v:"7 🔥",l:"Day Streak"}].map(({v,l})=>(
          <div key={l} style={{background:"#111",borderRadius:20,padding:"22px 18px"}}>
            <div style={{fontFamily:F.serif,fontSize:34,color:"#fff",lineHeight:1,marginBottom:8}}>{v}</div>
            <div style={{fontFamily:F.sans,fontSize:12,color:"rgba(255,255,255,0.3)",letterSpacing:.6,textTransform:"uppercase"}}>{l}</div>
          </div>
        ))}
      </div>

      <SH>Subjects</SH>
      <div style={{display:"flex",flexDirection:"column",gap:24,marginBottom:40}}>
        {Object.entries(SUBJ).map(([k,s])=>{
          const d2=topics[k]?.filter(Boolean).length||0,t2=s.t.length,p2=Math.round(d2/t2*100);
          const avg=avgs[k],isW=weak.includes(k),isS=strong.includes(k);
          return(
            <div key={k}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontFamily:F.sans,fontSize:18,color:"rgba(255,255,255,0.7)",fontWeight:500}}>{s.n}</span>
                  {isW&&<span style={{fontFamily:F.sans,fontSize:12,color:"#f87171",background:"rgba(248,113,113,0.12)",padding:"3px 10px",borderRadius:6,fontWeight:700}}>Weak</span>}
                  {isS&&<span style={{fontFamily:F.sans,fontSize:12,color:"#4ade80",background:"rgba(74,222,128,0.12)",padding:"3px 10px",borderRadius:6,fontWeight:700}}>Strong</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  {avg!=null&&<span style={{fontFamily:F.sans,fontSize:16,fontWeight:700,color:avg>=75?"#4ade80":avg>=60?"#fbbf24":"#f87171"}}>{avg}%</span>}
                  <span style={{fontFamily:F.serif,fontSize:22,color:"rgba(255,255,255,0.22)"}}>{p2}%</span>
                </div>
              </div>
              <PBar v={p2} color={isW?"#f87171":isS?"#4ade80":"#fff"} h={3}/>
              <div style={{fontFamily:F.sans,fontSize:13,color:"rgba(255,255,255,0.2)",marginTop:6}}>{d2} of {t2} topics</div>
            </div>
          );
        })}
      </div>

      {weak.length>0&&(
        <div style={{marginBottom:40}}>
          <SH>⚠ Focus Areas</SH>
          {weak.map(k=>(
            <div key={k} style={{display:"flex",gap:14,padding:"18px 0",borderBottom:"1px solid rgba(248,113,113,0.12)"}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#f87171",flexShrink:0,marginTop:5}}/>
              <div>
                <div style={{fontFamily:F.sans,fontSize:18,color:"rgba(252,165,165,0.9)",fontWeight:500}}>{SUBJ[k].n}</div>
                <div style={{fontFamily:F.sans,fontSize:14,color:"rgba(248,113,113,0.4)",marginTop:3}}>Quiz avg: {avgs[k]}% — practice badhao</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{marginBottom:36}}>
        <SH>Pick Up From</SH>
        {next.slice(0,4).map((nt,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:16,padding:"18px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <span style={{fontFamily:F.mono,fontSize:14,color:"rgba(255,255,255,0.18)",width:26,flexShrink:0}}>0{i+1}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:F.sans,fontSize:18,color:"#fff"}}>{nt.topic}</div>
              <div style={{fontFamily:F.sans,fontSize:14,color:"rgba(255,255,255,0.35)",marginTop:3}}>{SUBJ[nt.k].n}</div>
            </div>
            {nt.weak&&<span style={{fontFamily:F.sans,fontSize:13,color:"#f87171",fontWeight:700}}>Priority</span>}
          </div>
        ))}
      </div>
      <Btn onClick={()=>goTo("plan")}>Generate Study Plan →</Btn>
    </div>
  );
}

// ── GURU CHAT ──
function Guru({qh}){
  const [msgs,setMsgs]=useState([{role:"ai",text:"Hey! Main Guru hoon — tera SSC AI coach. 🎯\n\nKya poochha hai aaj? Math? English? GK? Reasoning?"}]);
  const [input,setInput]=useState("");
  const [loading,setL]=useState(false);
  const botRef=useRef(null);
  const taRef=useRef(null);
  useEffect(()=>{botRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  const avgs={};
  Object.entries(qh).forEach(([k,sc])=>{if(sc.length)avgs[k]=Math.round(sc.reduce((a,s)=>a+(s.score/s.total)*100,0)/sc.length);});
  const weak=Object.entries(avgs).filter(([,v])=>v<60).map(([k])=>SUBJ[k]?.n||k);

  function send(txt){
    const q=(txt||input).trim();
    if(!q||loading)return;
    setInput("");if(taRef.current)taRef.current.style.height="auto";
    setMsgs(p=>[...p,{role:"user",text:q}]);
    setL(true);
    setTimeout(()=>{setMsgs(p=>[...p,{role:"ai",text:getResp(q,weak)}]);setL(false);},700+Math.random()*500);
  }

  const renderText=(text)=>text.split("\n").map((line,li)=>(
    <div key={li} style={{marginBottom:line===""?6:0}}>
      {line.split(/(\*\*[^*]+\*\*)/).map((seg,si)=>
        seg.startsWith("**")&&seg.endsWith("**")
          ?<strong key={si} style={{color:"#fff",fontWeight:700}}>{seg.slice(2,-2)}</strong>:seg
      )}
    </div>
  ));

  const sugg=["Percentage shortcut","Math mein weak hoon","English grammar","Aaj ka plan","GK topics","Reasoning tricks"];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100dvh - 130px)"}}>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",paddingBottom:8}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{padding:"20px 0",background:m.role==="ai"?"transparent":"rgba(255,255,255,0.02)",animation:"msgIn .32s ease"}}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{width:38,height:38,borderRadius:11,flexShrink:0,marginTop:2,background:m.role==="ai"?"#1b1b1b":"#222",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {m.role==="ai"
                  ?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a5 5 0 015 5v1a5 5 0 01-10 0V7a5 5 0 015-5z"/><path d="M19 16c0-3-3.13-5-7-5s-7 2-7 5v2h14v-2z"/></svg>
                  :<span style={{fontFamily:F.sans,fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.45)"}}>U</span>
                }
              </div>
              <div style={{flex:1,fontFamily:F.sans,fontSize:17,lineHeight:1.85,color:m.role==="ai"?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.6)",paddingTop:5}}>
                {renderText(m.text)}
              </div>
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{padding:"20px 0"}}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{width:38,height:38,borderRadius:11,background:"#1b1b1b",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a5 5 0 015 5v1a5 5 0 01-10 0V7a5 5 0 015-5z"/><path d="M19 16c0-3-3.13-5-7-5s-7 2-7 5v2h14v-2z"/></svg>
              </div>
              <div style={{paddingTop:14,display:"flex",gap:5}}>
                {[0,.2,.4].map((d,i)=><span key={i} style={{width:7,height:7,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"inline-block",animation:`dotP 1.4s ${d}s infinite`}}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={botRef}/>
      </div>

      {msgs.length<=1&&!loading&&(
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12}}>
          {sugg.map(s=><button key={s} onClick={()=>send(s)} style={{background:"#111",color:"rgba(255,255,255,0.5)",fontFamily:F.sans,fontSize:14,padding:"10px 18px",borderRadius:22,border:"none",cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>{s}</button>)}
        </div>
      )}

      <div>
        <div style={{background:"#111",borderRadius:20,padding:"6px 6px 6px 20px",display:"flex",gap:8,alignItems:"flex-end",boxShadow:"0 0 0 1px rgba(255,255,255,0.07)"}}>
          <textarea ref={taRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,140)+"px";}}
            placeholder="Kuch bhi poochh Guru se…" rows={1}
            style={{flex:1,background:"transparent",border:"none",color:"rgba(255,255,255,0.9)",fontFamily:F.sans,fontSize:17,lineHeight:1.65,padding:"12px 0",outline:"none",resize:"none"}}
          />
          <button onClick={()=>send()} disabled={loading||!input.trim()} style={{width:44,height:44,borderRadius:14,border:"none",background:input.trim()&&!loading?"#fff":"rgba(255,255,255,0.08)",color:input.trim()&&!loading?"#000":"rgba(255,255,255,0.2)",cursor:loading||!input.trim()?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </button>
        </div>
        <div style={{fontFamily:F.sans,fontSize:12,color:"rgba(255,255,255,0.16)",textAlign:"center",marginTop:8}}>Enter to send · Shift+Enter new line</div>
      </div>
    </div>
  );
}

// ── QUIZ ──
function Quiz({onScore}){
  const [screen,setSc]=useState("pick");
  const [type,setType]=useState("full");
  const [subj,setSubj]=useState("math");
  const [qs,setQs]=useState([]);
  const [qi,setQi]=useState(0);
  const [sel,setSel]=useState(null);
  const [res,setRes]=useState([]);

  function start(){let p=type==="full"?Object.values(QDB).flat():QDB[subj];p=[...p].sort(()=>Math.random()-.5).slice(0,10);setQs(p);setQi(0);setSel(null);setRes([]);setSc("test");}
  function next(){const r=[...res,{q:qs[qi],sel,ok:sel===qs[qi].a}];if(qi+1>=qs.length){onScore(type==="full"?"math":subj,r.filter(x=>x.ok).length,qs.length);setRes(r);setSc("result");}else{setRes(r);setQi(i=>i+1);setSel(null);}}
  const DC={easy:"#4ade80",medium:"#fbbf24",hard:"#f87171"};

  if(screen==="pick")return(
    <div style={{paddingBottom:32}}>
      <SH>Mock Test</SH>
      <SL>Test Type</SL>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:32}}>
        {["full","chapter"].map(v=>(
          <button key={v} onClick={()=>setType(v)} style={{padding:"20px 16px",borderRadius:18,border:"none",background:type===v?"#fff":"#111",color:type===v?"#000":"rgba(255,255,255,0.4)",fontFamily:F.sans,fontSize:18,fontWeight:700,cursor:"pointer",transition:"all .15s",textAlign:"left"}}>
            {v==="full"?"📋 Full Mock":"📖 Chapter"}
          </button>
        ))}
      </div>
      {type==="chapter"&&<>
        <SL>Subject</SL>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:32}}>
          {Object.entries(SUBJ).map(([k,s])=>(
            <button key={k} onClick={()=>setSubj(k)} style={{padding:"18px 14px",borderRadius:16,border:"none",background:subj===k?"#fff":"#111",color:subj===k?"#000":"rgba(255,255,255,0.4)",fontFamily:F.sans,fontSize:17,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>{s.n}</button>
          ))}
        </div>
      </>}
      <Btn onClick={start}>Start Test →</Btn>
    </div>
  );

  if(screen==="result"){
    const score=res.filter(x=>x.ok).length,pct=Math.round(score/res.length*100);
    const byT={};res.forEach(r=>{byT[r.q.t]=byT[r.q.t]||{c:0,n:0};byT[r.q.t].n++;if(r.ok)byT[r.q.t].c++;});
    return(
      <div style={{paddingBottom:32}}>
        <div style={{textAlign:"center",padding:"28px 0 36px"}}>
          <div style={{fontSize:62,marginBottom:16}}>{pct>=80?"🏆":pct>=60?"👍":"📚"}</div>
          <div style={{fontFamily:F.serif,fontSize:80,color:"#fff",letterSpacing:-4,lineHeight:.88,marginBottom:12}}>
            {score}<span style={{fontSize:40,color:"rgba(255,255,255,0.22)"}}>/{res.length}</span>
          </div>
          <div style={{fontFamily:F.sans,fontSize:24,fontWeight:700,color:pct>=80?"#4ade80":pct>=60?"#fbbf24":"#f87171",marginBottom:10}}>{pct}%</div>
          <div style={{fontFamily:F.sans,fontSize:16,color:"rgba(255,255,255,0.38)"}}>{pct>=80?"Zabardast! 🔥":pct>=60?"Good, push harder!":"Guru se poochh, retry karo!"}</div>
        </div>
        <HR/>
        <SH>Topic Breakdown</SH>
        {Object.entries(byT).map(([t,{c,n}])=>(
          <div key={t} style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontFamily:F.sans,fontSize:17,color:"rgba(255,255,255,0.7)"}}>{t}</span>
              <span style={{fontFamily:F.sans,fontSize:16,fontWeight:700,color:c/n>=.6?"#4ade80":"#f87171"}}>{c}/{n}</span>
            </div>
            <PBar v={c} max={n} color={c/n>=.6?"#4ade80":"#f87171"} h={3}/>
          </div>
        ))}
        {res.filter(x=>!x.ok).length>0&&<>
          <HR/>
          <SH>Corrections</SH>
          {res.filter(x=>!x.ok).map((r,i)=>(
            <div key={i} style={{padding:"20px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <div style={{fontFamily:F.sans,fontSize:17,color:"rgba(252,165,165,0.85)",marginBottom:8,lineHeight:1.65}}>{r.q.q}</div>
              <div style={{fontFamily:F.sans,fontSize:16,color:"#4ade80",marginBottom:6}}>✓ {r.q.o[r.q.a]}</div>
              <div style={{fontFamily:F.sans,fontSize:14,color:"rgba(255,255,255,0.3)"}}>💡 {r.q.c}</div>
            </div>
          ))}
        </>}
        <div style={{paddingTop:28}}><Btn onClick={()=>setSc("pick")}>New Test</Btn></div>
      </div>
    );
  }

  const q=qs[qi];
  return(
    <div style={{paddingBottom:32}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",gap:8}}>
          <span style={{fontFamily:F.sans,fontSize:13,color:"rgba(255,255,255,0.35)",background:"#111",padding:"4px 12px",borderRadius:7}}>{q.t}</span>
          <span style={{fontFamily:F.sans,fontSize:13,color:DC[q.d],background:DC[q.d]+"18",padding:"4px 12px",borderRadius:7,fontWeight:700}}>{q.d}</span>
        </div>
        <span style={{fontFamily:F.mono,fontSize:14,color:"rgba(255,255,255,0.3)",fontWeight:600}}>{qi+1}/{qs.length}</span>
      </div>
      <PBar v={qi} max={qs.length} h={3}/>
      <div style={{fontFamily:F.sans,fontSize:20,color:"#fff",lineHeight:1.7,margin:"28px 0",fontWeight:500}}>{q.q}</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {q.o.map((opt,i)=>{
          const isA=i===q.a,isS=i===sel;
          let bg="#111",col="rgba(255,255,255,0.7)";
          if(sel!==null){if(isA){bg="rgba(74,222,128,0.12)";col="#4ade80";}else if(isS){bg="rgba(248,113,113,0.10)";col="#f87171";}else{bg="#0c0c0c";col="rgba(255,255,255,0.2)";}}
          return(
            <button key={i} onClick={()=>sel===null&&setSel(i)} style={{background:bg,color:col,border:"none",borderRadius:16,padding:"18px 20px",fontFamily:F.sans,fontSize:17,textAlign:"left",cursor:sel!==null?"default":"pointer",transition:"all .18s",display:"flex",justifyContent:"space-between",alignItems:"center",lineHeight:1.4}}>
              <span><span style={{fontFamily:F.mono,fontSize:13,marginRight:14,opacity:.38}}>{String.fromCharCode(65+i)}</span>{opt}</span>
              {sel!==null&&isA&&<span style={{fontSize:22}}>✓</span>}
              {sel!==null&&isS&&!isA&&<span style={{fontSize:22}}>✗</span>}
            </button>
          );
        })}
      </div>
      {sel!==null&&<>
        <div style={{marginTop:20,padding:"20px",background:"#111",borderRadius:18}}>
          <div style={{fontFamily:F.sans,fontSize:16,color:"rgba(255,255,255,0.7)",lineHeight:1.75,marginBottom:8}}><span style={{color:"#fff",fontWeight:700}}>Explanation: </span>{q.exp}</div>
          <div style={{fontFamily:F.sans,fontSize:15,color:"rgba(255,255,255,0.35)"}}>💡 {q.c}</div>
        </div>
        <div style={{marginTop:16}}><Btn onClick={next}>{qi+1>=qs.length?"See Results →":"Next →"}</Btn></div>
      </>}
    </div>
  );
}

// ── PLAN ──
function Plan({qh,topics}){
  const [hours,setH]=useState(4);
  const [done,setDone]=useState({});
  const [plan,setPlan]=useState(()=>cGet("offPlan"));
  const [timer,setTmr]=useState(null);
  const [on,setOn]=useState(false);
  const [lbl,setLbl]=useState("");
  const ref=useRef(null);
  useEffect(()=>{if(on&&timer>0){ref.current=setTimeout(()=>setTmr(t=>t-1),1000);}else if(timer===0)setOn(false);return()=>clearTimeout(ref.current);},[on,timer]);

  const avgs={};Object.entries(qh).forEach(([k,sc])=>{if(sc.length)avgs[k]=Math.round(sc.reduce((a,s)=>a+(s.score/s.total)*100,0)/sc.length);});
  const weak=Object.entries(avgs).filter(([,v])=>v<60).map(([k])=>k);

  const POOL={
    math:[
      {task:"Percentage: 15 questions — swap trick practice",time:"40",type:"practice",tip:"X% of Y = Y% of X — fast calculation"},
      {task:"Profit & Loss: Same SP trick + fake weight trick",time:"30",type:"learn",tip:"Loss% = (P/10)² — yaad rakh!"},
      {task:"Time & Work: ab/(a+b) formula 10 questions",time:"35",type:"practice",tip:"Efficiency method bhi try karo"},
      {task:"CI vs SI: 2-year difference shortcut",time:"30",type:"revise",tip:"CI−SI = P(R/100)² for 2 years"},
    ],
    eng:[
      {task:"Subject-Verb Agreement: 10 error spotting",time:"35",type:"practice",tip:"Each/Every → singular hamesha"},
      {task:"Top 50 Idioms with meanings",time:"40",type:"learn",tip:"Story banao har idiom ke liye"},
      {task:"Prepositions: addicted to, afraid of etc.",time:"30",type:"practice",tip:"In spite of = Despite"},
    ],
    gk:[
      {task:"History: 1857 se 1947 key events",time:"30",type:"learn",tip:"Dates ke liye story method"},
      {task:"Polity: Articles 12-51 quick revision",time:"35",type:"revise",tip:"FR=12-35, DPSP=36-51"},
      {task:"Science: Vitamins + Diseases list",time:"25",type:"revise",tip:"A=Night blind, C=Scurvy, D=Rickets"},
    ],
    logic:[
      {task:"Number Series: 20 mixed questions",time:"30",type:"practice",tip:"Types: arithmetic, geometric, difference"},
      {task:"Blood Relations: 10 family tree questions",time:"25",type:"practice",tip:"Hamesha tree draw karo"},
      {task:"Direction Sense: X-Y axis 10 questions",time:"25",type:"learn",tip:"Opposite directions cancel!"},
    ],
  };

  function generate(){
    const slots=Math.min(8,Math.round(hours*1.5));
    const order=[...new Set([...weak,"math","eng","gk","logic"])];
    const tasks=[];
    for(let i=0;i<slots;i++){const k=order[i%order.length];const pool=POOL[k]||[];if(pool.length)tasks.push({...pool[i%pool.length],subject:SUBJ[k]?.n||k});}
    const p={
      greeting:weak.length>0?`${weak.map(w=>SUBJ[w]?.n||w).join(" aur ")} pe focus karo — yahi rank badlegi! 💪`:`${hours} ghante solid karo aaj! 🔥`,
      tasks,endNote:"Aaj ka plan complete karo — kal ka future build ho raha hai! 🎯",
    };
    setPlan(p);setDone({});cSet("offPlan",p);
  }

  const mm=timer!=null?String(Math.floor(timer/60)).padStart(2,"0"):"--";
  const ss=timer!=null?String(timer%60).padStart(2,"0"):"--";
  const dc=Object.values(done).filter(Boolean).length;
  const TC={learn:"#60a5fa",practice:"#fff",revise:"rgba(255,255,255,0.45)",test:"#f87171"};

  return(
    <div style={{paddingBottom:32}}>
      {timer!=null&&(
        <div style={{background:"#111",borderRadius:20,padding:"22px 20px",marginBottom:32,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:F.sans,fontSize:12,color:"rgba(255,255,255,0.3)",letterSpacing:.8,textTransform:"uppercase",marginBottom:8}}>{lbl}</div>
            <div style={{fontFamily:F.serif,fontSize:56,color:"#fff",letterSpacing:-1,lineHeight:1}}>{mm}<span style={{color:"rgba(255,255,255,0.28)"}}>:</span>{ss}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn ghost small onClick={()=>setOn(r=>!r)}>{on?"Pause":"Resume"}</Btn>
            <button onClick={()=>{setTmr(null);setOn(false);}} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.5)",padding:"11px 16px",borderRadius:10,cursor:"pointer",fontSize:20}}>✕</button>
          </div>
        </div>
      )}
      <SH>Study Plan</SH>
      <SL>Hours available today</SL>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[2,3,4,5,6,8].map(h=>(
          <button key={h} onClick={()=>setH(h)} style={{flex:1,padding:"13px 0",borderRadius:12,border:"none",background:hours===h?"#fff":"#111",color:hours===h?"#000":"rgba(255,255,255,0.35)",fontFamily:F.sans,fontSize:16,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>{h}h</button>
        ))}
      </div>
      <Btn onClick={generate}>{plan?"Regenerate Plan ↺":"Generate Plan →"}</Btn>
      {plan&&<>
        <div style={{fontFamily:F.sans,fontSize:17,color:"rgba(255,255,255,0.55)",lineHeight:1.75,margin:"32px 0 24px",paddingLeft:18,borderLeft:"2px solid rgba(255,255,255,0.12)"}}>{plan.greeting}</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <SL>Tasks</SL>
          <span style={{fontFamily:F.sans,fontSize:15,color:"rgba(255,255,255,0.3)",fontWeight:600}}>{dc}/{plan.tasks.length}</span>
        </div>
        <PBar v={dc} max={plan.tasks.length} h={3}/>
        <div style={{marginTop:20}}>
          {plan.tasks.map((t,i)=>{
            const d=done[i];
            return(
              <div key={i} style={{display:"flex",gap:16,padding:"20px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",opacity:d?.38:1,transition:"opacity .2s"}}>
                <button onClick={()=>setDone(x=>({...x,[i]:!x[i]}))} style={{width:24,height:24,borderRadius:7,border:`1.5px solid ${d?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.18)"}`,background:d?"rgba(255,255,255,0.05)":"transparent",cursor:"pointer",flexShrink:0,marginTop:3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(255,255,255,0.4)"}}>{d?"✓":""}</button>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontFamily:F.sans,fontSize:12,fontWeight:700,color:TC[t.type]||"#fff"}}>{t.type.toUpperCase()}</span>
                    <span style={{fontFamily:F.mono,fontSize:12,color:"rgba(255,255,255,0.2)"}}>{t.time}min</span>
                    <span style={{fontFamily:F.sans,fontSize:12,color:"rgba(255,255,255,0.2)"}}>{t.subject}</span>
                  </div>
                  <div style={{fontFamily:F.sans,fontSize:18,color:d?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.9)",textDecoration:d?"line-through":"none",marginBottom:8,lineHeight:1.5}}>{t.task}</div>
                  <div style={{fontFamily:F.sans,fontSize:14,color:"rgba(255,255,255,0.28)",lineHeight:1.6}}>💡 {t.tip}</div>
                  {!d&&<button onClick={()=>{setTmr(parseInt(t.time)*60);setOn(true);setLbl(t.task);}} style={{marginTop:10,background:"none",border:"none",color:"rgba(255,255,255,0.28)",fontFamily:F.sans,fontSize:14,cursor:"pointer",padding:0}}>▶ Start timer</button>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{fontFamily:F.sans,fontSize:16,color:"rgba(255,255,255,0.28)",textAlign:"center",lineHeight:1.8,fontStyle:"italic",marginTop:28}}>{plan.endNote}</div>
      </>}
    </div>
  );
}

// ── PROFILE ──
function Profile({topics,qh,setTopics}){
  const [tab,setTab]=useState("overview");
  const [notes,setNotes]=useState(()=>cGet("myNotes")||[]);
  const [nn,setNn]=useState({subj:"math",title:"",content:""});
  const [syl,setSyl]=useState("math");
  const [bought,setBought]=useState(()=>cGet("bought")||[]);

  const total=Object.values(SUBJ).reduce((a,s)=>a+s.t.length,0);
  const done=Object.values(topics).flat().filter(Boolean).length;
  const tests=Object.values(qh).flat().length;
  const avgs={};Object.entries(qh).forEach(([k,sc])=>{if(sc.length)avgs[k]=Math.round(sc.reduce((a,s)=>a+(s.score/s.total)*100,0)/sc.length);});
  const gAvg=Object.values(avgs).length?Math.round(Object.values(avgs).reduce((a,b)=>a+b,0)/Object.values(avgs).length):null;

  const buy=id=>{if(!bought.includes(id)){const u=[...bought,id];setBought(u);cSet("bought",u);}};
  const addNote=()=>{
    if(!nn.title.trim()||!nn.content.trim())return;
    const n={...nn,id:Date.now(),date:new Date().toLocaleDateString("en-IN")};
    const u=[n,...notes];setNotes(u);cSet("myNotes",u);setNn({subj:"math",title:"",content:""});
  };
  const delNote=id=>{const u=notes.filter(n=>n.id!==id);setNotes(u);cSet("myNotes",u);};
  const toggleT=(k,i)=>setTopics(t=>{const n={...t,[k]:[...t[k]]};n[k][i]=!n[k][i];cSet("topics",n);return n;});

  return(
    <div style={{paddingBottom:32}}>
      <div style={{display:"flex",gap:18,alignItems:"center",marginBottom:28}}>
        <div style={{width:74,height:74,borderRadius:22,background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,flexShrink:0}}>🎓</div>
        <div>
          <div style={{fontFamily:F.serif,fontSize:30,color:"#fff",marginBottom:4}}>SSC Aspirant</div>
          <div style={{fontFamily:F.sans,fontSize:15,color:"rgba(255,255,255,0.38)"}}>SSC CGL 2025 · {Math.round(done/total*100)}% complete</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:28}}>
        {[{v:done,l:"Topics"},{v:tests,l:"Tests"},{v:gAvg!=null?`${gAvg}%`:"—",l:"Avg"}].map(({v,l})=>(
          <div key={l} style={{background:"#111",borderRadius:18,padding:"18px 14px",textAlign:"center"}}>
            <div style={{fontFamily:F.serif,fontSize:30,color:"#fff",lineHeight:1,marginBottom:6}}>{v}</div>
            <div style={{fontFamily:F.sans,fontSize:11,color:"rgba(255,255,255,0.28)",letterSpacing:.6,textTransform:"uppercase"}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:4,background:"#0e0e0e",borderRadius:18,padding:5,marginBottom:28}}>
        {["overview","teachers","syllabus","notes"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"12px 4px",borderRadius:14,border:"none",background:tab===t?"#fff":"transparent",color:tab===t?"#000":"rgba(255,255,255,0.3)",fontFamily:F.sans,fontSize:13,fontWeight:tab===t?700:400,cursor:"pointer",transition:"all .18s",textTransform:"capitalize"}}>{t}</button>
        ))}
      </div>

      {tab==="overview"&&(
        <div>
          <SH>Subject Progress</SH>
          {Object.entries(SUBJ).map(([k,s])=>{
            const d2=topics[k]?.filter(Boolean).length||0,t2=s.t.length,p2=Math.round(d2/t2*100),avg=avgs[k];
            return(
              <div key={k} style={{marginBottom:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontFamily:F.sans,fontSize:18,color:"rgba(255,255,255,0.7)",fontWeight:500}}>{s.n}</span>
                  <div style={{display:"flex",gap:16}}>
                    {avg!=null&&<span style={{fontFamily:F.sans,fontSize:16,fontWeight:700,color:avg>=75?"#4ade80":avg>=60?"#fbbf24":"#f87171"}}>{avg}%</span>}
                    <span style={{fontFamily:F.serif,fontSize:22,color:"rgba(255,255,255,0.22)"}}>{p2}%</span>
                  </div>
                </div>
                <PBar v={p2} h={3}/>
              </div>
            );
          })}
        </div>
      )}

      {tab==="teachers"&&(
        <div>
          <SH sub="India ke best SSC teachers — course lo, preparation boost karo">Top Teachers</SH>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {TEACHERS.map(tc=>{
              const isB=bought.includes(tc.id);
              return(
                <div key={tc.id} style={{background:"#111",borderRadius:22,padding:"22px 20px"}}>
                  <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:14}}>
                    <div style={{width:58,height:58,borderRadius:16,background:"#1e1e1e",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.sans,fontSize:20,fontWeight:800,color:"rgba(255,255,255,0.5)",flexShrink:0}}>
                      {tc.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:F.sans,fontSize:20,fontWeight:700,color:"#fff",marginBottom:5}}>{tc.name}</div>
                      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontFamily:F.sans,fontSize:14,color:"rgba(255,255,255,0.35)"}}>{tc.sub}</span>
                        <span style={{fontFamily:F.sans,fontSize:14,color:"#fbbf24",fontWeight:700}}>★ {tc.rating}</span>
                        <span style={{fontFamily:F.sans,fontSize:13,color:"rgba(255,255,255,0.22)"}}>{tc.students}</span>
                      </div>
                    </div>
                    <span style={{fontFamily:F.sans,fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.06)",padding:"5px 10px",borderRadius:7,flexShrink:0}}>{tc.tag}</span>
                  </div>
                  <div style={{fontFamily:F.sans,fontSize:15,color:"rgba(255,255,255,0.42)",lineHeight:1.7,marginBottom:20}}>{tc.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    {isB
                      ?<span style={{fontFamily:F.sans,fontSize:16,color:"#4ade80",fontWeight:700}}>✓ Enrolled</span>
                      :<div><span style={{fontFamily:F.serif,fontSize:30,color:"#fff"}}>₹{tc.price}</span><span style={{fontFamily:F.sans,fontSize:14,color:"rgba(255,255,255,0.28)",marginLeft:5}}>one-time</span></div>
                    }
                    <Btn small onClick={()=>buy(tc.id)} disabled={isB}>{isB?"Enrolled":"Buy Course"}</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="syllabus"&&(
        <div>
          <SH>Syllabus Tracker</SH>
          <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            {Object.entries(SUBJ).map(([k,s])=>(<PTab key={k} active={syl===k} onClick={()=>setSyl(k)}>{s.s}</PTab>))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontFamily:F.serif,fontSize:26,color:"#fff"}}>{SUBJ[syl].n}</div>
            <div style={{fontFamily:F.sans,fontSize:15,color:"rgba(255,255,255,0.35)",fontWeight:600}}>{topics[syl]?.filter(Boolean).length}/{SUBJ[syl].t.length}</div>
          </div>
          <PBar v={topics[syl]?.filter(Boolean).length||0} max={SUBJ[syl].t.length} h={3}/>
          <div style={{marginTop:20}}>
            {SUBJ[syl].t.map((t,i)=>{
              const d=topics[syl]?.[i];
              return(
                <button key={i} onClick={()=>toggleT(syl,i)} style={{display:"flex",alignItems:"center",gap:16,padding:"17px 0",background:"none",border:"none",borderBottom:"1px solid rgba(255,255,255,0.06)",cursor:"pointer",textAlign:"left",width:"100%"}}>
                  <div style={{width:24,height:24,border:`1.5px solid ${d?"#4ade80":"rgba(255,255,255,0.15)"}`,borderRadius:7,background:d?"rgba(74,222,128,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#4ade80",flexShrink:0}}>{d?"✓":""}</div>
                  <span style={{fontFamily:F.sans,fontSize:17,color:d?"#4ade80":"rgba(255,255,255,0.6)"}}>{t}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab==="notes"&&(
        <div>
          <SH>My Notes</SH>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.entries(SUBJ).map(([k,s])=>(<PTab key={k} active={nn.subj===k} onClick={()=>setNn(n=>({...n,subj:k}))}>{s.s}</PTab>))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
            <input value={nn.title} onChange={e=>setNn(n=>({...n,title:e.target.value}))} placeholder="Note ka title…"
              style={{background:"#111",border:"none",color:"rgba(255,255,255,0.9)",fontFamily:F.sans,fontSize:17,padding:"16px 18px",borderRadius:14,outline:"none"}}/>
            <textarea value={nn.content} onChange={e=>setNn(n=>({...n,content:e.target.value}))} placeholder="Concept, formula, shortcut…" rows={4}
              style={{background:"#111",border:"none",color:"rgba(255,255,255,0.9)",fontFamily:F.sans,fontSize:16,padding:"16px 18px",borderRadius:14,outline:"none",resize:"vertical",lineHeight:1.7}}/>
            <Btn onClick={addNote}>Save Note</Btn>
          </div>
          {notes.length===0
            ?<div style={{fontFamily:F.sans,fontSize:17,color:"rgba(255,255,255,0.2)",textAlign:"center",padding:"40px 0"}}>Koi notes nahi — upar se add karo!</div>
            :notes.map(n=>(
              <div key={n.id} style={{paddingBottom:24,marginBottom:24,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{fontFamily:F.serif,fontSize:24,color:"#fff",marginBottom:6}}>{n.title}</div>
                    <div style={{display:"flex",gap:10}}>
                      <span style={{fontFamily:F.sans,fontSize:13,color:"rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.06)",padding:"3px 10px",borderRadius:6}}>{SUBJ[n.subj]?.n}</span>
                      <span style={{fontFamily:F.sans,fontSize:13,color:"rgba(255,255,255,0.2)"}}>{n.date}</span>
                    </div>
                  </div>
                  <button onClick={()=>delNote(n.id)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",cursor:"pointer",fontSize:26,lineHeight:1,padding:"0 4px"}}>×</button>
                </div>
                <div style={{fontFamily:F.sans,fontSize:16,color:"rgba(255,255,255,0.58)",lineHeight:1.85,whiteSpace:"pre-wrap"}}>{n.content}</div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── APP SHELL ──
const NAV=[
  {id:"home",   label:"Home",    icon:a=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.6} strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
  {id:"plan",   label:"Plan",    icon:a=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.6} strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>},
  {id:"guru",   label:"Guru",    icon:_=><Tri size={24}/>},
  {id:"quiz",   label:"Quiz",    icon:a=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.6} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>},
  {id:"profile",label:"Profile", icon:a=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.6} strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>},
];

export default function App(){
  const [page,setPage]=useState("home");
  const [topics,setTopics]=useState(()=>{const t=cGet("topics");if(t)return t;const n={};Object.keys(SUBJ).forEach(k=>{n[k]=SUBJ[k].t.map(()=>false);});return n;});
  const [qh,setQh]=useState(()=>cGet("qh")||{math:[],eng:[],gk:[],logic:[]});

  function score(subj,s,t){setQh(prev=>{const u={...prev,[subj]:[...(prev[subj]||[]),{score:s,total:t,date:new Date().toLocaleDateString("en-IN")}]};cSet("qh",u);return u;});}

  return(
    <div style={{background:"#080808",height:"100dvh",display:"flex",flexDirection:"column",overflow:"hidden",color:"rgba(255,255,255,0.88)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px 12px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Tri size={18}/>
          <span style={{fontFamily:F.serif,fontSize:20,color:"#fff",letterSpacing:.2}}>SSC Guru</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80"}}/>
          <span style={{fontFamily:F.sans,fontSize:12,color:"#4ade80",fontWeight:700,letterSpacing:.4}}>Ready</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 24px",maxWidth:500,width:"100%",margin:"0 auto",boxSizing:"border-box"}}>
        {page==="home"    &&<Home    topics={topics} qh={qh} goTo={setPage}/>}
        {page==="plan"    &&<Plan    qh={qh} topics={topics}/>}
        {page==="guru"    &&<Guru    qh={qh}/>}
        {page==="quiz"    &&<Quiz    onScore={score}/>}
        {page==="profile" &&<Profile topics={topics} qh={qh} setTopics={setTopics}/>}
      </div>

      <nav style={{flexShrink:0,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"10px 0 20px",background:"rgba(8,8,8,0.97)",backdropFilter:"blur(32px)"}}>
        {NAV.map(n=>{
          const a=page===n.id;
          return(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"4px 14px",color:a?"#fff":"rgba(255,255,255,0.22)",transition:"color .15s"}}>
              {n.icon(a)}
              <span style={{fontFamily:F.sans,fontSize:10,fontWeight:a?700:400,letterSpacing:.5}}>{n.label}</span>
              <div style={{width:4,height:4,borderRadius:"50%",background:a?"#fff":"transparent",transition:"background .2s"}}/>
            </button>
          );
        })}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes floatTri{0%,100%{transform:translateY(0) rotate(0);opacity:.6}50%{transform:translateY(-2px) rotate(2deg);opacity:1}}
        @keyframes spinTri{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotP{0%,80%,100%{transform:scale(.55);opacity:.18}40%{transform:scale(1.35);opacity:1}}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        *::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}
        input,textarea{color-scheme:dark;}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.18);font-family:"Geist","DM Sans",sans-serif;}
        textarea{resize:none;}
        button{transition:opacity .15s,transform .12s;}
        button:active{opacity:.6!important;transform:scale(.95)!important;}
      `}</style>
    </div>
  );
}
