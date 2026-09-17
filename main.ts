/**
 * AHNU · AI Badminton Team — 部署在 Deno Deploy
 * 基于 https://36y5frauclule.space.mcode.cn 的内容迁移版
 */

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/api/squad-interest" && req.method === "POST") {
    return handleSquadInterest(req);
  }

  if (path === "/api/squad-list" && req.method === "GET") {
    return handleSquadList(req);
  }

  // 主页
  if (path === "/" || path === "/index.html") {
    return new Response(INDEX_HTML, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return new Response("Not Found", { status: 404 });
});

// ===== API:记录"下一个你"的报名 =====
async function handleSquadInterest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });

  try {
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 30);
    if (!name) return json({ ok: false, error: "名字不能为空" }, 400);

    const record = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    };

    const kv = await Deno.openKv();
    const ts = Date.now();
    await kv.set(["squad_interest", String(ts).padStart(15, "0") + "-" + record.id], record);

    return json({ ok: true, record });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
}

async function handleSquadList(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });

  try {
    const kv = await Deno.openKv();
    const items: any[] = [];
    for await (const entry of kv.list({ prefix: ["squad_interest"] }, { reverse: true, limit: 50 })) {
      items.push(entry.value);
    }
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

// ===== 主页 HTML =====
const INDEX_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>AHNU AI Badminton Team | 安徽农业大学 · 人工智能学院羽毛球队</title>
<meta name="description" content="安徽农业大学人工智能学院羽毛球队官网 — 球员、历任队长、历届校赛排名。Official site of the Anhui Agricultural University, School of Artificial Intelligence Badminton Team." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
<style>
/* ==========================================================
   AHNU · AI BADMINTON — Indoor Court Theme
   ========================================================== */

:root{
  --court-floor-1:#E8B86A;
  --court-floor-2:#C68A3E;
  --court-floor-3:#8B5A1E;
  --court-line:#FFFFFF;
  --court-tape:#1A4FB8;
  --court-light:#FFF8E1;

  --red:#E63946;
  --red-dark:#A4161A;

  --ink:#3A2E1F;
  --ink-2:#4A3C28;
  --ink-3:#5A4A32;
  --paper:#FAF3E3;
  --paper-2:#F2E6C9;
  --line:#D9C49A;
  --line-2:#C9B382;

  --txt:#2B2218;
  --txt-dim:#6B5A40;
  --txt-mute:#9C8A6E;

  --gold:#E0A427;
  --green:#3D8B5A;
  --blue:#1A4FB8;

  --font-display:'Oswald','Inter',sans-serif;
  --font-body:'Inter','PingFang SC','Microsoft YaHei',sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,monospace;

  --r:6px;
  --shadow:0 18px 50px rgba(60,40,15,.25);
}

*{box-sizing:border-box;margin:0;padding:0}
html,body{
  background:
    radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,250,230,.55), transparent 60%),
    repeating-linear-gradient(90deg,
      rgba(139,90,30,.10) 0px, rgba(139,90,30,.10) 2px,
      transparent 2px, transparent 24px),
    linear-gradient(180deg, #E8B86A 0%, #C68A3E 45%, #A87838 100%);
  background-attachment: fixed;
  color:var(--txt);
  font-family:var(--font-body);
  font-size:15px;line-height:1.55;
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
ul,ol{list-style:none}

.container{max-width:1280px;margin:0 auto;padding:0 28px}

/* ===== UTILITY BAR ===== */
.util-bar{
  background:rgba(40,28,12,.92);
  backdrop-filter:saturate(150%) blur(8px);
  border-bottom:1px solid rgba(0,0,0,.2);
  font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;color:#FAF3E3;
}
.util-inner{display:flex;justify-content:space-between;align-items:center;height:34px;color:rgba(250,243,227,.75)}
.util-left{display:flex;align-items:center;gap:10px}
.util-label{text-transform:uppercase}
.util-right{display:flex;align-items:center;gap:10px}
.util-link{color:rgba(250,243,227,.75);text-transform:uppercase;transition:color .2s;cursor:pointer}
.util-link:hover{color:#fff}
.util-link.cta{color:#FFD66B;font-weight:600}
.util-sep{color:rgba(250,243,227,.4)}

.dot{width:8px;height:8px;border-radius:50%;background:var(--txt-mute);display:inline-block}
.dot.live{background:var(--red);box-shadow:0 0 0 0 rgba(230,57,70,.6);animation:pulse 1.6s infinite}
@keyframes pulse{
  0%{box-shadow:0 0 0 0 rgba(230,57,70,.6)}
  70%{box-shadow:0 0 0 10px rgba(230,57,70,0)}
  100%{box-shadow:0 0 0 0 rgba(230,57,70,0)}
}

/* ===== MASTHEAD ===== */
.masthead{
  background:rgba(40,28,12,.94);
  backdrop-filter:saturate(150%) blur(10px);
  border-bottom:1px solid rgba(0,0,0,.2);
  position:sticky;top:0;z-index:50;
}
.masthead-inner{display:flex;align-items:center;justify-content:space-between;height:78px;gap:24px}
.brand{display:flex;align-items:center;gap:14px}
.brand-mark{
  width:52px;height:52px;
  background:linear-gradient(135deg,var(--red) 0%,var(--red-dark) 100%);
  border-radius:8px;display:grid;place-items:center;
  font-family:var(--font-display);font-weight:700;color:#fff;letter-spacing:.05em;
  box-shadow:0 8px 24px rgba(230,57,70,.35);
}
.brand-mark span{font-size:14px}
.brand-title{font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:.06em;color:#fff}
.brand-sub{font-size:11px;color:rgba(250,243,227,.7);letter-spacing:.04em;margin-top:2px}

.main-nav ul{display:flex;align-items:center;gap:4px}
.main-nav a{
  display:block;padding:10px 14px;color:rgba(250,243,227,.75);
  font-family:var(--font-display);font-weight:600;font-size:13px;letter-spacing:.08em;
  text-transform:uppercase;border-radius:var(--r);transition:.2s;
}
.main-nav a em{display:block;font-style:normal;font-family:var(--font-body);font-weight:400;font-size:10px;color:rgba(250,243,227,.5);text-transform:none;letter-spacing:.02em;margin-top:2px}
.main-nav li.active a,.main-nav a:hover{color:#fff;background:rgba(0,0,0,.18)}

.burger{display:none;background:transparent;border:0;width:38px;height:38px;cursor:pointer;position:relative}
.burger i{display:block;position:absolute;left:8px;right:8px;height:2px;background:#fff;border-radius:2px}
.burger i:nth-child(1){top:12px}
.burger i:nth-child(2){top:18px}
.burger i:nth-child(3){top:24px}

/* ===== HERO ===== */
.hero{
  position:relative;overflow:hidden;
  background:
    linear-gradient(180deg, transparent 0%, transparent 100%),
    linear-gradient(180deg, transparent 38%, rgba(20,15,8,.04) 38%, rgba(20,15,8,.04) 40%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(255,250,230,.35) 0%, transparent 18%),
    linear-gradient(180deg, #F0C172 0%, #D89B45 50%, #B57530 100%);
  border-bottom:1px solid rgba(0,0,0,.15);
}
.hero-bg{
  position:absolute;inset:0;
  background:
    repeating-linear-gradient(90deg,
      rgba(139,90,30,.10) 0px, rgba(139,90,30,.10) 2px,
      transparent 2px, transparent 26px);
  opacity:.6;
}
.hero-bg::before{
  content:"";position:absolute;inset:0;
  background:
    linear-gradient(to right, transparent 0, transparent calc(50% - 320px), var(--court-line) calc(50% - 320px), var(--court-line) calc(50% - 318px), transparent calc(50% - 318px), transparent calc(50% + 318px), var(--court-line) calc(50% + 318px), var(--court-line) calc(50% + 320px), transparent calc(50% + 320px)),
    linear-gradient(to bottom, transparent 0, transparent 60px, var(--court-line) 60px, var(--court-line) 62px, transparent 62px, transparent calc(100% - 62px), var(--court-line) calc(100% - 62px), var(--court-line) calc(100% - 60px), transparent calc(100% - 60px));
  opacity:.85;
}
.hero-bg::after{
  content:"";position:absolute;inset:0;
  background:radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,250,230,.7), transparent 60%);
}
.hero-inner{
  position:relative;padding:90px 0 80px;max-width:920px;text-align:center;margin:0 auto;
  background:rgba(255,250,230,.18);
  backdrop-filter:blur(2px);
  border-radius:16px;
  margin-top:30px;margin-bottom:30px;
}
.kicker{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--font-mono);font-size:11px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--red-dark);font-weight:700;
  justify-content:center;background:rgba(255,255,255,.6);padding:6px 14px;border-radius:99px;
}
.hero-title{
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(48px,6.5vw,108px);line-height:.95;
  color:#fff;letter-spacing:.01em;margin:22px 0 22px;
  text-shadow:0 4px 24px rgba(0,0,0,.35);
}
.hero-title .accent{color:#FFD66B}
.hero-lead{
  font-size:17px;color:#fff;max-width:640px;margin:0 auto 36px;
  text-shadow:0 2px 12px rgba(0,0,0,.4);
}
.hero-cta{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}

.btn{
  display:inline-flex;align-items:center;gap:8px;padding:14px 22px;border-radius:var(--r);
  font-family:var(--font-display);font-weight:700;font-size:13px;letter-spacing:.1em;
  text-transform:uppercase;transition:.2s;cursor:pointer;border:0;
}
.btn-primary{background:var(--red);color:#fff;box-shadow:0 8px 24px rgba(230,57,70,.45)}
.btn-primary:hover{background:#ff4d57;transform:translateY(-1px)}
.btn-ghost{background:rgba(255,255,255,.85);color:var(--ink);border:1px solid var(--line-2);box-shadow:0 4px 14px rgba(0,0,0,.15)}
.btn-ghost:hover{border-color:var(--red);color:var(--red)}

/* ===== SECTIONS ===== */
.section{padding:90px 0;position:relative}
.section.alt{
  background:rgba(250,243,227,.75);
  backdrop-filter:blur(8px);
  border-top:1px solid var(--line);
  border-bottom:1px solid var(--line);
}
.eyebrow{
  font-family:var(--font-mono);font-size:11px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--red-dark);font-weight:700;
  background:rgba(255,255,255,.55);padding:5px 12px;border-radius:99px;display:inline-block;
}
.section-head{margin-bottom:36px;text-align:center}
.section-title{font-family:var(--font-display);font-weight:700;font-size:clamp(28px,3.4vw,44px);color:var(--ink);letter-spacing:.01em;margin-top:8px}
.section-sub{color:var(--txt-dim);font-size:15px;margin-top:10px}

/* ===== PLAYERS ===== */
.players-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.player-card{
  background:var(--paper);
  border:1px solid var(--line);
  border-radius:12px;overflow:hidden;transition:.25s;position:relative;
  box-shadow:0 6px 20px rgba(60,40,15,.18);
}
.player-card:hover{border-color:var(--red);transform:translateY(-3px);box-shadow:0 14px 30px rgba(60,40,15,.25)}

/* 退役球员:灰暗一点 */
.player-card.retired{
  background:linear-gradient(180deg,#f4ecda 0%,#e9dfc5 100%);
  filter:grayscale(.25);
  opacity:.92;
}
.player-card.retired:hover{filter:grayscale(0);opacity:1}
.player-card.retired .player-info h3{color:#7a6a4a}
.player-card.retired .player-badge{background:#8a7a5e;color:#f5ecd9}
.player-card.retired .player-info .pdesc{border-left-color:#8a7a5e}
.player-photo{aspect-ratio:1/1;background-size:cover;background-position:center;position:relative}
.player-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg, transparent 30%, rgba(250,243,227,.92) 100%)}
.player-tag{position:absolute;top:14px;left:14px;background:rgba(40,28,12,.8);backdrop-filter:blur(8px);color:#fff;font-family:var(--font-mono);font-size:10px;padding:5px 10px;border-radius:4px;letter-spacing:.1em;text-transform:uppercase;z-index:2}
.player-badge{position:absolute;top:14px;right:14px;background:var(--red);color:#fff;font-family:var(--font-display);font-weight:700;font-size:12px;padding:5px 10px;border-radius:6px;z-index:2;letter-spacing:.05em}
.player-badge.cap{background:var(--gold);color:#3A2810}
.player-badge.king{background:linear-gradient(135deg,var(--red),var(--gold));color:#3A1505}
.player-info{padding:18px 20px 22px;position:relative;margin-top:-60px;z-index:2}
.player-info h3{font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--ink);line-height:1.15}
.player-info .prole{font-family:var(--font-mono);font-size:11px;color:var(--red-dark);text-transform:uppercase;letter-spacing:.1em;margin-top:6px;font-weight:700}
.player-info .pdesc{color:var(--txt-dim);font-size:13px;margin-top:10px;font-style:italic;padding-left:12px;border-left:2px solid var(--red)}

.p1{background:linear-gradient(135deg,#802700,#E63946 60%,#ffb98b)}
.p2{background:linear-gradient(135deg,#143d2c,#3DDC97)}
.p3{background:linear-gradient(135deg,#1a3a6b,#2D8CFF)}
.p4{background:linear-gradient(135deg,#3a2a14,#E0A427)}
.p5{background:linear-gradient(135deg,#3a1430,#a64ec8)}

/* ===== JOIN CARD ===== */
.join-card{
  background:var(--paper);
  border:2px dashed var(--line-2);
  border-radius:12px;
  display:flex;align-items:center;justify-content:center;flex-direction:column;
  text-align:center;padding:24px;min-height:340px;position:relative;
  transition:.25s;cursor:pointer;
}
.join-card:hover{border-color:var(--red);transform:translateY(-3px)}
.join-plus{font-size:42px;opacity:.4;line-height:1;color:var(--ink)}
.join-name{font-family:var(--font-mono);font-size:13px;color:var(--red-dark);margin-top:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.join-hint{color:var(--txt-mute);font-size:11px;margin-top:6px;font-family:var(--font-mono);letter-spacing:.08em;text-transform:uppercase}

.join-form{display:none;flex-direction:column;gap:10px;width:100%;max-width:240px}
.join-form.show{display:flex}
.join-form input{
  padding:10px 14px;border:1px solid var(--line);border-radius:8px;
  font-family:var(--font-body);font-size:14px;text-align:center;
  background:#fff;color:var(--ink);
}
.join-form input:focus{outline:none;border-color:var(--red)}
.join-form button{
  padding:10px;border:0;border-radius:8px;background:var(--red);color:#fff;
  font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:.1em;
  text-transform:uppercase;cursor:pointer;
}
.join-form button:hover{background:#ff4d57}
.join-msg{font-size:11px;font-family:var(--font-mono);margin-top:4px;letter-spacing:.05em}
.join-msg.ok{color:var(--green)}
.join-msg.err{color:var(--red)}

/* ===== CAPTAINS ===== */
.captains-compact{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.cap-card{
  background:var(--paper);
  border:1px solid var(--line);
  border-radius:10px;padding:24px 14px;text-align:center;transition:.2s;position:relative;overflow:hidden;
  box-shadow:0 4px 14px rgba(60,40,15,.15);
}
.cap-card:hover{border-color:var(--red);transform:translateY(-2px)}
.cap-card .yr{font-family:var(--font-display);font-weight:700;font-size:26px;color:var(--red-dark);letter-spacing:.04em}
.cap-card .yr::after{content:"";display:block;width:30px;height:2px;background:var(--red);margin:10px auto 0;border-radius:2px}
.cap-card .nm{font-family:var(--font-display);font-weight:600;font-size:18px;color:var(--ink);margin-top:10px;letter-spacing:.04em}
.cap-card.current{
  border-color:var(--red);
  background:linear-gradient(180deg,#fff 0%,var(--paper) 100%);
  box-shadow:0 8px 20px rgba(230,57,70,.25);
}
.cap-card.current::before{content:"现任";position:absolute;top:10px;right:10px;background:var(--red);color:#fff;font-family:var(--font-mono);font-size:9px;padding:3px 7px;border-radius:3px;letter-spacing:.08em;font-weight:700}

/* ===== HISTORY ===== */
.history-wrap{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;max-width:760px;margin:0 auto}
.history-card{
  background:var(--paper);
  border:1px solid var(--line);
  border-radius:12px;padding:32px 24px;text-align:center;position:relative;overflow:hidden;
  transition:.2s;
  box-shadow:0 6px 20px rgba(60,40,15,.18);
}
.history-card:hover{border-color:var(--red);transform:translateY(-2px)}
.history-card::before{
  content:"";position:absolute;top:-40px;right:-40px;width:140px;height:140px;border-radius:50%;
  background:radial-gradient(circle, rgba(230,57,70,.18), transparent 70%);
}
.history-card .yr{font-family:var(--font-display);font-weight:700;font-size:36px;color:var(--red-dark);letter-spacing:.04em;line-height:1}
.history-card .place{display:flex;align-items:baseline;justify-content:center;gap:8px;margin-top:16px}
.history-card .place b{font-family:var(--font-display);font-weight:700;font-size:72px;color:var(--ink);line-height:1}
.history-card .place em{font-style:normal;font-family:var(--font-mono);font-size:14px;color:var(--txt-dim);letter-spacing:.1em;text-transform:uppercase}
.history-card .desc{font-family:var(--font-mono);font-size:12px;color:var(--txt-mute);text-transform:uppercase;letter-spacing:.12em;margin-top:10px}

/* ===== FOOTER ===== */
.footer{
  background:rgba(40,28,12,.96);
  color:#FAF3E3;
  border-top:1px solid rgba(0,0,0,.3);
  padding:60px 0 0;
}
.footer .brand-title{color:#fff}
.footer .brand-sub{color:rgba(250,243,227,.7)}
.footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:36px;padding-bottom:40px}
.footer h5{font-family:var(--font-display);font-weight:600;font-size:14px;color:#fff;letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px}
.footer-list{display:flex;flex-direction:column;gap:10px;font-size:14px;color:rgba(250,243,227,.75)}
.footer-list a:hover{color:#FFD66B}
.footer-blurb{color:rgba(250,243,227,.75);font-size:14px;margin-top:16px;max-width:320px}
.footer-bottom{border-top:1px solid rgba(255,255,255,.1);padding:18px 0;background:rgba(20,12,4,.6)}
.fb-inner{display:flex;justify-content:space-between;color:rgba(250,243,227,.5);font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase}

@media (max-width:1100px){
  .players-grid{grid-template-columns:repeat(2,1fr)}
  .captains-compact{grid-template-columns:repeat(3,1fr)}
  .footer-grid{grid-template-columns:1fr 1fr}
}
@media (max-width:780px){
  .util-bar .util-left{display:none}
  .main-nav{display:none}
  .burger{display:block}
  .container{padding:0 18px}
  .section{padding:60px 0}
  .hero-inner{padding:50px 18px;margin:20px auto}
  .players-grid,.captains-compact,.history-wrap,.footer-grid{grid-template-columns:1fr}
}
</style>
</head>
<body>

<!-- ===== TOP UTILITY BAR ===== -->
<div class="util-bar">
  <div class="container util-inner">
    <div class="util-left">
      <span class="dot live"></span>
      <span class="util-label">AHNU · AI Badminton · Since 2019</span>
    </div>
    <div class="util-right">
      <span class="util-link cta" id="lang-zh">中文</span>
      <span class="util-sep">·</span>
      <span class="util-link" id="lang-en">EN</span>
    </div>
  </div>
</div>

<!-- ===== MAIN NAV ===== -->
<header class="masthead" id="masthead">
  <div class="container masthead-inner">
    <a href="/" class="brand">
      <div class="brand-mark"><span>AHNU</span></div>
      <div class="brand-text">
        <div class="brand-title">AHNU · AI BADMINTON</div>
        <div class="brand-sub">安徽农业大学 · 人工智能学院羽毛球队</div>
      </div>
    </a>
    <nav class="main-nav" aria-label="主导航">
      <ul>
        <li class="active"><a href="/">Home</a></li>
        <li><a href="#squad">Players <em>球员</em></a></li>
        <li><a href="#captains">Captains <em>历任队长</em></a></li>
        <li><a href="#history">History <em>校赛</em></a></li>
      </ul>
    </nav>
    <button class="burger" aria-label="菜单"><i></i><i></i><i></i></button>
  </div>
</header>

<!-- ===== HERO ===== -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="container hero-inner">
    <span class="kicker">AHNU · SCHOOL OF ARTIFICIAL INTELLIGENCE</span>
    <h1 class="hero-title">
      智码 <span class="accent">羽击</span><br/>
      <span class="thin">Code the Court.</span>
    </h1>
    <p class="hero-lead">
      安徽农业大学人工智能学院羽毛球队 — 在算法的缝隙里追寻落点的精确，在球场上把它打成冠军的弧线。
    </p>
    <div class="hero-cta">
      <a href="#squad" class="btn btn-primary">查看阵容 →</a>
      <a href="#history" class="btn btn-ghost">校赛历史</a>
    </div>
  </div>
</section>

<!-- ===== PLAYERS (SQUAD) ===== -->
<section class="section" id="squad">
  <div class="container">

    <!-- 现役男生 -->
    <header class="section-head">
      <div class="eyebrow">SQUAD · 现役男生</div>
      <h2 class="section-title">现役</h2>
      <p class="section-sub">AHNU·AI 院队现役主力</p>
    </header>

    <div class="players-grid">

      <article class="player-card">
        <div class="player-photo p1">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge king">现役最强</span>
        </div>
        <div class="player-info">
          <h3>汪聂翔</h3>
          <div class="prole">WANG Niexiang</div>
          <div class="pdesc">现役最强,体力好,打法犀利</div>
        </div>
      </article>

      <article class="player-card">
        <div class="player-photo p2">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge">QUICK · 快攻</span>
        </div>
        <div class="player-info">
          <h3>姚轩</h3>
          <div class="prole">YAO Xuan</div>
          <div class="pdesc">快攻</div>
        </div>
      </article>

      <article class="player-card">
        <div class="player-photo p3">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge">VETERAN · 老登</span>
        </div>
        <div class="player-info">
          <h3>陈默</h3>
          <div class="prole">CHEN Mo</div>
          <div class="pdesc">老登打法</div>
        </div>
      </article>

      <article class="player-card">
        <div class="player-photo p4">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge">MANHATTAN</span>
        </div>
        <div class="player-info">
          <h3>郑涤非</h3>
          <div class="prole">ZHENG Difei</div>
          <div class="pdesc">曼哈顿式打法</div>
        </div>
      </article>

      <article class="player-card">
        <div class="player-photo p5">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge">SMASH · 杀球手</span>
        </div>
        <div class="player-info">
          <h3>周正扬</h3>
          <div class="prole">ZHOU Zhengyang</div>
          <div class="pdesc">反手天花板,会杀球</div>
        </div>
      </article>

    </div>

    <!-- 现役女生 -->
    <header class="section-head" style="margin-top:60px">
      <div class="eyebrow" style="color:#a64ec8;background:rgba(166,78,200,.1)">SQUAD · 现役女生</div>
      <h2 class="section-title">女队</h2>
      <p class="section-sub">巾帼不让须眉</p>
    </header>

    <div class="players-grid">

      <article class="player-card">
        <div class="player-photo p5">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge" style="background:#a64ec8">FAINT · 晃人王</span>
        </div>
        <div class="player-info">
          <h3>何悠然</h3>
          <div class="prole">HE Youran</div>
          <div class="pdesc">喜欢晃人</div>
        </div>
      </article>

      <article class="player-card">
        <div class="player-photo p3">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge" style="background:#a64ec8">M · 很 man</span>
        </div>
        <div class="player-info">
          <h3>陈怀钰</h3>
          <div class="prole">CHEN Huaiyu</div>
          <div class="pdesc">很 man</div>
        </div>
      </article>

      <article class="player-card">
        <div class="player-photo p2">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge" style="background:#a64ec8">SPEED · 跑动快</span>
        </div>
        <div class="player-info">
          <h3>张钰婕</h3>
          <div class="prole">ZHANG Yujie</div>
          <div class="pdesc">跑动快</div>
        </div>
      </article>

      <!-- 留名卡:点开后输入名字,会保存到 Deno KV -->
      <article class="join-card" id="join-card">
        <div id="join-prompt">
          <div class="join-plus">+</div>
          <div class="join-name">下一个你</div>
          <div class="join-hint">JOIN THE SQUAD</div>
        </div>
        <form class="join-form" id="join-form">
          <input id="join-name" placeholder="你的名字" maxlength="30" required />
          <button type="submit">报名</button>
          <div class="join-msg" id="join-msg"></div>
        </form>
      </article>

    </div>
  </div>
</section>

<!-- ===== LEGEND (RETIRED) ===== -->
<section class="section alt" id="legend">
  <div class="container">

    <!-- 退役男生 -->
    <header class="section-head">
      <div class="eyebrow" style="color:#6b5a40;background:rgba(107,90,64,.12)">LEGEND · 退役男生</div>
      <h2 class="section-title">退役</h2>
      <p class="section-sub">江湖再见 · 队史功臣</p>
    </header>

    <div class="players-grid">

      <article class="player-card retired">
        <div class="player-photo p1">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge">LEGEND · 队史最强</span>
        </div>
        <div class="player-info">
          <h3>周金鑫</h3>
          <div class="prole">ZHOU Jinxin</div>
          <div class="pdesc">队史最强战力</div>
        </div>
      </article>

      <article class="player-card retired">
        <div class="player-photo p2">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge">XD · 混双</span>
        </div>
        <div class="player-info">
          <h3>安 铭</h3>
          <div class="prole">AN Ming</div>
          <div class="pdesc">擅长混双</div>
        </div>
      </article>

      <article class="player-card retired">
        <div class="player-photo p4">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge">CAPTAIN · 23 队长</span>
        </div>
        <div class="player-info">
          <h3>靳亚凯</h3>
          <div class="prole">JIN Yakai</div>
          <div class="pdesc">23 年队长</div>
        </div>
      </article>

      <article class="player-card retired">
        <div class="player-photo p3">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge">TURING · 图灵式</span>
        </div>
        <div class="player-info">
          <h3>韩诚</h3>
          <div class="prole">HAN Cheng</div>
          <div class="pdesc">图灵式打法</div>
        </div>
      </article>

    </div>

    <!-- 退役女生 -->
    <header class="section-head" style="margin-top:60px">
      <div class="eyebrow" style="color:#6b5a40;background:rgba(107,90,64,.12)">LEGEND · 退役女生</div>
      <h2 class="section-title">女队</h2>
      <p class="section-sub">曾经的巾帼</p>
    </header>

    <div class="players-grid">

      <article class="player-card retired">
        <div class="player-photo p5">
          <span class="player-tag">AHNU · AI</span>
          <span class="player-badge">XD · 混双</span>
        </div>
        <div class="player-info">
          <h3>朱 涛</h3>
          <div class="prole">ZHU Tao</div>
          <div class="pdesc">混双</div>
        </div>
      </article>

    </div>
  </div>
</section>

<!-- ===== CAPTAINS ===== -->
<section class="section alt" id="captains">
  <div class="container">
    <header class="section-head">
      <div class="eyebrow">CAPTAINS · 历任队长</div>
      <h2 class="section-title">2022 — 2026</h2>
      <p class="section-sub">五届院队队长 · 一脉相承</p>
    </header>

    <div class="captains-compact">
      <div class="cap-card"><div class="yr">2022</div><div class="nm">李冠辰</div></div>
      <div class="cap-card"><div class="yr">2023</div><div class="nm">靳亚凯</div></div>
      <div class="cap-card"><div class="yr">2024</div><div class="nm">陶婧雅</div></div>
      <div class="cap-card"><div class="yr">2025</div><div class="nm">郑涤非</div></div>
      <div class="cap-card current"><div class="yr">2026</div><div class="nm">何悠然</div></div>
    </div>
  </div>
</section>

<!-- ===== HISTORY ===== -->
<section class="section" id="history">
  <div class="container">
    <header class="section-head">
      <div class="eyebrow">HISTORY · 校赛名次</div>
      <h2 class="section-title">历年安徽农业大学校赛</h2>
      <p class="section-sub">团体成绩 · 第 5 名 × 2</p>
    </header>

    <div class="history-wrap">
      <div class="history-card">
        <div class="yr">2024</div>
        <div class="place"><b>5</b><em>TH</em></div>
        <div class="desc">校羽毛球赛 · 团体第五名</div>
      </div>
      <div class="history-card">
        <div class="yr">2025</div>
        <div class="place"><b>5</b><em>TH</em></div>
        <div class="desc">校羽毛球赛 · 团体第五名</div>
      </div>
    </div>
  </div>
</section>

<!-- ===== FOOTER ===== -->
<footer class="footer">
  <div class="container footer-grid">
    <div>
      <div class="brand">
        <div class="brand-mark"><span>AHNU</span></div>
        <div class="brand-text">
          <div class="brand-title">AHNU · AI BADMINTON</div>
          <div class="brand-sub">安徽农业大学 · 人工智能学院</div>
        </div>
      </div>
      <p class="footer-blurb">代码与球拍的混合体。我们相信精确、协作、坚持不懈。</p>
    </div>
    <div>
      <h5>Navigate</h5>
      <ul class="footer-list">
        <li><a href="/">首页</a></li>
        <li><a href="#squad">球员</a></li>
        <li><a href="#captains">历任队长</a></li>
        <li><a href="#history">校赛历史</a></li>
      </ul>
    </div>
    <div>
      <h5>Contact</h5>
      <ul class="footer-list">
        <li>📍 合肥市长江西路 130 号</li>
        <li>📞 +86 551-XXXXXXX</li>
        <li>✉️ badminton@ahnuai.edu.cn</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container fb-inner">
      <span>© 2026 AHNU · AI Badminton Team.</span>
      <span>Code the Court · 智码羽击</span>
    </div>
  </div>
</footer>

<script>
// ===== JOIN CARD =====
const joinCard = document.getElementById('join-card');
const joinPrompt = document.getElementById('join-prompt');
const joinForm = document.getElementById('join-form');
const joinName = document.getElementById('join-name');
const joinMsg = document.getElementById('join-msg');

joinCard.addEventListener('click', (e) => {
  // 表单内点击不要再次触发
  if (joinForm.classList.contains('show')) return;
  if (e.target.closest('#join-form')) return;
  joinPrompt.style.display = 'none';
  joinForm.classList.add('show');
  joinName.focus();
});

joinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  joinMsg.className = 'join-msg';
  joinMsg.textContent = '';
  const name = joinName.value.trim();
  if (!name) return;

  const btn = joinForm.querySelector('button');
  btn.disabled = true;
  btn.textContent = '提交中…';

  try {
    const r = await fetch('/api/squad-interest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await r.json();
    if (data.ok) {
      joinMsg.className = 'join-msg ok';
      joinMsg.textContent = '✓ 已记录,欢迎你!';
      joinName.value = '';
      setTimeout(() => {
        joinPrompt.style.display = '';
        joinForm.classList.remove('show');
      }, 2000);
    } else {
      throw new Error(data.error || '提交失败');
    }
  } catch (err) {
    joinMsg.className = 'join-msg err';
    joinMsg.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = '报名';
  }
});

// 平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
</script>
</body>
</html>`;