/* Word Workshop creatures: 100 faceless pixel creatures, drawn in code.
   Every evolution line has its own hand-made design built from shapes on a 48x48 grid,
   then shaded, dithered and outlined like pixel art. Nothing gets eyes, mouths or ears:
   heads are plain shapes, and spots and patterns stay off where a face would be. */
(function(global){
"use strict";
var N=48, GX=24, GY=46;

var TYPES={
  leaf:{name:"Leaf",color:"#3FAE5A"}, ember:{name:"Ember",color:"#E8573A"}, tide:{name:"Tide",color:"#3C8CE0"},
  spark:{name:"Spark",color:"#E9B500"}, stone:{name:"Stone",color:"#8D7B68"}, frost:{name:"Frost",color:"#5BB5E6"},
  gust:{name:"Gust",color:"#4DBFAF"}, shade:{name:"Shade",color:"#6A57B8"}, bloom:{name:"Bloom",color:"#EC6FA6"}, metal:{name:"Metal",color:"#7C8DA3"}
};

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

/* ---------- the 42 designs. s = stage 0..2. Slots: 1 main, 2 second, 3 light/belly, 4 accent, 5 glow, 6 dark detail, 7 extra ---------- */
var D={
 sprout:function(s){ // seed bulb that grows leaves, then a flower crown
   E(24,38,10,8,1);E(24,41,7,4,3,true);R(17,43,4,3,1);R(27,43,4,3,1);
   if(s===0){LF(24,31,10,3.5,-1.9,2,6);LF(24,31,8,3,-1.1,2,6)}
   if(s>=1){LF(22,31,13,4,-2.3,2,6);LF(26,31,13,4,-.85,2,6);LF(16,37,9,3,2.8,2,6);LF(32,37,9,3,.35,2,6)}
   if(s===2){for(var i=0;i<7;i++)LF(24,26,9,3.2,-Math.PI/2+(i-3)*.42,4,7);E(24,26,3.5,3,5)}
   paint(1,6,function(x,y){return y>41&&(x+y)%5===0})},
 moth:function(s){ // leaf-winged moth: the wings grow from buds to four big patterned leaves
   sym(function(){LF(23,28,10+s*4,5+s*1.2,-2.6,2,6);if(s>0)LF(23,32,8+s*3,4+s,2.5,1,6);if(s===2)L(21,22,17,13,1,6)});
   C([[24,20],[24,30],[24,40]],5-(s===0?1:0),3,3);paint(3,4,function(x,y){return y%3===0});
   paint(2,7,function(x,y){return (x*3+y*5)%11===0});if(s===2){E(13,27,2,2,5,true);E(35,27,2,2,5,true)}},
 turtle:function(s){ // mossy turtle; by stage 3 a little tree grows on its shell
   R(12,38,4,6,2);R(31,38,4,6,2);E(38,36,5,4,2);E(24,34,14,9,1);R(9,35,30,10,0);E(24,34,14,9,1);eachCell(function(x,y){if(y>ty(37)&&G[y*N+x]===1)G[y*N+x]=0});
   L(10,37,38,37,3,3);paint(1,6,function(x,y){return (x+y*2)%9===0||(x-y*2+90)%9===0});
   E(24,26,9+s*2,3+s,4,true);for(var i=0;i<4+s*2;i++)E(14+i*(20/(3+s*2)),26-((i%2)*2),2.5,2,4,true);
   if(s>=1){C([[24,26],[23,20],[25,14+(s===2?-4:0)]],3,2,7)}if(s===2){E(25,10,7,5,4);E(20,13,4,3,4);E(30,13,4,3,4);E(24,9,3,2,5,true)}},
 cactus:function(s){ // cactus buddy with arms and a flower
   var h=s?30:22;R(18,46-h,12,h-2,1);E(24,46-h,6,4,1);R(18,42,12,4,2);
   C([[19,30],[12,30],[12,22]],4,4,1);if(s)C([[29,34],[36,34],[36,25]],4,4,1);
   paint(1,3,function(x,y){return (x+y*3)%7===0&&y<ty(42)});paint(1,2,function(x,y){return x===Math.round(tx(24))});
   if(s){for(var i=0;i<5;i++)LF(24,46-h-2,5,2,-Math.PI/2+(i-2)*.7,4);E(24,46-h-2,1.8,1.6,5)}else E(12,21,2.5,2,4)},
 flame:function(s){ // flame spirit with layers; big form has orbiting embers
   var w=7+s*2,h=18+s*6;P([[24-w,44],[24-w-1,36],[24-w+2,30],[24-w+1,24],[24-3,28],[24-2,46-h],[24+2,30],[24+w-1,46-h+6],[24+w,32],[24+w+1,40],[24+w-1,45],[24,46]],1);
   P([[24-w+3,44],[24-w+3,36],[24-2,32],[24,46-h+8],[24+3,34],[24+w-3,40],[24+w-3,44]],4,true);E(24,40,w-3,4,5,true);
   if(s===2){E(9,22,2,2,4);E(39,18,2,2,4);E(40,34,1.5,1.5,5);E(8,36,1.5,1.5,5)}if(s>0)E(14,16+s,1.5,1.5,4)},
 fox:function(s){ // lava fox: four legs, flame tail, no ears, no face
   var bw=12+s*1.5;E(23,33,bw,6+s*.5,1);[15,19,27,31].forEach(function(x,i){R(x-1.5,36,3+(s>1?1:0),9,i%2?1:2);R(x-2,43,4+(s>1?1:0),2,6)});
   E(35+s,26-s,6+s*.6,5+s*.4,1);P([[38+s,24],[45+s*.5,27],[38+s,30]],1);E(23,36,9,3,3,true);
   C([[11,31],[3,25],[5,14-s*2]],5+s,3,4);C([[10,31],[5,26],[7,18-s*2]],2.5,1,5);
   for(var i=0;i<2+s;i++)SP(30+i*3,26-s,5+s,2,-1.9+i*.25,4)},
 beetle:function(s){ // ember beetle: dome shell with glowing cracks and a horn
   for(var i=0;i<3;i++){L(16+i*6,38,12+i*7,45,1.6,6);L(32-i*6+ (i===0?0:0),38,36-i*7+ (i===2?2:0),45,1.6,6)}
   E(24,34,13+s*2,10+s,1);R(8,34,32,12,0);E(24,34,13+s*2,10+s,1);eachCell(function(x,y){if(y>ty(37)&&G[y*N+x]===1)G[y*N+x]=0});R(10,36,28,3,2);
   E(38+s*2,33,4,3,2);C([[39+s*2,31],[43+s*2,25],[41+s*2,19-s*3]],3,1.5,4);
   C([[24,25-s],[22,30],[26,33],[23,37]],1.2,1.2,5,true);C([[16,30],[19,32],[18,36]],1,1,5,true);C([[31,28],[29,33],[32,36]],1,1,5,true)},
 phoenix:function(s){ // cinder bird with flame feathers, no beak
   sym(function(){for(var i=0;i<2+s;i++)LF(19,27,10+s*3-i*2,3.4,-2.5+i*.45,i%2?4:1,i%2?0:6)});
   E(24,30,7+s,8+s,1);E(24,33,4+s*.5,5,3,true);E(24,20-s,4.5+s*.4,4.5+s*.4,1);for(var j=0;j<1+s;j++)SP(24+(j-s/2)*3,15-s*1.5,5+s,1.5,-Math.PI/2+(j-s/2)*.4,4);
   for(var k=0;k<3+s;k++)LF(24,37+s,8+s*3,2.4,Math.PI/2+(k-(2+s)/2)*.35,k%2?5:4);R(21,44,2,2,6);R(25,44,2,2,6)},
 magma:function(s){ // magma slime with rocks on top and lava drips
   E(24,37,12+s*3,9+s,1);R(10,37,28,8,1);E(24,45,13+s*3,2,1);paint(1,4,function(x,y){return (x*7+y*3)%13<2});
   E(18,29-s,4,3,6);E(28,28-s,5,3.5,6);if(s)E(24,25-s,3,2.5,6);paint(6,7,function(x,y){return (x+y)%4===0});
   L(13,38,13,44,2,5);L(33,36,33,44,2,5);E(24,40,6,3,5,true)},
 droplet:function(s){ // water drop slime with a wave crest
   var r=8+s*2;E(24,46-r,r,r,1);P([[24-r*.87,46-r*1.4],[24,46-r*2-6-s*2],[24+r*.87,46-r*1.4]],1);E(24,46-r*.6,r*.6,r*.35,3,true);
   if(s>0)C([[24,46-r*2-4-s*2],[30,46-r*2-2],[34,46-r*2+2],[31,46-r*2+5]],3,1.5,2);if(s===2){E(12,30,2,2,2);E(37,24,1.5,1.5,2);C([[10,40],[14,37],[18,40]],2,2,3)}
   paint(1,4,function(x,y){return y===Math.round(ty(46-r*1.1))})},
 jelly:function(s){ // jellyfish with a frilly bell and long tentacles
   var w=9+s*2;E(24,18,w,8+s,1);R(24-w,18,w*2,9,0);E(24,18,w,8+s,1);eachCell(function(x,y){if(y>ty(19)&&G[y*N+x]===1)G[y*N+x]=0});
   for(var i=0;i<5+s;i++){var x=24-w+1+i*(2*w-2)/(4+s);E(x,19,2,1.6,2)}
   for(var j=0;j<4+s;j++){var xx=24-w+3+j*(2*w-6)/(3+s);C([[xx,20],[xx+(j%2?3:-3),28],[xx,36],[xx+(j%2?-2:2),44-((j%2)*4)]],2,1,j%2?4:3)}
   E(24,13,w*.5,3,3,true);paint(1,5,function(x,y){return (x*5+y*7)%17===0})},
 snail:function(s){ // tide snail with a big spiral shell
   C([[6,44],[20,46],[36,44],[43,38]],6,5,3);C([[43,38],[45,32]],4,3,3);
   var r=10+s*3;E(24,33-s,r,r,1);var pts=[];for(var i=0;i<=60;i++){var a=i/60*Math.PI*4.2,rr=r*(1-i/70);pts.push([24+Math.cos(a)*rr*.85,33-s+Math.sin(a)*rr*.85])}
   for(var k=0;k<pts.length-1;k++)L(pts[k][0],pts[k][1],pts[k+1][0],pts[k+1][1],1.4,2,true);if(s)paint(1,4,function(x,y){return (x+y)%7===0})},
 fish:function(s){ // finned swimmer, gets a long crest and whale size
   var w=12+s*3,h=6+s*1.5;E(22,30,w,h,1);E(22,33,w*.8,h*.45,3,true);P([[22+w-2,30],[44,22-s],[42,30],[44,38+s]],2);
   P([[16,30-h+1],[22,30-h-6-s*2],[28,30-h+1]],2);P([[18,30+h-1],[22,30+h+4],[24,30+h-1]],2);
   paint(1,6,function(x,y){return ((x+y)%4===0)&&x>tx(16)});if(s===2){for(var i=0;i<4;i++)SP(10+i*5,30-h+1,5,1.5,-Math.PI/2-.3,4)}L(12,30,8,30,1,4,true)},
 firefly:function(s){ // lightning bug with a glowing tail
   sym(function(){E(17-s,22,6+s*1.5,3+s,7,false,-.5);if(s)E(17-s,28,5+s,2.5,7,false,.4)});
   E(24,22,4,4,1);E(24,30,5+s,6+s,5);paint(5,4,function(x,y){return y%3===0});E(24,16,3.5,3,1);
   sym(function(){C([[23,14],[20,8],[17,7]],1,1,6);L(19,25,15,32,1,6)});if(s===2)star(24,30,3,1.4,4,3)},
 hedgehog:function(s){ // spark hedgehog with zigzag spikes, round and tail-heavy
   var r=9+s*2;for(var i=0;i<7+s*2;i++){var a=-Math.PI*.95+i*Math.PI*.9/(6+s*2);SP(24+Math.cos(a)*r*.8,38+Math.sin(a)*r*.8,6+s*2,2.4,a,i%2?4:1)}
   E(24,38,r,r*.8,1);E(24,41,r*.7,r*.4,3,true);R(17,43,4,3,6);R(27,43,4,3,6);E(24+r,40,3,2.5,3);
   if(s===2)C([[10,30],[7,26],[9,22],[6,18]],2,1,5)},
 stormcloud:function(s){ // thunder cloud with a lightning bolt
   E(17,20,8+s,6+s,1);E(28,17,9+s,8+s,1);E(23,24,13+s*2,5,1);E(24,21,8,4,3,true);
   P([[22,27],[29,27],[25,33],[30,33],[19,45-s*0],[23,35],[18,35]],4);if(s){P([[34,27],[38,27],[36,31],[39,31],[33,39],[35,33],[32,33]],5);paint(1,2,function(x,y){return y>ty(24)})}},
 orb:function(s){ // tesla orb floating inside rings
   E(24,26,8+s,8+s,1);E(21,23,3,2.5,3,true);E(24,26,15+s*2,3+s,4);E(24,26,13+s*2,1.5+s*.5,0);E(24,26,8+s,8+s,1);E(21,23,3,2.5,3,true);
   E(24,26,4,4,5,true);if(s){E(24,26,3,15,2);E(24,26,1.5,13,0);E(24,26,8+s,8+s,1);E(24,26,4,4,5,true)}E(24,44,8,1.5,6);
   paint(1,7,function(x,y){return (x+y)%6===0})},
 golem:function(s){ // pebble golem, gets crystals on its shoulders
   E(24,33,9+s,9+s,1);E(24,20-s,5+s*.5,5,1);E(13-s,30,4+s*.5,6,2);E(35+s,30,4+s*.5,6,2);E(13-s,38,3.5,3,2);E(35+s,38,3.5,3,2);
   R(17,40,5,6,2);R(26,40,5,6,2);paint(1,6,function(x,y){return (x*3+y*5)%11===0});paint(2,6,function(x,y){return (x*5+y)%9===0});
   E(24,34,4,4,3,true);if(s===2){SP(12,24,7,2,-2,5);SP(14,23,5,1.5,-1.4,4);SP(36,24,7,2,-1.1,5);SP(34,23,5,1.5,-1.7,4)}if(s)SP(24,15,4,2,-Math.PI/2,4)},
 geode:function(s){ // rock with crystals bursting out
   E(24,36,13+s*2,9+s,1);paint(1,6,function(x,y){return (x+y*3)%10===0});
   for(var i=0;i<4+s*2;i++){var x=14+i*(20/(3+s*2));SP(x,32,9+((i%2)?3:7)+s*2,2.5,-Math.PI/2+(i-2)*.2,i%2?4:5)}E(24,40,6,3,2,true)},
 armadillo:function(s){ // banded armadillo roller
   E(24,34,13+s*2,9+s,1);R(9,35,32,12,0);E(24,34,13+s*2,9+s,1);eachCell(function(x,y){if(y>ty(37)&&G[y*N+x]===1)G[y*N+x]=0});
   paint(1,2,function(x,y){return (x%5)===0});R(14,37,3,7,3);R(30,37,3,7,3);E(38+s*2,35,5,3.5,3);C([[11-s,34],[4,38],[3,43]],3,1,2);
   if(s===2)for(var i=0;i<5;i++)SP(16+i*4,25-(i%2),4,1.5,-Math.PI/2,4)},
 snowflake:function(s){ // snowflake spirit, more branches as it grows
   var R1=8+s*5;for(var i=0;i<6;i++){var a=i*Math.PI/3-Math.PI/2,ex=24+Math.cos(a)*R1,ey=26+Math.sin(a)*R1;L(24,26,ex,ey,2.2,1);
     if(s>0){var mx=24+Math.cos(a)*R1*.55,my=26+Math.sin(a)*R1*.55;L(mx,my,mx+Math.cos(a+.8)*4,my+Math.sin(a+.8)*4,1.5,2);L(mx,my,mx+Math.cos(a-.8)*4,my+Math.sin(a-.8)*4,1.5,2)}E(ex,ey,1.6,1.6,3)}
   star(24,26,5+s,2.5,6,3,0);E(24,26,2,2,4,true)},
 penguin:function(s){ // frost bird: icicle crest, no beak
   E(24,32,8+s,11+s,1);E(24,35,5+s,8+s,3,true);sym(function(){LF(16-s,28,9+s*2,2.5,1.9,2)});E(24,19-s,6+s*.5,5.5,1);
   for(var i=0;i<2+s;i++)SP(24+(i-(1+s)/2)*3.5,15-s,4+s*2,1.5,-Math.PI/2+(i-(1+s)/2)*.3,4);R(19,43,4,2,6);R(25,43,4,2,6);
   if(s===2)E(24,24,6,1.5,5,true)},
 stag:function(s){ // frost stag with ice antlers
   E(23,30,11,6,1);[16,20,27,31].forEach(function(x){R(x-1,33,3,11,1);R(x-1.5,42,4,3,6)});C([[32,28],[35,22],[36,18]],5,4,1);E(37,17,4,3,1);
   E(23,33,8,2.5,3,true);C([[36,15],[33,8],[30,3]],1.8,1.2,4);C([[37,15],[40,8],[44,4]],1.8,1.2,4);L(34,10,30,9,1.4,4);L(39,10,43,10,1.4,4);
   if(s){L(32,6,28,5,1.2,5);L(41,6,45,7,1.2,5);paint(1,2,function(x,y){return (x+y)%5===0&&y<ty(30)})}C([[12,28],[9,26]],3,2,3)},
 yeti:function(s){ // snow mound covered in fur
   E(24,32,11+s*2,13+s,1);for(var i=0;i<12;i++){var a=Math.PI+i*Math.PI/11;SP(24+Math.cos(a)*(10+s*2),32+Math.sin(a)*(12+s),3,1.5,a,1)}
   C([[14-s,30],[8-s,36],[9-s,42]],4,3,1);C([[34+s,30],[40+s,36],[39+s,42]],4,3,1);E(24,40,5+s,4,3,true);R(17,43,5,3,2);R(26,43,5,3,2);
   paint(1,2,function(x,y){return (x*3+y)%7===0});if(s)for(var j=0;j<3;j++)SP(18+j*6,20-s,4,1.5,-Math.PI/2,4)},
 manta:function(s){ // sky manta ray with a long tail
   var w=12+s*4;P([[24,20],[24-w,30+s],[24-w*.5,32],[24,34],[24+w*.5,32],[24+w,30+s]],1);E(24,29,4,5,3,true);
   C([[24,33],[25,40],[22,46]],2,1,2);paint(1,2,function(x,y){return (x+y*2)%8===0&&y>ty(28)});
   sym(function(){L(24-w*.5,29,24-w*.85,30+s,1.2,4,true)});if(s===2){E(12,23,1.5,1.5,5);E(37,21,1.5,1.5,5)}if(s)SP(24,21,4,2,-Math.PI/2,4)},
 dandelion:function(s){ // dandelion puff: stem with a seed ball
   C([[24,46],[22,38],[24,30]],2,2,2);LF(23,42,7,2,2.5,2);
   var balls=s===2?[[24,21,9],[13,28,5],[35,26,6]]:[[24,22,6+s*3]];
   balls.forEach(function(b){for(var i=0;i<14;i++){var a=i*Math.PI/7;L(b[0],b[1],b[0]+Math.cos(a)*b[2],b[1]+Math.sin(a)*b[2],1,3);E(b[0]+Math.cos(a)*b[2],b[1]+Math.sin(a)*b[2],1.2,1.2,1)}E(b[0],b[1],2,2,4)});
   if(s)E(38,10,1,1,1)},
 ghost:function(s){ // ghost cloak: a floating sheet with a pointed hood
   var w=8+s*2;P([[24,8-s*2],[24+w,22],[24+w+1,38],[24+w-3,41],[24+w-6,37],[24,42],[24-w+6,37],[24-w+3,41],[24-w-1,38],[24-w,22]],1);
   paint(1,3,function(x,y){return y>=ty(33)&&y<=ty(34)});sym(function(){C([[24-w,26],[24-w-5,30],[24-w-4,34]],3,2,1)});
   if(s>0)paint(1,2,function(x,y){return y>ty(36)});if(s===2){L(32,24,38,24,1,6);E(39,28,3,4,5);R(38,23,2,2,6)}E(24,46,6,1,6)},
 moonmoth:function(s){ // night moth with moon marks on its wings
   sym(function(){E(15-s,20,9+s*2,7+s,1,false,-.3);E(16-s,32,7+s,5+s*.5,2,false,.4);E(14-s,20,4,4,5,true);E(16-s,20,3,3.5,1,true)});
   E(24,26,3,10,6);sym(function(){C([[23,16],[20,10],[16,9]],1,1,4)});paint(2,7,function(x,y){return (x+y)%4===0});if(s)E(24,30,2,4,4,true)},
 cat:function(s){ // shadow cat with a curling tail and star spots, no ears
   E(23,33,10+s,6,1);[16,20,27,31].forEach(function(x){R(x-1.5,35,3,10,1)});E(34+s,25,5.5,5,1);C([[37+s,27],[41+s,29]],3,2,1);
   C([[13,32],[5,30],[4,22],[9,18],[12,22]],3+s*.5,2,2);E(23,36,7,2.5,3,true);
   for(var i=0;i<2+s*2;i++)star(16+i*4,30-(i%2)*2,1.8,.8,4,4);if(s===2){C([[31,20],[35,15],[40,17]],1.6,1,5)}},
 fairy:function(s){ // flower fairy: petal dress, leaf wings, petal crown (head stays blank)
   sym(function(){LF(22,24,10+s*3,4+s,-2.6,7);if(s)LF(22,28,8+s*2,3,2.7,7)});
   for(var i=0;i<5;i++)LF(24,26,14+s,3.5,Math.PI/2+(i-2)*.35,i%2?2:1);E(24,26,4,3,1);E(24,17-s*.5,4.5,4.5,3);
   for(var j=0;j<5;j++)LF(24,14-s*.5,4+s,1.8,-Math.PI/2+(j-2)*.5,4);sym(function(){L(21,25,16,30,1.5,3)});if(s===2)star(14,30,2,1,4,5)},
 butterfly:function(s){ // caterpillar, then cocoon, then butterfly
   if(s===0){for(var i=0;i<6;i++)E(10+i*5,40-Math.sin(i*.9)*3,3.5,3.5,i%2?1:2);paint(1,4,function(x,y){return (x+y)%5===0});SP(37,33,4,1.2,-1.2,6);SP(37,33,4,1.2,-1.9,6);return}
   if(s===1){L(24,6,24,14,1,6);E(24,26,7,12,2);paint(2,1,function(x,y){return y%4===0});LF(18,20,6,2,2.5,7);return}
   sym(function(){E(15,20,10,8,1,false,-.4);E(16,33,7,6,2,false,.5);E(13,19,4,3,4,true);E(16,34,2.5,2,3,true)});E(24,27,2.5,11,6);
   paint(1,7,function(x,y){return (x+y)%7===0});sym(function(){C([[23,16],[21,9],[18,7]],1,1,6)})},
 mushroom:function(s){ // mushroom with spots and a frilly skirt
   var w=11+s*3;E(24,22-s,w,9+s,1);R(24-w,22-s,w*2,10,0);E(24,22-s,w,9+s,1);eachCell(function(x,y){if(y>ty(23-s)&&G[y*N+x]===1)G[y*N+x]=0});
   R(24-w,21-s,w*2,3,1);R(20,23,8,21,3);E(24,44,6,2,3);E(24,27,7,2.5,2);
   [[-.5,-.5],[.3,-.75],[.55,-.25],[-.15,-.2],[-.75,-.15]].slice(0,3+s).forEach(function(p,i){E(24+p[0]*w,22-s+p[1]*9,1.8+((i%2)?.6:0),1.6,4,true)});if(s)sym(function(){LF(20,42,6,2,2.6,7)})},
 rosebush:function(s){ // round hedge with roses and thorny vines
   E(24,34,12+s*3,10+s,1);paint(1,2,function(x,y){return (x*7+y*3)%9<2});
   [[17,29],[30,27],[24,37],[34,36],[13,38]].slice(0,3+s).forEach(function(p){E(p[0],p[1],3,3,4);C([[p[0]-1.5,p[1]],[p[0],p[1]-1],[p[0]+1,p[1]+.5]],1,1,6,true)});
   R(18,43,3,3,6);R(27,43,3,3,6);if(s)for(var i=0;i<4;i++)SP(12+i*8,24-(i%2)*3,3,1.2,-Math.PI/2,2)},
 gearbot:function(s){ // gear robot on treads with a chest gear
   R(14,26-s*2,20,14+s*2,1);R(17,20-s*2,14,6,2);L(24,20-s*2,24,14-s*3,1,6);E(24,13-s*3,2,2,4);
   E(24,46-3,12,3,6);R(12,40,24,4,6);paint(6,7,function(x,y){return x%3===0});
   star(24,33-s,6,4.5,8,2,0);E(24,33-s,2.5,2.5,4);sym(function(){C([[14,30-s],[9,34],[9,38]],3,3,2);E(9,39,2.5,2,4)});R(16,22-s*2,16,2,5,true)},
 drone:function(s){ // flying disc with propellers
   E(24,26,11+s*2,5,1);E(24,24,6,3,3,true);E(24,29,9+s,1.5,6,true);sym(function(){L(14-s,24,8-s*2,18,1.5,2);E(8-s*2,17,6,1.2,4);if(s){L(17,28,12,34,1.4,2);E(12,35,4,1,4)}});
   E(24,22,2,1.5,5,true);E(24,44,6,1,6)},
 magnet:function(s){ // magnet crab: round shell and horseshoe claws
   E(24,34,10+s,7,1);E(24,36,7,3,3,true);sym(function(){for(var i=0;i<3;i++)L(17-i*2,37,11-i*3,44,1.6,6);
     C([[15,31],[9,26],[8,20]],3,3,1);P([[3,12],[8,8],[13,12],[11,18],[8,14],[5,18]],4);P([[3,12],[5,18],[3,19],[1,13]],2);P([[13,12],[11,18],[13,19],[15,13]],2)});
   if(s)paint(1,6,function(x,y){return x%4===0&&y<ty(33)})},
 /* legendaries */
 thunderbird:function(){sym(function(){for(var i=0;i<5;i++)LF(20,24,18-i*2,3.2,-2.75+i*.32,i%2?4:1,6)});E(24,26,6,9,1);E(24,29,3.5,6,3,true);E(24,14,4.5,4.5,1);
   P([[22,10],[26,3],[25,8],[29,6],[24,14]],5);for(var k=0;k<5;k++)LF(24,34,12,2.2,Math.PI/2+(k-2)*.3,k%2?5:4);paint(1,7,function(x,y){return (x+y*2)%9===0})},
 glacier:function(){C([[6,42],[16,46],[28,40],[24,30],[14,26],[16,16],[28,12],[38,16]],7,5,1);C([[6,42],[16,46],[28,40],[24,30],[14,26],[16,16],[28,12],[38,16]],2.5,2,3,true);
   E(40,16,5,4,1);for(var i=0;i<7;i++){var p=bez([[6,42],[16,46],[28,40],[24,30],[14,26],[16,16],[28,12],[38,16]],.1+i*.12);SP(p[0],p[1]-3,6,1.8,-Math.PI/2-.4,i%2?4:5)}L(42,12,46,6,1.5,4);L(39,12,40,5,1.5,4)},
 sunphoenix:function(){for(var i=0;i<16;i++){var a=i*Math.PI/8;SP(24+Math.cos(a)*14,24+Math.sin(a)*14,5,2,a,i%2?5:4)}E(24,24,14,14,7);
   sym(function(){for(var i=0;i<4;i++)LF(19,24,15-i*2,3.4,-2.7+i*.4,i%2?4:1,6)});E(24,26,6,8,1);E(24,28,3,5,3,true);E(24,15,4,4,1);for(var k=0;k<3;k++)SP(24+(k-1)*3,11,5,1.4,-Math.PI/2+(k-1)*.4,5)},
 treant:function(){R(16,22,16,20,6);paint(6,2,function(x,y){return x%4===0});sym(function(){C([[16,26],[8,30],[6,40]],4,3,6);C([[18,42],[12,46]],4,3,6)});
   E(24,14,16,10,1);E(14,18,7,5,1);E(34,17,7,5,1);paint(1,7,function(x,y){return (x*3+y*7)%11<2});[[14,12],[30,10],[24,18],[36,20],[10,20]].forEach(function(p){E(p[0],p[1],1.6,1.6,4)});E(24,32,3,4,5)},
 colossus:function(){P([[24,4],[33,16],[30,34],[24,40],[18,34],[15,16]],1);P([[24,4],[24,40],[18,34],[15,16]],2);sym(function(){P([[12,18],[6,26],[8,36],[14,30]],1);P([[16,38],[14,46],[20,46],[20,40]],2)});
   P([[24,14],[28,22],[24,30],[20,22]],5);P([[24,17],[26,22],[24,27],[22,22]],4);paint(1,7,function(x,y){return (x-y+60)%7===0})},
 starwhale:function(){E(22,26,18,10,1);E(22,30,15,5,3,true);P([[38,24],[47,16],[45,26],[47,36],[38,30]],2);sym(function(){});P([[16,33],[12,42],[22,36]],2);
   for(var i=0;i<6;i++)star(10+i*5,22-(i%2)*3,2.2,1,4,4);paint(1,7,function(x,y){return (x+y)%9===0&&y<ty(26)});E(8,10,1.5,1.5,5);E(40,8,1.5,1.5,5);E(30,6,1,1,4)}
};

/* ---------- the dex ---------- */
var PAL={ // per line: [main, second, light, accent, glow, dark detail, extra]
 sprout:["#4FB85E","#2E8B46","#CFEFA0","#F27BA8","#FFE16B","#2E5B2E","#FFB3CF"],
 moth:["#6FBF4A","#3E8E3A","#E8F5B0","#C7E36A","#FFF27A","#2F4A23","#A6D86A"],
 turtle:["#9C7A4E","#6E8B3D","#E4D3A6","#6DBE45","#F2D84B","#4E3A25","#3F8A3A"],
 cactus:["#3FA45B","#2B7A44","#D8F0A0","#FF6F91","#FFE15C","#1E5232","#2F8F4E"],
 flame:["#F0562F","#C2341C","#FFE6A0","#FF9F2E","#FFF07A","#6B1E10","#FFC34D"],
 fox:["#E25A30","#B8401F","#FFE1B8","#FFAA33","#FFF07A","#5A2412","#FFD38A"],
 beetle:["#5E2D2A","#3E1E1C","#E8C09A","#FF7A2E","#FFD84D","#2A1210","#7A3B33"],
 phoenix:["#F06A3A","#C4402A","#FFE6B0","#FFB23D","#FFF07A","#6A2416","#FFD38A"],
 magma:["#3D3036","#2A2025","#A88A8A","#FF6A2B","#FFC94A","#1E1619","#5A4A50"],
 droplet:["#4AA3EF","#2D73C9","#D8F2FF","#9BE3FF","#FFFFFF","#1E4C8A","#6CC4FF"],
 jelly:["#B48CF2","#8A62D6","#F2E6FF","#F7A8E0","#FFF27A","#4B2E8A","#D6BEFF"],
 snail:["#F2A65A","#B66A2E","#F7E9D2","#F27B6B","#FFF0B0","#6A3A1A","#FFD39A"],
 fish:["#2FA7C9","#1D7EA6","#D8F7FF","#FFD34D","#FFFFFF","#145470","#5FCFE6"],
 firefly:["#3E4A7A","#2A3358","#C9D3F2","#FFE14D","#FFF7A0","#151A33","#9AD7FF"],
 hedgehog:["#F2C230","#C9921A","#FFF2C2","#5A6CF0","#FFFFFF","#6A4A0A","#FFE07A"],
 stormcloud:["#8A93B8","#5E6690","#D8DDF2","#FFE14D","#FFF7A0","#2E3355","#B0B8D8"],
 orb:["#7A5CF0","#4E3AC4","#D8CCFF","#FFE14D","#FFFFFF","#2A1E70","#A994FF"],
 golem:["#8D7B68","#6A5B4C","#D2C3AD","#7FD3E6","#C9F4FF","#3A2E24","#A8957E"],
 geode:["#6E6258","#4E453E","#B8AA9A","#B48CF2","#E6D8FF","#2E2824","#8C7E70"],
 armadillo:["#B88A62","#8A6444","#F2DCC0","#F2C230","#FFF0B0","#4A3220","#D1A57E"],
 snowflake:["#9ED8FF","#6FB8F0","#FFFFFF","#7A8CF0","#E6F7FF","#2E5E8A","#C9ECFF"],
 penguin:["#3E6EA8","#2A4E80","#F2FAFF","#9EE6FF","#FFFFFF","#16304F","#6B9AD1"],
 stag:["#B8D8EE","#8AB4D6","#FFFFFF","#7FE0FF","#E6FCFF","#3A5A7A","#D6EBF7"],
 yeti:["#E8F2FA","#B8CCE0","#FFFFFF","#7FC8F0","#E6F7FF","#5A7590","#CFDDEA"],
 manta:["#4DBFAF","#2E8F84","#E6FFF8","#F29BB8","#FFFFFF","#1E5650","#8FE0D2"],
 dandelion:["#F2F7EA","#6BA84A","#FFFFFF","#F2C230","#FFFFFF","#3E6A2A","#C9DDB0"],
 ghost:["#5B4B9A","#3E3070","#B8A8E8","#F2E35B","#FFF6A0","#1E1838","#7A68B8"],
 moonmoth:["#3E3A70","#5E4E9A","#C9C0F2","#F2E35B","#FFF6C9","#1A1735","#8A7AD0"],
 cat:["#2E2850","#4A3E78","#9A8AD0","#F2E35B","#FFF6A0","#141128","#6A5AA8"],
 fairy:["#F07FB0","#C95A90","#FFE6F0","#FFE15C","#FFF6B0","#6A2346","#9FE08A"],
 butterfly:["#F07FB0","#A86BE0","#FFE6F0","#FFE15C","#FFFFFF","#4A2346","#FFB0D0"],
 mushroom:["#E8506A","#B83050","#FFF2E6","#FFFFFF","#FFF6B0","#6A1E30","#7FC86A"],
 rosebush:["#3E8E4A","#2A6A36","#C9EFA0","#F0507F","#FFC0D6","#1E4A26","#5FAE5A"],
 gearbot:["#8A9BB0","#5E6E84","#E6EDF5","#F0A23B","#9EF2FF","#2B3440","#B0BECE"],
 drone:["#C2CCD8","#8A97A8","#FFFFFF","#5AC8F0","#FFF27A","#3A4452","#A8B4C2"],
 magnet:["#B03A3A","#8A9BB0","#F2C9C9","#D8E0EA","#FFFFFF","#4A1A1A","#E06060"],
 thunderbird:["#F2C230","#C9921A","#FFF6C9","#5A6CF0","#FFFFFF","#5A3E0A","#FFE07A"],
 glacier:["#6FB8F0","#3E86C9","#E6F7FF","#B48CF2","#FFFFFF","#1E4A7A","#A8DCFF"],
 sunphoenix:["#F06A3A","#C4402A","#FFE6B0","#FFB23D","#FFF07A","#6A2416","#FFE2A0"],
 treant:["#3E8E4A","#5A3E24","#C9EFA0","#F27BA8","#FFE16B","#7A5434","#5FAE5A"],
 colossus:["#7A5CF0","#5A3ED0","#E6DEFF","#F2E35B","#FFFFFF","#24165E","#A994FF"],
 starwhale:["#3E5AB8","#2A3E8A","#C9D6FF","#FFE14D","#FFFFFF","#141E4A","#6E86E0"]
};
/* [design, type, names (one per stage)] — 22 three-stage, 14 two-stage, 6 legendary */
var LINES=[
 ["sprout","leaf",["Seedlet","Sproutle","Bloomkin"]],["flame","ember",["Flickit","Blazewisp","Infernix"]],["droplet","tide",["Drip","Splashlet","Torrentide"]],
 ["hedgehog","spark",["Zapling","Voltspine","Thunderquill"]],["golem","stone",["Pebbit","Bouldron","Cragmight"]],["penguin","frost",["Chillchick","Frostwaddle","Glacierwing"]],
 ["dandelion","gust",["Puffseed","Driftuft","Galebloom"]],["ghost","shade",["Hushcloak","Duskdrift","Lanternshade"]],["butterfly","bloom",["Crawlet","Cocoonix","Flutterae"]],
 ["gearbot","metal",["Cogling","Gearbolt","Titancog"]],["moth","leaf",["Leafwing","Fernmoth","Canopuff"]],["fox","ember",["Cinderpaw","Emberfox","Pyrovulp"]],
 ["jelly","tide",["Jellop","Bellbloop","Medusea"]],["firefly","spark",["Glowbit","Flashfly","Luminox"]],["armadillo","stone",["Rollet","Bandoroll","Bastionback"]],
 ["snowflake","frost",["Flakelet","Crystalis","Blizzarra"]],["manta","gust",["Skiff","Glidray","Zephyray"]],["cat","shade",["Nightpaw","Starprowl","Eclipsar"]],
 ["fairy","bloom",["Petalette","Blossprite","Floradiva"]],["turtle","leaf",["Mosshell","Turtletuft","Groveback"]],["phoenix","ember",["Ashchick","Cinderwing","Pyrophoen"]],
 ["fish","tide",["Finnow","Wavelure","Leviathorn"]],
 ["cactus","leaf",["Prickle","Saguardian"]],["beetle","ember",["Scorchbug","Magmantis"]],["magma","ember",["Lavalump","Basaltor"]],["snail","tide",["Shellop","Spiralune"]],
 ["stormcloud","spark",["Nimbuzz","Stormhulk"]],["orb","spark",["Orbit","Teslorb"]],["geode","stone",["Geodot","Amethrock"]],["stag","frost",["Icefawn","Frostantler"]],
 ["yeti","frost",["Snowmound","Avalanche"]],["moonmoth","shade",["Lunamoth","Crescentra"]],["mushroom","bloom",["Capsy","Toadstella"]],["rosebush","bloom",["Thornbud","Roseguard"]],
 ["drone","metal",["Hoverbit","Propellor"]],["magnet","metal",["Clampy","Magnaclaw"]]
];
var LEGENDS=[["thunderbird","spark","Thundaroc"],["glacier","frost","Glaciadon"],["sunphoenix","ember","Solarion"],["treant","leaf","Eldergrove"],["colossus","shade","Prismagon"],["starwhale","gust","Celestwhale"]];
var DEX=[];
LINES.forEach(function(L,li){var three=L[2].length===3;
  L[2].forEach(function(nm,st){var stage=three?st:(st?2:0);
    DEX.push({id:DEX.length+1,name:nm,design:L[0],type:L[1],stage:stage,line:li,
      evolvesAt:three?(st===0?14:st===1?30:0):(st===0?22:0),
      rarity:st===0?(li<22?"common":"uncommon"):st===1&&three?"uncommon":"rare"})})});
LEGENDS.forEach(function(L,i){DEX.push({id:DEX.length+1,name:L[2],design:L[0],type:L[1],stage:3,line:100+i,evolvesAt:0,rarity:"legendary"})});

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
function draw(ctx,c,px,ox,oy,silhouette){px=px||3;ox=ox||0;oy=oy||0;var o=build(c);
  for(var i=0;i<o.length;i++){var col=o[i];if(!col)continue;ctx.fillStyle=silhouette?"rgba(60,70,110,.85)":"rgb("+col[0]+","+col[1]+","+col[2]+")";ctx.fillRect(ox+(i%N)*px,oy+Math.floor(i/N)*px,px,px)}}
global.Creatures={DEX:DEX,TYPES:TYPES,draw:draw,SIZE:N,RARITY:{common:"Common",uncommon:"Uncommon",rare:"Rare",legendary:"Legendary"}};
})(window);
