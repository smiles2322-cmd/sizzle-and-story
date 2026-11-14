/* Sizzle & Story v2 - "Cook the story. Make the meal." */
(function(){
'use strict';
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const main = $('#main');
const KEY = 'sizzle-story-v1';
const R = Object.fromEntries(window.RECIPES.map(r => [r.id, r]));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- save data ---------- */
const DEFAULT = { started:false, coins:0, owned:[], journal:{}, story:{metMina:false}, friendship:{mina:0},
  pantry:[], places:[], shopping:{}, cooks:0,
  settings:{ large:false, contrast:false, calm:false, mode:'relaxed', units:'both', rate:1, blv:false, audioGuide:false, voice:'game', sounds:false, descriptions:false, bigButtons:false } };
let S;
function load(){ try{ S = Object.assign(structuredClone(DEFAULT), JSON.parse(localStorage.getItem(KEY)||'{}')); S.settings = Object.assign({}, DEFAULT.settings, S.settings); }catch(e){ S = structuredClone(DEFAULT); } }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
load();

function applySettings(){
  const h = document.documentElement;
  h.classList.toggle('large', !!S.settings.large);
  h.classList.toggle('contrast', !!S.settings.contrast);
  h.classList.toggle('calm', !!S.settings.calm);
  h.classList.toggle('bigbtn', !!S.settings.bigButtons);
  h.classList.toggle('kid', S.level==='little' || S.level==='junior');
  h.classList.toggle('little', S.level==='little');
}
applySettings();

function announce(t){ const l=$('#live'); l.textContent=''; setTimeout(()=>{ l.textContent=t; }, 30); }
let toastT;
function toast(t){ const el=$('#toast'); el.textContent=t; el.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>el.hidden=true, 2600); }
function setCoins(){ $('#coinCount').textContent = S.coins; }
function bumpCoins(){ const b=$('#coinBadge'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); setCoins(); }

/* ---------- Blind & Low Vision support: speech, sound cues ---------- */
const BLV_KEYS = ['audioGuide','sounds','descriptions','bigButtons'];
function setBLV(on){ S.settings.blv = on; BLV_KEYS.forEach(k=>S.settings[k]=on); save(); applySettings(); }
const SND = (()=>{ let ctx=null;
  function c(){ if(!ctx){ try{ const AC=window.AudioContext||window.webkitAudioContext; if(AC) ctx=new AC(); }catch(e){} } if(ctx && ctx.state==='suspended') ctx.resume(); return ctx; }
  function tone(f,d,type='sine',vol=.15,when=0){ const x=c(); if(!x) return; const t=x.currentTime+when, o=x.createOscillator(), g=x.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+d); o.connect(g); g.connect(x.destination); o.start(t); o.stop(t+d+0.03); }
  function noise(d,freq,vol,q=1,when=0){ const x=c(); if(!x) return; const t=x.currentTime+when, n=Math.floor(x.sampleRate*d), buf=x.createBuffer(1,n,x.sampleRate), ch=buf.getChannelData(0); for(let i=0;i<n;i++) ch[i]=Math.random()*2-1;
    const s=x.createBufferSource(); s.buffer=buf; const f=x.createBiquadFilter(); f.type='bandpass'; f.frequency.value=freq; f.Q.value=q; const g=x.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+0.03); g.gain.exponentialRampToValueAtTime(0.0001,t+d); s.connect(f); f.connect(g); g.connect(x.destination); s.start(t); s.stop(t+d+0.02); }
  return {
    ok(){ tone(660,.12,'sine',.16); tone(990,.2,'sine',.16,.11); },
    retry(){ tone(440,.14,'triangle',.14); tone(349,.22,'triangle',.14,.14); },
    coin(){ [988,1319,1568].forEach((f,i)=>tone(f,.13,'square',.04,i*.08)); },
    scrub(){ noise(.22,2500,.12,.8); },
    stir(){ noise(.3,700,.16,.9); },
    pour(){ noise(.7,450,.14,.6); },
    pop(){ tone(700+Math.random()*500,.06,'sine',.12); },
    sizzle(level){ noise(.9,3500+level*2500,.03+level*.07,.4); const pops=Math.round(level*5); for(let i=0;i<pops;i++) tone(700+Math.random()*600,.05,'sine',.08,Math.random()*.8); },
    ding(){ tone(1320,.5,'sine',.16); tone(1760,.4,'sine',.08,.05); }
  };
})();
function sfx(name, ...a){ if (S.settings.sounds){ try{ SND[name](...a); }catch(e){} } }
function speakNow(t, kid){ if (!('speechSynthesis' in window)) return; try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.rate=(S.settings.rate||1)*(kid?0.92:1); if(kid) u.pitch=1.15; speechSynthesis.speak(u); }catch(e){} }
const gameVoice = () => S.settings.audioGuide && S.settings.voice!=='sr';
let lastSaid = '';
/* say(): every game event goes to the screen-reader live region; Audio Guide (game voice) also speaks it */
function say(t){ lastSaid=t; announce(t); if (gameVoice()) speakNow(t); }
function guide(t){ lastSaid=t; if (gameVoice()) speakNow(t); }          /* speech only (focus already reads it) */
function describeScene(t){ if (S.settings.descriptions) say(t); }
function repeatLast(){ if (!lastSaid) return; announce(lastSaid); if (gameVoice() || lvl()==='little') speakNow(lastSaid, lvl()==='little'); }
document.addEventListener('keydown', e=>{
  if (e.target.closest && e.target.closest('input,select,textarea,.hf')) return;
  if ((e.key==='r'||e.key==='R') && !e.ctrlKey && !e.metaKey && !e.altKey){ repeatLast(); return; }
  if (['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)){
    const grp = e.target.closest && e.target.closest('.choices,.ingr-grid,.seg,.lvl-list,.tabbar,.hf-ctrl');
    if (!grp) return;
    const items = $$('button:not([disabled])', grp).filter(b=>b.offsetParent!==null); const i = items.indexOf(e.target); if (i<0) return;
    const d = (e.key==='ArrowDown'||e.key==='ArrowRight') ? 1 : -1; items[(i+d+items.length)%items.length].focus(); e.preventDefault();
  }
});
const NV_GENERAL = [
  'Tactile measuring cups and spoons (marked with raised dots or Braille) make measuring by touch easy. Measure dry ingredients over a rimmed tray to catch spills, and level the cup by sliding a flat knife across the top.',
  'A talking kitchen scale lets you weigh ingredients in grams, which is often easier than cups.',
  'A liquid level indicator clips on the side of a cup and beeps when liquid reaches the top.',
  'A talking instant-read thermometer reads the temperature aloud, so you can check food is safe by temperature, not by looks.',
  'Keep pan handles turned inward and always know where the handle points. Use long oven mitts that cover your forearms.',
  'Put tools and ingredients in the same spots every time (for example, clock positions on a tray) so you can find them by touch.',
  'Use a talking timer or a phone timer with sound for every cooking time.'
];

/* ---------- amounts ---------- */
const FR = [[0,''],[1/8,'1/8'],[1/4,'1/4'],[1/3,'1/3'],[1/2,'1/2'],[2/3,'2/3'],[3/4,'3/4'],[7/8,'7/8'],[1,'']];
function fmtUS(n){
  if (n==null) return '';
  let w = Math.floor(n), f = n - w, best = FR[0];
  for (const x of FR) if (Math.abs(x[0]-f) < Math.abs(best[0]-f)) best = x;
  if (best[0]===1){ w+=1; best=FR[0]; }
  if (w===0 && !best[1]) return '1/8';
  return (w? w : '') + (w && best[1] ? ' ' : '') + best[1];
}
function fmtM(n){ if (n==null) return ''; if (n<10) return String(Math.round(n*2)/2); if (n>=100) return String(Math.round(n/5)*5); return String(Math.round(n)); }
const SING = { cups:'cup', cloves:'clove', sheets:'sheet' };
function unitFor(u, n){ return (n<=1 && SING[u]) ? SING[u] : u; }
function ingLine(ing, f){
  const nUS = ing.us[0]==null ? null : ing.us[0]*f, nM = ing.m[0]==null ? null : ing.m[0]*f;
  if (nUS==null) return { amt:'', met:'', name:ing.name };
  const name = nUS>1 ? (ing.many||ing.name) : (ing.one||ing.name);
  const us = (fmtUS(nUS) + ' ' + unitFor(ing.us[1], nUS)).trim();
  const met = ing.m[1] ? (fmtM(nM) + ' ' + ing.m[1]).trim() : '';
  const u = S.settings.units;
  const r = u==='us' ? { amt:us, met:'', name } : u==='metric' ? { amt: met || us, met:'', name } : { amt:us, met: met && met!==us ? '('+met+')' : '', name };
  if (!ing.us[1] && /egg/.test(ing.name) && Math.abs(nUS-Math.round(nUS))>0.01) r.name += ' (beat the eggs, then use the part you need)';
  return r;
}

/* ---------- decorations (SVG) ---------- */
const DECOR = [
  { id:'vase', name:'Sea-glass flower vase', price:15, desc:'A blue-green bottle of daisies for the counter.' },
  { id:'board', name:'Chalkboard menu', price:20, desc:'Shows today’s special to everyone walking by.' },
  { id:'bunting', name:'Seaside bunting', price:25, desc:'Striped flags strung across the ceiling.' },
  { id:'plant', name:'Potted monstera', price:30, desc:'A big leafy plant for the shelf corner.' },
  { id:'chime', name:'Seashell wind chime', price:35, desc:'Jingles softly when the door opens.' },
  { id:'lights', name:'Warm string lights', price:40, desc:'Glowing bulbs that make evenings cozy.' }
];
function decorSVG(id, special){
  switch(id){
  case 'lights': { let b=''; const cols=['#ffd36e','#ff9f6e','#fff1a8','#ffc26e','#ffe08a'];
    for(let i=0;i<11;i++){ const x=4+i*9.2, y=18+Math.sin(i*0.9)*6+ (i%2?6:0); b+=`<line x1="${x}" y1="${y-6}" x2="${x}" y2="${y-2}" stroke="#3b2b20" stroke-width=".6"/><ellipse class="bulb" cx="${x}" cy="${y+1.5}" rx="2.2" ry="3" fill="${cols[i%5]}" style="animation-delay:${i*.2}s"/><circle cx="${x}" cy="${y+1.5}" r="5" fill="${cols[i%5]}" opacity=".25"/>`; }
    return `<svg viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 Q 25 30 50 14 T 100 12" fill="none" stroke="#3b2b20" stroke-width=".8"/>${b}</svg>`; }
  case 'plant': return `<svg viewBox="0 0 60 80" aria-hidden="true"><path d="M30 46 C10 40 4 22 12 8 C20 20 26 30 30 46Z" fill="#3f8f4a"/><path d="M30 46 C48 38 56 22 50 6 C40 18 34 30 30 46Z" fill="#2f7a3d"/><path d="M30 46 C22 30 24 14 32 2 C38 16 36 32 30 46Z" fill="#4fa35a"/><path d="M17 20l4 3M45 18l-4 3M31 14v6" stroke="#cfe8c8" stroke-width="1.2"/><path d="M14 46h32l-4 30H18z" fill="#c7643a"/><rect x="12" y="44" width="36" height="7" rx="2" fill="#a94f2b"/></svg>`;
  case 'board': return `<svg viewBox="0 0 70 60" aria-hidden="true"><rect x="2" y="2" width="66" height="50" rx="4" fill="#8a5a36"/><rect x="6" y="6" width="58" height="42" rx="2" fill="#2e3b33"/><text x="35" y="18" font-size="7" fill="#fff" text-anchor="middle" font-family="cursive">Today's special</text><text x="35" y="31" font-size="8.5" fill="#ffe08a" text-anchor="middle" font-family="cursive" font-weight="bold">${esc(special||'Fluffy Pancakes')}</text><text x="35" y="42" font-size="6" fill="#fff" text-anchor="middle" font-family="cursive">made from scratch ♡</text><path d="M20 52l-4 8M50 52l4 8" stroke="#8a5a36" stroke-width="3"/></svg>`;
  case 'bunting': { let f=''; const c=['#e0703a','#ffffff','#2f8f8a','#ffd36e']; for(let i=0;i<12;i++){ const x=i*8.5+1; const y=6+Math.sin(i/11*Math.PI)*8; f+=`<path d="M${x} ${y} L${x+7} ${y+0.6} L${x+3.6} ${y+12}Z" fill="${c[i%4]}" stroke="#7a5236" stroke-width=".3"/>`; }
    return `<svg viewBox="0 0 104 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 6 Q52 22 104 6" fill="none" stroke="#7a5236" stroke-width=".7"/>${f}</svg>`; }
  case 'chime': return `<svg viewBox="0 0 40 90" aria-hidden="true"><g><line x1="20" y1="0" x2="20" y2="10" stroke="#7a5236"/><ellipse cx="20" cy="12" rx="14" ry="3" fill="#b78a5b"/>${[6,13,20,27,34].map((x,i)=>`<line x1="${x}" y1="12" x2="${x}" y2="${40+i%2*12}" stroke="#7a5236" stroke-width=".6"/><path d="M${x-4} ${40+i%2*12} q4 -8 8 0 q-4 6 -8 0z" fill="${['#fbe3d4','#f6c9b0','#fff2e6','#f3d1c2','#fde8dc'][i]}" stroke="#c99c84" stroke-width=".5"/>`).join('')}</g></svg>`;
  case 'vase': return `<svg viewBox="0 0 40 60" aria-hidden="true">${[[12,8],[20,4],[28,9],[16,14],[25,15]].map(([x,y])=>`<line x1="20" y1="34" x2="${x}" y2="${y+4}" stroke="#4f8a3f" stroke-width="1"/><g transform="translate(${x} ${y+3})">${[0,72,144,216,288].map(a=>`<ellipse rx="1.6" ry="3.6" cy="-3" fill="#fff" transform="rotate(${a})"/>`).join('')}<circle r="1.7" fill="#ffcc33"/></g>`).join('')}<path d="M14 32h12c0 6 5 8 5 16 0 8-5 10-11 10s-11-2-11-10c0-8 5-10 5-16z" fill="#7fc8b8" opacity=".9"/><path d="M15 40c-2 4-2 10 1 14" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"/></svg>`;
  }
  return '';
}

/* ---------- characters ---------- */
const MINA = { name:'Mina Hoshino', img:{ happy:'img/mina_happy.jpg', shy:'img/mina_shy.jpg', delighted:'img/mina_delighted.jpg' },
  alt:{ happy:'Mina, a student with a short chestnut bob, yellow hair clip and mint hoodie, smiling brightly', shy:'Mina rubbing the back of her neck with a shy, slightly worried smile', delighted:'Mina with eyes closed in bliss, hand on her cheek, hearts and sparkles around her, a stack of pancakes in front of her' } };
const UPCOMING = [ { who:'A homesick traveler', hint:'wants a taste of home' }, { who:'The harbor fisherman', hint:'up before dawn' }, { who:'A retired baker', hint:'knows every trick' }, { who:'A night-shift nurse', hint:'needs something quick' } ];

const MINA_DIALOGUE_FULL = [
  { who:'narr', text:'The little bell over the door jingles. A girl with an armful of textbooks peeks inside.' },
  { who:'mina', mood:'shy', text:'Um, hi! Are you open? The sign still says “Closed,” but the door was unlocked…' },
  { who:'choice', options:[ { t:'Come in! We just reopened today.', reply:'Really? Lucky me!' }, { t:'You’re our very first customer.', reply:'The first? No pressure, right? Ha!' } ] },
  { who:'mina', mood:'happy', text:'I’m Mina Hoshino. First year, marine biology, at the college on the hill.' },
  { who:'mina', mood:'shy', text:'Textbooks ate my whole budget this month. I keep skipping breakfast, and by my 9 a.m. lab my brain is running on fumes.' },
  { who:'mina', mood:'happy', text:'On exam days back home, my dad made fluffy pancakes from scratch. Cheap, warm, and they kept me going till lunch. Could you make something like that?' },
  { who:'narr', text:'Pancakes from pantry staples are one of the most affordable breakfasts there is: flour, milk, one egg, a little butter. You tie on your apron.' }
];

/* ---------- pancake gameplay ---------- */
const PANCAKE_STEPS = [
  { type:'tap', title:'Wash your hands', action:'Scrub with soap', n:6, scene:'sink', real:'20 seconds',
    instr:'Tap Scrub to lather up. Cover palms, backs of hands, between fingers, and under nails.',
    why:'You are about to crack a raw egg. Scrubbing with soap for a full 20 seconds removes germs so they do not end up in the food.' },
  { type:'choice', title:'Measure the flour the right way', scene:'bowl', real:'about 1 minute',
    q:'You need 1 1/2 cups (190 g) of flour. How do you measure it?',
    options:[ { t:'Scoop the cup straight into the bag and pack it down', ok:false, fb:'Packing can add a quarter more flour than the recipe needs, which makes pancakes dry and dense.' },
              { t:'Spoon flour into the cup, then level it off with a knife (or weigh 190 g)', ok:true },
              { t:'Eyeball it. Close enough!', ok:false, fb:'Baking depends on ratios. Too much or too little flour changes the whole pancake.' } ],
    why:'Spooning and leveling, or weighing, gives the same amount every time. That is how a recipe turns out the way it was tested.' },
  { type:'collect', title:'Measure the dry ingredients', scene:'bowl', real:'about 2 minutes',
    instr:'Tap each dry ingredient to measure it into the big bowl. One item does not belong in this recipe.',
    items:[ { k:'flour', t:'Flour', a:'1 1/2 cups (190 g)' }, { k:'bp', t:'Baking powder', a:'3 1/2 tsp (14 g)' }, { k:'sugar', t:'Sugar', a:'1 Tbsp (13 g)' }, { k:'salt', t:'Salt', a:'1/2 tsp (3 g)' },
            { k:'soda', t:'Baking soda', a:'not in this recipe', decoy:'Not this one. Baking soda needs an acid such as buttermilk to work. This recipe rises with baking powder.' } ],
    why:'Baking powder is what makes pancakes rise and turn fluffy. Salt and a little sugar bring out flavor and help them brown.' },
  { type:'tap', title:'Whisk the dry ingredients', action:'Whisk', n:8, scene:'bowl', real:'about 30 seconds',
    instr:'Tap Whisk until everything is evenly blended.',
    why:'Whisking spreads the baking powder evenly, so every pancake rises instead of just a few.' },
  { type:'collect', title:'Mix the wet ingredients', scene:'bowl2', real:'about 3 minutes, including melting the butter',
    instr:'In a second bowl, add the wet ingredients.',
    items:[ { k:'milk', t:'Milk', a:'1 1/4 cups (300 ml)' }, { k:'egg', t:'Egg', a:'1 large, cracked' }, { k:'butter', t:'Melted butter, slightly cooled', a:'3 Tbsp (42 g)' } ],
    safety:'After cracking the egg, wash your hands before touching other food.',
    why:'Letting the melted butter cool for a minute keeps it from cooking the egg. Mixing the wet ingredients first means fewer stirs later.' },
  { type:'meter', title:'Combine gently', scene:'bowl3', real:'about 30 seconds',
    instr:'Pour the wet ingredients into the dry. Tap Stir, then tap Stop when the batter is just combined.',
    why:'Stirring builds gluten. Stop when no dry flour remains. A few small lumps are fine. Overmixed batter makes flat, chewy pancakes.' },
  { type:'choice', title:'Safety check', scene:'bowl3', real:'',
    q:'Mina asks: “Can I taste a little batter to check the sweetness?”',
    options:[ { t:'Sure, just a tiny lick', ok:false, fb:'Raw batter has raw egg and raw flour, which can carry Salmonella and E. coli.' },
              { t:'No. Raw egg and raw flour can make you sick. Taste the cooked pancake instead.', ok:true },
              { t:'Only if the batter looks clean', ok:false, fb:'You cannot see bacteria. How food looks never tells you it is safe.' } ],
    why:'Flour is a raw farm product and eggs can carry Salmonella. Cooking all the way through is what makes them safe to eat.', safety:true },
  { type:'choice', title:'Heat the pan', scene:'pan0', real:'2 to 3 minutes to preheat, while the batter rests 5 minutes',
    q:'What heat do pancakes need?',
    options:[ { t:'Low, about 275°F (135°C)', ok:false, fb:'Too low: pancakes cook slowly, stay pale, and dry out.' },
              { t:'Medium, about 375°F (190°C) on a griddle, lightly buttered', ok:true },
              { t:'High, 450°F (230°C) or hotter', ok:false, fb:'Too hot: the outside burns before the middle cooks through.' } ],
    why:'Medium heat browns the outside at the same pace the center cooks. Resting the batter while the pan heats lets the flour soak up the liquid.' },
  { type:'tap', title:'Pour the batter', action:'Pour 1/4 cup', n:3, scene:'pour', real:'a few seconds each',
    instr:'Pour three pancakes, using 1/4 cup (60 ml) of batter for each. Leave space between them.',
    why:'Using the same amount for each pancake means they all cook in the same time.' },
  { type:'timing', title:'Watch for bubbles, then flip', scene:'flip', real:'about 2 minutes (sped up here)', dur:9000,
    instr:'Bubbles will rise and pop. Flip when the bubbles pop and stay open and the edges look dry.',
    why:'Open, popped bubbles and set edges mean the bottom is golden and firm enough to flip without tearing.' },
  { type:'choice', title:'Is it cooked through?', scene:'flipped', real:'1 to 2 minutes on the second side',
    q:'The second side is golden. How do you check that the pancake is done?',
    options:[ { t:'It is brown on the outside, so it is done', ok:false, fb:'Color alone can fool you. A hot pan can brown the outside while the middle is still raw batter.' },
              { t:'Press the center: it springs back, and there is no wet batter inside', ok:true },
              { t:'Cook it 10 more minutes, just in case', ok:false, fb:'That burns it. Check the center instead.' } ],
    why:'A springy center with no wet batter means the egg and flour inside are fully cooked.', safety:true },
  { type:'plate', title:'Plate it for Mina', scene:'plate', real:'1 minute',
    instr:'Choose toppings, then serve while the pancakes are warm.',
    toppings:[ { k:'butter', t:'Pat of butter' }, { k:'syrup', t:'Maple syrup' }, { k:'straw', t:'Strawberries' }, { k:'blue', t:'Blueberries' } ],
    why:'Serve pancakes warm. If you cook a big batch, keep the finished ones under a clean towel. Refrigerate leftovers within 2 hours.' }
];

/* ---------- stage art ---------- */
function bowlSVG(fill, level, label){
  const h = 70*level;
  return `<svg viewBox="0 0 240 170" role="img" aria-label="${esc(label)}">
  <ellipse cx="120" cy="150" rx="95" ry="12" fill="#000" opacity=".08"/>
  <clipPath id="bc"><path d="M25 60 Q30 150 120 150 Q210 150 215 60Z"/></clipPath>
  <path d="M25 60 Q30 150 120 150 Q210 150 215 60Z" fill="#f7f3ee" stroke="#c9b8a6" stroke-width="3"/>
  <g clip-path="url(#bc)"><rect x="20" y="${150-h}" width="200" height="${h}" fill="${fill}"/>${level>0?`<ellipse cx="120" cy="${150-h}" rx="96" ry="9" fill="#fff" opacity=".35"/>`:''}</g>
  <ellipse cx="120" cy="60" rx="95" ry="16" fill="none" stroke="#c9b8a6" stroke-width="3"/>
  <path d="M60 85 Q70 120 105 135" stroke="#fff" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/></svg>`;
}
function panSVG(n, bubbles, done, flipped){
  const spots=[[95,95],[160,80],[150,140]];
  let p='';
  for(let i=0;i<n;i++){ const [x,y]=spots[i];
    const col = flipped ? '#d9963f' : (done>0.85? '#e8c27a':'#f3dfa9');
    p+=`<circle cx="${x}" cy="${y}" r="30" fill="${col}" stroke="${flipped?'#b8742a':'#e2c483'}" stroke-width="3"/>`;
    if(!flipped){ for(let b=0;b<bubbles;b++){ const a=b*2.4+i, r=8+((b*7)%18); const open = done>0.55 && b%2===0;
      p+=`<circle cx="${x+Math.cos(a)*r}" cy="${y+Math.sin(a)*r}" r="${open?2.8:2}" fill="${open?'#c9a160':'#fff7dd'}" stroke="#c9a160" stroke-width=".8"/>`; } }
    else p+=`<path d="M${x-14} ${y-6} q14 -10 28 0" stroke="#fff" stroke-width="3" fill="none" opacity=".4"/>`;
  }
  return `<svg viewBox="0 0 260 210" role="img" aria-label="Pan with ${n} pancake${n===1?'':'s'}${flipped?', flipped and golden':''}">
   <rect x="196" y="98" width="62" height="16" rx="8" fill="#3a3330" transform="rotate(-10 196 98)"/>
   <circle cx="125" cy="108" r="98" fill="#2f2b29"/><circle cx="125" cy="108" r="86" fill="#45403c"/>
   ${n===0?'<ellipse cx="125" cy="108" rx="30" ry="20" fill="#f5d77a" opacity=".55"/><text x="125" y="113" text-anchor="middle" font-size="12" fill="#fff">butter</text>':''}${p}
   <path d="M60 60 q20 -20 50 -22" stroke="#fff" stroke-width="5" opacity=".12" fill="none"/></svg>`;
}
function plateSVG(t){
  return `<svg viewBox="0 0 260 200" role="img" aria-label="Plate with a stack of three pancakes${t.size? ', topped with '+[...t].map(k=>({butter:'a pat of butter',syrup:'maple syrup',straw:'strawberries',blue:'blueberries'})[k]).join(', '):''}">
  <ellipse cx="130" cy="170" rx="120" ry="24" fill="#fff" stroke="#e1d4c4" stroke-width="3"/>
  ${[0,1,2].map(i=>`<ellipse cx="130" cy="${150-i*24}" rx="82" ry="20" fill="#cf8a3a"/><rect x="48" y="${132-i*24}" width="164" height="18" fill="#e7b46a"/><ellipse cx="130" cy="${132-i*24}" rx="82" ry="20" fill="#d99848"/>`).join('')}
  ${t.has('syrup')?`<path d="M70 86 q60 -18 120 0 l-4 34 q-4 8 -6 0 l-3 -18 q-40 8 -90 -2 l-3 26 q-3 8 -6 0z" fill="#8a4a12" opacity=".8"/>`:''}
  ${t.has('butter')?`<rect x="113" y="70" width="34" height="20" rx="4" fill="#fff1a3" stroke="#e7c95a" stroke-width="2"/>`:''}
  ${t.has('straw')?`<path d="M40 168 q-6 -16 10 -18 q16 2 10 18 q-6 6 -10 6 q-4 0 -10 -6z" fill="#e23b3b"/><path d="M205 168 q-6 -16 10 -18 q16 2 10 18 q-6 6 -10 6 q-4 0 -10 -6z" fill="#e23b3b"/>`:''}
  ${t.has('blue')?[[70,182],[84,186],[180,184],[194,180]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#3b4f9a"/>`).join(''):''}
  <path d="M100 40 q-8 -14 0 -26 M130 36 q-8 -14 0 -26 M160 40 q-8 -14 0 -26" stroke="#c9b8a6" stroke-width="3" fill="none" opacity=".7" class="steam"/></svg>`;
}
function sinkSVG(k, n){
  let b=''; for(let i=0;i<k*3;i++){ b+=`<circle cx="${80+((i*37)%90)}" cy="${70+((i*23)%60)}" r="${5+(i%3)*3}" fill="#fff" stroke="#9cc7e0" stroke-width="1.5" opacity=".9"/>`; }
  return `<svg viewBox="0 0 240 180" role="img" aria-label="Hands lathered with soap, ${Math.round(k/n*20)} of 20 seconds scrubbed">
   <rect x="20" y="130" width="200" height="40" rx="10" fill="#cfd8dc"/><path d="M110 10 h40 v20 h-14 v20 h-12 v-20 h-14z" fill="#9aa5ab"/>
   <path d="M130 52 v70" stroke="#8fd0f0" stroke-width="6" opacity="${k<n?'.7':'0'}"/>
   <path d="M70 120 q-10 -50 30 -60 q30 -6 40 20 q20 -20 40 0 q10 30 -20 50z" fill="#f2c7a5"/>${b}</svg>`;
}

/* ---------- router ---------- */
let current = 'title', prev = 'cafe';
function go(name, arg){
  stopSpeech(); $('#toast').hidden = true;
  if (!['recipe','shoplist'].includes(name)) prev = ['result','kitchen','dialogue','intro','title','who','kiddialogue','kidkitchen','kidresult'].includes(name) ? 'journal' : name;
  current = name;
  const showBars = !['title','intro','dialogue','kitchen','who','kiddialogue','kidkitchen'].includes(name);
  $('#topbar').hidden = name==='title' || name==='who';
  applySettings();
  $('#tabbar').hidden = !showBars;
  $$('#tabbar button').forEach(b => b.setAttribute('aria-current', b.dataset.go===name || (name==='recipe'&&b.dataset.go==='recipes') || (name==='shoplist'&&b.dataset.go==='recipes') ? 'page':'false'));
  setCoins();
  main.innerHTML = '';
  (VIEWS[name]||VIEWS.cafe)(arg);
  window.scrollTo(0,0);
  const h = $('h1', main); if (h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); if (!['kitchen','kidkitchen','dialogue','kiddialogue','result','kidresult','who'].includes(name) && lvl()!=='little') guide(h.textContent); }
}
$$('#tabbar button').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));

const VIEWS = {};

VIEWS.title = () => {
  main.innerHTML = `
  <button class="btn alt blv-offer" id="blvOffer" aria-pressed="${!!S.settings.blv}">${S.settings.blv?'Blind &amp; Low Vision mode is on':'Turn on Blind &amp; Low Vision mode'}<span class="sr">: the game reads everything aloud, adds sound cues, and uses larger buttons. You can change this in Settings.</span></button>
  <div class="title-hero"><img src="img/pancakes.jpg" alt="${esc(R.pancakes.alt)}">
   <div class="over"><h1 class="logo">Sizzle &amp; Story</h1><p class="slogan">Cook the story. Make the meal.</p></div></div>
  <div class="card center">
   <p>Restore a little seaside café, meet the neighbors, and learn real recipes you can cook at home.</p>
   <button class="btn big block" id="start">${S.started?'Continue':'Start your story'}</button>
  </div>`;
  $('#blvOffer').onclick = () => { setBLV(!S.settings.blv); const b=$('#blvOffer'); b.setAttribute('aria-pressed', !!S.settings.blv); b.firstChild.textContent = S.settings.blv?'Blind & Low Vision mode is on':'Turn on Blind & Low Vision mode'; say(S.settings.blv?'Blind and Low Vision mode is on. The game will read everything aloud. Press Start to begin.':'Blind and Low Vision mode is off.'); if (S.settings.blv) sfx('ok'); };
  $('#start').onclick = () => { if(!S.started){ S.started=true; save(); } if (!S.level) go('who'); else go(S.introSeen?'cafe':'intro'); };
};

VIEWS.intro = () => {
  if (lvl()==='little'){ main.innerHTML = `<h1 class="center">Welcome to the café!</h1><img class="rhero" src="img/cafe_bg.jpg" alt="A cozy café by the sea"><div class="row" style="justify-content:center;margin-top:14px"><button class="btn round huge" id="open" aria-label="Open the café"><span aria-hidden="true">➜</span></button></div>`; kidSay('Welcome to your café by the sea! Let\u2019s cook yummy food for friends!'); $('#open').onclick=()=>{ S.introSeen=true; save(); go('cafe'); }; return; }
  main.innerHTML = `<h1>Welcome to Port Lumi</h1>
  <div class="card"><p>Your aunt Rosa has left you the <b>Little Tide Café</b>, a tiny spot overlooking the harbor of a colorful seaside town.</p>
  <p>The shelves are bare and the regulars have drifted away. But the stove still works, and the town is hungry.</p>
  <p>One good meal at a time, you can bring it back to life.</p>
  <div class="why"><b>How it works</b>Every dish you cook here is a real recipe. Each step follows the real order and explains why it matters. When you finish, tap <b>Cook This for Real</b> to make it at home.</div>
  <button class="btn big block" id="open">Open the café</button></div>`;
  $('#open').onclick = () => { S.introSeen=true; save(); go('cafe'); };
};

function sceneHTML(){
  const own = new Set(S.owned);
  const d = DECOR.filter(x=>own.has(x.id)).map(x=>`<div class="decor ${x.id}">${decorSVG(x.id)}</div>`).join('');
  const minaImg = !S.story.metMina ? 'img/mina_shy_cut.webp' : 'img/mina_happy_cut.webp';
  const alt = !S.story.metMina ? 'Mina, a student, waiting shyly by the door' : 'Mina, now a regular, smiling at the counter';
  return `<div class="scene" id="scene"><img class="bg" src="img/cafe_bg.jpg" alt="Inside the Little Tide Café: a wooden counter, stools, and a big window over a colorful harbor town and the sea">
    ${d}<div class="sign" aria-hidden="true">Little Tide Café</div><p class="sr">${S.owned.length? 'Decorations in the café: '+DECOR.filter(x=>own.has(x.id)).map(x=>x.name+' ('+x.desc.replace(/\.$/,'')+')').join('; ')+'.' : 'No decorations yet. The walls and shelves are bare.'}</p>
    <img class="visitor ${S.story.metMina?'':'enter'}" src="${minaImg}" alt="${alt}"></div>`;
}

VIEWS.cafe = () => {
  const charm = Math.round((S.owned.length/DECOR.length)*100);
  const first = !S.story.metMina;
  main.innerHTML = `<h1 class="sr">The Little Tide Café</h1>
  <div class="two"><div>${sceneHTML()}</div>
  <div>
   <div class="card">
    ${first ? `<h2>A customer is at the door!</h2><p>A student is peeking in. Your very first customer.</p><button class="btn big block" id="greet">Greet her</button>`
            : `<h2>Mina is back</h2><p>Mina drops by before her morning lab. Practice her pancakes again to earn more coins.</p>
               <div class="row"><button class="btn block" id="again">Cook pancakes again</button><button class="btn alt block" id="real">Cook This for Real: Pancakes</button></div>`}
   </div>
   <div class="card"><h2>Café charm</h2>
    <div class="charm" role="progressbar" aria-label="Café charm" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${charm}" aria-valuetext="${charm} percent"><span style="width:${charm}%"></span></div>
    <p class="muted">${S.owned.length} of ${DECOR.length} decorations placed. ${S.owned.length<DECOR.length?'Earn coins by cooking and spend them in Decorate.':'The café is glowing!'}</p>
    <button class="btn alt" id="dec">Decorate the café</button></div>
   <div class="card"><h2 id="regH">Regulars</h2><div class="cust-row" tabindex="0" role="region" aria-labelledby="regH">
    <div class="cust"><img src="img/mina_happy.jpg" alt="Mina smiling">Mina<br><span class="muted">${S.friendship.mina? '♥ Friend Lv '+S.friendship.mina : 'New face'}</span></div>
    ${UPCOMING.map(u=>`<div class="cust"><div class="sil" aria-hidden="true">?</div>${esc(u.who)}<br><span class="muted">Coming soon</span></div>`).join('')}
   </div></div>
  </div></div>`;
  if (lvl()==='little' && first) kidSay('Someone is at the door! Tap Greet her!');
  else if (first) guide('The Little Tide Café. A customer is at the door. Press Greet her.');
  describeScene('You are in your café. A wooden counter, stools, and a big window looking over the harbor and the sea. '+(first?'Mina, a student, waits shyly by the door.':'Mina, your regular, smiles at the counter.'));
  if (first) $('#greet').onclick = () => go(lvl()==='little'?'kiddialogue':'dialogue');
  else { $('#again').onclick = () => go(lvl()==='little'?'kidkitchen':'kitchen', {practice:true}); $('#real').onclick = () => go('recipe','pancakes'); }
  $('#dec').onclick = () => go('shop');
};

VIEWS.dialogue = () => {
  let i = 0; const MINA_DIALOGUE = lvl()==='junior' ? JR_DIALOGUE : MINA_DIALOGUE_FULL;
  main.innerHTML = `<div class="dlg-wrap"><img class="portrait" id="por" src="${MINA.img.shy}" alt="${esc(MINA.alt.shy)}">
   <div class="dlg-box"><span class="dlg-name" id="nm" aria-hidden="true">Mina</span><h1 class="sr">Meet your first customer</h1>
   <div aria-live="polite" aria-atomic="true"><span class="sr" id="who"></span><p class="mood" id="mood"></p><p class="dlg-text" id="txt"></p></div><div id="opts" class="choices"></div>
   <div class="row" style="justify-content:space-between"><button class="btn alt" id="skip">Skip</button>${S.settings.audioGuide?'<button class="btn alt" id="rep">↻ Repeat</button>':''}<button class="btn" id="next">Next <span aria-hidden="true">▸</span></button></div></div></div>`;
  const rp=$('#rep'); if (rp) rp.onclick=repeatLast;
  const por=$('#por'), txt=$('#txt'), nm=$('#nm'), opts=$('#opts'), next=$('#next'), mood=$('#mood');
  function show(){
    const L = MINA_DIALOGUE[i]; opts.innerHTML=''; next.hidden=false;
    if (!L){ return finish(); }
    if (L.who==='narr'){ nm.textContent='Story'; mood.textContent=''; txt.innerHTML = `<i>${esc(L.text)}</i>`; }
    else if (L.who==='mina'){ nm.textContent='Mina'; por.src=MINA.img[L.mood]; por.alt=MINA.alt[L.mood]; mood.textContent = L.mood==='shy'?'(shy, a little nervous)':'(smiling brightly)'; txt.textContent = L.text; }
    else if (L.who==='choice'){ nm.textContent='You'; mood.textContent=''; txt.textContent='What do you say?'; next.hidden=true;
      L.options.forEach(o=>{ const b=document.createElement('button'); b.className='choice'; b.textContent=o.t; b.onclick=()=>{ opts.innerHTML=''; nm.textContent='Mina'; $('#who').textContent='Mina says:'; por.src=MINA.img.happy; por.alt=MINA.alt.happy; mood.textContent='(lights up)'; txt.textContent=o.reply; next.hidden=false; next.focus(); guide('Mina, lighting up. '+o.reply); }; opts.appendChild(b); });
      opts.firstChild.focus(); }
    if (i===MINA_DIALOGUE.length-1) next.innerHTML='Head to the kitchen <span aria-hidden="true">▸</span>';
    $('#who').textContent = nm.textContent+' says:';
    guide((nm.textContent==='Story'?'':nm.textContent+'. ')+(mood.textContent?mood.textContent.replace(/[()]/g,'')+'. ':'')+txt.textContent);
    lastSaid = txt.textContent;
  }
  function finish(){ go('kitchen', {practice:false}); }
  next.onclick = () => { i++; if (i>=MINA_DIALOGUE.length) finish(); else show(); };
  $('#skip').onclick = finish;
  show();
};

/* ---------- kitchen ---------- */
VIEWS.kitchen = (opt={}) => {
  if (lvl()==='little') return VIEWS.kidkitchen(opt);
  const junior = lvl()==='junior'; const steps = junior ? JUNIOR_STEPS : PANCAKE_STEPS, challenge = !junior && S.settings.mode==='challenge';
  let idx = 0, score = 0, max = 0, t0 = Date.now(), timerInt = null, tick=null;
  const toppings = new Set();
  const r = R.pancakes;
  main.innerHTML = `<div class="row" style="justify-content:space-between"><h1 style="margin:0">Fluffy Pancakes</h1>
     <span class="chip">${junior?'🎒 Junior Chef':challenge?'⏱ Challenge mode':'🌿 Relaxed mode'}</span></div>
   <div class="timechip"><span class="chip">Real prep: ${r.prep} min</span><span class="chip">Real cook: ${r.cook} min</span>${challenge?'<span class="chip timer" id="tm" role="timer" aria-live="off">0:00</span>':''}</div>
   <div class="steps-dots" aria-hidden="true">${steps.map(()=>'<span></span>').join('')}</div>
   <div class="two"><div class="stage" id="stage"></div><div id="panel"></div></div>`;
  if (challenge){ let lastMin=0; timerInt = setInterval(()=>{ const s=Math.floor((Date.now()-t0)/1000); const el=$('#tm'); if(!el) return clearInterval(timerInt); el.textContent = Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); el.setAttribute('aria-label','Time '+Math.floor(s/60)+' minutes '+(s%60)+' seconds'); const m=Math.floor(s/60); if (m>lastMin){ lastMin=m; announce('Timer: '+m+(m===1?' minute':' minutes')); } },500); }
  const stage=$('#stage'), panel=$('#panel');
  const state = { dry:0, wet:0, mix:0, poured:0 };

  function drawStage(sc, extra){
    let h='';
    if (sc==='sink') h = sinkSVG(extra?.k||0, extra?.n||6);
    else if (sc==='bowl') h = bowlSVG('#f3ead8', state.dry/4*0.7, 'Mixing bowl with dry ingredients');
    else if (sc==='bowl2') h = bowlSVG('#fbf5e6', state.wet/3*0.6, 'Second bowl with milk, egg and melted butter');
    else if (sc==='bowl3') h = bowlSVG(state.mix>0.75?'#e8d3a0':'#f1dfb0', 0.75, 'Bowl of pancake batter');
    else if (sc==='pan0') h = panSVG(0,0,0,false);
    else if (sc==='pour') h = panSVG(state.poured,0,0,false);
    else if (sc==='flip') h = panSVG(3, extra?.b||0, extra?.p||0, false);
    else if (sc==='flipped') h = panSVG(3,0,1,true);
    else if (sc==='plate') h = plateSVG(toppings);
    stage.innerHTML = h;
  }
  function dots(){ $$('.steps-dots span').forEach((d,i)=>d.className = i<idx?'done':i===idx?'now':''); }
  function header(st){
    return `<p class="muted" style="margin:0" aria-hidden="true">Step ${idx+1} of ${steps.length}</p><h2 id="stepH" tabindex="-1"><span class="sr">Step ${idx+1} of ${steps.length}: </span>${esc(st.title)}</h2>
      ${st.real?`<p class="chip"><span aria-hidden="true">⏲</span> Real time: ${esc(st.real)}</p>`:''}${S.settings.audioGuide?'<button class="btn alt small-btn" id="rep">↻ Repeat</button>':''}`;
  }
  function whyBox(st){ return `<div class="why" id="why" hidden><b>Why it matters</b>${esc(st.why)}</div>`; }
  function done(points, of){
    score += points; max += of; clearInterval(tick);
    const w=$('#why'); if(w){ w.hidden=false; }
    const nb = document.createElement('button'); nb.className='btn block'; nb.id='nextStep';
    nb.textContent = idx===steps.length-1 ? 'Serve to Mina ▸' : 'Next step ▸';
    nb.onclick = () => { idx++; if (idx>=steps.length) return finish(); render(); };
    panel.appendChild(nb); nb.focus({preventScroll:false});
    sfx('ok'); say('Step complete. Why it matters: ' + (steps[idx].why||'') + ' Press ' + nb.textContent.replace('▸','').trim() + '.');
  }
  function render(){
    clearInterval(tick); dots();
    const st = steps[idx];
    drawStage(st.scene, st.type==='tap'&&st.scene==='sink'?{k:0,n:st.n}:null);
    panel.innerHTML = header(st);
    if (st.grown && junior) panel.insertAdjacentHTML('beforeend', `<div class="grownup small" role="note"><span class="gicon" aria-hidden="true">🧑‍🍳</span><span><b>Grown-up job:</b> ${esc(st.grown)}</span></div>`);
    if (st.instr) panel.insertAdjacentHTML('beforeend', `<p>${esc(st.instr)}</p>`);
    if (st.hint && junior) panel.insertAdjacentHTML('beforeend', `<p class="hint"><span aria-hidden="true">💡</span> ${esc(st.hint)}</p>`);
    if (st.safety && typeof st.safety==='string') panel.insertAdjacentHTML('beforeend', `<div class="safety"><b>⚠ Food safety:</b> ${esc(st.safety)}</div>`);
    ({tap, choice, collect, meter, timing, plate})[st.type](st);
    const rp=$('#rep',panel); if (rp) rp.onclick=repeatLast;
    $('#stepH').focus({preventScroll:true});
    const extra = [st.grown&&junior?'Grown-up job: '+st.grown:'', st.instr||'', st.q||'', st.hint&&junior?st.hint:'', typeof st.safety==='string'?'Food safety: '+st.safety:'', st.real?'Real time: '+st.real+'.':''].filter(Boolean).join(' ');
    lastSaid = `Step ${idx+1} of ${steps.length}. ${st.title}. ${extra}`;
    setTimeout(()=>{ announce(extra); if (gameVoice()) speakNow(lastSaid); }, 350);
    describeScene(stageDesc(st));
  }
  function stageDesc(st){ return ({sink:'At the sink with soap and running water.', bowl:'A big empty mixing bowl is ready.', bowl2:'A second bowl for the wet ingredients.', bowl3:'The bowl of batter.', pan0:'A frying pan on the stove.', pour:'The hot pan, lightly buttered.', flip:'Three pancakes cooking in the pan.', flipped:'Three golden pancakes, flipped.', plate:'A warm stack of three pancakes on a plate.'})[st.scene]||''; }
  function tap(st){
    let k=0;
    panel.insertAdjacentHTML('beforeend', `<div class="progress" role="progressbar" aria-label="${esc(st.action)} progress" aria-valuemin="0" aria-valuemax="${st.n}" aria-valuenow="0"><span style="width:0"></span></div>
      <button class="btn teal big block" id="act">${esc(st.action)}</button><p class="feedback" id="fb" aria-hidden="true"></p>${whyBox(st)}`);
    const b=$('#act'), bar=$('.progress', panel);
    b.onclick = () => { if (k>=st.n) return; k++;
      bar.firstElementChild.style.width = (k/st.n*100)+'%'; bar.setAttribute('aria-valuenow', k);
      if (st.scene==='sink') drawStage('sink',{k,n:st.n});
      if (st.scene==='pour'){ state.poured=k; drawStage('pour'); }
      if (st.scene==='bowl') drawStage('bowl');
      $('#fb').textContent = k<st.n ? `${k} of ${st.n}` : '✓ Done!'; $('#fb').className='feedback'+(k>=st.n?' good':'');
      sfx(st.scene==='sink'?'scrub':st.scene==='pour'?'pour':'stir'); if (k<st.n) announce(`${st.action}: ${k} of ${st.n}`);
      if (k>=st.n){ b.disabled=true; done(5,5); } };
  }
  function choice(st){
    let tries=0;
    panel.insertAdjacentHTML('beforeend', `<p id="q${idx}"><b>${esc(st.q)}</b></p><div class="choices" role="group" aria-labelledby="q${idx}"></div><p class="feedback" id="fb" aria-hidden="true"></p>${whyBox(st)}`);
    const box=$('.choices', panel), fb=$('#fb');
    st.options.forEach(o=>{ const b=document.createElement('button'); b.className='choice'; b.textContent=o.t;
      b.onclick=()=>{ if (box.dataset.done) return; tries++;
        if (o.ok){ b.classList.add('right'); b.setAttribute('aria-label','Correct: '+o.t); box.dataset.done='1'; fb.className='feedback good'; fb.textContent= tries===1?'✓ Exactly right!':'✓ You got it.'; $$('.choice',box).forEach(x=>x.disabled = x!==b); done(tries===1?10:4, 10); }
        else { b.classList.add('wrong'); b.setAttribute('aria-label','Not quite: '+o.t); b.disabled=true; fb.className='feedback bad'; fb.textContent='✗ '+o.fb + (challenge?'':' Try another answer.'); sfx('retry'); say('Not quite. '+o.fb+(challenge?'':' Try another answer.')); const nx=$$('.choice:not([disabled])',box)[0]; if(nx) nx.focus(); }
      }; box.appendChild(b); });
  }
  function collect(st){
    let wrong=0; const need = st.items.filter(i=>!i.decoy).length; let got=0;
    panel.insertAdjacentHTML('beforeend', `<div class="ingr-grid">${st.items.map((it,i)=>`<button class="ingr" data-i="${i}" aria-pressed="false">${esc(it.t)}<small>${esc(it.a)}</small></button>`).join('')}</div><p class="feedback" id="fb" aria-hidden="true"></p>${whyBox(st)}`);
    const fb=$('#fb');
    $$('.ingr',panel).forEach(b=>b.onclick=()=>{ const it = st.items[+b.dataset.i];
      if (b.getAttribute('aria-pressed')==='true' || got>=need) return;
      if (it.decoy){ wrong++; b.disabled=true; fb.className='feedback bad'; fb.textContent='✗ '+it.decoy; sfx('retry'); say('Not quite. '+it.decoy); return; }
      b.setAttribute('aria-pressed','true'); got++;
      if (st.scene==='bowl'){ state.dry=got; drawStage('bowl'); } else { state.wet=got; drawStage('bowl2'); }
      fb.className='feedback'; fb.textContent=`Added ${it.t}: ${it.a}. ${got} of ${need}.`; sfx('pour'); if (got<need) say(fb.textContent);
      if (got>=need){ fb.className='feedback good'; fb.textContent='✓ All measured!'; done(Math.max(4,10-wrong*3),10); } });
  }
  function meter(st){
    let v=0;
    panel.insertAdjacentHTML('beforeend', `<div class="meter" role="meter" aria-label="Batter mixing" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Dry flour everywhere"><div class="z z1">Dry streaks</div><div class="z z2">Just combined</div><div class="z z3">Overmixed</div><div class="needle" style="left:0"></div></div>
      <p class="feedback" id="state" aria-hidden="true">Batter: dry flour everywhere.</p>
      <div class="row"><button class="btn teal big" id="stir" style="flex:1">Stir</button><button class="btn big" id="stop" style="flex:1">Stop</button></div><p class="feedback" id="fb" aria-hidden="true"></p>${whyBox(st)}`);
    const needle=$('.needle',panel), sEl=$('#state'), fb=$('#fb');
    const describe = () => v<0.45 ? (v<0.2?'Batter: dry flour everywhere.':'Batter: some dry streaks left.') : v<0.75 ? 'Batter: just combined, a few small lumps. Looks right!' : 'Batter: smooth and stretchy. Overmixed!';
    const zone = () => v<0.45?0:v<0.75?1:2; let lastZone=0;
    $('#stir').onclick = () => { if (fb.dataset.done) return; v=Math.min(1, v+0.09); state.mix=v; needle.style.left = `calc(${v*100}% - 3px)`; sEl.textContent = describe(); drawStage('bowl3');
      const m=$('.meter',panel); m.setAttribute('aria-valuenow', Math.round(v*100)); m.setAttribute('aria-valuetext', describe().replace('Batter: ',''));
      sfx('stir'); const z=zone();
      if (z!==lastZone){ lastZone=z; if (z===1){ sfx('ding'); say('Just combined, a few small lumps. Press Stop now.'); } else if (z===2){ sfx('retry'); say('Smooth and stretchy. That is overmixed. Press Stop.'); } }
      else announce(describe()); };
    $('#stop').onclick = () => { if (fb.dataset.done) return;
      if (v<0.45){ fb.className='feedback bad'; fb.textContent='✗ There is still dry flour. Keep stirring a little.'; sfx('retry'); say('Not yet. There is still dry flour. Keep stirring a little.'); if (challenge){ score-=2; } return; }
      fb.dataset.done='1'; $('#stir').disabled=true; $('#stop').disabled=true;
      if (v<0.75){ fb.className='feedback good'; fb.textContent='✓ Perfect. Lumpy is good here.'; done(10,10); }
      else { fb.className='feedback bad'; fb.textContent='✗ A bit overmixed. These will be a little flatter, but still tasty.'; done(4,10); } };
  }
  function timing(st){
    /* Relaxed: no time pressure. The pan waits at "ready" until you flip. Challenge: timed, with sound cues. */
    const win = challenge ? [0.6,0.78] : [0.55,0.85];
    panel.insertAdjacentHTML('beforeend', `<div class="progress" aria-hidden="true"><span style="width:0"></span></div><p class="feedback" id="state" aria-hidden="true">The batter is sizzling…</p>
      <div class="row"><button class="btn teal big" id="flip" style="flex:2">Flip!</button><button class="btn alt" id="listen" style="flex:1">Check the pan</button></div>
      <p class="muted" style="font-size:.9rem">${challenge?'Challenge: flip while the bubbles stay open. Sound cues: popping speeds up, then a bell rings when it is ready.':'No rush: the pancakes wait for you when they are ready.'}</p><p class="feedback" id="fb" aria-hidden="true"></p>${whyBox(st)}`);
    const bar=$('.progress span',panel), sEl=$('#state'), fb=$('#fb'); let p=0, last='', lastSound=0, readyAnnounced=false;
    const start=Date.now(), dur=st.dur;
    const words = q => q<0.3?'Batter is wet and shiny. No bubbles yet. Quiet, gentle sizzle.': q<win[0]?'Small bubbles are rising. Edges still wet. The sizzle is getting louder.': q<=win[1]?'Bubbles are popping and staying open. Edges look dry. Ready to flip!':'Smells toasty. Flip now!';
    tick = setInterval(()=>{ p = Math.min(1,(Date.now()-start)/dur); if (!challenge) p = Math.min(p, win[0]+0.1); bar.style.width=(p*100)+'%';
      drawStage('flip',{b:Math.floor(p*14),p}); const w=words(p); if (w!==last){ sEl.textContent=w; last=w; if (p>=win[0] && !readyAnnounced){ readyAnnounced=true; sfx('ding'); say(w+' Press Flip.'); } else if (p<win[0]) announce(w); }
      if (Date.now()-lastSound>900){ lastSound=Date.now(); sfx('sizzle', p); }
      if (challenge && p>=1){ clearInterval(tick); end(4,'A little extra golden-brown, but still delicious. Next time flip when the bubbles stay open.'); } }, 120);
    function end(pts,msg){ clearInterval(tick); $('#flip').disabled=true; $('#listen').disabled=true; drawStage('flipped'); fb.className='feedback '+(pts>=10?'good':'bad'); fb.textContent=(pts>=10?'✓ ':'✗ ')+msg; if (pts<10) sfx('retry'); say(msg); done(pts,10); }
    $('#listen').onclick = () => { sfx('sizzle', p); say(words(p)); };
    $('#flip').onclick = () => {
      if (p<win[0]){ if (!challenge){ fb.className='feedback bad'; fb.textContent='✗ Not yet. The bubbles have not popped and the edges are wet. Keep listening.'; sfx('retry'); say('Not yet. The bubbles have not popped and the edges are wet. Wait for the bell, or press Check the pan.'); return; }
        return end(3,'Flipped too early. The pancake tore a little. Wait for open bubbles and dry edges.'); }
      if (p<=win[1]) return end(10,'Perfect flip! Golden underneath.');
      end(6,'A touch late, nicely browned though.');
    };
  }
  function plate(st){
    drawStage('plate');
    panel.insertAdjacentHTML('beforeend', `<div class="ingr-grid">${st.toppings.map(t=>`<button class="ingr topping" data-k="${t.k}" data-t="${esc(t.t)}" aria-pressed="false">${esc(t.t)}</button>`).join('')}</div>${whyBox(st)}<button class="btn big block" id="serve">Serve to Mina <span aria-hidden="true">▸</span></button>`);
    $$('.topping',panel).forEach(b=>b.onclick=()=>{ const on=b.getAttribute('aria-pressed')!=='true'; b.setAttribute('aria-pressed',on); on?toppings.add(b.dataset.k):toppings.delete(b.dataset.k); drawStage('plate'); sfx(on?'pop':'retry'); say((on?'Added ':'Removed ')+b.dataset.t+'.'); });
    $('#why').hidden=false;
    $('#serve').onclick = () => { score += toppings.size?5:3; max+=5; finish(); };
  }
  function finish(){
    clearInterval(timerInt); clearInterval(tick);
    const secs = Math.round((Date.now()-t0)/1000);
    go('result', { score, max, secs, practice: !!opt.practice, challenge, toppings:[...toppings] });
  }
  render();
};

/* ---------- result ---------- */
VIEWS.result = (res) => {
  const pct = res.max ? res.score/res.max : 1;
  const stars = pct>=0.85?3:pct>=0.6?2:1;
  let bonus = 0; if (res.challenge){ bonus = res.secs<120?15:res.secs<180?8:0; }
  const coins = (res.practice? 15 + stars*5 : 30 + stars*10) + bonus;
  const firstTime = !S.journal.pancakes;
  S.coins += coins; S.cooks++;
  S.story.metMina = true;
  if (!S.friendship.mina) S.friendship.mina = 1; else if (S.cooks%3===0) S.friendship.mina = Math.min(5, S.friendship.mina+1);
  const prevBest = S.journal.pancakes?.stars||0;
  S.journal.pancakes = { date: S.journal.pancakes?.date || new Date().toLocaleDateString(), stars: Math.max(prevBest, stars), times:(S.journal.pancakes?.times||0)+1 };
  if (!S.pantry.includes('Maple syrup')) S.pantry.push('Maple syrup');
  if (!S.places.includes('Harbor Market')) S.places.push('Harbor Market');
  save();
  const lines = { 3:'Mmm! They are SO fluffy! It tastes like exam day back home… maybe even better. Don’t tell my dad!', 2:'These are really good! Warm and filling. I can actually think now.', 1:'Thank you! They are a little different from Dad’s, but they are warm and I am so grateful.' };
  main.innerHTML = `<h1 class="center sparkle">Order up!</h1>
  <div class="two"><div><img class="reward-img" src="${MINA.img.delighted}" alt="${esc(MINA.alt.delighted)}"></div>
  <div>
   <div class="card"><p class="dlg-text"><b>Mina:</b> “${esc(lines[stars])}”</p>
    <p class="stars center"><span aria-hidden="true">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span> <span class="sr">${stars} of 3 stars</span></p>
    <p class="center muted">Accuracy ${Math.round(pct*100)}%${res.challenge?` · Time ${Math.floor(res.secs/60)}:${String(res.secs%60).padStart(2,'0')}${bonus?` · speed bonus +${bonus}`:''}`:''}</p>
    <p class="center" style="font-size:1.4rem;font-weight:800"><span aria-hidden="true">🪙 +<span id="cc">0</span> coins</span><span class="sr">Plus ${coins} coins</span></p></div>
   <div class="card"><h2>Unlocked</h2>
    ${firstTime?`<div class="unlock"><span aria-hidden="true">📖</span><div><b>Journal entry:</b> Fluffy Pancakes, with Mina's note and a cooking tip</div></div>
    <div class="unlock"><span aria-hidden="true">♥</span><div><b>Friendship:</b> Mina is now your friend (level 1)</div></div>
    <div class="unlock"><span aria-hidden="true">🍁</span><div><b>New ingredient:</b> Maple syrup added to your pantry</div></div>
    <div class="unlock"><span aria-hidden="true">🗺️</span><div><b>New place:</b> Mina mentioned the Saturday <b>Harbor Market</b> (coming soon in story)</div></div>`
    : `<div class="unlock"><span aria-hidden="true">♥</span><div><b>Friendship with Mina:</b> level ${S.friendship.mina}</div></div><div class="unlock"><span aria-hidden="true">📖</span><div>Journal updated. Best: ${'★'.repeat(S.journal.pancakes.stars)}</div></div>`}
   </div>
   <div class="stack noprint">
    <button class="btn big block" id="real">${isKid()?'🧑‍🍳 Cook With a Grown-Up':'🍳 Cook This for Real'}</button>
    <button class="btn teal block" id="jr">Open the Recipe Journal</button>
    <button class="btn alt block" id="home">Back to the café</button></div>
   <p class="muted">Food safety: refrigerate leftover pancakes within 2 hours.</p>
  </div></div>`;
  let c=0; const el=$('#cc'); const step=Math.max(1,Math.round(coins/25));
  const iv=setInterval(()=>{ c=Math.min(coins,c+step); el.textContent=c; if(c>=coins){ clearInterval(iv); bumpCoins(); } }, 40);
  sfx('coin'); say(`Order up! Mina says: ${lines[stars]} You earned ${stars} of 3 stars and ${coins} coins. You now have ${S.coins} coins.`);
  $('#real').onclick=()=>go('recipe','pancakes'); $('#jr').onclick=()=>go('journal'); $('#home').onclick=()=>go('cafe');
};

/* ---------- journal ---------- */
VIEWS.journal = () => {
  const n = Object.keys(S.journal).length;
  main.innerHTML = `<h1>Recipe Journal</h1><p class="muted">${n} of ${window.RECIPES.length} dishes mastered. Every page is a real recipe.</p>
  <div class="jgrid">${window.RECIPES.map(r=>{ const j=S.journal[r.id];
    if (j) return `<article class="jcard"><img src="${r.img}" alt="${esc(r.alt)}"><div class="jb"><h2 style="font-size:1.1rem;margin:0">${esc(r.name)}</h2>
      <span class="stars" style="font-size:1.1rem"><span aria-hidden="true">${'★'.repeat(j.stars)}${'☆'.repeat(3-j.stars)}</span><span class="sr">Best: ${j.stars} of 3 stars</span></span>
      <p class="note">“Thank you for the pancakes! I aced my lab quiz, and I'm telling everyone in my dorm about this place.” ♡ Mina</p>
      <p><b>Tip:</b> ${esc(r.tip)}</p><p class="muted" style="font-size:.85rem">Skill: ${esc(r.skill)} · First cooked ${esc(j.date)} · Cooked ${j.times}×</p>
      <button class="btn block" data-real="${r.id}">${isKid()?'Cook With a Grown-Up':'Cook This for Real'}</button>${r.id==='pancakes'?'<button class="btn alt block" id="again">Cook again in game</button>':''}</div></article>`;
    return `<article class="jcard locked"><img src="${r.img}" alt="${esc(r.name)} (locked)"><div class="jb"><h2 style="font-size:1.1rem;margin:0">${esc(r.name)}</h2>
      <span class="lock">🔒 ${r.inStory?'Cook it in the story to unlock':'Coming soon in story'}</span><p class="muted" style="font-size:.85rem">Teaches: ${esc(r.skill)}</p>
      <button class="btn alt block" data-real="${r.id}">${isKid()?'Cook With a Grown-Up':'Cook This for Real'}</button></div></article>`; }).join('')}</div>`;
  if (S.stickers && Object.keys(S.stickers).length) main.insertAdjacentHTML('beforeend', `<div class="card"><h2>My stickers</h2><ul class="stickers">${Object.entries(S.stickers).map(([k,c])=>`<li class="sticker"><span aria-hidden="true">${STICKERS[k].icon}</span><b>${STICKERS[k].t}</b><small><span aria-hidden="true">×</span><span class="sr">times </span>${c}</small></li>`).join('')}</ul></div>`);
  $$('[data-real]').forEach(b=>b.onclick=()=>go('recipe', b.dataset.real));
  const a=$('#again'); if (a) a.onclick=()=>go(lvl()==='little'?'kidkitchen':'kitchen',{practice:true});
};

/* ---------- recipe list ---------- */
VIEWS.recipes = () => {
  main.innerHTML = `<h1>Cook This for Real</h1><p>Every dish in Sizzle &amp; Story is a real recipe with amounts, times, safety steps, and allergens. Free to read, always.</p>
   <button class="btn teal" id="sl">🛒 Shopping list (${Object.keys(S.shopping).length})</button>
   <div class="jgrid" style="margin-top:12px">${window.RECIPES.map(r=>`<article class="jcard"><img src="${r.img}" alt="${esc(r.alt)}"><div class="jb"><h2 style="font-size:1.1rem;margin:0">${esc(r.name)}</h2>
     <span class="chip">${r.inStory?'▶ In story now':'Coming soon in story'}</span><p class="muted" style="font-size:.85rem;margin:0">Prep ${r.prep} min · Cook ${r.cook} min</p>
     <button class="btn block" data-real="${r.id}" aria-label="Open recipe: ${esc(r.name)}">Open recipe</button></div></article>`).join('')}</div>`;
  $$('[data-real]').forEach(b=>b.onclick=()=>go('recipe', b.dataset.real));
  $('#sl').onclick=()=>go('shoplist');
};

/* ---------- recipe ---------- */
const servingsState = {};
VIEWS.recipe = (id) => {
  const r = R[id] || R.pancakes; const kidCard = isKid();
  let sv = servingsState[r.id] || r.servings;
  const label = r.servingLabel || 'servings';
  const stepSize = r.servings>=24 ? 12 : 1;
  function f(){ return sv / r.servings; }
  function ingHTML(){ return r.ingredients.map(i=>{ const l=ingLine(i,f()); return `<li>${l.amt?`<span class="amt">${esc(l.amt)}</span> `:''}${l.met?`<span class="met">${esc(l.met)}</span> `:''}${esc(l.name)}</li>`; }).join(''); }
  main.innerHTML = `<div class="row noprint"><button class="btn alt" id="back">◂ Back</button></div>
  ${kidCard?'<p class="kid-badge"><span aria-hidden="true">🧑‍🍳🤝🧒</span> Cook With a Grown-Up</p>':''}<h1>${esc(r.name)}</h1><p class="muted">${r.inStory?'':'<b>Coming soon in story.</b> The full real recipe is ready to cook now. '}Teaches: ${esc(r.skill)}</p>
  <div class="two"><div><img class="rhero" src="${r.img}" alt="${esc(r.alt)}">
   <div class="facts" style="margin-top:10px"><div><span>Prep</span><b>${r.prep} min</b>${r.prepNote?`<small class="muted">${esc(r.prepNote)}</small>`:''}</div><div><span>Cook</span><b>${r.cook} min</b>${r.cookNote?`<small class="muted">${esc(r.cookNote)}</small>`:''}</div><div><span>Total</span><b>${r.prep+r.cook} min</b></div></div>
   <div class="card"><h2>Allergens</h2><p>${r.allergens.map(a=>`<span class="allergen"><span aria-hidden="true">⚠</span>${esc(a)}</span>`).join('')}</p><p class="muted" style="font-size:.85rem">Always check package labels. Brands vary.</p></div>
   <div class="card"><h2>Equipment</h2><ul>${r.equipment.map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div>
  </div><div>
   <div class="card"><h2>Ingredients</h2>
    <div class="scaler noprint" role="group" aria-label="Adjust ${label}"><button class="btn alt" id="minus" aria-label="Fewer ${label}">−</button><span aria-live="polite"><b id="sv">${sv}</b> ${label}</span><button class="btn alt" id="plus" aria-label="More ${label}">+</button></div>
    <p class="muted" id="yield" style="font-size:.9rem">${sv===r.servings?'Makes '+esc(r.yieldNote)+'.':'Scaled from the original '+r.servings+' '+label+' ('+esc(r.yieldNote)+'). Cooking times stay about the same; cook in batches if your pan is crowded.'}</p>
    <div class="seg noprint" role="group" aria-label="Units" style="margin:8px 0">${[['both','US + metric'],['us','US'],['metric','Metric']].map(([k,t])=>`<button data-u="${k}" aria-pressed="${S.settings.units===k}">${t}</button>`).join('')}</div>
    <ul class="ing" id="ing">${ingHTML()}</ul>
    <div class="row noprint"><button class="btn teal" id="addShop">🛒 Add to shopping list</button><button class="btn alt" id="print">Print</button></div></div>
   <div class="card noprint"><h2>Hands-free cooking</h2><p>Big text, one step at a time, read aloud. Use the Back, Repeat, and Next buttons, the arrow keys, or say “next”, “back”, or “repeat” where your browser supports voice commands.</p><button class="btn big block" id="hf">🔊 Start hands-free mode</button></div>
  </div></div>
  ${kidCard ? `<div class="card kidsafe"><h2><span aria-hidden="true">🛡️</span> Kitchen safety for kids</h2><ul>${KID_SAFETY.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
  <div class="card"><h2>Instructions: who does what</h2><p class="muted" style="font-size:.9rem">${Object.values(JOB).map(j=>`<span class="job"><span aria-hidden="true">${j.icon}</span> ${j.t}</span>`).join(' ')}</p>
   <ol class="steps">${r.steps.map((s,i)=>{ const j=JOB[(r.jobs||[])[i]]||JOB.T; const n=(r.jobNotes||{})[i]; return `<li><span class="job job-${(r.jobs||[])[i]||'T'}"><span aria-hidden="true">${j.icon}</span> ${j.t}</span><br>${esc(s)}${n?`<br><small class="muted"><b>Who:</b> ${esc(n)}</small>`:''}</li>`; }).join('')}</ol></div>`
  : `<div class="card"><h2>Instructions</h2><ol class="steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>`}
  <div class="safety"><h2 style="font-size:1.1rem">⚠ Food safety</h2><ul>${r.safety.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>
  <div class="card"><h2>Substitutions</h2><p class="muted" style="font-size:.9rem">Common, well-known swaps. “Changes the result” means the dish will taste or look noticeably different.</p>${r.subs.map(s=>`<div class="sub"><b>${esc(s.swap)}</b><br>${esc(s.how)}<br><span class="${/^Changes/.test(s.effect)?'tag-change':''}">${/^Changes/.test(s.effect)?'⇄ ':'≈ '}${esc(s.effect)}</span></div>`).join('')}</div>
  <details class="card" id="nvTips" ${S.settings.blv?'open':''}><summary><h2 style="display:inline">Cooking without sight: tips</h2></summary>
   <h3>For this recipe</h3><ul>${(r.nvTips||[]).map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
   <h3>Everyday kitchen tips</h3><ul>${NV_GENERAL.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></details>
  <div class="card"><h2>Cook's tip</h2><p>${esc(r.tip)}</p></div>`;
  const upd=()=>{ $('#sv').textContent=sv; $('#ing').innerHTML=ingHTML(); servingsState[r.id]=sv;
    $('#yield').textContent = sv===r.servings ? 'Makes '+r.yieldNote+'.' : 'Scaled from the original '+r.servings+' '+label+' ('+r.yieldNote+'). Cooking times stay about the same; cook in batches if your pan is crowded.'; };
  $('#minus').onclick=()=>{ if (sv>stepSize){ sv-=stepSize; upd(); } };
  $('#plus').onclick=()=>{ if (sv<stepSize*24){ sv+=stepSize; upd(); } };
  $$('[data-u]').forEach(b=>b.onclick=()=>{ S.settings.units=b.dataset.u; save(); $$('[data-u]').forEach(x=>x.setAttribute('aria-pressed', x===b)); upd(); });
  $('#back').onclick=()=>go(prev||'recipes');
  $('#print').onclick=()=>window.print();
  $('#addShop').onclick=()=>{ r.ingredients.forEach(i=>{ if(!i.shop) return; const l=ingLine(i,f()); const k=i.shop; S.shopping[k]=S.shopping[k]||{items:[],checked:false};
      const e = `${l.amt}${l.met?' '+l.met:''} (${r.name})`.trim(); S.shopping[k].items = S.shopping[k].items.filter(x=>!x.endsWith('('+r.name+')')); S.shopping[k].items.push(e); });
    save(); toast('Added to your shopping list'); announce('Ingredients added to your shopping list'); };
  $('#hf').onclick=()=>handsFree(r, f());
};

/* ---------- shopping list ---------- */
VIEWS.shoplist = () => {
  const keys = Object.keys(S.shopping);
  main.innerHTML = `<div class="row noprint"><button class="btn alt" id="back">◂ Back</button></div><h1>Shopping list</h1>
  ${keys.length? `<ul class="shoplist" style="list-style:none;padding:0">${keys.map((k,i)=>`<li class="${S.shopping[k].checked?'checked':''}"><input type="checkbox" id="s${i}" data-k="${esc(k)}" ${S.shopping[k].checked?'checked':''}><label for="s${i}"><span><b>${esc(k)}</b><br><small class="muted">${S.shopping[k].items.map(esc).join(' · ')}</small></span></label></li>`).join('')}</ul>
   <div class="row noprint"><button class="btn teal" id="copy">Copy list</button><button class="btn alt" id="print">Print</button><button class="btn alt" id="clear">Clear list</button></div>`
   : `<div class="card"><p>Your list is empty. Open any recipe and tap <b>Add to shopping list</b>.</p><button class="btn" id="go">Browse recipes</button></div>`}`;
  $('#back').onclick=()=>go('recipes');
  if (!keys.length){ $('#go').onclick=()=>go('recipes'); return; }
  $$('.shoplist input').forEach(c=>c.onchange=()=>{ S.shopping[c.dataset.k].checked=c.checked; c.closest('li').classList.toggle('checked',c.checked); save(); });
  $('#copy').onclick=async()=>{ const txt='Sizzle & Story shopping list\n'+keys.map(k=>`${S.shopping[k].checked?'[x]':'[ ]'} ${k}: ${S.shopping[k].items.join('; ')}`).join('\n');
    try{ await navigator.clipboard.writeText(txt); toast('Copied!'); }catch(e){ const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy'); toast('Copied!');}catch(_){toast('Copy not allowed here');} ta.remove(); } };
  $('#print').onclick=()=>window.print();
  $('#clear').onclick=()=>{ if (confirm('Clear the whole shopping list?')){ S.shopping={}; save(); go('shoplist'); } };
};

/* ---------- hands-free ---------- */
let rec=null, wakeLock=null;
function stopSpeech(){ try{ window.speechSynthesis && speechSynthesis.cancel(); }catch(e){} try{ rec && rec.stop(); }catch(e){} rec=null; try{ wakeLock && wakeLock.release(); }catch(e){} wakeLock=null; }
function handsFree(r, f){
  const items = ['Gather your ingredients. ' + r.ingredients.filter(i=>i.us[0]!=null).map(i=>{ const l=ingLine(i,f); return `${l.amt} ${l.met} ${l.name}`.replace(/\s+/g,' ').trim(); }).join('. ') + '.', ...r.steps, 'Food safety. ' + r.safety.join(' ')];
  let i = 0, speak = ('speechSynthesis' in window) && !(S.settings.audioGuide && S.settings.voice==='sr'), listening=false;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const ov = document.createElement('div'); ov.className='hf'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','Hands-free cooking: '+r.name);
  ov.innerHTML = `<div class="row" style="justify-content:space-between"><h2 style="margin:0">Hands-free: ${esc(r.name)}</h2><button class="btn alt" id="hfx">Close <span aria-hidden="true">✕</span></button></div>
   <div aria-live="polite" aria-atomic="true"><p class="muted" id="hfn"></p><div class="hf-step" id="hfs"></div></div>
   <p class="sr">Use Next, Back and Repeat buttons, or the arrow keys and R. Escape closes.</p>
   <div class="row"><label class="switch" style="flex:1;border:0"><span>Read aloud with game voice</span><input type="checkbox" id="hfsp" ${speak?'checked':''} ${'speechSynthesis' in window?'':'disabled'}></label>
   ${SR?`<button class="btn alt" id="hfv" aria-pressed="false">🎤 Voice commands: off</button>`:`<span class="muted" style="font-size:.85rem">Voice commands are not supported in this browser. Buttons and arrow keys work.</span>`}</div>
   <div class="hf-ctrl"><button class="btn alt" id="hfb"><span aria-hidden="true">◂</span> Back</button><button class="btn teal" id="hfr"><span aria-hidden="true">↻</span> Repeat</button><button class="btn" id="hfnx">Next <span aria-hidden="true">▸</span></button></div>`;
  document.body.appendChild(ov);
  const prevFocus = document.activeElement;
  try{ navigator.wakeLock && navigator.wakeLock.request('screen').then(w=>wakeLock=w).catch(()=>{}); }catch(e){}
  function say(t){ if (!speak || !('speechSynthesis' in window)) return; try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.rate=S.settings.rate||1; speechSynthesis.speak(u); }catch(e){} }
  function show(){ $('#hfn',ov).textContent = i===0 ? 'Ingredients' : i===items.length-1 ? 'Safety' : `Step ${i} of ${r.steps.length}`; $('#hfs',ov).textContent = items[i]; say((i>0&&i<items.length-1?`Step ${i}. `:'')+items[i]); }
  const nxt=()=>{ if(i<items.length-1){ i++; show(); } else { announce('That was the last step. Enjoy your meal!'); say('That was the last step. Enjoy your meal!'); } };
  const bck=()=>{ if(i>0){ i--; show(); } };
  function close(){ document.removeEventListener('keydown',key); stopSpeech(); ov.remove(); prevFocus && prevFocus.focus(); }
  function key(e){ if (e.key==='Tab'){ const f=$$('button:not([disabled]),input:not([disabled])',ov); const a=f.indexOf(document.activeElement); if (e.shiftKey && a<=0){ f[f.length-1].focus(); e.preventDefault(); } else if (!e.shiftKey && a===f.length-1){ f[0].focus(); e.preventDefault(); } return; }
    if (e.target.tagName==='INPUT') return;
    if(e.key==='ArrowRight'){ nxt(); } else if(e.key==='ArrowLeft'){ bck(); } else if(e.key==='r'||e.key==='R'){ show(); } else if(e.key==='Escape'){ close(); } }
  document.addEventListener('keydown',key);
  $('#hfnx',ov).onclick=nxt; $('#hfb',ov).onclick=bck; $('#hfr',ov).onclick=show; $('#hfx',ov).onclick=close;
  $('#hfsp',ov).onchange=e=>{ speak=e.target.checked; if(!speak) try{speechSynthesis.cancel();}catch(_){} };
  const vb=$('#hfv',ov);
  if (vb) vb.onclick=()=>{
    if (listening){ listening=false; try{rec.stop();}catch(e){} rec=null; vb.textContent='🎤 Voice commands: off'; vb.setAttribute('aria-pressed','false'); return; }
    try{ rec=new SR(); rec.continuous=true; rec.interimResults=false; rec.lang='en-US';
      rec.onresult=ev=>{ const t=ev.results[ev.results.length-1][0].transcript.toLowerCase();
        if (/\bnext\b/.test(t)) nxt(); else if (/\b(back|previous)\b/.test(t)) bck(); else if (/\b(repeat|again)\b/.test(t)) show(); else if (/\b(stop|close)\b/.test(t)) close(); };
      rec.onend=()=>{ if(listening && rec){ try{rec.start();}catch(e){} } };
      rec.onerror=ev=>{ if(ev.error==='not-allowed'){ listening=false; vb.textContent='🎤 Microphone blocked'; } };
      rec.start(); listening=true; vb.textContent='🎤 Voice commands: on (say next, back, repeat)'; vb.setAttribute('aria-pressed','true');
    }catch(e){ vb.textContent='🎤 Voice commands unavailable'; }
  };
  $('#hfnx',ov).focus(); show();
}

/* ---------- shop ---------- */
VIEWS.shop = () => {
  main.innerHTML = `<h1>Decorate the café</h1><p>You have <b>${S.coins} coins</b>. Earn more by cooking. Everything you buy appears in the café right away.</p>
  ${sceneHTML()}
  <div>${DECOR.map(d=>{ const own=S.owned.includes(d.id); return `<div class="card shop-item"><div class="thumb" aria-hidden="true">${decorSVG(d.id)}</div>
    <div style="flex:1"><h2 style="font-size:1.05rem;margin:0">${esc(d.name)}</h2><p class="muted" style="margin:.2em 0">${esc(d.desc)}</p>
    ${own?'<span class="chip">✓ Placed in café</span>':`<button class="btn" data-buy="${d.id}" ${S.coins<d.price?'disabled':''} aria-label="Buy ${esc(d.name)} for ${d.price} coins"><span aria-hidden="true">🪙</span> ${d.price}</button>${S.coins<d.price?' <span class="muted" style="font-size:.85rem">Need '+(d.price-S.coins)+' more</span>':''}`}</div></div>`; }).join('')}</div>
  <p class="muted">Outfits and equipment upgrades are coming in a later version.</p>`;
  $$('[data-buy]').forEach(b=>b.onclick=()=>{ const d=DECOR.find(x=>x.id===b.dataset.buy); if (S.coins<d.price) return; S.coins-=d.price; S.owned.push(d.id); save(); bumpCoins(); toast(d.name+' placed in the café!'); go('shop'); sfx('coin'); say(d.name+' placed in the café. You have '+S.coins+' coins left.'); });
};

/* ---------- settings ---------- */
VIEWS.settings = () => {
  const s=S.settings;
  main.innerHTML = `<h1>Settings</h1>
  <div class="card"><h2>Who's cooking?</h2><div class="seg" role="group" aria-label="Level">${Object.entries(LEVELS).map(([k,L])=>`<button data-lv="${k}" aria-pressed="${lvl()===k}">${L.name}</button>`).join('')}</div>
   <p class="muted">${esc(LEVELS[lvl()].name)}: ${esc(LEVELS[lvl()].ages)}. ${esc(LEVELS[lvl()].blurb)}</p></div>
  <div class="card"><h2>Cooking mode</h2><div class="seg" role="group" aria-label="Cooking mode"><button data-m="relaxed" aria-pressed="${s.mode==='relaxed'}">Relaxed</button><button data-m="challenge" aria-pressed="${s.mode==='challenge'}">Challenge</button></div>
   ${isKid()?'<p class="hint">Kid levels always use Relaxed mode with no timer.</p>':''}<p class="muted">Relaxed: no timer, hints, and second tries. Challenge: a running clock, tighter flip timing, and a speed bonus for accurate, quick cooking.</p></div>
  <div class="card" id="blvCard"><h2>Blind &amp; Low Vision mode</h2>
   <label class="switch"><span><b>Blind &amp; Low Vision mode</b><br><small class="muted">Turns on everything below at once.</small></span><input type="checkbox" role="switch" id="blvMaster" ${s.blv?'checked':''}></label>
   <label class="switch"><span>Audio Guide<br><small class="muted">Reads dialogue, steps, why-it-matters notes, and results aloud.</small></span><input type="checkbox" role="switch" data-b="audioGuide" ${s.audioGuide?'checked':''}></label>
   <div class="switch voice-row"><span id="voiceLbl">Who reads aloud</span><div class="seg" role="group" aria-labelledby="voiceLbl"><button data-voice="game" aria-pressed="${s.voice!=='sr'}">Game voice</button><button data-voice="sr" aria-pressed="${s.voice==='sr'}">My screen reader</button></div></div>
   <p class="muted" style="font-size:.88rem">Pick “My screen reader” if you use VoiceOver, TalkBack, NVDA or JAWS, so the game voice does not talk over it. Announcements still go to your screen reader.</p>
   <label class="switch"><span>Sound cues<br><small class="muted">Sizzle, bubbles, stirring, and success or try-again chimes.</small></span><input type="checkbox" role="switch" data-b="sounds" ${s.sounds?'checked':''}></label>
   <label class="switch"><span>Extra spoken descriptions<br><small class="muted">Describes the café and the kitchen scene.</small></span><input type="checkbox" role="switch" data-b="descriptions" ${s.descriptions?'checked':''}></label>
   <label class="switch"><span>Larger buttons</span><input type="checkbox" role="switch" data-b="bigButtons" ${s.bigButtons?'checked':''}></label>
   <label class="switch"><span>Speech speed</span><select id="rate" aria-label="Speech speed">${[[0.7,'Slowest'],[0.85,'Slower'],[1,'Normal'],[1.2,'Faster'],[1.5,'Fastest']].map(([v,t])=>`<option value="${v}" ${s.rate==v?'selected':''}>${t}</option>`).join('')}</select></label>
   <button class="btn alt" id="testVoice">Test voice and sounds</button></div>
  <div class="card"><h2>Comfort and access</h2>
   <label class="switch"><span>Large text</span> <input type="checkbox" role="switch" data-s="large" ${s.large?'checked':''}></label>
   <label class="switch"><span>High contrast</span><input type="checkbox" role="switch" data-s="contrast" ${s.contrast?'checked':''}></label>
   <label class="switch"><span>Reduce motion</span><input type="checkbox" role="switch" data-s="calm" ${s.calm?'checked':''}></label>
   <p class="muted" style="font-size:.88rem">Tip: the game works with browser zoom up to 200%. Press R to repeat the last announcement.</p></div>
  <div class="card"><h2>About</h2><p><b>Sizzle &amp; Story</b> v3 · Cook the story. Make the meal.</p><p class="muted">Recipes are standard home recipes. Safety guidance follows common food-safety temperatures. Progress is saved on this device only.</p>
   <button class="btn alt" id="reset">Reset all progress</button></div>`;
  $$('[data-lv]').forEach(b=>b.onclick=()=>{ S.level=b.dataset.lv; save(); applySettings(); announce(LEVELS[S.level].name+' level on'); go('settings'); });
  $$('[data-m]').forEach(b=>b.onclick=()=>{ s.mode=b.dataset.m; save(); $$('[data-m]').forEach(x=>x.setAttribute('aria-pressed',x===b)); announce(b.textContent+' mode on'); });
  $$('[data-s]').forEach(c=>c.onchange=()=>{ s[c.dataset.s]=c.checked; save(); applySettings(); announce(c.closest('label').querySelector('span').textContent+(c.checked?' on':' off')); });
  $('#rate').onchange=e=>{ s.rate=parseFloat(e.target.value); save(); };
  $('#blvMaster').onchange=e=>{ setBLV(e.target.checked); say('Blind and Low Vision mode '+(e.target.checked?'on':'off')); go('settings'); $('#blvMaster').focus(); };
  $$('[data-b]').forEach(c=>c.onchange=()=>{ s[c.dataset.b]=c.checked; s.blv = BLV_KEYS.some(k=>s[k]); save(); applySettings(); announce(c.closest('label').querySelector('span').firstChild.textContent.trim()+(c.checked?' on':' off')); $('#blvMaster').checked=s.blv; });
  $$('[data-voice]').forEach(b=>b.onclick=()=>{ s.voice=b.dataset.voice; save(); $$('[data-voice]').forEach(x=>x.setAttribute('aria-pressed',x===b)); announce(b.textContent+' selected'); });
  $('#testVoice').onclick=()=>{ SND.ok(); setTimeout(()=>SND.sizzle(.6),400); speakNow('This is the game voice. Cook the story. Make the meal.'); announce('Testing voice and sounds.'); };
  $('#reset').onclick=()=>{ if (confirm('Reset all progress, coins, and decorations?')){ localStorage.removeItem(KEY); load(); applySettings(); go('title'); } };
};

/* ---------- levels ---------- */
const LEVELS = {
  little: { name:'Little Chef', ages:'about ages 3 to 6', icon:'🧸', blurb:'Pretend play with pictures and voice. No reading needed.' },
  junior: { name:'Junior Chef', ages:'about ages 7 to 11', icon:'🎒', blurb:'Simple words, measuring and mixing practice, hints on.' },
  chef:   { name:'Chef', ages:'ages 12 and up', icon:'👩‍🍳', blurb:'The full game, with Relaxed or Challenge mode.' }
};
const lvl = () => S.level || 'chef';
const isKid = () => lvl()==='little' || lvl()==='junior';
function kidSay(t){ lastSaid=t; announce(t); if (S.settings.audioGuide && S.settings.voice==='sr') return; speakNow(t, true); }
const KID_SAFETY = [
  'Wash your hands with soap before you cook and after touching raw egg or raw dough.',
  'Grown-ups handle the stove, the oven, hot pans, and knives.',
  'Never taste raw batter or raw cookie dough. Raw egg and raw flour can make you sick.',
  'Keep long hair tied back and sleeves pushed up.',
  'Ask a grown-up before you touch anything in the kitchen.'
];
const JOB = { K:{icon:'🧒', t:'Kid job'}, G:{icon:'🧑‍🍳', t:'Grown-up job'}, T:{icon:'🤝', t:'Do it together'} };

VIEWS.who = () => {
  main.innerHTML = `<h1 class="center">Who's cooking?</h1><p class="center muted">Pick a level. You can change it any time in Settings.</p>
  <label class="switch blv-switch"><span><b>Blind &amp; Low Vision mode</b><br><small class="muted">Reads everything aloud, adds sound cues and larger buttons.</small></span><input type="checkbox" role="switch" id="whoBlv" ${S.settings.blv?'checked':''}></label>
  <div class="stack lvl-list" role="group" aria-label="Levels">${Object.entries(LEVELS).map(([k,L])=>`<button class="lvl-card ${k}" data-l="${k}" aria-pressed="${lvl()===k && !!S.level}">
     <span class="lvl-icon" aria-hidden="true">${L.icon}</span><span><b>${L.name}</b><br><span class="muted">${L.ages}</span><br><small>${L.blurb}</small></span></button>`).join('')}</div>`;
  $$('.lvl-card').forEach(b=>{ b.onclick=()=>{ S.level=b.dataset.l; save(); applySettings(); kidSay(LEVELS[S.level].name+'! Let\u2019s go!'); go(S.introSeen? 'cafe' : 'intro'); }; });
  $('#whoBlv').onchange=e=>{ setBLV(e.target.checked); say('Blind and Low Vision mode '+(e.target.checked?'on':'off')+'.'); if (e.target.checked) sfx('ok'); };
  guide("Who's cooking? Pick a level: Little Chef, Junior Chef, or Chef.");
};

/* Junior Chef: same pancake steps in simpler words, grown-up badges, hints on */
const JR = [
  { instr:'Tap Scrub to wash with soap. Scrub as long as it takes to sing “Happy Birthday” two times (20 seconds).', why:'Clean hands keep germs out of the food.' },
  { title:'Fill the flour cup', q:'You need 1 1/2 cups (190 g) of flour. How do you fill the cup?', hint:'Hint: pressing flour down squishes in too much.',
    options:[ { t:'Scoop it and press it down hard', ok:false, fb:'Pressing packs in too much flour. Pancakes come out dry.' }, { t:'Spoon it in, then scrape the top flat', ok:true }, { t:'Just guess', ok:false, fb:'Baking needs the right amounts to work.' } ],
    why:'Spooning and scraping flat gives the right amount every time.' },
  { title:'Add the dry things', instr:'Tap each thing that goes in the bowl. One of them does NOT belong!', hint:'Hint: this recipe uses baking powder, not baking soda.', why:'Baking powder makes pancakes puffy.' },
  { title:'Mix the dry things', instr:'Tap Whisk to mix.', why:'Mixing spreads the puffy powder everywhere, so every pancake puffs up.' },
  { title:'Add the wet things', instr:'Tap each wet thing to add it to the second bowl.', grown:'A grown-up melts the butter and helps crack the egg.', safety:'After touching the egg, wash your hands.', why:'Wet things mix best in their own bowl first.' },
  { title:'Stir gently', instr:'Pour wet into dry. Tap Stir. Tap Stop when the batter is just mixed.', hint:'Hint: a few lumps are OK! Stop when the needle is in the middle part, “Just combined”.', why:'Too much stirring makes pancakes flat and chewy.' },
  { title:'Safety check', q:'Mina wants to lick the batter spoon. What do you say?', hint:'Hint: raw batter is not cooked yet.',
    options:[ { t:'Sure, go ahead!', ok:false, fb:'Raw egg and raw flour can make you sick.' }, { t:'No! Raw batter can make you sick. Wait for the cooked pancake.', ok:true }, { t:'Only if it looks clean', ok:false, fb:'You can’t see germs. Looking clean doesn’t mean safe.' } ],
    why:'Cooking makes the egg and flour safe to eat.' },
  { title:'Heat the pan', grown:'Only a grown-up turns on the stove and touches the hot pan.', q:'A grown-up heats the pan. Which heat is best?', hint:'Hint: not too low, not too high.',
    options:[ { t:'Very low', ok:false, fb:'Too low: the pancakes stay pale and dry.' }, { t:'Medium (about 375°F / 190°C)', ok:true }, { t:'Super high', ok:false, fb:'Too high: they burn outside and stay raw inside.' } ],
    why:'Medium heat cooks the inside and outside at the same speed.' },
  { title:'Pour the batter', grown:'A grown-up pours the batter into the hot pan.', action:'Count a scoop', instr:'Help count three scoops of 1/4 cup (60 ml) each.', why:'Same-size scoops cook in the same time.' },
  { title:'Bubbles, then flip!', grown:'A grown-up does the flipping at the stove.', instr:'Your job: tap Flip when the bubbles pop and the edges look dry.', hint:'Hint: watch the words under the bar. Wait for “Ready to flip!”', why:'Popped bubbles mean the bottom is golden and ready.' },
  { title:'Is it cooked?', grown:'A grown-up checks the pancake.', q:'How do you know the pancake is cooked?', hint:'Hint: brown on the outside is not enough.',
    options:[ { t:'It’s brown, so it’s done', ok:false, fb:'Brown outside can still be raw inside.' }, { t:'The middle springs back and no wet batter is inside', ok:true }, { t:'Cook it 10 more minutes', ok:false, fb:'That would burn it!' } ],
    why:'A springy middle with no wet batter means it is cooked all the way.' },
  { title:'Plate it for Mina', instr:'Pick toppings, then serve!', why:'Serve them warm. Leftovers go in the fridge within 2 hours.' }
];
const JUNIOR_STEPS = PANCAKE_STEPS.map((s,i)=>Object.assign({}, s, JR[i]||{}));
const JR_DIALOGUE = [
  { who:'narr', text:'Ding! The café bell rings. A girl with a big stack of books walks in.' },
  { who:'mina', mood:'shy', text:'Hi! Are you open? I’m really hungry.' },
  { who:'choice', options:[ { t:'Yes! Come on in!', reply:'Yay! Thank you!' }, { t:'You’re our first customer!', reply:'Wow, really? That’s so cool!' } ] },
  { who:'mina', mood:'happy', text:'I’m Mina. I study sea animals at the college up the hill.' },
  { who:'mina', mood:'shy', text:'I spent my money on school books, so I skipped breakfast.' },
  { who:'mina', mood:'happy', text:'My dad makes yummy pancakes on test days. Can you make some for me?' },
  { who:'narr', text:'Pancakes are cheap and easy. Let’s cook! A grown-up will help with the hot stove.' }
];
const LITTLE_DIALOGUE = [
  { mood:'shy', text:'Ding, ding! Hi! I’m Mina.' },
  { mood:'shy', text:'My tummy is rumbling. I’m so hungry!' },
  { mood:'happy', text:'Can you make me pancakes? Please?' },
  { mood:'happy', text:'Yay! Let’s cook together!' }
];

VIEWS.kiddialogue = () => {
  let i=0;
  main.innerHTML = `<div class="dlg-wrap kid"><img class="portrait" id="por" src="${MINA.img.shy}" alt="${esc(MINA.alt.shy)}">
   <div class="dlg-box"><span class="dlg-name" aria-hidden="true">Mina</span><h1 class="sr">Mina says hello</h1><p class="dlg-text big" id="txt"></p>
   <div class="row" style="justify-content:space-between"><button class="btn alt round" id="hear" aria-label="Hear it again"><span aria-hidden="true">🔊</span></button>
   <button class="btn round huge" id="next" aria-label="Next"><span aria-hidden="true">➜</span></button></div></div></div>`;
  function show(){ const L=LITTLE_DIALOGUE[i]; $('#por').src=MINA.img[L.mood]; $('#por').alt=MINA.alt[L.mood]; $('#txt').textContent=L.text; kidSay('Mina says: '+L.text); }
  $('#hear').onclick=()=>kidSay(LITTLE_DIALOGUE[i].text);
  $('#next').onclick=()=>{ i++; if (i>=LITTLE_DIALOGUE.length) go('kidkitchen',{practice:false}); else show(); };
  show(); $('#next').focus();
};

/* little chef pictures */
function cupSVG(kind){
  const fill = {flour:'#fffaf0', milk:'#ffffff', sugar:'#fff'}[kind]||'#fff';
  const lbl = {flour:'Flour cup', milk:'Milk cup'}[kind]||'Cup';
  return `<svg viewBox="0 0 120 120" role="img" aria-label="${lbl}"><path d="M25 30h70l-8 78H33z" fill="#ffd36e" stroke="#c98a12" stroke-width="4"/><path d="M30 40h60l-2 22H32z" fill="${fill}"/>
   ${kind==='flour'?'<circle cx="50" cy="40" r="8" fill="#fff"/><circle cx="68" cy="38" r="10" fill="#fff"/>':'<ellipse cx="60" cy="42" rx="28" ry="5" fill="#eaf6ff"/>'}
   <path d="M95 45 q20 5 0 30" stroke="#c98a12" stroke-width="6" fill="none"/></svg>`;
}
const BIG = {
  soap:`<svg viewBox="0 0 120 120" role="img" aria-label="Soap"><rect x="22" y="40" width="76" height="48" rx="18" fill="#9fd8ef" stroke="#4aa3c7" stroke-width="4"/>${[[30,30,10],[55,22,13],[84,32,9],[96,58,7]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#9cc7e0" stroke-width="2"/>`).join('')}</svg>`,
  spoon:`<svg viewBox="0 0 120 120" role="img" aria-label="Big spoon"><ellipse cx="42" cy="40" rx="22" ry="28" fill="#d9a066" stroke="#9b6a3c" stroke-width="4" transform="rotate(-35 42 40)"/><rect x="56" y="54" width="14" height="62" rx="7" fill="#d9a066" stroke="#9b6a3c" stroke-width="4" transform="rotate(-35 63 85)"/></svg>`,
  berry:`<svg viewBox="0 0 120 120" role="img" aria-label="Toppings"><path d="M38 70 q-12 -30 18 -34 q30 4 18 34 q-10 14 -18 14 q-8 0 -18 -14z" fill="#e23b3b"/><path d="M48 38 l8 -10 l8 10z" fill="#3f8f4a"/>${[[82,70],[96,84],[78,92]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="10" fill="#3b4f9a"/>`).join('')}</svg>`,
  plate:`<svg viewBox="0 0 120 120" role="img" aria-label="Plate of pancakes"><ellipse cx="60" cy="88" rx="52" ry="14" fill="#fff" stroke="#e1d4c4" stroke-width="3"/>${[0,1,2].map(i=>`<ellipse cx="60" cy="${78-i*12}" rx="38" ry="10" fill="#d99848"/>`).join('')}<rect x="50" y="46" width="20" height="10" rx="3" fill="#fff1a3"/></svg>`
};
const KID_STEPS = [
  { say:'Let’s wash our hands! Tap the soap. Scrub, scrub, scrub!', hint:'Tap the big soap!', big:'soap', n:5, scene:'sink', sticker:'clean' },
  { say:'Pour the flour in the bowl! Tap the cup, or drag it to the bowl.', hint:'Tap the big cup!', big:'flour', n:1, scene:'bowl', fill:'#f6efe2', level:0.35 },
  { grown:true, say:'A grown-up cracks the egg and adds warm butter. Watch!', anim:'egg' },
  { say:'Pour in the milk! Tap the cup, or drag it to the bowl.', hint:'Tap the big cup!', big:'milk', n:1, scene:'bowl', fill:'#fbf5e6', level:0.6 },
  { say:'Stir, stir, stir! Tap the spoon.', hint:'Tap the big spoon!', big:'spoon', n:8, scene:'stir', sticker:'stir' },
  { grown:true, say:'The stove is hot. A grown-up does this part! Watch the pancakes cook and flip.', anim:'cook' },
  { say:'Make it pretty! Tap to add yummy toppings.', hint:'Tap the berries!', big:'berry', n:4, scene:'plate' },
  { say:'All done! Give the pancakes to Mina!', hint:'Tap the plate!', big:'plate', n:1, scene:'plate', sticker:'pancake' }
];
const STICKERS = { clean:{icon:'🧼', t:'Clean Hands'}, stir:{icon:'🥄', t:'Super Stirrer'}, pancake:{icon:'🥞', t:'Pancake Star'}, helper:{icon:'🧑‍🍳', t:'Great Helper'} };

VIEWS.kidkitchen = (opt={}) => {
  let idx=0; const tops = new Set(); const order=['butter','syrup','straw','blue'];
  main.innerHTML = `<h1 class="sr">Little Chef kitchen: Fluffy Pancakes</h1>
   <div class="kid-progress" aria-hidden="true">${KID_STEPS.map(()=>'<span>★</span>').join('')}</div><p class="sr" id="kstep" aria-live="polite"></p>
   <div class="stage kidstage" id="stage"></div><div id="kpanel" class="kpanel"></div>`;
  const stage=$('#stage'), panel=$('#kpanel');
  function pic(st,k){
    if (st.scene==='sink') return sinkSVG(k, st.n);
    if (st.scene==='bowl') return bowlSVG(st.fill, k? st.level : (idx>1?0.35:0), 'Mixing bowl');
    if (st.scene==='stir') return bowlSVG(k>=st.n?'#efd9a6':'#f6ead0', 0.7, 'Bowl of batter being stirred');
    if (st.scene==='plate') return plateSVG(tops);
    return '';
  }
  function progress(){ $$('.kid-progress span').forEach((s,i)=>s.className=i<idx?'done':i===idx?'now':''); $('#kstep').textContent=`Step ${idx+1} of ${KID_STEPS.length}`; }
  function nextBtn(){ const b=document.createElement('button'); b.className='btn round huge'; b.id='knext'; b.setAttribute('aria-label','Next'); b.innerHTML='<span aria-hidden="true">➜</span>';
    b.onclick=()=>{ idx++; if (idx>=KID_STEPS.length) return go('kidresult',opt); render(); }; panel.appendChild(b); b.focus(); }
  function render(){
    progress(); const st=KID_STEPS[idx]; panel.innerHTML=''; stage.onclick=null;
    if (st.grown){
      panel.innerHTML = `<div class="grownup" role="note"><span class="gicon" aria-hidden="true">🧑‍🍳</span><h2 id="gh" tabindex="-1" style="margin:0;font-size:1.2rem">A grown-up does this part!</h2></div>
        <button class="btn alt round" id="hear" aria-label="Hear it again"><span aria-hidden="true">🔊</span></button>`;
      $('#hear').onclick=()=>kidSay(st.say); $('#gh').focus(); kidSay(st.say);
      const words = st.anim==='egg' ? ['A grown-up holds the egg.','Crack! The grown-up cracks the egg.','Plop! The egg drops into the bowl.','Warm butter goes in too. All done!'] : ['The pancakes start to sizzle.','Little bubbles pop on top.','The grown-up flips them. Flip!','Golden pancakes! All done!'];
      const calm = S.settings.calm || matchMedia('(prefers-reduced-motion: reduce)').matches;
      const frames = st.anim==='egg'
        ? [()=>eggSVG(0),()=>eggSVG(1),()=>eggSVG(2),()=>bowlSVG('#f8e7b0',0.5,'Bowl with egg and butter added')]
        : [()=>panSVG(3,3,0.2,false),()=>panSVG(3,8,0.5,false),()=>panSVG(3,12,0.75,false),()=>panSVG(3,0,1,true)];
      let f=0; stage.innerHTML=frames[0]();
      if (st.anim==='cook') sfx('sizzle',.5); else sfx('pop');
      if (calm){ stage.innerHTML=frames[frames.length-1](); describeScene(words[words.length-1]); nextBtn(); return; }
      const iv=setInterval(()=>{ f++; if (!document.body.contains(stage)) return clearInterval(iv); stage.innerHTML=frames[f](); if (S.settings.descriptions) announce(words[f]); if (st.anim==='cook') sfx('sizzle', .3+f*.2); else sfx('pop'); if (f>=frames.length-1){ clearInterval(iv); sfx('ok'); nextBtn(); } }, 900);
      return;
    }
    let k=0; stage.innerHTML = pic(st,0);
    const art = st.big==='flour'||st.big==='milk' ? cupSVG(st.big) : BIG[st.big];
    panel.innerHTML = `<button class="bigtarget" id="big" aria-label="${esc(st.hint.replace(/^Tap the /,'').replace(/!$/,''))}. ${esc(st.say)}">${art}</button>
      <button class="btn alt round" id="hear" aria-label="Hear it again"><span aria-hidden="true">🔊</span></button>`;
    const big=$('#big'); let dragged=false, sx=0, sy=0, down=false;
    const hit = () => { if (k>=st.n) return; k++;
      if (st.scene==='plate' && st.big==='berry') tops.add(order[k-1]);
      stage.innerHTML = pic(st,k); big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop');
      sfx(({soap:'scrub',flour:'pour',milk:'pour',spoon:'stir',berry:'pop',plate:'ok'})[st.big]||'pop');
      if (k<st.n) announce(k+' of '+st.n);
      if (k>=st.n){ sfx('ok'); big.disabled=true; kidSay(['Yay!','Great job!','Wow, you did it!','Super!'][idx%4]); setTimeout(nextBtn, 300); } };
    big.addEventListener('pointerdown', e=>{ down=true; dragged=false; sx=e.clientX; sy=e.clientY; });
    big.addEventListener('pointermove', e=>{ if(!down) return; const dx=e.clientX-sx, dy=e.clientY-sy; if (Math.hypot(dx,dy)>12){ dragged=true; big.style.transform=`translate(${dx}px,${dy}px)`; } });
    const up = ()=>{ if(!down) return; down=false; if (dragged){ big.style.transform=''; hit(); } };
    big.addEventListener('pointerup', up); big.addEventListener('pointercancel', ()=>{ down=false; big.style.transform=''; });
    big.addEventListener('click', e=>{ e.stopPropagation(); if (dragged){ dragged=false; return; } hit(); });
    stage.onclick = () => { if (k>=st.n) return; big.classList.remove('wiggle'); void big.offsetWidth; big.classList.add('wiggle'); sfx('retry'); kidSay(st.hint); };
    $('#hear').onclick=()=>kidSay(st.say);
    kidSay(st.say); big.focus();
  }
  render();
};
function eggSVG(stage){
  return `<svg viewBox="0 0 240 170" role="img" aria-label="${['An egg','The grown-up cracks the egg','The egg drops into the bowl'][stage]}">
   <path d="M25 80 Q30 160 120 160 Q210 160 215 80Z" fill="#f7f3ee" stroke="#c9b8a6" stroke-width="3"/><ellipse cx="120" cy="80" rx="95" ry="14" fill="#fbf5e6" stroke="#c9b8a6" stroke-width="3"/>
   ${stage===0?'<ellipse cx="120" cy="40" rx="22" ry="28" fill="#fff8ec" stroke="#d9c7ae" stroke-width="3"/>':''}
   ${stage>=1?'<path d="M92 30 q6 -24 26 -20 l-4 10 l8 6 l-6 10z" fill="#fff8ec" stroke="#d9c7ae" stroke-width="3"/><path d="M148 30 q-6 -24 -26 -20 l4 10 l-8 6 l6 10z" fill="#fff8ec" stroke="#d9c7ae" stroke-width="3"/>':''}
   ${stage===1?'<circle cx="120" cy="52" r="10" fill="#ffc531"/>':''}${stage===2?'<ellipse cx="120" cy="84" rx="30" ry="8" fill="#fff" opacity=".8"/><circle cx="120" cy="82" r="10" fill="#ffc531"/>':''}</svg>`;
}

VIEWS.kidresult = (opt={}) => {
  const coins = opt.practice ? 20 : 30;
  S.coins += coins; S.cooks++; S.story.metMina = true; if (!S.friendship.mina) S.friendship.mina=1;
  S.journal.pancakes = { date: S.journal.pancakes?.date || new Date().toLocaleDateString(), stars: Math.max(S.journal.pancakes?.stars||0, 3), times:(S.journal.pancakes?.times||0)+1 };
  const got = ['clean','stir','pancake','helper'];
  S.stickers = S.stickers || {}; got.forEach(g=>S.stickers[g]=(S.stickers[g]||0)+1);
  save();
  main.innerHTML = `<div class="confetti" aria-hidden="true">${Array.from({length:24},(_,i)=>`<i style="left:${(i*37)%100}%;animation-delay:${(i%8)*0.15}s;background:${['#ff7aa8','#ffd36e','#7fd3c7','#9fb8ff'][i%4]}"></i>`).join('')}</div>
  <h1 class="center sparkle">Yay! You did it!</h1>
  <img class="reward-img" style="max-height:30vh" src="${MINA.img.delighted}" alt="${esc(MINA.alt.delighted)}">
  <div class="card center"><p class="dlg-text big">Mina: “Yummy! Thank you, chef!”</p>
   <h2>Your stickers</h2><ul class="stickers" aria-label="Stickers you earned">${got.map(g=>`<li class="sticker"><span aria-hidden="true">${STICKERS[g].icon}</span><b>${STICKERS[g].t}</b></li>`).join('')}</ul>
   <p style="font-size:1.4rem;font-weight:800"><span aria-hidden="true">🪙</span> +${coins} coins</p></div>
  <div class="row" style="justify-content:center">
   <button class="btn round huge teal" id="real" aria-label="Cook With a Grown-Up recipe card"><span aria-hidden="true">🧑‍🍳</span></button>
   <button class="btn round huge" id="home" aria-label="Back to the café"><span aria-hidden="true">☕</span></button></div>
  <p class="center muted" aria-hidden="true">🧑‍🍳 Cook with a grown-up &nbsp; · &nbsp; ☕ Back to café</p>`;
  bumpCoins(); sfx('coin');
  kidSay('Yay! You made pancakes! Mina says: Yummy! Thank you, chef! You got four stickers: Clean Hands, Super Stirrer, Pancake Star, and Great Helper. And '+coins+' coins!');
  $('#real').onclick=()=>go('recipe','pancakes'); $('#home').onclick=()=>go('cafe');
};

/* ---------- boot ---------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});
const hash = location.hash.replace('#','');
go(S.started && VIEWS[hash] ? hash : 'title');
window.__sizzle = { go, get state(){ return S; } };
})();
