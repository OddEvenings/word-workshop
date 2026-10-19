/* Word Workshop creatures: 100 faceless pixel creatures, drawn in code.
   Each one is built on a 32x32 grid from simple shapes (no eyes, mouths or ears),
   then shaded and outlined so it reads as pixel art. Same id always draws the same creature. */
(function(global){
"use strict";
var N=32;

/* ---------- elements: colors and name parts ---------- */
var TYPES={
  leaf:{name:"Leaf",  pal:["#3FAE5A","#8BD66B","#F2D04B","#1D4A2B"],pre:["Fern","Moss","Sprig","Bud","Ivy","Thistle"]},
  ember:{name:"Ember",pal:["#E8573A","#FFB13B","#FFE38A","#5A1E14"],pre:["Cinder","Blaze","Flick","Scorch","Kindle","Ash"]},
  tide:{name:"Tide",  pal:["#3C8CE0","#7FD3F2","#F4F1E6","#173B66"],pre:["Ripple","Brook","Coral","Splash","Drift","Surf"]},
  spark:{name:"Spark",pal:["#F2C12E","#FFF27A","#5A5AE8","#5C4410"],pre:["Zap","Volt","Fizz","Jolt","Buzz","Static"]},
  stone:{name:"Stone",pal:["#8D7B68","#C2B29B","#6FA3A8","#3A2E24"],pre:["Pebble","Grit","Slate","Crag","Rubble","Flint"]},
  frost:{name:"Frost",pal:["#7FC8F0","#E2F6FF","#5B7FE0","#284B72"],pre:["Frost","Flurry","Rime","Chill","Sleet","Glacie"]},
  gust:{name:"Gust",  pal:["#9FD8D0","#F0FBF8","#F29BB8","#2F5C5A"],pre:["Breeze","Puff","Whirl","Zephy","Gale","Wisp"]},
  shade:{name:"Shade",pal:["#5B4B9A","#9A85D8","#F2E35B","#1E1838"],pre:["Dusk","Gloom","Murk","Umbra","Night","Hush"]},
  bloom:{name:"Bloom",pal:["#F07FB0","#FFC9DE","#FFE15C","#6A2346"],pre:["Petal","Blossom","Lilac","Pollen","Rosie","Dewdrop"]},
  metal:{name:"Metal",pal:["#8A9BB0","#D3DDE8","#F0A23B","#2B3440"],pre:["Cog","Rivet","Chrome","Bolt","Alloy","Gear"]}
};
var SUF=[["let","ling","kin","bit","pup","sprout","ette","o"],["ster","rix","on","ix","ard","er","ox","ham"],["titan","drake","lith","nova","crest","king","gard","rok"]];
var SUF_LEG=["aris","ion","oth","yxa","urea","onyx"];

/* ---------- seeded random ---------- */
function rng(seed){var s=seed>>>0||1;return function(){s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296}}

/* ---------- raster helpers on a label grid: 0 empty, 1 body, 2 second color, 3 accent ---------- */
function grid(){var g=[];for(var i=0;i<N*N;i++)g.push(0);return g}
function set(g,x,y,v){x=Math.round(x);y=Math.round(y);if(x>=0&&x<N&&y>=0&&y<N)g[y*N+x]=v}
function get(g,x,y){return x>=0&&x<N&&y>=0&&y<N?g[y*N+x]:0}
function ell(g,cx,cy,rx,ry,v,only){for(var y=0;y<N;y++)for(var x=0;x<N;x++){var dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1&&(!only||g[y*N+x]))g[y*N+x]=v}}
function rect(g,x0,y0,w,h,v){for(var y=Math.round(y0);y<Math.round(y0+h);y++)for(var x=Math.round(x0);x<Math.round(x0+w);x++)set(g,x,y,v)}
function poly(g,pts,v,only){for(var y=0;y<N;y++)for(var x=0;x<N;x++){var px=x+.5,py=y+.5,ins=false;for(var i=0,j=pts.length-1;i<pts.length;j=i++){var a=pts[i],b=pts[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])ins=!ins}if(ins&&(!only||g[y*N+x]))g[y*N+x]=v}}
function mirror(g){for(var y=0;y<N;y++)for(var x=0;x<N/2;x++){var a=g[y*N+x],b=g[y*N+N-1-x];if(a&&!b)g[y*N+N-1-x]=a;else if(b&&!a)g[y*N+x]=b}}
function bbox(g){var x0=N,y0=N,x1=-1,y1=-1;for(var y=0;y<N;y++)for(var x=0;x<N;x++)if(g[y*N+x]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return {x0:x0,y0:y0,x1:x1,y1:y1}}

/* ---------- body families. k = size (0.7, 0.85, 1 by stage), st = stage 0..2, r = random ---------- */
var FAM={
  blob:function(g,k,st,r){var w=8+r()*3,h=7+r()*2;ell(g,16,29-h*k,w*k,h*k,1);
    if(st>0)for(var i=0;i<st+1;i++){var a=-0.9+i*1.8/(st);poly(g,[[16+Math.sin(a)*4*k-2,29-2*h*k+3],[16+Math.sin(a)*6*k,29-2*h*k-3-st*2],[16+Math.sin(a)*4*k+2,29-2*h*k+3]],2)}},
  drop:function(g,k,st,r){var h=20*k,w=8*k+r()*2;ell(g,16,30-w,w,w,1);poly(g,[[16-w*.86,30-w*1.5],[16,30-h-2],[16+w*.86,30-w*1.5]],1);if(st>1){ell(g,9,22,3,2,2);ell(g,23,22,3,2,2)}},
  bulb:function(g,k,st,r){var rr=7.5*k+r()*1.5;ell(g,16,30-rr,rr+1,rr,1);var n=1+st;for(var i=0;i<n;i++){var a=(n===1?0:-0.8+1.6*i/(n-1)),bx=16+Math.sin(a)*5,by=30-2*rr+1;poly(g,[[bx,by+2],[bx+Math.sin(a)*8-3,by-7*k-2],[bx+Math.sin(a)*8+3,by-7*k-2]],2)}rect(g,10,29,3,2,1);rect(g,19,29,3,2,1)},
  critter:function(g,k,st,r){var bw=10*k,bh=6*k+r()*1.5,by=26-bh;ell(g,15,by,bw,bh,1);ell(g,15+bw*.95,by-bh*.9,5*k+st*.5,4.5*k+st*.5,1);
    [-0.65,-0.25,0.25,0.65].forEach(function(f){rect(g,15+f*bw*1.1-1,by+bh-1,2+(st>1?1:0),31-(by+bh)+1-1,1)});poly(g,[[15-bw+1,by-1],[15-bw-5-st*2,by-5-st*2],[15-bw-3,by+2]],2);
    if(st>0)poly(g,[[15+bw*.95-2,by-bh*.9-4*k],[15+bw*.95,by-bh*.9-8*k-st],[15+bw*.95+2,by-bh*.9-4*k]],2)},
  bird:function(g,k,st,r){var rr=7*k+r();ell(g,16,22,rr,rr*1.05,1);poly(g,[[16-rr+1,20],[16-rr-6-st*2,14-st*2],[16-rr-2,25]],2);mirror(g);
    poly(g,[[13,22+rr],[16,30],[19,22+rr]],1);for(var i=0;i<=st;i++)poly(g,[[15-i,22-rr+1],[16+(i-1)*2,22-rr-4-i*2],[17+i,22-rr+1]],3)},
  serpent:function(g,k,st,r){var n=5+st*2,ph=r()*6;for(var i=0;i<n;i++){var t=i/(n-1),x=6+t*20,y=26-Math.sin(t*5+ph)*3*k-t*(st*3),rr=(2.2+ (1-t)*0.5+st*.6)*k+1.3;ell(g,x,y,rr,rr,1)}
    var hx=26,hy=26-Math.sin(5+ph)*3*k-st*3;ell(g,hx,hy-2,3.5+st*.6,3+st*.5,1);if(st>0)poly(g,[[hx-2,hy-4],[hx+1,hy-9-st],[hx+2,hy-4]],2)},
  crystal:function(g,k,st,r){var n=2+st;for(var i=0;i<n;i++){var cx=16+(i-(n-1)/2)*5*k,h=(10+r()*6+(i===Math.floor(n/2)?6:0))*k+st*2,w=3+r()*1.5;poly(g,[[cx-w,30],[cx-w,30-h*.7],[cx,30-h],[cx+w,30-h*.7],[cx+w,30]],i%2?2:1)}rect(g,9,28,14,3,1)},
  shell:function(g,k,st,r){var w=10*k+st,h=8*k+st;ell(g,15,29-h*.6,w,h,2);rect(g,15-w,29-h*.6,w*2,h,0);ell(g,15,29-h*.6,w,h,2);
    for(var y=0;y<N;y++)for(var x=0;x<N;x++)if(y>29-h*.6+1)g[y*N+x]=0;rect(g,15-w-2,27-h*.6+2,w*2+4,3,1);ell(g,15+w+1,26-h*.6+2,3.5,3,1);
    for(var yy=0;yy<N;yy+=3)for(var xx=0;xx<N;xx++)if(g[yy*N+xx]===2&&(xx+yy)%6<3)g[yy*N+xx]=3},
  jelly:function(g,k,st,r){var w=9*k+st*.5,h=7*k;ell(g,16,15,w,h,1);rect(g,16-w,15,w*2,h,0);for(var i=0;i<4+st;i++){var x=16-w+2+i*(2*w-4)/(3+st);for(var y=15;y<15+8+st*2+((i%2)?2:0);y++)set(g,x+Math.sin(y*.8+i)*1,y,2)}rect(g,16-w,14,2*w,2,1)},
  golem:function(g,k,st,r){var w=7*k+st,h=7*k;rect(g,16-w,30-h*2,w*2,h*2,1);rect(g,16-w*.6,30-h*2-6*k,w*1.2,6*k,1);rect(g,16-w-4,30-h*2+1,4,h+st,2);rect(g,16+w,30-h*2+1,4,h+st,2);
    if(st>0)rect(g,16-1,30-h*2-6*k-3,2,3,3);if(st>1){rect(g,16-w-4,30-h*2-1,4,2,3);rect(g,16+w,30-h*2-1,4,2,3)}},
  bug:function(g,k,st,r){var n=2+st;for(var i=0;i<n;i++)ell(g,8+i*(16/(n-0.5))*k+ (1-k)*8,24-(i===n-1?2:0),(3.6+(i===0?1:0))*k+1,(3.4)*k+1.5,1);
    for(var j=0;j<3;j++){var x=11+j*4*k+(1-k)*6;for(var y=26;y<31;y++)set(g,x+(y-26)*.4,y,2)}var hx=8+(n-1)*(16/(n-0.5))*k+(1-k)*8;for(var y2=0;y2<5+st;y2++){set(g,hx+1+y2*.6,22-4*k-y2,2)}set(g,hx+1+(4+st)*.6,22-4*k-4-st,3);
    if(st>1){ell(g,12,15,5,3,3);ell(g,17,13,5,3,3)}},
  flame:function(g,k,st,r){var w=8*k,b=30;poly(g,[[16-w,b-4],[16-w+1,b-12*k],[16-w*.4,b-14*k],[16-w*.6,b-20*k-st*2],[16,b-15*k],[16+w*.3,b-24*k-st*3],[16+w*.7,b-14*k],[16+w,b-17*k-st],[16+w,b-4],[16,b]],1);
    poly(g,[[16-w*.5,b-3],[16-w*.3,b-10*k],[16+w*.2,b-14*k],[16+w*.5,b-8*k],[16+w*.5,b-3]],2,true)},
  mushroom:function(g,k,st,r){var w=10*k+st,h=6*k+st*.5;ell(g,16,18-st,w,h,1);rect(g,16-w,18-st,w*2,h,0);rect(g,16-3*k,18-st,6*k+1,12+st,2);rect(g,16-w,17-st,w*2,2,1);
    var sp=[[-0.5,-0.5],[0.35,-0.7],[0.1,-0.2],[-0.75,-0.1],[0.7,-0.2]];sp.slice(0,2+st).forEach(function(p){ell(g,16+p[0]*w*.85,18-st+p[1]*h,1.6,1.4,3,true)})},
  star:function(g,k,st,r){var R=12*k+st,ri=R*.45,pts=[],c=16,cy=17;for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr=i%2?ri:R;pts.push([c+Math.cos(a)*rr,cy+Math.sin(a)*rr])}poly(g,pts,1);ell(g,c,cy+1,ri*.9,ri*.9,2,true)},
  cloud:function(g,k,st,r){ell(g,12,20,6*k+1,5*k+1,1);ell(g,19,18,7*k+1,6*k+1,1);ell(g,16,22,9*k+1,4*k+1,1);for(var i=0;i<1+st;i++)poly(g,[[10+i*5,24],[12+i*5,29+i],[14+i*5,24]],2)}
};
/* patterns go on the lower body only and never as matching pairs high up, so nothing reads as a face */
function pattern(g,kind,r){
  var bb=bbox(g),cx=(bb.x0+bb.x1)/2,midY=bb.y0+(bb.y1-bb.y0)*0.5;
  if(kind==="belly"){for(var y=0;y<N;y++)for(var x=0;x<N;x++){var dx=(x+.5-cx)/((bb.x1-bb.x0)*.28+1),dy=(y+.5-(bb.y1-1))/((bb.y1-bb.y0)*.45+1);if(g[y*N+x]===1&&dx*dx+dy*dy<=1)g[y*N+x]=2}}
  else if(kind==="stripes"){for(var y2=Math.ceil(midY);y2<=bb.y1;y2+=3)for(var x2=0;x2<N;x2++)if(g[y2*N+x2]===1)g[y2*N+x2]=2}
  else if(kind==="spots"){var n=3,placed=0,tries=0;while(placed<n&&tries++<200){var sx=bb.x0+Math.floor(r()*(bb.x1-bb.x0)),sy=Math.floor(midY+r()*(bb.y1-midY));
      if(g[sy*N+sx]===1&&g[sy*N+sx+1]===1&&g[(sy+1)*N+sx]===1&&g[(sy+1)*N+sx+1]===1&&Math.abs(sx-(N-2-sx))>3){set(g,sx,sy,3);set(g,sx+1,sy,3);set(g,sx,sy+1,3);set(g,sx+1,sy+1,3);placed++}}}
  else if(kind==="gem"){var gy=Math.round(bb.y1-(bb.y1-bb.y0)*0.3),gx=Math.round(cx);if(get(g,gx,gy)===1){set(g,gx,gy-1,3);set(g,gx-1,gy,3);set(g,gx,gy,3);set(g,gx+1,gy,3);set(g,gx,gy+1,3)}}
  else if(kind==="zig"){var zy=Math.round(midY+2);for(var x3=bb.x0;x3<=bb.x1;x3++){var yy=zy+((x3%4)<2?0:1);if(get(g,x3,yy)===1)set(g,x3,yy,3)}}
}

/* ---------- the dex: 22 three-stage lines, 14 two-stage lines, 6 legendaries = 100 ---------- */
var LINES=[
 ["bulb","leaf","belly"],["flame","ember","none"],["drop","tide","belly"],["critter","spark","zig"],["golem","stone","spots"],["bird","frost","belly"],
 ["cloud","gust","none"],["serpent","shade","stripes"],["star","bloom","none"],["bug","metal","stripes"],["mushroom","bloom","none"],["critter","ember","belly"],
 ["blob","tide","spots"],["crystal","frost","none"],["bird","leaf","zig"],["jelly","spark","none"],["shell","stone","none"],["serpent","tide","belly"],
 ["blob","shade","stripes"],["bug","leaf","spots"],["golem","metal","gem"],["critter","gust","stripes"],
 ["blob","bloom","belly"],["drop","ember","stripes"],["mushroom","shade","none"],["jelly","tide","none"],["crystal","spark","none"],["shell","leaf","none"],
 ["cloud","frost","none"],["bird","ember","belly"],["bug","spark","zig"],["blob","stone","stripes"],["star","metal","none"],["bulb","gust","spots"],
 ["drop","shade","zig"],["critter","frost","spots"]
];
var LEGENDS=[["star","spark"],["serpent","frost"],["bird","ember"],["golem","leaf"],["crystal","shade"],["cloud","bloom"]];
var DEX=[];
(function(){
  var used={},id=1,pi={};
  var nameOf=function(type,line,st,legend){var T=TYPES[type];pi[type]=pi[type]||0;
    var pre=legend!=null?T.pre[(5-legend%3)%6]:T.pre[line%6],suf=legend!=null?SUF_LEG[legend]:SUF[st][(line*3+st)%SUF[st].length],n=pre+suf;
    if(used[n]){for(var i=0;i<8&&used[n];i++)n=T.pre[(line+i+1)%6]+suf}used[n]=1;return n};
  LINES.forEach(function(L,li){var stages=li<22?3:2;
    for(var st=0;st<stages;st++){var stage=stages===2&&st===1?2:st;
      DEX.push({id:id++,name:nameOf(L[1],li,stage),family:L[0],type:L[1],pattern:L[2],stage:stage,line:li,seed:li*7919+13,
        evolvesAt:st<stages-1?(stages===3?[0,16,32][st+1]:24):0,
        rarity:li<12?(st===0?"common":st===1?"uncommon":"rare"):li<22?(st===0?"uncommon":st===1?"rare":"rare"):(st===0?"common":"rare")})}});
  LEGENDS.forEach(function(L,i){DEX.push({id:id++,name:nameOf(L[1],0,2,i),family:L[0],type:L[1],pattern:"gem",stage:2,line:-1-i,seed:90001+i*131,evolvesAt:0,rarity:"legendary"})});
})();

/* ---------- drawing ---------- */
function hex(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function mix(a,b,t){return "rgb("+a.map(function(v,i){return Math.round(v+(b[i]-v)*t)}).join(",")+")"}
function build(c){
  var r=rng(c.seed),g=grid(),k=[0.72,0.86,1][c.stage];
  FAM[c.family](g,k,c.stage,r);
  if(c.pattern&&c.pattern!=="none")pattern(g,c.pattern,rng(c.seed+1));
  if(c.rarity==="legendary"){var bb=bbox(g);for(var x=bb.x0;x<=bb.x1;x++)if(get(g,x,bb.y1)===1)set(g,x,bb.y1,3)}
  return g;
}
function draw(ctx,c,px,ox,oy){
  px=px||4;ox=ox||0;oy=oy||0;
  var g=build(c),P=TYPES[c.type].pal.map(hex),W=[255,255,255],K=[0,0,0];
  var base={1:P[0],2:P[1],3:P[2]},line=P[3];
  for(var y=0;y<N;y++)for(var x=0;x<N;x++){var v=g[y*N+x];
    if(!v){if(get(g,x-1,y)||get(g,x+1,y)||get(g,x,y-1)||get(g,x,y+1)){ctx.fillStyle=mix(line,K,0);ctx.fillRect(ox+x*px,oy+y*px,px,px)}continue}
    var col=base[v],t=0;
    if(!get(g,x,y-1)||!get(g,x-1,y))t=0.35;
    else if(!get(g,x,y+1)||!get(g,x+1,y))t=-0.28;
    else if(get(g,x,y-2)&&!get(g,x,y-3)&&get(g,x-2,y)&&!get(g,x-3,y)&&v===1)t=0.18;
    ctx.fillStyle=t>0?mix(col,W,t):t<0?mix(col,K,-t):mix(col,col,0);ctx.fillRect(ox+x*px,oy+y*px,px,px)}
}
global.Creatures={DEX:DEX,TYPES:TYPES,draw:draw,SIZE:N,RARITY:{common:"Common",uncommon:"Uncommon",rare:"Rare",legendary:"Legendary"}};
})(window);
