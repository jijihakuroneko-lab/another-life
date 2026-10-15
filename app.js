// ANOTHER LIFE v0.6 — personal timeline and a small alternative choice. Offline-first.
const KEY='another-life-v06',app=document.getElementById('app'),$=s=>document.querySelector(s);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh=()=>({screen:'welcome',step:0,name:'',age:30,events:[],people:[],category:'恋愛',branch:0,choice:null,sceneIndex:0});
let state;try{state={...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{state=fresh()}
let anim=0,storyTimer=0;
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function set(p){clearTimeout(storyTimer);cancelAnimationFrame(anim);state={...state,...p};save();render()}
function shell(content){app.innerHTML=`<header class="top"><span>✦ ANOTHER LIFE <small>v0.6</small></span><button class="ghost" id="restart">↺ はじめから</button></header>${content}<div class="foot">どの道にも、あなただけの物語がある。</div>`;$('#restart').onclick=()=>{if(confirm('入力した略歴も消して最初から始めますか？'))set(fresh())}}
function scene(){return '<div class="scene"><canvas aria-label="ゆっくり動く風景と丸い主人公"></canvas></div>'}
function sceneTitle(i){return ['小さなころ','学校のころ','新しい世界へ','大人になって'][i%4]}
function normalizedEvents(){return (state.events||[]).filter(e=>e&&e.text&&e.text.trim()).map(e=>({age:Math.max(0,Math.min(state.age,Number(e.age)||0)),text:e.text.trim().slice(0,90),kind:e.kind||'暮らし'})).sort((a,b)=>a.age-b.age)}
const defaultEvents=age=>[{age:6,kind:'学校',text:'学校に通い始めた'},{age:15,kind:'学校',text:'新しい学校に進んだ'},{age:18,kind:'進路',text:'卒業後の道を選んだ'},{age:Math.min(age,23),kind:'暮らし',text:'新しい毎日が始まった'}].filter(e=>e.age<=age);
const choices={
 '恋愛':{q:'あの人に、少しだけ声をかけてみる？',yes:'声をかけてみる',no:'今は胸の中にしまっておく',a:'ふたりは少しだけ言葉を交わした。次の日、また話せるかもしれない。',b:'その人の姿は、やがて大切な思い出になった。言葉にしなかった気持ちも、あなたのもの。',laterA:'思いがけない再会の機会が生まれた。ふたりの距離は、これからの会話で変わっていく。',laterB:'懐かしい景色を見て、あの人を思い出した。心に残る宝物は、今もそこにある。'},
 '仕事':{q:'心にある「やってみたい」を、誰かに話してみる？',yes:'やりたいことを話す',no:'もう少し自分の中で育てる',a:'話を聞いた人が、別の人を紹介してくれた。新しい場所へ行くきっかけができた。',b:'静かな時間の中で、考えを少しずつ形にしていった。',laterA:'小さな誘いが届いた。引き受けるかどうかは、また自分で決められる。',laterB:'書きためたアイデアが形になり、今度は自分から声をかける機会ができた。'},
 '家族':{q:'これからのことを、一緒に考えたいと伝えてみる？',yes:'話す時間を提案する',no:'今日は自分の気持ちを整理する',a:'ふたりはテーブルを囲んだ。答えはまだ出ないけれど、お互いの考えを知った。',b:'ノートに思いを書き出した。話す日を決めなくても、考える時間には意味がある。',laterA:'数週間後、相手からも将来についての話が出た。ふたりの会話は少しずつ続いていく。',laterB:'自分の望みがはっきりしてきた。いつ、誰に伝えるかはこれから選べる。'},
 '友人':{q:'最近会っていないあの人に、連絡してみる？',yes:'短いメッセージを送る',no:'思い出を大切にして過ごす',a:'しばらくして返事が届いた。昔と同じ話も、今だからできる話もあった。',b:'懐かしい写真を見返した。遠くにいても、あの時間は消えない。',laterA:'ふたりは休日に会う約束をした。新しい思い出がひとつ増えるかもしれない。',laterB:'別の友人との何気ない会話から、楽しい計画が生まれた。'},
 '自分':{q:'気になっていたことを、小さく試してみる？',yes:'まず一度やってみる',no:'今のペースを大切にする',a:'初めての場所で、知らなかった景色を見た。得意かどうかは、まだ分からない。',b:'好きな場所でゆっくり過ごした。心が落ち着く時間も、今の自分には必要だった。',laterA:'そこで出会った人から、新しいイベントに誘われた。',laterB:'ある日、ふと別のことが気になった。可能性はひとつではない。'}
};
function category(){return choices[state.category]||choices['自分']}
function renderFilm(lines,onDone){const cap=$('#caption'),skip=$('#skip');let idx=0;function done(){clearTimeout(storyTimer);if(skip)skip.hidden=true;onDone()}function next(){if(idx>=lines.length){done();return}cap.textContent=lines[idx++];storyTimer=setTimeout(next,4200)}skip.onclick=done;storyTimer=setTimeout(next,350)}
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
if(state.screen==='welcome'){shell(`<h1 class="logo">ANOTHER LIFE</h1><p class="subtitle">あなたが歩いた道から、もうひとつの物語へ。</p><div class="panel">${scene()}<h2 class="heading">あなたの人生を、小さな映画に。</h2><p class="story">これまでの出来事を少し教えて。今の年齢まで上映したら、過去の小さな分かれ道へ戻ります。</p><button class="primary" id="start">物語をつくる →</button><p class="tiny">入力は任意。データはこの端末に保存され、外部には送信しません。</p></div>`);$('#start').onclick=()=>set({screen:'profile'});drawScene('start');return}
if(state.screen==='profile'){shell(`<h1 class="logo">あなたの物語</h1><div class="panel"><form id="profile"><label class="field"><span>呼び名（仮名でもOK）</span><input id="name" maxlength="20" value="${safe(state.name)}" placeholder="たとえば、わたし"></label><label class="field"><span>今の年齢</span><input id="age" type="number" min="16" max="95" value="${state.age}" required></label><p class="tiny">次に、人生の出来事を最大5つと、登場人物を最大2人登録できます。全部スキップしても遊べます。</p><button class="primary">略歴を入力する →</button></form></div>`);$('#profile').onsubmit=e=>{e.preventDefault();const age=Math.max(16,Math.min(95,Number($('#age').value)||30));set({name:$('#name').value.trim().slice(0,20)||'あなた',age,events:state.events.length?state.events:defaultEvents(age),screen:'timeline'})};return}
if(state.screen==='timeline'){const ev=[...state.events];while(ev.length<5)ev.push({age:'',kind:'暮らし',text:''});shell(`<h1 class="logo">人生の足あと</h1><div class="panel"><p class="tiny">出来事を時系列で入力してね。学校・海外・仕事・引っ越しなど、あなたにとって大切なことなら何でも。空欄は飛ばします。</p><form id="timeline"><div class="event-list">${ev.map((e,i)=>`<div class="event-row"><input type="number" min="0" max="${state.age}" placeholder="年齢" aria-label="出来事${i+1}の年齢" data-age="${i}" value="${safe(e.age)}"><select data-kind="${i}" aria-label="出来事${i+1}の種類">${['学校','進路','仕事','海外','暮らし','恋愛','家族','友人','その他'].map(k=>`<option ${k===e.kind?'selected':''}>${k}</option>`).join('')}</select><input class="event-text" maxlength="90" placeholder="何があった？" aria-label="出来事${i+1}" data-text="${i}" value="${safe(e.text)}"></div>`).join('')}</div><button class="primary">登場人物を登録する →</button></form><button class="secondary" id="back">← 戻る</button></div>`);$('#timeline').onsubmit=e=>{e.preventDefault();const events=ev.map((_,i)=>({age:$(`[data-age="${i}"]`).value,kind:$(`[data-kind="${i}"]`).value,text:$(`[data-text="${i}"]`).value.trim()})).filter(e=>e.text);set({events,screen:'people'})};$('#back').onclick=()=>set({screen:'profile'});return}
if(state.screen==='people'){const people=[...(state.people||[])];while(people.length<2)people.push({name:'',role:'友人'});shell(`<h1 class="logo">物語に登場する人</h1><div class="panel"><p class="tiny">家族、友人、恋人、恩師など。実名でなくても大丈夫。入力しない場合は「大切な人」として描きます。</p><form id="people">${people.map((p,i)=>`<div class="person-row"><input maxlength="24" data-person="${i}" placeholder="呼び名（任意）" value="${safe(p.name)}"><select data-role="${i}">${['友人','恋人・パートナー','家族','同僚','その他'].map(r=>`<option ${r===p.role?'selected':''}>${r}</option>`).join('')}</select></div>`).join('')}<button class="primary">私の人生を上映する ▶</button></form><button class="secondary" id="back">← 戻る</button></div>`);$('#people').onsubmit=e=>{e.preventDefault();set({people:people.map((_,i)=>({name:$(`[data-person="${i}"]`).value.trim(),role:$(`[data-role="${i}"]`).value})).filter(p=>p.name),screen:'original',sceneIndex:0})};$('#back').onclick=()=>set({screen:'timeline'});return}
if(state.screen==='original'){const ev=normalizedEvents(),scenes=[{age:0,text:`${state.name}の物語が始まった。`,kind:'暮らし'},...ev,{age:state.age,text:`そして、${state.age}歳の今。ここまで歩いてきた道がある。`,kind:'暮らし'}],i=Math.min(state.sceneIndex,scenes.length-1),cur=scenes[i];shell(`<h1 class="logo">MY LIFE</h1><div class="panel story-panel"><div class="row"><span class="chapter">あなたの人生 · ${i+1}/${scenes.length}</span><span class="tag">${cur.age}歳</span></div>${scene()}<div class="film-caption" id="caption" aria-live="polite"></div><button class="film-skip" id="skip">▶ 次の場面へ</button><div id="next" hidden><button class="primary" id="nextButton">${i===scenes.length-1?'過去の分かれ道へ →':'次の場面 ▶'}</button></div></div><button class="secondary" id="edit">略歴を編集する</button>`);const people=(state.people||[]).map(p=>`${p.role}の${p.name}`).join('、');const lines=[cur.text,...(i===scenes.length-1&&people?[`そして、${people}との時間も、この人生の一部。`]:[])];renderFilm(lines,()=>{$('#next').hidden=false});$('#nextButton').onclick=()=>set(i===scenes.length-1?{screen:'turning'}:{sceneIndex:i+1});$('#edit').onclick=()=>set({screen:'timeline'});drawScene('story');return}
if(state.screen==='turning'){const ev=normalizedEvents();shell(`<h1 class="logo">あの日に、戻れたら</h1><div class="panel">${scene()}<h2 class="heading">小さな分かれ道を選ぼう</h2><p class="story">過去を否定するためじゃない。もうひとつの可能性を、そっと覗いてみるために。</p><label class="field"><span>どんな気持ちに戻ってみる？</span><select id="category">${Object.keys(choices).map(c=>`<option ${c===state.category?'selected':''}>${c}</option>`).join('')}</select></label><label class="field"><span>どの頃の自分？</span><select id="branch">${(ev.length?ev:[{age:Math.max(10,state.age-5),text:'あの頃'}]).map((e,i)=>`<option value="${i}">${e.age}歳 · ${safe(e.text.slice(0,28))}</option>`).join('')}</select></label><button class="primary" id="go">もうひとつの人生へ →</button></div>`);$('#go').onclick=()=>set({category:$('#category').value,branch:Number($('#branch').value),choice:null,screen:'alternate'});drawScene('story');return}
if(state.screen==='alternate'){const c=category(),ev=normalizedEvents(),anchor=ev[state.branch]||{age:Math.max(10,state.age-5),text:'あの頃'},person=(state.people||[])[0];shell(`<h1 class="logo">ANOTHER LIFE</h1><div class="panel story-panel"><div class="row"><span class="chapter">${anchor.age}歳 · ${safe(anchor.text.slice(0,28))}</span><span class="tag">${safe(state.category)}</span></div>${scene()}<p class="film-caption">${safe(c.q)}</p><div class="choices"><button class="choice" id="yes">${safe(c.yes)} →</button><button class="choice" id="no">${safe(c.no)} →</button></div>${person?`<p class="tiny">物語の登場人物：${safe(person.role)}の${safe(person.name)}</p>`:''}</div><button class="secondary" id="back">← 分かれ道を選び直す</button>`);$('#yes').onclick=()=>set({choice:0,screen:'outcome'});$('#no').onclick=()=>set({choice:1,screen:'outcome'});$('#back').onclick=()=>set({screen:'turning'});drawScene('story');return}
if(state.screen==='outcome'){const c=category(),text=state.choice===0?c.a:c.b,later=state.choice===0?c.laterA:c.laterB; shell(`<h1 class="logo">もうひとつの物語</h1><div class="panel story-panel">${scene()}<div class="film-caption" id="caption"></div><button class="film-skip" id="skip">▶ 先へ進む</button><div id="next" hidden><p class="notice">その後の人生では… ${safe(later)}</p><button class="primary" id="finish">今の私へ →</button></div></div>`);renderFilm([text],()=>{$('#next').hidden=false});$('#finish').onclick=()=>set({screen:'ending'});drawScene('story');return}
if(state.screen==='ending'){shell(`<h1 class="logo">ANOTHER LIFE</h1><div class="panel">${scene()}<div class="chapter">${state.age}歳 · いま</div><h2 class="heading">次は、どうする？</h2><p class="story">あのときのあなたも、もうひとつのあなたも、どちらも大切。今からの小さな選択は、まだあなたの手の中にある。</p><button class="primary" id="again">別の分かれ道も見てみる</button><button class="secondary" id="original">私の人生をもう一度観る</button><p class="tiny">これは未来予測ではなく、可能性を描くフィクションです。行動しない選択にも価値があります。</p></div>`);$('#again').onclick=()=>set({screen:'turning'});$('#original').onclick=()=>set({screen:'original',sceneIndex:0});drawScene('end');return}
}
render();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=6').catch(()=>{}));
