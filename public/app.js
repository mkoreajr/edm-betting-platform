const icons={
  home:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3l8.5 7.5v9a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9Z"/><path d="M9.5 20.5h5"/></svg>`,
  ticket:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v13H4z"/><path d="M8 8.5h8M8 12h6M8 15.5h4"/></svg>`,
  document:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6"/></svg>`,
  user:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-3.4 3-5.1 6.5-5.1s5.8 1.7 6.5 5.1"/></svg>`,
  headset:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><path d="M4 13h3v6H5a1 1 0 0 1-1-1zM20 13h-3v6h2a1 1 0 0 0 1-1z"/><path d="M17 19c-1 .9-2.2 1.5-4 1.5"/></svg>`,
  lock:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>`,
  shield:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 19 6v5.2c0 4.7-2.8 7.9-7 9.8-4.2-1.9-7-5.1-7-9.8V6l7-2.5Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  profile:`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><circle cx="24" cy="18" r="5.2"/><path d="M13.5 36c1.2-5.3 4.8-8 10.5-8s9.3 2.7 10.5 8"/></svg>`
};
const app=document.querySelector("#app"), nav=document.querySelector("#nav"), modal=document.querySelector("#modal"), modalBody=document.querySelector("#modalBody");
let me=null;

const money=n=>new Intl.NumberFormat("en-TZ").format(n)+" TZS";
async function api(url,opt={}){const r=await fetch(url,{headers:{"Content-Type":"application/json",...(opt.headers||{})},...opt});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Request failed");return d}
function closeModal(){modal.classList.add("hidden")}
function openModal(html){modalBody.innerHTML=html;modal.classList.remove("hidden")}
function navRender(){
  nav.innerHTML=me ? `
    <div class="edm-nav-left">
      <button class="nav-brand" onclick="go('home')" aria-label="EDM Home">
        <span class="nav-edm">EDM</span>
        <span class="nav-brand-divider"></span>
        <span class="nav-platform">BETTING PLATFORM</span>
      </button>

      <div class="edm-nav-links desktop-nav-links">
        <button class="nav-btn nav-home" onclick="go('home')">
          <span class="nav-icon">${icons.home}</span><span>Home</span>
        </button>
        <button class="nav-btn" onclick="go('slips')">
          <span class="nav-icon">${icons.ticket}</span><span>Premium Picks</span>
        </button>
        <button class="nav-btn" onclick="go('purchases')">
          <span class="nav-icon">${icons.document}</span><span>My Purchases</span>
        </button>
        <button class="nav-btn" onclick="go('account')">
          <span class="nav-icon">${icons.user}</span><span>Account</span>
        </button>
        <button class="nav-btn" onclick="go('support')">
          <span class="nav-icon">${icons.headset}</span><span>Support</span>
        </button>
      </div>

      <button class="mobile-menu-toggle" id="mobileMenuToggle" onclick="toggleMobileMenu()" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>

    <div class="edm-nav-right">
      <div class="nav-tagline">PREDICT • PLAY • WIN</div>
      <button class="profile-btn" onclick="go('${me.role==="admin"?"admin":"account"}')" aria-label="Account">
        ${icons.profile}
      </button>
    </div>

    <div class="mobile-nav-menu" id="mobileNavMenu">
      <button class="mobile-nav-item" onclick="mobileGo('home')">
        <span class="nav-icon">${icons.home}</span><span>Home</span>
      </button>
      <button class="mobile-nav-item" onclick="mobileGo('slips')">
        <span class="nav-icon">${icons.ticket}</span><span>Premium Picks</span>
      </button>
      <button class="mobile-nav-item" onclick="mobileGo('purchases')">
        <span class="nav-icon">${icons.document}</span><span>My Purchases</span>
      </button>
      <button class="mobile-nav-item" onclick="mobileGo('account')">
        <span class="nav-icon">${icons.user}</span><span>Account</span>
      </button>
      <button class="mobile-nav-item" onclick="mobileGo('support')">
        <span class="nav-icon">${icons.headset}</span><span>Support</span>
      </button>
    </div>` : "";
}

function toggleMobileMenu(){
  const menu=document.getElementById("mobileNavMenu");
  const btn=document.getElementById("mobileMenuToggle");
  if(!menu || !btn) return;
  const open=menu.classList.toggle("open");
  btn.classList.toggle("open",open);
  btn.setAttribute("aria-expanded",String(open));
}

function mobileGo(page){
  const menu=document.getElementById("mobileNavMenu");
  const btn=document.getElementById("mobileMenuToggle");
  if(menu) menu.classList.remove("open");
  if(btn){
    btn.classList.remove("open");
    btn.setAttribute("aria-expanded","false");
  }
  go(page);
}
async function boot(){try{me=(await api("/api/me")).user}catch{}navRender();go(me?"home":"login")}
function go(page,id){location.hash=page+(id?`/${id}`:"");render(page,id)}
window.addEventListener("hashchange",()=>{const [p,id]=location.hash.slice(1).split("/");render(p||"home",id)});
async function render(page,id){
  if(page==="login"||page==="register") return authPage(page);
  if(!me) return authPage("login");
  if(page==="home") return homePage();
  if(page==="slips") return slipsPage();
  if(page==="detail") return detailPage(id);
  if(page==="purchases") return purchasesPage();
  if(page==="account") return accountPage();
  if(page==="support") return supportPage();
  if(page==="admin") return adminPage();
  return homePage();
}
function authPage(mode){
 nav.innerHTML="";
 const login=mode==="login";
 app.innerHTML=`<div class="auth-layout"><div class="auth-left"><div class="eyebrow">TODAY'S HOT MATCHES</div><h1>HATUNA NAMNA,<br><span>HATUNA MADUKA.</span></h1><p>Premium football picks, featured fixtures and secure access to the EDM betting platform.</p><div class="smart">Bet Smart Win Bigger</div><div class="login-matches">
<div class="login-match"><div class="login-team"><img src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"><span>Real Madrid</span></div><div class="login-vs"><b>VS</b><small>20:00</small></div><div class="login-team"><img src="https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"><span>Barcelona</span></div></div>
<div class="login-match"><div class="login-team"><img src="https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg"><span>Arsenal</span></div><div class="login-vs"><b>VS</b><small>18:30</small></div><div class="login-team"><img src="https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"><span>Liverpool</span></div></div>
</div></div><div class="auth-right"><form class="auth-card" id="authForm"><div class="brand-mark">EDM</div><div class="tag">PREDICT • PLAY • WIN</div><h2>${login?"Welcome back":"Create account"}</h2><p class="muted">${login?"Login to access your premium slips.":"Create your EDM account to get started."}</p>${!login?`<label>Name</label><input class="input" name="name" required minlength="2" placeholder="Your name">`:""}<label>Email</label><input class="input" type="email" name="email" required placeholder="you@example.com"><label>Password</label><input class="input" type="password" name="password" required minlength="8" placeholder="••••••••"><div id="authError" class="error"></div><button class="green-btn">${login?"LOGIN":"CREATE ACCOUNT"}</button><div class="switch">${login?`Don't have an account? <a onclick="go('register')">Create account</a>`:`Already registered? <a onclick="go('login')">Login</a>`}</div></form></div></div>`;
 document.querySelector("#authForm").onsubmit=async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));try{me=(await api(`/api/auth/${login?"login":"register"}`,{method:"POST",body:JSON.stringify(body)})).user;navRender();go("home")}catch(err){document.querySelector("#authError").textContent=err.message}}
}
async function homePage(){
 const [m,s]=await Promise.all([api("/api/hot-matches"),api("/api/slips")]);
 const featured=s.slips.slice(0,3);
 app.innerHTML=`<div class="dashboard">
  <div class="container">
   <div class="dash-welcome">
    <div>
      <div class="eyebrow">EDM MEMBER DASHBOARD</div>
      <h1>Welcome, <span>${me.name.split(" ")[0]}</span></h1>
      <p>Explore today's featured matches and EDM premium slips.</p>
    </div>
    <button class="green-btn dash-premium-btn" onclick="go('slips')">EXPLORE PREMIUM</button>
   </div>

   <div class="dash-stats">
    <div class="dash-stat card"><div class="dash-stat-icon">▣</div><div><span>PREMIUM SLIPS</span><b>${s.slips.length}</b><small>Available today</small></div></div>
    <div class="dash-stat card"><div class="dash-stat-icon">✓</div><div><span>ACCOUNT</span><b>ACTIVE</b><small>Secure member access</small></div></div>
    <div class="dash-stat card"><div class="dash-stat-icon">⚡</div><div><span>EDM ACCESS</span><b>24/7</b><small>Browse anytime</small></div></div>
   </div>

   <section class="dash-section">
    <div class="section-head"><div><div class="eyebrow">LIVE BOARD</div><h2>Today's Hot Matches</h2><p>Featured fixtures on the EDM home board.</p></div></div>
    <div class="matches dashboard-matches">${m.map((x,i)=>`<div class="card match match-large">
      <div class="match-top"><span class="badge">${i<2?"HOT":"FEATURED"}</span><span class="time">${x.time}</span></div>
      <div class="league">FOOTBALL</div>
      <div class="teams"><div class="team"><img class="logo" src="${x.homeLogo}" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src='https://upload.wikimedia.org/wikipedia/commons/8/8d/FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg'}else{this.style.display='none'}">${x.home}</div><div class="vs">VS</div><div class="team"><img class="logo" src="${x.awayLogo}" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src='https://upload.wikimedia.org/wikipedia/commons/8/8d/FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg'}else{this.style.display='none'}">${x.away}</div></div>
      <div class="match-bottom"><span>Today's fixture</span><span class="green-dot"></span></div>
    </div>`).join("")}</div>
   </section>

   <section class="dash-section">
    <div class="section-head"><div><div class="eyebrow">EDM PREMIUM</div><h2>Premium Bet Slips</h2><p>Unlock protected selections after payment verification.</p></div><button class="ghost" onclick="go('slips')">VIEW ALL →</button></div>
    <div class="slips dashboard-slips">${featured.map((x,i)=>`<div class="card slip premium-card">
      <div class="slip-top"><span class="badge">${i===0?"TODAY'S PICK":"PREMIUM"}</span><span class="lock">🔒 LOCKED</span></div>
      <h3>${x.title}</h3><div class="muted">${x.league}</div>
      <div class="slip-meta"><div><span>SELECTIONS</span><b>${x.match_count}</b></div><div><span>TOTAL ODDS</span><b>${x.odds}</b></div><div><span>PRICE</span><b>${money(x.price_tzs)}</b></div></div>
      <p class="muted">${x.description}</p>
      <button class="green-btn" onclick="buy(${x.id})">VIEW & UNLOCK</button>
    </div>`).join("")}</div>
   </section>

   <section class="dash-section dash-bottom">
    <div class="card quick-card"><div class="quick-icon purchase-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM14 3v4h4M9 12h6M9 16h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div><h3>My Purchases</h3><p>Open your verified premium slips and references.</p></div><button class="ghost" onclick="go('purchases')">OPEN →</button></div>
    <div class="card quick-card"><div class="quick-icon security-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.7-2.8 8.2-7 10-4.2-1.8-7-5.3-7-10V6zM9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div><h3>Secure by design</h3><p>Picks and slip codes remain server-side until payment is verified.</p></div></div>
   </section>
  </div>

  <footer class="site-footer">
   <div class="container footer-main">
    <section class="footer-brand-col">
      <div class="footer-logo">EDM</div>
      <div class="footer-platform">BETTING PLATFORM</div>
      <div class="footer-tag">Predict • Play • Win</div>
      <p>Premium football picks, featured fixtures<br>and secure access to the EDM betting<br>platform.</p>
    </section>
    <section class="footer-col">
      <h4>Quick Links</h4>
      <a href="#" onclick="go('home');return false">Home</a>
      <a href="#" onclick="go('premium');return false">Premium Picks</a>
      <a href="#" onclick="go('purchases');return false">My Purchases</a>
      <a href="#" onclick="return false">Account</a>
      <a href="#" onclick="return false">Support</a>
    </section>
    <section class="footer-col">
      <h4>Legal</h4>
      <a href="#" onclick="return false">Terms of Service</a>
      <a href="#" onclick="return false">Privacy Policy</a>
      <a href="#" onclick="return false">Responsible Betting</a>
      <a href="#" onclick="return false">Contact Us</a>
    </section>
    <section class="footer-follow-panel">
      <h4>Follow Us</h4>
      <div class="socials">
       <a class="social whatsapp" aria-label="WhatsApp" href="#" onclick="return false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.1L2 22l5-1.3A11 11 0 1 0 20.5 3.5Zm-8.6 17A9 9 0 0 1 7.3 19l-.3-.2-3 .8.8-2.9-.2-.3a9 9 0 1 1 7.3 4.1Zm4.9-6.7c-.3-.2-1.8-.9-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.8 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.8-3.2-.3-.5.3-.5.8-1.6.1-.2 0-.4-.1-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.3 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.6.9 3.5.8.6-.1 1.8-.7 2.1-1.3.3-.6.3-1.2.2-1.3-.1-.1-.3-.2-.6-.4Z" fill="currentColor"/></svg></a>
       <a class="social telegram" aria-label="Telegram" href="#" onclick="return false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21.5 4.3-3.1 14.6c-.2 1-.8 1.2-1.6.8l-4.4-3.2-2.1 2c-.2.2-.4.4-.8.4l.3-4.5 8.2-7.4c.4-.3-.1-.5-.6-.2L7.3 13l-4.3-1.4c-.9-.3-.9-.9.2-1.3L20 4.1c.8-.3 1.6.2 1.5.2Z" fill="currentColor"/></svg></a>
       <a class="social instagram" aria-label="Instagram" href="#" onclick="return false"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.5" r="1.15" fill="currentColor"/></svg></a>
       <a class="social x-social" aria-label="X" href="#" onclick="return false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3.7l3.2 4.5L15.8 4h3.4l-5.5 6.2 6 9.8h-3.8l-3.6-5.1L7.6 20H4.2l5.9-6.7L5 4Z" fill="currentColor"/></svg></a>
       <a class="social youtube" aria-label="YouTube" href="#" onclick="return false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 7.2a2.7 2.7 0 0 0-1.9-1.9C17.4 4.8 12 4.8 12 4.8s-5.4 0-7.1.5A2.7 2.7 0 0 0 3 7.2 28 28 0 0 0 2.5 12 28 28 0 0 0 3 16.8a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.1.5 7.1.5s5.4 0 7.1-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 .5-4.8 28 28 0 0 0-.5-4.8Z" fill="currentColor"/><path d="m10 15.5 5-3.5-5-3.5v7Z" fill="#04110a"/></svg></a>
      </div>
    </section>

   </div>
   <div class="container footer-bottom"><span>© 2024 EDM Betting Platform. All rights reserved.</span><strong>HATUNA NAMNA, HATUNA MADUKA.</strong><span>18+ &nbsp;|&nbsp; Bet Responsibly &nbsp;|&nbsp; Play Smart</span></div>
  </footer>
 </div>`;
}
function slipCard(s){
  return `<article class="premium-slip-card card">
    <div class="premium-card-head">
      <span class="premium-label">PREMIUM</span>
      <span class="premium-lock">${icons.lock} LOCKED</span>
    </div>
    <div class="premium-card-title">
      <div>
        <span class="premium-kicker">${s.league}</span>
        <h3>${s.title}</h3>
      </div>
      <div class="premium-price">${money(s.price_tzs)}<small>TZS</small></div>
    </div>
    <p class="premium-desc">${s.description}</p>
    <div class="premium-stats">
      <div><span>SELECTIONS</span><b>${s.match_count}</b></div>
      <div><span>TOTAL ODDS</span><b>${s.odds}</b></div>
      <div><span>ACCESS</span><b>24/7</b></div>
    </div>
    <div class="locked-preview">
      <div class="locked-row"><span>${icons.lock}</span><span>Match selections protected</span><b>••••••</b></div>
      <div class="locked-row"><span>${icons.lock}</span><span>Bet slip code protected</span><b>••••••</b></div>
    </div>
    <div class="premium-card-actions">
      <button class="ghost premium-view" onclick="go('detail',${s.id})">VIEW SLIP</button>
      <button class="green-btn premium-unlock" onclick="buy(${s.id})">UNLOCK NOW</button>
    </div>
  </article>`
}
async function slipsPage(){
  const {slips}=await api("/api/slips");
  app.innerHTML=`<div class="premium-page">
    <div class="container">
      <section class="premium-hero">
        <div>
          <div class="eyebrow">EDM PREMIUM PICKS</div>
          <h1>Premium <span>Bet Slips</span></h1>
          <p>Access carefully prepared football selections after payment verification.</p>
        </div>
        <div class="premium-hero-badge"><span>${icons.shield}</span><div><b>SECURE ACCESS</b><small>Picks stay hidden until verified</small></div></div>
      </section>

      <div class="premium-toolbar">
        <div><b>${slips.length}</b> premium slips available</div>
        <div class="premium-filter"><span>ALL PICKS</span><span>LOCKED</span></div>
      </div>

      <section class="premium-grid">
        ${slips.map(slipCard).join("")}
      </section>

      <section class="premium-info card">
        <div class="premium-info-icon">${icons.shield}</div>
        <div><h3>Protected Premium Access</h3><p>Your picks and final slip code are returned by the server only after a verified purchase. Payment in this build is currently DEMO until a live provider is connected.</p></div>
      </section>
    </div>
  </div>`
}
async function detailPage(id){try{const d=await api(`/api/slips/${id}`);app.innerHTML=`<div class="container page"><div class="detail"><span class="badge">PREMIUM SLIP</span><h1>${d.slip.title}</h1><p class="muted">${d.slip.league} • ${d.slip.match_count} selections • total odds ${d.slip.odds}</p><div class="card" style="padding:22px;margin-top:20px"><p>${d.slip.description}</p><div class="locked">🔒 Individual picks and the final slip code are withheld from this response until payment is verified.</div><div class="price">${money(d.slip.price_tzs)}</div><button class="green-btn" onclick="buy(${id})">PAY & UNLOCK</button></div></div></div>`}catch(e){app.innerHTML=`<div class="container page"><div class="empty">${e.message}</div></div>`}}
function buy(id){openModal(`<div class="eyebrow">SECURE PURCHASE</div><h2>Unlock Premium Slip</h2><p class="muted">Select a payment method. This build uses DEMO confirmation until a real payment provider is connected.</p><select class="input" id="provider"><option>M-Pesa</option><option>Airtel Money</option><option>Tigo Pesa</option></select><button class="green-btn" onclick="confirmDemo(${id})">CONFIRM DEMO PAYMENT</button>`)}
async function confirmDemo(id){try{await api("/api/payments/demo-confirm",{method:"POST",body:JSON.stringify({slipId:id,provider:document.querySelector("#provider").value})});closeModal();await unlock(id)}catch(e){modalBody.innerHTML+=`<div class="error">${e.message}</div>`}}
async function unlock(id){try{const d=await api(`/api/slips/${id}/unlock`);app.innerHTML=`<div class="container page"><div class="detail"><span class="badge">UNLOCKED</span><h1>${d.slip.title}</h1><div class="notice">Payment verified • Reference: ${d.purchase.reference}</div><div class="card" style="padding:22px"><p><b>Slip Code:</b> <span style="color:var(--green)">${d.slipCode}</span></p>${d.picks.map(p=>`<div class="pick"><span>${p.match}</span><b>${p.pick} · ${p.odds}</b></div>`).join("")}</div></div></div>`}catch(e){go("detail",id)}}
function accountPage(){
  app.innerHTML=`<div class="container page account-page">
    <div class="eyebrow">ACCOUNT</div>
    <h2>My Account</h2>
    <div class="card account-card">
      <div class="account-avatar">${(me.name||"U").charAt(0).toUpperCase()}</div>
      <div><h3>${me.name}</h3><p class="muted">${me.email}</p><span class="account-status">ACTIVE MEMBER</span></div>
    </div>
    <button class="green-btn account-logout" onclick="logout()">LOG OUT</button>
  </div>`;
}
function supportPage(){
  app.innerHTML=`<div class="container page support-page">
    <div class="eyebrow">EDM SUPPORT</div>
    <h2>How can we help?</h2>
    <div class="support-grid">
      <div class="card support-card"><b>Premium Picks</b><p class="muted">Need help accessing a purchased slip?</p></div>
      <div class="card support-card"><b>Payments</b><p class="muted">For payment issues, contact EDM support.</p></div>
      <div class="card support-card"><b>Account</b><p class="muted">For login or account assistance, reach out to support.</p></div>
    </div>
  </div>`;
}

async function purchasesPage(){const {purchases}=await api("/api/purchases");app.innerHTML=`<div class="container page"><div class="section-head"><div><div class="eyebrow">ACCOUNT</div><h2>My Purchases</h2><p>Your verified premium purchases.</p></div></div>${purchases.length?`<div class="card" style="padding:10px"><table class="table"><thead><tr><th>Slip</th><th>Amount</th><th>Provider</th><th>Status</th><th></th></tr></thead><tbody>${purchases.map(p=>`<tr><td>${p.title}</td><td>${money(p.amount_tzs)}</td><td>${p.provider}</td><td>${p.status}</td><td><button class="ghost" onclick="unlock(${p.slip_id})">Open</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No purchases yet.</div>`}</div>`}
async function adminPage(){if(me.role!=="admin")return homePage();const [o,s]=await Promise.all([api("/api/admin/overview"),api("/api/admin/slips")]);app.innerHTML=`<div class="container page"><div class="eyebrow">ADMIN</div><h2>EDM Control Center</h2><div class="admin-grid" style="margin:20px 0"><div class="stat"><b>${o.users}</b><span>USERS</span></div><div class="stat"><b>${o.slips}</b><span>SLIPS</span></div><div class="stat"><b>${o.purchases}</b><span>PAID PURCHASES</span></div><div class="stat"><b>${money(o.revenue)}</b><span>REVENUE</span></div></div><div class="card" style="padding:20px"><div class="section-head"><div><h2>Slip Management</h2><p>Publish or hide premium slips.</p></div><button class="green-btn" style="width:auto" onclick="newSlip()">+ New Slip</button></div><table class="table"><thead><tr><th>Title</th><th>Price</th><th>Odds</th><th>Status</th><th></th></tr></thead><tbody>${s.slips.map(x=>`<tr><td>${x.title}</td><td>${money(x.price_tzs)}</td><td>${x.odds}</td><td>${x.status}</td><td><button class="ghost" onclick="toggleSlip(${x.id},'${x.status==="active"?"hidden":"active"}')">${x.status==="active"?"Hide":"Publish"}</button></td></tr>`).join("")}</tbody></table></div></div>`}
function newSlip(){openModal(`<div class="eyebrow">ADMIN</div><h2>New Premium Slip</h2><input class="input" id="st" placeholder="Title"><input class="input" id="sl" placeholder="League"><input class="input" id="sm" type="number" placeholder="Match count"><input class="input" id="so" type="number" step=".01" placeholder="Total odds"><input class="input" id="sp" type="number" placeholder="Price TZS"><input class="input" id="sd" placeholder="Description"><button class="green-btn" onclick="createSlip()">Create</button>`)}
async function createSlip(){try{await api("/api/admin/slips",{method:"POST",body:JSON.stringify({title:st.value,league:sl.value,match_count:sm.value,odds:so.value,price_tzs:sp.value,description:sd.value})});closeModal();adminPage()}catch(e){alert(e.message)}}
async function toggleSlip(id,status){try{await api(`/api/admin/slips/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});adminPage()}catch(e){alert(e.message)}}
async function logout(){await api("/api/auth/logout",{method:"POST"});me=null;navRender();go("login")}
boot();
