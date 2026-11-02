/* Creature Quest 2: the sequel, with 100 new object creatures (creatures2.js) and 8 new towns.
   Same idea as Creature Quest: walk the towns, step in tall grass to meet wild creatures, and use this week's
   words to battle, catch, earn coins and beat 8 gym leaders. It has its own save (the first game's save is
   left untouched, so Creature Quest Classic keeps working). Registers itself as the "quest2" view in app.js. */
(function(){
"use strict";
var VIEWS=window.WW_VIEWS=window.WW_VIEWS||{};
var W=function(){return window.WW}, C=function(){return window.Creatures2};
var KEY="ww-quest2-v1",OLDKEY="ww-quest-v1", MAXLV=50, TEAM_MAX=6;

/* ---------- world ---------- */
/* Each town has its own layout: buildings, water, tall grass and obstacles are placed by hand,
   then roads are carved between the entrance, the doors and the exit (bridges where they cross water). */
var AREAS=[
 {name:"Lanternbrook",types:["sprout","flame","breeze"],lv:[2,5],grass:"Tall grass",style:{tall:"tufts",obst:"tree",deco:"lamp",roof:"peak"},
  th:{g:"#8FD67A",g2:"#79C465",t:"#3E9A45",t2:"#2C7A36",p:"#EAD7A0",p2:"#D6BE80",tr:"#2F8A3E",tr2:"#246E31",w:"#4AA3EF",f:"#FFB0C8",wall:"#F4EEE2"},
  map:{yin:6,yout:6,heal:[2,1],shop:[6,1],gym:[14,1],rects:[["~",11,0,2,12],['"',1,8,6,3],['"',14,7,4,3],['"',7,4,2,2],['"',3,5,1,1]],dots:[["#",1,4],["#",16,5],["#",9,9],["#",18,9],["#",4,10],["o",5,5],["o",14,5],[",",8,8],[",",17,4],[",",1,3]]}},
 {name:"Saltspray Quay",types:["wave","sand"],lv:[5,9],water:true,grass:"Dune grass",style:{tall:"reeds",obst:"rock",deco:"barrel",roof:"peak"},
  th:{g:"#F2E2B0",g2:"#E2CE92",t:"#7FBF6A",t2:"#5E9A4E",p:"#D9C08A",p2:"#C2A872",tr:"#8E8A86",tr2:"#6A6662",w:"#3C8CE0",f:"#FFFFFF",wall:"#FFFFFF"},
  map:{yin:4,yout:4,heal:[3,1],shop:[8,1],gym:[14,1],rects:[["~",0,8,20,4],["~",12,6,8,2],['"',1,6,6,2],['"',8,6,3,2],['"',14,9,4,2],["=",15,6,1,3]],dots:[["#",1,2],["#",12,2],["o",6,3],["o",11,6],["#",18,5],[",",2,5],[",",10,3]]}},
 {name:"Dunehaven",types:["sand","flame","crystal"],lv:[9,13],grass:"Dry brush",style:{tall:"brush",obst:"cactus",deco:"urn",roof:"dome"},
  th:{g:"#F0C987",g2:"#E2B670",t:"#B89A4E",t2:"#8E7636",p:"#E6D2A8",p2:"#D2BC8C",tr:"#4FA05A",tr2:"#3A7E44",w:"#3CB4D8",f:"#E8503A",wall:"#F7E6C4"},
  map:{yin:7,yout:3,heal:[2,1],shop:[2,8],gym:[14,6],rects:[["~",8,4,4,3],['"',6,8,6,3],['"',12,1,4,3],['"',1,4,4,2],['"',17,1,2,2]],dots:[["#",7,2],["#",17,4],["#",12,9],["#",6,1],["o",13,5],["o",7,7],[",",10,2],[",",18,10]]}},
 {name:"Voltvale Works",types:["bolt","gear"],lv:[13,17],grass:"Weedy lot",style:{tall:"tufts",obst:"crate",deco:"pylon",roof:"flat"},
  th:{g:"#B9C2B0",g2:"#A6B09C",t:"#6E9A5A",t2:"#527A42",p:"#8E96A0",p2:"#7A828C",tr:"#B8864A",tr2:"#8E6430",w:"#4A8EC8",f:"#FFE14D",wall:"#E2E6EA"},
  map:{yin:6,yout:9,heal:[1,1],shop:[5,1],gym:[10,1],rects:[["#",15,1,4,2],["~",1,4,8,1],['"',2,8,5,3],['"',9,5,3,2],['"',13,7,5,2],['"',15,4,3,1]],dots:[["o",8,7],["o",14,5],["#",12,9],["#",18,6],["o",4,6],[",",11,8]]}},
 {name:"Glimmer Caves",types:["crystal","dusk"],lv:[17,21],grass:"Crystal shards",style:{tall:"shards",obst:"pillar",deco:"geode",roof:"dome"},
  th:{g:"#5E5A7A",g2:"#545070",t:"#C08AF0",t2:"#8E5AC8",p:"#857EA0",p2:"#76708E",tr:"#9A7AD8",tr2:"#6A4EA8",w:"#3E8AC8",f:"#7AE0FF",wall:"#D8D2EA"},
  map:{yin:2,yout:9,heal:[1,7],shop:[8,8],gym:[15,1],rects:[["#",6,1,1,5],["#",13,5,1,6],['"',2,3,3,3],['"',8,2,4,3],['"',14,6,4,2],["~",9,6,3,1]],dots:[["o",4,7],["o",11,5],["o",17,9],["#",18,5],[",",3,1],[",",12,9],[",",7,7]]}},
 {name:"Frostmere",types:["frost","wave"],lv:[21,25],water:true,grass:"Snow drifts",style:{tall:"drifts",obst:"pine",deco:"ice",roof:"peak"},
  th:{g:"#EAF4FA",g2:"#D6E6F2",t:"#FFFFFF",t2:"#B8D2E8",p:"#C2D4E4",p2:"#AFC2D6",tr:"#2E7A5A",tr2:"#205E44",w:"#8ED2F2",f:"#7FC8F0",wall:"#FFFFFF"},
  map:{yin:5,yout:5,heal:[1,1],shop:[15,8],gym:[14,1],rects:[["~",7,1,6,3],['"',1,7,5,3],['"',8,7,5,3],['"',4,3,2,2],['"',18,3,1,1]],dots:[["#",6,1],["#",13,6],["#",3,6],["#",18,7],["o",12,4],["o",7,6],[",",9,10],[",",2,4]]}},
 {name:"Gearspring City",types:["gear","bolt","sand"],lv:[25,30],grass:"Park grass",style:{tall:"tufts",obst:"hedge",deco:"lamp",roof:"flat"},
  th:{g:"#A8D88E",g2:"#94C67A",t:"#3E9A55",t2:"#2C7A42",p:"#D3DDE8",p2:"#BCC8D6",tr:"#3E8A4E",tr2:"#2E6A3A",w:"#5AC8F0",f:"#F0A23B",wall:"#EEF0F4"},
  map:{yin:6,yout:2,heal:[2,1],shop:[2,8],gym:[13,7],rects:[['"',7,1,4,3],['"',7,8,4,3],['"',15,3,3,2],["~",12,1,1,4],["#",6,5,1,1],["#",11,5,1,1]],dots:[["o",6,3],["o",11,7],["o",17,6],["#",18,9],["#",1,5],[",",5,10],[",",16,1]]}},
 {name:"Duskspire Summit",types:["dusk","breeze","crystal"],lv:[30,36],grass:"Cloud tufts",style:{tall:"drifts",obst:"rock",deco:"starlamp",roof:"dome",water:"stars"},
  th:{g:"#6E6A9E",g2:"#625E90",t:"#E6E2FF",t2:"#B8B2E8",p:"#A9A2D2",p2:"#968EC2",tr:"#4A4478",tr2:"#363060",w:"#2A2650",f:"#FFE36B",wall:"#E6E2F6"},
  map:{yin:9,yout:9,heal:[5,1],shop:[1,5],gym:[14,1],rects:[["~",1,1,3,3],["~",8,4,3,4],["~",15,8,4,3],['"',11,5,3,3],['"',4,8,3,3],['"',16,5,2,2]],dots:[["#",10,1],["#",12,9],["#",7,10],["o",4,5],["o",13,4],[",",9,9],[",",18,4]]}}
];
var LEADERS=[["Hazel","sprout"],["Marina","wave"],["Zahra","sand"],["Amara","bolt"],["Jasper","crystal"],["Bora","frost"],["Gideon","gear"],["Noor","dusk"]];
var LEGEND_AT={2:["Solforge"],3:["Stormcrown"],5:["Tidegate"],6:["Skygalleon"],7:["Eclipsar","Elderbough"]};
var STRONG={sprout:["wave","sand"],flame:["sprout","frost","gear"],wave:["flame","sand"],bolt:["wave","breeze"],crystal:["dusk","breeze"],frost:["sprout","breeze"],breeze:["sprout","sand"],dusk:["crystal","bolt"],sand:["bolt","flame"],gear:["crystal","frost"]};
var ITEMS={
 orb:{name:"Capture Orb",price:20,badge:0,desc:"Throw it to catch a creature."},
 super:{name:"Super Orb",price:50,badge:1,desc:"Catches with one less right answer."},
 ultra:{name:"Ultra Orb",price:120,badge:3,desc:"Catches with two less right answers."},
 potion:{name:"Potion",price:25,badge:0,desc:"Heals 25 HP."},
 superpotion:{name:"Super Potion",price:60,badge:2,desc:"Heals a creature all the way."},
 candy:{name:"Level Candy",price:150,badge:2,desc:"Raises a creature one level."}
};
var ORBS=["orb","super","ultra"];

/* ---------- save ---------- */
var S=null;
function fresh(){return {v:2,game:"cq2",started:false,coins:60,items:{orb:5,potion:3},team:[],box:[],seen:{},caught:{},badges:0,area:0,x:2,y:6,uid:1,right:0,answered:0}}
function load(){try{var r=W().lsGet(KEY);if(r){var o=JSON.parse(r);if(o&&o.v===2&&o.game==="cq2"&&Array.isArray(o.team)){S=o;return}}}catch(e){}S=fresh()}
function save(){W().lsSet(KEY,JSON.stringify(S))}
/* players who already played the first Creature Quest get a welcome gift (their old save is not changed) */
function veteranGift(){try{var o=JSON.parse(W().lsGet(OLDKEY)||"null");if(!o||!o.started)return null;var b=Math.min(8,o.badges||0);return {badges:b,coins:100+b*25,orbs:2+Math.floor(b/2)}}catch(e){return null}}
function encode(){return btoa(unescape(encodeURIComponent(JSON.stringify(S))))}
function decode(t){var o=JSON.parse(decodeURIComponent(escape(atob(String(t).replace(/\s+/g,"")))));if(o&&o.v===1)throw new Error("classic");if(!o||o.v!==2||o.game!=="cq2"||!Array.isArray(o.team))throw new Error("bad");return o}

/* ---------- creatures ---------- */
function dex(id){return C().DEX[id-1]}
function byName(n){return C().DEX.filter(function(d){return d.name===n})[0]}
function maxHp(m){return 16+m.lv*4+Math.min(dex(m.id).stage,3)*3}
function mon(id,lv){var m={u:S.uid++,id:id,lv:lv,xp:0,hp:0};m.hp=maxHp(m);return m}
function wildMon(id,lv){var m={u:0,id:id,lv:lv,xp:0,hp:0};m.hp=maxHp(m);return m}
function mult(a,b){return STRONG[dex(a.id).type].indexOf(dex(b.id).type)>=0?1.5:1}
function alive(){return S.team.filter(function(m){return m.hp>0})}
function stageFor(lineFirst,lv){var d=dex(lineFirst),id=lineFirst;while(d.evolvesAt&&lv>=d.evolvesAt&&dex(id+1)&&dex(id+1).line===d.line){id++;d=dex(id)}return id}
function lineStart(id){while(id>1&&dex(id-1).line===dex(id).line)id--;return id}
function markCaught(id){S.caught[id]=1;S.seen[id]=1}
function gainXP(m,amt){var msgs=[];if(m.lv>=MAXLV)return msgs;m.xp+=amt;
  while(m.lv<MAXLV&&m.xp>=m.lv*10){m.xp-=m.lv*10;var before=maxHp(m);m.lv++;m.hp=Math.min(maxHp(m),m.hp+maxHp(m)-before);msgs.push(dex(m.id).name+" grew to level "+m.lv+"!");
    var d=dex(m.id),n=dex(m.id+1);if(d.evolvesAt&&m.lv>=d.evolvesAt&&n&&n.line===d.line){var old=d.name;m.id++;markCaught(m.id);m.hp=maxHp(m);msgs.push("evolve:"+old+" evolved into "+n.name+"!")}}
  return msgs}
function sprite(c,px,silhouette,flip){var cv=document.createElement("canvas"),n=C().SIZE;cv.width=cv.height=n*px;C().draw(cv.getContext("2d"),c,px,0,0,silhouette);if(flip)cv.className="flip";return cv}
function spriteHTML(id,px,cls,sil){return '<canvas class="'+(cls||"")+'" data-spr="'+id+'" data-px="'+(px||2)+'"'+(sil?' data-sil="1"':'')+' width="'+48*(px||2)+'" height="'+48*(px||2)+'"></canvas>'}
function paintSprites(root){W().$$("canvas[data-spr]",root).forEach(function(cv){C().draw(cv.getContext("2d"),dex(+cv.dataset.spr),+cv.dataset.px,0,0,!!cv.dataset.sil)})}
function typeChip(t){return '<span class="tchip" style="background:'+C().TYPES[t].color+'">'+C().TYPES[t].name+'</span>'}

/* ---------- map ---------- */
var MW=20,MH=12,TS=16;
var BLD={h:[3,2],s:[3,2],g:[4,3]};
function door(L,k){var p=L[{h:"heal",s:"shop",g:"gym"}[k]];return [p[0]+1,p[1]+BLD[k][1]]}
function walkable(t){return !!t&&"#o~B".indexOf(t)<0}
var mapCache={};
function mapFor(a){if(mapCache[a])return mapCache[a];
  var L=AREAS[a].map,m=[],x,y,i;
  for(y=0;y<MH;y++){m.push([]);for(x=0;x<MW;x++)m[y].push(y===0||y===MH-1||x===0||x===MW-1?"#":".")}
  var set=function(x,y,c){if(x>=0&&x<MW&&y>=0&&y<MH)m[y][x]=c};
  L.rects.forEach(function(r){for(var yy=r[2];yy<r[2]+r[4];yy++)for(var xx=r[1];xx<r[1]+r[3];xx++){var edge=yy===0||yy===MH-1||xx===0||xx===MW-1;if(!edge||r[0]==="~")set(xx,yy,r[0])}});
  L.dots.forEach(function(d){set(d[1],d[2],d[0])});
  ["h","s","g"].forEach(function(k){var p=L[{h:"heal",s:"shop",g:"gym"}[k]],d=door(L,k);for(var yy=p[1];yy<p[1]+BLD[k][1];yy++)for(var xx=p[0];xx<p[0]+BLD[k][0];xx++)set(xx,yy,"B");set(d[0],d[1],k)});
  m[L.yin][0]=":";m[L.yout][MW-1]=":";
  /* carve roads: cheapest route, preferring open ground over grass, and bridges over cutting obstacles */
  var cost=function(x,y){if(x<0||y<0||x>=MW||y>=MH)return Infinity;var t=m[y][x];
    if(t==="B")return Infinity;if((x===0||y===0||x===MW-1||y===MH-1)&&t!==":")return Infinity;
    if("hsg".indexOf(t)>=0)return Infinity;return t===":"||t==="="?.4:t==="."||t===","?1:t==='"'?3:t==="~"?5:8};
  var route=function(sx,sy,goal){var dist={},prev={},open=[[0,sx,sy]];dist[sx+","+sy]=0;
    while(open.length){open.sort(function(p,q){return p[0]-q[0]});var c=open.shift(),k=c[1]+","+c[2];if(c[0]>dist[k])continue;
      if(goal(c[1],c[2])&&!(c[1]===sx&&c[2]===sy)){var path=[];while(k){path.push(k);k=prev[k]}return path}
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=c[1]+d[0],ny=c[2]+d[1],w=cost(nx,ny);if(w===Infinity)return;var nk=nx+","+ny,nd=c[0]+w;if(dist[nk]===undefined||nd<dist[nk]){dist[nk]=nd;prev[nk]=k;open.push([nd,nx,ny])}})}
    return []};
  var carve=function(path){path.forEach(function(k){var p=k.split(","),t=m[+p[1]][+p[0]];if("hsg".indexOf(t)>=0)return;m[+p[1]][+p[0]]=t==="~"||t==="="?"=":":"})};
  carve(route(0,L.yin,function(x,y){return x===MW-1&&y===L.yout}));
  ["h","s","g"].forEach(function(k){var d=door(L,k);carve(route(d[0],d[1],function(x,y){return m[y][x]===":"}))});
  return mapCache[a]=m}
function hash(x,y){return ((x*73856093)^(y*19349663))>>>0}
function drawTile(ctx,t,x,y,A,m){var th=A.th,st=A.style,X=x*TS,Y=y*TS,h=hash(x,y),i;
  var px=function(dx,dy,c){ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,1,1)},box=function(dx,dy,w,hh,c){ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,hh)};
  var ground=function(){box(0,0,TS,TS,th.g);for(i=0;i<4;i++){var k=(h>>(i*5))&255;px(k%16,(k>>4)%16,th.g2)}};
  var water=function(){box(0,0,TS,TS,th.w);if(st.water==="stars"){px(h%14+1,(h>>4)%6+1,"#FFE36B");px((h>>8)%14+1,(h>>12)%6+8,"#FFFFFF");return}ctx.fillStyle="rgba(255,255,255,.45)";ctx.fillRect(X+2+(h%4),Y+4,5,1);ctx.fillRect(X+8-(h%3),Y+11,5,1)};
  if(t===":"||"hsg".indexOf(t)>=0){box(0,0,TS,TS,th.p);for(i=0;i<3;i++){var k2=(h>>(i*6))&255;box(k2%15,(k2>>4)%15,2,1,th.p2)}return}
  if(t==="~"){water();return}
  if(t==="="){var vert=m&&((m[y-1]&&m[y-1][x]==="=")||(m[y+1]&&m[y+1][x]==="="))&&!((m[y][x-1]==="=")||(m[y][x+1]==="="));water();ctx.fillStyle="#A8743E";
    if(vert){ctx.fillRect(X+2,Y,12,TS);ctx.fillStyle="#7A5028";for(i=0;i<4;i++)ctx.fillRect(X+2,Y+i*4+3,12,1);ctx.fillRect(X+2,Y,1,TS);ctx.fillRect(X+13,Y,1,TS)}
    else{ctx.fillRect(X,Y+2,TS,12);ctx.fillStyle="#7A5028";for(i=0;i<4;i++)ctx.fillRect(X+i*4+3,Y+2,1,12);ctx.fillRect(X,Y+2,TS,1);ctx.fillRect(X,Y+13,TS,1)}return}
  ground();
  if(t==='"'){
    if(st.tall==="tufts"){for(i=0;i<4;i++){var bx=(i%2)*8+((h>>i)&1)*2,by=(i>>1)*8;box(bx+1,by+2,6,6,th.t);px(bx+1,by+1,th.t);px(bx+3,by,th.t);px(bx+6,by+1,th.t);box(bx+2,by+6,4,2,th.t2);px(bx+4,by+3,th.t2)}}
    else if(st.tall==="reeds"){for(i=0;i<6;i++){var rx=1+i*2.5|0,rh=7+((h>>i)&3);box(rx,TS-rh,1,rh,i%2?th.t:th.t2);px(rx+1,TS-rh-1,th.t)}}
    else if(st.tall==="brush"){[[4,5],[11,4],[7,11],[13,12]].forEach(function(p,j){ctx.fillStyle=j%2?th.t:th.t2;ctx.beginPath();ctx.arc(X+p[0],Y+p[1],3.2,0,7);ctx.fill();px(p[0]-1,p[1]-2,th.g2)})}
    else if(st.tall==="shards"){[[3,14,3,9],[8,14,2,12],[12,14,3,8],[6,7,2,6]].forEach(function(p,j){ctx.fillStyle=j%2?th.t2:th.t;ctx.beginPath();ctx.moveTo(X+p[0]-p[2],Y+p[1]);ctx.lineTo(X+p[0],Y+p[1]-p[3]);ctx.lineTo(X+p[0]+p[2],Y+p[1]);ctx.fill()});px(8,4,"#FFFFFF")}
    else if(st.tall==="drifts"){ctx.fillStyle=th.t2;ctx.beginPath();ctx.arc(X+5,Y+11,5,Math.PI,0);ctx.arc(X+11,Y+12,5,Math.PI,0);ctx.fill();ctx.fillStyle=th.t;ctx.beginPath();ctx.arc(X+5,Y+11,4,Math.PI,0);ctx.arc(X+11,Y+12,4,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(X+8,Y+5,3.5,Math.PI,0);ctx.fill()}
    return}
  if(t===","){[[3,4],[10,3],[6,10],[12,11]].forEach(function(p,j){if(j>1&&(h&1))return;px(p[0],p[1]-1,th.f);px(p[0]-1,p[1],th.f);px(p[0]+1,p[1],th.f);px(p[0],p[1]+1,th.f);px(p[0],p[1],"#FFE15C")});return}
  if(t==="#"){var o=st.obst;
    if(o==="tree"||o==="hedge"){if(o==="tree")box(6,11,4,5,"#7A5434");ctx.fillStyle=th.tr;if(o==="tree"){ctx.beginPath();ctx.arc(X+8,Y+7,7,0,7);ctx.fill()}else box(1,3,14,12,th.tr);ctx.fillStyle=th.tr2;ctx.fillRect(X+3,Y+10,10,3);ctx.fillStyle="rgba(255,255,255,.25)";ctx.fillRect(X+4,Y+4,3,2)}
    else if(o==="pine"){box(7,12,2,4,"#6A4A30");ctx.fillStyle=th.tr;ctx.beginPath();ctx.moveTo(X+8,Y);ctx.lineTo(X+15,Y+13);ctx.lineTo(X+1,Y+13);ctx.fill();ctx.fillStyle="#FFFFFF";ctx.fillRect(X+6,Y+4,4,1);ctx.fillRect(X+4,Y+8,8,1)}
    else if(o==="rock"){ctx.fillStyle=th.tr;ctx.beginPath();ctx.ellipse(X+8,Y+10,7,5.5,0,0,7);ctx.fill();ctx.fillStyle=th.tr2;ctx.fillRect(X+3,Y+12,10,2);ctx.fillStyle="rgba(255,255,255,.3)";ctx.fillRect(X+5,Y+7,3,2)}
    else if(o==="cactus"){box(6,2,4,14,th.tr);box(2,6,3,2,th.tr);box(2,4,2,4,th.tr);box(11,8,3,2,th.tr);box(12,5,2,5,th.tr);box(8,3,1,12,th.tr2)}
    else if(o==="crate"){box(1,2,14,13,th.tr);box(1,2,14,2,th.tr2);box(1,13,14,2,th.tr2);ctx.strokeStyle=th.tr2;ctx.beginPath();ctx.moveTo(X+2,Y+4);ctx.lineTo(X+14,Y+13);ctx.stroke()}
    else if(o==="pillar"){ctx.fillStyle=th.tr;ctx.beginPath();ctx.moveTo(X+3,Y+16);ctx.lineTo(X+6,Y+1);ctx.lineTo(X+10,Y+1);ctx.lineTo(X+13,Y+16);ctx.fill();box(8,2,2,13,th.tr2);px(6,4,"#FFFFFF")}
    return}
  if(t==="o"){var d=st.deco;
    if(d==="lamp"||d==="pylon"||d==="starlamp"){box(7,5,2,10,"#4A4A5A");box(5,14,6,2,"#4A4A5A");box(5,1,6,5,d==="pylon"?"#7AE0FF":"#FFD36B");if(d==="starlamp"){px(8,0,"#FFE36B")}}
    else if(d==="barrel"){box(3,3,10,12,"#A8743E");box(3,5,10,1,"#5A3A20");box(3,12,10,1,"#5A3A20")}
    else if(d==="urn"){ctx.fillStyle="#C9743A";ctx.beginPath();ctx.ellipse(X+8,Y+10,5,5,0,0,7);ctx.fill();box(6,2,4,4,"#C9743A");box(5,2,6,1,"#5A3420")}
    else if(d==="geode"){ctx.fillStyle="#6A6680";ctx.beginPath();ctx.ellipse(X+8,Y+11,6,4,0,0,7);ctx.fill();ctx.fillStyle="#7AE0FF";ctx.beginPath();ctx.moveTo(X+5,Y+11);ctx.lineTo(X+8,Y+4);ctx.lineTo(X+11,Y+11);ctx.fill()}
    else if(d==="ice"){box(2,3,12,12,"#BFE6FF");box(2,3,12,2,"#FFFFFF");box(11,5,3,10,"#8FCDEA")}
  }}
function drawBuilding(ctx,x0,y0,w,h,roof,wall,shape,sign){var X=x0*TS,Y=y0*TS,Wd=w*TS,Hd=h*TS;
  ctx.fillStyle="rgba(0,0,0,.18)";ctx.fillRect(X+2,Y+4,Wd,Hd);
  ctx.fillStyle=wall;ctx.fillRect(X,Y+Hd*.42,Wd,Hd*.58);ctx.fillStyle="rgba(0,0,0,.12)";ctx.fillRect(X,Y+Hd-3,Wd,3);
  ctx.fillStyle=roof;
  if(shape==="dome"){ctx.beginPath();ctx.ellipse(X+Wd/2,Y+Hd*.48,Wd/2+1,Hd*.46,0,Math.PI,0);ctx.fill();ctx.fillStyle="rgba(255,255,255,.25)";ctx.fillRect(X+Wd*.3,Y+Hd*.12,Wd*.15,2)}
  else if(shape==="flat"){ctx.fillRect(X-1,Y+2,Wd+2,Hd*.42);ctx.fillStyle="rgba(0,0,0,.2)";ctx.fillRect(X-1,Y+Hd*.42,Wd+2,2);ctx.fillStyle="rgba(255,255,255,.3)";ctx.fillRect(X-1,Y+2,Wd+2,2)}
  else{ctx.beginPath();ctx.moveTo(X-2,Y+Hd*.48);ctx.lineTo(X+4,Y+1);ctx.lineTo(X+Wd-4,Y+1);ctx.lineTo(X+Wd+2,Y+Hd*.48);ctx.closePath();ctx.fill();ctx.fillStyle="rgba(0,0,0,.15)";for(var i=0;i<Wd;i+=4)ctx.fillRect(X+i,Y+Hd*.4,2,2)}
  var dx=X+TS+4;ctx.fillStyle="#6A4A30";ctx.fillRect(dx,Y+Hd-11,8,11);ctx.fillStyle="#9EE0FF";ctx.fillRect(X+3,Y+Hd-12,6,5);ctx.fillRect(X+Wd-9,Y+Hd-12,6,5);
  ctx.fillStyle="#fff";ctx.fillRect(X+Wd/2-5,Y+5,10,9);sign(ctx,X+Wd/2-5,Y+5)}
function drawPlayer(ctx,x,y,step){var X=x*TS,Y=y*TS,b=function(dx,dy,w,h,c){ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  b(4,14,8,2,"rgba(0,0,0,.2)");b(5,11,2,4-(step?1:0),"#2B3440");b(9,11,2,3+(step?1:0),"#2B3440");b(4,6,8,6,"#2E9F90");b(4,6,8,1,"#5FD0C0");b(3,7,1,4,"#F2C9A0");b(12,7,1,4,"#F2C9A0");
  b(5,1,6,6,"#F2C9A0");b(4,1,8,2,"#F2A93B");b(4,3,2,1,"#F2A93B");b(6,0,4,1,"#F2A93B")}
function renderMap(cv){var a=S.area,A=AREAS[a],L=A.map,m=mapFor(a),ctx=cv.getContext("2d");cv.width=MW*TS;cv.height=MH*TS;
  for(var y=0;y<MH;y++)for(var x=0;x<MW;x++){var t=m[y][x];drawTile(ctx,t==="B"?".":t,x,y,A,m)}
  var sh=A.style.roof,wall=A.th.wall;
  drawBuilding(ctx,L.heal[0],L.heal[1],3,2,"#F07FB0",wall,sh,function(c,x,y){c.fillStyle="#F0507F";c.fillRect(x+4,y+1,2,7);c.fillRect(x+1,y+4,8,2)});
  drawBuilding(ctx,L.shop[0],L.shop[1],3,2,"#5B9BFF",wall,sh,function(c,x,y){c.fillStyle="#F2C230";c.fillRect(x+2,y+2,6,5);c.fillStyle="#C9921A";c.fillRect(x+4,y+3,2,3)});
  var gt=C().TYPES[LEADERS[a][1]].color;drawBuilding(ctx,L.gym[0],L.gym[1],4,3,gt,wall,sh,function(c,x,y){c.fillStyle=gt;c.fillRect(x+4,y+1,2,7);c.fillRect(x+3,y+2,4,5);c.fillRect(x+2,y+3,6,3)});
  if(S.badges>a){ctx.fillStyle="#F2C230";ctx.fillRect((L.gym[0]+3)*TS+6,L.gym[1]*TS+2,5,5)}
  if(S.badges<=a){var gy=L.yout*TS;ctx.fillStyle="#7A5434";ctx.fillRect((MW-1)*TS+2,gy+1,3,14);ctx.fillRect((MW-1)*TS+10,gy+1,3,14);ctx.fillStyle="#C9A06A";ctx.fillRect((MW-1)*TS,gy+4,16,3);ctx.fillRect((MW-1)*TS,gy+10,16,3)}
  drawPlayer(ctx,S.x,S.y,(S.x+S.y)%2)}
/* a walkable spot next to a door, so the player isn't left standing in it */
function besideDoor(k){var d=door(AREAS[S.area].map,k),m=mapFor(S.area),c=[[0,1],[-1,0],[1,0],[0,-1]];for(var i=0;i<c.length;i++){var x=d[0]+c[i][0],y=d[1]+c[i][1];if(m[y]&&walkable(m[y][x])&&"hsg".indexOf(m[y][x])<0&&x>0&&x<MW-1)return [x,y]}return d}

/* for automated checks of the town layouts */
VIEWS.quest2Debug={mapFor:function(a){return mapFor(a)},AREAS:AREAS,door:door,walkable:walkable};
/* ---------- the view ---------- */
var root=null,mode="map",B=null,keyFn=null,msgTimer=0,gift=null;
var artHooked=false;
VIEWS.quest2=function(el){
  if(!artHooked&&C().onArt){artHooked=true;C().onArt(function(){if(root&&document.body.contains(root)&&!B)render()})}
  load();root=el;mode=S.started?"map":"intro";gift=S.started?null:veteranGift();B=null;
  el.innerHTML='<div class="sheet quest"><div class="q-top"><div><h2>Creature Quest 2</h2><p class="q-where" id="qwhere"></p></div><div class="row"><span class="pill coin" id="qcoins"></span><span class="badges" id="qbadges"></span></div></div>'+
   '<nav class="q-tabs" id="qtabs">'+[["map","Map"],["team","My Team"],["book","Creature Book"],["bag","Bag"],["save","Save code"]].map(function(t){return '<button data-q="'+t[0]+'">'+t[1]+'</button>'}).join("")+'</nav><div id="qbody"></div></div>';
  W().$$("#qtabs button",el).forEach(function(b){b.onclick=function(){if(B)return;mode=b.dataset.q;render()}});
  keyFn=function(e){if(mode!=="map"||B||e.ctrlKey||e.metaKey||e.altKey)return;var tag=(e.target.tagName||"").toLowerCase();if(tag==="input"||tag==="textarea")return;
    var d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0],W:[0,-1],S:[0,1],A:[-1,0],D:[1,0]}[e.key];if(d){e.preventDefault();step(d[0],d[1])}};
  document.addEventListener("keydown",keyFn);
  W().onLeave(function(){document.removeEventListener("keydown",keyFn);clearTimeout(msgTimer);save()});
  render();
};
function header(){var $=W().$;$("#qcoins",root).innerHTML='<i class="coin-ic" aria-hidden="true"></i>'+S.coins+' coins';
  $("#qwhere",root).textContent=S.started?AREAS[S.area].name+" · "+Object.keys(S.caught).length+" of 100 caught":"A new adventure";
  $("#qbadges",root).innerHTML=LEADERS.map(function(L,i){return '<i class="bdg'+(i<S.badges?" on":"")+'" style="--c:'+C().TYPES[L[1]].color+'" title="'+(i<S.badges?L[0]+"’s badge":"Badge "+(i+1))+'"></i>'}).join("");
  W().$$("#qtabs button",root).forEach(function(b){b.setAttribute("aria-current",b.dataset.q===mode?"page":"false");b.disabled=!!B||!S.started})}
function render(){header();var body=W().$("#qbody",root);body.className="q-"+mode;
  ({intro:viewIntro,map:viewMap,team:viewTeam,book:viewBook,bag:viewBag,save:viewSave,shop:viewShop})[mode](body)}

/* intro: pick a starter */
function viewIntro(body){var st=[byName("Seedpot"),byName("Wickit"),byName("Blub")];
  body.innerHTML='<div class="q-intro"><h3>Welcome to the Glimmer Isles!</h3>'+(gift?'<p class="vet"><b>Welcome back, '+(gift.badges>=8?"Word Champion":"explorer")+'!</b> Thanks for playing the first Creature Quest. Here’s a gift for your new adventure: <b>'+gift.coins+' coins</b> and <b>'+gift.orbs+' Super Orbs</b>. Your old creatures are safe in Creature Quest Classic.</p>':'')+'<p>Magical creatures hide in the tall grass on every island. They’re made of things like lanterns, kites, crystals and gears. You catch and train them with <b>words</b>: every attack and every capture is a vocabulary question. Pick your first partner.</p>'+
   '<div class="starters">'+st.map(function(d){return '<button class="starter" data-id="'+d.id+'">'+spriteHTML(d.id,3)+'<b>'+d.name+'</b>'+typeChip(d.type)+'</button>'}).join("")+'</div></div>';
  paintSprites(body);
  W().$$(".starter",body).forEach(function(b){b.onclick=function(){var id=+b.dataset.id;S.team=[mon(id,5)];markCaught(id);S.started=true;S.area=0;S.x=1;S.y=AREAS[0].map.yin;if(gift){S.coins+=gift.coins;S.items.super=(S.items.super||0)+gift.orbs;S.veteran=1}save();W().celebrate();mode="map";render();
    toast("You chose "+dex(id).name+"! Walk into the tall grass to find wild creatures.")}})}

/* map */
function viewMap(body){
  body.innerHTML='<div class="map-layout"><div class="map-wrap"><canvas id="qmap" class="map" aria-label="Map of '+AREAS[S.area].name+'"></canvas><div class="q-msg" id="qmsg" role="status" hidden></div></div>'+
   '<div class="map-ui"><div class="dpad" aria-label="Move">'+[["up",0,-1,"M12 6l-7 8h14z"],["left",-1,0,"M6 12l8-7v14z"],["right",1,0,"M18 12l-8-7v14z"],["down",0,1,"M12 18l-7-8h14z"]].map(function(d){return '<button class="dp-'+d[0]+'" data-dx="'+d[1]+'" data-dy="'+d[2]+'" aria-label="Move '+d[0]+'"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="'+d[3]+'" fill="currentColor"/></svg></button>'}).join("")+'</div>'+
   '<div class="legend"><p><b>Move</b> with the arrow keys, WASD, or these buttons.</p><p><span class="lg lg-t" style="background:'+AREAS[S.area].th.t2+'"></span>'+AREAS[S.area].grass+': wild creatures</p><p><span class="lg lg-h"></span>Pink building: heal your team</p><p><span class="lg lg-s"></span>Blue building: shop</p><p><span class="lg lg-g" style="--c:'+C().TYPES[LEADERS[S.area][1]].color+'"></span>Big building: '+LEADERS[S.area][0]+'’s gym</p></div></div></div>';
  var cv=W().$("#qmap",body);renderMap(cv);
  W().$$(".dpad button",body).forEach(function(b){b.onclick=function(){step(+b.dataset.dx,+b.dataset.dy)}});
  cv.onclick=function(e){var r=cv.getBoundingClientRect(),tx=Math.floor((e.clientX-r.left)/r.width*MW),ty=Math.floor((e.clientY-r.top)/r.height*MH),dx=tx-S.x,dy=ty-S.y;if(!dx&&!dy)return;if(Math.abs(dx)>=Math.abs(dy))step(Math.sign(dx),0);else step(0,Math.sign(dy))};
}
function toast(t){var m=W().$("#qmsg",root);if(!m)return;m.hidden=false;m.textContent=t;clearTimeout(msgTimer);msgTimer=setTimeout(function(){m.hidden=true},3600)}
function step(dx,dy){if(B||mode!=="map")return;var m=mapFor(S.area),nx=S.x+dx,ny=S.y+dy;
  if(nx>=MW){if(S.badges>S.area&&S.area<AREAS.length-1){S.area++;S.x=1;S.y=AREAS[S.area].map.yin;save();render();toast("Welcome to "+AREAS[S.area].name+"!")}else if(S.area===AREAS.length-1)toast("This is the edge of the world. You’ve explored it all!");else toast("The path is closed. Beat "+LEADERS[S.area][0]+"’s gym to open it.");return}
  if(nx<0){if(S.area>0){S.area--;S.x=MW-2;S.y=AREAS[S.area].map.yout;save();render();toast("Back in "+AREAS[S.area].name+".")}return}
  var t=m[ny]&&m[ny][nx];if(!walkable(t))return;
  S.x=nx;S.y=ny;save();renderMap(W().$("#qmap",root));
  if(t==="h"){S.team.forEach(function(x){x.hp=maxHp(x)});save();W().sfx.win();toast("Your team is all healed up!");var hp=besideDoor("h");S.x=hp[0];S.y=hp[1];save();renderMap(W().$("#qmap",root))}
  else if(t==="s"){mode="shop";render()}
  else if(t==="g"){gym()}
  else if(t==='"'&&Math.random()<.17)wild()}

/* ---------- battles ---------- */
function wild(){var a=S.area,A=AREAS[a],legends=LEGEND_AT[a],lv=A.lv[0]+Math.floor(Math.random()*(A.lv[1]-A.lv[0]+1)),id;
  if(legends&&Math.random()<.04){var c=byName(legends[Math.floor(Math.random()*legends.length)]);if(!S.caught[c.id]){id=c.id;lv=A.lv[1]+5}}
  if(!id){var pool=[];C().DEX.forEach(function(d){if(d.rarity==="legendary"||A.types.indexOf(d.type)<0)return;var w=d.stage===0?(d.rarity==="common"?7:4):d.stage===1?(a>=1?3:0):(a>=3?1:0);for(var i=0;i<w;i++)pool.push(d.id)});id=pool[Math.floor(Math.random()*pool.length)]}
  startBattle([wildMon(id,lv)],null)}
function gym(){if(S.badges>S.area){toast(LEADERS[S.area][0]+" says: you already have my badge. Keep exploring!");return}
  if(!alive().length){toast("Your team is too tired. Heal at the pink building first.");return}
  var L=LEADERS[S.area],top=AREAS[S.area].lv[1]+2,lines=C().DEX.filter(function(d){return d.type===L[1]&&d.stage===0}).map(function(d){return d.id}),team=[];
  W().shuffle(lines).slice(0,3).forEach(function(first,i){var lv=top-2+i;team.push(wildMon(stageFor(first,lv),lv))});
  while(team.length<3)team.push(wildMon(team[0].id,top));
  startBattle(team,{name:L[0],type:L[1],i:S.area})}
function startBattle(foes,leader){
  var first=S.team.findIndex(function(m){return m.hp>0});if(first<0){toast("Your team needs to rest. Heal at the pink building.");return}
  foes.forEach(function(f){S.seen[f.id]=1});save();
  B={foes:foes,fi:0,me:first,leader:leader,streak:0,busy:false,log:leader?"Leader "+leader.name+" wants to battle!":"A wild "+dex(foes[0].id).name+" appeared!"};
  mode="battle";header();drawBattle();W().sfx.good()}
function hpBar(m){var p=Math.max(0,m.hp)/maxHp(m);return '<div class="qhp"><i style="width:'+(p*100)+'%;background:'+(p>.5?"var(--good)":p>.2?"var(--pencil)":"var(--bad)")+'"></i></div><span class="qhpv">'+Math.max(0,m.hp)+' / '+maxHp(m)+' HP</span>'}
function leaderSVG(t){var c=C().TYPES[t].color;return '<svg viewBox="0 0 24 32" class="leader" aria-hidden="true" shape-rendering="crispEdges"><rect x="7" y="3" width="10" height="9" fill="#F2C9A0"/><path d="M5 4h14v4h-2V6H7v2H5z" fill="'+c+'"/><rect x="5" y="12" width="14" height="13" fill="'+c+'"/><rect x="5" y="12" width="14" height="2" fill="rgba(255,255,255,.35)"/><rect x="11" y="15" width="2" height="2" fill="#F2C230"/><rect x="3" y="13" width="2" height="9" fill="'+c+'"/><rect x="19" y="13" width="2" height="9" fill="'+c+'"/><rect x="7" y="25" width="4" height="6" fill="#2B3440"/><rect x="13" y="25" width="4" height="6" fill="#2B3440"/></svg>'}
function drawBattle(){var body=W().$("#qbody",root),me=S.team[B.me],foe=B.foes[B.fi],fd=dex(foe.id),md=dex(me.id),th=AREAS[S.area].th;body.className="q-battle";
  body.innerHTML='<div class="arena2" style="--g:'+th.g+';--g2:'+th.g2+';--sky:'+(th.w)+'">'+
   '<div class="side foe"><div class="nbox"><div class="nrow"><b>'+fd.name+'</b> <span class="lv">Lv '+foe.lv+'</span> '+typeChip(fd.type)+(S.caught[foe.id]?' <span class="caughtmark" title="Already caught">✓ caught</span>':'')+'</div>'+hpBar(foe)+'</div><div class="pad"><span class="spr" id="foespr"></span>'+(B.leader?leaderSVG(B.leader.type):'')+'</div></div>'+
   '<div class="side me"><div class="pad"><span class="spr" id="mespr"></span></div><div class="nbox"><div class="nrow"><b>'+md.name+'</b> <span class="lv">Lv '+me.lv+'</span> '+typeChip(md.type)+'</div>'+hpBar(me)+'<div class="qxp" title="Experience"><i style="width:'+(me.xp/(me.lv*10)*100)+'%"></i></div></div></div>'+
   (B.leader?'<div class="foeballs">'+B.foes.map(function(f,i){return '<i class="'+(f.hp<=0?"out":i===B.fi?"cur":"")+'"></i>'}).join("")+'</div>':'')+
  '</div><p class="blog" id="blog" aria-live="polite">'+W().esc(B.log)+'</p><div id="bact"></div>';
  W().$("#foespr",body).appendChild(sprite(fd,3,false,true));W().$("#mespr",body).appendChild(sprite(md,3));
  if(foe.hp>0&&me.hp>0)menu()}
function setLog(t){B.log=t;var l=W().$("#blog",root);if(l)l.textContent=t}
function menu(){var a=W().$("#bact",root),hasOrb=ORBS.some(function(k){return S.items[k]>0});
  a.innerHTML='<div class="bmenu">'+
   '<button class="bm fight" data-a="fight"><b>Fight</b><span>Answer to attack</span></button>'+
   (B.leader?'':'<button class="bm catch" data-a="catch"'+(hasOrb?'':' disabled')+'><b>Catch</b><span>'+(hasOrb?"Throw an orb":"No orbs left")+'</span></button>')+
   '<button class="bm bag" data-a="bag"><b>Bag</b><span>Use a potion</span></button><button class="bm swap" data-a="swap"><b>Switch</b><span>Change creature</span></button>'+
   (B.leader?'':'<button class="bm run" data-a="run"><b>Run</b><span>Leave the battle</span></button>')+'</div>';
  W().$$(".bm",a).forEach(function(b){b.onclick=function(){({fight:fight,catch:catchMenu,bag:bagMenu,swap:swapMenu,run:run})[b.dataset.a]()}})}
/* Questions: usually multiple choice; sometimes the student has to spell the word (like Spell It).
   How often is set in the Bag tab (S.spell: 0 off, 1 sometimes, 2 often). A correct spelling earns bonus coins. */
var SPELL_CHANCE=[0,.3,.55];
function spellOn(){return S.spell===undefined?1:S.spell}
function ask(prompt,cb,kind){var ws=W().words(),r=Math.random(),chance=SPELL_CHANCE[spellOn()]*(B&&B.leader?1.3:1);
  if(ws.length&&r<chance)return askSpell(prompt,cb);
  var a=W().$("#bact",root),q=W().makeQs(1)[0];
  a.innerHTML='<p class="bprompt">'+prompt+'</p>'+W().mcqHTML(q)+'<p class="feedback" id="bfb"></p>';
  W().bindMCQ(a,q,function(ok){S.answered++;var fb=W().$("#bfb",root);
    if(ok){S.right++;S.coins+=2;W().sfx.good();fb.className="feedback good";fb.textContent="Correct! +2 coins"}
    else{W().sfx.bad();fb.className="feedback bad";fb.textContent="The answer was “"+(q.type==="def"?q.x.w:q.x.d)+"”."}
    save();header();setTimeout(function(){cb(ok)},ok?750:1700)})}
function askSpell(prompt,cb){var a=W().$("#bact",root),ws=W().words(),x=ws[Math.floor(Math.random()*ws.length)],n=W().letters(x.w).length,done=false,hint=1;
  var hintTxt=function(){var L=W().letters(x.w);return L.split("").map(function(c,i){return i<hint?c:"_"}).join(" ")};
  a.innerHTML='<p class="bprompt">'+prompt+' <span class="spellbadge">Spelling challenge</span></p>'+
   '<div class="prompt"><small>Spell the word that means</small><p>'+W().esc(x.d)+'</p><p class="muted spellhint" id="bhint">'+hintTxt()+' <span>('+n+' letters)</span></p></div>'+
   '<form class="spellbox" id="bsf" autocomplete="off"><input id="bsi" aria-label="Type the word" autocapitalize="off" spellcheck="false" autocorrect="off" placeholder="Type the word"><button class="btn" type="submit">Check</button></form>'+
   '<div class="row" style="justify-content:center;margin-top:8px">'+(W().canSpeak?'<button class="btn alt sm" type="button" id="bhear">Hear the word</button>':'')+'<button class="btn alt sm" type="button" id="bmore">Show another letter</button></div>'+
   '<p class="feedback" id="bfb"></p>';
  var si=W().$("#bsi",a),fb=W().$("#bfb",a);setTimeout(function(){si.focus()},50);
  var hb=W().$("#bhear",a);if(hb)hb.onclick=function(){W().say(x.w);si.focus()};
  W().$("#bmore",a).onclick=function(){if(hint<n-1){hint++;W().$("#bhint",a).innerHTML=hintTxt()+' <span>('+n+' letters)</span>'}si.focus()};
  W().$("#bsf",a).onsubmit=function(e){e.preventDefault();if(done)return;var v=W().norm(si.value);if(!v){si.focus();return}done=true;si.disabled=true;S.answered++;
    var ok=v===W().norm(x.w),bonus=Math.max(2,5-(hint-1));
    if(ok){S.right++;S.spelled=(S.spelled||0)+1;S.coins+=bonus;W().sfx.good();fb.className="feedback good";fb.textContent="Spelled right! +"+bonus+" coins"}
    else{W().sfx.bad();fb.className="feedback bad";fb.textContent="It’s spelled “"+x.w+"”."}
    save();header();setTimeout(function(){cb(ok)},ok?850:2200)}}
function anim(sel,c){var e=W().$(sel,root);if(!e)return;e.classList.remove(c);void e.offsetWidth;e.classList.add(c)}
function fight(){var me=S.team[B.me],foe=B.foes[B.fi];
  ask("Answer right and "+dex(me.id).name+" attacks!",function(ok){
    if(ok){B.streak++;var m=mult(me,foe),dmg=Math.round((4+me.lv*1.5)*m*(1+Math.min(B.streak-1,4)*.1));foe.hp=Math.max(0,foe.hp-dmg);
      drawBattle();anim("#mespr","lunge");anim("#foespr","ouch");setLog(dex(me.id).name+" hits for "+dmg+"!"+(m>1?" It’s super strong!":"")+(B.streak>=3?" Streak x"+B.streak+"!":""));
      if(foe.hp<=0)setTimeout(foeDown,900)}
    else{B.streak=0;foeHits()}})}
function foeHits(){var me=S.team[B.me],foe=B.foes[B.fi],m=mult(foe,me),dmg=Math.round((3+foe.lv*1.3)*m);me.hp=Math.max(0,me.hp-dmg);save();
  drawBattle();anim("#foespr","lunge2");anim("#mespr","ouch");setLog(dex(foe.id).name+" hits back for "+dmg+"!"+(m>1?" Ouch, super strong!":""));
  if(me.hp<=0)setTimeout(meDown,900)}
function foeDown(){var foe=B.foes[B.fi],me=S.team[B.me],xp=foe.lv*8+6,coins=foe.lv*2;if(B.leader)xp=Math.round(xp*1.5);
  var msgs=gainXP(me,xp);S.team.forEach(function(m){if(m!==me&&m.hp>0)msgs=msgs.concat(gainXP(m,Math.round(xp/3)))});S.coins+=coins;save();
  var evo=msgs.some(function(t){return t.indexOf("evolve:")===0});msgs=msgs.map(function(t){return t.replace(/^evolve:/,"")});
  var more=B.leader&&B.fi<B.foes.length-1,last=!more;
  if(evo)W().celebrate();
  W().$("#bact",root).innerHTML='<div class="done-card small"><h3>'+dex(foe.id).name+' fainted!</h3><p>'+dex(me.id).name+' got '+xp+' experience'+(coins?' and you found '+coins+' coins':'')+'.</p>'+(msgs.length?'<ul class="lvl">'+msgs.map(function(t){return '<li>'+W().esc(t)+'</li>'}).join("")+'</ul>':'')+
   '<button class="btn" id="bnext">'+(more?"Next creature":B.leader?"Finish":"Back to the map")+'</button></div>';
  drawSpritesOnly();
  W().$("#bnext",root).onclick=function(){if(more){B.fi++;B.streak=0;B.log="Leader "+B.leader.name+" sends out "+dex(B.foes[B.fi].id).name+"!";drawBattle();return}if(B.leader)return winGym();end()};W().$("#bnext",root).focus()}
function drawSpritesOnly(){var me=S.team[B.me],d=dex(me.id),box=W().$("#mespr",root);if(box){box.innerHTML="";box.appendChild(sprite(d,3))}}
function winGym(){var L=B.leader,prize=80+L.i*40;S.badges=Math.max(S.badges,L.i+1);S.coins+=prize;save();W().celebrate();
  W().$("#bact",root).innerHTML='<div class="done-card small"><h3>You beat Leader '+L.name+'!</h3><p>You earned the <b>'+C().TYPES[L.type].name+' Badge</b> and '+prize+' coins.'+(L.i<AREAS.length-1?' The path to <b>'+AREAS[L.i+1].name+'</b> is open. Walk off the right side of the map.':' You beat every gym. You’re a Word Champion!')+'</p><button class="btn" id="bnext">Back to the map</button></div>';
  header();W().$("#bnext",root).onclick=end}
function meDown(){var next=S.team.findIndex(function(m){return m.hp>0});
  if(next<0){W().$("#bact",root).innerHTML='<div class="done-card small"><h3>Your team needs a rest</h3><p>You hurry back to the healing center. Everyone is healed and ready to try again.</p><button class="btn" id="bnext">OK</button></div>';
    W().$("#bnext",root).onclick=function(){S.team.forEach(function(x){x.hp=maxHp(x)});var hp=besideDoor("h");S.x=hp[0];S.y=hp[1];save();end()};return}
  setLog(dex(S.team[B.me].id).name+" can’t go on. Choose another creature.");swapMenu(true)}
function catchMenu(){var a=W().$("#bact",root);
  a.innerHTML='<p class="bprompt">Pick an orb. Then answer questions in a row to catch the creature.</p><div class="bmenu">'+ORBS.filter(function(k){return S.items[k]>0}).map(function(k){return '<button class="bm orbbtn" data-o="'+k+'"><b>'+ITEMS[k].name+'</b><span>You have '+S.items[k]+' · needs '+need(k)+' right</span></button>'}).join("")+'<button class="bm" data-o="">Back</button></div>';
  W().$$("[data-o]",a).forEach(function(b){b.onclick=function(){if(!b.dataset.o)return menu();throwOrb(b.dataset.o)}})}
function need(orb){var foe=B.foes[B.fi],r=dex(foe.id).rarity,n={common:1,uncommon:2,rare:2,legendary:3}[r];if(foe.hp/maxHp(foe)>.5)n++;n-=ORBS.indexOf(orb);return Math.max(1,n)}
function throwOrb(orb){var n=need(orb),got=0;S.items[orb]--;save();
  var shake=function(){ask('<span class="shakes">'+Array.from({length:n}).map(function(_,i){return '<i class="'+(i<got?"on":"")+'"></i>'}).join("")+'</span> The orb is shaking! Answer '+(n-got)+' more to catch it.',function(ok){
    if(!ok){B.streak=0;setLog(dex(B.foes[B.fi].id).name+" broke free!");drawBattle();return}
    got++;if(got<n)return shake();
    var f=B.foes[B.fi],m=mon(f.id,f.lv);m.hp=f.hp>0?f.hp:1;markCaught(f.id);var where=S.team.length<TEAM_MAX?"team":"box";S[where].push(m);save();W().celebrate();
    W().$("#bact",root).innerHTML='<div class="done-card small">'+spriteHTML(f.id,3)+'<h3>You caught '+dex(f.id).name+'!</h3><p>'+(where==="team"?"It joined your team.":"Your team is full, so it went to your box. You can swap it in from My Team.")+' It’s now in your Creature Book.</p><button class="btn" id="bnext">Back to the map</button></div>';
    paintSprites(W().$("#bact",root));W().$("#bnext",root).onclick=end})};
  setLog("You threw a "+ITEMS[orb].name+"!");shake()}
function bagMenu(){var a=W().$("#bact",root),me=S.team[B.me],its=["potion","superpotion"].filter(function(k){return S.items[k]>0});
  a.innerHTML='<p class="bprompt">Use an item on '+dex(me.id).name+'.</p><div class="bmenu">'+(its.length?its.map(function(k){return '<button class="bm" data-i="'+k+'"><b>'+ITEMS[k].name+'</b><span>You have '+S.items[k]+'</span></button>'}).join(""):'<p class="muted">No potions. Buy some at the shop.</p>')+'<button class="bm" data-i="">Back</button></div>';
  W().$$("[data-i]",a).forEach(function(b){b.onclick=function(){var k=b.dataset.i;if(!k)return menu();S.items[k]--;var before=me.hp;me.hp=k==="potion"?Math.min(maxHp(me),me.hp+25):maxHp(me);save();drawBattle();setLog(dex(me.id).name+" healed "+(me.hp-before)+" HP.")}})}
function swapMenu(forced){var a=W().$("#bact",root);
  a.innerHTML='<p class="bprompt">'+(forced?"Choose who goes next.":"Choose a creature.")+'</p><div class="pick-team">'+S.team.map(function(m,i){return '<button class="mini" data-i="'+i+'"'+(m.hp<=0||i===B.me?" disabled":"")+'>'+spriteHTML(m.id,1)+'<b>'+dex(m.id).name+'</b><span>Lv '+m.lv+' · '+m.hp+'/'+maxHp(m)+' HP</span></button>'}).join("")+'</div>'+(forced?'':'<button class="btn alt" id="bback">Back</button>');
  paintSprites(a);W().$$(".mini",a).forEach(function(b){b.onclick=function(){B.me=+b.dataset.i;B.streak=0;B.log="Go, "+dex(S.team[B.me].id).name+"!";drawBattle()}});var bb=W().$("#bback",a);if(bb)bb.onclick=menu}
function run(){setLog("You got away safely.");end()}
function end(){B=null;mode="map";save();render()}

/* ---------- shop ---------- */
function viewShop(body){
  body.innerHTML='<div class="shop"><div class="row" style="justify-content:space-between"><h3>Shop</h3><button class="btn alt" id="sback">Back to the map</button></div><p class="muted">Earn coins by answering questions and winning battles. New items unlock as you earn badges.</p>'+
   '<div class="items">'+Object.keys(ITEMS).map(function(k){var it=ITEMS[k],locked=S.badges<it.badge;return '<div class="item'+(locked?" locked":"")+'">'+itemIcon(k)+'<div><b>'+it.name+'</b><span>'+(locked?"Unlocks with "+it.badge+" badge"+(it.badge>1?"s":""):it.desc)+'</span></div><div class="buy"><span class="price"><i class="coin-ic"></i>'+it.price+'</span><button class="btn" data-k="'+k+'"'+(locked||S.coins<it.price?" disabled":"")+'>Buy</button><small>Have '+(S.items[k]||0)+'</small></div></div>'}).join("")+'</div><p class="status" id="sstat" role="status"></p></div>';
  W().$("#sback",body).onclick=function(){var sp=besideDoor("s");S.x=sp[0];S.y=sp[1];save();mode="map";render()};
  W().$$("[data-k]",body).forEach(function(b){b.onclick=function(){var k=b.dataset.k,it=ITEMS[k];if(S.coins<it.price)return;S.coins-=it.price;S.items[k]=(S.items[k]||0)+1;save();W().sfx.good();render();W().$("#sstat",root).textContent="You bought a "+it.name+"."}})}
function itemIcon(k){var c={orb:"#4AA3EF",super:"#A97CFF",ultra:"#E8503A",potion:"#F07FB0",superpotion:"#A97CFF",candy:"#F2C230"}[k];
  if(ORBS.indexOf(k)>=0)return '<svg class="iic" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><rect x="5" y="1" width="6" height="14" fill="'+c+'"/><rect x="3" y="3" width="10" height="10" fill="'+c+'"/><rect x="1" y="5" width="14" height="6" fill="'+c+'"/><rect x="1" y="7" width="14" height="2" fill="#F2C230"/><rect x="5" y="3" width="2" height="2" fill="#fff" opacity=".8"/><rect x="4" y="5" width="1" height="1" fill="#fff" opacity=".6"/></svg>';
  if(k==="candy")return '<svg class="iic" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><rect x="5" y="5" width="6" height="6" fill="'+c+'"/><rect x="2" y="6" width="3" height="4" fill="#FF8A6B"/><rect x="11" y="6" width="3" height="4" fill="#FF8A6B"/><rect x="6" y="6" width="2" height="2" fill="#fff"/></svg>';
  return '<svg class="iic" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><rect x="6" y="1" width="4" height="3" fill="#D3DDE8"/><rect x="4" y="4" width="8" height="10" fill="'+c+'"/><rect x="4" y="4" width="8" height="2" fill="#fff" opacity=".5"/><rect x="7" y="7" width="2" height="5" fill="#fff"/><rect x="5" y="8" width="6" height="2" fill="#fff"/></svg>'}

/* ---------- team ---------- */
function monCard(m,where,i){var d=dex(m.id),nx=d.evolvesAt?dex(m.id+1):null;
  return '<div class="tcard">'+spriteHTML(m.id,2)+'<div class="tinfo"><b>'+d.name+'</b><span>Lv '+m.lv+' '+typeChip(d.type)+'</span>'+hpBar(m)+'<span class="muted small">'+(nx?(S.caught[nx.id]?"Evolves into "+nx.name:"Evolves")+" at level "+d.evolvesAt:"Final form")+'</span>'+
   '<div class="row tbtn">'+(where==="team"?(i>0?'<button class="btn alt sm" data-lead="'+i+'">Make leader</button>':'<span class="pill sm">Leader</span>')+(S.team.length>1?'<button class="btn alt sm" data-tobox="'+i+'">To box</button>':''):'<button class="btn alt sm" data-toteam="'+i+'"'+(S.team.length>=TEAM_MAX?" disabled":"")+'>To team</button>')+
   (S.items.candy>0&&m.lv<MAXLV?'<button class="btn alt sm" data-candy="'+where+':'+i+'">Give candy</button>':'')+'</div></div></div>'}
function viewTeam(body){
  body.innerHTML='<h3>My Team <span class="muted">('+S.team.length+' of '+TEAM_MAX+')</span></h3><p class="muted">Your leader goes first in battle. Heal everyone for free at the pink building.</p><div class="tgrid">'+S.team.map(function(m,i){return monCard(m,"team",i)}).join("")+'</div>'+
   '<h3 style="margin-top:22px">Box <span class="muted">('+S.box.length+')</span></h3>'+(S.box.length?'<div class="tgrid">'+S.box.map(function(m,i){return monCard(m,"box",i)}).join("")+'</div>':'<p class="muted">Creatures you catch when your team is full go here.</p>')+'<p class="status" id="tstat" role="status"></p>';
  paintSprites(body);
  var act=function(sel,fn){W().$$("["+sel+"]",body).forEach(function(b){b.onclick=function(){fn(b.getAttribute(sel));save();render()}})};
  act("data-lead",function(i){var m=S.team.splice(+i,1)[0];S.team.unshift(m)});
  act("data-tobox",function(i){S.box.push(S.team.splice(+i,1)[0])});
  act("data-toteam",function(i){if(S.team.length<TEAM_MAX)S.team.push(S.box.splice(+i,1)[0])});
  act("data-candy",function(v){var p=v.split(":"),m=S[p[0]][+p[1]];S.items.candy--;var msgs=gainXP(m,m.lv*10-m.xp);if(msgs.some(function(t){return t.indexOf("evolve:")===0}))W().celebrate();setTimeout(function(){var st=W().$("#tstat",root);if(st)st.textContent=msgs.map(function(t){return t.replace(/^evolve:/,"")}).join(" ")},0)})}

/* ---------- creature book ---------- */
var bookFilter="all",bookSel=0;
function viewBook(body){var D=C().DEX,caught=D.filter(function(d){return S.caught[d.id]}).length,seen=D.filter(function(d){return S.seen[d.id]}).length;
  var types=Object.keys(C().TYPES);
  body.innerHTML='<div class="book-head"><h3>Creature Book</h3><div class="bookstats"><span class="pill"><b>'+caught+'</b>&nbsp;of 100 caught</span><span class="pill">'+seen+' seen</span><span class="pill">'+D.filter(function(d){return d.rarity==="legendary"&&S.caught[d.id]}).length+' of 6 legendaries</span></div></div>'+
   '<div class="bar book-bar" aria-hidden="true"><i style="width:'+caught+'%"></i></div>'+
   '<div class="tfilter"><button data-f="all" aria-pressed="'+(bookFilter==="all")+'">All</button><button data-f="caught" aria-pressed="'+(bookFilter==="caught")+'">Caught</button>'+types.map(function(t){return '<button data-f="'+t+'" aria-pressed="'+(bookFilter===t)+'" class="t-'+t+'" style="--tc:'+C().TYPES[t].color+'">'+C().TYPES[t].name+'</button>'}).join("")+'</div>'+
   '<div class="book"><div class="bgrid">'+D.filter(function(d){return bookFilter==="all"||(bookFilter==="caught"?S.caught[d.id]:d.type===bookFilter)}).map(function(d){var c=S.caught[d.id],s=S.seen[d.id];
     return '<button class="bcell'+(c?" got":s?" seen":"")+(d.rarity==="legendary"?" leg":"")+(bookSel===d.id?" sel":"")+'" data-id="'+d.id+'" aria-label="#'+d.id+' '+(c||s?d.name:"unknown")+'"><span class="num">'+String(d.id).padStart(3,"0")+'</span>'+(c||s?spriteHTML(d.id,1,"",!c):'<span class="q">?</span>')+'<span class="nm">'+(c||s?d.name:"???")+'</span></button>'}).join("")+'</div><div class="bdetail" id="bdetail"></div></div>';
  paintSprites(body);
  W().$$(".tfilter button",body).forEach(function(b){b.onclick=function(){bookFilter=b.dataset.f;render()}});
  W().$$(".bcell",body).forEach(function(b){b.onclick=function(){bookSel=+b.dataset.id;W().$$(".bcell",body).forEach(function(x){x.classList.toggle("sel",x===b)});detail()}});
  detail()}
function detail(){var el=W().$("#bdetail",root);if(!el)return;var d=bookSel&&dex(bookSel);
  if(!d){el.innerHTML='<p class="muted">Tap a creature to see more about it.</p>';return}
  var c=S.caught[d.id],s=S.seen[d.id],where=d.rarity==="legendary"?(Object.keys(LEGEND_AT).filter(function(k){return LEGEND_AT[k].indexOf(d.name)>=0}).map(function(k){return AREAS[k].name})[0]||"?")+" (very rare)":AREAS.filter(function(A){return A.types.indexOf(d.type)>=0}).map(function(A){return A.name}).join(", ");
  var prev=d.id>1&&dex(d.id-1).line===d.line?dex(d.id-1):null,next=d.evolvesAt?dex(d.id+1):null;
  el.innerHTML='<div class="bigspr">'+(c||s?spriteHTML(d.id,4,"",!c):'<span class="q big">?</span>')+'</div><h3>#'+d.id+' '+(c||s?d.name:"Unknown creature")+'</h3>'+
   (c?'<p>'+typeChip(d.type)+' <span class="rar r-'+d.rarity+'">'+C().RARITY[d.rarity]+'</span></p><p class="muted">Found in: '+where+'</p>'+(prev?'<p class="muted">Evolves from '+(S.caught[prev.id]?prev.name:"???")+'.</p>':'')+(next?'<p class="muted">Evolves into '+(S.caught[next.id]?next.name:"???")+' at level '+d.evolvesAt+'.</p>':'<p class="muted">This is its final form.</p>')
    :s?'<p class="muted">You’ve seen this creature but haven’t caught it yet.</p><p class="muted">Found in: '+where+'</p>':'<p class="muted">You haven’t found this creature yet. Keep exploring!</p>');
  paintSprites(el)}

/* ---------- bag + save ---------- */
function viewBag(body){
  body.innerHTML='<h3>Bag</h3><div class="items">'+Object.keys(ITEMS).map(function(k){return '<div class="item">'+itemIcon(k)+'<div><b>'+ITEMS[k].name+'</b><span>'+ITEMS[k].desc+'</span></div><div class="buy"><span class="pill">× '+(S.items[k]||0)+'</span></div></div>'}).join("")+'</div>'+
   '<p class="muted">Use potions during battles. Give Level Candy from <b>My Team</b>. Buy more at the shop (the blue building).</p>'+
   '<div class="statsrow"><span class="pill">Questions answered: '+S.answered+'</span><span class="pill">Right answers: '+S.right+'</span><span class="pill">Words spelled: '+(S.spelled||0)+'</span></div>'+
   '<h3 style="margin-top:22px">Spelling challenges</h3><p class="muted">Sometimes a fight, catch or gym question asks you to type the word instead of picking it. Spelling it right earns extra coins.</p>'+
   '<div class="seg" role="group" aria-label="Spelling challenges">'+[["0","Off"],["1","Sometimes"],["2","Often"]].map(function(o){return '<button data-sp="'+o[0]+'" aria-pressed="'+(String(spellOn())===o[0])+'">'+o[1]+'</button>'}).join("")+'</div>';
  W().$$("[data-sp]",body).forEach(function(b){b.onclick=function(){S.spell=+b.dataset.sp;save();render()}})}
var resetArm=false;
function viewSave(body){
  body.innerHTML='<h3>Save code</h3><p class="muted">Your game saves by itself on this computer. If you switch computers or clear your browser, copy this code first. Then paste it on the new computer to keep playing.</p>'+
   '<textarea class="paste code" id="qcode" readonly>'+encode()+'</textarea><div class="row"><button class="btn" id="qcopy">Copy my code</button><span class="status" id="qcs" role="status"></span></div>'+
   '<h3 style="margin-top:22px">Load a save code</h3><textarea class="paste code" id="qin" placeholder="Paste a save code here"></textarea><div class="row"><button class="btn alt" id="qload">Load this code</button><span class="status" id="qls" role="status"></span></div>'+
   '<h3 style="margin-top:22px">Start over</h3><p class="muted">This erases your creatures, coins and badges on this computer.</p><button class="btn alt" id="qreset">'+(resetArm?"Tap again to erase everything":"Start a new game")+'</button>';
  W().$("#qcopy",body).onclick=async function(){var t=W().$("#qcode",body),ok=false;try{await navigator.clipboard.writeText(t.value);ok=true}catch(e){t.select();try{ok=document.execCommand("copy")}catch(e2){}}W().$("#qcs",body).textContent=ok?"Copied!":"Select the code and copy it."};
  W().$("#qload",body).onclick=function(){var st=W().$("#qls",body);try{S=decode(W().$("#qin",body).value);save();st.className="status good";st.textContent="Loaded! Welcome back.";render()}catch(e){st.className="status bad";st.textContent=e.message==="classic"?"That’s a save code from the first Creature Quest. Load it in Creature Quest Classic on the home screen.":"That code didn’t work. Check that you copied all of it."}};
  W().$("#qreset",body).onclick=function(){if(!resetArm){resetArm=true;render();return}resetArm=false;S=fresh();save();mode="intro";render()}}
})();
