import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import ffmpegPath from 'ffmpeg-static';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const OUT=path.resolve(here,'../docs/assets');
const FONTS=path.resolve(here,'../../plinth/fonts');
GlobalFonts.registerFromPath(path.join(FONTS,'PlinthDisplay-Black.ttf'),'PD');
GlobalFonts.registerFromPath(path.join(FONTS,'PlinthDisplay-BlackItalic.ttf'),'PDI');
GlobalFonts.registerFromPath('/System/Library/Fonts/SFNS.ttf','SFB');
const W=1920,H=1080,FPS=30,DUR=16,N=FPS*DUR;
const INK='#0A0A0A',MUTED='#6E6E6E',SIG='#FF4D1A',BG='#F2F2F2';
const L={
 en:{tag:'MAKE IT YOURS',body:['Your agent sends notes, lists and tiny apps.','They land here, instantly.'],pill:'Paste this to your agent',toast:'Copied',paired:'PAIRED',note:'GROCERIES',items:['Milk','Bread','Coffee'],week:'THIS WEEK',focus:'FOCUS',live:'Focus',url:'connected-mate.github.io/plinth'},
 fr:{tag:'À TON IMAGE',body:['Ton agent y dépose notes, listes et mini-apps.','Elles arrivent ici, aussitôt.'],pill:'Colle ça à ton agent',toast:'Copié',paired:'CONNECTÉ',note:'COURSES',items:['Lait','Pain','Café'],week:'CETTE SEMAINE',focus:'FOCUS',live:'Focus',url:'connected-mate.github.io/plinth'}};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const prog=(t,a,b)=>clamp((t-a)/(b-a));
// cubic-bezier(.23,1,.32,1)
function bez(x1,y1,x2,y2){return x=>{if(x<=0)return 0;if(x>=1)return 1;let lo=0,hi=1,t=x;for(let i=0;i<40;i++){t=(lo+hi)/2;const cx=3*x1*t*(1-t)**2+3*x2*t*t*(1-t)+t**3;if(cx<x)lo=t;else hi=t;}return 3*y1*t*(1-t)**2+3*y2*t*t*(1-t)+t**3;};}
const oq=bez(.23,1,.32,1);
const spring=x=>x<=0?0:x>=1?1:1-Math.exp(-6*x)*Math.cos(9*x);
const lerp=(a,b,k)=>a+(b-a)*k;
// grid layer
const grid=createCanvas(W,H);{const g=grid.getContext('2d');g.fillStyle=BG;g.fillRect(0,0,W,H);const C=44;g.strokeStyle='rgba(0,0,0,.07)';g.lineWidth=1;g.setLineDash([6,6]);g.beginPath();for(let x=C/2;x<W;x+=C){g.moveTo(x+.5,0);g.lineTo(x+.5,H);}for(let y=C/2;y<H;y+=C){g.moveTo(0,y+.5);g.lineTo(W,y+.5);}g.stroke();g.setLineDash([]);g.fillStyle='rgba(0,0,0,.22)';for(let x=C/2;x<W;x+=C)for(let y=C/2;y<H;y+=C){g.beginPath();g.arc(x+.5,y+.5,1.8,0,7);g.fill();}}
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function T(c,s,x,y,font,col,al='left',a=1,bl='alphabetic'){c.save();c.globalAlpha*=a;c.font=font;c.fillStyle=col;c.textAlign=al;c.textBaseline=bl;c.fillText(s,x,y);c.restore();}
function layer(c,a,tx,ty,sc,cx,cy,fn){if(a<=0.001)return;c.save();c.globalAlpha*=a;c.translate(cx+tx,cy+ty);c.scale(sc,sc);c.translate(-cx,-cy);fn();c.restore();}
function card(c,x,y,w,h,r=24,fill='#fff'){c.save();c.shadowColor='rgba(0,0,0,.09)';c.shadowBlur=56;c.shadowOffsetY=16;c.fillStyle=fill;rr(c,x,y,w,h,r);c.fill();c.shadowColor='rgba(0,0,0,.04)';c.shadowBlur=4;c.shadowOffsetY=2;rr(c,x,y,w,h,r);c.fill();c.restore();}
function fit(c,s,font0,maxW){let sz=+font0.match(/(\d+)px/)[1];for(;sz>20;sz-=2){c.font=font0.replace(/\d+px/,sz+'px');if(c.measureText(s).width<=maxW)break;}return sz;}
function arrow(c,cx,cy,s,col){c.save();c.strokeStyle=col;c.lineWidth=5*s;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(cx,cy+13*s);c.lineTo(cx,cy-13*s);c.moveTo(cx-12*s,cy-1*s);c.lineTo(cx,cy-13*s);c.lineTo(cx+12*s,cy-1*s);c.stroke();c.restore();}
const mmss=sec=>{sec=Math.max(0,Math.floor(sec));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');};
function remaining(t){return 1500-Math.max(0,t-9.0)*12;}
function frame(c,t,lang){
 const S=L[lang];
 c.globalAlpha=1;c.drawImage(grid,0,0);
 // dim grid in during first 0.8s via overlay
 const gf=oq(prog(t,0,.9));if(gf<1){c.fillStyle=BG;c.globalAlpha=1-gf;c.fillRect(0,0,W,H);c.globalAlpha=1;}
 // 1 title
 const e1=oq(prog(t,.5,1.6)),out1=1-oq(prog(t,7.7,8.4));
 const a1=e1*out1;
 layer(c,a1,0,0,lerp(.96,1,e1),96,96,()=>T(c,'PLINTH',92,345,'900 380px PD',INK));
 const e2=oq(prog(t,1.1,2.2));
 layer(c,e2*out1,0,lerp(24,0,e2),1,W-96,H-96,()=>{
  T(c,S.tag,W-96,H-218,'900 118px PDI',INK,'right');
  T(c,S.body[0],W-96,H-142,'30px SFB',MUTED,'right');T(c,S.body[1],W-96,H-100,'30px SFB',MUTED,'right');});
 // 2/3 pill card
 const cx=960,cy=540,cw=760;
 const rise=oq(prog(t,2.5,3.4));
 const morph=oq(prog(t,5.0,5.8));
 const exit=oq(prog(t,7.6,8.3));
 const ch=lerp(112,300,morph);
 const ca=rise*(1-exit);
 layer(c,ca,0,lerp(70,0,rise)-exit*30,lerp(1,.97,exit),cx,cy,()=>{
  card(c,cx-cw/2,cy-ch/2,cw,ch,lerp(56,24,morph));
  const pa=1-prog(t,5.0,5.35);
  if(pa>0){
   T(c,S.pill,cx-cw/2+44,cy,'500 34px SFB',INK,'left',pa,'middle');
   let bs=1;const pt=t;if(pt>=3.8&&pt<3.95)bs=lerp(1,.92,(pt-3.8)/.15);else if(pt>=3.95)bs=lerp(.92,1,spring(prog(pt,3.95,4.6)));
   const bx=cx+cw/2-44-32,by=cy;
   c.save();c.globalAlpha*=pa;c.translate(bx,by);c.scale(bs,bs);c.fillStyle=INK;c.beginPath();c.arc(0,0,32,0,7);c.fill();arrow(c,0,0,1.15,'#fff');c.restore();
  }
  const ka=oq(prog(t,5.5,6.2));
  if(ka>0){
   const sz=fit(c,'482 913','900 190px PD',600);
   T(c,'482 913',cx,cy-18+lerp(16,0,ka),`900 ${sz}px PD`,INK,'center',ka,'middle');
   const pa2=oq(prog(t,6.5,7.1));
   if(pa2>0){
    c.font='600 30px SFB';const lw=c.measureText(S.paired).width;
    const tot=22+16+lw,x0=cx-tot/2;
    c.save();c.globalAlpha*=pa2;c.fillStyle=SIG;c.beginPath();c.arc(x0+11,cy+100,11*lerp(.4,1,spring(prog(t,6.5,7.2))),0,7);c.fill();c.restore();
    c.save();c.font='600 30px SFB';T(c,S.paired,x0+38,cy+100,'600 30px SFB',INK,'left',pa2,'middle');c.restore();}
  }
 });
 // toast
 const ta=oq(prog(t,4.0,4.4))*(1-oq(prog(t,4.9,5.3)));
 layer(c,ta,0,lerp(16,0,oq(prog(t,4.0,4.5))),1,cx,cy-110,()=>{c.font='600 28px SFB';const w=c.measureText(S.toast).width+64;c.fillStyle=INK;rr(c,cx-w/2,cy-110-27,w,54,27);c.fill();T(c,S.toast,cx,cy-110,'600 28px SFB','#fff','center',1,'middle');});
 // 4 spaces
 const oy=50;
 const clear=oq(prog(t,12.8,13.5));
 const sp=(s)=>{const q=(t-s)/1.1;return {a:clamp(q/.2)*(1-clear),ty:(1-spring(q))*150-clear*40,ok:q>0};};
 // note
 {const s=sp(8.0),x=230,y=170+oy,w=540,h=400;
  layer(c,s.a,0,s.ty,1,x+w/2,y+h/2,()=>{card(c,x,y,w,h);
   T(c,S.note,x+44,y+104,'900 72px PD',INK);
   S.items.forEach((it,i)=>{const yy=y+190+i*72;const tk=i===0?prog(t,10.3,10.7):i===1?prog(t,11.4,11.8):0;const k=spring(tk);
    c.save();c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=3;c.beginPath();c.arc(x+62,yy,17,0,7);c.stroke();
    if(tk>0){c.fillStyle=INK;c.beginPath();c.arc(x+62,yy,17*Math.min(1.08,k),0,7);c.fill();c.strokeStyle='#fff';c.lineWidth=3.5;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x+54,yy+1);c.lineTo(x+60,yy+7);c.lineTo(x+71,yy-6);c.stroke();}
    c.restore();
    T(c,it,x+100,yy,'500 34px SFB',tk>0.5?MUTED:INK,'left',1,'middle');
    if(tk>0.5){c.save();c.strokeStyle=MUTED;c.lineWidth=2.5;c.globalAlpha*=clamp((tk-.5)*2);c.font='500 34px SFB';const tw=c.measureText(it).width;c.beginPath();c.moveTo(x+100,yy);c.lineTo(x+100+tw*clamp((tk-.5)*2),yy);c.stroke();c.restore();}
   });});}
 // timer
 {const s=sp(8.5),x=810,y=170+oy,w=440,h=400;
  layer(c,s.a,0,s.ty,1,x+w/2,y+h/2,()=>{card(c,x,y,w,h);
   T(c,S.focus,x+44,y+68,'600 24px SFB',MUTED);
   const str=mmss(remaining(t));const sz=fit(c,'25:00','900 200px PD',w-88);
   T(c,str,x+44,y+h-72,`900 ${sz}px PD`,INK);
   c.fillStyle=SIG;c.beginPath();c.arc(x+w-56,y+58,9,0,7);c.fill();});}
 // widget
 {const s=sp(9.0),x=1290,y=170+oy,w=400,h=400;
  layer(c,s.a,0,s.ty,1,x+w/2,y+h/2,()=>{card(c,x,y,w,h);
   T(c,S.week,x+44,y+68,'600 24px SFB',MUTED);
   const pg=oq(prog(t,9.8,11.4))*.68;
   T(c,Math.round(pg*100)+'%',x+44,y+h-130,'900 190px PD',INK);
   c.fillStyle='rgba(0,0,0,.08)';rr(c,x+44,y+h-88,w-88,16,8);c.fill();
   if(pg>0){c.fillStyle=SIG;rr(c,x+44,y+h-88,Math.max(16,(w-88)*pg/.68*.68),16,8);c.fill();}});}
 // live activity
 {const s=sp(9.6),w=760,h=112,x=cx-w/2,y=700+oy;
  layer(c,s.a,0,s.ty,1,cx,y+h/2,()=>{c.fillStyle=INK;c.save();c.shadowColor='rgba(0,0,0,.18)';c.shadowBlur=40;c.shadowOffsetY=12;rr(c,x,y,w,h,56);c.fill();c.restore();
   const pulse=.75+.25*Math.sin(t*5);c.fillStyle=SIG;c.beginPath();c.arc(x+56,y+h/2,12*(.9+.1*pulse),0,7);c.fill();
   T(c,S.live+' · '+mmss(remaining(t)),x+92,y+h/2,'600 44px SFB','#fff','left',1,'middle');
   T(c,'PLINTH',x+w-48,y+h/2,'900 34px PD','rgba(255,255,255,.55)','right',1,'middle');});}
 // 5 finale
 const f=oq(prog(t,13.3,14.5));
 if(f>0){c.font='900 100px PDI';const sz=fit(c,S.tag,'900 300px PDI',1500);
  layer(c,f,0,lerp(30,0,f),lerp(.96,1,f),cx,cy,()=>{T(c,S.tag,cx,cy+20,`900 ${sz}px PDI`,INK,'center');});
  const u=oq(prog(t,14.1,15.0));
  layer(c,u,0,lerp(16,0,u),1,cx,cy,()=>{T(c,S.url,cx,cy+110,'500 44px SFB',MUTED,'center');
   c.fillStyle=SIG;c.beginPath();c.arc(cx,cy+170,8,0,7);c.fill();});}
 return;
}
async function renderLang(lang){
 const cv=createCanvas(W,H),c=cv.getContext('2d');
 const mp4=path.join(OUT,`promo-${lang}.mp4`),webm=path.join(OUT,`promo-${lang}.webm`);
 const ff=spawn(ffmpegPath,['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','-',
  '-map','0:v','-an','-c:v','libx264','-preset','slow','-crf','24','-pix_fmt','yuv420p','-r',String(FPS),'-movflags','+faststart',mp4,
  '-map','0:v','-an','-c:v','libvpx-vp9','-b:v','0','-crf','36','-row-mt','1','-cpu-used','2','-pix_fmt','yuv420p','-r',String(FPS),webm],{stdio:['pipe','inherit','inherit']});
 for(let i=0;i<N;i++){c.clearRect(0,0,W,H);frame(c,i/FPS,lang);const buf=Buffer.from(cv.data());if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
 ff.stdin.end();await new Promise((r,j)=>ff.on('close',k=>k?j(new Error('ffmpeg '+k)):r()));
 // poster
 const pc=createCanvas(W,H);frame(pc.getContext('2d'),3.5,lang);
 const po=createCanvas(1600,900);po.getContext('2d').drawImage(pc,0,0,1600,900);
 let q=82,jb;for(;q>=40;q-=6){jb=po.toBuffer('image/jpeg',q);if(jb.length<=150000)break;}
 fs.writeFileSync(path.join(OUT,`poster-${lang}.jpg`),jb);
 if(process.env.FRAMES)for(const t of process.env.FRAMES.split(',')){const k=createCanvas(W,H);frame(k.getContext('2d'),+t,lang);fs.writeFileSync(path.join(here,`dbg-${lang}-${t}.png`),k.toBuffer('image/png'));}
 console.log(lang,'done poster q',q,jb.length);
}
// captions + transcript
const beats=[[0,2.5,5],[2.5,5,5],[5,8,5],[8,13,5],[13,16,5]];
const CAP={
 en:['A pale grid fades in. The huge black word PLINTH lands top left, and bottom right the line "Make it yours" sits above two short lines of text.',
     'A white pill card rises in the center with the line "Paste this to your agent" and a round black button. The button is pressed and a small black "Copied" label appears.',
     'The card grows and shows a six-digit code, 482 913. A small orange dot lights up next to the word PAIRED.',
     'Four things land one after another: a grocery list with three round checkboxes, two of them ticking, a big countdown timer, a card with an orange progress bar, and a black pill reading "Focus" with the time left.',
     'Everything clears. "Make it yours" appears in huge italic letters, with the address connected-mate.github.io/plinth underneath.'],
 fr:['Une grille pâle apparaît. Le grand mot noir PLINTH arrive en haut à gauche, et en bas à droite la phrase « À ton image » surplombe deux courtes lignes de texte.',
     'Une carte blanche en pilule monte au centre avec la phrase « Colle ça à ton agent » et un bouton rond noir. Le bouton est pressé et une petite étiquette noire « Copié » apparaît.',
     'La carte s’agrandit et affiche un code à six chiffres, 482 913. Un petit point orange s’allume à côté du mot CONNECTÉ.',
     'Quatre éléments arrivent l’un après l’autre : une liste de courses avec trois cases rondes dont deux se cochent, un grand minuteur qui descend, une carte avec une barre de progression orange, et une pastille noire « Focus » avec le temps restant.',
     'Tout s’efface. « À ton image » apparaît en immenses lettres italiques, avec l’adresse connected-mate.github.io/plinth en dessous.']};
const ts=s=>{const m=Math.floor(s/60),x=s-m*60;return String(m).padStart(2,'0')+':'+x.toFixed(3).padStart(6,'0');};
for(const lang of ['fr','en']){
 fs.writeFileSync(path.join(OUT,`promo-${lang}.vtt`),'WEBVTT\n\n'+beats.map((b,i)=>`${i+1}\n${ts(b[0])} --> ${ts(b[1])}\n${CAP[lang][i]}\n`).join('\n'));
}
fs.writeFileSync(path.join(here,'transcript.json'),JSON.stringify({fr:CAP.fr,en:CAP.en},null,2)+'\n');
const only=process.env.ONLY;
for(const lang of ['fr','en'])if(!only||only===lang)await renderLang(lang);
