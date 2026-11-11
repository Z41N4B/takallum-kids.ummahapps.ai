/* Shared by the four Ummah Apps Arabic apps: Takallum Kids, Kalimat, Kalimat Plus and Takallum.
   The same file sits in each app's folder; keep the copies identical.
   Each app has its own localStorage, so what they share lives in cookies on .ummahapps.ai:
   - ua_l: the learners on this device {c: current id, l: [{i: id, n: name, g: "m"|"f", a: animal, u: last change}], d: removed ids}
   - ua_w_<id>: one learner's known words, as short hashes of the bare Arabic, oldest first, most recent last.
     A cookie holds at most 600, so the rest go on in ua_w_<id>_1, ua_w_<id>_2 … (up to 3000 words in 5 cookies)
   - ua_s_<id>: one learner's settings {s: "slow"|"normal"|"natural", a: 0|1 play straight away, v: 0|1 vowel marks};
     ua_s_d holds them for a learner with no shared id yet (an unnamed "Learner 1")
     and for Today's practice {p: 0|1 show the card, pa: the apps it covers ("CKPT"), pn: new items a day 3|5|10}
   - ua_d: settings for everyone on this device {h: 0|1 show the help for adding an Arabic voice}
   - ua_p_<id> (ua_p_d with no shared id): Today's practice. a: the last day number written, b: which of the last 60 days ending
     on day a had any practice ("0"/"1", oldest first), x: one entry per app, C Takallum Kids, K Kalimat, P Kalimat Plus, T Takallum:
     {s: day the counts were taken, o: old work due by day s, s+1 … s+6, r: recent work not solid yet, d: day of the tallies,
      n: new items started, c: recent items practised, v: old items revised that day} */
(function(){
  var DOMAIN = /(^|\.)ummahapps\.ai$/.test(location.hostname) ? ";domain=.ummahapps.ai" : "";
  var SECURE = location.protocol === "https:" ? ";secure" : "";
  var WPER = 600, WCOOKIES = 5, MAXW = WPER * WCOOKIES;
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
     locals: [{ua, name, g, avatar}] (g and avatar may be missing; ua is "" for one unlinked before removing reached every app).
     Sets ua on each local, fills in name/g/avatar from the shared list, and returns {changed,
     extra: shared learners with no local match yet, cur: the shared current id,
     removed: indexes in locals of learners removed in another app, which the app deletes with their progress}. */
  function sync(locals){
    var o = read(), changed = false, now = Date.now(), removed = [];
    locals.forEach(function(p, i){
      if (p.ua === "" || unnamed(p)) return;
      if (p.ua && o.d.indexOf(p.ua) >= 0){ removed.push(i); return; }
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
    return {changed:changed, extra:extra, cur:o.c, removed:removed};
  }
  /* Has this learner been removed (in any of the apps)? */
  function gone(ua){ return !!ua && read().d.indexOf(ua) >= 0; }
  /* Save one learner after the app changed them; returns their shared id. One removed in another tab is not brought back. */
  function save(p){
    if (p.ua === "" || unnamed(p) || gone(p.ua)) return p.ua;
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
    write(o); for (var w = 0; w < WCOOKIES; w++) dropC(wName(ua, w)); dropC("ua_s_" + ua); dropC("ua_p_" + ua);
  }
  /* The warning before removing a learner. A learner shared with the other apps is removed from all four. */
  function confirmRemove(name, ua){
    var who = String(name || "this learner");
    return confirm(ua
      ? "Remove " + who + " from all four Arabic apps?\n\nThis deletes " + who + " and all their progress, known words and settings in Takallum Kids, Kalimat, Kalimat Plus and Takallum on this device. It cannot be undone."
      : "Remove " + who + "?\n\nThis deletes " + who + " and all their progress in this app on this device. It cannot be undone.");
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
  /* The known words are spread over up to WCOOKIES cookies, WPER in each: ua_w_<id>, then ua_w_<id>_1 and so on. */
  function wName(ua, i){ return "ua_w_" + ua + (i ? "_" + i : ""); }
  function keys(ua){
    var out = [];
    if (ua) for (var i = 0; i < WCOOKIES; i++){ var v = getC(wName(ua, i)); if (v) out = out.concat(v.split(".")); }
    return out;
  }
  /* Add words (vowelled Arabic) this learner now knows. */
  function addKnown(ua, list){
    if (!ua || gone(ua)) return;
    var have = keys(ua), seen = {}, grew = false;
    have.forEach(function(k){ seen[k] = 1; });
    list.forEach(function(ar){ if (!ar) return; var k = key(ar); if (!seen[k]){ seen[k] = 1; have.push(k); grew = true; } });
    if (!grew) return;
    have = have.slice(-MAXW);
    for (var i = 0; i < WCOOKIES; i++){
      var part = have.slice(i * WPER, (i + 1) * WPER);
      if (part.length) setC(wName(ua, i), part.join(".")); else if (getC(wName(ua, i)) !== null) dropC(wName(ua, i));
    }
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
  var LEARNER = {speed:"s", autoplay:"a", vowels:"v", today:"p", todayApps:"pa", newPerDay:"pn"}, DEVICE = {voiceHelp:"h"};
  var DEF = {speed:"normal", autoplay:true, vowels:true, voiceHelp:true, today:true, todayApps:"CKPT", newPerDay:5};
  var BOOL = {autoplay:1, vowels:1, voiceHelp:1, today:1};
  function readObj(n){ var o = null; try { o = JSON.parse(getC(n) || "null"); } catch(e){} return o && typeof o === "object" ? o : {}; }
  var sName = function(ua){ return "ua_s_" + (ua || "d"); };
  var okVal = function(k, v){
    return k === "speed" ? SPEEDS.indexOf(v) >= 0 : k === "todayApps" ? typeof v === "string" && /^[CKPT]{0,4}$/.test(v)
      : k === "newPerDay" ? [3, 5, 10].indexOf(v) >= 0 : typeof v === "boolean";
  };
  var pack = function(k, v){ return BOOL[k] ? (v ? 1 : 0) : v; };
  var unpack = function(k, v){ return BOOL[k] ? (v === 0 || v === 1 ? !!v : undefined) : v; };
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
      addCss();
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
      '<h3>Today’s practice</h3>' +
      tick("today", "Show Today’s practice", "A card at the top of each app with today’s revision and new work, from the apps below.") +
      '<div class="ua-col"><span>Apps it covers<small>Practice in these apps counts towards today.</small></span>' +
      '<div class="ua-seg" role="group" aria-label="Apps it covers">' + APPS.map(function(a){
        return '<button type="button" data-app="' + a[0] + '" aria-pressed="' + (s.todayApps.indexOf(a[0]) >= 0) + '">' + a[2] + '</button>'; }).join("") + '</div></div>' +
      '<div class="ua-col"><span>New items a day<small>New words or sentences to start each day.</small></span>' +
      '<div class="ua-seg" role="group" aria-label="New items a day">' + [3, 5, 10].map(function(n){
        return '<button type="button" data-new="' + n + '" aria-pressed="' + (s.newPerDay === n) + '">' + n + '</button>'; }).join("") + '</div></div>' +
      '<h3>For everyone on this device</h3>' +
      tick("voiceHelp", "Help with the Arabic voice", "Show the steps for adding an Arabic voice to this device. <i>All four apps.</i>") +
      '<button type="button" class="ua-done">Done</button>';
    var changed = function(){ if (opts.onChange) opts.onChange(settings(ua)); refreshToday(); };
    dlg.onclick = function(e){
      var b = e.target.closest && e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("ua-done")){ dlg.close(); return; }
      if (b.dataset.speed){
        setSetting(ua, "speed", b.dataset.speed);
        dlg.querySelectorAll("[data-speed]").forEach(function(x){ x.setAttribute("aria-pressed", String(x === b)); });
        changed();
      } else if (b.dataset.new){
        setSetting(ua, "newPerDay", +b.dataset.new);
        dlg.querySelectorAll("[data-new]").forEach(function(x){ x.setAttribute("aria-pressed", String(x === b)); });
        changed();
      } else if (b.dataset.app){
        b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
        var on = ""; dlg.querySelectorAll("[data-app]").forEach(function(x){ if (x.getAttribute("aria-pressed") === "true") on += x.dataset.app; });
        setSetting(ua, "todayApps", on);
        changed();
      }
    };
    dlg.onchange = function(e){ var k = e.target.dataset && e.target.dataset.k; if (k){ setSetting(ua, k, e.target.checked); changed(); } };
    var back = document.activeElement;
    dlg.onclose = function(){ if (back && back.isConnected && back.focus) back.focus(); };
    if (dlg.showModal){ if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
    var first = dlg.querySelector('[aria-pressed="true"]'); if (first) first.focus();
  }

  /* ---------- Today's practice ---------- */
  /* Like the Hifdh Helper's day: old work first, then recent work, then something new. Each app sends its own counts
     for the current learner (practice), and the card adds up the apps the learner chose in Settings. */
  var APPS = [["C", "takallum-kids", "Takallum Kids"], ["K", "kalimat", "Kalimat"], ["P", "kalimat-plus", "Kalimat Plus"], ["T", "takallum", "Takallum"]];
  var REV_CAP = 20, RECENT_GOAL = 10, KEEP = 60;
  var codeOf = function(app){ for (var i = 0; i < APPS.length; i++) if (APPS[i][1] === app) return APPS[i][0]; return null; };
  /* Today as a day number in local time; apps use it for their own "comes back on" dates too. */
  function dayNo(){ var d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  var pName = function(ua){ return "ua_p_" + (ua || "d"); };
  function pRead(ua){ var o = readObj(pName(ua)); if (!o.x || typeof o.x !== "object") o.x = {}; if (typeof o.b !== "string") o.b = ""; return o; }
  function shiftTo(o, t){
    if (!o.a || !o.b){ o.a = t; o.b = "0"; return; }
    if (t > o.a){ o.b = (o.b + new Array(Math.min(t - o.a, KEEP) + 1).join("0")).slice(-KEEP); o.a = t; }
  }
  function practisedOn(o, day){ if (!o.a || day > o.a) return false; var i = o.b.length - 1 - (o.a - day); return i >= 0 && o.b.charAt(i) === "1"; }
  /* Save an app's counts for a learner. state: {o: old work due by today and each of the next 6 days, r: recent work not solid yet};
     add: {n: new items started, c: recent items practised, v: old items revised}, added to today's tallies. */
  function practice(ua, app, state, add){
    var code = codeOf(app); if (!code || gone(ua)) return;
    var o = pRead(ua), t = dayNo(), e = o.x[code] || {}, did = false;
    if (state){ e.s = t; e.o = (state.o || []).slice(0, 7).map(function(n){ return Math.max(0, n | 0); }); e.r = Math.max(0, state.r | 0); }
    if (e.d !== t){ e.d = t; e.n = 0; e.c = 0; e.v = 0; }
    if (add) ["n", "c", "v"].forEach(function(k){ if (add[k] > 0){ e[k] = (e[k] || 0) + add[k]; did = true; } });
    o.x[code] = e;
    if (did){ shiftTo(o, t); o.b = o.b.slice(0, -1) + "1"; }
    setC(pName(ua), JSON.stringify(o));
  }
  function practiceAdd(ua, app, add){ practice(ua, app, null, add); refreshToday(); }
  function summary(ua){
    var o = pRead(ua), t = dayNo(), s = settings(ua), S = {old:0, r:0, n:0, c:0, v:0, oldApps:[], recentApps:[], apps:[], goal:s.newPerDay};
    APPS.forEach(function(a){
      if (s.todayApps.indexOf(a[0]) < 0) return;
      var e = o.x[a[0]], due = 0, r = 0;
      /* Counts taken on an earlier day move on by the days since, up to a week. */
      if (e && e.o && e.o.length){ due = e.o[Math.min(Math.max(t - e.s, 0), e.o.length - 1)] || 0; r = e.r || 0; }
      S.old += due; S.r += r; S.apps.push(a);
      if (e && e.d === t){ S.n += e.n || 0; S.c += e.c || 0; S.v += e.v || 0; }
      if (due) S.oldApps.push([a, due]);
      if (r) S.recentApps.push([a, r]);
    });
    S.streak = 0; S.todayDone = practisedOn(o, t);
    for (var d = S.todayDone ? t : t - 1; practisedOn(o, d); d--) S.streak++;
    S.week = []; for (var i = 6; i >= 0; i--) S.week.push([t - i, practisedOn(o, t - i)]);
    S.t = t;
    return S;
  }
  function appUrl(sub){
    return /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && PORTS[sub] ? "http://" + location.hostname + ":" + PORTS[sub] + "/" : "https://" + sub + ".ummahapps.ai/";
  }
  var TCSS = ".ua-today{--t-card:#FFFFFF;--t-ink:#15233F;--t-muted:#56637D;--t-line:#D3DBE6;--t-lapis:#1E4FA0;--t-soft:#DCE6F7;--t-on:#FFFFFF;--t-ok:#1F6B4A;" +
    "margin:12px 0 18px;padding:14px 16px 10px;border:1px solid var(--t-line);border-radius:18px;background:var(--t-card);color:var(--t-ink);font-size:15px;line-height:1.4;text-align:left}" +
    "@media (prefers-color-scheme: dark){:root:not([data-theme=\"light\"]) .ua-today{--t-card:#162035;--t-ink:#E6EBF4;--t-muted:#9AA6BD;--t-line:#2A3753;--t-lapis:#8DB0EC;--t-soft:#1D2D4D;--t-on:#0D1424;--t-ok:#5FC498}}" +
    ":root[data-theme=\"dark\"] .ua-today{--t-card:#162035;--t-ink:#E6EBF4;--t-muted:#9AA6BD;--t-line:#2A3753;--t-lapis:#8DB0EC;--t-soft:#1D2D4D;--t-on:#0D1424;--t-ok:#5FC498}" +
    ".ua-today[hidden]{display:none!important}" +
    ".ua-t-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 12px}" +
    ".ua-today h2{margin:0;padding:0;border:0;font-size:1.06rem;font-weight:700;color:var(--t-ink);letter-spacing:0;text-transform:none}" +
    ".ua-today h2 span{font-weight:400;color:var(--t-muted)}" +
    ".ua-t-week{display:flex;gap:5px}" +
    ".ua-t-week span{display:flex;flex-direction:column;align-items:center;gap:1px;font-size:.66rem;color:var(--t-muted)}" +
    ".ua-t-week i{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--t-line);display:grid;place-items:center;font-style:normal;font-size:.7rem;font-weight:700;color:var(--t-on)}" +
    ".ua-t-week .on i{background:var(--t-lapis);border-color:var(--t-lapis)}" +
    ".ua-t-week .now i{box-shadow:0 0 0 2px var(--t-card),0 0 0 3.5px var(--t-lapis)}" +
    ".ua-t-streak{margin:6px 0 0;color:var(--t-muted);font-size:.86rem}" +
    ".ua-t-steps{list-style:none;margin:8px 0 0;padding:0}" +
    ".ua-t-steps li{display:grid;grid-template-columns:26px 1fr;gap:0 10px;margin:0;padding:10px 0;border-top:1px solid var(--t-line)}" +
    ".ua-t-num{width:26px;height:26px;border-radius:50%;border:1.5px solid var(--t-line);display:grid;place-items:center;font-weight:700;font-size:.82rem;color:var(--t-muted)}" +
    ".ua-t-steps .done .ua-t-num{background:var(--t-ok);border-color:var(--t-ok);color:var(--t-on)}" +
    ".ua-t-steps b{font-weight:700}" +
    ".ua-t-steps small{display:block;color:var(--t-muted);font-size:.86rem}" +
    ".ua-t-apps{grid-column:2;display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}" +
    ".ua-t-apps a,.ua-t-apps button{display:inline-flex;align-items:center;min-height:36px;padding:4px 12px;border-radius:999px;border:1.5px solid var(--t-lapis);background:transparent;color:var(--t-lapis);font:inherit;font-size:.86rem;font-weight:600;line-height:1.2;text-decoration:none;cursor:pointer}" +
    ".ua-t-apps button{background:var(--t-lapis);color:var(--t-on)}" +
    ".ua-t-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:2px 12px;border-top:1px solid var(--t-line);padding-top:4px;color:var(--t-muted);font-size:.8rem}" +
    ".ua-t-link{background:none;border:0;padding:4px 0;min-height:34px;color:var(--t-lapis);font:inherit;font-size:.86rem;font-weight:600;text-decoration:underline;cursor:pointer}" +
    ".ua-t-all{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 12px}" +
    ".ua-t-all p{margin:0;font-weight:600}" +
    ".ua-t-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}" +
    ".ua-today a:focus-visible,.ua-today button:focus-visible{outline:3px solid var(--t-lapis);outline-offset:2px}";
  var cssIn = false;
  function addCss(){ if (cssIn) return; cssIn = true; var st = document.createElement("style"); st.textContent = CSS + TCSS; document.head.appendChild(st); }
  var M = null, showDone = false, WD = "SMTWTFS";
  function weekHTML(S){
    return '<div class="ua-t-week" role="img" aria-label="Practised on ' + S.week.filter(function(w){ return w[1]; }).length + ' of the last 7 days">' + S.week.map(function(w){
      return '<span class="' + (w[1] ? "on" : "") + (w[0] === S.t ? " now" : "") + '"><i>' + (w[1] ? "✓" : "") + '</i>' + WD.charAt(new Date(w[0] * 864e5).getUTCDay()) + '</span>'; }).join("") + '</div>';
  }
  function streakText(S){
    if (S.streak > 1) return S.todayDone ? "🔥 " + S.streak + " days in a row." : "🔥 " + S.streak + " days in a row. Practise today to keep it going.";
    if (S.streak === 1) return S.todayDone ? "🔥 You practised today." : "You practised yesterday. Practise today to make it 2 days in a row.";
    return "A little every day adds up.";
  }
  function cardHTML(ua, name, here){
    var S = summary(ua), rg = Math.min(RECENT_GOAL, S.r);
    var head = '<div class="ua-t-head"><h2>Today’s practice' + (name ? ' <span>· ' + esc(name) + '</span>' : "") + '</h2>' + weekHTML(S) + '</div>';
    var foot = '<div class="ua-t-foot"><span>' + (S.apps.length ? "From " + S.apps.map(function(a){ return a[2]; }).join(", ") : "No apps chosen") + '</span>' +
      '<button type="button" class="ua-t-link" data-ua-t="settings">Settings</button></div>';
    if (!S.apps.length) return head + '<p class="ua-t-streak">Choose which apps Today’s practice covers in Settings.</p>' + foot;
    var chip = function(a, n, k){
      var label = esc(a[2]) + (n ? " · " + n : "");
      return a[0] === here ? '<button type="button" data-ua-t="' + k + '">' + label + '</button>' : '<a href="' + appUrl(a[1]) + '#ua-start=' + k + '">' + label + ' ›</a>';
    };
    var steps = [
      {k:"old", title:"Revise old work", done:!S.old || S.v >= REV_CAP, apps:S.oldApps,
        note:!S.old ? (S.v ? S.v + " revised today. Nothing else is due." : "Nothing is due today.") : S.v >= REV_CAP ? S.v + " revised today. That is plenty for one day." : S.old + " due" + (S.v ? ", " + S.v + " revised today" : "") + "."},
      {k:"recent", title:"Strengthen recent work", done:!S.r || S.c >= rg, apps:S.recentApps,
        note:!S.r ? "Nothing half-learnt right now." : Math.min(S.c, rg) + " of " + rg + " practised" + (S.c >= rg ? ". Well done!" : ".")},
      {k:"new", title:"Something new", done:S.n >= S.goal, apps:S.apps.map(function(a){ return [a, 0]; }),
        note:Math.min(S.n, S.goal) + " of " + S.goal + " new words or sentences started" + (S.n >= S.goal ? ". Well done!" : ".")}
    ];
    var all = steps.every(function(x){ return x.done; });
    if (all && !showDone) return '<div class="ua-t-all"><p>✓ Today’s practice is done. Masha Allah!</p>' + weekHTML(S) + '</div>' +
      '<p class="ua-t-streak">' + streakText(S) + '</p><div class="ua-t-foot"><button type="button" class="ua-t-link" data-ua-t="show">Show today’s practice</button>' +
      '<button type="button" class="ua-t-link" data-ua-t="settings">Settings</button></div>';
    return head + '<p class="ua-t-streak">' + streakText(S) + '</p><ol class="ua-t-steps">' + steps.map(function(x, i){
      return '<li class="' + (x.done ? "done" : "") + '"><span class="ua-t-num" aria-hidden="true">' + (x.done ? "✓" : i + 1) + '</span>' +
        '<div><b>' + x.title + '</b><span class="ua-t-sr">' + (x.done ? " (done)" : "") + '</span><small>' + x.note + '</small></div>' +
        (x.done ? "" : '<div class="ua-t-apps">' + x.apps.map(function(p){ return chip(p[0], p[1], x.k); }).join("") + '</div>') + '</li>';
    }).join("") + '</ol>' + (all ? foot.replace('<span>', '<span><button type="button" class="ua-t-link" data-ua-t="show">Hide</button> · ') : foot);
  }
  /* Show the card in el. opts: {app, ua(), name(), state(): {o, r}, start(step: "old"|"recent"|"new"), visible(), onSettings(settings)}.
     A link from another app's card ends in #ua-start=<step>, which starts that step here. */
  function mountToday(el, opts){
    addCss(); M = {el:el, opts:opts};
    document.addEventListener("click", function(e){
      var b = e.target.closest && e.target.closest(".ua-today [data-ua-t]"); if (!b) return;
      var k = b.getAttribute("data-ua-t");
      if (k === "show"){ showDone = !showDone; refreshToday(); return; }
      if (k === "settings"){ openSettings({ua:opts.ua(), name:opts.name(), app:opts.app, onChange:opts.onSettings}); return; }
      if (opts.start) opts.start(k);
    });
    document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "visible") refreshToday(); });
    refreshToday();
    var fromLink = function(){
      var m = location.hash.match(/^#ua-start=(old|recent|new)$/);
      if (!m || !opts.start) return;
      try { history.replaceState(history.state, "", location.pathname + location.search); } catch(err){}
      setTimeout(function(){ opts.start(m[1]); }, 0);
    };
    fromLink();
    window.addEventListener("hashchange", fromLink);
  }
  /* Saves this app's counts and redraws the card. An app that redraws its whole screen passes the card's new element
     (or null while the card is not on screen). */
  function refreshToday(el){
    if (!M) return;
    if (el !== undefined) M.el = el;
    var o = M.opts, ua = o.ua();
    if (o.state) practice(ua, o.app, o.state());
    el = M.el; if (!el || !el.isConnected) return;
    el.classList.add("ua-today");
    if (!settings(ua).today || (o.visible && !o.visible())){ el.hidden = true; el.innerHTML = ""; return; }
    el.hidden = false; el.innerHTML = cardHTML(ua, o.name(), codeOf(o.app));
  }

  /* When testing on this computer (node serve.js <port>), links between the apps go to their local servers. */
  var PORTS = {"takallum-kids":8771, "kalimat":8766, "kalimat-plus":8772, "takallum":8770};
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll('a[href*=".ummahapps.ai/"]').forEach(function(a){
      var m = a.getAttribute("href").match(/^https:\/\/([a-z-]+)\.ummahapps\.ai\/(.*)$/);
      if (m && PORTS[m[1]]) a.href = "http://" + location.hostname + ":" + PORTS[m[1]] + "/" + m[2];
    });
  });

  /* ---------- quick links ---------- */
  /* A row of the four apps' icons at the very top of each page; the app you are in has a gold ring. */
  function hereApp(){
    var m = location.hostname.match(/^([a-z-]+)\.ummahapps\.ai$/);
    if (m) return m[1];
    for (var k in PORTS) if (String(PORTS[k]) === location.port) return k;
    return null;
  }
  var QCSS = ".ua-quick{display:flex;justify-content:flex-end;gap:6px;max-width:1000px;margin:0 auto;padding:8px max(12px,env(safe-area-inset-right,0px)) 0 max(12px,env(safe-area-inset-left,0px));box-sizing:border-box}" +
    ".ua-quick a,.ua-quick span{display:block;padding:4px;border-radius:12px;line-height:0}" +
    ".ua-quick img{display:block;width:30px;height:30px;max-width:none;border-radius:8px;flex:none}" +
    ".ua-quick a:hover img{transform:translateY(-1px)}" +
    ".ua-quick span img{outline:2.5px solid #E2B75E;outline-offset:2px}" +
    ".ua-quick a:focus-visible{outline:3px solid #E2B75E;outline-offset:1px}";
  function addQuick(){
    if (document.querySelector(".ua-quick")) return;
    var here = hereApp(), st = document.createElement("style"), nav = document.createElement("nav");
    st.textContent = QCSS; document.head.appendChild(st);
    nav.className = "ua-quick"; nav.setAttribute("aria-label", "Ummah Apps Arabic apps");
    nav.innerHTML = APPS.map(function(a){
      var img = '<img src="' + (a[1] === here ? "" : appUrl(a[1])) + 'favicon.svg" alt="" width="30" height="30">';
      return a[1] === here ? '<span aria-current="page" title="' + a[2] + ' (you are here)" aria-label="' + a[2] + ', you are here" role="img">' + img + '</span>'
        : '<a href="' + appUrl(a[1]) + '" title="' + a[2] + '" aria-label="' + a[2] + '">' + img + '</a>';
    }).join("");
    document.body.insertBefore(nav, document.body.firstChild);
    /* Line the icons up with the app's own column. */
    var wrap = document.querySelector(".wrap");
    if (wrap){ var mw = getComputedStyle(wrap).maxWidth; if (mw && mw !== "none") nav.style.maxWidth = mw; }
  }
  if (document.body) addQuick(); else document.addEventListener("DOMContentLoaded", addQuick);

  window.UA = {sync:sync, save:save, remove:remove, gone:gone, confirmRemove:confirmRemove, setCurrent:setCurrent, addKnown:addKnown, knows:knows, key:key,
    settings:settings, setSetting:setSetting, watch:watch, openSettings:openSettings,
    dayNo:dayNo, mountToday:mountToday, refreshToday:refreshToday, practiceAdd:practiceAdd};
})();
