'use strict';
const $=s=>document.querySelector(s), app=$('#app');
const KEY='another-life-save-v1';
const fresh=()=>({screen:'welcome',name:'あなた',age:30,home:'海の近く',interest:'新しいことを知る',milestone:'',chapter:0,choices:[],future:'',action:'',history:[]});
let state;try{state={...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{state=fresh()}
let frame=0,anim=0,storyTimer=null;
const stopStory=()=>{if(storyTimer!==null){clearTimeout(storyTimer);storyTimer=null}};
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
const set=(patch)=>{stopStory();state={...state,...patch};persist();render();window.scrollTo({top:0,behavior:'instant'})};
const ageAt=i=>Math.max(5,Math.min(state.age,[6,12,17,22,26,state.age][i]));
const chapters=[
 {title:'はじめての冒険',place:'放課後の道',story:s=>`${s.name}は、知らない道を歩くのが少し好き。今日は友達と帰る途中、見たことのない小道を見つけた。`,options:['友達について、いつもの道を帰る','「こっちに行ってみない？」と提案する'],results:['安心できるいつもの景色。帰り道で友達の面白い話を聞いた。','知らない小さな公園を発見。友達も笑っている。']},
 {title:'好きなものの形',place:'学校の教室',story:s=>`進路を考える季節。${s.name}は「${s.interest}」が好き。でも、周囲には別の道を勧める人もいる。`,options:['勧められた道をまず調べてみる','自分の好きな分野も調べてみる'],results:['思いがけない得意分野を発見した。好きなことへの関心も、心の片隅に残った。','同じ関心を持つ人を見つけた。知らなかった道が、ひとつ増えた。']},
 {title:'小さな違和感',place:'帰り道のカフェ',story:s=>`「それはあなたには難しいんじゃない？」。誰かの何気ない言葉が、${s.name}の胸に残る。`,options:['今は言い返さず、自分の気持ちを整理する','「どうしてそう思うの？」と聞いてみる'],results:['帰り道、ノートに気持ちを書いた。自分の考えが少しずつ見えてきた。','相手は少し驚いた。答えは曖昧だったけれど、前提を問い直せた。']},
 {title:'はじめての社会',place:'街の仕事場',story:s=>`新しい環境に慣れ始めた${s.name}。気になる挑戦があるけれど、今の役割も大切だ。`,options:['いまの仕事を丁寧に続ける','興味があると伝え、調整を相談する'],results:['積み重ねた経験が自信になった。次の機会に向けて準備が進む。','すぐには実現しなかったが、希望を知ってくれる人が増えた。']},
 {title:'暮らしのかたち',place:'夜のリビング',story:s=>`仕事も暮らしも、少しずつ忙しくなってきた。${s.name}は、自分の時間が前より少なくなったと感じている。`,options:['まずは今のペースで様子を見る','誰かに頼れること、減らせることを探す'],results:['休む時間の大切さに気づいた。次は自分の予定も先に入れてみたい。','すぐに全部は変わらない。でも、ひとりで抱えなくていいことが見えてきた。']},
 {title:'今日、ここにいる',place:'いつもの街',story:s=>`そして、${s.age}歳。\n\n${s.name}は、${s.home}から始まった物語を歩いてきた。${s.milestone?`\n「${s.milestone}」という大切な出来事もあった。`:''}\n\n少し違う人生。でも、どこか知っている自分。`,options:[],results:[]}
];
const futures=[['挑戦','新しい仕事や学びを探す'],['時間','自分だけの時間を増やす'],['声','自分の希望を言葉にする'],['探検','まだ知らない可能性を探す']];
const actions=['気になることを10分だけ調べる','今の気持ちを一行だけ書く','自分のための予定を一つ考える','今日は何も決めず、余韻を楽しむ'];
function shell(content){app.innerHTML=`<header class="top"><span>✦ ANOTHER LIFE</span><button class="ghost" id="restart" aria-label="最初からやり直す">↺ はじめから</button></header>${content}<div class="foot">あなたの人生に、正解はひとつじゃない。</div>`;$('#restart')?.addEventListener('click',()=>{if(confirm('保存した物語を消して最初から始めますか？')){state=fresh();persist();render()}})}
function drawScene(type){
 const canvas=$('canvas');if(!canvas)return;
 cancelAnimationFrame(anim);const ctx=canvas.getContext('2d');if(!ctx)return;
 let tick=0;const chapter=state.screen==='welcome'?0:state.screen==='future'||state.screen==='done'?5:Math.min(state.chapter||0,5);
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
function render(){stopStory();cancelAnimationFrame(anim);if(state.screen==='welcome'){shell(`<h1 class="logo">ANOTHER LIFE</h1><p class="subtitle">もうひとつの人生を、ちょっと歩いてみよう。</p><div class="panel"><div class="scene"><canvas aria-label="街に立つ小さな主人公のアニメーション"></canvas></div><div class="stars">✦ ✧ ✦</div><h2 class="heading">もし、あの日の選択が<br>少し違っていたら？</h2><p class="story">自分に似た小さな主人公と、子ども時代から今日までを旅する物語。\n最後のページは、まだ白紙。</p><button class="primary" id="begin">物語をはじめる →</button><p class="tiny">約3〜5分で遊べる試作版。入力はこの端末内に保存され、サーバーには送信されません。</p></div>`);$('#begin').onclick=()=>set({screen:'setup'});drawScene('start');return}
if(state.screen==='setup'){shell(`<h1 class="logo">あなたの物語</h1><div class="panel"><div class="chapter">PROLOGUE</div><h2 class="heading">主人公をつくろう</h2><p class="tiny">本名でなくてOK。詳しい個人情報は必要ないよ。</p><form id="setupForm"><div class="field"><label for="name">呼び名</label><input id="name" maxlength="16" value="${safe(state.name==='あなた'?'':state.name)}" placeholder="例：かほ"></div><div class="field"><label for="age">今の年齢（18〜90歳）</label><input id="age" type="number" min="18" max="90" required value="${state.age}"></div><div class="field"><label for="home">思い出のある場所</label><input id="home" maxlength="35" value="${safe(state.home)}" placeholder="例：海の近くの街"></div><div class="field"><label for="interest">昔から好きなこと</label><input id="interest" maxlength="35" value="${safe(state.interest)}" placeholder="例：動物、絵を描くこと"></div><div class="field"><label for="milestone">人生の大きな出来事（任意）</label><input id="milestone" maxlength="60" value="${safe(state.milestone)}" placeholder="例：新しい街へ引っ越した"></div><button class="primary" type="submit">私の人生を再生する ▶</button></form><p class="tiny">物語は架空の分岐です。実際の過去や未来を推定するものではありません。</p></div>`);$('#setupForm').onsubmit=e=>{e.preventDefault();set({name:$('#name').value.trim()||'あなた',age:Math.max(18,Math.min(90,Number($('#age').value)||30)),home:$('#home').value.trim()||'ある街',interest:$('#interest').value.trim()||'新しいことを知る',milestone:$('#milestone').value.trim(),chapter:0,choices:[],screen:'story'})};return}
if(state.screen==='story'){
 const i=Math.max(0,Math.min(5,state.chapter||0)),c=chapters[i],end=i===5;
 const past=state.choices[0], school=state.choices[1], voice=state.choices[2];
 const echoes=[
  '',
  '',
  past===1?'あの小道で見つけた小さな公園を、ふと思い出す。':'いつもの帰り道で聞いた、友達の笑い声を思い出す。',
  school===1?'以前、自分の好きなことを調べた夜があった。あの好奇心は今も消えていない。':'以前、勧められた道を調べたことがある。知らない世界を知った経験が今につながっている。',
  voice===1?'あの日、誰かの言葉に「どうして？」と問い返した。その一言を今も覚えている。':'あの日、胸の中の違和感をそっと整理した。自分の気持ちに耳を澄ます時間は今も大切だ。',
  school===1?'好きなことを探した日も、': '知らない可能性を調べた日も、'
 ];
 const echo=i>=2&&state.choices[i-2]!==undefined?echoes[i]:'';
 shell(`<h1 class="logo">${safe(state.name)}の人生</h1><div class="progress"><div style="width:${(i+1)/6*100}%"></div></div><div class="panel story-panel"><div class="row"><span class="chapter">CHAPTER ${String(i+1).padStart(2,'0')} · ${safe(c.place)}</span><span class="tag">${ageAt(i)}歳</span></div><div class="scene"><canvas aria-label="小さな主人公のアニメーション"></canvas></div><div class="film-caption" aria-live="polite" id="filmCaption">物語が始まる…</div><div id="filmControls"><button class="film-skip" id="skipFilm">演出をスキップ ››</button></div><div id="storyDecision" hidden><h2 class="heading">${safe(c.title)}</h2><p class="story">${safe(c.story(state))}</p>${end?`<div class="ending">ここから先は、<br>まだ誰も知らない。</div><button class="primary" id="finish">次は、どうする？ →</button>`:`<div class="chapter">あなたなら、どうする？</div><div class="choices">${c.options.map((v,n)=>`<button class="choice" data-pick="${n}">${safe(v)} →</button>`).join('')}</div>`}</div><div id="storyAfter" hidden><div class="notice">${safe(c.results[state.choices[i]]||'')}</div><button class="primary" id="nextChapter">${i===4?'今日へ進む →':'数年後へ →'}</button></div></div><button class="secondary" id="back">← ${i?'ひとつ前の章へ':'プロフィールを編集'}</button>`);
 const caption=$('#filmCaption'), decision=$('#storyDecision'), after=$('#storyAfter'),controls=$('#filmControls');
 const clips=[`${ageAt(i)}歳。${c.place}。`,echo||'今日も、小さな一日が始まる。',i===5?'そして、物語は今日に追いついた。':'何かが、少しだけ変わろうとしている。'];
 let clip=0;
 const reveal=()=>{stopStory();caption.textContent='';controls.hidden=true;if(!end&&state.choices[i]!==undefined){after.hidden=false;caption.textContent='あの日の選択が、物語に残っている。'}else decision.hidden=false;};
 const step=()=>{if(clip>=clips.length){reveal();return}caption.textContent=clips[clip++];storyTimer=setTimeout(step,clip===1?1500:1900)};
 storyTimer=setTimeout(step,350);
 $('#skipFilm').onclick=reveal;
 document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const a=[...state.choices];a[i]=Number(b.dataset.pick);state.choices=a;persist();decision.hidden=true;after.hidden=false;caption.textContent='小さな選択が、ひとつ残った。';});
 $('#nextChapter')?.addEventListener('click',()=>set({chapter:i+1}));
 $('#finish')?.addEventListener('click',()=>set({screen:'future'}));
 $('#back').onclick=()=>i?set({chapter:i-1}):set({screen:'setup'});
 drawScene(end?'end':'story');return}
if(state.screen==='future'){shell(`<h1 class="logo">AFTER STORY</h1><div class="panel"><div class="chapter">LAST EPISODE · ${state.age}歳</div><div class="scene"><canvas aria-label="主人公が新しい道を見つめるアニメーション"></canvas></div><h2 class="heading">つづきは、あなた。</h2><p class="story">もうひとつの人生は、今日のあなたに追いついた。\n\nこれから見てみたい未来は、どれ？</p><div class="choices">${futures.map(([k,v])=>`<button class="choice" data-future="${k}">${v} →</button>`).join('')}</div></div><button class="secondary" id="replay">← 最終章をもう一度見る</button>`);document.querySelectorAll('[data-future]').forEach(b=>b.onclick=()=>set({future:b.dataset.future,screen:'action'}));$('#replay').onclick=()=>set({screen:'story',chapter:5});drawScene('future');return}
if(state.screen==='action'){const label=futures.find(f=>f[0]===state.future)?.[1]||'未来を探す';shell(`<h1 class="logo">未来のしおり</h1><div class="panel"><div class="chapter">THE NEXT PAGE</div><h2 class="heading">${safe(label)}</h2><p class="story">未来を決めなくても大丈夫。まずは、あなたのペースで小さな一歩を選んでみよう。</p><div class="choices">${actions.map((a,i)=>`<button class="choice" data-action="${i}">${safe(a)} →</button>`).join('')}</div></div><button class="secondary" id="back">← 別の未来を選ぶ</button>`);document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>set({action:actions[Number(b.dataset.action)],screen:'done'}));$('#back').onclick=()=>set({screen:'future'});return}
if(state.screen==='done'){const label=futures.find(f=>f[0]===state.future)?.[1]||'未来を探す';shell(`<h1 class="logo">ANOTHER LIFE</h1><div class="panel"><div class="scene"><canvas aria-label="主人公の物語のラストシーン"></canvas></div><div class="stars">✦ ✧ ✦</div><div class="ending">次は、どうする？</div><p class="story" style="text-align:center">ここまでが、もうひとつの人生。\nここから先は、あなた自身の物語。</p><div class="notice"><b>これから見たい未来</b><br>${safe(label)}<br><br><b>最初の一歩</b><br>${safe(state.action)}</div><button class="primary" id="copy">私の未来のしおりをコピー</button><button class="secondary" id="again">別の未来も見てみる</button><button class="secondary" id="restartStory">もう一度、人生を旅する</button><p class="tiny">この端末には自動保存されています。行動しない選択も、あなたの自由です。</p></div>`);$('#copy').onclick=async()=>{const s=`ANOTHER LIFE｜未来のしおり\n${label}\n${state.action}`;try{await navigator.clipboard.writeText(s);$('#copy').textContent='コピーしたよ ✓'}catch{prompt('この文章をコピーしてね',s)}};$('#again').onclick=()=>set({screen:'future'});$('#restartStory').onclick=()=>set({screen:'story',chapter:0,choices:[]});drawScene('end')}
}
render();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
