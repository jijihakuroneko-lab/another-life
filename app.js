// ANOTHER LIFE v0.5 — branching lives. No external API or tracking.
const KEY='another-life-v05';
const app=document.getElementById('app');
const $=s=>document.querySelector(s);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh=()=>({screen:'welcome',name:'あなた',age:30,chapter:0,choices:[],future:'',action:''});
let state;try{state={...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{state=fresh()}
let anim=0,storyTimer=0;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
function set(p){clearTimeout(storyTimer);cancelAnimationFrame(anim);state={...state,...p};save();render()}
function shell(content){app.innerHTML=`<header class="top"><span>✦ ANOTHER LIFE <small>v0.5</small></span><button class="ghost" id="restart">↺ 最初から</button></header>${content}<div class="foot">選ばなかった道にも、別の物語がある。</div>`;$('#restart').onclick=()=>{if(confirm('この人生を最初からやり直しますか？'))set(fresh())}}
const stages=[10,15,22,30];
// Every branch changes a scene, location, encounter and later opportunity.
const routes={
  wander:{label:'知らない道へ',teen:{place:'丘の上の観測所',intro:'あの日見つけた細い道の先には、小さな観測所があった。',person:'星の観察が好きな友人・ソラ',event:'ソラが「今夜、一緒に星を見ない？」と声をかける。',options:['誘いに乗って外へ出る','今日は帰って、自分の記録をつける']},young:[{place:'遠い街の共同研究室',intro:'ソラの紹介で、遠くの街の小さな研究室に来た。知らない人たちと空を見上げる毎日が始まる。',job:'旅する調査員',home:'港のある街'}, {place:'古い町の資料館',intro:'自分でつけた星の記録が、町の資料館の人の目に留まった。静かな部屋で、世界を調べる仕事が始まる。',job:'資料を編む人',home:'古い町'}]},
  familiar:{label:'いつもの帰り道',teen:{place:'路地裏の古本屋',intro:'いつもの道で雨宿りした古本屋。店主は何も聞かず、温かいお茶を出してくれた。',person:'物語を書くのが好きな友人・ハル',event:'店で知り合ったハルが、作りかけの小さな本を見せてくれた。',options:['一緒に本を作ってみる','まずは一人で物語を書いてみる']},young:[{place:'小さな出版社',intro:'ハルと作った本が誰かの手に届き、二人は小さな出版社に呼ばれた。知らない物語が次々と集まってくる。',job:'本を届ける人',home:'賑やかな街'}, {place:'静かな喫茶室',intro:'一人で書き続けた物語を、近所の喫茶室で読んでもらうようになった。やがて、遠くからも人が訪れる。',job:'物語を紡ぐ人',home:'緑の多い町'}]}
};
function path(){const r=state.choices[0]===1?'familiar':'wander';const t=state.choices[1]===1?1:0;return {r,t,route:routes[r],young:routes[r].young[t]}}
function scene(){return `<div class="scene"><canvas aria-label="丸い主人公とゆっくり動く風景"></canvas></div>`}
function progress(){return `<div class="progress"><div style="width:${(state.chapter+1)/4*100}%"></div></div>`}
function stageData(){const i=state.chapter,p=path();if(i===0)return {place:'放課後の分かれ道',intro:'10歳。帰り道に、見慣れない小道を見つけた。\n少し遠回りになるけれど、先には何があるんだろう。',question:'今日はどちらへ帰る？',options:['知らない道を進んでみる','いつもの道で帰る']};if(i===1)return {place:p.route.teen.place,intro:p.route.teen.intro+'\nそこで出会ったのは、'+p.route.teen.person+'。',question:p.route.teen.event,options:p.route.teen.options};if(i===2)return {place:p.young.place,intro:p.young.intro,question:'新しい機会が目の前にある。どう向き合う？',options:['今いる場所で、もう少し挑戦する','別の街で、新しい暮らしを始める']};const moved=state.choices[2]===1;return {place:moved?'新しい街の朝':p.young.home,intro:`30歳。${moved?'引っ越した先の街で、新しい人たちと出会った。':'積み重ねてきた日々が、少しずつ形になってきた。'}\n今のあなたは「${p.young.job}」として暮らしている。\nここまでの景色は、選んだ道によって違っている。`,question:'ここから先は、まだ決まっていない。',options:[]}}
function drawScene(type){
 const canvas=$('canvas');if(!canvas)return;
 cancelAnimationFrame(anim);const ctx=canvas.getContext('2d');if(!ctx)return;
 let tick=0;const chapter=state.screen==='welcome'?0:state.screen==='future'||state.screen==='done'?5:([0,1,3,5][Math.min(state.chapter||0,3)]||0);
 const scenes=[
 {sky:['#d4e8e4','#fff0d7'],ground:'#b8cdb1',kind:'park',time:'day'},
 {sky:['#d5e6ee','#f9e9d8'],ground:'#c9c0b5',kind:'school',time:'day'},
 {sky:['#f4d6ce','#f5e6d2'],ground:'#c5ac9f',kind:'cafe',time:'evening'},
 {sky:['#c8d9e5','#e7dfd3'],ground:'#b3b4ad',kind:'city',time:'day'},
 {sky:['#777caa','#efb9ad'],ground:'#a1a1a8',kind:'home',time:'night'},
 {sky:['#9fa8ca','#f8c5a8'],ground:'#a8ada6',kind:'water',time:'evening'}];
 const sc=scenes[chapter];const w=360,h=212;const ratio=Math.min(window.devicePixelRatio||1,2);
 function poly(points,fill){ctx.fillStyle=fill;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
 function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
 function rect(x,y,ww,hh,color){ctx.fillStyle=color;ctx.fillRect(x,y,ww,hh)}
 function rounded(x,y,ww,hh,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,ww,hh,r);ctx.fill()}
 function cloud(x,y,k=1){ellipse(x,y,22*k,8*k,'#ffffffa8');ellipse(x-11*k,y-5*k,13*k,9*k,'#ffffffa8');ellipse(x+8*k,y-8*k,17*k,11*k,'#ffffffa8')}
 function windowAt(x,y){rounded(x,y,19,29,2,'#f8e7d4');rect(x+9,y,1,29,'#c2ac9f');rect(x,y+14,19,1,'#c2ac9f')}
 function background(t){
 const grad=ctx.createLinearGradient(0,0,0,190);grad.addColorStop(0,sc.sky[0]);grad.addColorStop(1,sc.sky[1]);rect(0,0,w,h,grad);
 const sunX=290,sunY=sc.time==='night'?45:57;
 ellipse(sunX,sunY,sc.time==='night'?13:20,sc.time==='night'?13:20,sc.time==='night'?'#fff6dd':'#ffe4a5');
 if(sc.time==='night')for(let i=0;i<16;i++){const x=(i*67+24)%350,y=(i*37+12)%105;ellipse(x,y,1+(i%3)*.4,1+(i%3)*.4,'#fff7e0a8')}
 else {cloud(55+(t*2)%35,37,.72);cloud(205-(t*.9)%24,56,.52)}
 if(sc.kind==='park'||sc.kind==='water'){
 poly([[0,139],[65,105],[126,143],[210,114],[280,140],[360,116],[360,180],[0,180]],'#9eafb3a6');
 if(sc.kind==='water'){rect(0,146,360,66,'#94b9c3');for(let i=0;i<12;i++){rect((i*49+t*6)%380,157+i%4*13,17,1,'#e8e6d1a8')}}
 else{rect(0,164,360,48,sc.ground);for(let i=0;i<4;i++){const x=i*105+12;rect(x,104,7,70,'#917e76');ellipse(x+4,98,31,29,i%2?'#b5c6ad':'#c8d1b0')}}
 }else if(sc.kind==='school'||sc.kind==='city'){
 for(let i=0;i<6;i++){const x=i*69-8,y=79+(i%3)*13;rounded(x,y,64,105,3,i%2?'#c5b4b0':'#dfc8b6');for(let j=0;j<3;j++)windowAt(x+8+j*18,y+18)}
 rect(0,181,360,31,sc.ground);rect(0,180,360,3,'#e6d9ca')
 }else if(sc.kind==='cafe'||sc.kind==='home'){
 rect(0,0,360,212,sc.kind==='home'?'#b9adc0':'#e9d7c7');rounded(19,24,120,115,6,'#f7ebdd');rect(25,30,108,104,sc.kind==='home'?'#777ca4':'#e6b5ab');rect(77,30,5,104,'#f6e9d9');rect(25,82,108,4,'#f6e9d9');
 rect(0,169,360,43,sc.kind==='home'?'#a393a1':'#c6aa99');rounded(215,128,110,12,4,'#a88d82');rect(230,139,8,47,'#9e8175');rect(302,139,8,47,'#9e8175');rounded(278,107,18,22,5,'#eee0cc');
 if(sc.kind==='home'){rounded(210,66,96,52,7,'#d5c0bc');rounded(221,75,74,34,5,'#eee0d5')}
 }
 // atmospheric foreground: slow drifting particles
 for(let i=0;i<9;i++){const x=(i*51+tick*(i%2?4:-3)+400)%390-10,y=(i*29+36+Math.sin(tick+i)*5)%190;ellipse(x,y,1.8,1.4,sc.time==='night'?'#fff4de66':'#fffdf599')}
 }
 function protagonist(t){
 const x=180+(type==='story'?Math.sin(t*.45)*7:0),y=143+Math.sin(t*2.4)*2;
 ellipse(x,192,29,5,'#655a6540');
 // little feet, independent from the body
 ellipse(x-15,182+Math.sin(t*3)*2,9,5,'#f3e7d5');ellipse(x+15,182-Math.sin(t*3)*2,9,5,'#f3e7d5');
 const body=ctx.createLinearGradient(x-26,y-34,x+20,y+40);body.addColorStop(0,'#fffaf0');body.addColorStop(1,'#f0dfcd');
 ctx.fillStyle=body;ctx.strokeStyle='#74676b';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x-27,y+27);ctx.bezierCurveTo(x-31,y-5,x-24,y-39,x,y-41);ctx.bezierCurveTo(x+25,y-41,x+31,y-7,x+27,y+27);ctx.quadraticCurveTo(x+25,y+37,x+13,y+38);ctx.lineTo(x-13,y+38);ctx.quadraticCurveTo(x-26,y+37,x-27,y+27);ctx.closePath();ctx.fill();ctx.stroke();
 // tiny eyes blink every few seconds
 const blink=t%5.1>4.98;ctx.strokeStyle='#51484d';ctx.lineWidth=2;ctx.lineCap='round';
 for(const dx of [-8,9]){if(blink){ctx.beginPath();ctx.moveTo(x+dx-2,y-4);ctx.lineTo(x+dx+2,y-4);ctx.stroke()}else ellipse(x+dx,y-5,1.7,2.8,'#51484d')}
 ellipse(x+1,y+4,1.2,.8,'#b99591');
 if(chapter===1||chapter===3){rounded(x+19,y+11,17,19,3,'#a78e8e');ctx.strokeStyle='#8a7479';ctx.beginPath();ctx.arc(x+25,y+12,7,Math.PI,0);ctx.stroke()}
 if(chapter===4){rounded(x-24,y+15,48,7,3,'#d2a6a4')}
 if(chapter===5){ctx.strokeStyle='#d2a6a4';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y+3,27,.35,Math.PI-.3);ctx.stroke()}
 }
 function paint(){if(!canvas.isConnected)return;if(canvas.width!==w*ratio){canvas.width=w*ratio;canvas.height=h*ratio}ctx.setTransform(ratio,0,0,ratio,0,0);tick+=.016;ctx.clearRect(0,0,w,h);background(tick);protagonist(tick);anim=requestAnimationFrame(paint)}
 paint();
}

function render(){clearTimeout(storyTimer);cancelAnimationFrame(anim);
if(state.screen==='welcome'){shell(`<h1 class="logo">ANOTHER LIFE</h1><p class="subtitle">もしも、別の道を選んでいたら。</p><div class="panel">${scene()}<h2 class="heading">小さな選択から、違う人生が始まる。</h2><p class="story">選んだ道で、出会う人も、街も、仕事も変わっていく。短い物語を、もう一度。</p><button class="primary" id="begin">人生をはじめる →</button><p class="tiny">約2〜4分。データはこの端末だけに保存されます。</p></div>`);$('#begin').onclick=()=>set({screen:'setup'});drawScene('start');return}
if(state.screen==='setup'){shell(`<h1 class="logo">主人公のこと</h1><div class="panel"><form id="setup"><label class="field"><span>呼び名</span><input id="name" maxlength="16" placeholder="好きな呼び名" value="${safe(state.name==='あなた'?'':state.name)}"></label><label class="field"><span>今の年齢</span><input id="age" type="number" min="18" max="90" value="${state.age}"></label><p class="tiny">今回の試作は10歳から30歳までの架空の4章を体験します。入力した年齢は最後の問いかけに使います。</p><button class="primary">物語を見る ▶</button></form></div>`);$('#setup').onsubmit=e=>{e.preventDefault();set({name:$('#name').value.trim()||'あなた',age:Math.min(90,Math.max(18,Number($('#age').value)||30)),screen:'story',chapter:0,choices:[]})};return}
if(state.screen==='story'){const d=stageData(),i=state.chapter,chosen=state.choices[i];shell(`<h1 class="logo">${safe(state.name)}の、もうひとつの人生</h1>${progress()}<div class="panel story-panel"><div class="row"><span class="chapter">CHAPTER ${i+1} · ${safe(d.place)}</span><span class="tag">${stages[i]}歳</span></div>${scene()}<div class="film-caption" id="caption" aria-live="polite"></div><button class="film-skip" id="skip">▶ すぐに進む</button><section id="decision" hidden><h2 class="heading">${safe(d.question)}</h2>${i===3?`<button class="primary" id="finish">今の私へ →</button>`:`<div class="choices">${d.options.map((o,j)=>`<button class="choice" data-choice="${j}">${safe(o)} →</button>`).join('')}</div>`}</section></div><button class="secondary" id="back">← ${i?'ひとつ前の時代へ':'主人公の設定へ'}</button>`);
const cap=$('#caption'),dec=$('#decision'),skip=$('#skip');let lines=d.intro.split('\n'),idx=0;
function showDecision(){clearTimeout(storyTimer);dec.hidden=false;skip.hidden=true;cap.textContent='';}
function play(){if(idx>=lines.length){showDecision();return}cap.textContent=lines[idx++];storyTimer=setTimeout(play,2200)}
skip.onclick=showDecision;storyTimer=setTimeout(play,400);
document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const a=state.choices.slice(0,i);a.push(Number(b.dataset.choice));set({choices:a,chapter:i+1})});
$('#finish')?.addEventListener('click',()=>set({screen:'future'}));$('#back').onclick=()=>set(i?{chapter:i-1,choices:state.choices.slice(0,i-1)}:{screen:'setup'});drawScene('story');return}
if(state.screen==='future'){const p=path();shell(`<h1 class="logo">ここからは、あなたの人生</h1><div class="panel">${scene()}<div class="chapter">AFTER STORY · ${state.age}歳</div><h2 class="heading">次は、どうする？</h2><p class="story">別の道を選べば、違う人に出会い、違う街にいたかもしれない。\nでも、今日のあなたの次のページは、まだ白紙。</p><div class="notice">この人生では、${safe(p.route.teen.person)}に出会い、${safe(p.young.job)}になった。</div><div class="choices"><button class="choice" data-future="新しい場所に行く">新しい場所に行ってみる</button><button class="choice" data-future="誰かと話す">誰かと話してみる</button><button class="choice" data-future="今を大切にする">今の暮らしを大切にする</button></div><button class="secondary" id="replay">別の人生も見てみる ↺</button></div>`);document.querySelectorAll('[data-future]').forEach(b=>b.onclick=()=>set({future:b.dataset.future,screen:'done'}));$('#replay').onclick=()=>set({screen:'story',chapter:0,choices:[]});drawScene('future');return}
if(state.screen==='done'){shell(`<h1 class="logo">ANOTHER LIFE</h1><div class="panel">${scene()}<h2 class="heading">次は、どうする？</h2><p class="story">あなたが選んだ次の一歩：${safe(state.future)}。\n選ばなかった道にも、まだ可能性がある。</p><button class="primary" id="again">もうひとつの人生を見てみる</button><p class="tiny">正解はありません。何もしない日があっても大丈夫。</p></div>`);$('#again').onclick=()=>set({screen:'story',chapter:0,choices:[]});drawScene('end')}
}
render();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=5').catch(()=>{}));
