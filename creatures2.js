/* Creature Quest 2 creatures: 100 magical objects (pots, lanterns, kites, gears, crystals...), drawn in code.
   None of them are animals or people: no faces, eyes, mouths, ears, heads or limbs.
   If art/cq2/manifest.js lists checked pictures, those are drawn instead (see "picture art" below). */
(function(global){
"use strict";
var N=48, GX=24, GY=46;
/* ---------- drawing state: a label grid (0 empty, 1-7 palette slots) and a stage transform ---------- */
var G, K=1, FX=false;
function tx(x){x=GX+(x-GX)*K;return FX?2*GX-x:x}
function ty(y){return GY-(GY-y)*K}
function at(x,y){return x>=0&&x<N&&y>=0&&y<N?G[y*N+x]:0}
function put(x,y,c,only){if(x>=0&&x<N&&y>=0&&y<N&&(!only||G[y*N+x]))G[y*N+x]=c}
function eachCell(fn){for(var y=0;y<N;y++)for(var x=0;x<N;x++)fn(x,y)}
/* ellipse, optionally rotated (radians) */
function E(cx,cy,rx,ry,c,only,rot){cx=tx(cx);cy=ty(cy);rx*=K;ry*=K;var co=Math.cos(rot||0),si=Math.sin(rot||0);if(FX)si=-si;
  eachCell(function(x,y){var px=x+.5-cx,py=y+.5-cy,u=(px*co+py*si)/rx,v=(-px*si+py*co)/ry;if(u*u+v*v<=1)put(x,y,c,only)})}
function P(pts,c,only){var q=pts.map(function(p){return [tx(p[0]),ty(p[1])]});
  eachCell(function(x,y){var px=x+.5,py=y+.5,ins=false;for(var i=0,j=q.length-1;i<q.length;j=i++){var a=q[i],b=q[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])ins=!ins}if(ins)put(x,y,c,only)})}
/* thick line with round ends */
function L(x1,y1,x2,y2,w,c,only){x1=tx(x1);y1=ty(y1);x2=tx(x2);y2=ty(y2);var r=Math.max(.5,w*K/2),dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy||1;
  eachCell(function(x,y){var px=x+.5,py=y+.5,t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/l2)),ex=x1+t*dx-px,ey=y1+t*dy-py;if(ex*ex+ey*ey<=r*r)put(x,y,c,only)})}
/* thick curve through points; width can taper from w0 to w1 */
function C(pts,w0,w1,c,only){var n=40;for(var i=0;i<n;i++){var a=bez(pts,i/n),b=bez(pts,(i+1)/n),w=w0+(w1-w0)*i/n;L(a[0],a[1],b[0],b[1],w,c,only)}}
function bez(p,t){if(p.length===1)return p[0];var q=[];for(var i=0;i<p.length-1;i++)q.push([p[i][0]+(p[i+1][0]-p[i][0])*t,p[i][1]+(p[i+1][1]-p[i][1])*t]);return bez(q,t)}
function R(x,y,w,h,c,only){P([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c,only)}
/* leaf / petal / feather: a pointed lens from (x,y) toward angle a */
function LF(x,y,len,wid,a,c,vein){var pts=[];for(var i=0;i<=12;i++){var t=i/12,s=Math.sin(t*Math.PI)*wid*(1-t*.25);pts.push([x+Math.cos(a)*len*t-Math.sin(a)*s,y+Math.sin(a)*len*t+Math.cos(a)*s])}
  for(i=12;i>=0;i--){t=i/12;s=Math.sin(t*Math.PI)*wid*(1-t*.25);pts.push([x+Math.cos(a)*len*t+Math.sin(a)*s,y+Math.sin(a)*len*t-Math.cos(a)*s])}P(pts,c);
  if(vein)L(x+Math.cos(a)*len*.1,y+Math.sin(a)*len*.1,x+Math.cos(a)*len*.8,y+Math.sin(a)*len*.8,1,vein,true)}
/* spike / triangle from base center (x,y), pointing at angle a */
function SP(x,y,len,wid,a,c){P([[x-Math.sin(a)*wid,y+Math.cos(a)*wid],[x+Math.cos(a)*len,y+Math.sin(a)*len],[x+Math.sin(a)*wid,y-Math.cos(a)*wid]],c)}
function star(cx,cy,R1,R2,n,c,rot){var p=[];for(var i=0;i<n*2;i++){var a=(rot||-Math.PI/2)+i*Math.PI/n,r=i%2?R2:R1;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}P(p,c)}
function mirror(){for(var y=0;y<N;y++)for(var x=0;x<GX;x++){var a=G[y*N+x],b=G[y*N+N-1-x];if(a&&!b)G[y*N+N-1-x]=a;else if(b&&!a)G[y*N+x]=b}}
/* recolor cells of one slot with a pattern; fn gets grid coords */
function paint(from,to,fn){eachCell(function(x,y){if(G[y*N+x]===from&&fn(x,y))G[y*N+x]=to})}
function sym(fn){var f=FX;FX=false;fn();FX=true;fn();FX=f}

/* ---------- the designs: magical objects, never animals or people. s = stage 0..2.
   Slots: 1 main, 2 second, 3 light, 4 accent, 5 glow, 6 dark detail, 7 extra.
   Rule for every design: no eyes, mouths, ears, limbs or heads, and no pair of dots that could read as eyes. ---------- */
var PI=Math.PI;
function ring(cx,cy,r1,r2,c){E(cx,cy,r1,r1,c);E(cx,cy,r2,r2,0)}
function flame(x,y,h,w,outer,inner){LF(x,y,h,w,-PI/2,outer);LF(x,y+1,h*.6,w*.55,-PI/2,inner)}
var D={
 seedpot:function(s){ // clay pot: sprout, then sapling, then a blossoming tree
   if(s===0){L(24,32,24,22,2,7);LF(24,25,8,3,-2.5,4,3);LF(24,24,8,3,-.6,4,3)}
   if(s===1){L(24,32,24,16,3,7);[-2.6,-2.1,-1.0,-.5,-1.57].forEach(function(a,i){LF(24,18+i%2*4,10,3.5,a,i%2?3:4,6)})}
   if(s===2){L(24,32,24,18,4,7);L(24,24,17,18,2,7);L(24,22,31,16,2,7);E(24,13,13,9,4);E(21,11,8,5,3,true);
     [[17,10],[29,13],[23,7],[31,8],[16,16],[26,17]].forEach(function(p){E(p[0],p[1],1.8,1.8,5)})}
   P([[15,34],[33,34],[30,46],[18,46]],1);R(13,31,22,4,2);paint(1,6,function(x,y){return y===ty(40)|0});E(24,32,8,1.2,6,true)},
 acorntop:function(s){ // spinning top shaped like an acorn
   if(s===2){E(24,33,18,4,5);E(24,33,15,2.5,0)}
   E(24,34,9,9,1);SP(24,41,6,4,PI/2,6);E(24,26,10.5,4.5,2);paint(2,6,function(x,y){return (x+y)%3===0});R(23,18,2,5,7);
   if(s>=1)LF(25,20,8,3,-.5,4,3);if(s===2){LF(23,20,8,3,-2.6,4,3);E(24,33,18,4,5,true)}
   paint(1,3,function(x,y){return x<tx(20)&&y<ty(34)})},
 leafkite:function(s){ // a kite made of leaves, with a bow tail
   var k=6+s*2;P([[24,10],[24+k,10+k*1.5],[24,10+k*3],[24-k,10+k*1.5]],1);L(24,10,24,10+k*3,1,6,true);L(24-k,10+k*1.5,24+k,10+k*1.5,1,6,true);
   paint(1,3,function(x,y){return x<tx(24)&&y<ty(10+k*1.5)});
   var ty0=10+k*3;C([[24,ty0],[18,ty0+5],[28,ty0+9],[22,46]],1,1,6);
   for(var i=0;i<=s;i++){var by=ty0+3+i*4;LF(21+i*2,by,4,2,PI,4);LF(21+i*2,by,4,2,0,4)}
   if(s===2){LF(24,10,6,2.5,-PI/2,4);LF(24+k,10+k*1.5,6,2.5,0,4);LF(24-k,10+k*1.5,6,2.5,PI,4);E(24,10+k*1.5,2,2,5)}},
 candle:function(s){ // a candle, then two candles, then a candelabra
   function cd(x,b,h){R(x-3,b-h,6,h,1);E(x-1,b-h+1,2,2,3);L(x,b-h,x,b-h-2,1,6);flame(x,b-h-2,7,2.6,4,5)}
   if(s===0){cd(24,44,14);R(17,44,14,2,6)}
   if(s===1){cd(19,42,16);cd(29,42,11);E(24,43,11,3,2)}
   if(s===2){R(22,26,4,16,2);E(24,43,10,3,2);C([[24,32],[12,32],[12,26]],2,2,2);C([[24,32],[36,32],[36,26]],2,2,2);cd(12,26,8);cd(36,26,8);cd(24,26,10)}},
 lantern:function(s){ // a paper lantern; more lanterns join as it grows
   function ln(x,y,r){R(x-2,y-r*1.3-2,4,2,6);E(x,y,r,r*1.2,1);E(x,y,r*.6,r*.9,5,true);paint(1,2,function(px,py){return Math.abs(px-tx(x))%3===0&&py>ty(y-r*1.2)&&py<ty(y+r*1.2)});R(x-2,y+r*1.2-1,4,2,6);L(x,y+r*1.2,x,y+r*1.2+4,1,4)}
   if(s===0)ln(24,34,8);
   if(s===1){L(24,10,24,22,1,6);ln(24,32,10)}
   if(s===2){C([[8,10],[24,14],[40,10]],1,1,6);ln(13,22,6);ln(35,22,6);ln(24,33,9)}},
 brazier:function(s){ // a stone fire bowl
   L(17,40,13,46,2,6);L(31,40,35,46,2,6);L(24,40,24,46,2,6);P([[12,32],[36,32],[31,41],[17,41]],1);R(11,30,26,3,2);
   var n=[2,3,5][s];for(var i=0;i<n;i++){var x=24+(i-(n-1)/2)*5;flame(x,31,8+(i%2?0:4)+s*2,3.2,4,5)}
   if(s===2){star(9,18,3,1.2,4,5);star(40,14,2.5,1,4,5)}},
 bubble:function(s){ // soap bubbles that gather into a foamy pile
   function bb(x,y,r){E(x,y,r,r,1);E(x,y,r-1.5,r-1.5,2,true);E(x-r*.4,y-r*.45,r*.25,r*.18,3)}
   if(s===0)bb(24,36,9);
   if(s===1){bb(18,37,8);bb(31,38,7);bb(26,26,6)}
   if(s===2){E(24,44,16,3,3);bb(14,37,7);bb(33,37,8);bb(24,30,9);bb(13,24,4);bb(36,22,5);bb(26,15,4)}},
 paperboat:function(s){ // a folded paper boat that becomes a galleon
   if(s>=1){C([[6,44],[14,42],[24,44],[34,42],[42,44]],2,2,2)}
   if(s===0){P([[12,34],[36,34],[30,43],[18,43]],1);P([[18,34],[24,24],[30,34]],3);L(24,25,24,34,1,6,true)}
   if(s===1){P([[10,34],[38,34],[32,42],[16,42]],1);L(24,34,24,12,2,6);P([[25,13],[36,30],[25,30]],3);P([[23,16],[14,30],[23,30]],3)}
   if(s===2){P([[6,32],[42,32],[36,42],[12,42]],1);paint(1,6,function(x,y){return y===Math.round(ty(36))});L(18,32,18,8,2,6);L(31,32,31,12,2,6);
     P([[19,9],[28,28],[19,28]],3);P([[17,10],[9,28],[17,28]],3);P([[32,13],[40,29],[32,29]],3);P([[31,12],[31,8],[37,10]],4)}},
 fountain:function(s){ // a stone fountain that adds tiers
   P([[8,38],[40,38],[37,46],[11,46]],1);E(24,38,16,2.5,2);
   R(22,28-s*4,4,10+s*4,6);
   if(s>=1){E(24,28-s*4+4,10,2,1);}
   if(s===2){E(24,16,6,1.6,1)}
   var top=28-s*4;C([[24,top],[16,top-6],[12,38]],1.5,1,2);C([[24,top],[32,top-6],[36,38]],1.5,1,2);E(24,top-1,2,3,3);
   [[14,34],[34,33],[20,24],[29,22]].forEach(function(p,i){if(i<2+s)E(p[0],p[1],1,1.4,3)})},
 shell:function(s){ // a spiral seashell (no creature inside)
   E(24,34,12,10,1);for(var i=0;i<3+s;i++){var r=10-i*2.6;E(26-i*.6,34-i*.4,r,r*.8,i%2?1:2,true)}
   SP(14,30,6,2,-2.5,3);SP(18,26,6,2,-2.0,3);SP(26,24,6,2,-1.3,3);if(s===2){SP(34,26,6,2,-.6,3);E(36,42,3,3,5)}
   paint(1,6,function(x,y){return y>ty(42)})},
 battery:function(s){ // a battery cell; later a pair, then a big cell with a coil
   function bt(x,b,w,h){R(x-w/2,b-h,w,h,1);R(x-w/2,b-h*.45,w,h*.2,2);R(x-w/5,b-h-2,w*.4,2,6);P([[x+1,b-h*.85],[x-3,b-h*.5],[x,b-h*.5],[x-1,b-h*.2],[x+3,b-h*.58],[x,b-h*.58]],5)}
   if(s===0)bt(24,46,12,20);
   if(s===1){bt(17,46,10,18);bt(31,46,10,18);C([[17,26],[24,18],[31,26]],1.5,1.5,4)}
   if(s===2){bt(24,46,18,26);R(23,12,2,8,6);for(var i=0;i<4;i++)E(24,13+i*2,5-i*.5,1,4);star(14,12,4,1.2,4,5);star(35,8,3,1,4,5)}},
 bulb:function(s){ // a light bulb with a glowing filament
   var r=7+s*2,cy=26-s*2;E(24,cy,r,r*1.1,3);P([[24-r*.55,cy+r*.7],[24+r*.55,cy+r*.7],[24+r*.4,cy+r*1.3],[24-r*.4,cy+r*1.3]],3);
   R(24-r*.45,cy+r*1.3,r*.9,8,6);paint(6,2,function(x,y){return y%2===0});
   C([[24-r*.3,cy+r*.8],[24-r*.3,cy],[24+r*.3,cy],[24+r*.3,cy+r*.8]],1,1,5);
   if(s>=1)for(var i=0;i<(s===1?4:7);i++){var a=-PI+(i+.5)*PI/(s===1?4:7);SP(24+Math.cos(a)*(r+3),cy+Math.sin(a)*(r+3),4,1.2,a,4)}},
 stormcloud:function(s){ // a rain cloud that grows into a storm
   var w=8+s*3;E(24,20,w,6,1);E(24-w*.6,23,w*.6,5,1);E(24+w*.6,22,w*.65,5.5,1);E(24,25,w*1.2,3.5,2);paint(1,3,function(x,y){return y<ty(17)});
   P([[26,28],[20,36],[25,36],[21,46],[31,33],[26,33],[29,28]],5);
   if(s>=1){[[14,32],[34,31]].forEach(function(p){L(p[0],p[1],p[0]-1,p[1]+4,1,4)})}
   if(s===2){P([[12,28],[9,34],[12,34],[10,40],[16,32],[13,32],[15,28]],5)}},
 gem:function(s){ // a cut gem, a cluster, then a geode
   function gm(x,b,h,w,c){P([[x-w,b-h],[x,b-h-w*1.2],[x+w,b-h],[x+w,b],[x-w,b]],c);L(x,b-h-w,x,b,1,3,true)}
   if(s===0){P([[16,30],[32,30],[36,35],[24,46],[12,35]],1);P([[16,30],[20,35],[28,35],[32,30]],3);L(12,35,36,35,1,2,true);L(24,46,20,35,1,2,true);L(24,46,28,35,1,2,true)}
   if(s===1){E(24,44,14,3,6);gm(18,43,10,3.5,1);gm(30,43,7,3,2);gm(24,43,16,4,1)}
   if(s===2){E(24,38,19,10,6);E(24,36,15,7,7,true);gm(14,42,10,3,1);gm(34,42,9,3,2);gm(24,42,18,4,1);gm(19,42,13,3,2);gm(29,42,14,3,1);star(38,14,3,1,4,5)}},
 prism:function(s){ // a glass pyramid that splits light
   var h=16+s*5,w=10+s*3;P([[24,44-h],[24+w,44],[24-w,44]],1);P([[24,44-h],[24+w,44],[24,44]],2);
   L(2,32,24-w*.5,44-h*.5,1,3);L(24+w*.4,44-h*.4,46,26,1,4);L(24+w*.45,44-h*.35,46,31,1,5);L(24+w*.5,44-h*.3,46,36,1,7);
   if(s===2){P([[9,10],[13,17],[5,17]],1);P([[39,6],[43,13],[35,13]],2)}},
 obelisk:function(s){ // a rune stone pillar with floating rings
   var h=18+s*6;P([[19,46],[29,46],[27,46-h],[21,46-h]],1);P([[21,46-h],[27,46-h],[24,42-h]],2);paint(1,2,function(x,y){return x>=tx(25)});
   for(var i=0;i<2+s;i++)R(23,44-h+6+i*5,2,2,5);
   if(s>=1){E(24,46-h*.6,10,2,4);E(24,46-h*.6,8,1,0);P([[19,46],[29,46],[27,46-h],[21,46-h]],1,true)}
   if(s===2){E(24,46-h*.25,13,2.5,4);E(24,46-h*.25,11,1.3,0)}},
 snowflake:function(s){ // a six-armed snowflake that grows branches
   var r=8+s*4,cy=26;for(var i=0;i<6;i++){var a=i*PI/3,ex=24+Math.cos(a)*r,ey=cy+Math.sin(a)*r;L(24,cy,ex,ey,2,1);
     if(s>=1){var mx=24+Math.cos(a)*r*.55,my=cy+Math.sin(a)*r*.55;L(mx,my,mx+Math.cos(a+.8)*r*.3,my+Math.sin(a+.8)*r*.3,1,2);L(mx,my,mx+Math.cos(a-.8)*r*.3,my+Math.sin(a-.8)*r*.3,1,2)}
     if(s===2)E(ex,ey,1.5,1.5,5)}
   star(24,cy,4,2,6,3,0)},
 icicle:function(s){ // ice spires growing from a frozen base
   E(24,44,8+s*4,3,2);var sp=[[24,22]];if(s>=1)sp.push([17,14],[31,14]);if(s===2)sp.push([11,10],[37,10]);
   sp.forEach(function(p,i){var len=44-p[1]-(i?6:0)+s*2,x=p[0];P([[x-3-(i?0:1),44],[x+3+(i?0:1),44],[x,44-len]],i%2?3:1);L(x,44,x,44-len*.7,1,3,true)});
   if(s===2)star(24,12,3,1,4,5)},
 snowglobe:function(s){ // a snow globe with a little pine tree inside
   var r=9+s*2,cy=30-s*2;E(24,cy,r,r,3);P([[24,cy-r*.5],[24+r*.45,cy+r*.45],[24-r*.45,cy+r*.45]],4);R(23,cy+r*.45,2,3,6);
   [[-.5,-.2],[.4,-.5],[.5,.3],[-.3,.5],[.1,-.75]].forEach(function(p){put(Math.round(tx(24+p[0]*r)),Math.round(ty(cy+p[1]*r)),7,true)});
   E(24-r*.45,cy-r*.45,1.5,1,7);P([[24-r*.9,cy+r*.75],[24+r*.9,cy+r*.75],[24+r,46],[24-r,46]],1);if(s===2){R(24-r,43,r*2,1,5)}},
 pinwheel:function(s){ // a paper pinwheel on a stick
   var cy=20,r=7+s*3;L(24,cy,24,46,2,6);var n=s===2?8:4;
   for(var i=0;i<n;i++){var a=i*2*PI/n;P([[24,cy],[24+Math.cos(a)*r,cy+Math.sin(a)*r],[24+Math.cos(a+PI/n)*r*.75,cy+Math.sin(a+PI/n)*r*.75]],i%2?2:1)}
   E(24,cy,2,2,5);if(s>=1){C([[30,40],[34,36],[40,38]],1,1,3)}},
 balloon:function(s){ // a balloon, a bunch, then a hot-air balloon (empty basket)
   function bl(x,y,r,c){E(x,y,r*.85,r,c);P([[x-1.5,y+r],[x+1.5,y+r],[x,y+r-2]],c);E(x-r*.35,y-r*.4,r*.18,r*.25,3)}
   if(s===0){bl(24,22,8,1);C([[24,31],[21,38],[25,46]],1,1,6)}
   if(s===1){bl(16,20,7,1);bl(31,18,7,2);bl(24,13,6,4);C([[16,28],[22,38],[24,46]],1,1,6);C([[31,26],[26,38],[24,46]],1,1,6);C([[24,20],[24,46]],1,1,6)}
   if(s===2){E(24,18,14,15,1);paint(1,2,function(x,y){return Math.floor((x-tx(10))/4)%2===0});E(20,12,3,4,3,true);L(14,28,19,38,1,6);L(34,28,29,38,1,6);R(18,38,12,8,7);R(18,38,12,2,6)}},
 paperplane:function(s){ // a folded paper plane with a swoosh trail
   var k=.95+s*.25;P([[24-14*k,30],[24+14*k,24],[24-4*k,34]],1);P([[24-14*k,30],[24+14*k,24],[24-2*k,28]],3);L(24-4*k,34,24-3*k,30,1,6);
   C([[24-15*k,32],[10,40],[4,36]],1,1,5);if(s>=1)C([[24-14*k,35],[12,44],[6,42]],1,1,5);if(s===2)star(38,12,3,1,4,4)},
 tornado:function(s){ // a little whirlwind of rings
   var n=5+s*2;for(var i=0;i<n;i++){var y=44-i*(26/n)*(1+s*.3),w=2+i*(s===2?2.2:1.8);E(24+Math.sin(i*1.3)*2,y,w,2.2,i%2?1:2)}
   if(s===2){LF(8,20,5,2,-.5,4);LF(39,30,5,2,2.6,4)}},
 moon:function(s){ // a crescent moon with stars
   var r=10+s*2,cy=24;E(24,cy,r,r,1);E(24+r*.45,cy-r*.3,r*.85,r*.85,0);paint(1,3,function(x,y){return x<tx(24-r*.6)});
   if(s>=1){star(36,32,3,1.2,4,5);star(32,14,2,.8,4,5)}if(s===2){E(24,cy,r+5,2,4);E(24+r*.45,cy-r*.3,r*.85,r*.85,0);star(10,40,2.5,1,4,5)}},
 comet:function(s){ // a glowing comet with a long tail
   var hx=32,hy=30,r=5+s;C([[hx,hy],[20,22],[6,10]],r*1.8,1,1);if(s>=1)C([[hx,hy+2],[18,30],[4,26]],r*1.2,1,2);if(s===2)C([[hx-1,hy-2],[24,12],[16,4]],r,1,2);
   star(hx,hy,r*1.4,r*.7,5,5);star(hx,hy,r*.6,r*.3,5,3)},
 star:function(s){ // a glowing star; later with orbiting sparkles
   var r=s===2?13:9;star(24,28,r,r*.45,5,1);star(24,28,r*.55,r*.25,5,5);if(s===2){star(8,12,3,1,4,4);star(41,40,3,1,4,4);star(40,10,2,.8,4,4)}},
 hourglass:function(s){ // an hourglass of trickling sand
   var h=10+s*2,cy=30-s*2;R(13,cy-h-3,22,3,6);R(13,cy+h,22,3,6);L(15,cy-h,15,cy+h,2,7);L(33,cy-h,33,cy+h,2,7);
   P([[17,cy-h],[31,cy-h],[25,cy],[23,cy]],3);P([[23,cy],[25,cy],[31,cy+h],[17,cy+h]],3);P([[19,cy+h],[29,cy+h],[24,cy+h-5]],1);P([[19,cy-h+3],[29,cy-h+3],[24,cy-1]],1);L(24,cy,24,cy+h-4,1,1);
   if(s===2){star(24,cy-h-6,3,1.2,4,5)}if(cy+h+3<46)R(20,cy+h+3,8,46-cy-h-3,6)},
 sandcastle:function(s){ // a sand castle that gains towers and flags
   function tw(x,w,h){R(x-w/2,46-h,w,h,1);for(var i=0;i<w;i+=3)R(x-w/2+i,46-h-2,2,2,1);L(x,46-h-2,x,46-h-8,1,6);P([[x,46-h-8],[x+5,46-h-6],[x,46-h-4]],4)}
   R(12,36,24,10,2);if(s===0){tw(24,10,14)}if(s>=1){tw(15,8,16);tw(33,8,16)}if(s===2){tw(24,10,24)}R(21,40,6,6,6);paint(1,3,function(x,y){return (x+y*3)%7===0})},
 urn:function(s){ // a desert urn with a swirl of glowing sand
   var r=8+s*3;E(24,34,r,r*.9,1);R(24-r*.45,34-r*1.4,r*.9,r*.6,1);R(24-r*.6,34-r*1.5,r*1.2,2,6);paint(1,2,function(x,y){return Math.abs(y-ty(34))<=1});R(24-r*.4,34+r*.85,r*.8,46-34-r*.85,6);
   if(s===2){C([[16,34-r*1.1],[10,30],[13,24]],1.5,1.5,1);C([[32,34-r*1.1],[38,30],[35,24]],1.5,1.5,1);C([[24,34-r*1.5],[18,8],[30,12],[24,4]],1.5,1,5)}},
 cog:function(s){ // a gear; then meshed gears
   function gr(x,y,r,c){for(var i=0;i<8;i++){var a=i*PI/4;P([[x+Math.cos(a-.2)*r,y+Math.sin(a-.2)*r],[x+Math.cos(a-.14)*(r+3),y+Math.sin(a-.14)*(r+3)],[x+Math.cos(a+.14)*(r+3),y+Math.sin(a+.14)*(r+3)],[x+Math.cos(a+.2)*r,y+Math.sin(a+.2)*r]],c)}E(x,y,r,r,c);E(x,y,r*.6,r*.6,6,true);E(x,y,r*.25,r*.25,0)}
   if(s===0)gr(24,34,8,1);
   if(s===1){gr(18,36,7,1);gr(32,27,6,2)}
   if(s===2){gr(22,34,9,1);gr(37,22,6,2);gr(10,20,5,2);R(34,30,3,16,7)}},
 spring:function(s){ // a coiled spring on a base
   var n=3+s*2,top=40-n*4;R(14,43,20,3,6);for(var i=0;i<n;i++){var y=42-i*4;L(16,y,32,y-2,2,i%2?2:1);L(32,y-2,16,y-4,2,i%2?1:2)}
   E(24,top-2,5,3,4);E(23,top-3,2,1,3)},
 propeller:function(s){ // a little flying rotor machine
   E(24,30,7,5,1);R(18,27,12,1,3,true);R(22,35,4,3,6);L(18,38,30,38,1,6);var rs=s===0?[[24,22]]:s===1?[[14,22],[34,22]]:[[11,20],[37,20],[16,14],[32,14]];
   rs.forEach(function(p){L(24,28,p[0],p[1]+2,1.5,6);E(p[0],p[1],7,1.4,3);R(p[0]-1,p[1]-1,2,3,6)});if(s===2)E(24,33,2,1,5)},
 key:function(s){ // a magic key
   var r=s===2?8:6;E(24,14+r,r,r,1);E(24,14+r,r*.5,r*.5,0);R(22,14+r*2,4,46-14-r*2,1);R(26,38,6,3,2);R(26,43,4,3,2);
   if(s===2){P([[24,27],[27,31],[24,35],[21,31]],5);star(14,8,2,1,4,4);star(36,12,2,1,4,4)}},

 /* legendaries */
 sunforge:function(){R(12,38,24,8,6);P([[8,34],[40,34],[34,38],[14,38]],6);R(12,32,24,3,2);E(24,16,9,9,5);E(22,14,4,4,3);for(var i=0;i<10;i++){var a=i*PI/5;SP(24+Math.cos(a)*11,16+Math.sin(a)*11,5,1.6,a,4)}},
 tidegate:function(){R(6,14,8,32,6);R(34,14,8,32,6);P([[4,14],[44,14],[40,6],[8,6]],2);E(24,30,10,14,1);paint(1,3,function(x,y){return (y+Math.floor(x/3))%4===0});E(24,46,14,2,3);star(24,10,2.5,1,4,5)},
 stormcrown:function(){P([[10,34],[38,34],[40,18],[32,26],[24,12],[16,26],[8,18]],1);R(10,32,28,4,2);E(24,30,2,2,5);E(15,30,1.5,1.5,4);E(33,30,1.5,1.5,4);
   P([[8,16],[5,10],[8,10],[6,4],[12,12],[9,12],[11,16]],5);P([[40,16],[43,10],[40,10],[42,4],[36,12],[39,12],[37,16]],5);P([[24,10],[22,4],[26,4]],5);C([[18,40],[24,44],[30,40]],1,1,4)},
 elderbough:function(){C([[24,46],[23,34],[24,24]],8,5,7);C([[24,30],[12,24]],3,2,7);C([[24,28],[37,21]],3,2,7);C([[20,46],[12,46]],3,1,7);C([[28,46],[37,46]],3,1,7);
   E(24,14,18,11,4);E(14,20,8,6,4);E(35,19,8,6,4);E(20,10,9,5,3,true);[[10,18],[18,8],[30,7],[38,16],[24,18],[33,12],[14,13]].forEach(function(p){E(p[0],p[1],1.8,1.8,5)})},
 eclipsar:function(){E(24,24,17,17,5);E(24,24,13,13,6);paint(6,7,function(x,y){return (x+y)%4===0});for(var i=0;i<12;i++){var a=i*PI/6;SP(24+Math.cos(a)*17,24+Math.sin(a)*17,5,1.5,a,4)}R(20,42,8,4,2);L(24,41,24,44,2,2)},
 skygalleon:function(){E(24,13,16,10,1);paint(1,2,function(x,y){return Math.floor((x-4)/5)%2===0});E(18,8,4,3,3,true);L(12,20,14,30,1,6);L(36,20,34,30,1,6);L(24,22,24,30,1,6);
   P([[6,30],[42,30],[36,40],[12,40]],7);R(6,30,36,2,6);P([[34,40],[42,30],[46,34]],7);LF(8,32,7,2.5,PI-.3,3);LF(40,32,7,2.5,.3,3)}
};

/* ---------- the dex ---------- */
var TYPES={
  sprout:{name:"Sprout",color:"#3FAE5A"}, flame:{name:"Flame",color:"#E8573A"}, wave:{name:"Wave",color:"#3C8CE0"},
  bolt:{name:"Bolt",color:"#D9A400"}, crystal:{name:"Crystal",color:"#B264D8"}, frost:{name:"Frost",color:"#4FAFE0"},
  breeze:{name:"Breeze",color:"#33B5A5"}, dusk:{name:"Dusk",color:"#5A4FB0"}, sand:{name:"Sand",color:"#C98A3A"}, gear:{name:"Gear",color:"#6F7F96"}
};
var PAL={ // per design: [main, second, light, accent, glow, dark detail, extra]
 seedpot:["#D9774A","#B85A34","#9BE07A","#4FB65A","#FF8FC0","#5A3A28","#8A5A36"],
 acorntop:["#C98A4A","#7A5232","#F2C894","#5FBF5A","#FFE36B","#4A3020","#6A4426"],
 leafkite:["#5FBF5A","#3E9A45","#A8EB8A","#F2A93B","#FFE36B","#2E6B34","#000000"],
 candle:["#FFF2D6","#C9A15A","#FFFFFF","#FF8A2E","#FFE36B","#6A4A30","#000000"],
 lantern:["#E8503A","#B83A28","#FFB0A0","#F2C230","#FFD36B","#5A3428","#000000"],
 brazier:["#8C7A6B","#6A5A4E","#C9B8A8","#FF7A2E","#FFE36B","#3E322D","#000000"],
 bubble:["#7FC8F0","#D9F2FF","#FFFFFF","#B6E3FF","#FFFFFF","#3C7AB0","#000000"],
 paperboat:["#F4F0E6","#5AA8E8","#FFFFFF","#E8503A","#FFE36B","#A89F8E","#000000"],
 fountain:["#B8C2CC","#5AA8E8","#E6F6FF","#7A8794","#FFFFFF","#6A7682","#000000"],
 shell:["#F2B8A0","#E8907A","#FFF0E6","#F7D2C2","#FFF7D6","#B8705A","#000000"],
 battery:["#3C6CF0","#F2C230","#9DB8FF","#FFE36B","#FFF27A","#2A2F3E","#000000"],
 bulb:["#FFF6C9","#B8C2CC","#FFFDF2","#FFE36B","#FF9A2E","#7A8794","#000000"],
 stormcloud:["#8E9BB3","#5E6A85","#C6CFDE","#9ED8FF","#FFE14D","#3E4660","#000000"],
 gem:["#B264D8","#8A44B8","#E8C2FF","#F2C230","#FFFFFF","#6A5A6E","#3E2E52"],
 prism:["#BFEAFF","#8FCDEA","#FF6B6B","#FFC43D","#5FD068","#4E7A94","#6B8BFF"],
 obelisk:["#8C8FA8","#6A6E88","#C2C4D6","#7AE0FF","#7AE0FF","#3E405A","#000000"],
 snowflake:["#BFE6FF","#8FCDEA","#FFFFFF","#FFFFFF","#FFFFFF","#4E7A94","#000000"],
 icicle:["#A8DCF5","#7FBFE6","#E8F8FF","#FFFFFF","#FFFFFF","#4E7A94","#000000"],
 snowglobe:["#7A5A8E","#5A3E6E","#DDF2FF","#3E9A6A","#FFE36B","#5A3A28","#FFFFFF"],
 pinwheel:["#FF6B8A","#4DBFAF","#FFFFFF","#FFC43D","#FFE36B","#8A6A4A","#000000"],
 balloon:["#FF6B6B","#4DBFAF","#FFFFFF","#FFC43D","#FFE36B","#6A5A4E","#B8865A"],
 paperplane:["#F4F0E6","#C9C2B2","#FFFFFF","#FFC43D","#9ED8FF","#8E8676","#000000"],
 tornado:["#9ED8D0","#6ABFB4","#E6FFFA","#5FBF5A","#FFFFFF","#3E7A72","#000000"],
 moon:["#F2E08A","#D9C25A","#FFF8D2","#7A70D8","#FFF27A","#8A7A3A","#000000"],
 comet:["#7A70D8","#A99CFF","#FFFFFF","#FFE36B","#FFF6C9","#3E3880","#000000"],
 star:["#FFC43D","#E8A21A","#FFF2B0","#FFE36B","#FFFDF2","#A8740E","#000000"],
 hourglass:["#E8B85A","#C9963A","#E6F6FF","#FFE36B","#FFE36B","#6A4A30","#9A6A40"],
 sandcastle:["#E8C27A","#D2A85E","#F7DEA8","#E8503A","#FFE36B","#8A6A3A","#000000"],
 urn:["#C9743A","#8A4A24","#F2B07A","#FFE36B","#FFD36B","#5A3420","#000000"],
 cog:["#9AA6B8","#C2A04A","#DDE4EE","#FFC43D","#FFE36B","#5A6476","#6A4A30"],
 spring:["#B8C2CC","#8E98A6","#FFFFFF","#E8503A","#FFE36B","#4E5866","#000000"],
 propeller:["#5AA8E8","#3C7AB0","#FFFFFF","#C9D2DE","#7AE0FF","#4E5866","#000000"],
 key:["#E8B830","#C9921A","#FFF2B0","#FFE36B","#7AE0FF","#8A6A1A","#000000"],
 sunforge:["#000000","#7A6A5E","#FFFDF2","#FF9A2E","#FFD23D","#4A3E36","#000000"],
 tidegate:["#3C8CE0","#8E86A8","#BFE6FF","#000000","#FFFFFF","#6A6280","#000000"],
 stormcrown:["#F2C230","#C9921A","#FFF2B0","#7AE0FF","#FFF27A","#8A6A1A","#000000"],
 elderbough:["#000000","#000000","#9BE07A","#4FB65A","#FF8FC0","#000000","#7A5232"],
 eclipsar:["#000000","#5A4FB0","#000000","#FFC43D","#FFE36B","#2A2450","#3E3880"],
 skygalleon:["#FF6B6B","#FFE36B","#FFFFFF","#F4F0E6","#FFE36B","#5A3A28","#9A6A40"]
};
/* [design, type, names (one per stage)]: 28 three-stage lines, 5 two-stage lines, 6 legendaries = 100 */
var LINES=[
 ["seedpot","sprout",["Seedpot","Saplot","Blossomore"]],["candle","flame",["Wickit","Twinwick","Candelabrix"]],["bubble","wave",["Blub","Bubblet","Foamcastle"]],
 ["acorntop","sprout",["Twirlnut","Spinacorn","Oakspinner"]],["leafkite","breeze",["Kitelet","Leafkite","Galeglider"]],["lantern","flame",["Glowpop","Lanternette","Festolume"]],
 ["pinwheel","breeze",["Whirly","Pinwheeler","Cyclowhirl"]],["paperboat","wave",["Foldy","Sailfold","Origalleon"]],["sandcastle","sand",["Castlet","Sandkeep","Dunefort"]],
 ["hourglass","sand",["Sandtick","Hourgleam","Chronodune"]],["gem","crystal",["Shardlet","Gemcluster","Geodome"]],["brazier","flame",["Coalcup","Firebowl","Pyrecrown"]],
 ["battery","bolt",["Zapcell","Duocell","Megavolt"]],["cog","gear",["Cogling","Twincog","Megacog"]],["bulb","bolt",["Glimbulb","Brightbulb","Luminator"]],
 ["spring","gear",["Boing","Coilspring","Pogospire"]],["prism","crystal",["Prismo","Rainbeam","Spectrapex"]],["moon","dusk",["Crescling","Moonhook","Lunarch"]],
 ["snowflake","frost",["Flurry","Flakewheel","Hexafrost"]],["icicle","frost",["Icetip","Spirefrost","Glacispire"]],["fountain","wave",["Splishy","Fountling","Cascadria"]],
 ["snowglobe","frost",["Globit","Snowdome","Wintersphere"]],["obelisk","crystal",["Runestub","Runepillar","Obeliskar"]],["comet","dusk",["Streaklet","Cometail","Novastreak"]],
 ["propeller","gear",["Rotorbit","Twinrotor","Skyrotor"]],["stormcloud","bolt",["Drizzap","Stormpuff","Tempestra"]],["balloon","breeze",["Floaty","Bunchloon","Skyvoyager"]],
 ["paperplane","breeze",["Zippaper","Glidefold","Jetfold"]],
 ["shell","wave",["Swirlshell","Spiralux"]],["urn","sand",["Urnlet","Sandswirl"]],["star","dusk",["Twinklet","Starburst"]],["tornado","breeze",["Twistle","Cyclonix"]],["key","gear",["Keylet","Masterkey"]]
];
var LEGENDS=[["sunforge","flame","Solforge"],["stormcrown","bolt","Stormcrown"],["tidegate","wave","Tidegate"],["skygalleon","breeze","Skygalleon"],["eclipsar","dusk","Eclipsar"],["elderbough","sprout","Elderbough"]];
var DEX=[];
LINES.forEach(function(L,li){var three=L[2].length===3;
  L[2].forEach(function(nm,st){var stage=three?st:(st?2:0);
    DEX.push({id:DEX.length+1,name:nm,design:L[0],type:L[1],stage:stage,line:li,
      evolvesAt:three?(st===0?14:st===1?30:0):(st===0?22:0),
      rarity:st===0?(li<18?"common":"uncommon"):st===1&&three?"uncommon":"rare"})})});
LEGENDS.forEach(function(L,i){DEX.push({id:DEX.length+1,name:L[2],design:L[0],type:L[1],stage:3,line:100+i,evolvesAt:0,rarity:"legendary"})});

/* ---------- picture art (optional) ----------
   If art/cq2/manifest.js lists a picture for a creature (window.CQ2_ART = {"<id>": "art/cq2/<file>.png"}),
   that picture is drawn instead of the code-drawn sprite. Every picture must be checked for faces first. */
var IMG={},ART=global.CQ2_ART||{},listeners=[];
Object.keys(ART).forEach(function(id){var im=new Image();im.onload=function(){IMG[id]=im;listeners.forEach(function(f){f()})};im.src=ART[id]});
function onArt(f){listeners.push(f)}

/* ---------- render ---------- */
function hex(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function mix(a,b,t){return [0,1,2].map(function(i){return Math.round(a[i]+(b[i]-a[i])*t)})}
var cache={};
function build(c){if(cache[c.id])return cache[c.id];
  G=[];for(var i=0;i<N*N;i++)G.push(0);K=c.stage>=2?1:c.stage===1?.84:.68;FX=false;
  D[c.design](Math.min(c.stage,2));K=1;
  var pal=PAL[c.design].map(hex),W=[255,255,250],INK=[22,20,40],out=[];
  for(var y=0;y<N;y++)for(var x=0;x<N;x++){var v=G[y*N+x],idx=y*N+x;
    if(!v){var nb=[at(x-1,y),at(x+1,y),at(x,y-1),at(x,y+1)].filter(Boolean);if(nb.length){out[idx]=mix(pal[nb[0]-1],INK,.72)}continue}
    var base=pal[v-1],edgeUL=at(x,y-1)!==v||at(x-1,y)!==v,edgeDR=at(x,y+1)!==v||at(x+1,y)!==v,
      in2UL=at(x,y-2)!==v||at(x-2,y)!==v,in2DR=at(x,y+2)!==v||at(x+2,y)!==v,chk=(x+y)%2===0,t=0;
    if(edgeDR)t=-.32;else if(edgeUL)t=.3;else if(in2DR&&chk)t=-.16;else if(in2UL&&chk)t=.14;
    out[idx]=t>0?mix(base,W,t):t<0?mix(base,INK,-t):base}
  return cache[c.id]=out}
var silCanvas=null;
function draw(ctx,c,px,ox,oy,silhouette){px=px||3;ox=ox||0;oy=oy||0;
  var im=IMG[c.id];
  if(im){var sz=N*px;ctx.imageSmoothingEnabled=false;
    if(!silhouette){ctx.drawImage(im,ox,oy,sz,sz);return}
    silCanvas=silCanvas||document.createElement("canvas");silCanvas.width=silCanvas.height=sz;var s=silCanvas.getContext("2d");s.clearRect(0,0,sz,sz);s.imageSmoothingEnabled=false;
    s.drawImage(im,0,0,sz,sz);s.globalCompositeOperation="source-in";s.fillStyle="rgba(60,70,110,.85)";s.fillRect(0,0,sz,sz);s.globalCompositeOperation="source-over";ctx.drawImage(silCanvas,ox,oy);return}
  var o=build(c);
  for(var i=0;i<o.length;i++){var col=o[i];if(!col)continue;ctx.fillStyle=silhouette?"rgba(60,70,110,.85)":"rgb("+col[0]+","+col[1]+","+col[2]+")";ctx.fillRect(ox+(i%N)*px,oy+Math.floor(i/N)*px,px,px)}}
global.Creatures2={DEX:DEX,TYPES:TYPES,draw:draw,onArt:onArt,SIZE:N,RARITY:{common:"Common",uncommon:"Uncommon",rare:"Rare",legendary:"Legendary"}};
})(window);
