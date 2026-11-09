/* Shared by the four Ummah Apps Arabic apps: Takallum Kids, Kalimat, Kalimat Plus and Takallum.
   The same file sits in each app's folder; keep the copies identical.
   Each app has its own localStorage, so what they share lives in cookies on .ummahapps.ai:
   - ua_l: the learners on this device {c: current id, l: [{i: id, n: name, g: "m"|"f", a: animal, u: last change}], d: removed ids}
   - ua_w_<id>: one learner's known words, as short hashes of the bare Arabic, most recent last
   - ua_s_<id>: one learner's settings {s: "slow"|"normal"|"natural", a: 0|1 play straight away, v: 0|1 vowel marks};
     ua_s_d holds them for a learner with no shared id yet (an unnamed "Learner 1")
   - ua_d: settings for everyone on this device {h: 0|1 show the help for adding an Arabic voice} */
(function(){
  var DOMAIN = /(^|\.)ummahapps\.ai$/.test(location.hostname) ? ";domain=.ummahapps.ai" : "";
  var SECURE = location.protocol === "https:" ? ";secure" : "";
  var MAXW = 600;
  function getC(n){
    var m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)"));
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch(e){ return null; }
  }
  function setC(n, v){ document.cookie = n + "=" + encodeURIComponent(v) + DOMAIN + ";path=/;max-age=63072000;samesite=lax" + SECURE; }
  function dropC(n){ document.cookie = n + "=" + DOMAIN + ";path=/;max-age=0;samesite=lax" + SECURE; }

  /* ---------- learners ---------- */
  function read(){
    var o = null;
    try { o = JSON.parse(getC("ua_l") || "null"); } catch(e){}
    if (!o || !Array.isArray(o.l)) o = {c:null, l:[], d:[]};
    if (!Array.isArray(o.d)) o.d = [];
    return o;
  }
  function write(o){ o.d = o.d.slice(-20); setC("ua_l", JSON.stringify(o)); }
  var newId = function(){ return "u" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); };
  var same = function(a, b){ return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase(); };
  /* A learner still called "Learner 1" (the name an app gives when nobody typed one) stays in that app until renamed. */
  var unnamed = function(p){ return !p.ua && /^Learner \d+$/.test(String(p.name || "").trim()); };

  /* Link an app's own learners to the shared list, matching by name the first time.
     locals: [{ua, name, g, avatar}] (g and avatar may be missing; ua is "" for one removed in another app).
     Sets ua on each local, fills in name/g/avatar from the shared list,
     and returns {changed, extra: shared learners with no local match yet, cur: the shared current id}. */
  function sync(locals){
    var o = read(), changed = false, now = Date.now();
    locals.forEach(function(p){
      if (p.ua === "" || unnamed(p)) return;
      if (p.ua && o.d.indexOf(p.ua) >= 0){ p.ua = ""; changed = true; return; }
      var s = p.ua && o.l.filter(function(x){ return x.i === p.ua; })[0];
      if (!s && !p.ua){
        s = o.l.filter(function(x){ return same(x.n, p.name) && !locals.some(function(q){ return q.ua === x.i; }); })[0];
        if (s){ p.ua = s.i; changed = true; }
      }
      if (!s){
        s = {i:p.ua || newId(), n:p.name, u:now};
        if (p.g) s.g = p.g;
        if (p.avatar) s.a = p.avatar;
        o.l.push(s);
        if (p.ua !== s.i){ p.ua = s.i; changed = true; }
        return;
      }
      /* Changes are saved to the shared list as they happen, so it holds the newest details;
         a detail only one app asks for (boy or girl, an animal) fills in from whichever side has it. */
      if (s.n && s.n !== p.name){ p.name = s.n; changed = true; }
      if (s.g){ if (s.g !== p.g){ p.g = s.g; changed = true; } } else if (p.g) s.g = p.g;
      if (s.a){ if (s.a !== p.avatar){ p.avatar = s.a; changed = true; } } else if (p.avatar) s.a = p.avatar;
    });
    write(o);
    var extra = o.l.filter(function(x){ return !locals.some(function(p){ return p.ua === x.i; }); })
      .map(function(x){ return {ua:x.i, name:x.n, g:x.g || null, avatar:x.a || null}; });
    return {changed:changed, extra:extra, cur:o.c};
  }
  /* Save one learner after the app changed them; returns their shared id. */
  function save(p){
    if (p.ua === "" || unnamed(p)) return p.ua;
    var o = read(), s = p.ua && o.l.filter(function(x){ return x.i === p.ua; })[0];
    if (!s){ s = {i:p.ua || newId()}; o.l.push(s); o.d = o.d.filter(function(i){ return i !== s.i; }); }
    s.n = p.name; s.u = Date.now();
    if (p.g) s.g = p.g;
    if (p.avatar) s.a = p.avatar;
    write(o);
    return s.i;
  }
  function remove(ua){
    if (!ua) return;
    var o = read();
    o.l = o.l.filter(function(x){ return x.i !== ua; });
    if (o.d.indexOf(ua) < 0) o.d.push(ua);
    if (o.c === ua) o.c = null;
    write(o); dropC("ua_w_" + ua); dropC("ua_s_" + ua);
  }
  function setCurrent(ua){ if (!ua) return; var o = read(); if (o.c !== ua){ o.c = ua; write(o); } }

  /* ---------- known words ---------- */
  /* The bare word: no vowel marks, tatweel, punctuation or leading ال, one kind of alif. */
  function bareWord(ar){
    var s = String(ar).replace(/[ً-ٰٟۖ-ۭـ]/g, "").replace(/[.,!?،؛؟]/g, "")
      .replace(/[آأإٱ]/g, "ا").replace(/ى/g, "ي").trim();
    if (s.length > 3 && s.indexOf("ال") === 0) s = s.slice(2);
    return s;
  }
  function key(ar){
    var s = bareWord(ar), h = 2166136261;
    for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 60466176).toString(36);
  }
  function keys(ua){ var v = ua && getC("ua_w_" + ua); return v ? v.split(".") : []; }
  /* Add words (vowelled Arabic) this learner now knows. */
  function addKnown(ua, list){
    if (!ua) return;
    var have = keys(ua), seen = {}, grew = false;
    have.forEach(function(k){ seen[k] = 1; });
    list.forEach(function(ar){ if (!ar) return; var k = key(ar); if (!seen[k]){ seen[k] = 1; have.push(k); grew = true; } });
    if (grew) setC("ua_w_" + ua, have.slice(-MAXW).join("."));
  }
  /* A test for "does this learner know this word from any of the apps?" */
  function knows(ua){
    var seen = {};
    keys(ua).forEach(function(k){ seen[k] = 1; });
    return function(ar){ return !!seen[key(ar)]; };
  }

  /* ---------- settings ---------- */
  /* Each app keeps its own rate for each speed; the learner picks the speed once for all four. */
  var SPEEDS = ["slow", "normal", "natural"];
  var LEARNER = {speed:"s", autoplay:"a", vowels:"v"}, DEVICE = {voiceHelp:"h"};
  var DEF = {speed:"normal", autoplay:true, vowels:true, voiceHelp:true};
  function readObj(n){ var o = null; try { o = JSON.parse(getC(n) || "null"); } catch(e){} return o && typeof o === "object" ? o : {}; }
  var sName = function(ua){ return "ua_s_" + (ua || "d"); };
  var okVal = function(k, v){ return k === "speed" ? SPEEDS.indexOf(v) >= 0 : typeof v === "boolean"; };
  var pack = function(k, v){ return k === "speed" ? v : v ? 1 : 0; };
  var unpack = function(k, v){ return k === "speed" ? v : !!v; };
  /* The learner's settings. local: the app's own values from before settings were shared,
     used once to fill in any setting the shared list doesn't have yet. */
  function settings(ua, local){
    var out = {};
    [[sName(ua), LEARNER], ["ua_d", DEVICE]].forEach(function(part){
      var name = part[0], map = part[1], o = readObj(name), grew = false;
      Object.keys(map).forEach(function(k){
        var c = map[k], v = c in o ? unpack(k, o[c]) : undefined;
        if (!okVal(k, v)){
          v = local && okVal(k, local[k]) ? local[k] : DEF[k];
          if (local && okVal(k, local[k])){ o[c] = pack(k, v); grew = true; }
        }
        out[k] = v;
      });
      if (grew) setC(name, JSON.stringify(o));
    });
    return out;
  }
  function setSetting(ua, k, v){
    if (!(k in LEARNER || k in DEVICE) || !okVal(k, v)) return;
    var dev = k in DEVICE, name = dev ? "ua_d" : sName(ua), o = readObj(name);
    o[(dev ? DEVICE : LEARNER)[k]] = pack(k, v);
    setC(name, JSON.stringify(o));
  }
  /* When the page comes back into view (after a change in another app's tab), call fn with the new settings. */
  function watch(getUa, fn){
    var last = JSON.stringify(settings(getUa()));
    document.addEventListener("visibilitychange", function(){
      if (document.visibilityState !== "visible") return;
      var s = settings(getUa()), j = JSON.stringify(s);
      if (j !== last){ last = j; fn(s); }
    });
    return function(){ last = JSON.stringify(settings(getUa())); };
  }

  /* The settings panel, the same in all four apps.
     opts: {ua, name, app: "kalimat"|"kalimat-plus"|"takallum"|"takallum-kids", onChange(settings)} */
  var CSS = ".ua-set{--s-card:#FFFFFF;--s-ink:#15233F;--s-muted:#56637D;--s-line:#D3DBE6;--s-lapis:#1E4FA0;--s-soft:#DCE6F7;--s-on:#FFFFFF;" +
    "width:min(460px,calc(100vw - 32px));max-height:calc(100dvh - 32px);overflow:auto;margin:auto;padding:20px 20px 16px;border:1px solid var(--s-line);border-radius:20px;" +
    "background:var(--s-card);color:var(--s-ink);font:inherit;font-size:16px;line-height:1.45;box-shadow:0 18px 48px rgba(10,20,40,.28)}" +
    "@media (prefers-color-scheme: dark){:root:not([data-theme=\"light\"]) .ua-set{--s-card:#162035;--s-ink:#E6EBF4;--s-muted:#9AA6BD;--s-line:#2A3753;--s-lapis:#8DB0EC;--s-soft:#1D2D4D;--s-on:#0D1424}}" +
    ":root[data-theme=\"dark\"] .ua-set{--s-card:#162035;--s-ink:#E6EBF4;--s-muted:#9AA6BD;--s-line:#2A3753;--s-lapis:#8DB0EC;--s-soft:#1D2D4D;--s-on:#0D1424}" +
    ".ua-set::backdrop{background:rgba(10,20,40,.45)}" +
    ".ua-set h2{margin:0 0 4px;padding:0;border:0;font-size:1.2rem;color:var(--s-ink)}" +
    ".ua-set .ua-for{margin:0 0 14px;color:var(--s-muted);font-size:.9rem}" +
    ".ua-set h3{margin:16px 0 4px;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:var(--s-muted)}" +
    ".ua-set .ua-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid var(--s-line)}" +
    ".ua-set .ua-row>span{display:flex;flex-direction:column;font-weight:700}" +
    ".ua-set small{font-weight:400;color:var(--s-muted);font-size:.85rem;margin-top:2px}" +
    ".ua-set small i{font-style:normal;color:var(--s-lapis);font-weight:600}" +
    ".ua-set input[type=checkbox]{flex:0 0 auto;width:24px;height:24px;margin:0;accent-color:var(--s-lapis);cursor:pointer}" +
    ".ua-set .ua-seg{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}" +
    ".ua-set .ua-seg button{min-height:40px;padding:6px 14px;border:1.5px solid var(--s-line);border-radius:999px;background:transparent;color:var(--s-ink);font:inherit;font-size:.92rem;font-weight:600;cursor:pointer}" +
    ".ua-set .ua-seg button[aria-pressed=\"true\"]{background:var(--s-lapis);border-color:var(--s-lapis);color:var(--s-on)}" +
    ".ua-set .ua-col{display:block;padding:12px 0;border-top:1px solid var(--s-line)}" +
    ".ua-set .ua-col>span{display:flex;flex-direction:column;font-weight:700}" +
    ".ua-set .ua-done{display:block;width:100%;min-height:44px;margin-top:14px;border:0;border-radius:999px;background:var(--s-lapis);color:var(--s-on);font:inherit;font-weight:700;cursor:pointer}" +
    ".ua-set button:focus-visible,.ua-set input:focus-visible{outline:3px solid var(--s-lapis);outline-offset:2px}";
  var dlg = null;
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function openSettings(opts){
    opts = opts || {};
    if (!dlg){
      var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
      dlg = document.createElement("dialog"); dlg.className = "ua-set"; dlg.setAttribute("aria-labelledby", "ua-set-h");
      document.body.appendChild(dlg);
      dlg.addEventListener("click", function(e){ if (e.target === dlg) dlg.close(); });
      /* Keys typed in the panel are for the panel only, not the app's own shortcuts (Escape still closes it). */
      dlg.addEventListener("keydown", function(e){ e.stopPropagation(); });
    }
    var ua = opts.ua, name = opts.name || "", s = settings(ua);
    var tick = function(k, title, sub){
      return '<label class="ua-row"><span>' + title + '<small>' + sub + '</small></span><input type="checkbox" data-k="' + k + '"' + (s[k] ? " checked" : "") + '></label>';
    };
    dlg.innerHTML = '<h2 id="ua-set-h">' + (name ? "Settings for " + esc(name) : "Settings") + '</h2>' +
      '<p class="ua-for">' + (ua ? "These go with " + esc(name || "this learner") + " in all four Ummah Apps Arabic apps on this device: Takallum Kids, Kalimat, Kalimat Plus and Takallum."
        : "These apply in all four Ummah Apps Arabic apps on this device. Give this learner a name to keep their own settings.") + '</p>' +
      '<div class="ua-col"><span>Voice speed<small>How fast the Arabic voice speaks. <i>All four apps.</i></small></span>' +
      '<div class="ua-seg" role="group" aria-label="Voice speed">' + [["slow","Slow"],["normal","Normal"],["natural","Natural"]].map(function(x){
        return '<button type="button" data-speed="' + x[0] + '" aria-pressed="' + (s.speed === x[0]) + '">' + x[1] + '</button>'; }).join("") + '</div></div>' +
      tick("autoplay", "Play the Arabic straight away", "Speak each new word or sentence as soon as it shows. <i>Takallum Kids and Takallum.</i>") +
      tick("vowels", "Vowel marks", "Show the harakat. Turn off to practise reading without them. <i>Takallum.</i> Kalimat, Kalimat Plus and Takallum Kids always show them.") +
      '<h3>For everyone on this device</h3>' +
      tick("voiceHelp", "Help with the Arabic voice", "Show the steps for adding an Arabic voice to this device. <i>All four apps.</i>") +
      '<button type="button" class="ua-done">Done</button>';
    var changed = function(){ if (opts.onChange) opts.onChange(settings(ua)); };
    dlg.onclick = function(e){
      var b = e.target.closest && e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("ua-done")){ dlg.close(); return; }
      if (b.dataset.speed){
        setSetting(ua, "speed", b.dataset.speed);
        dlg.querySelectorAll("[data-speed]").forEach(function(x){ x.setAttribute("aria-pressed", String(x === b)); });
        changed();
      }
    };
    dlg.onchange = function(e){ var k = e.target.dataset && e.target.dataset.k; if (k){ setSetting(ua, k, e.target.checked); changed(); } };
    var back = document.activeElement;
    dlg.onclose = function(){ if (back && back.isConnected && back.focus) back.focus(); };
    if (dlg.showModal){ if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
    var first = dlg.querySelector('[aria-pressed="true"]'); if (first) first.focus();
  }

  /* When testing on this computer (node serve.js <port>), links between the apps go to their local servers. */
  var PORTS = {"takallum-kids":8771, "kalimat":8766, "kalimat-plus":8772, "takallum":8770};
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll('a[href*=".ummahapps.ai/"]').forEach(function(a){
      var m = a.getAttribute("href").match(/^https:\/\/([a-z-]+)\.ummahapps\.ai\/(.*)$/);
      if (m && PORTS[m[1]]) a.href = "http://" + location.hostname + ":" + PORTS[m[1]] + "/" + m[2];
    });
  });

  window.UA = {sync:sync, save:save, remove:remove, setCurrent:setCurrent, addKnown:addKnown, knows:knows, key:key,
    settings:settings, setSetting:setSetting, watch:watch, openSettings:openSettings};
})();
