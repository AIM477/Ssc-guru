import { useState, useRef, useEffect } from "react";

const mem = {};
const db = {
  get: k => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : mem[k] ?? null; } catch { return mem[k] ?? null; } },
  set: (k, v) => { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function Tri({ size = 20, spin = false, color = "#0D0D0D" }) {
  const c = size / 2, r = size * 0.38;
  const pts = [0, 1, 2].map(i => { const a = (i * 120 - 90) * Math.PI / 180; return `${+(c + r * Math.cos(a)).toFixed(2)},${+(c + r * Math.sin(a)).toFixed(2)}`; }).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", flexShrink: 0, animation: spin ? "triSpin 0.9s linear infinite" : "triFloat 5s ease-in-out infinite" }}>
      <polygon points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const SUBJ = {
  math:  { n: "Mathematics", s: "Math", e: "M", t: ["Number System","Percentage","Ratio & Proportion","Simple Interest","Compound Interest","Profit & Loss","Time & Work","Speed Time Distance","Geometry","Trigonometry","Algebra","Statistics"] },
  eng:   { n: "English", s: "Eng", e: "E", t: ["Reading Comprehension","Fill in Blanks","Error Spotting","Synonyms","Antonyms","Idioms & Phrases","One Word Sub.","Active/Passive","Sentence Improvement","Cloze Test"] },
  gk:    { n: "General Knowledge", s: "GK", e: "G", t: ["Indian History","Geography","Polity","Economics","Physics","Chemistry","Biology","Current Affairs","Sports","Books & Authors","Dates","Art & Culture"] },
  logic: { n: "Reasoning", s: "Logic", e: "R", t: ["Analogy","Series","Blood Relations","Direction","Seating Arrangement","Coding-Decoding","Syllogism","Matrix","Venn Diagrams","Statement & Conclusion"] },
};

const QDB = {
  math: [
    { q: "20% discount ke baad ₹800 mila. Marked price?", o: ["₹900","₹960","₹1000","₹1050"], a: 2, exp: "MP × 0.8 = 800 → MP = ₹1000", c: "SP = MP(1 − D/100)", t: "Profit & Loss", d: "easy" },
    { q: "A 12 din mein, B 15 din mein kaam karta hai. Milkar?", o: ["6.5 din","6.67 din","7 din","5 din"], a: 1, exp: "ab/(a+b) = 180/27 ≈ 6.67", c: "Together = ab/(a+b)", t: "Time & Work", d: "medium" },
    { q: "15% of 240 + 25% of 160 = ?", o: ["72","76","78","80"], a: 1, exp: "36 + 40 = 76", c: "X% of Y = XY/100", t: "Percentage", d: "easy" },
    { q: "₹5000, 2 saal, 10% p.a. CI?", o: ["₹1000","₹1050","₹1100","₹1500"], a: 1, exp: "5000[(1.1)²−1] = ₹1050", c: "CI = P[(1+R/100)ᵀ−1]", t: "Compound Interest", d: "medium" },
    { q: "x² − 5x + 6 = 0 ke roots?", o: ["2,3","1,6","2,4","3,4"], a: 0, exp: "(x−2)(x−3) = 0", c: "product=c, sum=−b", t: "Algebra", d: "easy" },
    { q: "72km/h se 200m bridge cross. Train=100m. Time?", o: ["10s","15s","20s","25s"], a: 1, exp: "300m ÷ 20m/s = 15s", c: "Dist = Bridge + Train", t: "Speed & Time", d: "medium" },
  ],
  eng: [
    { q: "'Ameliorate' ka matlab?", o: ["Worsen","Improve","Ignore","Delay"], a: 1, exp: "Latin melior = better", c: "Root: Melior = better", t: "Synonyms", d: "medium" },
    { q: "Error: 'Each of the boys have completed their work.'", o: ["Each of","the boys","have completed","their work"], a: 2, exp: "Each = singular → 'has completed'", c: "Each/Every → singular verb", t: "Error Spotting", d: "medium" },
    { q: "'Bite the bullet' ka matlab?", o: ["Kuch khaana","Endure bravely","Dar jaana","Refuse"], a: 1, exp: "Endure pain with courage", c: "Bullet=pain, bite=accept!", t: "Idioms", d: "easy" },
    { q: "Passive: 'They are building a bridge.'", o: ["was being built","is being built","has been built","will be built"], a: 1, exp: "Pres. Cont. Passive = is being + V3", c: "Pres Cont → is being + V3", t: "Active/Passive", d: "medium" },
    { q: "Antonym of 'Verbose'?", o: ["Talkative","Concise","Loud","Boring"], a: 1, exp: "Verbose=many words. Concise=brief.", c: "CAVE: Concise Antonym Verbose Easy", t: "Antonyms", d: "easy" },
  ],
  gk: [
    { q: "Bharat ka pehla Governor General?", o: ["Mountbatten","Lord Canning","Warren Hastings","Cornwallis"], a: 2, exp: "Warren Hastings 1773–1785", c: "W pehla → Warren Hastings GG!", t: "History", d: "easy" },
    { q: "Rajya Sabha ke liye minimum age?", o: ["21","25","30","35"], a: 2, exp: "RS = 30 saal", c: "RS=30 · LS=25 · President=35", t: "Polity", d: "easy" },
    { q: "'Discovery of India' kisne likhi?", o: ["Gandhi","Nehru","Tagore","Ambedkar"], a: 1, exp: "Nehru, 1944, Ahmednagar jail", c: "Nehru → Discovery of India", t: "Books", d: "easy" },
    { q: "India ki sabse badi freshwater lake?", o: ["Dal","Chilika","Wular","Loktak"], a: 2, exp: "Wular Lake, J&K", c: "Freshwater=Wular · Brackish=Chilika", t: "Geography", d: "medium" },
    { q: "Vitamin C ki kami se?", o: ["Rickets","Scurvy","Night blindness","Beriberi"], a: 1, exp: "Vitamin C → Scurvy", c: "A=Night blind · C=Scurvy · D=Rickets", t: "Science", d: "easy" },
  ],
  logic: [
    { q: "2, 6, 12, 20, 30, __?", o: ["40","42","44","45"], a: 1, exp: "+4,+6,+8,+10,+12 → 42", c: "Difference series: gap +2 badhta", t: "Series", d: "easy" },
    { q: "Ramesh ki maa ke bhai ki beti ka rishta?", o: ["Mausi","Cousin","Behen","Nani"], a: 1, exp: "Mama ki beti = Cousin", c: "Family tree banao!", t: "Blood Relations", d: "medium" },
    { q: "N 5km → E 3km → S 5km. Distance from start?", o: ["3km E","3km W","0km","8km"], a: 0, exp: "N+S cancel → 3km East", c: "Opposite directions cancel!", t: "Direction", d: "medium" },
    { q: "1, 4, 9, 16, 25, __?", o: ["30","36","49","35"], a: 1, exp: "n²: 6²=36", c: "Perfect squares series!", t: "Series", d: "easy" },
    { q: "ROSE=6821, CHAIR=73456. REACH=?", o: ["68473","68374","64873","86473"], a: 0, exp: "R=6,E=8,A=4,C=7,H=3", c: "Table banao: har letter ka code", t: "Coding", d: "hard" },
  ],
};

const KB = {
  percent: `**PERCENTAGE — Master Tricks**\n\nRule #1:\n→ X% of Y = Y% of X\n18% of 50 = 50% of 18 = **9** ✓\n\nKey fractions:\n10%=1/10 · 25%=1/4 · 33%=1/3\n\nSuccessive %:\nA then B = A+B+AB/100\n20% up → 20% down = **−4% loss**\n\n5 questions daily = master in 2 weeks! 💪`,
  profit: `**PROFIT & LOSS — Shortcuts**\n\nProfit% = (Profit/CP) × 100\nSP = CP × (100+P%)/100\n\n**Same SP trick (SSC gold):**\nP% profit + P% loss = always LOSS\nLoss% = **(P/10)²**\nEx: 20%+20% → Loss = 4%\n\nFake weight:\n900g sold as 1kg → **11.11% profit**\n\nYeh 2 tricks = guaranteed marks! 🔥`,
  work: `**TIME & WORK**\n\nA+B together = **ab/(a+b)** days\nEx: A=12, B=15 → **6.67 days**\n\nPipes: same formula\nFill(+), Empty(−)\n\n4 questions daily → perfect! 💪`,
  interest: `**SI & CI**\n\nSI = PRT/100\nCI = P(1+R/100)ᵀ − P\n\n**2-year shortcut (SSC gold):**\nCI − SI = P × **(R/100)²**\nEx: P=10000, R=10% → **₹100**\n\nYaad karo = guaranteed question! 🎯`,
  english: `**ENGLISH — Top Rules**\n\n**Subject-Verb:**\nEach/Every/Either/Neither → **Singular**\n\n**Prepositions:**\nAddicted TO · Afraid OF · Agree WITH\nAngry WITH (person) · Apologize FOR\n\n**Errors:**\n"Despite of" ❌ → "Despite" ✓\n"Although…but" ❌ → use one only ✓\n\n10 errors daily = strong in 1 month! 🔥`,
  gk: `**GK — Must Know**\n\nHistory: 1757 Plassey · 1857 Revolt\n1885 INC · 1930 Dandi · 1947 Independence\n\nPolity: FR=Art 12–35 · DPSP=36–51\nLS=543 · RS=245\n\nVitamins:\nA=Night blind · C=Scurvy · D=Rickets\n\n2 facts per topic daily! 📚`,
  reasoning: `**REASONING — Patterns**\n\nSeries types:\n• Arithmetic: same gap (+3+3)\n• Geometric: multiply (×2×2)\n• Difference: gap grows (+2+4+6)\n\nBlood Relations:\nAlways draw family tree!\n\nDirection:\nDraw X-Y axis. Opposites cancel!\n\nCoding: Make letter table first! 💪`,
  plan: `**Aaj Ka Plan**\n\nMorning (2hrs):\n• 1hr — Math (weak topics)\n• 1hr — GK (Lucent 2 chapters)\n\nAfternoon (2hrs):\n• 1hr — English grammar\n• 1hr — Reasoning mixed\n\nEvening (1hr):\n• 30min — PYQ practice\n• 30min — Quiz attempt\n\nConsistency > Intensity! 🔥`,
  weak: `**Weak → Strong System**\n\n5 steps:\n1. Concept samjho (ratta nahi)\n2. 5 solved examples dekho\n3. 5 khud solve karo\n4. Galti analyze karo\n5. Agle din repeat karo\n\nResources:\nMath → Abhinay Sharma YouTube\nEnglish → Neetu Singh notes\nGK → Lucent GK\nReasoning → MK Pandey\n\nTu kar sakta hai! 💪`,
  def: [`Specific topic batao!\n• Percentage shortcut\n• Blood relation\n• English errors\n• Study plan\n\nPoochh bata! 🎯`, `Kaunsa chapter confuse kar raha?\nMain explain karunga:\n→ Concept → Formula → Shortcut\n\nBata kya problem hai! 🔥`],
};

function guruReply(q, weak) {
  const t = q.toLowerCase();
  let r = "";
  if (/percent|%/.test(t)) r = KB.percent;
  else if (/profit|loss|discount/.test(t)) r = KB.profit;
  else if (/work|pipe/.test(t)) r = KB.work;
  else if (/interest|si\b|ci\b|compound/.test(t)) r = KB.interest;
  else if (/english|grammar|verb|error|preposition|idiom/.test(t)) r = KB.english;
  else if (/gk|history|polity|geography|science/.test(t)) r = KB.gk;
  else if (/reason|series|blood|direction|coding/.test(t)) r = KB.reasoning;
  else if (/plan|schedule|aaj|padh/.test(t)) r = KB.plan;
  else if (/weak|improve|help|kaise|strong/.test(t)) r = KB.weak;
  else r = KB.def[Math.floor(Math.random() * KB.def.length)];
  if (weak.length && Math.random() > .5) r += `\n\n**Tera weak area:** ${weak.join(" & ")} — extra focus karo! 💪`;
  return r;
}

const TEACHERS = [
  { id:"ry", name:"Rakesh Yadav", sub:"Mathematics", tag:"Shortcuts King", n:"2M+", r:4.9, p:499, d:"India's #1 SSC Math teacher. Speed tricks aur shortcuts ka legend." },
  { id:"ab", name:"Abhinay Sharma", sub:"Mathematics", tag:"Profit Loss Guru", n:"3M+", r:4.9, p:549, d:"Percentage, Profit/Loss, Time-Work master. Most-loved math teacher." },
  { id:"ns", name:"Neetu Singh", sub:"English", tag:"Grammar Expert", n:"1.5M+", r:4.8, p:399, d:"KD Campus top faculty. Grammar aur error spotting ka best approach." },
  { id:"mk", name:"MK Pandey", sub:"Reasoning", tag:"Logic Master", n:"1M+", r:4.7, p:349, d:"Analytical Reasoning gold standard. Pattern recognition master." },
  { id:"lu", name:"Lucent GK Team", sub:"General Knowledge", tag:"GK Bible", n:"5M+", r:4.9, p:299, d:"Complete SSC GK in one book. Complete it once — set ho jao." },
  { id:"rm", name:"Rani Mam", sub:"English", tag:"RC Specialist", n:"800K+", r:4.7, p:449, d:"Reading comprehension aur error detection specialist." },
];

const T = {
  bg: "#F7F7F7", white: "#FFFFFF", ink: "#0D0D0D", mid: "#888",
  line: "#E8E8E8", fill: "#F2F2F2", green: "#16A34A", red: "#DC2626", amber: "#D97706",
  serif: '"Playfair Display", Georgia, serif',
  sans: '"DM Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

const Track = ({ v, max = 100, color = T.ink, h = 5 }) => (
  <div style={{ height: h, background: T.line, borderRadius: 99 }}>
    <div style={{ height: "100%", width: `${Math.min(100, max > 0 ? (v / max) * 100 : 0)}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
  </div>
);

const Pill = ({ children, color = T.mid, bg = T.fill }) => (
  <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, letterSpacing: .6, textTransform: "uppercase", color, background: bg, padding: "3px 9px", borderRadius: 20 }}>{children}</span>
);

const BBtn = ({ children, onClick, disabled, sm }) => (
  <button onClick={onClick} disabled={disabled} style={{ width: sm ? "auto" : "100%", background: disabled ? T.line : T.ink, color: disabled ? T.mid : "#fff", border: "none", borderRadius: 13, padding: sm ? "11px 20px" : "16px 24px", fontFamily: T.sans, fontWeight: 700, fontSize: sm ? 14 : 16, cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : "0 4px 18px rgba(0,0,0,.16)", transition: "all .15s" }}>{children}</button>
);

const Card = ({ children, style: s }) => (
  <div style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 16, padding: "16px 18px", ...s }}>{children}</div>
);

// ── HOME ──
function Home({ topics, qh, goTo }) {
  const total = Object.values(SUBJ).reduce((a, s) => a + s.t.length, 0);
  const done = Object.values(topics).flat().filter(Boolean).length;
  const pct = Math.round((done / total) * 100);
  const avgs = {};
  Object.entries(qh).forEach(([k, sc]) => { if (sc.length) avgs[k] = Math.round(sc.reduce((a, s) => a + (s.score / s.total) * 100, 0) / sc.length); });
  const weak = Object.entries(avgs).filter(([, v]) => v < 60).map(([k]) => k);
  const strong = Object.entries(avgs).filter(([, v]) => v >= 75).map(([k]) => k);
  const tests = Object.values(qh).flat().length;
  const gAvg = Object.values(avgs).length ? Math.round(Object.values(avgs).reduce((a, b) => a + b, 0) / Object.values(avgs).length) : null;
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
  const next = [];
  Object.entries(SUBJ).forEach(([k, s]) => { const i = s.t.findIndex((_, idx) => !topics[k]?.[idx]); if (i !== -1) next.push({ k, topic: s.t[i], isWeak: weak.includes(k) }); });

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Hero */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.mid, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{greet}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <h1 style={{ fontFamily: T.serif, fontSize: 38, fontWeight: 700, color: T.ink, lineHeight: 1.1, margin: 0 }}>Your<br />Progress</h1>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: T.serif, fontSize: 68, fontWeight: 700, color: T.ink, lineHeight: .9, letterSpacing: -2 }}>{pct}</div>
            <div style={{ fontFamily: T.sans, fontSize: 14, color: T.mid, marginTop: 4 }}>% done</div>
          </div>
        </div>
        <Track v={pct} h={6} />
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.mid, marginTop: 8 }}>{done} of {total} topics completed</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {[{ v: `${done}/${total}`, l: "Topics Done" }, { v: tests || 0, l: "Tests Taken" }, { v: gAvg != null ? `${gAvg}%` : "—", l: "Quiz Average" }, { v: "7 🔥", l: "Day Streak" }].map(({ v, l }) => (
          <Card key={l} style={{ padding: "18px 16px" }}>
            <div style={{ fontFamily: T.serif, fontSize: 30, fontWeight: 700, color: T.ink, marginBottom: 6 }}>{v}</div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.mid, letterSpacing: .6, textTransform: "uppercase" }}>{l}</div>
          </Card>
        ))}
      </div>

      {/* Subjects */}
      <div style={{ marginBottom: 10, fontFamily: T.serif, fontSize: 24, fontWeight: 700, color: T.ink }}>Subjects</div>
      <div style={{ marginBottom: 28 }}>
        {Object.entries(SUBJ).map(([k, s]) => {
          const d2 = topics[k]?.filter(Boolean).length || 0, p2 = Math.round((d2 / s.t.length) * 100);
          const avg = avgs[k], isW = weak.includes(k), isS = strong.includes(k);
          return (
            <Card key={k} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, background: T.ink, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{s.e}</div>
                  <div>
                    <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: T.ink }}>{s.n}</div>
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: T.mid }}>{d2}/{s.t.length} topics</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isW && <Pill color={T.red} bg="#FEF2F2">Weak</Pill>}
                  {isS && <Pill color={T.green} bg="#F0FDF4">Strong</Pill>}
                  {avg != null && <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: avg >= 75 ? T.green : avg >= 60 ? T.amber : T.red }}>{avg}%</span>}
                </div>
              </div>
              <Track v={p2} color={isW ? T.red : isS ? T.green : T.ink} h={4} />
            </Card>
          );
        })}
      </div>

      {/* Focus */}
      {weak.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 700, color: T.ink, marginBottom: 14 }}>⚠️ Focus Areas</div>
          {weak.map(k => (
            <div key={k} style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.red, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: T.red }}>{SUBJ[k].n}</div>
                <div style={{ fontFamily: T.sans, fontSize: 13, color: "#B91C1C" }}>Avg {avgs[k]}% — Guru se poochh!</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Next */}
      <div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Continue From</div>
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
        {next.slice(0, 4).map((nt, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", borderBottom: i < 3 ? `1px solid ${T.line}` : "none" }}>
            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mid, width: 20, flexShrink: 0 }}>0{i + 1}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.ink }}>{nt.topic}</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.mid }}>{SUBJ[nt.k].n}</div>
            </div>
            {nt.isWeak && <Pill color={T.red} bg="#FEF2F2">Priority</Pill>}
          </div>
        ))}
      </Card>
      <BBtn onClick={() => goTo("plan")}>Generate AI Study Plan →</BBtn>
    </div>
  );
}

// ── GURU ──
function Guru({ qh }) {
  const [msgs, setMsgs] = useState([{ role: "ai", text: "Hey! Main Guru hoon — tera SSC AI coach. 🎯\n\nFormulas, shortcuts, strategies — sab mere paas hai.\n\nKya poochha hai aaj?" }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const botRef = useRef(null);
  const taRef = useRef(null);
  useEffect(() => { botRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking]);

  const avgs = {};
  Object.entries(qh).forEach(([k, sc]) => { if (sc.length) avgs[k] = Math.round(sc.reduce((a, s) => a + (s.score / s.total) * 100, 0) / sc.length); });
  const weakNames = Object.entries(avgs).filter(([, v]) => v < 60).map(([k]) => SUBJ[k]?.n || k);

  function send(txt) {
    const q = (txt || input).trim();
    if (!q || thinking) return;
    setInput(""); if (taRef.current) taRef.current.style.height = "auto";
    setMsgs(p => [...p, { role: "user", text: q }]);
    setThinking(true);
    setTimeout(() => { setMsgs(p => [...p, { role: "ai", text: guruReply(q, weakNames) }]); setThinking(false); }, 700 + Math.random() * 600);
  }

  const renderMd = text => text.split("\n").map((line, li) => (
    <div key={li} style={{ marginBottom: line === "" ? 6 : 0 }}>
      {line.split(/(\*\*[^*]+\*\*)/).map((seg, si) =>
        seg.startsWith("**") && seg.endsWith("**")
          ? <strong key={si} style={{ color: T.ink }}>{seg.slice(2, -2)}</strong> : seg
      )}
    </div>
  ));

  const sugg = ["Percentage shortcut", "Math mein weak hoon", "English grammar", "Aaj ka plan", "GK topics", "Reasoning tricks"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 132px)" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 18, flexDirection: m.role === "user" ? "row-reverse" : "row", animation: "msgIn .3s ease" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: m.role === "ai" ? T.ink : T.fill, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {m.role === "ai" ? <Tri size={14} color="#fff" /> : <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mid }}>U</span>}
            </div>
            <div style={{ maxWidth: "76%", background: m.role === "ai" ? T.white : T.ink, color: m.role === "ai" ? T.ink : "#fff", padding: "13px 16px", borderRadius: m.role === "ai" ? "4px 16px 16px 16px" : "16px 4px 16px 16px", fontFamily: T.sans, fontSize: 15, lineHeight: 1.85, border: m.role === "ai" ? `1px solid ${T.line}` : "none", whiteSpace: "pre-wrap" }}>
              {renderMd(m.text)}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: "flex", gap: 10, marginBottom: 18, animation: "msgIn .3s ease" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Tri size={14} color="#fff" spin />
            </div>
            <div style={{ background: T.white, border: `1px solid ${T.line}`, padding: "14px 18px", borderRadius: "4px 16px 16px 16px", display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontFamily: T.sans, fontSize: 13, color: T.mid, fontStyle: "italic", marginRight: 4 }}>Thinking</span>
              {[0, .2, .4].map((d, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.mid, display: "inline-block", animation: `dotPop 1.4s ${d}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={botRef} />
      </div>

      {msgs.length <= 1 && !thinking && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12 }}>
          {sugg.map(s => <button key={s} onClick={() => send(s)} style={{ background: T.white, color: T.ink, fontFamily: T.sans, fontSize: 13, fontWeight: 500, padding: "9px 14px", borderRadius: 20, border: `1px solid ${T.line}`, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>{s}</button>)}
        </div>
      )}

      <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "5px 5px 5px 16px", display: "flex", gap: 8, alignItems: "flex-end", boxShadow: "0 4px 20px rgba(0,0,0,.07)" }}>
        <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
          placeholder="Kuch bhi poochh Guru se…" rows={1}
          style={{ flex: 1, background: "transparent", border: "none", color: T.ink, fontFamily: T.sans, fontSize: 15, lineHeight: 1.6, padding: "11px 0", outline: "none", resize: "none" }} />
        <button onClick={() => send()} disabled={thinking || !input.trim()} style={{ width: 40, height: 40, borderRadius: 11, border: "none", background: input.trim() && !thinking ? T.ink : T.fill, color: input.trim() && !thinking ? "#fff" : T.mid, cursor: thinking || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
        </button>
      </div>
      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.mid, textAlign: "center", marginTop: 6 }}>Enter to send · Shift+Enter new line</div>
    </div>
  );
}

// ── QUIZ ──
function Quiz({ onScore }) {
  const [sc, setSc] = useState("pick");
  const [type, setType] = useState("full");
  const [subj, setSubj] = useState("math");
  const [qs, setQs] = useState([]);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [res, setRes] = useState([]);

  const start = () => { let p = type === "full" ? Object.values(QDB).flat() : QDB[subj]; p = [...p].sort(() => Math.random() - .5).slice(0, 10); setQs(p); setQi(0); setSel(null); setRes([]); setSc("test"); };
  const next = () => { const r = [...res, { q: qs[qi], sel, ok: sel === qs[qi].a }]; if (qi + 1 >= qs.length) { onScore(type === "full" ? "math" : subj, r.filter(x => x.ok).length, qs.length); setRes(r); setSc("result"); } else { setRes(r); setQi(i => i + 1); setSel(null); } };
  const DC = { easy: T.green, medium: T.amber, hard: T.red };

  if (sc === "pick") return (
    <div style={{ paddingBottom: 40 }}>
      <h1 style={{ fontFamily: T.serif, fontSize: 34, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Mock Test</h1>
      <div style={{ fontFamily: T.sans, fontSize: 14, color: T.mid, marginBottom: 24 }}>Choose format and start practicing</div>
      <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.mid, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Format</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {["full", "chapter"].map(v => (
          <div key={v} onClick={() => setType(v)} style={{ background: type === v ? T.ink : T.white, borderRadius: 14, padding: "20px 16px", cursor: "pointer", border: `1.5px solid ${type === v ? T.ink : T.line}`, transition: "all .15s" }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{v === "full" ? "📋" : "📖"}</div>
            <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: type === v ? "#fff" : T.ink }}>{v === "full" ? "Full Mock" : "Chapter"}</div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: type === v ? "rgba(255,255,255,.6)" : T.mid, marginTop: 3 }}>{v === "full" ? "All subjects" : "Subject wise"}</div>
          </div>
        ))}
      </div>
      {type === "chapter" && (
        <>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.mid, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Subject</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {Object.entries(SUBJ).map(([k, s]) => (
              <div key={k} onClick={() => setSubj(k)} style={{ background: subj === k ? T.ink : T.white, borderRadius: 13, padding: "14px 16px", cursor: "pointer", border: `1.5px solid ${subj === k ? T.ink : T.line}`, transition: "all .15s" }}>
                <div style={{ width: 28, height: 28, background: subj === k ? "#fff" : T.fill, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: subj === k ? T.ink : T.mid, marginBottom: 8 }}>{s.e}</div>
                <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: subj === k ? "#fff" : T.ink }}>{s.n}</div>
              </div>
            ))}
          </div>
        </>
      )}
      <BBtn onClick={start}>Start Test →</BBtn>
    </div>
  );

  if (sc === "result") {
    const score = res.filter(x => x.ok).length, pct = Math.round((score / res.length) * 100);
    const byT = {};
    res.forEach(r => { byT[r.q.t] = byT[r.q.t] || { c: 0, n: 0 }; byT[r.q.t].n++; if (r.ok) byT[r.q.t].c++; });
    return (
      <div style={{ paddingBottom: 40 }}>
        <Card style={{ textAlign: "center", padding: "30px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚"}</div>
          <div style={{ fontFamily: T.serif, fontSize: 72, fontWeight: 700, color: T.ink, lineHeight: .9, letterSpacing: -2 }}>{score}<span style={{ fontSize: 36, color: T.mid }}>/{res.length}</span></div>
          <div style={{ fontFamily: T.sans, fontSize: 22, fontWeight: 700, color: pct >= 80 ? T.green : pct >= 60 ? T.amber : T.red, margin: "12px 0 6px" }}>{pct}%</div>
          <div style={{ fontFamily: T.sans, fontSize: 14, color: T.mid }}>{pct >= 80 ? "Zabardast! Keep this up 🔥" : pct >= 60 ? "Good — push harder!" : "Review corrections aur retry karo!"}</div>
        </Card>
        <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Topic Breakdown</div>
        {Object.entries(byT).map(([t, { c, n }]) => (
          <Card key={t} style={{ marginBottom: 10, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.ink }}>{t}</span>
              <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: c / n >= .6 ? T.green : T.red }}>{c}/{n}</span>
            </div>
            <Track v={c} max={n} color={c / n >= .6 ? T.green : T.red} h={4} />
          </Card>
        ))}
        {res.filter(x => !x.ok).length > 0 && (
          <>
            <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.ink, margin: "20px 0 12px" }}>Corrections</div>
            {res.filter(x => !x.ok).map((r, i) => (
              <div key={i} style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 13, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ fontFamily: T.sans, fontSize: 15, color: T.red, marginBottom: 8, lineHeight: 1.6 }}>{r.q.q}</div>
                <div style={{ fontFamily: T.sans, fontSize: 14, color: T.green, fontWeight: 700, marginBottom: 4 }}>✓ {r.q.o[r.q.a]}</div>
                <div style={{ fontFamily: T.sans, fontSize: 13, color: T.mid }}>💡 {r.q.c}</div>
              </div>
            ))}
          </>
        )}
        <div style={{ marginTop: 20 }}><BBtn onClick={() => setSc("pick")}>New Test</BBtn></div>
      </div>
    );
  }

  const q = qs[qi];
  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 7 }}>
          <Pill>{q.t}</Pill>
          <Pill color={DC[q.d]} bg={DC[q.d] + "18"}>{q.d}</Pill>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 13, color: T.mid, fontWeight: 600 }}>{qi + 1}/{qs.length}</span>
      </div>
      <Track v={qi} max={qs.length} h={5} />
      <div style={{ fontFamily: T.sans, fontSize: 19, color: T.ink, lineHeight: 1.65, margin: "22px 0", fontWeight: 600 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.o.map((opt, i) => {
          const isA = i === q.a, isS = i === sel;
          let bg = T.white, col = T.ink, border = `1.5px solid ${T.line}`;
          if (sel !== null) {
            if (isA) { bg = "#F0FDF4"; col = T.green; border = "1.5px solid #86EFAC"; }
            else if (isS) { bg = "#FEF2F2"; col = T.red; border = "1.5px solid #FECACA"; }
            else { bg = T.fill; col = T.mid; }
          }
          return (
            <div key={i} onClick={() => sel === null && setSel(i)} style={{ background: bg, border, borderRadius: 13, padding: "15px 18px", cursor: sel !== null ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .18s", fontFamily: T.sans, fontSize: 16, color: col, fontWeight: isA && sel !== null ? 700 : 500 }}>
              <span><span style={{ fontFamily: T.mono, fontSize: 12, marginRight: 12, opacity: .4 }}>{String.fromCharCode(65 + i)}.</span>{opt}</span>
              {sel !== null && isA && <span>✓</span>}
              {sel !== null && isS && !isA && <span>✗</span>}
            </div>
          );
        })}
      </div>
      {sel !== null && (
        <>
          <div style={{ marginTop: 16, background: T.fill, borderRadius: 13, padding: "16px 18px" }}>
            <div style={{ fontFamily: T.sans, fontSize: 15, color: T.ink, lineHeight: 1.7, marginBottom: 6 }}><strong>Explanation: </strong>{q.exp}</div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.mid }}>💡 {q.c}</div>
          </div>
          <div style={{ marginTop: 12 }}><BBtn onClick={next}>{qi + 1 >= qs.length ? "See Results →" : "Next →"}</BBtn></div>
        </>
      )}
    </div>
  );
}

// ── PLAN ──
function Plan({ qh }) {
  const [hours, setH] = useState(4);
  const [done, setDone] = useState({});
  const [plan, setPlan] = useState(null);
  const [tmr, setTmr] = useState(null);
  const [on, setOn] = useState(false);
  const [lbl, setLbl] = useState("");
  const ref = useRef(null);
  useEffect(() => { if (on && tmr > 0) { ref.current = setTimeout(() => setTmr(t => t - 1), 1000); } else if (tmr === 0) setOn(false); return () => clearTimeout(ref.current); }, [on, tmr]);

  const avgs = {};
  Object.entries(qh).forEach(([k, sc]) => { if (sc.length) avgs[k] = Math.round(sc.reduce((a, s) => a + (s.score / s.total) * 100, 0) / sc.length); });
  const weak = Object.entries(avgs).filter(([, v]) => v < 60).map(([k]) => k);

  const POOL = {
    math: [{ task: "Percentage: 15 questions — swap trick practice", time: 40, type: "practice", tip: "X% of Y = Y% of X fastest method" }, { task: "Profit & Loss: Same SP trick + fake weight", time: 30, type: "learn", tip: "Loss% = (P/10)² yaad karo" }, { task: "Time & Work: ab/(a+b) 10 questions", time: 35, type: "practice", tip: "Efficiency method bhi try karo" }],
    eng: [{ task: "Subject-Verb Agreement: 10 error spotting", time: 35, type: "practice", tip: "Each/Every → singular hamesha" }, { task: "Top 50 Idioms with meanings", time: 40, type: "learn", tip: "Story technique for each idiom" }, { task: "Prepositions: addicted to, afraid of", time: 30, type: "practice", tip: "Despite = no 'of' after it" }],
    gk: [{ task: "History: 1857–1947 key events", time: 30, type: "learn", tip: "Story method for dates" }, { task: "Polity: Articles 12–51 revision", time: 35, type: "revise", tip: "FR=12-35, DPSP=36-51" }, { task: "Science: Vitamins + Diseases", time: 25, type: "revise", tip: "A,C,D,B12 — one line each" }],
    logic: [{ task: "Number Series: 20 mixed questions", time: 30, type: "practice", tip: "Find type first: arith/geo/diff" }, { task: "Blood Relations: 10 family tree", time: 25, type: "practice", tip: "Draw the tree ALWAYS" }],
  };

  function generate() {
    const slots = Math.min(8, Math.round(hours * 1.4));
    const order = [...new Set([...weak, "math", "eng", "gk", "logic"])];
    const tasks = [];
    for (let i = 0; i < slots; i++) { const k = order[i % order.length]; const pool = POOL[k] || []; if (pool.length) tasks.push({ ...pool[i % pool.length], subject: SUBJ[k]?.n || k }); }
    setPlan({ greeting: weak.length > 0 ? `${weak.map(w => SUBJ[w]?.n || w).join(" & ")} pe aaj focus karo — yahi rank badlega.` : `${hours} hours solid karo aaj. Consistency compounds. 🔥`, tasks, endNote: "Complete kiya toh kal aur easy hoga. Chalo shuru!" });
    setDone({});
  }

  const mm = tmr != null ? String(Math.floor(tmr / 60)).padStart(2, "0") : "--";
  const ss2 = tmr != null ? String(tmr % 60).padStart(2, "0") : "--";
  const dc = Object.values(done).filter(Boolean).length;
  const TC = { learn: "#2563EB", practice: T.ink, revise: T.mid };

  return (
    <div style={{ paddingBottom: 40 }}>
      {tmr != null && (
        <div style={{ background: T.ink, borderRadius: 16, padding: "18px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{lbl.slice(0, 26)}{lbl.length > 26 ? "…" : ""}</div>
            <div style={{ fontFamily: T.serif, fontSize: 48, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{mm}:{ss2}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setOn(r => !r)} style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#fff", borderRadius: 10, padding: "10px 16px", fontFamily: T.sans, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>{on ? "Pause" : "Resume"}</button>
            <button onClick={() => { setTmr(null); setOn(false); }} style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 17 }}>✕</button>
          </div>
        </div>
      )}
      <h1 style={{ fontFamily: T.serif, fontSize: 34, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Study Plan</h1>
      <div style={{ fontFamily: T.sans, fontSize: 14, color: T.mid, marginBottom: 24 }}>Smart plan based on your weak areas</div>
      <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.mid, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Available Today</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[2, 3, 4, 5, 6, 8].map(h => (
          <button key={h} onClick={() => setH(h)} style={{ flex: 1, padding: "12px 0", borderRadius: 11, border: `1.5px solid ${hours === h ? T.ink : T.line}`, background: hours === h ? T.ink : T.white, color: hours === h ? "#fff" : T.mid, fontFamily: T.sans, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .15s" }}>{h}h</button>
        ))}
      </div>
      <BBtn onClick={generate}>{plan ? "Regenerate ↺" : "Generate Plan →"}</BBtn>
      {plan && (
        <>
          <div style={{ margin: "24px 0 20px", paddingLeft: 16, borderLeft: `3px solid ${T.ink}` }}>
            <div style={{ fontFamily: T.sans, fontSize: 15, color: T.ink, lineHeight: 1.7 }}>{plan.greeting}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.mid, letterSpacing: 1, textTransform: "uppercase" }}>Tasks</div>
            <span style={{ fontFamily: T.mono, fontSize: 13, color: T.mid }}>{dc}/{plan.tasks.length}</span>
          </div>
          <Track v={dc} max={plan.tasks.length} h={5} />
          <div style={{ marginTop: 14 }}>
            {plan.tasks.map((t, i) => {
              const d = done[i];
              return (
                <Card key={i} style={{ marginBottom: 10, opacity: d ? .45 : 1, transition: "opacity .2s" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setDone(x => ({ ...x, [i]: !x[i] }))} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${d ? T.green : T.line}`, background: d ? "#F0FDF4" : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.green }}>{d ? "✓" : ""}</button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                        <Pill color={TC[t.type] || T.ink} bg={(TC[t.type] || T.ink) + "18"}>{t.type}</Pill>
                        <Pill>{t.time}min</Pill>
                        <Pill>{t.subject}</Pill>
                      </div>
                      <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 600, color: d ? T.mid : T.ink, textDecoration: d ? "line-through" : "none", marginBottom: 6, lineHeight: 1.5 }}>{t.task}</div>
                      <div style={{ fontFamily: T.sans, fontSize: 13, color: T.mid }}>💡 {t.tip}</div>
                      {!d && <button onClick={() => { setTmr(t.time * 60); setOn(true); setLbl(t.task); }} style={{ marginTop: 8, background: "none", border: "none", color: T.mid, fontFamily: T.sans, fontSize: 13, cursor: "pointer", padding: 0 }}>▶ Start timer</button>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 14, color: T.mid, textAlign: "center", fontStyle: "italic", marginTop: 20 }}>{plan.endNote}</div>
        </>
      )}
    </div>
  );
}

// ── PROFILE ──
function Profile({ topics, qh, setTopics }) {
  const [tab, setTab] = useState("overview");
  const [notes, setNotes] = useState(() => db.get("notes") || []);
  const [nn, setNn] = useState({ subj: "math", title: "", content: "" });
  const [syl, setSyl] = useState("math");
  const [bought, setBought] = useState(() => db.get("bought") || []);

  const total = Object.values(SUBJ).reduce((a, s) => a + s.t.length, 0);
  const done = Object.values(topics).flat().filter(Boolean).length;
  const tests = Object.values(qh).flat().length;
  const avgs = {};
  Object.entries(qh).forEach(([k, sc]) => { if (sc.length) avgs[k] = Math.round(sc.reduce((a, s) => a + (s.score / s.total) * 100, 0) / sc.length); });
  const gAvg = Object.values(avgs).length ? Math.round(Object.values(avgs).reduce((a, b) => a + b, 0) / Object.values(avgs).length) : null;

  const buy = id => { if (!bought.includes(id)) { const u = [...bought, id]; setBought(u); db.set("bought", u); } };
  const addNote = () => { if (!nn.title.trim() || !nn.content.trim()) return; const n = { ...nn, id: Date.now(), date: new Date().toLocaleDateString("en-IN") }; const u = [n, ...notes]; setNotes(u); db.set("notes", u); setNn({ subj: "math", title: "", content: "" }); };
  const delNote = id => { const u = notes.filter(n => n.id !== id); setNotes(u); db.set("notes", u); };
  const toggleT = (k, i) => setTopics(t => { const n = { ...t, [k]: [...t[k]] }; n[k][i] = !n[k][i]; db.set("topics", n); return n; });

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ background: T.ink, borderRadius: 18, padding: "22px 20px", marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🎓</div>
        <div>
          <div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 3 }}>SSC Aspirant</div>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: "rgba(255,255,255,.5)" }}>SSC CGL 2025 · {Math.round((done / total) * 100)}% complete</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[{ v: done, l: "Topics" }, { v: tests, l: "Tests" }, { v: gAvg != null ? `${gAvg}%` : "—", l: "Avg" }].map(({ v, l }) => (
          <Card key={l} style={{ textAlign: "center", padding: "14px 10px" }}>
            <div style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{v}</div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.mid, letterSpacing: .6, textTransform: "uppercase" }}>{l}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", gap: 3, background: T.fill, borderRadius: 14, padding: 4, marginBottom: 22 }}>
        {["overview", "teachers", "syllabus", "notes"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px 4px", borderRadius: 11, border: "none", background: tab === t ? T.ink : "transparent", color: tab === t ? "#fff" : T.mid, fontFamily: T.sans, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .18s", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && Object.entries(SUBJ).map(([k, s]) => {
        const d2 = topics[k]?.filter(Boolean).length || 0, p2 = Math.round((d2 / s.t.length) * 100), avg = avgs[k];
        return (
          <Card key={k} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: T.ink, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{s.e}</div>
                <div>
                  <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: T.ink }}>{s.n}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.mid }}>{d2}/{s.t.length}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {avg != null && <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: avg >= 75 ? T.green : avg >= 60 ? T.amber : T.red }}>{avg}%</span>}
                <span style={{ fontFamily: T.mono, fontSize: 15, color: T.mid }}>{p2}%</span>
              </div>
            </div>
            <Track v={p2} h={4} />
          </Card>
        );
      })}

      {tab === "teachers" && TEACHERS.map(tc => {
        const isB = bought.includes(tc.id);
        return (
          <Card key={tc.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{tc.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.sans, fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 5 }}>{tc.name}</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  <Pill>{tc.sub}</Pill>
                  <Pill color={T.amber} bg="#FEF3C7">★ {tc.r}</Pill>
                  <Pill>{tc.n}</Pill>
                </div>
              </div>
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.mid, lineHeight: 1.65, marginBottom: 16 }}>{tc.d}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {isB ? <span style={{ fontFamily: T.sans, fontSize: 14, color: T.green, fontWeight: 700 }}>✓ Enrolled</span> : <div><span style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 700, color: T.ink }}>₹{tc.p}</span><span style={{ fontFamily: T.sans, fontSize: 13, color: T.mid }}> one-time</span></div>}
              <BBtn sm onClick={() => buy(tc.id)} disabled={isB}>{isB ? "Enrolled" : "Buy Course"}</BBtn>
            </div>
          </Card>
        );
      })}

      {tab === "syllabus" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {Object.entries(SUBJ).map(([k, s]) => (
              <button key={k} onClick={() => setSyl(k)} style={{ padding: "9px 16px", borderRadius: 99, border: `1.5px solid ${syl === k ? T.ink : T.line}`, background: syl === k ? T.ink : T.white, color: syl === k ? "#fff" : T.mid, fontFamily: T.sans, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .15s" }}>{s.s}</button>
            ))}
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: T.ink }}>{SUBJ[syl].n}</div>
              <span style={{ fontFamily: T.mono, fontSize: 14, color: T.mid }}>{topics[syl]?.filter(Boolean).length}/{SUBJ[syl].t.length}</span>
            </div>
            <Track v={topics[syl]?.filter(Boolean).length || 0} max={SUBJ[syl].t.length} h={5} />
          </Card>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {SUBJ[syl].t.map((t, i) => {
              const d = topics[syl]?.[i];
              return (
                <div key={i} onClick={() => toggleT(syl, i)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < SUBJ[syl].t.length - 1 ? `1px solid ${T.line}` : "none", cursor: "pointer" }}>
                  <div style={{ width: 20, height: 20, border: `2px solid ${d ? T.green : T.line}`, borderRadius: 5, background: d ? "#F0FDF4" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.green, flexShrink: 0 }}>{d ? "✓" : ""}</div>
                  <span style={{ fontFamily: T.sans, fontSize: 15, color: d ? T.green : T.ink }}>{t}</span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {tab === "notes" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
              {Object.entries(SUBJ).map(([k, s]) => (
                <button key={k} onClick={() => setNn(n => ({ ...n, subj: k }))} style={{ padding: "7px 14px", borderRadius: 99, border: `1.5px solid ${nn.subj === k ? T.ink : T.line}`, background: nn.subj === k ? T.ink : T.white, color: nn.subj === k ? "#fff" : T.mid, fontFamily: T.sans, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{s.s}</button>
              ))}
            </div>
            <input value={nn.title} onChange={e => setNn(n => ({ ...n, title: e.target.value }))} placeholder="Note title…" style={{ width: "100%", background: T.fill, border: "none", borderRadius: 11, padding: "13px 15px", fontFamily: T.sans, fontSize: 15, color: T.ink, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
            <textarea value={nn.content} onChange={e => setNn(n => ({ ...n, content: e.target.value }))} placeholder="Concept, formula, shortcut…" rows={3} style={{ width: "100%", background: T.fill, border: "none", borderRadius: 11, padding: "13px 15px", fontFamily: T.sans, fontSize: 14, color: T.ink, outline: "none", resize: "vertical", lineHeight: 1.7, marginBottom: 10, boxSizing: "border-box" }} />
            <BBtn onClick={addNote}>Save Note</BBtn>
          </Card>
          {notes.length === 0
            ? <div style={{ fontFamily: T.sans, fontSize: 15, color: T.mid, textAlign: "center", padding: "28px 0" }}>No notes yet — add above!</div>
            : notes.map(n => (
              <Card key={n.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: T.serif, fontSize: 19, fontWeight: 700, color: T.ink, marginBottom: 5 }}>{n.title}</div>
                    <div style={{ display: "flex", gap: 8 }}><Pill>{SUBJ[n.subj]?.n}</Pill><span style={{ fontFamily: T.sans, fontSize: 12, color: T.mid }}>{n.date}</span></div>
                  </div>
                  <button onClick={() => delNote(n.id)} style={{ background: "none", border: "none", color: T.mid, cursor: "pointer", fontSize: 20 }}>×</button>
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 14, color: T.mid, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{n.content}</div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── APP SHELL ──
const NAV = [
  { id: "home", label: "Home", icon: a => <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? T.ink : "none"} stroke={T.ink} strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" stroke={T.ink} strokeWidth="1.8" fill="none" /></svg> },
  { id: "plan", label: "Plan", icon: a => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" fill={a ? T.ink : "none"} /><line x1="16" y1="2" x2="16" y2="6" stroke={a ? "#fff" : T.ink} /><line x1="8" y1="2" x2="8" y2="6" stroke={a ? "#fff" : T.ink} /><line x1="3" y1="10" x2="21" y2="10" stroke={a ? "#fff" : T.ink} /></svg> },
  { id: "guru", label: "Guru", icon: () => <Tri size={22} /> },
  { id: "quiz", label: "Quiz", icon: a => <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? T.ink : "none"} stroke={T.ink} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={a ? "#fff" : T.ink} /><line x1="12" y1="17" x2="12.01" y2="17" stroke={a ? "#fff" : T.ink} /></svg> },
  { id: "profile", label: "Me", icon: a => <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? T.ink : "none"} stroke={T.ink} strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [topics, setTopics] = useState(() => { const t = db.get("topics"); if (t) return t; const n = {}; Object.keys(SUBJ).forEach(k => { n[k] = SUBJ[k].t.map(() => false); }); return n; });
  const [qh, setQh] = useState(() => db.get("qh") || { math: [], eng: [], gk: [], logic: [] });

  const score = (subj, s, t) => setQh(prev => { const u = { ...prev, [subj]: [...(prev[subj] || []), { score: s, total: t, date: new Date().toLocaleDateString("en-IN") }] }; db.set("qh", u); return u; });

  return (
    <div style={{ background: T.bg, height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Tri size={17} />
          <span style={{ fontFamily: T.serif, fontSize: 19, fontWeight: 700, color: T.ink }}>SSC Guru</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green }} />
          <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: .5 }}>Ready</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px 0", maxWidth: 500, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {page === "home" && <Home topics={topics} qh={qh} goTo={setPage} />}
        {page === "plan" && <Plan qh={qh} topics={topics} />}
        {page === "guru" && <Guru qh={qh} />}
        {page === "quiz" && <Quiz onScore={score} />}
        {page === "profile" && <Profile topics={topics} qh={qh} setTopics={setTopics} />}
      </div>

      {/* Nav */}
      <nav style={{ flexShrink: 0, background: T.white, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 0 18px" }}>
        {NAV.map(n => {
          const a = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 12px", opacity: a ? 1 : .35, transition: "opacity .15s" }}>
              {n.icon(a)}
              <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.ink, letterSpacing: .4 }}>{n.label}</span>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: a ? T.ink : "transparent", transition: "background .2s" }} />
            </button>
          );
        })}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes triFloat { 0%,100%{transform:translateY(0) rotate(0);opacity:.7} 50%{transform:translateY(-2px) rotate(4deg);opacity:1} }
        @keyframes triSpin  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes msgIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPop   { 0%,80%,100%{transform:scale(.45);opacity:.2} 40%{transform:scale(1.4);opacity:1} }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        *::-webkit-scrollbar{display:none}*{scrollbar-width:none}
        input,textarea{color-scheme:light}
        input::placeholder,textarea::placeholder{color:#AAAAAA;font-family:"DM Sans",sans-serif}
        textarea{resize:none}
        button{transition:opacity .15s,transform .12s}
        button:active{opacity:.65!important;transform:scale(.96)!important}
      `}</style>
    </div>
  );
}
