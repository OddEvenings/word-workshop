(function(){
"use strict";
/* The site lives on GitHub Pages. Each grade's weekly words are a plain text file in the repo, which the teacher pastes into on github.com. */
var REPO="OddEvenings/word-workshop", BRANCH="main";
var GRADES={"3":{label:"3rd grade",short:"3rd",file:"words/3rd-grade.txt"},"4":{label:"4th grade",short:"4th",file:"words/4th-grade.txt"}};
var EXAMPLE={title:"Example words",example:true,words:[{w:"habitat",d:"the natural home of a plant or animal"},{w:"predict",d:"to say what you think will happen next"},{w:"enormous",d:"very, very big"},{w:"journey",d:"a trip from one place to another"},{w:"gather",d:"to bring things together into one group"},{w:"curious",d:"wanting to know or learn about something"},{w:"fragile",d:"easy to break"},{w:"observe",d:"to watch something carefully"},{w:"swift",d:"moving very fast"},{w:"delighted",d:"very happy and pleased"}]};
var LS_GRADE="ww-grade", LS_LAST="ww-last-", SS_PREVIEW="ww-preview-";
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function ssGet(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function ssSet(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function ssDel(k){try{sessionStorage.removeItem(k)}catch(e){}}

var grade=lsGet(LS_GRADE);if(!GRADES[grade])grade=null;
var list=EXAMPLE, listState="loading"; // loading | ok | cached | offline | preview
var view = "home";
var app = document.getElementById("app");

/* ---------- weekly words file ---------- */
function parseWordsFile(text){
  var title="",lines=[];
  text.split(/\r?\n/).forEach(function(l){var t=l.trim();if(!t||t[0]==="#")return;var m=t.match(/^title\s*:\s*(.+)$/i);if(m&&!title){title=m[1].trim();return}lines.push(l)});
  var ws=parseLines(lines);
  return {title:title||ws.title||"This week’s words",words:ws.map(function(x){return {w:x.w,d:x.d}})};
}
function wordsFileText(l){
  return "# Word Workshop: this week's words for "+GRADES[grade].label+".\n"+
    "# Put one word per line like this:  word - meaning\n"+
    "# Lines that start with # are notes and are skipped.\n\n"+
    "Title: "+l.title+"\n\n"+l.words.map(function(x){return x.w+" - "+x.d}).join("\n")+"\n";
}
function fileURL(kind){return "https://github.com/"+REPO+"/"+kind+"/"+BRANCH+"/"+GRADES[grade].file}
async function loadGrade(){
  listState="loading";
  var pv=ssGet(SS_PREVIEW+grade);
  if(pv){try{list=JSON.parse(pv);listState="preview";return}catch(e){ssDel(SS_PREVIEW+grade)}}
  try{
    var r=await fetch(GRADES[grade].file+"?v="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("http");
    var l=parseWordsFile(await r.text());if(!l.words.length)throw new Error("empty");
    list=l;listState="ok";lsSet(LS_LAST+grade,JSON.stringify(l));
  }catch(e){
    var c=lsGet(LS_LAST+grade);
    try{if(c){list=JSON.parse(c);listState="cached";return}}catch(e2){}
    list=EXAMPLE;listState="offline";
  }
}

/* ---------- helpers ---------- */
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function letters(w){return String(w).toUpperCase().replace(/[^A-Z]/g,"")}
function norm(s){return String(s).toLowerCase().replace(/[^a-z]/g,"")}
function words(){return list.words.filter(function(x){return x.w&&x.d})}
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function dist(a,b){var m=a.length,n=b.length,d=[];for(var i=0;i<=m;i++){d[i]=[i]}for(var j=0;j<=n;j++)d[0][j]=j;for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
var TILE=["var(--t1)","var(--t2)","var(--t3)","var(--t4)","var(--t5)"];
var FILL=["var(--f1)","var(--f2)","var(--f3)","var(--f4)","var(--f5)","var(--f6)"];

/* ---------- sound ---------- */
/* no musical sounds anywhere (teacher's request); games still call these, so they stay as no-ops */
var sfx={good:function(){},bad:function(){},win:function(){}};
function say(text){try{if(!("speechSynthesis" in window))return;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.rate=0.8;speechSynthesis.speak(u)}catch(e){}}
var canSpeak = "speechSynthesis" in window;

/* ---------- confetti ---------- */
function celebrate(){sfx.win();if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;var c=document.getElementById("fx"),x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;var cs=getComputedStyle(document.documentElement);var cols=["--t1","--t2","--t3","--t4","--t5"].map(function(v){return cs.getPropertyValue(v).trim()||"#F4B731"});var ps=[];for(var i=0;i<140;i++)ps.push({x:c.width/2+(Math.random()-.5)*c.width*.4,y:c.height*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,r:Math.random()*6+4,c:cols[i%5],a:Math.random()*6});var t0=performance.now();(function f(t){var k=(t-t0)/1800;x.clearRect(0,0,c.width,c.height);if(k>1)return;ps.forEach(function(p){p.vy+=0.45;p.x+=p.vx;p.y+=p.vy;p.a+=0.2;x.save();x.globalAlpha=1-k;x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);x.restore()});requestAnimationFrame(f)})(t0)}

/* ---------- shell ---------- */
var GAMES=[
 {id:"match",grp:"p",name:"Match It",desc:"Connect each word to its meaning.",ic:'<path d="M8 12h10M30 36h10M18 12c10 0 2 24 12 24" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="8" cy="12" r="4" fill="currentColor"/><circle cx="40" cy="36" r="4" fill="currentColor"/>'},
 {id:"cross",grp:"p",name:"Crossword",desc:"Use the clues to fill the boxes.",ic:'<g fill="none" stroke="currentColor" stroke-width="3.5"><rect x="6" y="18" width="12" height="12"/><rect x="18" y="18" width="12" height="12"/><rect x="30" y="18" width="12" height="12"/><rect x="18" y="6" width="12" height="12"/><rect x="18" y="30" width="12" height="12"/></g>'},
 {id:"search",grp:"p",name:"Word Search",desc:"Find the hidden words in the letters.",ic:'<circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="4"/><path d="M28 28l12 12" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>'},
 {id:"quiz",grp:"c",name:"Quiz Show",desc:"Pick the right answer and build a streak.",ic:'<path d="M17 17a7 7 0 1 1 10 6c-2 1-3 3-3 5v2" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/><circle cx="24" cy="38" r="3" fill="currentColor"/>'},
 {id:"spell",grp:"p",name:"Spell It",desc:"Read the meaning, then type the word.",ic:'<g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><rect x="5" y="13" width="38" height="22" rx="4"/><path d="M12 20h2M19 20h2M26 20h2M33 20h2M14 28h20"/></g>'},
 {id:"memory",grp:"p",name:"Memory Flip",desc:"Flip cards to find each word and meaning.",ic:'<g stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"><rect x="6" y="12" width="20" height="28" rx="3" fill="none" transform="rotate(-8 16 26)"/><rect x="22" y="8" width="20" height="28" rx="3" fill="currentColor" transform="rotate(8 32 22)"/></g>'},
 {id:"scramble",grp:"p",name:"Word Scramble",desc:"Put the mixed-up letters in order.",ic:'<g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"><rect x="4" y="20" width="12" height="12" rx="2"/><rect x="18" y="14" width="12" height="12" rx="2"/><rect x="32" y="22" width="12" height="12" rx="2"/></g><path d="M10 12q14-10 28 4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'},
 {id:"rescue",grp:"p",name:"Word Rescue",desc:"Guess the letters to save the treasure.",ic:'<ellipse cx="24" cy="18" rx="11" ry="13" fill="currentColor"/><path d="M24 31q-4 6 0 10t0 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'},
 {id:"fall",grp:"c",name:"Falling Words",desc:"Tap the right word before it lands.",ic:'<g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><rect x="8" y="6" width="20" height="9" rx="3"/><rect x="20" y="22" width="20" height="9" rx="3"/><path d="M14 22v10M34 36v6M8 44h32"/></g>'},
 {id:"hack",grp:"c",name:"Hack Race",desc:"Answer fast to out-hack three computer rivals.",ic:'<rect x="5" y="9" width="38" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M13 19l7 5-7 5M24 30h10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'},
 {id:"battle",grp:"c",name:"Monster Battle",desc:"Right answers power your attacks.",ic:'<path d="M8 40c-2-18 6-28 16-28s18 10 16 28c-4 3-8 0-11 3-3-3-7-3-10 0-3-3-7 0-11-3z" fill="currentColor"/><path d="M14 34l5-4 5 4 5-4 5 4" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>'}
];
var LOGO='<svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="15" width="20" height="20" rx="6" fill="var(--t2)" transform="rotate(-8 13 25)"/><rect x="24" y="11" width="20" height="20" rx="6" fill="var(--t1)" transform="rotate(7 34 21)"/><text x="13" y="31" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="16" fill="#fff" transform="rotate(-8 13 25)">W</text><text x="34" y="27" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="16" fill="#3A2A00" transform="rotate(7 34 21)">W</text><circle cx="40" cy="40" r="4" fill="var(--t4)"/><circle cx="8" cy="42" r="2.5" fill="var(--t3)"/></svg>';
function shell(){
  app.innerHTML=
  '<header class="top"><div class="wrap">'+
   '<button class="brand" data-go="home" aria-label="Word Workshop home">'+LOGO+'<span>Word Workshop</span></button>'+
   '<div class="tools">'+
    '<button class="chip" id="gradebtn" title="Change grade"></button>'+
    '<button class="ghost" data-go="list" title="Teachers: update the word list">Teacher</button>'+
   '</div>'+
  '</div></header>'+
  '<div class="wrap"><div class="weekbar" id="weekbar"></div><main id="view"></main></div>'+
  '<div class="overlay" id="picker" hidden></div>';
  $("#gradebtn").onclick=function(){showPicker(false)};
  app.addEventListener("click",function(e){var b=e.target.closest("[data-go]");if(b){go(b.getAttribute("data-go"))}});
}
function gradeChip(){var b=$("#gradebtn");b.innerHTML=grade?'<span class="dot g'+grade+'"></span>'+GRADES[grade].label:"Pick a grade";}
function showPicker(first){
  var p=$("#picker");p.hidden=false;
  p.innerHTML='<div class="pick-card" role="dialog" aria-modal="true" aria-labelledby="pk"><h2 id="pk">Which grade are you in?</h2><p class="muted">Pick your class to get this week’s words.</p>'+
   '<div class="pick-row">'+Object.keys(GRADES).map(function(k){return '<button class="pick-g g'+k+'" data-g="'+k+'"'+(k===grade?' aria-current="true"':'')+'><b>'+k+'<sup>'+(k==="3"?"rd":"th")+'</sup></b><span>grade</span></button>'}).join("")+'</div>'+
   (first?'':'<button class="btn alt" id="pkx">Cancel</button>')+'</div>';
  $$(".pick-g",p).forEach(function(b){b.onclick=function(){setGrade(b.dataset.g)}});
  var x=$("#pkx",p);if(x)x.onclick=function(){p.hidden=true};
  var f=$(".pick-g",p);if(f)f.focus();
}
async function setGrade(k){
  var back=view==="list"?"list":"home";
  grade=k;lsSet(LS_GRADE,k);draft=null;$("#picker").hidden=true;gradeChip();
  listState="loading";go(back);await loadGrade();go(back);
}
function weekbar(){
  var n=words().length,s="";
  if(view!=="home")s+='<button class="back" data-go="home"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>All games</button>';
  if(listState==="loading"){$("#weekbar").innerHTML=s+'<span class="wk">Getting this week’s words…</span>';return}
  s+='<span class="wk">This week: <b>'+esc(list.title||"Word list")+'</b> <span class="count">'+n+' words</span></span>';
  if(listState==="preview")s+='<span class="note">Teacher preview on this computer only. <button data-act="endpreview">Go back to the class list</button></span>';
  else if(listState==="cached")s+='<span class="note">Showing the last words this computer saw. Check your internet to get new ones.</span>';
  else if(listState==="offline")s+='<span class="note">These are example words. The class list could not be loaded.</span>';
  $("#weekbar").innerHTML=s;
  var ep=$('[data-act="endpreview"]');if(ep)ep.onclick=async function(){ssDel(SS_PREVIEW+grade);listState="loading";go("home");await loadGrade();go("home")};
}
var leaveFns=[];
function onLeave(fn){leaveFns.push(fn)}
function go(v){
  leaveFns.splice(0).forEach(function(f){try{f()}catch(e){}});
  view=v;
  weekbar();
  var el=$("#view");el.innerHTML="";el.className="view-"+v;
  if(listState==="loading"){el.innerHTML='<div class="sheet empty"><div class="loader" aria-hidden="true"><i></i><i></i><i></i></div><p class="muted">Getting this week’s words…</p></div>';return}
  if(v!=="home"&&v!=="list"&&words().length<4){el.innerHTML='<div class="sheet empty"><h2>Add a few more words first</h2><p class="muted">The games need at least 4 words with meanings.</p><button class="btn" data-go="list">Open the word list</button></div>';return}
  (VIEWS[v]||{home:viewHome,match:viewMatch,cross:viewCross,search:viewSearch,quiz:viewQuiz,spell:viewSpell,memory:viewMemory,scramble:viewScramble,rescue:viewRescue,fall:viewFall,hack:viewHack,battle:viewBattle,list:viewList}[v])(el);
  window.scrollTo({top:0});
}

/* ---------- home ---------- */
var HERO_ART='<svg class="hero-art" viewBox="0 0 320 170" aria-hidden="true"><circle cx="262" cy="40" r="22" fill="var(--t1)"/><g fill="var(--sheet)" opacity=".95"><ellipse cx="70" cy="40" rx="30" ry="12"/><ellipse cx="92" cy="32" rx="20" ry="13"/><ellipse cx="200" cy="66" rx="24" ry="9"/></g>'+
 '<path d="M0 150q60-50 130-20t110-10 80 20v30H0z" fill="var(--t3)" opacity=".55"/><path d="M0 160q80-36 170-10t150-6v26H0z" fill="var(--t3)"/>'+
 '<g transform="rotate(-10 110 104)"><rect x="92" y="86" width="36" height="36" rx="9" fill="var(--t2)"/><text x="110" y="113" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="24" fill="#fff">A</text></g>'+
 '<g transform="rotate(6 160 92)"><rect x="142" y="74" width="36" height="36" rx="9" fill="var(--t4)"/><text x="160" y="101" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="24" fill="#fff">B</text></g>'+
 '<g transform="rotate(-4 210 110)"><rect x="192" y="92" width="36" height="36" rx="9" fill="var(--t5)"/><text x="210" y="119" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="24" fill="#fff">C</text></g>'+
 '<path d="M40 100l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="var(--t1)"/><path d="M276 104l2 5 5 .5-4 3.5 1 5-4-2.5-4 2.5 1-5-4-3.5 5-.5z" fill="var(--t1)"/></svg>';
function viewHome(el){
  var tiles=function(grp){return '<div class="tiles">'+GAMES.filter(function(g){return g.grp===grp}).map(function(g,i){return '<button class="tile" data-go="'+g.id+'" style="--c:'+TILE[(i+(grp==="c"?2:0))%5]+'"><span class="ic"><svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">'+g.ic+'</svg></span><b>'+g.name+'</b><span>'+g.desc+'</span><span class="go" aria-hidden="true">Play</span></button>'}).join("")+'</div>'};
  el.innerHTML='<section class="hero"><div><h1>Ready to play with words?</h1><p>Pick a game and practice this week’s '+words().length+' words. Every game uses the same list, so the more you play, the better you’ll know them.</p></div>'+HERO_ART+'</section>'+
  (VIEWS.quest?'<section class="group"><div class="group-head"><span class="badge b-a">Adventure</span><p>Catch and train creatures with your words.</p></div><button class="quest-tile" data-go="quest"><canvas id="qtart" width="432" height="144" aria-hidden="true"></canvas><span><b>Creature Quest</b><span>Explore, catch 100 creatures, beat 8 gym leaders and fill your Creature Book. Every move is a word question.</span><span class="go">Play</span></span></button></section>':'')+
  '<section class="group"><div class="group-head"><span class="badge b-p">Practice</span><p>Learn the words at your own pace.</p></div>'+tiles("p")+'</section>'+
  '<section class="group"><div class="group-head"><span class="badge b-c">Challenge</span><p>Race the clock, the computer and the monsters.</p></div>'+tiles("c")+'</section>'+
  '<section class="wall"><h2>Study the words</h2><dl>'+words().map(function(x,i){return '<div style="--c:'+TILE[i%5]+'"><dt>'+esc(x.w)+'</dt><dd>'+esc(x.d)+'</dd></div>'}).join("")+'</dl></section>';
  if(VIEWS.quest&&window.Creatures){var qc=$("#qtart",el);if(qc){var cx=qc.getContext("2d");[3,27,95].forEach(function(id,i){Creatures.draw(cx,Creatures.DEX[id-1],3,i*144,0)})}}
}

/* ---------- match ---------- */
function viewMatch(el){
  var pool=shuffle(words()).slice(0,6), order=shuffle(pool.map(function(_,i){return i}));
  var sel=null, done=0, tries=0;
  el.innerHTML='<div class="sheet"><div class="head"><div><h2>Match It</h2><p>Tap a word, then tap its meaning.</p></div><div class="row"><span class="pill" id="mscore">0 of '+pool.length+' matched</span><button class="btn alt" id="again">New words</button></div></div>'+
  '<div class="match"><div class="col">'+pool.map(function(x,i){return '<button class="card word" data-side="w" data-i="'+i+'">'+esc(x.w)+'</button>'}).join("")+'</div>'+
  '<div class="col">'+order.map(function(i){return '<button class="card def" data-side="d" data-i="'+i+'">'+esc(pool[i].d)+'</button>'}).join("")+'</div></div>'+
  '<div id="mdone"></div></div>';
  $("#again",el).onclick=function(){go("match")};
  $$(".card",el).forEach(function(b){b.onclick=function(){
    if(b.classList.contains("done"))return;
    var side=b.dataset.side;
    if(!sel||sel.dataset.side===side){if(sel)sel.classList.remove("sel");sel=(sel===b)?null:b;if(sel)sel.classList.add("sel");return}
    tries++;
    var a=sel;sel.classList.remove("sel");sel=null;
    if(a.dataset.i===b.dataset.i){done++;sfx.good();[a,b].forEach(function(c){c.classList.add("done");c.insertAdjacentHTML("afterbegin",'<span class="n" aria-hidden="true">'+done+'</span>')});
      $("#mscore",el).textContent=done+" of "+pool.length+" matched";
      if(done===pool.length){celebrate();$("#mdone",el).innerHTML='<div class="done-card"><h2>All matched!</h2><p class="muted">You did it in '+tries+' tries'+(tries===pool.length?" with no mistakes":"")+'.</p><button class="btn" id="m2">Play again</button></div>';$("#m2",el).onclick=function(){go("match")}}
    }else{sfx.bad();[a,b].forEach(function(c){c.classList.add("wrong","shake");setTimeout(function(){c.classList.remove("wrong","shake")},450)})}
  }});
}

/* ---------- crossword ---------- */
function buildCrossword(items){
  var best=null;
  for(var att=0;att<60;att++){
    var order=items.slice().sort(function(a,b){return (b.ans.length+(att?Math.random()*4:0))-(a.ans.length+(att?Math.random()*4:0))});
    var grid={},dirs={},placed=[];
    var key=function(r,c){return r+","+c};
    var fits=function(ans,r,c,d){var dr=d?1:0,dc=d?0:1,hits=0;
      if(grid[key(r-dr,c-dc)]||grid[key(r+dr*ans.length,c+dc*ans.length)])return -1;
      for(var k=0;k<ans.length;k++){var rr=r+dr*k,cc=c+dc*k,ex=grid[key(rr,cc)];
        if(ex){if(ex!==ans[k]||dirs[key(rr,cc)]&(d?2:1))return -1;hits++}
        else if(grid[key(rr+dc,cc+dr)]||grid[key(rr-dc,cc-dr)])return -1}
      return hits};
    var put=function(it,r,c,d){var dr=d?1:0,dc=d?0:1;for(var k=0;k<it.ans.length;k++){var K=key(r+dr*k,c+dc*k);grid[K]=it.ans[k];dirs[K]=(dirs[K]||0)|(d?2:1)}placed.push({it:it,r:r,c:c,d:d})};
    put(order[0],0,0,0);
    var left=order.slice(1);
    for(var pass=0;pass<2;pass++){
      left=left.filter(function(it){var cands=[];
        Object.keys(grid).forEach(function(K){var p=K.split(","),r=+p[0],c=+p[1],ch=grid[K];
          for(var i=0;i<it.ans.length;i++)if(it.ans[i]===ch)[0,1].forEach(function(d){var sr=d?r-i:r,sc=d?c:c-i,h=fits(it.ans,sr,sc,d);if(h>0)cands.push({r:sr,c:sc,d:d,h:h+Math.random()})})});
        if(!cands.length)return true;
        cands.sort(function(a,b){return b.h-a.h});put(it,cands[0].r,cands[0].c,cands[0].d);return false});
    }
    var rs=placed.map(function(p){return p.r}),cs=placed.map(function(p){return p.c});
    var minR=Infinity,maxR=-Infinity,minC=Infinity,maxC=-Infinity;
    placed.forEach(function(p){var L=p.it.ans.length;minR=Math.min(minR,p.r);minC=Math.min(minC,p.c);maxR=Math.max(maxR,p.d?p.r+L-1:p.r);maxC=Math.max(maxC,p.d?p.c:p.c+L-1)});
    var rows=maxR-minR+1,cols=maxC-minC+1;
    var score=placed.length*1000-rows*cols-Math.abs(rows-cols)*4;
    if(!best||score>best.score)best={score:score,rows:rows,cols:cols,placed:placed.map(function(p){return {it:p.it,r:p.r-minR,c:p.c-minC,d:p.d}})};
  }
  // numbering
  var starts={};best.placed.forEach(function(p){starts[p.r+","+p.c]=1});
  var nums={},n=0;Object.keys(starts).map(function(k){return k.split(",").map(Number)}).sort(function(a,b){return a[0]-b[0]||a[1]-b[1]}).forEach(function(rc){nums[rc[0]+","+rc[1]]=++n});
  best.placed.forEach(function(p){p.num=nums[p.r+","+p.c]});
  return best;
}
function viewCross(el){
  var items=shuffle(words()).map(function(x){return {w:x.w,d:x.d,ans:letters(x.w)}}).filter(function(x){return x.ans.length>=2&&x.ans.length<=15}).slice(0,12);
  var cw=buildCrossword(items), P=cw.placed;
  var cellWords={};P.forEach(function(p,i){for(var k=0;k<p.it.ans.length;k++){var K=(p.d?p.r+k:p.r)+","+(p.d?p.c:p.c+k);(cellWords[K]=cellWords[K]||[]).push(i)}});
  var across=P.map(function(p,i){return i}).filter(function(i){return !P[i].d}).sort(function(a,b){return P[a].num-P[b].num});
  var down=P.map(function(p,i){return i}).filter(function(i){return P[i].d}).sort(function(a,b){return P[a].num-P[b].num});
  var cur=null;
  var clueList=function(ids){return ids.map(function(i){return '<li><button data-w="'+i+'"><b>'+P[i].num+'</b><span>'+esc(P[i].it.d)+' <span class="muted">('+P[i].it.ans.length+')</span></span></button></li>'}).join("")};
  var skipped=items.length-P.length;
  el.innerHTML='<div class="sheet"><div class="head"><div><h2>Crossword</h2><p>Tap a box or a clue, then type. Tap the same box again to switch across and down.</p></div><div class="row"><button class="btn alt" id="hint">Show a letter</button><button class="btn" id="check">Check my answers</button></div></div>'+
   '<div class="cw"><div class="cwgrid-wrap"><div class="cwgrid" id="cwg"></div></div><div class="clues">'+(across.length?'<h3>Across</h3><ol>'+clueList(across)+'</ol>':'')+(down.length?'<h3>Down</h3><ol>'+clueList(down)+'</ol>':'')+'</div></div>'+
   '<p class="feedback" id="cwfb"></p>'+'<div class="row"><button class="btn alt" id="newcw">New puzzle</button>'+(skipped>0?'<span class="muted">'+skipped+' word'+(skipped>1?"s":"")+' did not fit this puzzle. Tap New puzzle to mix it up.</span>':'')+'</div></div>';
  var g=$("#cwg",el);
  var size=Math.max(26,Math.min(46,Math.floor((Math.min(el.clientWidth,1100)-(innerWidth>760?340:40))/cw.cols)-2));
  g.style.setProperty("--c",size+"px");g.style.gridTemplateColumns="repeat("+cw.cols+","+size+"px)";
  var html="";for(var r=0;r<cw.rows;r++)for(var c=0;c<cw.cols;c++){var K=r+","+c;
    if(cellWords[K]){var num=P.filter(function(p){return p.r===r&&p.c===c})[0];html+='<div class="cell on" data-k="'+K+'">'+(num?'<span class="num">'+num.num+'</span>':'')+'<input aria-label="Row '+(r+1)+' column '+(c+1)+'" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="2" data-k="'+K+'"></div>'}
    else html+='<div class="cell"></div>'}
  g.innerHTML=html;
  var inp=function(K){return g.querySelector('input[data-k="'+K+'"]')};
  var cellsOf=function(i){var p=P[i],a=[];for(var k=0;k<p.it.ans.length;k++)a.push((p.d?p.r+k:p.r)+","+(p.d?p.c:p.c+k));return a};
  var focusWord=function(i,K){cur=i;$$(".cell.on",g).forEach(function(c){c.classList.remove("inword","cur")});cellsOf(i).forEach(function(k){g.querySelector('.cell[data-k="'+k+'"]').classList.add("inword")});
    $$(".clues button",el).forEach(function(b){b.classList.toggle("act",+b.dataset.w===i)});
    var target=K||cellsOf(i).filter(function(k){return !inp(k).value})[0]||cellsOf(i)[0];var e=inp(target);e.focus({preventScroll:true});g.querySelector('.cell[data-k="'+target+'"]').classList.add("cur")};
  var lastK=null;
  g.addEventListener("pointerdown",function(e){var c=e.target.closest(".cell.on");if(!c)return;e.preventDefault();var K=c.dataset.k,ws=cellWords[K];
    var i=ws[0];if(K===lastK&&ws.length>1)i=ws[(ws.indexOf(cur)+1)%ws.length];else if(ws.indexOf(cur)>=0)i=cur;lastK=K;focusWord(i,K)});
  g.addEventListener("focusin",function(e){var K=e.target.dataset.k;if(!K)return;$$(".cell.cur",g).forEach(function(c){c.classList.remove("cur")});g.querySelector('.cell[data-k="'+K+'"]').classList.add("cur");if(cellWords[K].indexOf(cur)<0)focusWord(cellWords[K][0],K)});
  var move=function(K,step){var a=cellsOf(cur),j=a.indexOf(K)+step;if(j>=0&&j<a.length){focusWord(cur,a[j]);return true}return false};
  g.addEventListener("input",function(e){var t=e.target,v=letters(t.value);t.value=v.slice(-1);t.parentNode.classList.remove("right","bad");if(t.value){var K=t.dataset.k;move(K,1)}checkSolved(false)});
  g.addEventListener("keydown",function(e){var t=e.target,K=t.dataset.k;if(!K)return;
    if(e.key==="Backspace"&&!t.value){e.preventDefault();var a=cellsOf(cur),j=a.indexOf(K);if(j>0){inp(a[j-1]).value="";focusWord(cur,a[j-1])}}
    else if(e.key==="ArrowRight"||e.key==="ArrowDown"||e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();var p=K.split(",").map(Number),d={ArrowRight:[0,1],ArrowLeft:[0,-1],ArrowDown:[1,0],ArrowUp:[-1,0]}[e.key];var N=(p[0]+d[0])+","+(p[1]+d[1]);if(cellWords[N]){var i=cellWords[N].filter(function(w){return !!P[w].d===(d[0]!==0)})[0];focusWord(i!=null?i:cellWords[N][0],N)}}});
  $$(".clues button",el).forEach(function(b){b.onclick=function(){focusWord(+b.dataset.w)}});
  var answer=function(K){var p=K.split(",").map(Number);for(var x=0;x<P.length;x++){var q=P[x],k=q.d?p[0]-q.r:p[1]-q.c;if((q.d?q.c===p[1]:q.r===p[0])&&k>=0&&k<q.it.ans.length)return q.it.ans[k]}};
  var fb=$("#cwfb",el),won=false;
  var markClues=function(){P.forEach(function(p,i){var ok=cellsOf(i).every(function(k){return inp(k).value===answer(k)});var b=el.querySelector('.clues button[data-w="'+i+'"]');if(b)b.classList.toggle("ok",ok)})};
  function checkSolved(show){var all=Object.keys(cellWords),filled=0,right=0;all.forEach(function(K){var e=inp(K);if(e.value)filled++;if(e.value===answer(K))right++;if(show&&e.value)e.parentNode.classList.add(e.value===answer(K)?"right":"bad")});markClues();
    if(right===all.length&&!won){won=true;fb.className="feedback good";fb.textContent="You solved the whole crossword!";celebrate();return}
    if(show){if(!filled){fb.className="feedback";fb.textContent="Type some letters first, then check."}else{var wrong=filled-right;fb.className="feedback "+(wrong?"bad":"good");fb.textContent=wrong?wrong+" letter"+(wrong>1?"s are":" is")+" not right yet. Fix the red boxes.":"Everything so far is correct. Keep going!"};if(wrong)sfx.bad();else sfx.good()}}
  $("#check",el).onclick=function(){checkSolved(true)};
  $("#hint",el).onclick=function(){if(cur==null)cur=across[0]!=null?across[0]:down[0];var wrongIn=function(i){return cellsOf(i).filter(function(k){return inp(k).value!==answer(k)})};if(!wrongIn(cur).length){var nxt=across.concat(down).filter(function(i){return wrongIn(i).length})[0];if(nxt==null)return;cur=nxt}var K=wrongIn(cur)[0];inp(K).value=answer(K);inp(K).parentNode.classList.remove("bad");focusWord(cur,K);checkSolved(false)};
  $("#newcw",el).onclick=function(){go("cross")};
}

/* ---------- word search ---------- */
function buildSearch(list){
  var items=list.map(function(x){return {w:x.w,d:x.d,ans:letters(x.w)}}).filter(function(x){return x.ans.length>=2&&x.ans.length<=14});
  var longest=Math.max.apply(null,items.map(function(x){return x.ans.length}));
  var total=items.reduce(function(s,x){return s+x.ans.length},0);
  var N=Math.min(14,Math.max(9,longest,Math.ceil(Math.sqrt(total*2.2))));
  var D=[[0,1],[1,0],[1,1],[-1,1]],best=null;
  items.sort(function(a,b){return b.ans.length-a.ans.length});
  for(var att=0;att<40;att++){var g=[],placed=[];for(var i=0;i<N*N;i++)g.push("");
    items.forEach(function(it){for(var t=0;t<300;t++){var d=D[Math.floor(Math.random()*D.length)],L=it.ans.length;
      var r=Math.floor(Math.random()*N),c=Math.floor(Math.random()*N),er=r+d[0]*(L-1),ec=c+d[1]*(L-1);if(er<0||er>=N||ec<0||ec>=N)continue;
      var ok=true,cells=[];for(var k=0;k<L;k++){var idx=(r+d[0]*k)*N+c+d[1]*k;if(g[idx]&&g[idx]!==it.ans[k]){ok=false;break}cells.push(idx)}
      if(!ok)continue;cells.forEach(function(idx,k){g[idx]=it.ans[k]});placed.push({it:it,cells:cells});return}});
    if(!best||placed.length>best.placed.length)best={g:g,placed:placed};if(placed.length===items.length)break}
  var AZ="ABCDEFGHIJKLMNOPRSTUVWY";best.g=best.g.map(function(ch){return ch||AZ[Math.floor(Math.random()*AZ.length)]});best.N=N;return best;
}
var wsClueMode=false;
function viewSearch(el){
  var S=buildSearch(shuffle(words()).slice(0,12)),N=S.N,found={},nFound=0;
  var order=S.placed.slice().sort(function(a,b){return a.it.w.localeCompare(b.it.w)});
  el.innerHTML='<div class="sheet"><div class="head"><div><h2>Word Search</h2><p>Drag across a word, or tap its first letter and then its last letter.</p></div><div class="row"><span class="pill" id="wsc">0 of '+S.placed.length+' found</span><button class="btn alt" id="newws">New puzzle</button></div></div>'+
   '<div class="ws"><div class="wsgrid" id="wsg" role="grid" aria-label="Letter grid"></div><div><label class="toggle"><input type="checkbox" id="cm"'+(wsClueMode?" checked":"")+'> Challenge: show meanings instead of words</label><h3 style="margin:12px 0 8px;font-size:1.3rem">Find these</h3><ul class="findlist" id="fl"></ul></div></div><p class="feedback" id="wsfb"></p></div>';
  var g=$("#wsg",el);
  var size=Math.max(24,Math.min(44,Math.floor((Math.min(el.clientWidth,1100)-(innerWidth>760?320:40))/N)-3));
  g.style.setProperty("--c",size+"px");g.style.gridTemplateColumns="repeat("+N+","+size+"px)";
  g.innerHTML=S.g.map(function(ch,i){return '<div class="wsc" data-i="'+i+'">'+ch+'</div>'}).join("");
  var drawList=function(){var fl=$("#fl",el);fl.classList.toggle("clues-mode",wsClueMode);fl.innerHTML=order.map(function(p){var got=found[p.it.ans];return '<li class="'+(got?"got":"")+'">'+(got?'<s>'+esc(p.it.w)+'</s>'+(wsClueMode?' <span class="muted">'+esc(p.it.d)+'</span>':''):(wsClueMode?esc(p.it.d)+' <span class="muted">('+p.it.ans.length+' letters)</span>':esc(p.it.w)))+'</li>'}).join("")};
  drawList();
  $("#cm",el).onchange=function(){wsClueMode=this.checked;drawList()};
  $("#newws",el).onclick=function(){go("search")};
  var cells=$$(".wsc",g),start=null,anchor=null,dragging=false,line=[];
  var lineBetween=function(a,b){var r1=Math.floor(a/N),c1=a%N,r2=Math.floor(b/N),c2=b%N,dr=r2-r1,dc=c2-c1;if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)))return null;var L=Math.max(Math.abs(dr),Math.abs(dc)),sr=Math.sign(dr),sc=Math.sign(dc),out=[];for(var k=0;k<=L;k++)out.push((r1+sr*k)*N+c1+sc*k);return out};
  var paint=function(arr){cells.forEach(function(c){c.classList.remove("pick")});(arr||[]).forEach(function(i){cells[i].classList.add("pick")})};
  var fb=$("#wsfb",el);
  var evaluate=function(arr){paint(null);if(!arr||arr.length<2)return;var s=arr.map(function(i){return S.g[i]}).join(""),rev=s.split("").reverse().join("");
    var hit=S.placed.filter(function(p){return !found[p.it.ans]&&(p.it.ans===s||p.it.ans===rev)&&(p.cells.join()===arr.join()||p.cells.slice().reverse().join()===arr.join())})[0];
    if(hit){found[hit.it.ans]=1;nFound++;var col=FILL[nFound%FILL.length];hit.cells.forEach(function(i){cells[i].style.background=col});sfx.good();fb.className="feedback good";fb.textContent="You found \u201C"+hit.it.w+"\u201D! It means: "+hit.it.d;
      $("#wsc",el).textContent=nFound+" of "+S.placed.length+" found";drawList();if(nFound===S.placed.length){celebrate();fb.textContent="You found every word!"}}
    else{sfx.bad();fb.className="feedback bad";fb.textContent="That one is not on the list. Try again."}};
  var cellAt=function(e){var t=document.elementFromPoint(e.clientX,e.clientY);t=t&&t.closest&&t.closest(".wsc");return t&&g.contains(t)?+t.dataset.i:null};
  g.addEventListener("pointerdown",function(e){var i=cellAt(e);if(i==null)return;e.preventDefault();
    if(anchor!=null&&anchor!==i){cells[anchor].classList.remove("anchor");var arr=lineBetween(anchor,i);anchor=null;evaluate(arr);return}
    start=i;dragging=true;line=[i];paint(line)});
  g.addEventListener("pointermove",function(e){if(!dragging)return;var i=cellAt(e);if(i==null)return;var arr=lineBetween(start,i);if(arr){line=arr;paint(arr)}});
  var up=function(e){if(!dragging)return;dragging=false;if(line.length<=1){paint(null);if(anchor===start){cells[start].classList.remove("anchor");anchor=null}else{if(anchor!=null)cells[anchor].classList.remove("anchor");anchor=start;cells[start].classList.add("anchor")}return}evaluate(line);line=[]};
  g.addEventListener("pointerup",up);g.addEventListener("pointercancel",function(){dragging=false;paint(null)});
}

/* ---------- quiz ---------- */
function viewQuiz(el){
  var W=words(),qs=shuffle(W).slice(0,10).map(function(x,i){var opts=shuffle([x].concat(shuffle(W.filter(function(y){return y!==x})).slice(0,3)));return {x:x,opts:opts,type:i%2?"word":"def"}});
  var qi=0,score=0,streak=0,best=0,missed=[];
  var draw=function(){
    if(qi>=qs.length)return finish();
    var q=qs[qi];
    el.innerHTML='<div class="sheet"><div class="stage">'+
     '<div class="row" style="justify-content:space-between"><h2 style="font-size:2rem">Quiz Show</h2><div class="row"><span class="pill">Question '+(qi+1)+' of '+qs.length+'</span><span class="pill">Score '+score+'</span><span class="pill">Streak '+streak+'</span></div></div>'+
     '<div class="bar" aria-hidden="true"><i style="width:'+(qi/qs.length*100)+'%"></i></div>'+
     (q.type==="def"?'<div class="prompt"><small>Which word means</small><p>'+esc(q.x.d)+'</p></div>':'<div class="prompt"><small>What does this word mean?</small><p class="big">'+esc(q.x.w)+'</p></div>')+
     '<div class="answers">'+q.opts.map(function(o,i){return '<button class="ans'+(q.type==="def"?" wordy":"")+'" data-i="'+i+'"><span class="k" style="background:'+TILE[i]+'">'+"ABCD"[i]+'</span><span>'+esc(q.type==="def"?o.w:o.d)+'</span></button>'}).join("")+'</div>'+
     '<p class="feedback" id="qfb"></p><div class="row" style="justify-content:center" id="qnext"></div></div></div>';
    $$(".ans",el).forEach(function(b){b.onclick=function(){
      var o=q.opts[+b.dataset.i],ok=o===q.x;$$(".ans",el).forEach(function(x){x.disabled=true;if(q.opts[+x.dataset.i]===q.x)x.classList.add("right")});
      var fb=$("#qfb",el);
      if(ok){streak++;best=Math.max(best,streak);score+=10+(streak>=3?5:0);sfx.good();fb.className="feedback good";fb.textContent=streak>=3?"Correct! Streak bonus: +5":"Correct!"}
      else{streak=0;missed.push(q.x);b.classList.add("wrong","shake");sfx.bad();fb.className="feedback bad";fb.textContent="Not quite. The answer is \u201C"+(q.type==="def"?q.x.w:q.x.d)+"\u201D."}
      $("#qnext",el).innerHTML='<button class="btn" id="nx">'+(qi+1<qs.length?"Next question":"See my score")+'</button>';var nx=$("#nx",el);nx.focus();nx.onclick=function(){qi++;draw()};
    }});
  };
  var finish=function(){var right=qs.length-missed.length,pct=right/qs.length,stars=pct>=.9?3:pct>=.6?2:pct>0?1:0;if(stars>=2)celebrate();
    var star=function(on){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z" fill="'+(on?"var(--pencil)":"var(--rule)")+'"/></svg>'};
    el.innerHTML='<div class="sheet"><div class="done-card"><div class="stars" aria-label="'+stars+' of 3 stars">'+star(stars>0)+star(stars>1)+star(stars>2)+'</div><h2 style="font-size:2.4rem">'+(stars===3?"Superstar!":stars===2?"Great job!":"Nice try!")+'</h2><p>You got <b>'+right+' of '+qs.length+'</b> right and scored <b>'+score+' points</b>. Best streak: '+best+'.</p>'+
     (missed.length?'<h3>Words to practice</h3><ul class="missed">'+missed.map(function(x){return '<li><b>'+esc(x.w)+'</b>: '+esc(x.d)+'</li>'}).join("")+'</ul>':'')+
     '<div class="row" style="justify-content:center"><button class="btn" id="qa">Play again</button><button class="btn alt" data-go="home">Pick another game</button></div></div></div>';$("#qa",el).onclick=function(){go("quiz")}};
  draw();
}

/* ---------- spell ---------- */
var spellMode="meaning";
function viewSpell(el){
  var qs=shuffle(words()),qi=0,right=0,tries=0,missed=[];
  if(!canSpeak)spellMode="meaning";
  var draw=function(){
    if(qi>=qs.length)return finish();
    var q=qs[qi];tries=0;
    el.innerHTML='<div class="sheet"><div class="stage">'+
     '<div class="row" style="justify-content:space-between"><h2 style="font-size:2rem">Spell It</h2><div class="row">'+(canSpeak?'<div class="seg" role="group" aria-label="How to play"><button data-m="meaning" aria-pressed="'+(spellMode==="meaning")+'">Read the meaning</button><button data-m="listen" aria-pressed="'+(spellMode==="listen")+'">Listen and spell</button></div>':'')+'<span class="pill">Word '+(qi+1)+' of '+qs.length+'</span><span class="pill">'+right+' correct</span></div></div>'+
     '<div class="bar" aria-hidden="true"><i style="width:'+(qi/qs.length*100)+'%"></i></div>'+
     '<div class="prompt">'+(spellMode==="listen"?'<small>Listen, then type the word you hear</small><p>'+esc(q.d)+'</p>':'<small>Type the word that means</small><p>'+esc(q.d)+'</p>')+
      '<p class="muted" style="font-size:1rem;margin-top:8px">'+letters(q.w).length+' letters</p></div>'+
     '<form class="spellbox" id="sf" autocomplete="off"><input id="si" aria-label="Type the word" autocapitalize="off" spellcheck="false" autocorrect="off" placeholder="Type here"><button class="btn" type="submit">Check</button></form>'+
     '<div class="row" style="justify-content:center">'+(canSpeak?'<button class="btn alt" id="hear">Hear the word</button>':'')+'<button class="btn alt" id="hintb">Hint</button><button class="btn alt" id="skip">Skip</button></div>'+
     '<p class="feedback" id="sfb"></p></div></div>';
    var si=$("#si",el),fb=$("#sfb",el),hint=0,solved=false;si.focus();
    $$(".seg button",el).forEach(function(b){b.onclick=function(){spellMode=b.dataset.m;draw()}});
    if(spellMode==="listen")setTimeout(function(){say(q.w)},250);
    var h=$("#hear",el);if(h)h.onclick=function(){say(q.w);si.focus()};
    $("#hintb",el).onclick=function(){hint=Math.min(hint+1,q.w.length-1);si.value=q.w.slice(0,hint);si.className="";fb.className="feedback";fb.textContent="The word starts with \u201C"+q.w.slice(0,hint)+"\u201D.";si.focus()};
    $("#skip",el).onclick=function(){missed.push(q);qi++;draw()};
    $("#sf",el).onsubmit=function(e){e.preventDefault();if(solved){qi++;draw();return}var v=si.value.trim();if(!v){fb.className="feedback";fb.textContent="Type the word first.";return}
      if(norm(v)===norm(q.w)){solved=true;if(tries>=0)right++;sfx.good();si.className="good";si.readOnly=true;fb.className="feedback good";fb.textContent="Correct! \u201C"+q.w+"\u201D is right.";var bx=el.querySelector("#sf button");bx.textContent=qi+1<qs.length?"Next word":"See my score";bx.type="button";bx.onclick=function(){qi++;draw()};bx.focus();return}
      tries++;sfx.bad();si.className="bad";si.classList.add("shake");setTimeout(function(){si.classList.remove("shake")},400);
      var d=dist(norm(v),norm(q.w));
      if(tries>=3){missed.push(q);fb.className="feedback bad";fb.innerHTML="The word is <b>"+esc(q.w)+"</b>. Type it once to practice, then keep going.";si.value="";si.className="";tries=-99}
      else{fb.className="feedback bad";fb.textContent=d<=2?"So close! Check your spelling and try again.":"Not quite. Try again, or tap Hint."}
      si.focus();si.select()};
  };
  var finish=function(){if(right/qs.length>=.7)celebrate();
    el.innerHTML='<div class="sheet"><div class="done-card"><h2 style="font-size:2.4rem">'+(missed.length?"Nice work!":"Perfect spelling!")+'</h2><p>You spelled <b>'+right+' of '+qs.length+'</b> words.</p>'+
    (missed.length?'<h3>Words to practice</h3><ul class="missed">'+missed.map(function(x){return '<li><b>'+esc(x.w)+'</b>: '+esc(x.d)+'</li>'}).join("")+'</ul>':'')+
    '<div class="row" style="justify-content:center"><button class="btn" id="sa">Play again</button><button class="btn alt" data-go="home">Pick another game</button></div></div></div>';$("#sa",el).onclick=function(){go("spell")}};
  draw();
}

/* ---------- shared: multiple-choice questions ---------- */
function makeQs(n){var W=words(),pool=[];while(pool.length<n)pool=pool.concat(shuffle(W));return pool.slice(0,n).map(function(x,i){return {x:x,type:Math.random()<.5?"def":"word",opts:shuffle([x].concat(shuffle(W.filter(function(y){return y!==x})).slice(0,3)))}})}
function mcqHTML(q,cls){return (q.type==="def"?'<div class="prompt '+(cls||"")+'"><small>Which word means</small><p>'+esc(q.x.d)+'</p></div>':'<div class="prompt '+(cls||"")+'"><small>What does this word mean?</small><p class="big">'+esc(q.x.w)+'</p></div>')+
  '<div class="answers">'+q.opts.map(function(o,i){return '<button class="ans'+(q.type==="def"?" wordy":"")+'" data-i="'+i+'"><span class="k" style="background:'+TILE[i]+'">'+"ABCD"[i]+'</span><span>'+esc(q.type==="def"?o.w:o.d)+'</span></button>'}).join("")+'</div>'}
function bindMCQ(el,q,cb){$$(".ans",el).forEach(function(b){b.onclick=function(){var ok=q.opts[+b.dataset.i]===q.x;$$(".ans",el).forEach(function(x){x.disabled=true;if(q.opts[+x.dataset.i]===q.x)x.classList.add("right")});if(!ok)b.classList.add("wrong","shake");cb(ok)}})}
function bestGet(k){return +(lsGet("ww-best-"+k)||0)}
function bestSet(k,v){if(v>bestGet(k))lsSet("ww-best-"+k,String(v))}
function heartSVG(on){return '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.1 1.8-1.9 3.3-3.1 5.4-3.1 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" fill="'+(on?"var(--bad)":"var(--rule)")+'"/></svg>'}

/* ---------- word rescue (hangman) ---------- */
function viewRescue(el){
  var pool=shuffle(words().filter(function(x){return letters(x.w).length>=3})),qi=0,saved=0;
  if(!pool.length)pool=shuffle(words());
  var KEYS="QWERTYUIOP ASDFGHJKL ZXCVBNM".split(" ");
  var round=function(){
    var q=pool[qi%pool.length],ans=letters(q.w),guessed={},misses=0,MAX=6,over=false;
    el.innerHTML='<div class="sheet"><div class="head"><div><h2>Word Rescue</h2><p>Guess the letters to keep the treasure in the air. Each wrong letter pops a balloon.</p></div><div class="row"><span class="pill">Saved '+saved+'</span><span class="pill">Word '+(qi+1)+'</span></div></div>'+
     '<div class="rescue"><div class="sky" id="sky"></div><div class="rescue-main"><div class="prompt"><small>Clue</small><p>'+esc(q.d)+'</p></div><div class="slots" id="slots"></div><p class="feedback" id="rfb"></p><div class="keys" id="keys">'+KEYS.map(function(r){return '<div>'+r.split("").map(function(k){return '<button class="key" data-k="'+k+'">'+k+'</button>'}).join("")+'</div>'}).join("")+'</div><div class="row" style="justify-content:center" id="rnext"></div></div></div></div>';
    var drawSky=function(state){var cols=["var(--t1)","var(--t2)","var(--t3)","var(--t4)","var(--t5)","var(--margin)"],xs=[55,80,105,130,155,105],ys=[52,30,22,30,52,52],s='';
      var drop=state==="lost"?70:0,lift=state==="won"?-30:0;
      s+='<svg viewBox="0 0 210 230" class="sky-svg'+(state?" "+state:"")+'" aria-label="'+(MAX-misses)+' balloons left"><g style="transform:translateY('+(drop+lift)+'px);transition:transform .8s">';
      for(var i=0;i<MAX;i++){if(i<MAX-misses){s+='<path d="M'+xs[i]+' '+(ys[i]+22)+' Q'+(xs[i]+(105-xs[i])/2)+' 120 105 150" stroke="var(--ink-soft)" stroke-width="1.5" fill="none"/><ellipse cx="'+xs[i]+'" cy="'+ys[i]+'" rx="16" ry="20" fill="'+cols[i]+'"/><path d="M'+(xs[i]-6)+' '+(ys[i]-8)+'q3-6 8-6" stroke="var(--sheet)" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>'}}
      s+='<rect x="80" y="150" width="50" height="34" rx="6" fill="var(--pencil)" stroke="var(--ink)" stroke-width="3"/><rect x="88" y="128" width="34" height="22" rx="3" fill="var(--margin)" stroke="var(--ink)" stroke-width="3"/><path d="M88 136h34" stroke="var(--ink)" stroke-width="2.5"/><rect x="101" y="132" width="8" height="9" rx="1.5" fill="var(--pencil)" stroke="var(--ink)" stroke-width="2"/>'+
        (state==="won"?'<path d="M105 104l3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7-5.5-4.5 7-.5z" fill="var(--pencil)" stroke="var(--ink)" stroke-width="1.5"/>':'')+'</g>'+
        '<path d="M0 222h210" stroke="var(--good)" stroke-width="8"/></svg>';$("#sky",el).innerHTML=s};
    var drawSlots=function(reveal){$("#slots",el).innerHTML=q.w.split("").map(function(ch){var L=ch.toUpperCase();if(!/[A-Z]/.test(L))return ch===" "?'<span class="gap"></span>':'<span class="slot fixed">'+esc(ch)+'</span>';var show=guessed[L]||reveal;return '<span class="slot'+(show?" on":"")+(reveal&&!guessed[L]?" miss":"")+'">'+(show?L:"")+'</span>'}).join("")};
    drawSky();drawSlots();
    var fb=$("#rfb",el);
    var guess=function(L){if(over||guessed[L])return;guessed[L]=1;var kb=el.querySelector('.key[data-k="'+L+'"]');
      if(ans.indexOf(L)>=0){kb.classList.add("hit");sfx.good()}else{kb.classList.add("no");misses++;sfx.bad();drawSky()}
      kb.disabled=true;drawSlots();
      var won=ans.split("").every(function(c){return guessed[c]});
      if(won){over=true;saved++;drawSky("won");celebrate();fb.className="feedback good";fb.textContent="Treasure saved! The word is “"+q.w+"”."}
      else if(misses>=MAX){over=true;drawSky("lost");drawSlots(true);fb.className="feedback bad";fb.textContent="Out of balloons! The word was “"+q.w+"”."}
      if(over){$$(".key",el).forEach(function(k){k.disabled=true});$("#rnext",el).innerHTML='<button class="btn" id="rn">Next word</button>';$("#rn",el).onclick=function(){qi++;round()};$("#rn",el).focus()}};
    $$(".key",el).forEach(function(k){k.onclick=function(){guess(k.dataset.k)}});
    keyHandler=function(e){if(e.ctrlKey||e.metaKey||e.altKey)return;var L=(e.key||"").toUpperCase();if(/^[A-Z]$/.test(L)){e.preventDefault();guess(L)}};
  };
  var keyHandler=null,kh=function(e){if(keyHandler)keyHandler(e)};
  document.addEventListener("keydown",kh);onLeave(function(){document.removeEventListener("keydown",kh)});
  round();
}

/* ---------- memory flip ---------- */
function viewMemory(el){
  var pool=shuffle(words()).slice(0,6),cards=shuffle(pool.reduce(function(a,x,i){return a.concat([{p:i,t:"w",s:x.w},{p:i,t:"d",s:x.d}])},[]));
  var open=[],moves=0,pairs=0,lock=false;
  el.innerHTML='<div class="sheet"><div class="head"><div><h2>Memory Flip</h2><p>Flip two cards. Find each word and its meaning.</p></div><div class="row"><span class="pill" id="mm">Moves 0</span><span class="pill" id="mp">0 of '+pool.length+' pairs</span><button class="btn alt" id="mnew">New game</button></div></div>'+
   '<div class="mem">'+cards.map(function(c,i){return '<button class="flip" data-i="'+i+'" aria-label="Card '+(i+1)+'"><span class="face back"><svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><path d="M17 17a7 7 0 1 1 10 6c-2 1-3 3-3 5v2" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/><circle cx="24" cy="38" r="3" fill="currentColor"/></svg></span><span class="face front '+(c.t==="w"?"fw":"fd")+'">'+esc(c.s)+'</span></button>'}).join("")+'</div><div id="mdone2"></div></div>';
  $("#mnew",el).onclick=function(){go("memory")};
  var btns=$$(".flip",el);
  btns.forEach(function(b){b.onclick=function(){var i=+b.dataset.i;if(lock||b.classList.contains("up"))return;b.classList.add("up");b.setAttribute("aria-label",cards[i].s);open.push(i);
    if(open.length<2)return;moves++;$("#mm",el).textContent="Moves "+moves;var a=open[0],c=open[1];open=[];
    if(cards[a].p===cards[c].p){pairs++;sfx.good();[a,c].forEach(function(k){btns[k].classList.add("got");btns[k].disabled=true});$("#mp",el).textContent=pairs+" of "+pool.length+" pairs";
      if(pairs===pool.length){celebrate();bestSetLow("memory",moves);$("#mdone2",el).innerHTML='<div class="done-card"><h2>All pairs found!</h2><p class="muted">You used '+moves+' moves. Your best is '+bestGet("memory-low")+'.</p><button class="btn" id="m3">Play again</button></div>';$("#m3",el).onclick=function(){go("memory")}}}
    else{lock=true;setTimeout(function(){sfx.bad();[a,c].forEach(function(k){btns[k].classList.remove("up");btns[k].setAttribute("aria-label","Card "+(k+1))});lock=false},1100)}}});
}
function bestSetLow(k,v){var o=+(lsGet("ww-best-"+k+"-low")||0);if(!o||v<o)lsSet("ww-best-"+k+"-low",String(v))}

/* ---------- word scramble ---------- */
function viewScramble(el){
  var pool=shuffle(words().filter(function(x){return letters(x.w).length>=3})).slice(0,10),qi=0,score=0;
  if(pool.length<2)pool=shuffle(words()).slice(0,10);
  var round=function(){
    if(qi>=pool.length)return finish();
    var q=pool[qi],ans=letters(q.w),tiles,tries=0,done=false;
    do{tiles=shuffle(ans.split(""))}while(tiles.join("")===ans&&ans.length>1&&new Set(ans).size>1);
    var used=tiles.map(function(){return false}),slots=[];
    el.innerHTML='<div class="sheet"><div class="stage"><div class="row" style="justify-content:space-between"><h2 style="font-size:2rem">Word Scramble</h2><div class="row"><span class="pill">Word '+(qi+1)+' of '+pool.length+'</span><span class="pill">Score '+score+'</span></div></div>'+
     '<div class="bar" aria-hidden="true"><i style="width:'+(qi/pool.length*100)+'%"></i></div>'+
     '<div class="prompt"><small>Unscramble the word that means</small><p>'+esc(q.d)+'</p></div>'+
     '<div class="slots big" id="sl"></div><div class="tiles2" id="tl"></div>'+
     '<div class="row" style="justify-content:center"><button class="btn alt" id="sclr">Clear</button><button class="btn alt" id="shint">Hint</button><button class="btn alt" id="sskip">Skip</button></div><p class="feedback" id="sfb2"></p><div class="row" style="justify-content:center" id="snext"></div></div></div>';
    var fb=$("#sfb2",el);
    var draw=function(){$("#sl",el).innerHTML=ans.split("").map(function(_,i){var t=slots[i];return '<button class="slot on'+(t!=null?"":" empty")+'" data-s="'+i+'" aria-label="Spot '+(i+1)+'">'+(t!=null?tiles[t]:"")+'</button>'}).join("");
      $("#tl",el).innerHTML=tiles.map(function(ch,i){return '<button class="tile2'+(used[i]?" used":"")+'" data-t="'+i+'"'+(used[i]?" disabled":"")+'>'+ch+'</button>'}).join("");
      $$("#tl .tile2",el).forEach(function(b){b.onclick=function(){place(+b.dataset.t)}});
      $$("#sl .slot",el).forEach(function(b){b.onclick=function(){var i=+b.dataset.s;if(done||slots[i]==null)return;used[slots[i]]=false;slots[i]=null;draw()}})};
    var place=function(t){if(done||used[t])return;var i=0;while(slots[i]!=null)i++;if(i>=ans.length)return;slots[i]=t;used[t]=true;draw();check()};
    var check=function(){for(var i=0;i<ans.length;i++)if(slots[i]==null)return;var guess=slots.map(function(t){return tiles[t]}).join("");
      if(guess===ans){done=true;var pts=tries?5:10;score+=pts;sfx.good();$("#sl",el).classList.add("good");fb.className="feedback good";fb.textContent="Correct! “"+q.w+"”  +"+pts;
        $("#snext",el).innerHTML='<button class="btn" id="sn">'+(qi+1<pool.length?"Next word":"See my score")+'</button>';$("#sn",el).onclick=function(){qi++;round()};$("#sn",el).focus()}
      else{tries++;sfx.bad();var s=$("#sl",el);s.classList.add("shake");setTimeout(function(){s.classList.remove("shake")},400);fb.className="feedback bad";fb.textContent="Not quite. Tap a letter in the boxes to take it back."}};
    $("#sclr",el).onclick=function(){if(done)return;slots=[];used=used.map(function(){return false});draw()};
    $("#shint",el).onclick=function(){if(done)return;tries++;var i=0;while(i<ans.length&&slots[i]!=null&&tiles[slots[i]]===ans[i])i++;if(i>=ans.length)return;
      for(var k=i;k<ans.length;k++)if(slots[k]!=null){used[slots[k]]=false;slots[k]=null}
      var t=tiles.findIndex(function(ch,j){return !used[j]&&ch===ans[i]});slots[i]=t;used[t]=true;draw();fb.className="feedback";fb.textContent="Letter "+(i+1)+" is "+ans[i]+".";check()};
    $("#sskip",el).onclick=function(){qi++;round()};
    keyHandler=function(e){if(done||e.ctrlKey||e.metaKey||e.altKey)return;var L=(e.key||"").toUpperCase();
      if(/^[A-Z]$/.test(L)){var t=tiles.findIndex(function(ch,j){return !used[j]&&ch===L});if(t>=0){e.preventDefault();place(t)}}
      else if(e.key==="Backspace"){e.preventDefault();for(var i=ans.length-1;i>=0;i--)if(slots[i]!=null){used[slots[i]]=false;slots[i]=null;draw();break}}};
    draw();
  };
  var finish=function(){keyHandler=null;if(score>=pool.length*7)celebrate();bestSet("scramble",score);
    el.innerHTML='<div class="sheet"><div class="done-card"><h2 style="font-size:2.4rem">Unscrambled!</h2><p>You scored <b>'+score+' of '+pool.length*10+'</b> points. Best: '+bestGet("scramble")+'.</p><div class="row" style="justify-content:center"><button class="btn" id="sca">Play again</button><button class="btn alt" data-go="home">Pick another game</button></div></div></div>';$("#sca",el).onclick=function(){go("scramble")}};
  var keyHandler=null,kh=function(e){if(keyHandler)keyHandler(e)};
  document.addEventListener("keydown",kh);onLeave(function(){document.removeEventListener("keydown",kh)});
  round();
}

/* ---------- falling words ---------- */
var fallSpeed="slow";
function viewFall(el){
  var SPEEDS={slow:{v:28,label:"Slow"},medium:{v:48,label:"Medium"},fast:{v:72,label:"Fast"}};
  var start=function(){
    var W=words(),lives=3,score=0,wave=0,missed=[],raf=0,paused=false,drops=[],target=null,last=0,waveOver=false,queue=[];
    el.innerHTML='<div class="sheet"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="font-size:2rem">Falling Words</h2><div class="row"><span class="hearts" id="fh"></span><span class="pill" id="fs">Score 0</span><button class="btn alt" id="fp">Pause</button></div></div>'+
     '<div class="prompt" id="fq"><small>Tap the word that means</small><p></p></div>'+
     '<div class="fall" id="fa"><div class="ground"></div><div class="fall-msg" id="fm" hidden></div></div><p class="feedback" id="ffb"></p></div>';
    var area=$("#fa",el),fb=$("#ffb",el);
    var drawHearts=function(){$("#fh",el).innerHTML=[0,1,2].map(function(i){return heartSVG(i<lives)}).join("")};drawHearts();
    var nextWave=function(){drops.forEach(function(d){d.el.remove()});drops=[];wave++;waveOver=false;
      if(!queue.length)queue=shuffle(W);target=queue.pop();
      var others=shuffle(W.filter(function(y){return y!==target})).slice(0,2),set=shuffle([target].concat(others));
      $("#fq p",el).textContent=target.d;
      var w=area.clientWidth,lane=w/set.length;
      set.forEach(function(x,i){var b=document.createElement("button");b.className="drop-word";b.textContent=x.w;area.appendChild(b);
        var bw=b.offsetWidth,left=Math.max(4,Math.min(w-bw-4,lane*i+(lane-bw)/2+(Math.random()-.5)*Math.max(0,lane-bw-8)));b.style.left=left+"px";
        var d={x:x,el:b,y:-50-Math.random()*90-i*15};b.style.transform="translateY("+d.y+"px)";
        b.onclick=function(){if(paused||waveOver)return;if(x===target){waveOver=true;score+=10+Math.min(wave,20);sfx.good();b.classList.add("pop");fb.className="feedback good";fb.textContent="Yes! “"+x.w+"”";$("#fs",el).textContent="Score "+score;setTimeout(nextWave,450)}
          else{sfx.bad();b.classList.add("bad");b.disabled=true;loseLife("Oops, “"+x.w+"” means: "+x.d)}};
        drops.push(d)});
    };
    var loseLife=function(msg){lives--;drawHearts();fb.className="feedback bad";fb.textContent=msg;if(missed.indexOf(target)<0)missed.push(target);if(lives<=0)end()};
    var speed=function(){return SPEEDS[fallSpeed].v*(1+Math.min(wave,30)*0.03)};
    var tick=function(t){raf=requestAnimationFrame(tick);if(!last)last=t;var dt=Math.min(0.05,(t-last)/1000);last=t;if(paused||lives<=0)return;
      var floor=area.clientHeight-46;
      drops.forEach(function(d){d.y+=speed()*dt;d.el.style.transform="translateY("+d.y+"px)";
        if(d.y>floor&&!d.gone){d.gone=true;d.el.classList.add("landed");if(d.x===target&&!waveOver){waveOver=true;loseLife("It was “"+target.w+"”.");if(lives>0)setTimeout(nextWave,700)}}})};
    var end=function(){cancelAnimationFrame(raf);bestSet("fall",score);setTimeout(function(){
      el.innerHTML='<div class="sheet"><div class="done-card"><h2 style="font-size:2.4rem">Game over</h2><p>You scored <b>'+score+' points</b> on '+SPEEDS[fallSpeed].label.toLowerCase()+' speed. Best: '+bestGet("fall")+'.</p>'+
      (missed.length?'<h3>Words to practice</h3><ul class="missed">'+missed.map(function(x){return '<li><b>'+esc(x.w)+'</b>: '+esc(x.d)+'</li>'}).join("")+'</ul>':'')+
      '<div class="row" style="justify-content:center"><button class="btn" id="fa2">Play again</button><button class="btn alt" data-go="home">Pick another game</button></div></div></div>';$("#fa2",el).onclick=function(){go("fall")}},600)};
    $("#fp",el).onclick=function(){paused=!paused;this.textContent=paused?"Resume":"Pause";var m=$("#fm",el);m.hidden=!paused;m.textContent="Paused";last=0};
    onLeave(function(){cancelAnimationFrame(raf)});
    nextWave();raf=requestAnimationFrame(tick);
  };
  el.innerHTML='<div class="sheet"><div class="stage"><h2 style="font-size:2.2rem">Falling Words</h2><p>Words fall from the sky. Read the meaning, then tap the word that matches before it lands. You have 3 hearts, and the words fall a little faster each round.</p>'+
   '<div class="row"><span style="font-weight:600">Speed</span><div class="seg" role="group" aria-label="Speed">'+Object.keys(SPEEDS).map(function(k){return '<button data-sp="'+k+'" aria-pressed="'+(fallSpeed===k)+'">'+SPEEDS[k].label+'</button>'}).join("")+'</div></div>'+
   '<div class="row"><button class="btn" id="fgo">Start</button><span class="muted">Best score: '+bestGet("fall")+'</span></div></div></div>';
  $$("[data-sp]",el).forEach(function(b){b.onclick=function(){fallSpeed=b.dataset.sp;$$("[data-sp]",el).forEach(function(x){x.setAttribute("aria-pressed",x===b)})}});
  $("#fgo",el).onclick=start;
}

/* ---------- hack race (inspired by CyberHack) ---------- */
var hackLevel="normal";
function viewHack(el){
  var LV={easy:{r:1.0,att:0,label:"Easy"},normal:{r:1.4,att:22,label:"Normal"},hard:{r:1.9,att:14,label:"Hard"}};
  var start=function(){
    var L=LV[hackLevel],mult=shuffle([0.85,1,1.15]);
    var P=[{name:"You",p:0,you:true,c:"var(--pencil)"},{name:"ByteBot",p:0,r:L.r*mult[0],c:"var(--t2)"},{name:"Glitch",p:0,r:L.r*mult[1],c:"var(--t4)"},{name:"Pixel",p:0,r:L.r*mult[2],c:"var(--t5)"}];
    var qs=makeQs(60),qi=0,streak=0,tokens=0,locked=0,over=false,log=["> Connected. Answer questions to hack the system."],timer=0,secs=0,nextAtt=L.att?L.att+Math.random()*8:0;
    el.innerHTML='<div class="sheet"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="font-size:2rem">Hack Race</h2><span class="pill">'+L.label+'</span></div>'+
     '<div class="term"><div class="term-bars" id="hb"></div><div class="term-log" id="hl" aria-live="polite"></div><div class="term-hack" id="hh"></div></div>'+
     '<div class="stage" style="margin-top:16px" id="hq"></div></div>';
    var drawBars=function(){$("#hb",el).innerHTML=P.map(function(p){var v=Math.min(100,Math.round(p.p));return '<div class="hrow'+(p.you?" you":"")+'"><span class="hn">'+p.name+'</span><span class="htrack"><i style="width:'+v+'%;background:'+p.c+'"></i></span><span class="hv">'+v+'%</span></div>'}).join("")};
    var say2=function(s){log.push("> "+s);log=log.slice(-4);$("#hl",el).innerHTML=log.map(function(l){return '<div>'+esc(l)+'</div>'}).join("")};
    var drawHack=function(){var h=$("#hh",el);if(!tokens||over){h.innerHTML="";return}
      h.innerHTML='<span>Hack ready! Pick a rival to knock back:</span>'+P.filter(function(p){return !p.you}).map(function(p,i){return '<button class="hk" data-n="'+p.name+'">'+p.name+'</button>'}).join("");
      $$(".hk",h).forEach(function(b){b.onclick=function(){var t=P.filter(function(p){return p.name===b.dataset.n})[0];t.p=Math.max(0,t.p-15);tokens--;sfx.win();say2("You hacked "+t.name+"! -15%");drawBars();drawHack()}})};
    var ask=function(){if(over)return;var q=qs[qi++%qs.length],box=$("#hq",el);box.innerHTML=mcqHTML(q)+'<p class="feedback" id="hfb"></p>';
      bindMCQ(box,q,function(ok){var fb=$("#hfb",el);
        if(ok){streak++;var gain=10+(streak>=3?5:0);P[0].p+=gain;sfx.good();fb.className="feedback good";fb.textContent="Access granted! +"+gain+"%";if(streak%3===0){tokens++;say2("Streak of "+streak+"! You earned a hack.");drawHack()}drawBars();
          if(P[0].p>=100)return finish();setTimeout(ask,650)}
        else{streak=0;sfx.bad();fb.className="feedback bad";fb.textContent="Firewall! The answer was “"+(q.type==="def"?q.x.w:q.x.d)+"”. Locked for 2 seconds.";setTimeout(ask,2200)}})};
    var finish=function(){if(over)return;over=true;clearInterval(timer);drawHack();
      var place=1+P.filter(function(p){return !p.you&&p.p>=100}).length;if(place===1)celebrate();bestSet("hack-"+hackLevel,place===1?1:0);
      var names=["1st","2nd","3rd","4th"];
      $("#hq",el).innerHTML='<div class="done-card"><h2 style="font-size:2.4rem">'+(place===1?"You hacked the system first!":place===4?"The computers won this time":"You finished "+names[place-1]+"!")+'</h2><p>You came in <b>'+names[place-1]+'</b> on '+L.label.toLowerCase()+'.'+(place>1?" Try again, or pick an easier level.":" Try a harder level next.")+'</p><div class="row" style="justify-content:center"><button class="btn" id="ha">Play again</button><button class="btn alt" data-go="home">Pick another game</button></div></div>';
      $("#ha",el).onclick=function(){go("hack")}};
    timer=setInterval(function(){if(over)return;secs+=0.25;
      P.forEach(function(p){if(!p.you&&p.p<100){p.p+=p.r*0.25*(0.4+Math.random()*1.2);if(p.p>=100){p.p=100;say2(p.name+" broke in!")}}});
      if(nextAtt&&secs>=nextAtt){var a=P[1+Math.floor(Math.random()*3)];P[0].p=Math.max(0,P[0].p-8);say2(a.name+" hacked you! -8%");sfx.bad();nextAtt=secs+L.att+Math.random()*10}
      drawBars();if(P.filter(function(p){return !p.you&&p.p>=100}).length===3)finish()},250);
    onLeave(function(){clearInterval(timer);over=true});
    drawBars();say2("Race started. Reach 100% first!");ask();
  };
  el.innerHTML='<div class="sheet"><div class="stage"><h2 style="font-size:2.2rem">Hack Race</h2><p>Race three computer hackers to 100%. Every right answer moves you ahead, and 3 in a row earns a hack you can use to knock a rival back. A wrong answer locks you out for 2 seconds.</p>'+
   '<div class="term" aria-hidden="true"><div class="term-bars">'+["You","ByteBot","Glitch","Pixel"].map(function(n,i){return '<div class="hrow"><span class="hn">'+n+'</span><span class="htrack"><i style="width:'+[0,0,0,0][i]+'%"></i></span><span class="hv">0%</span></div>'}).join("")+'</div></div>'+
   '<div class="row"><span style="font-weight:600">Rivals</span><div class="seg" role="group" aria-label="Level">'+Object.keys(LV).map(function(k){return '<button data-lv="'+k+'" aria-pressed="'+(hackLevel===k)+'">'+LV[k].label+'</button>'}).join("")+'</div></div>'+
   '<div class="row"><button class="btn" id="hgo">Start the race</button></div></div></div>';
  $$("[data-lv]",el).forEach(function(b){b.onclick=function(){hackLevel=b.dataset.lv;$$("[data-lv]",el).forEach(function(x){x.setAttribute("aria-pressed",x===b)})}});
  $("#hgo",el).onclick=start;
}

/* ---------- monster battle ---------- */
var MONSTERS=[["Blobby",30],["Grumblewump",45],["Snaggletooth",60],["Fuzzbeast",80],["Sir Snoots",100],["Wobblegob",125],["Thunderpuff",150],["The Goblin King",180]];
function monsterSVG(lv){var col=["var(--t3)","var(--t2)","var(--t1)","var(--t5)","var(--t4)","var(--t3)","var(--t2)","var(--t5)"][lv%8],s='<svg viewBox="0 0 160 150" aria-hidden="true">';
  if(lv>=7)s+='<path d="M55 30l8-18 9 14 8-16 8 16 9-14 8 18z" fill="var(--pencil)" stroke="var(--ink)" stroke-width="3"/>';
  s+='<path d="M20 120c-6-60 24-90 60-90s66 30 60 90c-10 14-30 6-40 14-10-8-30-8-40 0-10-8-30 0-40-14z" fill="'+col+'" stroke="var(--ink)" stroke-width="4"/>';
  var spots=[[52,100,9],[102,84,7],[80,112,6],[118,104,5],[66,76,5],[96,108,8]].slice(0,2+lv%5);spots.forEach(function(d){s+='<circle cx="'+d[0]+'" cy="'+d[1]+'" r="'+d[2]+'" fill="var(--sheet)" opacity=".45"/>'});
  if(lv>=3)s+='<path d="M34 80q46 14 92 0" stroke="var(--ink)" stroke-width="3" fill="none" opacity=".35"/>';
  if(lv>=4)s+='<path d="M20 95c-14-4-16-20-6-24M140 95c14-4 16-20 6-24" stroke="var(--ink)" stroke-width="4" fill="none" stroke-linecap="round"/>';
  return s+'</svg>'}
function heroSVG(){return '<svg viewBox="0 0 120 150" aria-hidden="true"><rect x="38" y="60" width="44" height="60" rx="10" fill="var(--t2)" stroke="var(--ink)" stroke-width="4"/><circle cx="60" cy="40" r="24" fill="var(--sheet)" stroke="var(--ink)" stroke-width="4"/><path d="M36 16q24-16 48 0v6H36z" fill="var(--margin)" stroke="var(--ink)" stroke-width="3"/><rect x="88" y="30" width="10" height="70" rx="3" transform="rotate(20 93 65)" fill="var(--pencil)" stroke="var(--ink)" stroke-width="3"/><path d="M14 70h22v26q-11 10-22 0z" fill="var(--t3)" stroke="var(--ink)" stroke-width="3.5"/><path d="M42 120v20M78 120v20" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/></svg>'}
function viewBattle(el){
  var hp=100,lv=0,mhp=MONSTERS[0][1],streak=0,qs=makeQs(200),qi=0,over=false;
  el.innerHTML='<div class="sheet"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="font-size:2rem">Monster Battle</h2><div class="row"><span class="pill" id="bs">Monster 1 of '+MONSTERS.length+'</span><span class="pill">Best: '+bestGet("battle")+' beaten</span></div></div>'+
   '<div class="arena"><div class="fighter" id="hero"><div class="fname">You</div><div class="hp"><i id="hhp"></i></div><div class="hpv" id="hhv"></div><div class="art">'+heroSVG()+'</div></div>'+
   '<div class="vs">VS</div><div class="fighter" id="mon"><div class="fname" id="mname"></div><div class="hp"><i id="mhp"></i></div><div class="hpv" id="mhv"></div><div class="art" id="mart"></div></div></div>'+
   '<p class="feedback" id="bfb"></p><div class="stage" id="bq"></div></div>';
  var fb=$("#bfb",el);
  var drawHP=function(){var mx=MONSTERS[lv][1];$("#hhp",el).style.width=Math.max(0,hp)+"%";$("#hhp",el).style.background=hp>50?"var(--good)":hp>25?"var(--pencil)":"var(--bad)";$("#hhv",el).textContent=Math.max(0,hp)+" / 100 HP";
    $("#mhp",el).style.width=Math.max(0,mhp/mx*100)+"%";$("#mhv",el).textContent=Math.max(0,mhp)+" / "+mx+" HP"};
  var drawMon=function(){$("#mname",el).textContent=MONSTERS[lv][0]+" (level "+(lv+1)+")";$("#mart",el).innerHTML=monsterSVG(lv);$("#bs",el).textContent="Monster "+(lv+1)+" of "+MONSTERS.length;drawHP()};
  var floatNum=function(who,txt,cls){var f=document.createElement("span");f.className="dmg "+cls;f.textContent=txt;$(who,el).appendChild(f);setTimeout(function(){f.remove()},900)};
  var anim=function(sel,c){var e=$(sel,el);e.classList.remove(c);void e.offsetWidth;e.classList.add(c)};
  var ask=function(){if(over)return;var q=qs[qi++],box=$("#bq",el);box.innerHTML=mcqHTML(q);
    bindMCQ(box,q,function(ok){
      if(ok){streak++;var dmg=12+Math.min(streak-1,5)*3;mhp-=dmg;sfx.good();anim("#hero","lunge");anim("#mon","ouch");floatNum("#mon","-"+dmg,"");fb.className="feedback good";fb.textContent=streak>=3?"Combo x"+streak+"! You hit for "+dmg+".":"Hit! "+dmg+" damage.";drawHP();
        if(mhp<=0){bestSet("battle",lv+1);setTimeout(defeated,700);return}}
      else{streak=0;var a=8+lv*3;hp-=a;sfx.bad();anim("#mon","lunge2");anim("#hero","ouch");floatNum("#hero","-"+a,"bad");fb.className="feedback bad";fb.textContent=MONSTERS[lv][0]+" hits back for "+a+"! The answer was “"+(q.type==="def"?q.x.w:q.x.d)+"”.";drawHP();
        if(hp<=0){setTimeout(lost,900);return}}
      setTimeout(ask,ok?700:1800)})};
  var defeated=function(){celebrate();if(lv+1>=MONSTERS.length){over=true;$("#bq",el).innerHTML='<div class="done-card"><h2 style="font-size:2.4rem">You beat every monster!</h2><p>You are the Word Champion.</p><div class="row" style="justify-content:center"><button class="btn" id="ba">Play again</button><button class="btn alt" data-go="home">Pick another game</button></div></div>';$("#ba",el).onclick=function(){go("battle")};return}
    var heal=Math.min(25,100-hp);hp+=heal;
    $("#bq",el).innerHTML='<div class="done-card"><h2>'+esc(MONSTERS[lv][0])+' is defeated!</h2><p>You healed '+heal+' HP. The next monster is tougher.</p><button class="btn" id="bn">Fight the next monster</button></div>';
    $("#bn",el).onclick=function(){lv++;mhp=MONSTERS[lv][1];streak=0;fb.textContent="";drawMon();ask()};$("#bn",el).focus();drawHP()};
  var lost=function(){over=true;$("#bq",el).innerHTML='<div class="done-card"><h2 style="font-size:2.2rem">Knocked out!</h2><p>You beat <b>'+lv+'</b> monster'+(lv===1?"":"s")+'. Best: '+bestGet("battle")+'.</p><div class="row" style="justify-content:center"><button class="btn" id="ba">Try again</button><button class="btn alt" data-go="home">Pick another game</button></div></div>';$("#ba",el).onclick=function(){go("battle")}};
  onLeave(function(){over=true});
  drawMon();ask();
}

/* ---------- PDF / text parsing ---------- */
var POS=/^(?:\(\s*(?:n|v|adj|adv|noun|verb|adjective|adverb|prep|pron|conj|interj)\.?\s*\)|(?:n|v|adj|adv|prep|pron|conj|interj)\.)\s*[:\-\u2013\u2014]?\s*/i;
function cleanLine(s){return s.replace(/[ \u00A0]+/g," ").replace(/^\s*(?:\d{1,2}|[a-z])\s*[.)]\s+/i,"").replace(/^[\u2022\u25CF\u25AA\u25E6*\u2013\-]\s*/,"").trim()}
function isJunk(s){return /^(name|date|class|teacher|period)\s*[:_]/i.test(s)||/^(vocabulary|vocab|spelling)?\s*(words?|list)?\s*(and|&)?\s*(definitions?|meanings?)?\s*$/i.test(s)||/^(word|term)s?\s*(\t|\s{2,}|\s)\s*(definition|meaning)s?$/i.test(s)||/^page\s*\d+/i.test(s)||/^_+$/.test(s)}
function parseLines(lines){
  var out=[],cur=null,pending=null,title="";
  var push=function(w,d){w=w.replace(/[\s:\-\u2013\u2014=]+$/,"").replace(/^["'\u201C]|["'\u201D]$/g,"").trim();d=d.replace(POS,"").trim();if(!w||!d)return;cur={w:w,d:d};out.push(cur)};
  lines.forEach(function(raw){
    var tabbed=raw.indexOf("\t")>=0,line=cleanLine(raw.replace(/\t+/g," \t ")),m;
    if(!line||isJunk(line.replace(/\t/g," ")))return;
    if(!out.length&&!title&&!pending&&line.indexOf("\t")<0&&!/[:\-\u2013\u2014=]/.test(line)&&line.split(" ").length<=7&&/\b(words?|vocab\w*|week|unit|lesson|list|spelling)\b/i.test(line)){title=line;return}
    if(tabbed){var parts=line.split("\t").map(function(s){return s.trim()}).filter(Boolean);
      if(parts.length>=2&&parts[0].split(" ").length<=4&&!/[.!?]$/.test(parts[0])){pending=null;push(cleanLine(parts[0]),parts.slice(1).join(" "));return}
      line=parts.join(" ")}
    if((m=line.match(/^([A-Za-z][A-Za-z'\- ]{0,38}?)\s*\(\s*(?:n|v|adj|adv|noun|verb|adjective|adverb|prep|pron|conj)\.?\s*\)\s*[:\-\u2013\u2014]?\s*(.+)$/i))||
       (m=line.match(/^([A-Za-z][A-Za-z'\- ]{0,38}?)\s*(?::|=|\s[-\u2013\u2014]|[\u2013\u2014]|\.{2,})\s*(.+)$/))){
      if(m[1].trim().split(/\s+/).length<=4){pending=null;push(m[1],m[2]);return}}
    var wc=line.split(" ").length;
    if(cur&&!/[.!?]$/.test(cur.d)&&!pending){cur.d+=" "+line;return}
    if(wc<=3&&line.length<=28&&!/[.!?,;]$/.test(line)){pending=line;return}
    if(pending){push(pending,line);pending=null;return}
    if(cur)cur.d+=" "+line;
  });
  var seen={};out=out.filter(function(x){var k=x.w.toLowerCase();if(seen[k]||x.w.length>30)return false;seen[k]=1;return true}).map(function(x){return {w:x.w,d:x.d.replace(/\s+/g," ").trim()}});out.title=title;return out;
}
async function pdfLines(file){
  var lib=window.pdfjsLib;if(!lib)throw new Error("nolib");
  var pdf=await lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,lines=[];
  for(var p=1;p<=pdf.numPages;p++){
    var page=await pdf.getPage(p),tc=await page.getTextContent();
    var items=tc.items.filter(function(it){return it.str&&it.str.trim()}).map(function(it){return {s:it.str,x:it.transform[4],y:it.transform[5],w:it.width,h:Math.abs(it.transform[3])||10}});
    items.sort(function(a,b){return b.y-a.y||a.x-b.x});
    var rows=[];items.forEach(function(it){var r=rows.filter(function(r){return Math.abs(r.y-it.y)<=Math.max(2,it.h*0.45)})[0];if(r)r.items.push(it);else rows.push({y:it.y,items:[it]})});
    rows.sort(function(a,b){return b.y-a.y});
    rows.forEach(function(r){r.items.sort(function(a,b){return a.x-b.x});var s="",end=null;r.items.forEach(function(it){if(end!=null){var gap=it.x-end;if(gap>Math.max(18,it.h*1.6))s+="\t";else if(gap>it.h*0.12&&!/\s$/.test(s)&&!/^\s/.test(it.s))s+=" "}s+=it.s;end=it.x+it.w});lines.push(s)});
  }
  return lines;
}

/* ---------- teacher: turn the weekly PDF into the words file on GitHub ---------- */
var pdfReady=null;
function loadScript(src){return new Promise(function(ok,no){var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function ensurePdf(){var base="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
  if(!pdfReady)pdfReady=loadScript(base+"pdf.min.js").then(function(){return loadScript(base+"pdf.worker.min.js")}).catch(function(e){pdfReady=null;throw e});
  return pdfReady}
var draft=null;
function viewList(el){
  if(!draft)draft={title:list.example?"":list.title,words:list.example?[]:list.words.map(function(x){return {w:x.w,d:x.d}})};
  var G=GRADES[grade];
  el.innerHTML='<div class="sheet"><div class="head"><div><h2>Update the word list</h2><p>For teachers. Turn this week’s PDF into the words file on GitHub. Students get the new words a few minutes after you save it there.</p></div>'+
   '<div class="seg" role="group" aria-label="Grade">'+Object.keys(GRADES).map(function(k){return '<button data-g="'+k+'" aria-pressed="'+(k===grade)+'">'+GRADES[k].label+'</button>'}).join("")+'</div></div>'+
  '<h3 class="step"><span>1</span>Add the words</h3>'+
  '<div class="grid2"><label class="drop" id="drop"><input type="file" id="file" accept=".pdf,.txt,application/pdf,text/plain"><svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true"><path d="M12 6h17l9 9v27H12z" fill="var(--sheet)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M29 6v9h9" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M25 36V22m-6 6l6-6 6 6" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg><b>Choose the PDF</b><span class="muted">or drop it here</span></label>'+
  '<div class="field"><label for="paste">Or paste the words, one per line</label><textarea class="paste" id="paste" placeholder="habitat - the natural home of a plant or animal\npredict - to say what you think will happen next"></textarea><div class="row"><button class="btn alt" id="readpaste">Add pasted words</button></div></div></div>'+
  '<p class="status" id="pstat" role="status"></p>'+
  '<div class="field" style="max-width:420px;margin-block:10px 14px"><label for="ltitle">List name</label><input id="ltitle" placeholder="Week 7 words" value="'+esc(draft.title)+'"></div>'+
  '<div style="overflow-x:auto"><table class="wtable"><thead><tr><th style="text-align:left">Word</th><th style="text-align:left">Meaning</th><th><span class="muted" style="font-size:.8rem">Remove</span></th></tr></thead><tbody id="rows"></tbody></table></div>'+
  '<div class="row" style="margin-top:10px"><button class="btn alt" id="addrow">Add a word</button><button class="btn alt" id="clearall">Start over</button></div>'+
  '<h3 class="step"><span>2</span>Save it on GitHub</h3>'+
  '<ol class="howto"><li>Click <b>Copy the words</b>.</li><li>Click <b>Open the '+G.label+' file</b>. Sign in to GitHub if it asks.</li><li>Click inside the file, select everything (Ctrl+A, or Cmd+A on a Mac), then paste (Ctrl+V or Cmd+V).</li><li>Click the green <b>Commit changes</b> button, then <b>Commit changes</b> again.</li></ol>'+
  '<div class="row"><button class="btn" id="copy">Copy the words</button><a class="btn alt" id="open" href="'+fileURL("edit")+'" target="_blank" rel="noopener">Open the '+G.label+' file</a><button class="btn alt" id="try">Try them on this computer</button><span class="status" id="sstat" role="status"></span></div>'+
  '<details class="out"><summary>Show the text that gets copied</summary><textarea class="paste" id="outtext" readonly></textarea></details>'+
  '<p class="muted" style="font-size:.9rem;margin-top:12px">“Try them on this computer” shows the new words only in this browser tab, so you can check the games before saving. Students keep seeing the GitHub list.</p></div>';
  var rowsEl=$("#rows",el);
  var drawRows=function(){rowsEl.innerHTML=draft.words.map(function(x,i){return '<tr><td><input aria-label="Word '+(i+1)+'" data-i="'+i+'" data-f="w" value="'+esc(x.w)+'"></td><td><input aria-label="Meaning '+(i+1)+'" data-i="'+i+'" data-f="d" value="'+esc(x.d)+'"></td><td><button class="x" data-del="'+i+'" aria-label="Remove '+esc(x.w||"word")+'">×</button></td></tr>'}).join("")||'<tr><td colspan="3" class="muted" style="padding:14px 4px">No words yet. Upload the PDF or paste the words above.</td></tr>'};
  drawRows();
  $$(".seg [data-g]",el).forEach(function(b){b.onclick=function(){if(b.dataset.g!==grade)setGrade(b.dataset.g)}});
  rowsEl.addEventListener("input",function(e){var t=e.target;if(t.dataset.f)draft.words[+t.dataset.i][t.dataset.f]=t.value});
  rowsEl.addEventListener("click",function(e){var b=e.target.closest("[data-del]");if(b){draft.words.splice(+b.dataset.del,1);drawRows()}});
  $("#ltitle",el).oninput=function(){draft.title=this.value;draft.autoTitle=false};
  $("#addrow",el).onclick=function(){draft.words.push({w:"",d:""});drawRows();var ins=$$("input[data-f=w]",rowsEl);ins[ins.length-1].focus()};
  $("#clearall",el).onclick=function(){draft={title:"",words:[]};$("#ltitle",el).value="";drawRows()};
  var pstat=$("#pstat",el);
  var addParsed=function(found,src){if(!found.length){pstat.className="status bad";pstat.textContent=src==="pdf"?"No words could be read from that PDF. If it is a scan or a photo of a page, paste or type the words instead.":"No words found. Put each word on its own line with a dash or colon before the meaning.";return}
    draft.words=draft.words.filter(function(x){return x.w||x.d}).concat(found);pstat.className="status good";pstat.textContent="Found "+found.length+" words. Check them below.";drawRows()};
  var handleFile=async function(f){if(!f)return;pstat.className="status";pstat.textContent="Reading "+f.name+"…";
    try{var isPdf=/\.pdf$/i.test(f.name)||f.type==="application/pdf";if(isPdf){try{await ensurePdf()}catch(e){throw new Error("nolib")}}
      var lines=isPdf?await pdfLines(f):(await f.text()).split(/\r?\n/);
      var found=parseLines(lines);
      if(!draft.title||draft.autoTitle){var nm=found.title||f.name.replace(/\.[a-z]+$/i,"").replace(/[_-]+/g," ").trim();draft.title=nm;draft.autoTitle=true;$("#ltitle",el).value=nm}
      draft.words=[];addParsed(found,"pdf")}
    catch(err){pstat.className="status bad";pstat.textContent=err&&err.message==="nolib"?"The PDF reader did not load. Paste the words instead.":"That file could not be opened as a PDF. Try another copy, or paste the words instead."}};
  $("#file",el).onchange=function(){handleFile(this.files[0]);this.value=""};
  var drop=$("#drop",el);
  ["dragenter","dragover"].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.add("over")})});
  ["dragleave","drop"].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.remove("over")})});
  drop.addEventListener("drop",function(e){handleFile(e.dataTransfer.files[0])});
  $("#readpaste",el).onclick=function(){addParsed(parseLines($("#paste",el).value.split(/\r?\n/)),"text");$("#paste",el).value=""};
  var ss=$("#sstat",el);
  var ready=function(){var ws=draft.words.map(function(x){return {w:x.w.trim(),d:x.d.trim()}}).filter(function(x){return x.w&&x.d});
    if(ws.length<4){ss.className="status bad";ss.textContent="Add at least 4 words with meanings.";return null}
    var l={title:(draft.title||"").trim()||"This week’s words",words:ws};$("#outtext",el).value=wordsFileText(l);return l};
  $("#copy",el).onclick=async function(){var l=ready();if(!l)return;var t=$("#outtext",el),ok=false;
    try{await navigator.clipboard.writeText(t.value);ok=true}catch(e){try{$("details.out",el).open=true;t.focus();t.select();ok=document.execCommand("copy")}catch(e2){}}
    ss.className="status "+(ok?"good":"bad");ss.textContent=ok?"Copied "+l.words.length+" words. Now open the file on GitHub and paste.":"Copying was blocked. Open “Show the text” below and copy it yourself."};
  $("#try",el).onclick=function(){var l=ready();if(!l)return;ssSet(SS_PREVIEW+grade,JSON.stringify(l));list=l;listState="preview";go("home")};
  ready();ss.textContent="";ss.className="status";
}

var VIEWS=window.WW_VIEWS=window.WW_VIEWS||{};
window.WW={$:$,$$:$$,esc:esc,shuffle:shuffle,words:words,makeQs:makeQs,mcqHTML:mcqHTML,bindMCQ:bindMCQ,sfx:sfx,celebrate:celebrate,onLeave:onLeave,go:function(v){go(v)},lsGet:lsGet,lsSet:lsSet,views:VIEWS};
shell();gradeChip();
if(grade){go("home");loadGrade().then(function(){go("home")})}
else{listState="ok";list=EXAMPLE;go("home");showPicker(true)}
})();
