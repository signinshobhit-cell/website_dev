(() => {
  const canvas=document.getElementById('tradeGlobe'); if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const control=document.getElementById('globePause');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduce.matches, visible=true, angle=-.6, frame=0, last=0,size=0;
  // Stylised geographic silhouettes; decorative, not a navigational map.
  const land=[[[ -168,72],[-130,70],[-125,50],[-100,20],[-80,8],[-60,45],[-52,60],[-80,75]], [[-80,10],[-48,-2],[-34,-8],[-50,-35],[-68,-55],[-78,-20]], [[-18,36],[10,38],[35,30],[50,12],[40,-12],[20,-35],[8,-30],[-5,4]], [[-10,36],[-10,60],[25,72],[60,70],[100,76],[170,60],[145,35],[122,20],[110,0],[98,8],[80,8],[68,26],[45,36],[30,42]], [[112,-12],[145,-10],[154,-27],[134,-40],[115,-30]], [[-55,60],[-20,65],[-25,82],[-55,83]], [[47,-12],[51,-16],[48,-26],[44,-22]], [[129,31],[142,44],[145,35],[135,30]], [[95,5],[108,-5],[125,-9],[135,-5],[118,2]], [[166,-35],[179,-39],[170,-47]]];
  function inside(x,y,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
  const points=[];
  for(let lat=-70;lat<82;lat+=3.2)for(let lon=-180;lon<180;lon+=3.2/Math.max(.3,Math.cos(lat*Math.PI/180)))points.push({lat,lon,land:land.some(p=>inside(lon,lat,p))});
  function project(lat,lon,lift=1){const p=lat*Math.PI/180,l=lon*Math.PI/180+angle;return {x:Math.cos(p)*Math.sin(l)*lift,y:-Math.sin(p)*lift,z:Math.cos(p)*Math.cos(l)};}
  function draw(){
    const w=size,r=w*.34,cx=w/2,cy=w*.49;ctx.clearRect(0,0,w,w);
    const glow=ctx.createRadialGradient(cx,cy,r*.7,cx,cy,r*1.5);glow.addColorStop(0,'#74dd5220');glow.addColorStop(1,'#74dd5200');ctx.fillStyle=glow;ctx.fillRect(0,0,w,w);
    for(let i=0;i<48;i++){ctx.fillStyle=`rgba(167,222,187,${.12+(i%4)*.05})`;ctx.fillRect(((i*137)%997)/997*w,((i*227)%991)/991*w,1,1);}
    ctx.strokeStyle='#83c1a02b';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,r*1.34,r*.34,-.35,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='#98e48155';ctx.stroke();
    points.forEach(p=>{const q=project(p.lat,p.lon);if(q.z<0)return;const a=.12+q.z*.8;ctx.fillStyle=p.land?`rgba(170,237,124,${a})`:`rgba(82,166,137,${a*.35})`;const dot=p.land?Math.max(1.1,w/230):.8;ctx.fillRect(cx+q.x*r,cy+q.y*r,dot,dot);});
    // Routes radiate from India to representative international trade centres.
    [[51,0],[25,55],[1,104],[40,-74],[-33,151]].forEach(([lat,lon],n)=>{
      ctx.beginPath();let open=false;for(let i=0;i<=70;i++){const t=i/70,q=project(20+(lat-20)*t,78+(lon-78)*t,1+.23*Math.sin(Math.PI*t));if(q.z<0){open=false;continue;}const x=cx+q.x*r,y=cy+q.y*r;if(!open){ctx.moveTo(x,y);open=true;}else ctx.lineTo(x,y);}ctx.strokeStyle='#9ce97365';ctx.lineWidth=1;ctx.stroke();
      const t=((angle*.3+n*.21)%1+1)%1,q=project(20+(lat-20)*t,78+(lon-78)*t,1+.23*Math.sin(Math.PI*t));if(q.z>0){ctx.fillStyle='#d5ffb7';ctx.shadowColor='#b6fa83';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(cx+q.x*r,cy+q.y*r,2.4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    });
  }
  function loop(time){frame=0;if(paused||!visible||document.hidden)return;if(time-last>32){angle+=.003;draw();last=time;}frame=requestAnimationFrame(loop);}
  function start(){if(!frame&&!paused&&visible&&!document.hidden)frame=requestAnimationFrame(loop);}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  function resize(){size=canvas.clientWidth;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=size*dpr;canvas.height=size*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  function label(){control.textContent=paused?'Play animation':'Pause animation';control.setAttribute('aria-pressed',String(paused));}
  control.addEventListener('click',()=>{paused=!paused;label();if(paused)stop();else start();});
  reduce.addEventListener('change',e=>{paused=e.matches;label();if(paused)stop();else start();});
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
  label();resize();start();
})();
