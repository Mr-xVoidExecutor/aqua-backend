require("dotenv").config();
const express = require("express"), fs = require("fs"), crypto = require("crypto");
const P = require("./providers"), env = process.env;
if (!env.APP_TOKEN || !env.APP_SECRET) { console.error("APP_TOKEN ও APP_SECRET .env এ দিন"); process.exit(1); }

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

// ---------- সিকিউরিটি: সব /api রিকোয়েস্টে App Token লাগবে ----------
app.use("/api", (req, res, next) => {
  const a = Buffer.from(req.get("x-app-token") || ""), b = Buffer.from(env.APP_TOKEN);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: "Unauthorized" });
  next();
});

const fill = (s = "", e = env) => s.replace(/\{(\w+)\}/g, (_, k) => e[k] || "");
const missing = p => p.e.filter(k => !env[k]);
const fail = (res, s, error) => res.status(s).json({ error });

// ---------- সাধারণ আপস্ট্রিম কল ----------
async function upstream(base, path, { method = "GET", body, headers = {} } = {}) {
  const r = await fetch(base + path, {
    method, signal: AbortSignal.timeout(15000),
    headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body && typeof body === "object" ? JSON.stringify(body) : body
  });
  const txt = await r.text(); let data; try { data = JSON.parse(txt); } catch { data = txt; }
  return { status: r.status, data };
}
async function callProvider(p, { method, path, body }) {
  const h = p.h ? await p.h(env) : {};
  return upstream(fill(p.b), fill(path), { method: method || p.m, body: body ?? p.d, headers: h });
}

// ---------- বিশেষ টেস্ট: AWS ও SSH ----------
async function testAws() {
  const { STSClient, GetCallerIdentityCommand } = await import("@aws-sdk/client-sts");
  const r = await new STSClient({ region: env.AWS_REGION || "us-east-1" }).send(new GetCallerIdentityCommand({}));
  return { ok: true, status: 200, note: "AWS Account " + r.Account };
}
async function testSsh() {
  const { Client } = require("ssh2");
  return new Promise((ok, no) => {
    const c = new Client();
    c.on("ready", () => c.exec("echo ok", (e, s) => { if (e) return no(e); s.on("close", () => { c.end(); ok({ ok: true, status: 200 }); }).resume(); }))
      .on("error", no)
      .connect({ host: env.SSH_HOST, port: +env.SSH_PORT || 22, username: env.SSH_USER, privateKey: env.SSH_PRIVATE_KEY.replace(/\\n/g, "\n"), readyTimeout: 10000 });
  });
}

// ---------- রুট: টুল তালিকা (কোনটার Key সেট আছে) ----------
app.get("/api/tools", (_, res) => res.json(Object.entries(P).map(([name, p]) => ({ name, configured: !missing(p).length }))));

// ---------- রুট: কানেকশন টেস্ট ----------
app.post("/api/test/:tool", async (req, res) => {
  const p = P[req.params.tool]; if (!p) return fail(res, 404, "অজানা টুল");
  const m = missing(p); if (m.length) return fail(res, 400, ".env এ নেই: " + m.join(", "));
  try {
    if (p.aws) return res.json(await testAws());
    if (p.ssh) return res.json(await testSsh());
    if (!p.b) return res.json({ ok: true, status: 0, note: "Key আছে; এই টুলের ফ্লো এখনো যোগ হয়নি (providers.js দেখুন)" });
    const r = await callProvider(p, { path: p.t });
    res.json({ ok: r.status < 300, status: r.status }); // রেসপন্স ডাটা ফেরত দেওয়া হয় না
  } catch (e) { fail(res, 502, "কানেকশন ব্যর্থ: " + (e.message || e)); }
});

// ---------- রুট: যেকোনো অফিসিয়াল API প্রক্সি (Key সার্ভারে ইনজেক্ট হয়) ----------
app.all("/api/p/:tool/*", async (req, res) => {
  const p = P[req.params.tool]; if (!p || !p.b) return fail(res, 501, "এই টুলে প্রক্সি নেই");
  const m = missing(p); if (m.length) return fail(res, 400, ".env এ নেই: " + m.join(", "));
  try {
    const q = req.url.includes("?") ? "?" + req.url.split("?").slice(1).join("?") : "";
    const r = await callProvider(p, { method: req.method, path: "/" + req.params[0] + q, body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body });
    res.status(r.status).json(r.data);
  } catch (e) { fail(res, 502, e.message); }
});

// ---------- অ্যাডমিন প্যানেল (Key এনক্রিপ্ট করে রাখা হয়) ----------
const FILE = "data/admins.json", KEY = crypto.createHash("sha256").update(env.APP_SECRET).digest();
const enc = t => { const iv = crypto.randomBytes(12), c = crypto.createCipheriv("aes-256-gcm", KEY, iv); const d = Buffer.concat([c.update(t, "utf8"), c.final()]); return [iv, c.getAuthTag(), d].map(b => b.toString("base64")).join("."); };
const dec = s => { const [iv, tag, d] = s.split(".").map(x => Buffer.from(x, "base64")); const c = crypto.createDecipheriv("aes-256-gcm", KEY, iv); c.setAuthTag(tag); return Buffer.concat([c.update(d), c.final()]).toString("utf8"); };
const load = () => { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return []; } };
const store = a => { fs.mkdirSync("data", { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(a), { mode: 0o600 }); };

app.get("/api/admins", (_, res) => res.json(load().map(({ id, n, u, mask }) => ({ id, n, u, mask }))));
app.post("/api/admins", (req, res) => {
  const { n, u, k } = req.body || {};
  try { new URL(u); } catch { return fail(res, 400, "সঠিক URL দিন"); }
  if (!n || !k) return fail(res, 400, "নাম ও Key দিন");
  const a = load(); a.push({ id: crypto.randomUUID(), n, u: u.replace(/\/$/, ""), mask: "••••" + k.slice(-4), k: enc(k) });
  store(a); res.json({ ok: true });
});
app.delete("/api/admins/:id", (req, res) => { store(load().filter(a => a.id !== req.params.id)); res.json({ ok: true }); });

// অ্যাডমিন ব্যাকএন্ডে কল: /api/admin/<id>/<path>
app.all("/api/admin/:id/*", async (req, res) => {
  const a = load().find(x => x.id === req.params.id); if (!a) return fail(res, 404, "প্যানেল নেই");
  try {
    const k = dec(a.k), q = req.url.includes("?") ? "?" + req.url.split("?").slice(1).join("?") : "";
    const r = await upstream(a.u, "/" + req.params[0] + q, { method: req.method, body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body, headers: { Authorization: "Bearer " + k, "X-API-Key": k } });
    res.status(r.status).json(r.data);
  } catch (e) { fail(res, 502, e.message); }
});

app.listen(env.PORT || 3000, () => console.log("Aqua Hub চালু: http://localhost:" + (env.PORT || 3000)));
