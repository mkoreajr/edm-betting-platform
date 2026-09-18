import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Database from "better-sqlite3";
import { z } from "zod";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const db = new Database(path.join(__dirname, "data", "edm.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS bet_slips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  league TEXT NOT NULL,
  match_count INTEGER NOT NULL,
  odds REAL NOT NULL,
  price_tzs INTEGER NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS slip_picks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slip_id INTEGER NOT NULL REFERENCES bet_slips(id) ON DELETE CASCADE,
  match TEXT NOT NULL,
  pick TEXT NOT NULL,
  odds REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slip_id INTEGER NOT NULL REFERENCES bet_slips(id) ON DELETE CASCADE,
  amount_tzs INTEGER NOT NULL,
  provider TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

function seed() {
  const count = db.prepare("SELECT COUNT(*) c FROM bet_slips").get().c;
  if (count) return;
  const slips = [
    ["EDM PREMIUM 01", "UEFA Champions League", 8, 18.5, 5000, "8 selections • premium analysis • daily release"],
    ["EDM PREMIUM 02", "Top European Leagues", 10, 24.2, 7500, "10 selections • value-focused accumulator"],
    ["EDM PREMIUM 03", "Weekend Mega Slip", 12, 32.8, 10000, "12 selections • weekend premium package"]
  ];
  const insert = db.prepare("INSERT INTO bet_slips(title,league,match_count,odds,price_tzs,description) VALUES(?,?,?,?,?,?)");
  const pick = db.prepare("INSERT INTO slip_picks(slip_id,match,pick,odds) VALUES(?,?,?,?)");
  const tx = db.transaction(() => {
    for (const s of slips) {
      const result = insert.run(...s);
      const teams = [
        ["Real Madrid vs Barcelona","Over 2.5",1.62],
        ["Arsenal vs Liverpool","Both Teams To Score",1.70],
        ["Inter Milan vs AC Milan","Inter Milan",1.80],
        ["Bayern Munich vs Dortmund","Over 2.5",1.55]
      ];
      for (let i = 0; i < s[2]; i++) {
        const t = teams[i % teams.length];
        pick.run(result.lastInsertRowid, t[0], t[1], t[2]);
      }
    }
  });
  tx();
}
seed();

function signUser(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}
function auth(req, res, next) {
  const token = req.cookies.edm_token;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Session expired" }); }
}
function admin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 80, standardHeaders: true, legacyHeaders: false });

app.post("/api/auth/register", authLimiter, async (req,res) => {
  const parsed = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(160),
    password: z.string().min(8).max(128)
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid registration details" });
  const { name, email, password } = parsed.data;
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = db.prepare("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)").run(name,email.toLowerCase(),hash);
    const user = db.prepare("SELECT id,name,email,role FROM users WHERE id=?").get(result.lastInsertRowid);
    res.cookie("edm_token", signUser(user), { httpOnly:true, sameSite:"lax", secure:NODE_ENV==="production", maxAge:7*24*60*60*1000 });
    res.json({ user });
  } catch {
    res.status(409).json({ error: "Email is already registered" });
  }
});

app.post("/api/auth/login", authLimiter, async (req,res) => {
  const parsed = z.object({ email:z.string().trim().email(), password:z.string().min(1).max(128) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:"Invalid login details" });
  const {email,password}=parsed.data;
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email.toLowerCase());
  if (!user || !(await bcrypt.compare(password,user.password_hash))) return res.status(401).json({error:"Invalid email or password"});
  const safe = {id:user.id,name:user.name,email:user.email,role:user.role};
  res.cookie("edm_token", signUser(safe), { httpOnly:true, sameSite:"lax", secure:NODE_ENV==="production", maxAge:7*24*60*60*1000 });
  res.json({user:safe});
});

app.post("/api/auth/logout",(req,res)=>{ res.clearCookie("edm_token"); res.json({ok:true}); });
app.get("/api/me",auth,(req,res)=>res.json({user:db.prepare("SELECT id,name,email,role FROM users WHERE id=?").get(req.user.id)}));

app.get("/api/hot-matches",(req,res)=>res.json([
  {home:"Real Madrid",away:"Barcelona",time:"20:00",homeLogo:"https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",awayLogo:"https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"},
  {home:"Arsenal",away:"Liverpool",time:"18:30",homeLogo:"https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",awayLogo:"https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"},
  {home:"Inter Milan",away:"AC Milan",time:"21:00",homeLogo:"https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",awayLogo:"https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg"},
  {home:"Bayern Munich",away:"Dortmund",time:"19:30",homeLogo:"https://upload.wikimedia.org/wikipedia/en/1/1f/FC_Bayern_Munich_logo_%282017%29.svg",awayLogo:"https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg"}
]));

app.get("/api/slips",(req,res)=>{
  const slips = db.prepare("SELECT id,title,league,match_count,odds,price_tzs,description,status,created_at FROM bet_slips WHERE status='active' ORDER BY id").all();
  res.json({slips});
});

app.get("/api/slips/:id",(req,res)=>{
  const slip=db.prepare("SELECT id,title,league,match_count,odds,price_tzs,description,status FROM bet_slips WHERE id=? AND status='active'").get(req.params.id);
  if(!slip) return res.status(404).json({error:"Slip not found"});
  res.json({slip});
});

app.post("/api/payments/demo-confirm",auth,(req,res)=>{
  const parsed=z.object({slipId:z.coerce.number().int().positive(),provider:z.string().trim().min(2).max(40)}).safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:"Invalid payment request"});
  const slip=db.prepare("SELECT * FROM bet_slips WHERE id=? AND status='active'").get(parsed.data.slipId);
  if(!slip) return res.status(404).json({error:"Slip not found"});
  const existing=db.prepare("SELECT * FROM purchases WHERE user_id=? AND slip_id=? AND status='paid'").get(req.user.id,slip.id);
  if(existing) return res.json({purchase:existing});
  const reference="EDM-"+Date.now()+"-"+crypto.randomBytes(3).toString("hex").toUpperCase();
  const result=db.prepare("INSERT INTO purchases(user_id,slip_id,amount_tzs,provider,reference,status,paid_at) VALUES(?,?,?,?,?,'paid',CURRENT_TIMESTAMP)").run(req.user.id,slip.id,slip.price_tzs,parsed.data.provider,reference);
  res.json({purchase:db.prepare("SELECT * FROM purchases WHERE id=?").get(result.lastInsertRowid)});
});

app.get("/api/purchases",auth,(req,res)=>{
  const rows=db.prepare(`
    SELECT p.id,p.reference,p.amount_tzs,p.provider,p.status,p.paid_at,p.created_at,
           s.id slip_id,s.title,s.league,s.match_count,s.odds
    FROM purchases p JOIN bet_slips s ON s.id=p.slip_id
    WHERE p.user_id=? ORDER BY p.id DESC
  `).all(req.user.id);
  res.json({purchases:rows});
});

app.get("/api/slips/:id/unlock",auth,(req,res)=>{
  const slip=db.prepare("SELECT id,title,league,match_count,odds,price_tzs,description FROM bet_slips WHERE id=? AND status='active'").get(req.params.id);
  if(!slip) return res.status(404).json({error:"Slip not found"});
  const paid=db.prepare("SELECT id,reference,paid_at FROM purchases WHERE user_id=? AND slip_id=? AND status='paid'").get(req.user.id,slip.id);
  if(!paid) return res.status(402).json({error:"Payment required"});
  const picks=db.prepare("SELECT match,pick,odds FROM slip_picks WHERE slip_id=? ORDER BY id").all(slip.id);
  res.json({slip,purchase:paid,picks,slipCode:`${slip.id}-${paid.reference.slice(-6)}`});
});

app.get("/api/admin/overview",auth,admin,(req,res)=>{
  res.json({
    users:db.prepare("SELECT COUNT(*) c FROM users").get().c,
    slips:db.prepare("SELECT COUNT(*) c FROM bet_slips").get().c,
    purchases:db.prepare("SELECT COUNT(*) c FROM purchases WHERE status='paid'").get().c,
    revenue:db.prepare("SELECT COALESCE(SUM(amount_tzs),0) c FROM purchases WHERE status='paid'").get().c
  });
});
app.get("/api/admin/slips",auth,admin,(req,res)=>res.json({slips:db.prepare("SELECT * FROM bet_slips ORDER BY id DESC").all()}));
app.post("/api/admin/slips",auth,admin,(req,res)=>{
  const parsed=z.object({title:z.string().min(2).max(120),league:z.string().min(2).max(120),match_count:z.coerce.number().int().positive().max(100),odds:z.coerce.number().positive().max(100000),price_tzs:z.coerce.number().int().nonnegative(),description:z.string().max(500)}).safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:"Invalid slip"});
  const d=parsed.data;
  const result=db.prepare("INSERT INTO bet_slips(title,league,match_count,odds,price_tzs,description) VALUES(?,?,?,?,?,?)").run(d.title,d.league,d.match_count,d.odds,d.price_tzs,d.description);
  res.json({slip:db.prepare("SELECT * FROM bet_slips WHERE id=?").get(result.lastInsertRowid)});
});
app.patch("/api/admin/slips/:id/status",auth,admin,(req,res)=>{
  const parsed=z.object({status:z.enum(["active","hidden"])}).safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:"Invalid status"});
  db.prepare("UPDATE bet_slips SET status=? WHERE id=?").run(parsed.data.status,req.params.id);
  res.json({ok:true});
});

app.use((req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`EDM running on http://localhost:${PORT}`));
