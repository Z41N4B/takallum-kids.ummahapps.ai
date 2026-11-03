/* Shared by the four Ummah Apps Arabic apps: Takallum Kids, Kalimat, Kalimat Plus and Takallum.
   The same file sits in each app's folder; keep the copies identical.
   Each app has its own localStorage, so what they share lives in cookies on .ummahapps.ai:
   - ua_l: the learners on this device {c: current id, l: [{i: id, n: name, g: "m"|"f", a: animal, u: last change}], d: removed ids}
   - ua_w_<id>: one learner's known words, as short hashes of the bare Arabic, most recent last */
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
    write(o); dropC("ua_w_" + ua);
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

  /* When testing on this computer (node serve.js <port>), links between the apps go to their local servers. */
  var PORTS = {"takallum-kids":8771, "kalimat":8766, "kalimat-plus":8772, "takallum":8770};
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll('a[href*=".ummahapps.ai/"]').forEach(function(a){
      var m = a.getAttribute("href").match(/^https:\/\/([a-z-]+)\.ummahapps\.ai\/(.*)$/);
      if (m && PORTS[m[1]]) a.href = "http://" + location.hostname + ":" + PORTS[m[1]] + "/" + m[2];
    });
  });

  window.UA = {sync:sync, save:save, remove:remove, setCurrent:setCurrent, addKnown:addKnown, knows:knows, key:key};
})();
