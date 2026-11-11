export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
export function cycle(t,duration=5.6){t=((t%duration)+duration)%duration;if(t<.55)return 0;if(t<1.12)return 1-Math.pow(1-(t-.55)/.57,4);if(t<4.45)return 1;if(t<5.15)return 1-Math.pow((t-4.45)/.7,4);return 0;}
export function appearance(p){return {whole:1-smooth(.10,.32,p),parts:smooth(.18,.38,p)}}
export function posePart(part,p,time=0,fragment=0){
 const open=clamp(p),drift=Math.sin(time*.65+part.index*.7)*.025*open;
 const lag=part.index*.012,travel=smooth(lag,1,open);
 return {x:(part.index%2?1:-1)*.14*travel,y:(part.index-1.5)*.13*travel,z:part.closedZ+(part.openZ-part.closedZ)*travel+drift,rx:(part.index-1.5)*.018*travel,ry:(part.index%2?1:-1)*.045*travel,rz:(part.index-1.5)*.018*travel,fragment:Math.sin(time*.8+fragment*1.9)*.016*travel};
}
export function cameraPose(meal,p,time=0,pointer={x:0,y:0}){const h=meal.top+1.25,closedHeight=meal.whole.height+1.9,closedCenter=meal.whole.centerZ+.15,openCenter=(meal.top+.25)/2,center=closedCenter+(openCenter-closedCenter)*p,yaw=(Math.sin(time*.31)*.035*p+pointer.x*.13),pitch=.105+pointer.y*.035;return {height:closedHeight+(h-closedHeight)*p,center,yaw,pitch};}
