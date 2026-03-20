// ============================================================
//  PLUGIN-BASED CMS — LAYERED ARCHITECTURE (React, runnable)
//  Layers: Presentation → Application → Domain → Infrastructure
// ============================================================

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// LAYER 4: INFRASTRUCTURE — Database (in-memory) + Repositories
// ─────────────────────────────────────────────────────────────
const DB = {
  contents: [
    { id: 1, title: "Giới thiệu CMS", body: "Hệ thống quản lý nội dung dựa trên plugin.", status: "published", author: "admin", category: "guide", createdAt: "2024-01-10" },
    { id: 2, title: "Cài đặt Plugin SEO", body: "Hướng dẫn cài và cấu hình plugin SEO cho hệ thống.", status: "draft", author: "editor", category: "tutorial", createdAt: "2024-02-05" },
    { id: 3, title: "Bảo mật hệ thống", body: "Các bước tăng cường bảo mật cho CMS của bạn.", status: "published", author: "admin", category: "security", createdAt: "2024-03-01" },
  ],
  users: [
    { id: 1, username: "admin",  password: "admin123",  role: "admin",  email: "admin@cms.io",  avatar: "A" },
    { id: 2, username: "editor", password: "editor123", role: "editor", email: "editor@cms.io", avatar: "E" },
    { id: 3, username: "viewer", password: "viewer123", role: "viewer", email: "viewer@cms.io", avatar: "V" },
  ],
  plugins: [
    { id: 1, name: "SEO Optimizer",  version: "2.1.0", active: true,  category: "content",   description: "Tối ưu SEO tự động cho mọi bài viết." },
    { id: 2, name: "Media Manager",  version: "1.4.2", active: true,  category: "content",   description: "Quản lý hình ảnh và tài nguyên media." },
    { id: 3, name: "OAuth Provider", version: "3.0.1", active: true,  category: "auth",      description: "Xác thực qua Google, GitHub, Facebook." },
    { id: 4, name: "RBAC Manager",   version: "1.2.0", active: false, category: "auth",      description: "Phân quyền theo vai trò chi tiết." },
    { id: 5, name: "Cache Engine",   version: "2.0.0", active: true,  category: "extension", description: "Tăng tốc độ tải trang bằng caching." },
    { id: 6, name: "Analytics",      version: "1.1.3", active: false, category: "extension", description: "Theo dõi lượt xem và hành vi người dùng." },
  ],
  nextContentId: 4,
};

// Infrastructure: Repository pattern
const ContentRepository = {
  findAll: () => Promise.resolve([...DB.contents]),
  findById: (id) => Promise.resolve(DB.contents.find(c => c.id === id) || null),
  save: (content) => {
    const now = new Date().toISOString().split("T")[0];
    if (content.id) {
      const idx = DB.contents.findIndex(c => c.id === content.id);
      if (idx !== -1) DB.contents[idx] = { ...content };
      return Promise.resolve(DB.contents[idx]);
    }
    const newItem = { ...content, id: DB.nextContentId++, createdAt: now };
    DB.contents.push(newItem);
    return Promise.resolve(newItem);
  },
  delete: (id) => {
    DB.contents = DB.contents.filter(c => c.id !== id);
    return Promise.resolve(true);
  },
};

const UserRepository = {
  findByCredentials: (username, password) =>
    Promise.resolve(DB.users.find(u => u.username === username && u.password === password) || null),
  findAll: () => Promise.resolve([...DB.users]),
};

const PluginRepository = {
  findAll: () => Promise.resolve([...DB.plugins]),
  toggle: (id) => {
    const p = DB.plugins.find(p => p.id === id);
    if (p) p.active = !p.active;
    return Promise.resolve([...DB.plugins]);
  },
};

// ─────────────────────────────────────────────────────────────
// LAYER 3: DOMAIN — Business Logic & Entities
// ─────────────────────────────────────────────────────────────
const ContentEntity = {
  validate: (data) => {
    const errors = {};
    if (!data.title || data.title.trim().length < 3) errors.title = "Tiêu đề phải có ít nhất 3 ký tự";
    if (!data.body  || data.body.trim().length  < 5) errors.body  = "Nội dung phải có ít nhất 5 ký tự";
    return errors;
  },
  canEdit: (user, content) =>
    user?.role === "admin" || user?.username === content?.author,
  canDelete: (user) => user?.role === "admin",
};

const AuthEntity = {
  hasPermission: (user, action) => {
    const rules = {
      admin:  ["read","create","edit","delete","manage_plugins","manage_users"],
      editor: ["read","create","edit"],
      viewer: ["read"],
    };
    return rules[user?.role]?.includes(action) ?? false;
  },
};

// ─────────────────────────────────────────────────────────────
// LAYER 2: APPLICATION — Use Cases / Services
// ─────────────────────────────────────────────────────────────
const AuthService = {
  login: async (username, password) => {
    const user = await UserRepository.findByCredentials(username, password);
    if (!user) throw new Error("Sai tên đăng nhập hoặc mật khẩu");
    const { password: _, ...safeUser } = user;
    return safeUser;
  },
};

const ContentService = {
  getAll: () => ContentRepository.findAll(),
  getById: (id) => ContentRepository.findById(id),
  create: async (data, user) => {
    if (!AuthEntity.hasPermission(user, "create")) throw new Error("Không có quyền tạo nội dung");
    const errors = ContentEntity.validate(data);
    if (Object.keys(errors).length) throw Object.assign(new Error("Validation"), { fields: errors });
    return ContentRepository.save({ ...data, author: user.username, status: data.status || "draft" });
  },
  update: async (id, data, user) => {
    if (!AuthEntity.hasPermission(user, "edit")) throw new Error("Không có quyền chỉnh sửa");
    const existing = await ContentRepository.findById(id);
    if (!existing) throw new Error("Không tìm thấy nội dung");
    if (!ContentEntity.canEdit(user, existing)) throw new Error("Bạn chỉ có thể chỉnh sửa nội dung của mình");
    const errors = ContentEntity.validate(data);
    if (Object.keys(errors).length) throw Object.assign(new Error("Validation"), { fields: errors });
    return ContentRepository.save({ ...existing, ...data, id });
  },
  delete: async (id, user) => {
    if (!ContentEntity.canDelete(user)) throw new Error("Chỉ admin mới có thể xoá");
    return ContentRepository.delete(id);
  },
};

const PluginService = {
  getAll: () => PluginRepository.findAll(),
  toggle: async (id, user) => {
    if (!AuthEntity.hasPermission(user, "manage_plugins")) throw new Error("Không có quyền quản lý plugin");
    return PluginRepository.toggle(id);
  },
};

// ─────────────────────────────────────────────────────────────
// LAYER 1: PRESENTATION — React UI Components
// ─────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#0f1117; --bg2:#171b25; --bg3:#1e2332; --border:#2a3045;
    --accent:#4f8ef7; --accent2:#7c6af7; --green:#3ecf8e;
    --red:#f76f6f; --amber:#f7b94f; --text:#e2e8f0; --muted:#64748b;
    --radius:10px; --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
  }
  body { font-family:var(--font); background:var(--bg); color:var(--text); min-height:100vh; }
  .app { display:flex; min-height:100vh; }
  .sidebar { width:220px; min-height:100vh; background:var(--bg2); border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; }
  .main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .topbar { height:56px; background:var(--bg2); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 24px; gap:10px; flex-shrink:0; }
  .content-area { flex:1; padding:28px 32px; overflow-y:auto; }
  .sidebar-logo { padding:20px 18px 12px; display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border); }
  .logo-icon { width:30px; height:30px; background:linear-gradient(135deg,var(--accent),var(--accent2)); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff; font-family:var(--mono); flex-shrink:0; }
  .logo-text { font-size:13px; font-weight:600; letter-spacing:.5px; }
  .logo-text span { color:var(--muted); font-weight:400; }
  .nav { padding:12px 10px; flex:1; }
  .nav-section { font-size:10px; text-transform:uppercase; letter-spacing:1.2px; color:var(--muted); padding:8px 8px 4px; margin-top:8px; }
  .nav-item { display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:8px; cursor:pointer; font-size:13.5px; color:var(--muted); transition:all .15s; margin-bottom:2px; border:none; background:none; width:100%; text-align:left; font-family:var(--font); }
  .nav-item:hover { background:var(--bg3); color:var(--text); }
  .nav-item.active { background:rgba(79,142,247,.12); color:var(--accent); }
  .sidebar-user { padding:14px 16px; border-top:1px solid var(--border); display:flex; align-items:center; gap:10px; }
  .avatar { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; flex-shrink:0; }
  .avatar-sm { width:24px; height:24px; font-size:10px; }
  .user-info { flex:1; min-width:0; }
  .user-name { font-size:13px; font-weight:500; }
  .user-role { font-size:11px; color:var(--muted); text-transform:capitalize; }
  .layer-badge { font-family:var(--mono); font-size:10px; padding:2px 7px; border-radius:4px; border:1px solid; white-space:nowrap; display:inline-block; }
  .layer-p { color:#4f8ef7; border-color:rgba(79,142,247,.3); background:rgba(79,142,247,.08); }
  .layer-a { color:#7c6af7; border-color:rgba(124,106,247,.3); background:rgba(124,106,247,.08); }
  .layer-d { color:#3ecf8e; border-color:rgba(62,207,142,.3); background:rgba(62,207,142,.08); }
  .layer-i { color:#f7b94f; border-color:rgba(247,185,79,.3); background:rgba(247,185,79,.08); }
  .card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:20px; }
  .card-sm { padding:14px 18px; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .grid-auto { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .stat-val { font-size:28px; font-weight:600; font-family:var(--mono); line-height:1; }
  .stat-lbl { font-size:12px; color:var(--muted); margin-top:4px; }
  table { width:100%; border-collapse:collapse; font-size:13.5px; }
  th { text-align:left; padding:10px 14px; font-size:11px; text-transform:uppercase; letter-spacing:.8px; color:var(--muted); border-bottom:1px solid var(--border); font-weight:500; }
  td { padding:11px 14px; border-bottom:1px solid rgba(42,48,69,.6); vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:rgba(255,255,255,.02); }
  .badge { display:inline-flex; align-items:center; gap:5px; font-size:11px; padding:3px 9px; border-radius:20px; font-weight:500; }
  .badge-green { background:rgba(62,207,142,.12); color:var(--green); }
  .badge-amber { background:rgba(247,185,79,.12); color:var(--amber); }
  .badge-red   { background:rgba(247,111,111,.12); color:var(--red); }
  .badge-blue  { background:rgba(79,142,247,.12);  color:var(--accent); }
  .badge-purple{ background:rgba(124,106,247,.12); color:var(--accent2); }
  .badge-dot { width:6px; height:6px; border-radius:50%; background:currentColor; flex-shrink:0; }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; border:none; transition:all .15s; font-family:var(--font); }
  .btn-primary { background:var(--accent); color:#fff; }
  .btn-primary:hover { background:#3a7de8; }
  .btn-ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .btn-ghost:hover { background:var(--bg3); color:var(--text); }
  .btn-danger { background:rgba(247,111,111,.12); color:var(--red); border:1px solid rgba(247,111,111,.2); }
  .btn-danger:hover { background:rgba(247,111,111,.2); }
  .btn-sm { padding:5px 11px; font-size:12px; border-radius:6px; }
  .btn-xs { padding:3px 8px; font-size:11px; border-radius:5px; }
  .form-group { margin-bottom:16px; }
  .form-label { display:block; font-size:12px; color:var(--muted); margin-bottom:6px; font-weight:500; text-transform:uppercase; letter-spacing:.5px; }
  input,textarea,select { width:100%; padding:9px 12px; background:var(--bg); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:13.5px; font-family:var(--font); outline:none; transition:border .15s; }
  input:focus,textarea:focus,select:focus { border-color:var(--accent); }
  textarea { resize:vertical; min-height:90px; }
  select option { background:var(--bg2); }
  .form-error { font-size:11px; color:var(--red); margin-top:4px; }
  .toggle { position:relative; width:36px; height:20px; flex-shrink:0; }
  .toggle input { opacity:0; width:0; height:0; position:absolute; }
  .toggle-slider { position:absolute; inset:0; background:var(--border); border-radius:20px; cursor:pointer; transition:.2s; }
  .toggle-slider::before { content:''; position:absolute; height:14px; width:14px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.2s; }
  .toggle input:checked + .toggle-slider { background:var(--accent); }
  .toggle input:checked + .toggle-slider::before { transform:translateX(16px); }
  .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.65); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
  .modal { background:var(--bg2); border:1px solid var(--border); border-radius:14px; width:100%; max-width:520px; padding:28px; }
  .modal-title { font-size:17px; font-weight:600; margin-bottom:20px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); }
  .login-box { width:360px; }
  .login-header { text-align:center; margin-bottom:32px; }
  .login-logo { width:48px; height:48px; background:linear-gradient(135deg,var(--accent),var(--accent2)); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; color:#fff; font-family:var(--mono); margin:0 auto 14px; }
  .login-title { font-size:22px; font-weight:600; }
  .login-sub { font-size:13px; color:var(--muted); margin-top:4px; }
  .login-hint { margin-top:16px; padding:12px; background:var(--bg3); border-radius:8px; font-size:12px; color:var(--muted); font-family:var(--mono); line-height:1.9; }
  .layer-stack { display:flex; flex-direction:column; gap:4px; margin-bottom:28px; }
  .layer-row { display:flex; align-items:center; gap:10px; padding:9px 16px; border-radius:8px; border:1px solid var(--border); background:var(--bg3); font-size:12.5px; flex-wrap:wrap; }
  .layer-row-active { border-color:var(--accent); background:rgba(79,142,247,.06); }
  .layer-name { font-weight:600; min-width:180px; }
  .layer-desc { color:var(--muted); font-size:12px; }
  .page-title { font-size:20px; font-weight:600; margin-bottom:4px; }
  .page-sub { font-size:13px; color:var(--muted); margin-bottom:24px; }
  .alert { padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:16px; }
  .alert-error   { background:rgba(247,111,111,.1); color:var(--red);   border:1px solid rgba(247,111,111,.2); }
  .alert-success { background:rgba(62,207,142,.1);  color:var(--green); border:1px solid rgba(62,207,142,.2); }
  .plugin-card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:16px 18px; display:flex; align-items:flex-start; gap:14px; transition:border .15s; }
  .plugin-card:hover { border-color:rgba(79,142,247,.3); }
  .plugin-icon { width:38px; height:38px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
  .flex { display:flex; }
  .flex-wrap { flex-wrap:wrap; }
  .flex-col { flex-direction:column; }
  .items-center { align-items:center; }
  .items-start { align-items:flex-start; }
  .justify-between { justify-content:justify-between; }
  .gap-1 { gap:4px; }
  .gap-2 { gap:8px; }
  .gap-3 { gap:12px; }
  .mb-2 { margin-bottom:8px; }
  .mb-3 { margin-bottom:12px; }
  .mb-4 { margin-bottom:16px; }
  .mb-6 { margin-bottom:24px; }
  .mt-2 { margin-top:8px; }
  .mt-4 { margin-top:16px; }
  .ml-auto { margin-left:auto; }
  .text-muted { color:var(--muted); font-size:13px; }
  .text-sm { font-size:12px; }
  .font-mono { font-family:var(--mono); }
  .font-600 { font-weight:600; }
  .divider { height:1px; background:var(--border); margin:20px 0; }
  .content-area::-webkit-scrollbar { width:4px; }
  .content-area::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
`;

// ── Helpers ───────────────────────────────────────────────────
const avatarColor = (role) =>
  role === "admin"  ? "linear-gradient(135deg,#f76f6f,#f7b94f)"
  : role === "editor" ? "linear-gradient(135deg,#4f8ef7,#7c6af7)"
  : "linear-gradient(135deg,#3ecf8e,#4f8ef7)";

const pluginIcon = (cat) =>
  cat === "content" ? "📝" : cat === "auth" ? "🔐" : "⚙️";

const catBadge = (cat) =>
  cat === "content" ? "badge-blue" : cat === "auth" ? "badge-purple" : "badge-amber";

// ── Layer Bar ─────────────────────────────────────────────────
function LayerBar({ active }) {
  const layers = [
    { key:"P", label:"Presentation Layer",   desc:"React UI Components · Routing · State",              cls:"layer-p" },
    { key:"A", label:"Application Layer",    desc:"ContentService · AuthService · PluginService",       cls:"layer-a" },
    { key:"D", label:"Domain Layer",         desc:"ContentEntity · AuthEntity · Business Rules",        cls:"layer-d" },
    { key:"I", label:"Infrastructure Layer", desc:"In-Memory DB · Repositories · Data Access",         cls:"layer-i" },
  ];
  return (
    <div className="layer-stack">
      {layers.map(l => (
        <div key={l.key} className={`layer-row${active === l.key ? " layer-row-active" : ""}`}>
          <span className={`layer-badge ${l.cls}`}>{l.key}</span>
          <span className="layer-name">{l.label}</span>
          <span className="layer-desc">{l.desc}</span>
        </div>
      ))}
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [form, setForm]     = useState({ username: "admin", password: "admin123" });
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true); setErr("");
    try { onLogin(await AuthService.login(form.username, form.password)); }
    catch (e) { setErr(e.message); setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">C</div>
          <div className="login-title">PluginCMS</div>
          <div className="login-sub">Layered Architecture · React + In-Memory DB</div>
        </div>
        <div className="card">
          {err && <div className="alert alert-error">{err}</div>}
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} placeholder="username" />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input type="password" value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))}
              onKeyDown={e => e.key === "Enter" && handle()}
              placeholder="password" />
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}}
            onClick={handle} disabled={loading}>
            {loading ? "Đang đăng nhập…" : "Đăng nhập →"}
          </button>
          <div className="login-hint">
            admin / admin123 &nbsp;→ full quyền<br/>
            editor / editor123 → tạo &amp; sửa<br/>
            viewer / viewer123 → chỉ xem
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard({ user }) {
  const [stats, setStats] = useState({ contents:0, published:0, plugins:0, active:0 });

  useEffect(() => {
    Promise.all([ContentService.getAll(), PluginService.getAll()]).then(([c, p]) =>
      setStats({ contents: c.length, published: c.filter(x => x.status==="published").length,
                 plugins: p.length,  active: p.filter(x => x.active).length })
    );
  }, []);

  return (
    <>
      <div className="page-title">Dashboard</div>
      <div className="page-sub">Tổng quan hệ thống Plugin-based CMS</div>
      <LayerBar active="P" />

      <div className="grid-4 mb-4">
        {[
          { val: stats.contents,  lbl:"Tổng nội dung",    color:"#4f8ef7" },
          { val: stats.published, lbl:"Đã xuất bản",      color:"#3ecf8e" },
          { val: stats.plugins,   lbl:"Tổng plugin",      color:"#7c6af7" },
          { val: stats.active,    lbl:"Plugin hoạt động", color:"#f7b94f" },
        ].map((s, i) => (
          <div className="card card-sm" key={i}>
            <div className="stat-val" style={{color:s.color}}>{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>Kiến trúc phân lớp</div>
          {[
            { l:"L1 Presentation", r:"React UI, routing, state",      cls:"layer-p" },
            { l:"L2 Application",  r:"Services, use-case logic",      cls:"layer-a" },
            { l:"L3 Domain",       r:"Entity, business rules",        cls:"layer-d" },
            { l:"L4 Infrastructure", r:"Repository, DB, data access", cls:"layer-i" },
          ].map(row => (
            <div key={row.l} className="flex items-center gap-3 mb-3">
              <span className={`layer-badge ${row.cls}`} style={{minWidth:130}}>{row.l}</span>
              <span className="text-muted">{row.r}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>3 Chức năng chính</div>
          {[
            { icon:"📝", name:"Content Management",  desc:"CRUD nội dung, versioning, publish", bg:"rgba(79,142,247,.08)" },
            { icon:"👤", name:"User & Permission",    desc:"Auth, RBAC, session, SSO",          bg:"rgba(124,106,247,.08)" },
            { icon:"🔌", name:"Plugin Management",    desc:"Lifecycle, registry, dependency",   bg:"rgba(247,185,79,.08)" },
          ].map(f => (
            <div key={f.name} className="flex items-center gap-3 mb-3"
              style={{padding:"10px 12px",background:f.bg,borderRadius:8}}>
              <span style={{fontSize:20}}>{f.icon}</span>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{f.name}</div>
                <div className="text-muted text-sm">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Content Modal ─────────────────────────────────────────────
function ContentModal({ item, user, onSave, onClose }) {
  const [form, setForm]   = useState(item || { title:"", body:"", status:"draft", category:"guide" });
  const [errors, setErrors] = useState({});
  const [msg, setMsg]     = useState("");

  const save = async () => {
    setErrors({}); setMsg("");
    try {
      if (item?.id) await ContentService.update(item.id, form, user);
      else          await ContentService.create(form, user);
      onSave();
    } catch (e) {
      if (e.fields) setErrors(e.fields);
      else setMsg(e.message);
    }
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          {item?.id ? "✏️ Chỉnh sửa" : "➕ Tạo nội dung"}
          <span className="layer-badge layer-a" style={{marginLeft:"auto"}}>Application Layer</span>
        </div>
        {msg && <div className="alert alert-error">{msg}</div>}
        <div className="form-group">
          <label className="form-label">Tiêu đề</label>
          <input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="Nhập tiêu đề..." />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Nội dung</label>
          <textarea value={form.body} onChange={e => setForm(f => ({...f, body:e.target.value}))} placeholder="Nhập nội dung..." />
          {errors.body && <div className="form-error">{errors.body}</div>}
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select value={form.status} onChange={e => setForm(f => ({...f, status:e.target.value}))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Danh mục</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
              <option value="guide">Guide</option>
              <option value="tutorial">Tutorial</option>
              <option value="security">Security</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2" style={{justifyContent:"space-between",marginTop:4}}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Huỷ</button>
          <button className="btn btn-primary btn-sm" onClick={save}>Lưu</button>
        </div>
      </div>
    </div>
  );
}

// ── Content Page ──────────────────────────────────────────────
function ContentPage({ user }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [msg, setMsg]     = useState(null);

  const load = useCallback(() => ContentService.getAll().then(setItems), []);
  useEffect(() => { load(); }, [load]);

  const del = async (id) => {
    try { await ContentService.delete(id, user); load(); flash("success","Đã xoá!"); }
    catch (e) { flash("error", e.message); }
  };

  const flash = (t, m) => { setMsg({t,m}); setTimeout(() => setMsg(null), 2500); };

  return (
    <>
      <div className="flex items-center" style={{justifyContent:"space-between",marginBottom:4}}>
        <div>
          <div className="page-title">📝 Content Management</div>
          <div className="page-sub">Quản lý nội dung qua Application + Domain Layer</div>
        </div>
        {AuthEntity.hasPermission(user,"create") && (
          <button className="btn btn-primary btn-sm" onClick={() => setModal({})}>+ Tạo mới</button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[["P","Presentation"],["A","ContentService"],["D","ContentEntity.validate()"],["I","ContentRepository"]].map(([k,v],i,a) => (
          <span key={k} className="flex items-center gap-2">
            <span className={`layer-badge layer-${k.toLowerCase()}`}>{v}</span>
            {i < a.length-1 && <span className="text-muted">→</span>}
          </span>
        ))}
      </div>

      {msg && <div className={`alert alert-${msg.t}`}>{msg.m}</div>}

      <div className="card">
        <table>
          <thead>
            <tr><th>Tiêu đề</th><th>Tác giả</th><th>Danh mục</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id}>
                <td style={{fontWeight:500}}>{c.title}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="avatar avatar-sm" style={{background:avatarColor(DB.users.find(u=>u.username===c.author)?.role)}}>
                      {c.author[0].toUpperCase()}
                    </div>
                    <span className="text-muted">{c.author}</span>
                  </div>
                </td>
                <td><span className="badge badge-blue">{c.category}</span></td>
                <td>
                  <span className={`badge ${c.status==="published"?"badge-green":"badge-amber"}`}>
                    <span className="badge-dot"/>{c.status}
                  </span>
                </td>
                <td className="text-muted font-mono text-sm">{c.createdAt}</td>
                <td>
                  <div className="flex gap-2">
                    {ContentEntity.canEdit(user,c) && (
                      <button className="btn btn-ghost btn-xs" onClick={() => setModal(c)}>Sửa</button>
                    )}
                    {ContentEntity.canDelete(user) && (
                      <button className="btn btn-danger btn-xs" onClick={() => del(c.id)}>Xoá</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <ContentModal item={modal.id ? modal : null} user={user}
          onSave={() => { load(); setModal(null); flash("success","Đã lưu!"); }}
          onClose={() => setModal(null)} />
      )}
    </>
  );
}

// ── Users Page ────────────────────────────────────────────────
function UsersPage({ user }) {
  const [users, setUsers] = useState([]);
  useEffect(() => { UserRepository.findAll().then(setUsers); }, []);

  if (!AuthEntity.hasPermission(user,"manage_users")) {
    return (
      <div className="card" style={{textAlign:"center",padding:48}}>
        <div style={{fontSize:36,marginBottom:12}}>🔒</div>
        <div style={{fontWeight:600,fontSize:16}}>Không có quyền truy cập</div>
        <div className="text-muted mt-2">Chức năng này yêu cầu quyền <strong>admin</strong></div>
      </div>
    );
  }

  return (
    <>
      <div className="page-title">👤 User & Permission Management</div>
      <div className="page-sub">Quản lý người dùng & phân quyền RBAC</div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[["P","Presentation"],["A","AuthService"],["D","AuthEntity.hasPermission()"],["I","UserRepository"]].map(([k,v],i,a) => (
          <span key={k} className="flex items-center gap-2">
            <span className={`layer-badge layer-${k.toLowerCase()}`}>{v}</span>
            {i < a.length-1 && <span className="text-muted">→</span>}
          </span>
        ))}
      </div>

      <div className="grid-3 mb-4">
        {[
          { role:"admin",  perms:["read","create","edit","delete","manage_plugins","manage_users"] },
          { role:"editor", perms:["read","create","edit"] },
          { role:"viewer", perms:["read"] },
        ].map(r => (
          <div className="card card-sm" key={r.role}>
            <div className="flex items-center gap-2 mb-3">
              <div className="avatar" style={{background:avatarColor(r.role)}}>{r.role[0].toUpperCase()}</div>
              <span style={{fontWeight:600,textTransform:"capitalize"}}>{r.role}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {r.perms.map(p => <span key={p} className="badge badge-blue text-sm">{p}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Quyền hạn</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="avatar" style={{background:avatarColor(u.role)}}>{u.avatar}</div>
                    <span style={{fontWeight:500}}>{u.username}</span>
                  </div>
                </td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <span className={`badge ${u.role==="admin"?"badge-red":u.role==="editor"?"badge-blue":"badge-green"}`}>
                    <span className="badge-dot"/>{u.role}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {["read","create","edit","delete","manage_plugins","manage_users"]
                      .filter(p => AuthEntity.hasPermission(u,p))
                      .map(p => <span key={p} className="badge badge-purple text-sm">{p}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Plugins Page ──────────────────────────────────────────────
function PluginsPage({ user }) {
  const [plugins, setPlugins] = useState([]);
  const [msg, setMsg]         = useState(null);
  useEffect(() => { PluginService.getAll().then(setPlugins); }, []);

  const toggle = async (id) => {
    try { setPlugins(await PluginService.toggle(id,user)); }
    catch (e) { setMsg({t:"error",m:e.message}); setTimeout(()=>setMsg(null),2500); }
  };

  const canManage = AuthEntity.hasPermission(user,"manage_plugins");
  const byCategory = plugins.reduce((acc,p) => { (acc[p.category]=acc[p.category]||[]).push(p); return acc; }, {});

  return (
    <>
      <div className="page-title">🔌 Plugin & Extension Management</div>
      <div className="page-sub">Quản lý vòng đời plugin — Loader, Registry, Lifecycle</div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[["P","Presentation"],["A","PluginService"],["D","AuthEntity.hasPermission()"],["I","PluginRepository"]].map(([k,v],i,a) => (
          <span key={k} className="flex items-center gap-2">
            <span className={`layer-badge layer-${k.toLowerCase()}`}>{v}</span>
            {i < a.length-1 && <span className="text-muted">→</span>}
          </span>
        ))}
      </div>

      {msg && <div className={`alert alert-${msg.t}`}>{msg.m}</div>}

      {Object.entries(byCategory).map(([cat, list]) => (
        <div key={cat} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span style={{fontWeight:600,fontSize:14,textTransform:"capitalize"}}>
              {pluginIcon(cat)} {cat} Plugins
            </span>
            <span className={`badge ${catBadge(cat)}`}>{list.length}</span>
          </div>
          <div className="grid-auto">
            {list.map(p => (
              <div className="plugin-card" key={p.id}
                style={p.active ? {borderColor:"rgba(79,142,247,.3)"} : {}}>
                <div className="plugin-icon"
                  style={{background: p.active ? "rgba(79,142,247,.12)" : "var(--bg3)"}}>
                  {pluginIcon(p.category)}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{fontWeight:600,fontSize:13,flex:1}}>{p.name}</span>
                    {canManage && (
                      <label className="toggle">
                        <input type="checkbox" checked={p.active} onChange={() => toggle(p.id)} />
                        <span className="toggle-slider" />
                      </label>
                    )}
                  </div>
                  <div className="text-muted text-sm mb-2">{p.description}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm" style={{color:"var(--muted)"}}>v{p.version}</span>
                    <span className={`badge ${p.active?"badge-green":"badge-amber"}`}>
                      <span className="badge-dot"/>{p.active?"active":"inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ── Architecture Page ─────────────────────────────────────────
function ArchPage() {
  return (
    <>
      <div className="page-title">🏛️ Layered Architecture</div>
      <div className="page-sub">Toàn bộ luồng dữ liệu qua các lớp trong hệ thống</div>

      <div className="grid-2" style={{gap:20,marginBottom:20}}>
        {[
          { key:"P", cls:"layer-p", title:"L1 — Presentation Layer", color:"#4f8ef7",
            items:["React Components (UI)","LoginPage, Dashboard, ContentPage","UsersPage, PluginsPage, ArchPage","useState / useEffect / useCallback","Event handlers & form state management"] },
          { key:"A", cls:"layer-a", title:"L2 — Application Layer", color:"#7c6af7",
            items:["AuthService.login()","ContentService.getAll/create/update/delete()","PluginService.getAll/toggle()","Use-case orchestration","Calls Domain rules + Infrastructure"] },
          { key:"D", cls:"layer-d", title:"L3 — Domain Layer", color:"#3ecf8e",
            items:["ContentEntity.validate(data)","ContentEntity.canEdit(user, content)","ContentEntity.canDelete(user)","AuthEntity.hasPermission(user, action)","RBAC rules: admin / editor / viewer"] },
          { key:"I", cls:"layer-i", title:"L4 — Infrastructure Layer", color:"#f7b94f",
            items:["DB object (in-memory JavaScript)","ContentRepository: findAll/findById/save/delete","UserRepository: findByCredentials/findAll","PluginRepository: findAll/toggle","Promise-based async API (drop-in for real DB)"] },
        ].map(l => (
          <div className="card" key={l.key} style={{borderColor:l.color+"33"}}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`layer-badge ${l.cls}`}>{l.key}</span>
              <span style={{fontWeight:600,fontSize:14,color:l.color}}>{l.title}</span>
            </div>
            <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
              {l.items.map((it,i) => (
                <li key={i} className="flex items-center gap-2">
                  <span style={{width:5,height:5,borderRadius:"50%",background:l.color,flexShrink:0}}/>
                  <span className="font-mono text-sm">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{fontWeight:600,fontSize:14,marginBottom:14}}>
          Luồng xử lý điển hình — Tạo nội dung mới
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["P","User click '+ Tạo mới'"],
            ["A","ContentService.create(data, user)"],
            ["D","AuthEntity.hasPermission('create')"],
            ["D","ContentEntity.validate(data)"],
            ["I","ContentRepository.save(item)"],
            ["I","DB.contents.push(newItem)"],
            ["P","UI reload danh sách"],
          ].map(([k,v],i,a) => (
            <span key={i} className="flex items-center gap-2">
              <span className={`layer-badge layer-${k.toLowerCase()}`} style={{fontSize:11,padding:"3px 8px"}}>{v}</span>
              {i < a.length-1 && <span className="text-muted">→</span>}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

// ── App Shell ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  if (!user) return (
    <>
      <style>{css}</style>
      <LoginPage onLogin={u => { setUser(u); setPage("dashboard"); }} />
    </>
  );

  const nav = [
    { id:"dashboard", icon:"◈", label:"Dashboard" },
    { id:"content",   icon:"≡", label:"Nội dung",  section:"Chức năng" },
    { id:"users",     icon:"◎", label:"Người dùng" },
    { id:"plugins",   icon:"⬡", label:"Plugins" },
    { id:"arch",      icon:"⊞", label:"Kiến trúc", section:"Hệ thống" },
  ];

  const pages = {
    dashboard: <Dashboard user={user} />,
    content:   <ContentPage user={user} />,
    users:     <UsersPage user={user} />,
    plugins:   <PluginsPage user={user} />,
    arch:      <ArchPage />,
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">C</div>
            <div className="logo-text">Plugin<span>CMS</span></div>
          </div>
          <nav className="nav">
            {nav.map(n => (
              <span key={n.id}>
                {n.section && <div className="nav-section">{n.section}</div>}
                <button className={`nav-item${page===n.id?" active":""}`} onClick={() => setPage(n.id)}>
                  <span style={{width:16,textAlign:"center"}}>{n.icon}</span>
                  {n.label}
                </button>
              </span>
            ))}
          </nav>
          <div className="sidebar-user">
            <div className="avatar" style={{background:avatarColor(user.role)}}>{user.avatar}</div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => setUser(null)} title="Đăng xuất">↩</button>
          </div>
        </aside>

        {/* Main */}
        <div className="main">
          <header className="topbar">
            <span className="text-muted" style={{fontSize:13}}>PluginCMS</span>
            <span className="text-muted">›</span>
            <span style={{fontSize:13,textTransform:"capitalize"}}>{page}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <span className="layer-badge layer-p">Presentation</span>
              <span className="layer-badge layer-a">Application</span>
              <span className="layer-badge layer-d">Domain</span>
              <span className="layer-badge layer-i">Infrastructure</span>
            </div>
          </header>
          <main className="content-area">
            {pages[page]}
          </main>
        </div>
      </div>
    </>
  );
}