/**
 * Deno Deploy:匿名好感收集
 * 单一文件,内置填表页和展示页,自带 KV(Deno KV)存储
 */

// ============ 数据存储 ============
// Deno Deploy 自带 KV,免费,无需额外配置
async function getKv() {
  return await Deno.openKv();
}

// ============ 工具 ============
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

// ============ API 路由 ============
async function handleSubmit(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const nickname = String(body.nickname || "").trim().slice(0, 50);
    const crush = String(body.crush || "").trim().slice(0, 50);

    if (!nickname || !crush) {
      return json({ ok: false, error: "昵称和有好感的同学都得填" }, 400);
    }

    const id = crypto.randomUUID();
    const record = {
      id,
      nickname,
      crush,
      createdAt: new Date().toISOString(),
    };

    const kv = await getKv();
    // key 用 -timestamp 让 list 倒序遍历时最新在前
    const ts = Date.now();
    const key = ["submissions", String(ts).padStart(15, "0") + "-" + id];
    await kv.set(key, record);

    return json({ ok: true, record });
  } catch (e) {
    return json({ ok: false, error: "提交失败:" + (e as Error).message }, 500);
  }
}

async function handleList(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    const kv = await getKv();
    const items: any[] = [];
    // 倒序遍历所有 submissions
    for await (const entry of kv.list({ prefix: ["submissions"] }, { reverse: true })) {
      items.push(entry.value);
    }
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: "拉取失败:" + (e as Error).message }, 500);
  }
}

// ============ 页面 ============
const INDEX_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>匿名填写</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;
    background:linear-gradient(135deg,#ffeef8 0%,#e7f0ff 100%);
    min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
  .card{background:#fff;border-radius:20px;padding:40px 32px;width:100%;max-width:420px;
    box-shadow:0 20px 60px rgba(0,0,0,.08)}
  h1{font-size:22px;color:#333;margin-bottom:8px;text-align:center}
  .sub{color:#999;font-size:13px;text-align:center;margin-bottom:28px}
  label{display:block;font-size:14px;color:#555;margin-bottom:6px;font-weight:500}
  input{width:100%;padding:14px 16px;border:2px solid #eee;border-radius:12px;
    font-size:15px;transition:.2s;background:#fafbfc}
  input:focus{outline:none;border-color:#ff8fb1;background:#fff}
  .field{margin-bottom:18px}
  button{width:100%;padding:15px;background:linear-gradient(135deg,#ff8fb1,#a78bfa);
    color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:600;
    cursor:pointer;margin-top:8px;transition:.2s}
  button:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(255,143,177,.3)}
  button:disabled{opacity:.6;cursor:not-allowed;transform:none}
  .msg{margin-top:16px;padding:12px;border-radius:10px;font-size:14px;text-align:center;display:none}
  .msg.ok{display:block;background:#e7f8ee;color:#2a8a4a}
  .msg.err{display:block;background:#fde8eb;color:#c9305a}
  .heart{text-align:center;font-size:30px;margin-bottom:8px}
</style>
</head>
<body>
<div class="card">
  <div class="heart">💌</div>
  <h1>填写一下</h1>
  <p class="sub">完全匿名,放心填</p>
  <form id="f">
    <div class="field">
      <label>昵称</label>
      <input name="nickname" placeholder="你的昵称" required maxlength="50" />
    </div>
    <div class="field">
      <label>有好感的班里同学</label>
      <input name="crush" placeholder="TA 的名字" required maxlength="50" />
    </div>
    <button type="submit" id="btn">提交</button>
    <div class="msg" id="msg"></div>
  </form>
</div>
<script>
const f = document.getElementById('f');
const btn = document.getElementById('btn');
const msg = document.getElementById('msg');

f.addEventListener('submit', async (e) => {
  e.preventDefault();
  btn.disabled = true;
  btn.textContent = '提交中…';
  msg.className = 'msg';
  msg.textContent = '';

  const fd = new FormData(f);
  try {
    const r = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nickname: fd.get('nickname'),
        crush: fd.get('crush'),
      }),
    });
    const data = await r.json();
    if (data.ok) {
      msg.className = 'msg ok';
      msg.textContent = '提交成功 ✨';
      f.reset();
    } else {
      throw new Error(data.error || '提交失败');
    }
  } catch (e) {
    msg.className = 'msg err';
    msg.textContent = e.message;
  } finally {
    btn.disabled = false;
    btn.textContent = '提交';
  }
});
</script>
</body>
</html>`;

const VIEW_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>收集结果</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;
    background:linear-gradient(135deg,#fff5e7 0%,#e7f0ff 100%);
    min-height:100vh;padding:24px 16px}
  .wrap{max-width:680px;margin:0 auto}
  h1{font-size:24px;color:#333;margin-bottom:6px;text-align:center}
  .stat{text-align:center;color:#888;font-size:13px;margin-bottom:20px}
  .toolbar{display:flex;gap:8px;justify-content:center;margin-bottom:20px}
  .toolbar button{padding:8px 16px;border:1px solid #ddd;background:#fff;
    border-radius:8px;font-size:13px;cursor:pointer;color:#555}
  .toolbar button:hover{background:#f5f5f5}
  table{width:100%;background:#fff;border-radius:16px;overflow:hidden;
    box-shadow:0 10px 40px rgba(0,0,0,.06);border-collapse:collapse}
  th,td{padding:14px 16px;text-align:left;font-size:14px;border-bottom:1px solid #f0f0f0}
  th{background:#fafbfc;color:#666;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.5px}
  tr:last-child td{border-bottom:none}
  .empty{padding:60px 20px;text-align:center;color:#bbb;font-size:14px}
  .time{color:#999;font-size:12px}
  .badge{display:inline-block;padding:3px 10px;background:#fff0f5;color:#d63384;
    border-radius:10px;font-size:12px;font-weight:500}
  .ranking{margin-top:24px;background:#fff;border-radius:16px;padding:20px;
    box-shadow:0 10px 40px rgba(0,0,0,.06)}
  .ranking h2{font-size:16px;color:#333;margin-bottom:12px}
  .rank-item{display:flex;align-items:center;padding:8px 0;gap:12px}
  .rank-num{width:24px;height:24px;border-radius:50%;background:#f0f0f0;
    color:#666;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600}
  .rank-num.top{background:linear-gradient(135deg,#ffd700,#ff8c00);color:#fff}
  .rank-name{flex:1;color:#333;font-size:14px}
  .rank-count{color:#888;font-size:13px}
</style>
</head>
<body>
<div class="wrap">
  <h1>📊 收集结果</h1>
  <p class="stat" id="stat">加载中…</p>
  <div class="toolbar">
    <button onclick="load()">🔄 刷新</button>
    <button onclick="exportCSV()">⬇️ 导出 CSV</button>
  </div>
  <table>
    <thead>
      <tr><th>昵称</th><th>有好感的同学</th><th>时间</th></tr>
    </thead>
    <tbody id="tbody"><tr><td colspan="3" class="empty">还没有数据</td></tr></tbody>
  </table>
  <div class="ranking" id="ranking" style="display:none">
    <h2>🏆 好感榜(被提名次数)</h2>
    <div id="rankList"></div>
  </div>
</div>
<script>
let items = [];

async function load() {
  document.getElementById('stat').textContent = '加载中…';
  try {
    const r = await fetch('/api/list');
    const data = await r.json();
    if (!data.ok) throw new Error('拉取失败');
    items = data.items;
    render();
  } catch (e) {
    document.getElementById('stat').textContent = '加载失败:' + e.message;
  }
}

function render() {
  const tbody = document.getElementById('tbody');
  document.getElementById('stat').textContent = '共 ' + items.length + ' 条';

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty">还没有数据</td></tr>';
    document.getElementById('ranking').style.display = 'none';
    return;
  }

  tbody.innerHTML = items.map(it => \`
    <tr>
      <td><span class="badge">\${escape(it.nickname)}</span></td>
      <td>\${escape(it.crush)}</td>
      <td class="time">\${formatTime(it.createdAt)}</td>
    </tr>
  \`).join('');

  const counts = {};
  items.forEach(it => { counts[it.crush] = (counts[it.crush] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  document.getElementById('ranking').style.display = 'block';
  document.getElementById('rankList').innerHTML = sorted.map(([name, cnt], i) => \`
    <div class="rank-item">
      <div class="rank-num \${i<3?'top':''}">\${i+1}</div>
      <div class="rank-name">\${escape(name)}</div>
      <div class="rank-count">\${cnt} 票</div>
    </div>
  \`).join('');
}

function formatTime(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return \`\${d.getMonth()+1}-\${pad(d.getDate())} \${pad(d.getHours())}:\${pad(d.getMinutes())}\`;
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function exportCSV() {
  if (items.length === 0) return alert('还没有数据');
  const lines = ['昵称,有好感的同学,提交时间'];
  items.forEach(it => {
    lines.push(\`\${csvEsc(it.nickname)},\${csvEsc(it.crush)},\${it.createdAt}\`);
  });
  const blob = new Blob(['\\ufeff' + lines.join('\\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '好感收集-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}

function csvEsc(s) { return '"' + String(s).replace(/"/g, '""') + '"'; }

load();
setInterval(load, 10000);
</script>
</body>
</html>`;

// ============ 路由分发 ============
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/api/submit") return handleSubmit(req);
  if (path === "/api/list") return handleList(req);

  if (path === "/" || path === "/index.html") {
    return new Response(INDEX_HTML, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (path === "/view" || path === "/view.html") {
    return new Response(VIEW_HTML, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return new Response("Not Found", { status: 404 });
});
