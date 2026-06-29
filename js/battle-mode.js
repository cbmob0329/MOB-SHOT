'use strict';

(function(){
  const SAVE_KEY = 'mobshot_pet_mode_clear_v1';
  const GACHA_SAVE_KEY = 'mobshot_gacha_state_v1';

  const FALLBACK_ASSET = {
    bg:'sta/backsabaku.png',
    petBullet:'mt/atk.png',
    bossBullet:'atk/hinotama.png'
  };

  const MODE_MASTER = [
    { key:'arena', name:'アリーナ', icon:'mt/are.png', desc:'選んだペット最大4体で、雑魚3体＋中ボス1体に挑戦！', maxPets:4 },
    { key:'boss', name:'ボス降臨', icon:'mt/petboss.png', desc:'選んだペット最大6体で、ステージボス1体に挑戦！', maxPets:6 },
    { key:'ragnarok', name:'ラグナロク', icon:'mt/rag.png', desc:'所持ペット全員で、通常ボス＋強力ボスの2体に挑戦！', maxPets:999 }
  ];

  const DIFFICULTIES = [
    { key:'easy', name:'イージー', icon:'mt/game1.png', hpRate:0.65, atkRate:0.60, dropRate:0.08, rewardCoin:1500, rewardDiamond:0 },
    { key:'hard', name:'ハード', icon:'mt/game2.png', hpRate:1.00, atkRate:1.00, dropRate:0.12, rewardCoin:3000, rewardDiamond:1 },
    { key:'veryhard', name:'ベリーハード', icon:'mt/game3.png', hpRate:1.65, atkRate:1.45, dropRate:0.18, rewardCoin:6000, rewardDiamond:2 },
    { key:'inferno', name:'インフェルノ', icon:'mt/game4.png', hpRate:2.45, atkRate:2.10, dropRate:0.28, rewardCoin:12000, rewardDiamond:4 },
    { key:'legend', name:'レジェンド', icon:'mt/game5.png', hpRate:3.60, atkRate:3.00, dropRate:0.45, rewardCoin:25000, rewardDiamond:8, legend:true }
  ];

  const PET_STONES = [
    { no:56, name:'モブドラゴン', image:'co/co56.png', rarity:'SR', category:'MOB PET' },
    { no:57, name:'モブイルカエル', image:'co/co57.png', rarity:'SR', category:'MOB PET' },
    { no:58, name:'モブデンデン', image:'co/co58.png', rarity:'SR', category:'MOB PET' },
    { no:86, name:'モブウルフ', image:'co/co86.png', rarity:'SR', category:'MOB PET' },
    { no:87, name:'ミニミラモブ', image:'co/co87.png', rarity:'SR', category:'MOB PET' },
    { no:88, name:'ミニネオンモブ', image:'co/co88.png', rarity:'SR', category:'MOB PET' },
    { no:89, name:'ミニあのヒーロー', image:'co/co89.png', rarity:'SR', category:'MOB PET' },
    { no:90, name:'ミニミラモブ カラー', image:'co/co90.png', rarity:'SSR', category:'MOB PET' }
  ];

  const STAGES_NORMAL = [
    {
      key:'grass', name:'草原', bg:'sta/backsougen.png',
      arenaZako:[
        { name:'スラモブ', image:'en/sra.png', hp:180, power:8 },
        { name:'モブロック', image:'en/eniwa.png', hp:220, power:10 },
        { name:'スラモブ', image:'en/sra.png', hp:200, power:9 }
      ],
      mid:{ name:'モブプテラ', image:'en/enpte.png', hp:700, power:14, atkImage:'atk/hawkatk.png', pattern:'mid' },
      boss:{ name:'ホークモブ', image:'boss/hawks.png', hp:1200, power:18, atkImage:'atk/hawkatk.png', pattern:'hawk' },
      strongBoss:{ name:'ホークモブⅡ', image:'boss/hawks2.png', hp:1900, power:25, atkImage:'atk/hawkatk.png', pattern:'hawk2' }
    },
    {
      key:'desert', name:'砂漠', bg:'sta/backsabaku.png',
      arenaZako:[
        { name:'モブ盗賊', image:'en/entozok.png', hp:240, power:10 },
        { name:'モブドワーフ', image:'en/endowa.png', hp:280, power:12 },
        { name:'モブ盗賊', image:'en/entozok.png', hp:260, power:11 }
      ],
      mid:{ name:'モブデュアル', image:'en/sabadual.png', hp:850, power:17, atkImage:'atk/miraatk.png', pattern:'mid' },
      boss:{ name:'ミラモブ', image:'boss/miraboss.png', hp:1350, power:20, atkImage:'atk/miraatk.png', pattern:'mira' },
      strongBoss:{ name:'ミラモブⅡ', image:'boss/bossmira2.png', hp:2100, power:28, atkImage:'atk/miraatk.png', pattern:'mira2' }
    },
    {
      key:'town', name:'田舎町', bg:'sta/backumi.png',
      arenaZako:[
        { name:'モブバード', image:'en/enwasi.png', hp:300, power:12 },
        { name:'モブファル', image:'en/iwakofal.png', hp:330, power:14 },
        { name:'モブバード', image:'en/enwasi.png', hp:310, power:13 }
      ],
      mid:{ name:'モブピー', image:'en/enmobpi.png', hp:1000, power:20, atkImage:'atk/hinotama.png', pattern:'mid' },
      boss:{ name:'モブガーディアン', image:'boss/bossban.png', hp:1550, power:23, atkImage:'atk/hinotama.png', pattern:'guardian' },
      strongBoss:{ name:'モブガーディアンⅡ', image:'boss/bossban2.png', hp:2350, power:31, atkImage:'atk/hinotama.png', pattern:'guardian2' }
    },
    {
      key:'neon', name:'ネオン街', bg:'sta/backneon.png',
      arenaZako:[
        { name:'ナーガモブ', image:'en/ennarga.png', hp:360, power:15 },
        { name:'モブグリズリー', image:'en/enguri.png', hp:430, power:17 },
        { name:'ナーガモブ', image:'en/ennarga.png', hp:390, power:16 }
      ],
      mid:{ name:'モブギドラ', image:'en/neongidra.png', hp:1200, power:23, atkImage:'atk/kaminari.png', pattern:'mid' },
      boss:{ name:'ネオンモブ', image:'boss/bossneon.png', hp:1750, power:26, atkImage:'atk/kaminari.png', pattern:'neon' },
      strongBoss:{ name:'ネオンモブⅡ', image:'boss/bossneon2.png', hp:2600, power:36, atkImage:'atk/kaminari.png', pattern:'neon2' }
    },
    {
      key:'magma', name:'マグマ', bg:'sta/backmagma.png',
      arenaZako:[
        { name:'モブマグトカゲ', image:'en/enmagtokage.png', hp:430, power:18 },
        { name:'モブマグプテラ', image:'en/enmagpte.png', hp:480, power:20 },
        { name:'モブマグトカゲ', image:'en/enmagtokage.png', hp:450, power:19 }
      ],
      mid:{ name:'マグモブレム', image:'en/enmaggolem.png', hp:1450, power:27, atkImage:'atk/dragon.png', pattern:'mid' },
      boss:{ name:'ドラゴンモブ', image:'boss/bossdragoon.png', hp:2100, power:32, atkImage:'atk/dragon.png', pattern:'dragon' },
      strongBoss:{ name:'ドラゴンモブⅡ', image:'boss/bossdragoon2.png', hp:3100, power:43, atkImage:'atk/dragon.png', pattern:'dragon2' }
    },
    {
      key:'castle', name:'魔王城', bg:'sta/backmao.png',
      arenaZako:[
        { name:'ダークゴブモブ', image:'en/enmaogob.png', hp:520, power:22 },
        { name:'モブアサシン', image:'en/enasa.png', hp:560, power:24 },
        { name:'ダークゴブモブ', image:'en/enmaogob.png', hp:540, power:23 }
      ],
      mid:{ name:'グラディモブ', image:'en/mobgra.png', hp:1700, power:31, atkImage:'atk/atkriri.png', pattern:'mid' },
      boss:{ name:'モブリリス', image:'boss/bossriris.png', hp:2600, power:40, atkImage:'atk/atkriri.png', pattern:'lilith' },
      strongBoss:{ name:'モブ魔王', image:'boss/bossmaoh.png', hp:3800, power:54, atkImage:'atk/atkmaoh.png', pattern:'maoh' }
    }
  ];

  const STAGES_LEGEND = [
    {
      key:'prison', name:'監獄', bg:'sta/stkan.png',
      arenaZako:[
        { name:'モブテツ', image:'en/mobtetu.png', hp:700, power:28 },
        { name:'マルモブ', image:'en/marumob.png', hp:760, power:30 },
        { name:'モブテツ', image:'en/mobtetu.png', hp:730, power:29 }
      ],
      mid:{ name:'モブニコ', image:'en/mobnico.png', hp:2200, power:38, atkImage:'atk/atkmeiru.png', pattern:'mid' },
      boss:{ name:'モブメイル', image:'boss/bossmeiru.png', hp:4200, power:60, atkImage:'atk/atkmeiru.png', pattern:'mail' },
      strongBoss:{ name:'モブスミス', image:'boss/bosssmith.png', hp:5600, power:72, atkImage:'atk/matrix.png', pattern:'smith' }
    },
    {
      key:'matrix', name:'マトリックス', bg:'sta/stmatrix.png',
      arenaZako:[
        { name:'モブサラ', image:'en/mobsara.png', hp:760, power:31 },
        { name:'モブシノ', image:'en/mobsino.png', hp:820, power:34 },
        { name:'モブサラ', image:'en/mobsara.png', hp:790, power:32 }
      ],
      mid:{ name:'ガトリモブ', image:'en/gatorimob.png', hp:2500, power:42, atkImage:'atk/matrix.png', pattern:'mid' },
      boss:{ name:'モブスミス', image:'boss/bosssmith.png', hp:4600, power:64, atkImage:'atk/matrix.png', pattern:'smith' },
      strongBoss:{ name:'モブネプ', image:'boss/bossmobnep.png', hp:6000, power:78, atkImage:'atk/atknep.png', pattern:'nep' }
    },
    {
      key:'sea', name:'海の線路', bg:'sta/umisenro.png',
      arenaZako:[
        { name:'ウミシモブ', image:'en/umisimob.png', hp:820, power:34 },
        { name:'バブモブ', image:'en/babumob.png', hp:900, power:37 },
        { name:'ウミシモブ', image:'en/umisimob.png', hp:850, power:35 }
      ],
      mid:{ name:'モブサメ', image:'en/mobsame.png', hp:2750, power:45, atkImage:'atk/atknep.png', pattern:'mid' },
      boss:{ name:'モブネプ', image:'boss/bossmobnep.png', hp:5000, power:68, atkImage:'atk/atknep.png', pattern:'nep' },
      strongBoss:{ name:'ホークモブⅡ', image:'boss/hawks2.png', hp:6600, power:82, atkImage:'atk/hawkatk.png', pattern:'hawk2' }
    },
    {
      key:'neonroad', name:'ネオン高速', bg:'sta/neonlord.png',
      arenaZako:[
        { name:'ネオスラモブ', image:'en/neosura.png', hp:880, power:37 },
        { name:'モブネオレム', image:'en/neorem.png', hp:980, power:40 },
        { name:'ネオスラモブ', image:'en/neosura.png', hp:910, power:38 }
      ],
      mid:{ name:'モブコード', image:'en/mobcode.png', hp:3000, power:49, atkImage:'atk/kaminari.png', pattern:'mid' },
      boss:{ name:'ブルネオモブ', image:'boss/bossneonblue.png', hp:5400, power:72, atkImage:'atk/kaminari.png', pattern:'neon2' },
      strongBoss:{ name:'パルネオモブ', image:'boss/bossneonp.png', hp:7000, power:86, atkImage:'atk/kaminari.png', pattern:'neon2' }
    },
    {
      key:'makai', name:'魔界', bg:'sta/makai.png',
      arenaZako:[
        { name:'モブデビブルー', image:'en/mobdebib.png', hp:960, power:41 },
        { name:'モブデビピンク', image:'en/mobdebipink.png', hp:1020, power:44 },
        { name:'モブデビパープル', image:'en/mobdebip.png', hp:1050, power:45 }
      ],
      mid:{ name:'モブマグシャー', image:'en/mobmagsya.png', hp:3300, power:54, atkImage:'atk/atkmaoh.png', pattern:'mid' },
      boss:{ name:'モブエース', image:'boss/bossace.png', hp:6200, power:80, atkImage:'atk/atkmaoh.png', pattern:'maoh' },
      strongBoss:{ name:'モブ魔王', image:'boss/bossmaoh.png', hp:8000, power:96, atkImage:'atk/atkmaoh.png', pattern:'maoh' }
    },
    {
      key:'last', name:'魔王の間', bg:'sta/makailast.png',
      arenaZako:[
        { name:'モブデビイエロー', image:'en/mobdebiy.png', hp:1100, power:47 },
        { name:'モブデーモンレッド', image:'en/mobdemonr.png', hp:1180, power:51 },
        { name:'モブデーモンパープル', image:'en/mobdemonp.png', hp:1220, power:52 }
      ],
      mid:{ name:'モブリリス', image:'boss/bossriris.png', hp:4000, power:62, atkImage:'atk/atkriri.png', pattern:'lilith' },
      boss:{ name:'閻魔モブ', image:'boss/enmamob.png', hp:7600, power:92, atkImage:'atk/atkmaoh.png', pattern:'maoh' },
      strongBoss:{ name:'ウルモブリリス', image:'boss/bossulmob.png', hp:9200, power:108, atkImage:'atk/atkriri.png', pattern:'lilith' }
    }
  ];

  let canvas = null;
  let ctx = null;
  let W = 0;
  let H = 0;
  let DPR = 1;
  let raf = 0;
  let running = false;

  const images = new Map();

  const state = {
    screen:'title',
    frame:0,
    mode:null,
    difficulty:null,
    stage:null,
    selectedPetKeys:[],
    availablePets:[],
    enemies:[],
    bosses:[],
    pets:[],
    petBullets:[],
    enemyBullets:[],
    particles:[],
    texts:[],
    dropCards:[],
    cutins:[],
    message:'',
    messageTimer:0,
    resultShown:false,
    rewardDone:false,
    support:{ rapid:1, power:1, shield:0, coin:1 },
    stats:{ damage:0, petLost:0, enemyKilled:0, bossKilled:0, clear:false, drops:[], rubyReward:0 }
  };

  function $(id){ return document.getElementById(id); }
  function rand(a,b){ return a + Math.random() * (b - a); }
  function intRand(a,b){ return Math.floor(rand(a, b + 1)); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  function img(src){
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=20260627_pet_mode_new7_final';
      images.set(src, image);
    }

    return images.get(src);
  }

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  }

  function drawImageContain(ctx, image, cx, cy, maxW, maxH){
    if (!imageReady(image)) return false;

    const iw = image.naturalWidth || image.width;
    const ih = image.naturalHeight || image.height;
    const scale = Math.min(maxW / iw, maxH / ih);
    const w = iw * scale;
    const h = ih * scale;

    ctx.drawImage(image, cx - w / 2, cy - h / 2, w, h);
    return true;
  }

  function loadClearSave(){
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch(e) { return {}; }
  }

  function saveClear(modeKey, diffKey, stageKey){
    try {
      const save = loadClearSave();
      save[modeKey] = save[modeKey] || {};
      save[modeKey][diffKey] = save[modeKey][diffKey] || {};
      save[modeKey][diffKey][stageKey] = true;
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch(e) {}
  }

  function isLegendUnlocked(modeKey){
    const save = loadClearSave();
    const modeSave = save[modeKey] || {};
    const inferno = modeSave.inferno || {};
    return STAGES_NORMAL.every(stage => !!inferno[stage.key]);
  }

  function getStagesForCurrent(){
    if (!state.difficulty || !state.difficulty.legend) return STAGES_NORMAL;
    return STAGES_NORMAL.concat(STAGES_LEGEND);
  }

  function getDifficultiesForMode(modeKey){
    const unlocked = isLegendUnlocked(modeKey);
    return DIFFICULTIES.filter(d => !d.legend || unlocked);
  }

  function ensureScreen(){
    let screen = $('battleScreen');
    const app = $('app') || document.body;

    if (!screen) {
      screen = document.createElement('section');
      screen.id = 'battleScreen';
      screen.className = 'screen';
      app.appendChild(screen);
    }

    screen.innerHTML = '<canvas id="battleCanvas"></canvas><div id="battleOverlay" class="battle-overlay"></div>';
    return screen;
  }

  function injectStyle(){
    if ($('mobBattleStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobBattleStyle';
    style.textContent = `
      #battleScreen{position:absolute!important;inset:0!important;width:100vw!important;height:100svh!important;overflow:hidden!important;background:#07101f!important;color:#fff!important}
      #battleScreen.active{display:block!important}
      #battleCanvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;touch-action:none!important;z-index:1!important}
      .battle-overlay{position:absolute!important;inset:0!important;z-index:50!important;pointer-events:none!important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
      .battle-menu{position:absolute!important;inset:0!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:16px!important;background:rgba(0,0,0,.64)!important;pointer-events:auto!important}
      .battle-card{width:min(94vw,470px)!important;max-height:90svh!important;overflow:auto!important;border-radius:26px!important;padding:18px!important;text-align:center!important;background:linear-gradient(180deg,rgba(35,28,78,.98),rgba(5,8,22,.98))!important;border:3px solid rgba(255,255,255,.35)!important;box-shadow:0 18px 48px rgba(0,0,0,.7)!important}
      .battle-title{margin:0 0 10px!important;font-size:30px!important;font-weight:1000!important;color:#ffe66b!important;text-shadow:0 5px 0 #000!important;line-height:1.05!important}
      .battle-help{margin:0 0 14px!important;color:#dfe8ff!important;font-size:13px!important;font-weight:900!important;line-height:1.55!important}
      .battle-grid{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;margin-bottom:12px!important}
      .battle-mode-btn,.battle-stage-btn,.battle-diff-btn,.battle-pet-btn{display:grid!important;grid-template-columns:58px 1fr auto!important;gap:10px!important;align-items:center!important;width:100%!important;border:2px solid rgba(255,255,255,.26)!important;border-radius:18px!important;padding:10px!important;background:linear-gradient(135deg,rgba(50,68,105,.96),rgba(13,22,40,.96))!important;color:#fff!important;font-weight:1000!important;text-align:left!important;box-shadow:0 6px 0 rgba(0,0,0,.28)!important}
      .battle-mode-btn img,.battle-diff-btn img,.battle-pet-btn img{width:54px!important;height:54px!important;object-fit:contain!important}
      .battle-stage-thumb{width:54px!important;height:54px!important;border-radius:12px!important;background:#0b1325!important;object-fit:cover!important;border:2px solid rgba(255,255,255,.18)!important}
      .battle-name{font-size:17px!important;color:#ffe66b!important}
      .battle-sub{margin-top:3px!important;font-size:11px!important;color:#dfe8ff!important;line-height:1.35!important}
      .battle-right{font-size:11px!important;color:#9dff73!important;text-align:right!important;line-height:1.35!important;white-space:nowrap!important}
      .battle-pet-btn.selected{border-color:#ffe66b!important;background:linear-gradient(135deg,rgba(91,76,28,.98),rgba(40,26,8,.98))!important}
      .battle-btn{border:0!important;border-radius:999px!important;padding:13px 12px!important;font-size:17px!important;font-weight:1000!important;color:#201100!important;background:linear-gradient(#ffe66b,#ffb423)!important;box-shadow:0 5px 0 rgba(0,0,0,.36)!important}
      .battle-btn.blue{color:#fff!important;background:linear-gradient(#60d9ff,#1774ee)!important}
      .battle-btn.green{color:#07370f!important;background:linear-gradient(#9dff73,#26b63e)!important}
      .battle-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;margin-top:10px!important}
      .battle-drop-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:8px!important;margin:10px 0!important}
      .battle-drop-card{border-radius:14px!important;padding:6px!important;background:rgba(255,255,255,.12)!important;border:2px solid rgba(255,255,255,.25)!important;text-align:center!important}
      .battle-drop-card img{width:52px!important;height:52px!important;object-fit:contain!important;display:block!important;margin:0 auto 3px!important}
      .battle-drop-name{font-size:9px!important;font-weight:1000!important;color:#fff!important;line-height:1.2!important}
      .battle-drop-rarity{font-size:10px!important;font-weight:1000!important;color:#ffe66b!important}
    `;
    document.head.appendChild(style);
  }

  function initCanvas(){
    ensureScreen();
    injectStyle();

    canvas = $('battleCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resize();

    window.removeEventListener('resize', resize);
    window.addEventListener('resize', resize);
  }

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);

    const screen = $('battleScreen');
    const rect = screen ? screen.getBoundingClientRect() : { width:window.innerWidth, height:window.innerHeight };

    W = Math.max(1, rect.width || window.innerWidth);
    H = Math.max(1, rect.height || window.innerHeight);

    if (!canvas || !ctx) return;

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);

    layoutEnemies();
    assignPetFormationTargets();
  }

  function open(){
    initCanvas();

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = $('battleScreen');
    if (screen) screen.classList.add('active');

    state.screen = 'title';
    state.frame = 0;
    state.mode = null;
    state.difficulty = null;
    state.stage = null;
    state.selectedPetKeys = [];
    state.resultShown = false;
    state.rewardDone = false;

    clearObjects();
    renderOverlay();

    running = true;
    cancelAnimationFrame(raf);
    loop();
  }

  function close(){
    running = false;
    cancelAnimationFrame(raf);

    if (window.MobShotMain && window.MobShotMain.goMain) {
      window.MobShotMain.goMain();
      return;
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const main = $('mainScreen') || $('mainView');
    if (main) main.classList.add('active');
  }

  function renderOverlay(){
    const overlay = $('battleOverlay');
    if (!overlay) return;

    if (state.screen === 'title') {
      overlay.innerHTML = `
        <div class="battle-menu">
          <div class="battle-card">
            <h1 class="battle-title">PET MODE</h1>
            <p class="battle-help">使っていないペットも活躍できる専用モードです。</p>
            <div class="battle-grid">
              ${MODE_MASTER.map(m => `
                <button class="battle-mode-btn" type="button" data-mode="${m.key}">
                  <img src="${m.icon}" alt="">
                  <div><div class="battle-name">${m.name}</div><div class="battle-sub">${m.desc}</div></div>
                  <div class="battle-right">最大${m.maxPets >= 999 ? '全員' : m.maxPets + '体'}</div>
                </button>
              `).join('')}
            </div>
            <button id="mobBattleMainBtn" class="battle-btn blue" type="button" style="width:100%">メインへ戻る</button>
          </div>
        </div>
      `;

      overlay.querySelectorAll('.battle-mode-btn').forEach(btn => {
        btn.onclick = function(){
          const key = this.getAttribute('data-mode');
          const mode = MODE_MASTER.find(m => m.key === key);
          if (!mode) return;
          state.mode = mode;
          state.screen = 'difficulty';
          renderOverlay();
        };
      });

      $('mobBattleMainBtn').onclick = close;
      return;
    }

    if (state.screen === 'difficulty') {
      const list = getDifficultiesForMode(state.mode.key);
      const lockedLegend = !isLegendUnlocked(state.mode.key);

      overlay.innerHTML = `
        <div class="battle-menu">
          <div class="battle-card">
            <h1 class="battle-title">${state.mode.name}</h1>
            <p class="battle-help">${lockedLegend ? 'インフェルノで草原〜魔王城を全クリアするとレジェンド解放。' : 'レジェンド解放済み。'}</p>
            <div class="battle-grid">
              ${list.map(d => {
                const r = rubyRewardRange(d.key);
                return `
                  <button class="battle-diff-btn" type="button" data-diff="${d.key}">
                    <img src="${d.icon}" alt="">
                    <div><div class="battle-name">${d.name}</div><div class="battle-sub">HP x${d.hpRate} / 攻撃 x${d.atkRate} / 石板Drop ${Math.round(d.dropRate * 100)}%</div></div>
                    <div class="battle-right">${d.rewardCoin.toLocaleString()} COIN<br>💎 +${d.rewardDiamond}<br>♦ ${r[0]}〜${r[1]}</div>
                  </button>
                `;
              }).join('')}
            </div>
            <div class="battle-row">
              <button id="mobBackTitleBtn" class="battle-btn blue" type="button">戻る</button>
              <button id="mobBattleMainBtn" class="battle-btn" type="button">メインへ</button>
            </div>
          </div>
        </div>
      `;

      overlay.querySelectorAll('.battle-diff-btn').forEach(btn => {
        btn.onclick = function(){
          const key = this.getAttribute('data-diff');
          const diff = DIFFICULTIES.find(d => d.key === key);
          if (!diff) return;
          state.difficulty = diff;
          state.screen = 'stage';
          renderOverlay();
        };
      });

      $('mobBackTitleBtn').onclick = function(){ state.screen = 'title'; renderOverlay(); };
      $('mobBattleMainBtn').onclick = close;
      return;
    }

    if (state.screen === 'stage') {
      const stages = getStagesForCurrent();

      overlay.innerHTML = `
        <div class="battle-menu">
          <div class="battle-card">
            <h1 class="battle-title">ステージ選択</h1>
            <p class="battle-help">${state.difficulty.name} / ${state.mode.name}</p>
            <div class="battle-grid">
              ${stages.map(stage => `
                <button class="battle-stage-btn" type="button" data-stage="${stage.key}">
                  <img class="battle-stage-thumb" src="${stage.bg}" alt="">
                  <div><div class="battle-name">${stage.name}</div><div class="battle-sub">${getStageDescByMode(state.mode.key, stage)}</div></div>
                  <div class="battle-right">SELECT</div>
                </button>
              `).join('')}
            </div>
            <div class="battle-row">
              <button id="mobBackDiffBtn" class="battle-btn blue" type="button">戻る</button>
              <button id="mobBattleMainBtn" class="battle-btn" type="button">メインへ</button>
            </div>
          </div>
        </div>
      `;

      overlay.querySelectorAll('.battle-stage-btn').forEach(btn => {
        btn.onclick = function(){
          const key = this.getAttribute('data-stage');
          const stage = stages.find(s => s.key === key);
          if (!stage) return;

          state.stage = stage;

          if (state.mode.key === 'ragnarok') {
            state.selectedPetKeys = getOwnedPetList().map(p => p.key);
            beginGame();
          } else {
            state.availablePets = getOwnedPetList();
            state.selectedPetKeys = [];
            state.screen = 'petSelect';
            renderOverlay();
          }
        };
      });

      $('mobBackDiffBtn').onclick = function(){ state.screen = 'difficulty'; renderOverlay(); };
      $('mobBattleMainBtn').onclick = close;
      return;
    }

    if (state.screen === 'petSelect') {
      const max = Number(state.mode.maxPets || 4);
      const selectedCount = state.selectedPetKeys.length;

      overlay.innerHTML = `
        <div class="battle-menu">
          <div class="battle-card">
            <h1 class="battle-title">ペット選択</h1>
            <p class="battle-help">${state.mode.name} / ${state.stage.name} / ${state.difficulty.name}<br>最大${max}体まで。足りなくても出撃可能。</p>
            <div class="battle-grid">
              ${state.availablePets.map(p => `
                <button class="battle-pet-btn ${state.selectedPetKeys.includes(p.key) ? 'selected' : ''}" type="button" data-pet="${p.key}">
                  <img src="${p.backImage || p.frontImage || ''}" alt="">
                  <div>
                    <div class="battle-name">${p.name}</div>
                    <div class="battle-sub">
                      ${p.role || ''} / Lv${p.level} +${p.plus || 0} / 専用Lv${petModeTotalLevel(p.petMode || {})}
                      ${p.secondSkillUnlocked && p.secondSkill ? '<br>第二スキル: ' + p.secondSkill.name : ''}
                    </div>
                  </div>
                  <div class="battle-right">${state.selectedPetKeys.includes(p.key) ? '選択中' : '選択'}</div>
                </button>
              `).join('')}
            </div>
            <p class="battle-help">選択中: ${selectedCount}/${max}</p>
            <div class="battle-row">
              <button id="mobBackStageBtn" class="battle-btn blue" type="button">戻る</button>
              <button id="mobStartPetModeBtn" class="battle-btn green" type="button">出撃</button>
            </div>
          </div>
        </div>
      `;

      overlay.querySelectorAll('.battle-pet-btn').forEach(btn => {
        btn.onclick = function(){
          const key = this.getAttribute('data-pet');
          togglePetSelect(key, max);
          renderOverlay();
        };
      });

      $('mobBackStageBtn').onclick = function(){ state.screen = 'stage'; renderOverlay(); };
      $('mobStartPetModeBtn').onclick = beginGame;
      return;
    }

    if (state.screen === 'result') return;

    overlay.innerHTML = '';
  }

  function petModeTotalLevel(mode){
    mode = mode || {};
    return Number(mode.hp || 0) + Number(mode.power || 0) + Number(mode.rapid || 0) + Number(mode.skill || 0) + Number(mode.dodge || 0);
  }

  function getStageDescByMode(modeKey, stage){
    if (modeKey === 'arena') return `雑魚3体 + 中ボス: ${stage.mid.name}`;
    if (modeKey === 'boss') return `ボス: ${stage.boss.name}`;
    return `ボス2体: ${stage.boss.name} / ${stage.strongBoss.name}`;
  }

  function togglePetSelect(key, max){
    if (state.selectedPetKeys.includes(key)) {
      state.selectedPetKeys = state.selectedPetKeys.filter(k => k !== key);
      return;
    }

    if (state.selectedPetKeys.length >= max) return;
    state.selectedPetKeys.push(key);
  }

  function getOwnedPetList(){
    const list = [];

    if (window.MobShotPets && Array.isArray(window.MobShotPets.PET_MASTER)) {
      window.MobShotPets.PET_MASTER.forEach(master => {
        if (!master || !master.implemented) return;

        const owned = window.MobShotPets.isOwned ? window.MobShotPets.isOwned(master.key) : false;
        if (!owned) return;

        const lv = window.MobShotPets.getLevel ? window.MobShotPets.getLevel(master.key) : 1;
        const plus = window.MobShotPets.getPlus ? window.MobShotPets.getPlus(master.key) : 0;
        const petMode = window.MobShotPets.getPetMode ? window.MobShotPets.getPetMode(master.key) : {};
        const full = window.MobShotPets.getPet ? window.MobShotPets.getPet(master.key) : master;
        const secondSkillUnlocked = window.MobShotPets.isSecondSkillUnlocked ? window.MobShotPets.isSecondSkillUnlocked(master.key) : false;
        const cap = window.MobShotPets.levelCapBySecondSkill ? window.MobShotPets.levelCapBySecondSkill(secondSkillUnlocked) : (secondSkillUnlocked ? 99 : 50);

        list.push(Object.assign({}, full || master, {
          level:Math.max(1, Math.min(cap, Number(lv || 1))),
          plus:Math.max(0, Math.min(99, Number(plus || 0))),
          levelCap:cap,
          secondSkillUnlocked:!!secondSkillUnlocked,
          secondSkill:secondSkillUnlocked && full && full.secondSkill ? full.secondSkill : null,
          petMode:petMode || {},
          petModeHpRate:window.MobShotPets.petModeHpRate ? window.MobShotPets.petModeHpRate(petMode) : 1,
          petModePowerRate:window.MobShotPets.petModePowerRate ? window.MobShotPets.petModePowerRate(petMode) : 1,
          petModeRapidRate:window.MobShotPets.petModeRapidRate ? window.MobShotPets.petModeRapidRate(petMode) : 1,
          petModeSkillRate:window.MobShotPets.petModeSkillRate ? window.MobShotPets.petModeSkillRate(petMode) : 1,
          petModeDodgeRate:window.MobShotPets.petModeDodgeRate ? window.MobShotPets.petModeDodgeRate(petMode) : 1
        }));
      });
    }

    return list;
  }

  function beginGame(){
    state.screen = 'battle';
    state.frame = 0;
    state.resultShown = false;
    state.rewardDone = false;
    state.stats = { damage:0, petLost:0, enemyKilled:0, bossKilled:0, clear:false, drops:[], rubyReward:0 };

    clearBattleObjectsOnly();
    resetSupport();
    buildPetUnits();

    if (!state.pets.length) {
      showResult(false, '出撃できるペットがいません');
      return;
    }

    spawnContent();
    showMessage(`${state.mode.name} START!`);
    renderOverlay();
  }

  function clearObjects(){
    state.enemies.length = 0;
    state.bosses.length = 0;
    state.pets.length = 0;
    state.petBullets.length = 0;
    state.enemyBullets.length = 0;
    state.particles.length = 0;
    state.texts.length = 0;
    state.dropCards.length = 0;
    state.cutins.length = 0;
  }

  function clearBattleObjectsOnly(){
    state.enemies.length = 0;
    state.bosses.length = 0;
    state.pets.length = 0;
    state.petBullets.length = 0;
    state.enemyBullets.length = 0;
    state.particles.length = 0;
    state.texts.length = 0;
    state.dropCards.length = 0;
    state.cutins.length = 0;
  }

  function resetSupport(){
    state.support.rapid = 1;
    state.support.power = 1;
    state.support.shield = 0;
    state.support.coin = 1;
  }

  function buildPetUnits(){
    const owned = getOwnedPetList();
    const selected = state.selectedPetKeys.length
      ? owned.filter(p => state.selectedPetKeys.includes(p.key))
      : owned.slice(0, Number(state.mode.maxPets || 4));

    selected.forEach((pet, index) => {
      const lv = Math.max(1, Math.min(Number(pet.levelCap || 50), Number(pet.level || 1)));
      const plus = Math.max(0, Math.min(99, Number(pet.plus || 0)));

      const modeHp = Number(pet.petModeHpRate || 1);
      const modePower = Number(pet.petModePowerRate || 1);
      const modeRapid = Number(pet.petModeRapidRate || 1);
      const modeSkill = Number(pet.petModeSkillRate || 1);
      const modeDodge = Number(pet.petModeDodgeRate || 1);
      const second = pet.secondSkillUnlocked && pet.secondSkill ? pet.secondSkill : null;

      const hp = Math.ceil(getPetMaxHp(lv, pet, plus) * modeHp);

      state.pets.push({
        key:pet.key,
        name:pet.name || 'PET',
        image:pet.backImage || pet.frontImage || '',
        frontImage:pet.frontImage || '',
        backImage:pet.backImage || pet.frontImage || '',
        atkImage:pet.atkImage || '',
        skillAtkImage:pet.skillAtkImage || '',
        htmlBullet:pet.htmlBullet || '',
        role:pet.role || '',
        level:lv,
        plus,
        petMode:pet.petMode || {},
        petModeHpRate:modeHp,
        petModePowerRate:modePower,
        petModeRapidRate:modeRapid,
        petModeSkillRate:modeSkill,
        petModeDodgeRate:modeDodge,
        secondSkillUnlocked:!!second,
        secondSkill:second,
        maxHp:hp,
        hp,
        power:getPetPower(lv, pet, plus) * modePower,
        rapid:getPetRapid(lv, pet) * modeRapid,
        skillPower:getPetSkillPower(lv, pet, plus) * modeSkill,
        skillName:pet.skillName || 'PET SKILL',
        skillCt:Math.max(180, Math.floor(getPetSkillCt(lv, pet, plus) * 60)),
        skillCd:Math.max(90, Math.floor(Number(pet.firstCt || 8) * 60) + index * 10),
        secondSkillCt:second ? Math.max(1080, Math.floor(getPetSecondSkillCt(lv, pet, plus, second) * 60)) : 99999999,
        secondSkillCd:second ? Math.max(600, Math.floor(Number(second.firstCt || 24) * 60) + index * 18) : 99999999,
        shootCd:20 + index % 12,
        x:W / 2,
        y:H * 0.72,
        homeX:W / 2,
        homeY:H * 0.72,
        targetX:W / 2,
        targetY:H * 0.72,
        aiCd:intRand(45,120),
        dodgeCd:0,
        laneShift:rand(-18,18),
        r:20,
        dead:false,
        bob:Math.random() * Math.PI * 2
      });
    });

    assignPetFormationTargets();
  }

  function getPetMaxHp(lv, pet, plus){
    let hp = 90 + lv * 12 + Math.floor(lv * lv * 0.16);

    if (pet.role && pet.role.includes('防御')) hp *= 1.25;
    if (pet.key === 'chibimobtetsu' || pet.key === 'mobshield') hp *= 1.35;
    if (pet.key === 'hero') hp *= 1.20;
    if (pet.key === 'mobslime') hp *= 0.95;
    if (pet.key === 'babymob') hp *= 0.82;
    if (pet.key === 'mobstone') hp *= 1.18;

    hp *= 1 + Number(plus || 0) * 0.001;

    return Math.ceil(hp);
  }

  function getPetPower(lv, pet, plus){
    const base = Number(pet.normalAttackRate || 0.5);
    return Math.max(1, 5 * base * (1 + (lv - 1) * 0.018) * (1 + Number(plus || 0) * 0.001));
  }

  function getPetRapid(lv, pet){
    const base = Number(pet.normalRateRate || 0.5);
    return Math.max(0.35, base * (1 + (lv - 1) * 0.0045));
  }

  function getPetSkillPower(lv, pet, plus){
    const base = Number(pet.skillPowerRate || 1);
    const tier = Math.floor(Number(plus || 0) / 10);
    return Math.max(2, 16 * base * (1 + (lv - 1) * 0.023) * (1 + tier * 0.015));
  }

  function getPetSkillCt(lv, pet, plus){
    const base = Number(pet.skillCt || 30) - ((lv - 1) * 0.07);
    const plusBonus = Math.floor(Number(plus || 0) / 5) * 0.1;
    return Math.max(4, base - plusBonus);
  }

  function getPetSecondSkillCt(lv, pet, plus, second){
    const base = Number(second && second.ct || 60) - Math.max(0, lv - 50) * 0.035;
    const plusBonus = Math.floor(Number(plus || 0) / 5) * 0.05;
    return Math.max(18, base - plusBonus);
  }

  function assignPetFormationTargets(){
    const alive = state.pets.filter(p => !p.dead);
    if (!alive.length) return;

    const cols = Math.min(5, Math.ceil(Math.sqrt(alive.length)));
    const spacingX = Math.min(72, W / (cols + 1));
    const spacingY = 54;
    const startY = H * 0.62;

    alive.forEach((p, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const countInRow = Math.min(cols, alive.length - row * cols);
      const rowW = (countInRow - 1) * spacingX;

      p.homeX = W / 2 - rowW / 2 + col * spacingX;
      p.homeY = startY + row * spacingY;
    });
  }

  function layoutEnemies(){
    const all = state.enemies.concat(state.bosses);

    all.forEach((e, i) => {
      if (e.dead) return;

      if (e.type === 'zako') {
        e.baseX = e.baseX || W * (0.25 + i * 0.25);
        e.baseY = e.baseY || H * 0.22;
      } else if (state.bosses.length >= 2) {
        const bossIndex = state.bosses.indexOf(e);
        e.baseX = e.baseX || (bossIndex === 0 ? W * 0.32 : W * 0.68);
        e.baseY = e.baseY || H * 0.18;
      } else {
        e.baseX = e.baseX || W / 2;
        e.baseY = e.baseY || H * 0.18;
      }

      if (!e.targetX) e.targetX = e.baseX;
      if (!e.targetY) e.targetY = e.baseY;
    });
  }

  function spawnContent(){
    const diff = state.difficulty || DIFFICULTIES[0];
    const stage = state.stage || STAGES_NORMAL[0];

    state.enemies.length = 0;
    state.bosses.length = 0;
    state.petBullets.length = 0;
    state.enemyBullets.length = 0;

    if (state.mode.key === 'arena') {
      stage.arenaZako.forEach((src, i) => spawnEnemy(src, 'zako', i, diff));
      spawnEnemy(stage.mid, 'midBoss', 3, diff);
    }

    if (state.mode.key === 'boss') {
      spawnEnemy(stage.boss, 'boss', 0, diff);
    }

    if (state.mode.key === 'ragnarok') {
      spawnEnemy(stage.boss, 'boss', 0, diff);
      spawnEnemy(stage.strongBoss, 'boss', 1, diff);
    }

    layoutEnemies();
  }

  function spawnEnemy(src, type, index, diff){
    const hp = Math.ceil(Number(src.hp || 1000) * Number(diff.hpRate || 1));
    const power = Math.ceil(Number(src.power || 10) * Number(diff.atkRate || 1));

    const enemy = {
      type,
      name:src.name || 'ENEMY',
      image:src.image || '',
      atkImage:src.atkImage || FALLBACK_ASSET.bossBullet,
      pattern:src.pattern || type,
      hp,
      maxHp:hp,
      power,
      x:W / 2,
      y:type === 'zako' ? H * 0.25 : H * 0.18,
      baseX:0,
      baseY:0,
      targetX:W / 2,
      targetY:type === 'zako' ? H * 0.25 : H * 0.18,
      r:type === 'zako' ? 28 : type === 'midBoss' ? 42 : 50,
      moveCd:intRand(40,120),
      shotCd:intRand(80,160),
      shotMax:type === 'zako' ? 150 : type === 'midBoss' ? 115 : 90,
      attackIndex:0,
      dead:false,
      bob:Math.random() * Math.PI * 2
    };

    if (type === 'zako') state.enemies.push(enemy);
    else state.bosses.push(enemy);
  }

  function loop(){
    if (!running) return;
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function update(){
    state.frame++;

    if (state.messageTimer > 0) state.messageTimer--;

    updateTexts();
    updateParticles();
    updateDropCards();
    updateCutins();

    if (state.screen !== 'battle') return;

    updateSupport();
    updatePets();
    updateEnemies();
    updatePetBullets();
    updateEnemyBullets();
    checkBattleEnd();
  }

  function updateSupport(){
    if (state.support.shield > 0) state.support.shield--;

    if (state.frame % 600 === 0) {
      state.support.rapid = 1;
      state.support.power = 1;
    }
  }

  function updatePets(){
    const alive = state.pets.filter(p => !p.dead);
    if (!alive.length) return;

    assignPetFormationTargets();

    alive.forEach(p => {
      p.bob += 0.055;
      p.aiCd--;
      p.dodgeCd = Math.max(0, p.dodgeCd - 1);

      const danger = findNearestDanger(p);
      const dodgeRate = Number(p.petModeDodgeRate || 1);
      const dangerRange = 74 * dodgeRate;

      if (danger && danger.dist < dangerRange && p.dodgeCd <= 0) {
        p.dodgeCd = Math.max(14, Math.floor(34 / dodgeRate));
        const dir = danger.x < p.x ? 1 : -1;
        p.targetX = clamp(p.x + dir * rand(54, 92) * dodgeRate, W * 0.08, W * 0.92);
        p.targetY = clamp(p.y + rand(-22, 28), H * 0.50, H * 0.92);
        p.aiCd = intRand(35, 68);
      } else if (p.aiCd <= 0) {
        const enemy = findEnemyTarget(p);
        const toward = enemy ? clamp(enemy.x - p.homeX, -44, 44) * 0.28 : 0;

        p.laneShift = rand(-34, 34) + toward;
        p.targetX = clamp(p.homeX + p.laneShift, W * 0.08, W * 0.92);
        p.targetY = clamp(p.homeY + rand(-14, 14), H * 0.50, H * 0.93);
        p.aiCd = intRand(70, 145);
      }

      p.x += (p.targetX - p.x) * 0.055;
      p.y += (p.targetY - p.y) * 0.055;
      p.x = clamp(p.x, W * 0.07, W * 0.93);
      p.y = clamp(p.y, H * 0.48, H * 0.94);

      p.shootCd--;

      if (p.shootCd <= 0) {
        p.shootCd = Math.max(8, Math.floor(44 / Math.max(0.15, p.rapid * state.support.rapid)));
        firePetNormal(p);
      }

      p.skillCd--;

      if (p.skillCd <= 0) {
        p.skillCd = p.skillCt;
        usePetSkill(p);
      }

      if (p.secondSkillUnlocked && p.secondSkill) {
        p.secondSkillCd--;

        if (p.secondSkillCd <= 0) {
          p.secondSkillCd = p.secondSkillCt;
          usePetSecondSkill(p);
        }
      }
    });
  }

  function findNearestDanger(p){
    let best = null;
    let bestDist = Infinity;

    state.enemyBullets.forEach(b => {
      if (b.dead) return;
      if (b.vy < -0.1) return;

      const futureX = b.x + b.vx * 12;
      const futureY = b.y + b.vy * 12;
      const d = Math.hypot(futureX - p.x, futureY - p.y);

      if (d < bestDist) {
        bestDist = d;
        best = b;
      }
    });

    return best ? { x:best.x, y:best.y, dist:bestDist } : null;
  }

  function findEnemyTarget(p){
    const aliveEnemies = state.enemies.concat(state.bosses).filter(e => !e.dead);
    if (!aliveEnemies.length) return null;

    let best = null;
    let bestD = Infinity;

    aliveEnemies.forEach(e => {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    });

    return best;
  }

  function getEnemyTargets(){
    return state.enemies.concat(state.bosses).filter(e => !e.dead).sort((a,b) => b.y - a.y);
  }

  function firePetNormal(p){
    const target = findEnemyTarget(p);
    if (!target) return;

    const opts = petBulletOptions(p, 'normal');
    pushPetBullet(p, target, p.power * state.support.power, 'normal', normalBulletRadius(p), 0, opts);
  }

  function usePetSkill(p){
    showCutin(p, false);

    if (p.key === 'mobslime') {
      petHeal(p);
      return;
    }

    if (p.key === 'chibimobtetsu' || p.key === 'mobshield') {
      const sec = p.key === 'mobshield' ? 5 : (p.level >= 50 ? 7 : p.level >= 30 ? 6 : 4);
      state.support.shield = Math.max(state.support.shield, sec * 60);
      addText('ALL SHIELD', p.x, p.y - 32, '#dfe8ff');
    }

    if (p.key === 'wondamob') {
      state.support.rapid = Math.max(state.support.rapid, p.level >= 50 ? 1.42 : p.level >= 30 ? 1.35 : 1.20);
      state.support.power = Math.max(state.support.power, p.level >= 50 ? 1.18 : p.level >= 25 ? 1.12 : 1.05);
      addText('ALL BOOST', p.x, p.y - 32, '#9deeff');
    }

    if (p.key === 'punimobpink') {
      state.support.coin = Math.max(state.support.coin, p.level >= 50 ? 3.0 : p.level >= 30 ? 2.75 : p.level >= 5 ? 2.5 : 2.0);
      addText('COIN UP', p.x, p.y - 32, '#ffe66b');
    }

    const target = findEnemyTarget(p);
    if (!target) return;

    const count = getPetSkillCount(p);
    const damage = p.skillPower * state.support.power;
    const radius = skillBulletRadius(p);
    const opts = petBulletOptions(p, 'skill');

    for (let i = 0; i < count; i++) {
      const offset = skillOffset(p, i, count);
      pushPetBullet(p, target, damage, 'skill', radius, offset, opts);
    }

    addText(p.skillName, p.x, p.y - 35, bulletColor(p));
  }

  function normalBulletRadius(p){
    if (p.key === 'mobstone') return 9;
    if (p.key === 'mobshield') return 10;
    if (p.key === 'mobton') return 8;
    if (p.key === 'mobmany') return 8;
    if (p.key === 'mobflare') return 9;
    return 7;
  }

  function skillBulletRadius(p){
    if (p.key === 'mobstone') return 42;
    if (p.key === 'mobshield') return 26;
    if (p.key === 'mobnero') return 18;
    if (p.key === 'mobton') return 34;
    if (p.key === 'mobmany') return 38;
    if (p.key === 'mobflare') return 18;
    if (p.key === 'babymob') return 8;
    if (p.key === 'chibimaohmob' || p.key === 'hero') return 18;
    if (p.key === 'minidramob') return 20;
    return 12;
  }

  function skillOffset(p, i, count){
    if (p.key === 'mobflare') {
      const lane = i % 3;
      const burst = Math.floor(i / 3);
      return (lane - 1) * 22 + rand(-4, 4) + burst * 2;
    }

    if (p.key === 'babymob') return rand(-58, 58);
    if (p.key === 'mobmany') return (i - (count - 1) / 2) * 20;
    return (i - (count - 1) / 2) * 8;
  }

  function petBulletOptions(p, type){
    return {
      image:type === 'skill' ? (p.skillAtkImage || p.atkImage || '') : (p.atkImage || ''),
      pierce:p.key === 'mobton' || p.key === 'mobflare',
      explode:p.key === 'mobmany',
      wave:p.key === 'mobmany',
      homing:p.key === 'mobnero',
      slow:p.key === 'mobstone',
      rapid:p.key === 'babymob'
    };
  }

  function usePetSecondSkill(p){
    const second = p.secondSkill;
    if (!second) return;

    const targets = getEnemyTargets();

    showCutin(p, true);

    if (second.heal) {
      const heal = Math.ceil(Number(second.heal || 0) * Number(p.petModeSkillRate || 1));
      const alive = state.pets.filter(unit => !unit.dead && unit.hp > 0);

      alive.forEach(unit => {
        unit.hp = Math.min(unit.maxHp, unit.hp + heal);
        addText('HP +' + heal, unit.x, unit.y - 34, '#9dff73');
      });
    }

    if (second.barrierSec) {
      state.support.shield = Math.max(state.support.shield, Number(second.barrierSec || 3) * 60);
      addText('SECOND SHIELD', p.x, p.y - 42, '#dfe8ff');
    }

    if (second.petRapidBuffSec) {
      state.support.rapid = Math.max(state.support.rapid, Number(second.petRapidBuffRate || 1.15));
      addText('SECOND BOOST', p.x, p.y - 42, '#9deeff');
    }

    if (second.coinBonusRate) {
      state.support.coin = Math.max(state.support.coin, 1 + Number(second.coinBonusRate || 0));
      addText('SECOND COIN', p.x, p.y - 42, '#ffe66b');
    }

    if (!targets.length && !second.heal && !second.barrierSec && !second.petRapidBuffSec) return;

    const count = Math.max(1, Number(second.count || 1));
    const pattern = second.pattern || 'homing';

    if (pattern === 'meteor' || pattern === 'rain') fireSecondRain(p, targets, second, count);
    else if (pattern === 'wide' || pattern === 'fan') fireSecondFan(p, targets, second, count);
    else if (pattern === 'circle') fireSecondCircle(p, targets, second, count);
    else if (pattern === 'side') fireSecondSide(p, targets, second, count);
    else if (pattern === 'bigshot' || pattern === 'crush' || pattern === 'laser') fireSecondBig(p, targets, second, count);
    else fireSecondHoming(p, targets, second, count);

    addText(second.name || 'SECOND SKILL', p.x, p.y - 48, bulletColorSecond(p, second));
  }

  function fireSecondRain(p, targets, second, count){
    if (!targets.length) return;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      pushSecondBullet(p, target, second, {
        x:target.x + rand(-90, 90),
        y:Math.min(-40, target.y - rand(160, 300)),
        speed:rand(4.7, 6.2)
      });
    }
  }

  function fireSecondFan(p, targets, second, count){
    if (!targets.length) return;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const offset = (i - (count - 1) / 2) * 22;

      pushSecondBullet(p, target, second, {
        x:p.x + offset,
        y:p.y - 14,
        aimOffsetX:offset * 1.4,
        speed:5.5
      });
    }
  }

  function fireSecondCircle(p, targets, second, count){
    if (!targets.length) return;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const angle = Math.PI * 2 * (i / count);

      pushSecondBullet(p, target, second, {
        x:p.x + Math.cos(angle) * 34,
        y:p.y + Math.sin(angle) * 24,
        speed:5.8
      });
    }
  }

  function fireSecondSide(p, targets, second, count){
    if (!targets.length) return;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const left = i % 2 === 0;

      pushSecondBullet(p, target, second, {
        x:left ? 18 : W - 18,
        y:target.y + rand(-80, 40),
        speed:6.1
      });
    }
  }

  function fireSecondBig(p, targets, second, count){
    if (!targets.length) return;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const offset = (i - (count - 1) / 2) * 38;

      pushSecondBullet(p, target, second, {
        x:p.x + offset,
        y:p.y - 14,
        speed:second.pattern === 'laser' ? 7.0 : 4.2,
        radiusBoost:second.pattern === 'laser' ? 1.75 : 1.35
      });
    }
  }

  function fireSecondHoming(p, targets, second, count){
    if (!targets.length) return;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const offset = (i - (count - 1) / 2) * 18;

      pushSecondBullet(p, target, second, {
        x:p.x + offset,
        y:p.y - 14,
        speed:second.pattern === 'rapid' ? 7.2 : 5.9
      });
    }

    if (second.pattern === 'hero') {
      for (let i = 0; i < 5; i++) {
        const target = targets[i % targets.length];

        pushSecondBullet(p, target, second, {
          x:p.x + rand(-38, 38),
          y:p.y - 14,
          speed:7.0,
          radiusBoost:0.65,
          damageRate:0.55
        });
      }
    }
  }

  function pushSecondBullet(p, target, second, opt){
    if (!target) return;

    opt = opt || {};

    const sx = opt.x != null ? opt.x : p.x;
    const sy = opt.y != null ? opt.y : p.y - 14;
    const tx = target.x + Number(opt.aimOffsetX || 0);
    const ty = target.y;

    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.max(1, Math.hypot(dx, dy));
    const speed = Number(opt.speed || 5.8);

    const damage = getSecondDamage(p, target, second) * Number(opt.damageRate || 1);
    const radius = getSecondRadius(second) * Number(opt.radiusBoost || 1);

    state.petBullets.push({
      x:sx,
      y:sy,
      vx:dx / len * speed,
      vy:dy / len * speed,
      r:radius,
      damage,
      target,
      type:'second',
      image:second.atkImage || p.atkImage || '',
      htmlBullet:second.htmlBullet || p.htmlBullet || '',
      color:bulletColorSecond(p, second),
      drainRate:Number(second.drainRate || 0),
      pierce:!!second.pierce || second.pattern === 'laser' || p.key === 'mobton' || p.key === 'mobflare',
      explode:!!second.explode || p.key === 'mobmany',
      wave:p.key === 'mobmany',
      homing:second.pattern === 'homing',
      dead:false,
      life:155,
      hitIds:new Set()
    });
  }

  function getSecondDamage(p, target, second){
    let rate = Number(second.powerRate || 1);

    if (target && target.type === 'zako') rate = Number(second.powerRate || rate);
    if (target && target.type === 'midBoss') rate = Number(second.bossRate || rate);
    if (target && target.type === 'boss') rate = Number(second.bossRate || rate);

    rate *= 1 + Math.max(0, p.level - 50) * 0.004;
    rate *= 1 + Math.floor(Number(p.plus || 0) / 10) * 0.01;

    return p.skillPower * rate * state.support.power;
  }

  function getSecondRadius(second){
    const size = second.size || 'normal';

    if (size === 'small') return 10;
    if (size === 'normal') return 16;
    if (size === 'big') return 24;
    if (size === 'huge') return 36;

    return 16;
  }

  function getPetSkillCount(p){
    const lv = p.level;
    const tier = Math.floor(Number(p.plus || 0) / 10);
    const key = p.key;
    let count = 1;

    if (key === 'mobdrago') count = lv >= 50 ? 12 : lv >= 30 ? 10 : lv >= 5 ? 6 : 5;
    else if (key === 'mobfrog') count = lv >= 50 ? 6 : lv >= 30 ? 5 : lv >= 5 ? 4 : 3;
    else if (key === 'mobdenden') count = lv >= 50 ? 16 : lv >= 30 ? 14 : lv >= 5 ? 11 : 9;
    else if (key === 'mobwolf') count = lv >= 50 ? 9 : lv >= 30 ? 8 : lv >= 5 ? 6 : 5;
    else if (key === 'mobstone') count = lv >= 50 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'mobslime') count = lv >= 30 ? 5 : 3;
    else if (key === 'mobchibihawk') count = lv >= 50 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'punimobpink') count = lv >= 50 ? 12 : lv >= 30 ? 10 : 6;
    else if (key === 'minimiramob') count = lv >= 50 ? 12 : lv >= 30 ? 10 : lv >= 25 ? 10 : lv >= 5 ? 8 : 6;
    else if (key === 'mobshield') count = lv >= 50 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'neonkidmob') count = lv >= 50 ? 5 : lv >= 30 ? 4 : lv >= 5 ? 4 : 3;
    else if (key === 'minidramob') count = lv >= 50 ? 4 : lv >= 30 ? 3 : lv >= 5 ? 3 : 2;
    else if (key === 'mobnero') count = lv >= 50 ? 10 : lv >= 40 ? 9 : lv >= 30 ? 8 : lv >= 20 ? 7 : lv >= 10 ? 6 : 5;
    else if (key === 'mobton') count = lv >= 50 ? 5 : lv >= 40 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'mobmany') count = lv >= 50 ? 4 : lv >= 40 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'babymob') count = lv >= 50 ? 60 : lv >= 40 ? 45 : lv >= 30 ? 40 : lv >= 20 ? 35 : lv >= 10 ? 30 : 24;
    else if (key === 'merurumob') count = lv >= 50 ? 7 : lv >= 30 ? 6 : lv >= 15 ? 7 : 5;
    else if (key === 'lilmoblilith') count = lv >= 50 ? 16 : lv >= 30 ? 14 : lv >= 25 ? 14 : lv >= 5 ? 11 : 9;
    else if (key === 'chibimaohmob') count = lv >= 50 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'chibimobtetsu') count = lv >= 50 ? 2 : 1;
    else if (key === 'chibimobmelt') count = lv >= 50 ? 4 : lv >= 30 ? 3 : lv >= 5 ? 3 : 2;
    else if (key === 'wondamob') count = lv >= 50 ? 2 : 1;
    else if (key === 'mobflare') count = lv >= 50 ? 27 : lv >= 40 ? 21 : lv >= 30 ? 18 : lv >= 20 ? 15 : lv >= 10 ? 12 : 9;
    else if (key === 'lilmobnep') count = lv >= 50 ? 6 : lv >= 30 ? 5 : lv >= 5 ? 5 : 4;
    else if (key === 'chibiulmob') count = lv >= 50 ? 15 : lv >= 30 ? 13 : lv >= 25 ? 14 : lv >= 5 ? 11 : 9;
    else if (key === 'hero') count = lv >= 50 ? 5 : lv >= 30 ? 4 : lv >= 5 ? 4 : 3;

    count += Math.floor(tier / 5);

    return Math.max(1, count);
  }

  function pushPetBullet(p, target, damage, type, radius, offset, opt){
    opt = opt || {};

    const sx = p.x + Number(offset || 0);
    const sy = p.y - 12;
    const dx = target.x - sx;
    const dy = target.y - sy;
    const len = Math.max(1, Math.hypot(dx, dy));

    let speed = type === 'skill' ? 6.2 : 7.8;

    if (opt.slow) speed = type === 'skill' ? 3.1 : 5.2;
    if (opt.rapid) speed = type === 'skill' ? 8.2 : 7.8;
    if (p.key === 'mobton') speed = type === 'skill' ? 6.9 : 8.2;
    if (p.key === 'mobnero') speed = type === 'skill' ? 6.6 : 7.2;
    if (p.key === 'mobmany') speed = type === 'skill' ? 3.8 : 5.6;
    if (p.key === 'mobflare') speed = type === 'skill' ? 6.7 : 6.5;

    state.petBullets.push({
      x:sx,
      y:sy,
      vx:dx / len * speed,
      vy:dy / len * speed,
      r:radius,
      damage,
      target,
      type,
      image:opt.image != null ? opt.image : (p.atkImage || ''),
      htmlBullet:p.htmlBullet || '',
      color:bulletColor(p),
      dead:false,
      life:type === 'skill' ? 130 : 90,
      pierce:!!opt.pierce,
      explode:!!opt.explode,
      wave:!!opt.wave,
      homing:!!opt.homing,
      phase:Math.random() * Math.PI * 2,
      hitIds:new Set()
    });
  }

  function petHeal(p){
    const alive = state.pets.filter(unit => !unit.dead && unit.hp > 0);
    if (!alive.length) return;

    alive.sort((a,b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));

    const target = alive[0];
    const tier = Math.floor(Number(p.plus || 0) / 10);
    let heal = 15;

    if (p.level >= 5) heal = 20;
    if (p.level >= 30) heal = 45;
    if (p.level >= 50) heal = 60;

    heal += tier * 2;
    heal = Math.ceil(heal * Number(p.petModeSkillRate || 1));

    target.hp = Math.min(target.maxHp, target.hp + heal);
    addText('HP +' + heal, target.x, target.y - 34, '#9dff73');

    if (p.level >= 25 || p.plus >= 30) {
      state.support.shield = Math.max(state.support.shield, 180);
    }
  }

  function updateEnemies(){
    const all = state.enemies.concat(state.bosses);
    layoutEnemies();

    all.forEach((e, index) => {
      if (e.dead) return;

      e.bob += 0.035;
      e.moveCd--;

      if (e.moveCd <= 0) {
        const range = e.type === 'zako' ? 58 : e.type === 'midBoss' ? 92 : 118;
        e.targetX = clamp(e.baseX + rand(-range, range), W * 0.12, W * 0.88);
        e.targetY = clamp(e.baseY + rand(-22, 22), H * 0.10, H * 0.34);
        e.moveCd = intRand(e.type === 'zako' ? 70 : 58, e.type === 'zako' ? 145 : 120);
      }

      e.x += (e.targetX - e.x) * (e.type === 'zako' ? 0.025 : 0.020);
      e.y += (e.targetY + Math.sin(state.frame * 0.025 + e.bob) * (e.type === 'zako' ? 6 : 9) - e.y) * 0.035;

      e.x = clamp(e.x, W * 0.08, W * 0.92);
      e.y = clamp(e.y, H * 0.08, H * 0.36);

      e.shotCd--;

      if (e.shotCd <= 0) {
        e.shotCd = Math.max(38, e.shotMax - (state.difficulty && state.difficulty.legend ? 16 : 0));
        fireEnemy(e, index);
      }
    });
  }

  function fireEnemy(e){
    const alivePets = state.pets.filter(p => !p.dead);
    if (!alivePets.length) return;

    e.attackIndex = Number(e.attackIndex || 0) + 1;
    const n = e.attackIndex;

    if (e.type === 'zako') {
      if (n % 4 === 0) fireEnemySpread(e, 3, 2.3, 12);
      else if (n % 6 === 0) fireEnemyRain(e, 3, 13);
      else fireEnemyAim(e, 1, 2.6, 12);
      return;
    }

    if (e.type === 'midBoss') {
      if (n % 5 === 0) fireEnemyRing(e, 8, 2.4, 15);
      else if (n % 3 === 0) fireEnemyRandom(e, 4, 15);
      else if (n % 2 === 0) fireEnemySpread(e, 5, 2.7, 14);
      else fireEnemyAim(e, 2, 3.0, 14);
      return;
    }

    const pattern = e.pattern || 'boss';

    if (pattern === 'hawk' || pattern === 'hawk2') {
      if (n % 5 === 0) fireEnemyRapid(e, pattern === 'hawk2' ? 10 : 7, 3.5, 11);
      else if (n % 3 === 0) fireEnemyCross(e, 3.1, 14);
      else fireEnemySpread(e, pattern === 'hawk2' ? 7 : 5, 3.0, 13);
      return;
    }

    if (pattern === 'mira' || pattern === 'mira2') {
      if (n % 5 === 0) fireEnemySlow(e, pattern === 'mira2' ? 30 : 24);
      else if (n % 3 === 0) fireEnemyRandom(e, pattern === 'mira2' ? 7 : 5, 15);
      else fireEnemyAim(e, 2, 3.3, 14);
      return;
    }

    if (pattern === 'guardian' || pattern === 'guardian2') {
      if (n % 5 === 0) fireEnemyWall(e, pattern === 'guardian2' ? 7 : 5, 16);
      else if (n % 3 === 0) fireEnemyGiant(e, pattern === 'guardian2' ? 42 : 34, 2.05);
      else fireEnemyFan(e, pattern === 'guardian2' ? 6 : 4, 15);
      return;
    }

    if (pattern === 'neon' || pattern === 'neon2') {
      if (n % 4 === 0) fireEnemyRain(e, pattern === 'neon2' ? 10 : 7, 14);
      else if (n % 3 === 0) fireEnemyRapid(e, pattern === 'neon2' ? 9 : 6, 3.2, 11);
      else fireEnemyRandom(e, pattern === 'neon2' ? 8 : 5, 13);
      return;
    }

    if (pattern === 'dragon' || pattern === 'dragon2') {
      if (n % 5 === 0) fireEnemyGiant(e, pattern === 'dragon2' ? 52 : 42, 2.1);
      else if (n % 3 === 0) fireEnemyCross(e, 3.4, 16);
      else { fireEnemySpread(e, pattern === 'dragon2' ? 8 : 6, 3.1, 15); fireEnemyAim(e, 1, 3.7, 14); }
      return;
    }

    if (pattern === 'lilith') {
      if (n % 5 === 0) fireEnemyRain(e, 10, 13);
      else if (n % 3 === 0) fireEnemyRing(e, 14, 2.45, 13);
      else { fireEnemySpread(e, 8, 2.9, 13); fireEnemyRandom(e, 5, 12); }
      return;
    }

    if (pattern === 'maoh') {
      if (n % 6 === 0) fireEnemyGiant(e, 64, 1.75);
      else if (n % 4 === 0) fireEnemyRing(e, 18, 2.7, 14);
      else { fireEnemySpread(e, 10, 3.2, 15); fireEnemyAim(e, 3, 3.5, 14); }
      return;
    }

    if (pattern === 'nep') {
      if (n % 4 === 0) fireEnemyWave(e, 5, 3.0, 16);
      else fireEnemySpread(e, 7, 2.9, 14);
      return;
    }

    if (pattern === 'smith' || pattern === 'mail') {
      if (n % 4 === 0) fireEnemyWall(e, 7, 16);
      else if (n % 3 === 0) fireEnemyGiant(e, 38, 2.0);
      else fireEnemyAim(e, 2, 3.0, 14);
      return;
    }

    fireEnemyAim(e, 2, 3.0, 14);
  }

  function fireEnemyAim(e, count, speed, radius){
    const alivePets = state.pets.filter(p => !p.dead);
    if (!alivePets.length) return;

    for (let i = 0; i < count; i++) {
      const p = pick(alivePets);
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      pushEnemyBullet(e, dx / len * speed, dy / len * speed, radius || 12);
    }
  }

  function fireEnemySpread(e, count, speed, radius){
    const min = -0.65;
    const max = 0.65;

    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const a = min + (max - min) * t;
      pushEnemyBullet(e, Math.sin(a) * speed, Math.cos(a) * speed, radius || 12);
    }
  }

  function fireEnemyFan(e, count, radius){
    fireEnemySpread(e, count, 2.7, radius || 14);

    setTimeout(function(){
      if (!running || state.screen !== 'battle' || e.dead) return;
      fireEnemySpread(e, count, 3.1, radius || 14);
    }, 280);
  }

  function fireEnemyRandom(e, count, radius){
    for (let i = 0; i < count; i++) {
      const tx = rand(W * 0.10, W * 0.90);
      const ty = rand(H * 0.54, H * 0.93);
      const dx = tx - e.x;
      const dy = ty - e.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const speed = rand(2.4, 3.6);
      pushEnemyBullet(e, dx / len * speed, dy / len * speed, radius || 12);
    }
  }

  function fireEnemySlow(e, radius){
    pushEnemyBullet(e, 0, 1.65, radius || 26, Math.ceil(e.power * 1.45));
  }

  function fireEnemyGiant(e, radius, speed){
    const alivePets = state.pets.filter(p => !p.dead);
    const target = alivePets.length ? pick(alivePets) : { x:W / 2, y:H * 0.75 };
    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const len = Math.max(1, Math.hypot(dx, dy));

    pushEnemyBullet(e, dx / len * Number(speed || 1.9), dy / len * Number(speed || 1.9), radius || 44, Math.ceil(e.power * 1.8));
    addText('GIANT!', e.x, e.y + 52, '#ff5b5b');
  }

  function fireEnemyRing(e, count, speed, radius){
    const total = Math.max(4, Number(count || 8));

    for (let i = 0; i < total; i++) {
      const a = (Math.PI * 2) * (i / total);
      pushEnemyBullet(e, Math.cos(a) * speed, Math.sin(a) * speed, radius || 12);
    }
  }

  function fireEnemyCross(e, speed, radius){
    const dirs = [
      { x:0, y:1 },
      { x:-0.65, y:0.85 },
      { x:0.65, y:0.85 },
      { x:-0.28, y:1 },
      { x:0.28, y:1 }
    ];

    dirs.forEach(d => {
      const len = Math.max(1, Math.hypot(d.x, d.y));
      pushEnemyBullet(e, d.x / len * speed, d.y / len * speed, radius || 14);
    });
  }

  function fireEnemyWall(e, count, radius){
    const total = Math.max(3, Number(count || 4));
    const startX = W * 0.14;
    const endX = W * 0.86;

    for (let i = 0; i < total; i++) {
      const t = total <= 1 ? 0.5 : i / (total - 1);
      const x = startX + (endX - startX) * t;

      state.enemyBullets.push({
        x,
        y:e.y + 34,
        vx:0,
        vy:2.35,
        r:radius || 14,
        power:Number(e.power || 10),
        image:e.atkImage || FALLBACK_ASSET.bossBullet,
        dead:false,
        life:230
      });
    }
  }

  function fireEnemyRain(e, count, radius){
    const total = Math.max(3, Number(count || 5));

    for (let i = 0; i < total; i++) {
      state.enemyBullets.push({
        x:rand(W * 0.10, W * 0.90),
        y:rand(H * 0.05, H * 0.22),
        vx:rand(-0.25, 0.25),
        vy:rand(2.1, 3.3),
        r:radius || 12,
        power:Number(e.power || 10),
        image:e.atkImage || FALLBACK_ASSET.bossBullet,
        dead:false,
        life:240
      });
    }
  }

  function fireEnemyRapid(e, count, speed, radius){
    const total = Math.max(3, Number(count || 6));

    for (let i = 0; i < total; i++) {
      setTimeout(function(){
        if (!running || state.screen !== 'battle' || e.dead) return;
        fireEnemyAim(e, 1, speed || 3.4, radius || 11);
      }, i * 85);
    }
  }

  function fireEnemyWave(e, count, speed, radius){
    const total = Math.max(3, Number(count || 5));

    for (let i = 0; i < total; i++) {
      const offset = (i - (total - 1) / 2) * 34;

      state.enemyBullets.push({
        x:clamp(e.x + offset, W * 0.08, W * 0.92),
        y:e.y + 38,
        vx:Math.sin(i * 0.8) * 0.55,
        vy:speed || 2.8,
        r:radius || 14,
        power:Number(e.power || 10),
        image:e.atkImage || FALLBACK_ASSET.bossBullet,
        dead:false,
        life:230,
        wave:true,
        phase:i
      });
    }
  }

  function pushEnemyBullet(e, vx, vy, r, power){
    state.enemyBullets.push({
      x:e.x,
      y:e.y + 34,
      vx,
      vy,
      r,
      power:Number(power || e.power || 10),
      image:e.atkImage || FALLBACK_ASSET.bossBullet,
      dead:false,
      life:230
    });
  }

  function updatePetBullets(){
    state.petBullets.forEach(b => {
      if (b.dead) return;

      if (b.homing && b.target && !b.target.dead) {
        const dx = b.target.x - b.x;
        const dy = b.target.y - b.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const speed = Math.max(2.5, Math.hypot(b.vx, b.vy));

        b.vx = b.vx * 0.88 + (dx / len * speed) * 0.12;
        b.vy = b.vy * 0.88 + (dy / len * speed) * 0.12;
      }

      if (b.wave) {
        b.phase = Number(b.phase || 0) + 0.12;
        b.x += Math.sin(b.phase) * 1.4;
      }

      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      const target = b.target;

      if (!target || target.dead) {
        if (b.pierce || b.explode) hitNearbyEnemies(b);
        else b.dead = true;

        if (b.life <= 0) b.dead = true;
        return;
      }

      if (Math.hypot(b.x - target.x, b.y - target.y) < b.r + target.r) {
        damageEnemyByBullet(target, b);

        if (b.explode) explodePetBullet(b, target.x, target.y);

        if (b.pierce) {
          b.target = findNextEnemyTarget(b, target);
          b.damage *= 0.82;
          if (!b.target || b.damage < 1) b.dead = true;
        } else {
          b.dead = true;
        }
      }

      if (b.life <= 0 || b.x < -100 || b.x > W + 100 || b.y < -120 || b.y > H + 120) b.dead = true;
    });

    state.petBullets = state.petBullets.filter(b => !b.dead);
  }

  function hitNearbyEnemies(b){
    const all = state.enemies.concat(state.bosses).filter(e => !e.dead);

    all.forEach(e => {
      if (b.dead) return;
      if (Math.hypot(b.x - e.x, b.y - e.y) <= b.r + e.r) {
        damageEnemyByBullet(e, b);
        if (b.explode) explodePetBullet(b, e.x, e.y);
        if (!b.pierce) b.dead = true;
      }
    });
  }

  function damageEnemyByBullet(target, b){
    if (!target || target.dead) return;

    target.hp -= b.damage;
    state.stats.damage += b.damage;

    if (b.drainRate) {
      const heal = Math.max(1, Math.floor(Number(b.damage || 0) * Number(b.drainRate || 0)));
      const alive = state.pets.filter(p => !p.dead && p.hp > 0);
      const self = alive.find(p => Math.hypot(p.x - b.x, p.y - b.y) < 140) || alive[0];

      if (self) {
        self.hp = Math.min(self.maxHp, self.hp + heal);
        addText('HP +' + heal, self.x, self.y - 34, '#9dff73');
      }
    }

    addText('-' + Math.ceil(b.damage), target.x, target.y - 35, b.color);
    burst(target.x, target.y, b.color, b.type === 'second' ? 18 : b.type === 'skill' ? 12 : 5);

    if (target.hp <= 0) killEnemy(target);
  }

  function findNextEnemyTarget(b, oldTarget){
    let best = null;
    let bestD = Infinity;

    state.enemies.concat(state.bosses).forEach(e => {
      if (e.dead || e === oldTarget) return;

      const d = Math.hypot(e.x - b.x, e.y - b.y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    });

    return best;
  }

  function explodePetBullet(b, x, y){
    if (b.__exploded) return;
    b.__exploded = true;

    const radius = b.type === 'second' ? b.r * 3.2 : b.r * 2.6;
    const damage = Number(b.damage || 0) * 0.45;

    addText('BOMB', x, y - 20, b.color);
    burst(x, y, b.color, 22);

    state.enemies.concat(state.bosses).forEach(e => {
      if (e.dead || e === b.target) return;
      if (Math.hypot(x - e.x, y - e.y) <= radius + e.r) {
        damageEnemyByBullet(e, Object.assign({}, b, { damage, explode:false, pierce:false }));
      }
    });
  }

  function killEnemy(e){
    if (!e || e.dead) return;

    e.dead = true;

    if (e.type === 'zako') state.stats.enemyKilled++;
    else state.stats.bossKilled++;

    rollStoneDrop(e);

    addText(e.type === 'zako' ? 'K.O.' : 'BOSS DOWN!', e.x, e.y, '#ffe66b');
    burst(e.x, e.y, '#ffe66b', e.type === 'zako' ? 18 : 36);
  }

  function updateEnemyBullets(){
    state.enemyBullets.forEach(b => {
      if (b.dead) return;

      if (b.wave) {
        b.phase = Number(b.phase || 0) + 0.08;
        b.x += Math.sin(b.phase) * 1.6;
      }

      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      state.pets.forEach(p => {
        if (p.dead || b.dead) return;

        if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.r) {
          let damage = b.power;
          if (state.support.shield > 0) damage = Math.ceil(damage * 0.45);

          p.hp -= damage;
          b.dead = true;

          addText('-' + damage, p.x, p.y - 30, '#ff6b6b');
          burst(p.x, p.y, '#ff6b6b', 8);

          if (p.hp <= 0) killPet(p);
        }
      });

      if (b.life <= 0 || b.x < -100 || b.x > W + 100 || b.y < -100 || b.y > H + 100) b.dead = true;
    });

    state.enemyBullets = state.enemyBullets.filter(b => !b.dead);
  }

  function killPet(p){
    if (!p || p.dead) return;

    p.dead = true;
    p.hp = 0;
    state.stats.petLost++;

    addText('DOWN', p.x, p.y - 28, '#ff6b6b');
    burst(p.x, p.y, '#ff6b6b', 15);
  }

  function checkBattleEnd(){
    const alivePets = state.pets.some(p => !p.dead);

    if (!alivePets) {
      showResult(false, 'ペット全滅');
      return;
    }

    const aliveEnemies = state.enemies.concat(state.bosses).some(e => !e.dead);

    if (!aliveEnemies) {
      showResult(true, 'CLEAR!');
    }
  }

  function rollStoneDrop(enemy){
    const diff = state.difficulty || DIFFICULTIES[0];
    const rate = Number(diff.dropRate || 0);

    if (Math.random() > rate) return;

    let pool = PET_STONES;

    if (diff.key === 'easy') pool = PET_STONES.filter(s => s.rarity === 'SR');
    else if (diff.key === 'hard') pool = PET_STONES.filter(s => s.rarity === 'SR');

    const stone = Object.assign({}, pick(pool.length ? pool : PET_STONES));
    const result = addGachaStone(stone);
    const savedStone = Object.assign({}, stone, result || {});

    state.stats.drops.push(savedStone);

    state.dropCards.push({
      stone:savedStone,
      x:enemy.x,
      y:enemy.y - 38,
      life:130,
      maxLife:130
    });

    addText(`${stone.rarity} ${stone.name}`, enemy.x, enemy.y - 55, '#9dff73');
  }

  function addGachaStone(stone){
    if (window.MobShotGacha && window.MobShotGacha.addStoneByNo) {
      const results = window.MobShotGacha.addStoneByNo(stone.no, 1);
      return Array.isArray(results) && results[0] ? results[0] : null;
    }

    try {
      const raw = localStorage.getItem(GACHA_SAVE_KEY);
      const gachaState = raw ? JSON.parse(raw) : { stones:{}, skills:{} };

      gachaState.stones = gachaState.stones || {};
      gachaState.skills = gachaState.skills || {};

      const key = String(stone.no);
      const max = rarityMax(stone.rarity);
      const current = gachaState.stones[key] || {
        no:stone.no,
        rarity:stone.rarity,
        plus:0,
        owned:false
      };

      const wasOwned = !!current.owned;
      const result = {
        type:'stone',
        no:stone.no,
        name:stone.name,
        image:stone.image,
        rarity:stone.rarity,
        category:stone.category,
        isNew:false,
        converted:false,
        plusAfter:Number(current.plus || 0),
        maxPlus:max
      };

      current.owned = true;
      current.rarity = stone.rarity;

      if (!wasOwned) {
        current.plus = 0;
        result.isNew = true;
        result.plusAfter = 0;
      } else if (Number(current.plus || 0) >= max) {
        result.converted = true;
        result.plusAfter = max;
        addCoin(rarityCoin(stone.rarity));
      } else {
        current.plus = Math.min(max, Number(current.plus || 0) + 1);
        result.plusAfter = current.plus;
      }

      gachaState.stones[key] = current;

      localStorage.setItem(GACHA_SAVE_KEY, JSON.stringify(gachaState));
      window.dispatchEvent(new CustomEvent('mobshot:gachaUpdated'));
      window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));

      return result;
    } catch(e) {
      return null;
    }
  }

  function rarityMax(rarity){
    if (rarity === 'UR') return 10;
    if (rarity === 'SSR') return 30;
    if (rarity === 'SR') return 50;
    return 99;
  }

  function rarityCoin(rarity){
    if (rarity === 'UR') return 10000;
    if (rarity === 'SSR') return 5000;
    if (rarity === 'SR') return 3000;
    return 500;
  }

  function rubyRewardRange(diffKey){
    if (diffKey === 'easy') return [5, 10];
    if (diffKey === 'hard') return [10, 18];
    if (diffKey === 'veryhard') return [18, 30];
    if (diffKey === 'inferno') return [30, 50];
    if (diffKey === 'legend') return [55, 90];
    return [5, 10];
  }

  function calcRubyReward(diff, mode){
    const range = rubyRewardRange(diff.key);
    let ruby = intRand(range[0], range[1]);

    if (mode.key === 'boss') ruby = Math.ceil(ruby * 1.25);
    if (mode.key === 'ragnarok') ruby = Math.ceil(ruby * 1.6);

    return ruby;
  }

  function showResult(clear, reason){
    if (state.resultShown) return;

    state.resultShown = true;
    state.screen = 'result';
    state.stats.clear = !!clear;

    const diff = state.difficulty || DIFFICULTIES[0];

    let rewardCoin = 0;
    let rewardDiamond = 0;
    let rubyReward = 0;

    if (clear) {
      rewardCoin = Math.ceil(diff.rewardCoin * state.support.coin);
      rewardDiamond = diff.rewardDiamond;
      rubyReward = calcRubyReward(diff, state.mode);

      if (state.mode.key === 'boss') rewardCoin = Math.ceil(rewardCoin * 1.4);
      if (state.mode.key === 'ragnarok') rewardCoin = Math.ceil(rewardCoin * 2.0);

      if (!state.rewardDone) {
        state.rewardDone = true;
        addCoin(rewardCoin);
        addDiamond(rewardDiamond);
        addPetRuby(rubyReward);
        saveClear(state.mode.key, diff.key, state.stage.key);
      }
    }

    state.stats.rubyReward = rubyReward;

    const overlay = $('battleOverlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="battle-menu">
        <div class="battle-card">
          <h1 class="battle-title">${clear ? 'CLEAR!' : 'FAILED'}</h1>
          <p class="battle-help">
            ${reason || ''}<br><br>
            モード: ${state.mode.name}<br>
            難易度: ${diff.name}<br>
            ステージ: ${state.stage.name}<br>
            撃破: ${Number(state.stats.enemyKilled || 0)} / BOSS ${Number(state.stats.bossKilled || 0)}<br>
            ペットDOWN: ${Number(state.stats.petLost || 0)}<br>
            合計ダメージ: ${Math.ceil(state.stats.damage || 0).toLocaleString()}<br>
            石板Drop: ${state.stats.drops.length ? state.stats.drops.map(d => `${d.rarity} ${d.name}${d.isNew ? ' NEW' : d.converted ? ' MAX変換' : d.plusAfter != null ? ' +' + d.plusAfter : ''}`).join(' / ') : 'なし'}<br><br>
            ${clear ? `報酬: ${rewardCoin.toLocaleString()} COIN / 💎 +${rewardDiamond} / ペットルビー ♦ +${rubyReward}` : 'クリア報酬なし'}
          </p>

          ${state.stats.drops.length ? `
            <div class="battle-drop-grid">
              ${state.stats.drops.map(d => `
                <div class="battle-drop-card">
                  <img src="${d.image}" alt="${d.name}">
                  <div class="battle-drop-rarity">${d.rarity}</div>
                  <div class="battle-drop-name">${d.name}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <button id="mobRetryBtn" class="battle-btn green" type="button" style="width:100%">もう一度</button>
          <button id="mobBackModeBtn" class="battle-btn" type="button" style="width:100%;margin-top:10px">モード選択へ</button>
          <button id="mobResultMainBtn" class="battle-btn blue" type="button" style="width:100%;margin-top:10px">メインへ戻る</button>
        </div>
      </div>
    `;

    $('mobRetryBtn').onclick = beginGame;
    $('mobBackModeBtn').onclick = function(){ state.screen = 'title'; renderOverlay(); };
    $('mobResultMainBtn').onclick = close;
  }

  function addCoin(amount){
    let save = null;

    if (window.MobShotStorage && window.MobShotStorage.load) {
      save = window.MobShotStorage.load();
      save.coin = Number(save.coin || 0) + Number(amount || 0);
      window.MobShotStorage.save(save);
    } else {
      try { save = JSON.parse(localStorage.getItem('mobshot_split_v1')) || {}; } catch(e) { save = {}; }
      save.coin = Number(save.coin || 0) + Number(amount || 0);
      try { localStorage.setItem('mobshot_split_v1', JSON.stringify(save)); } catch(e) {}
    }

    refreshMainHud();
  }

  function addDiamond(amount){
    let save = null;

    if (window.MobShotStorage && window.MobShotStorage.load) {
      save = window.MobShotStorage.load();
      save.diamond = Number(save.diamond || 0) + Number(amount || 0);
      window.MobShotStorage.save(save);
    } else {
      try { save = JSON.parse(localStorage.getItem('mobshot_split_v1')) || {}; } catch(e) { save = {}; }
      save.diamond = Number(save.diamond || 0) + Number(amount || 0);
      try { localStorage.setItem('mobshot_split_v1', JSON.stringify(save)); } catch(e) {}
    }

    refreshMainHud();
  }

  function addPetRuby(amount){
    if (window.MobShotPets && window.MobShotPets.addRuby) {
      window.MobShotPets.addRuby(amount);
      return;
    }

    let save = null;

    if (window.MobShotStorage && window.MobShotStorage.load) {
      save = window.MobShotStorage.load();
      save.petRuby = Number(save.petRuby || 0) + Number(amount || 0);
      window.MobShotStorage.save(save);
    } else {
      try { save = JSON.parse(localStorage.getItem('mobshot_split_v1')) || {}; } catch(e) { save = {}; }
      save.petRuby = Number(save.petRuby || 0) + Number(amount || 0);
      try { localStorage.setItem('mobshot_split_v1', JSON.stringify(save)); } catch(e) {}
    }

    refreshMainHud();
  }

  function refreshMainHud(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) window.MobShotMain.refreshMainHud();
    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function showMessage(text){
    state.message = text;
    state.messageTimer = 110;
  }

  function addText(text, x, y, color){
    state.texts.push({ text, x, y, color:color || '#fff', life:50 });
  }

  function updateTexts(){
    for (const t of state.texts) {
      t.y -= 0.65;
      t.life--;
    }

    state.texts = state.texts.filter(t => t.life > 0);
  }

  function updateDropCards(){
    for (const card of state.dropCards) {
      card.y -= 0.35;
      card.life--;
    }

    state.dropCards = state.dropCards.filter(card => card.life > 0);
  }

  function updateCutins(){
    for (const c of state.cutins) c.life--;
    state.cutins = state.cutins.filter(c => c.life > 0);
  }

  function showCutin(p, second){
    state.cutins.push({
      name:p.name + (p.plus ? ' +' + p.plus : ''),
      skill:second && p.secondSkill ? p.secondSkill.name : p.skillName,
      image:p.frontImage || p.image,
      second:!!second,
      life:second ? 72 : 52,
      maxLife:second ? 72 : 52
    });
  }

  function burst(x,y,color,n){
    for (let i = 0; i < n; i++) {
      state.particles.push({
        x,y,
        vx:rand(-3,3),
        vy:rand(-3,3),
        color,
        life:intRand(18,34)
      });
    }
  }

  function updateParticles(){
    state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.life--;
    });

    state.particles = state.particles.filter(p => p.life > 0);
  }

  function bulletColor(p){
    const key = p.key || '';

    if (p.htmlBullet === 'fire') return '#ff6530';
    if (p.htmlBullet === 'water') return '#4bd8ff';
    if (p.htmlBullet === 'thunder') return '#ffe84a';
    if (p.htmlBullet === 'gray') return '#d8f1ff';

    if (key === 'mobstone') return '#ff8b3d';
    if (key === 'mobshield') return '#dfe8ff';
    if (key === 'mobnero') return '#65ff9c';
    if (key === 'mobton') return '#55d6ff';
    if (key === 'mobflare') return '#ff533d';
    if (key === 'mobmany') return '#5ffcff';
    if (key === 'babymob') return '#9deeff';

    if (key.includes('riri') || key.includes('lilith') || key.includes('ul') || key === 'merurumob') return '#ff73c9';
    if (key.includes('neon')) return '#5ffcff';
    if (key.includes('maoh')) return '#bd5bff';
    if (key.includes('nep')) return '#55d6ff';
    if (key === 'hero') return '#ffe66b';

    return '#dfe8ff';
  }

  function bulletColorSecond(p, second){
    if (second.htmlBullet === 'fire') return '#ff6530';
    if (second.htmlBullet === 'water') return '#4bd8ff';
    if (second.htmlBullet === 'thunder') return '#ffe84a';
    if (second.htmlBullet === 'gray') return '#d8f1ff';
    return bulletColor(p);
  }

  function draw(){
    if (!ctx) return;

    drawBackground();
    drawHud();
    drawEnemies();
    drawPets();
    drawPetBullets();
    drawEnemyBullets();
    drawParticles();
    drawTexts();
    drawDropCards();
    drawCutins();
    drawMessage();
  }

  function drawBackground(){
    const bg = img((state.stage && state.stage.bg) || FALLBACK_ASSET.bg);

    if (imageReady(bg)) ctx.drawImage(bg, 0, 0, W, H);
    else {
      ctx.fillStyle = '#d89b45';
      ctx.fillRect(0,0,W,H);
    }

    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(0,0,W,H);
  }

  function drawHud(){
    if (state.screen !== 'battle' && state.screen !== 'result') return;

    const diff = state.difficulty || DIFFICULTIES[0];
    const alive = state.pets.filter(p => !p.dead).length;
    const total = state.pets.length;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.58)';
    roundRect(10, 10, W - 20, 62, 18);
    ctx.fill();

    ctx.font = '900 13px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffe66b';
    ctx.fillText(`${state.mode ? state.mode.name : 'PET MODE'} / ${diff.name}`, 22, 32);

    ctx.fillStyle = '#fff';
    ctx.fillText(`${state.stage ? state.stage.name : ''}  PET ${alive}/${total}  撃破 ${state.stats.enemyKilled + state.stats.bossKilled}`, 22, 55);

    if (state.support.shield > 0) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#9deeff';
      ctx.fillText(`SHIELD ${Math.ceil(state.support.shield / 60)}`, W - 22, 32);
    }

    ctx.restore();
  }

  function drawEnemies(){
    state.enemies.concat(state.bosses).forEach(e => {
      if (e.dead) return;

      const image = img(e.image);
      const max = e.type === 'zako' ? 58 : e.type === 'midBoss' ? 86 : 112;

      ctx.save();

      if (!drawImageContain(ctx, image, e.x, e.y, max, max)) {
        ctx.fillStyle = e.type === 'zako' ? '#ff7ab8' : '#bd5bff';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      drawHpBar(e.x - max / 2, e.y - max / 2 - 12, max, 8, e.hp / e.maxHp, '#ff4b4b');

      ctx.font = '900 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(e.name, e.x, e.y + max / 2 + 14);
      ctx.fillText(e.name, e.x, e.y + max / 2 + 14);

      ctx.restore();
    });
  }

  function drawPets(){
    state.pets.forEach(p => {
      if (p.dead) return;

      const image = img(p.image);
      const y = p.y + Math.sin(p.bob) * 2.2;

      ctx.save();

      ctx.fillStyle = 'rgba(0,0,0,.26)';
      ctx.beginPath();
      ctx.ellipse(p.x, y + 20, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!drawImageContain(ctx, image, p.x, y, 42, 42)) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, y, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      drawHpBar(p.x - 22, y + 24, 44, 5, p.hp / p.maxHp, '#9dff73');

      ctx.font = '900 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText('Lv' + p.level + (p.plus ? ' +' + p.plus : ''), p.x, y - 25);
      ctx.fillText('Lv' + p.level + (p.plus ? ' +' + p.plus : ''), p.x, y - 25);

      if (p.secondSkillUnlocked) {
        ctx.fillStyle = '#ffe66b';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.font = '900 10px system-ui';
        ctx.strokeText('Ⅱ', p.x + 19, y - 23);
        ctx.fillText('Ⅱ', p.x + 19, y - 23);
      }

      ctx.restore();
    });

    if (state.support.shield > 0) {
      state.pets.filter(p => !p.dead).forEach(p => {
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.strokeStyle = '#dfe8ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
    }
  }

  function drawPetBullets(){
    state.petBullets.forEach(b => {
      const image = img(b.image);
      const sizeRate = b.type === 'second' ? 4.2 : b.type === 'skill' ? 3.3 : 2.8;

      ctx.save();

      if (!drawImageContain(ctx, image, b.x, b.y, b.r * sizeRate, b.r * sizeRate)) {
        ctx.fillStyle = b.color;
        ctx.strokeStyle = '#111';
        ctx.lineWidth = b.type === 'second' ? 4 : b.type === 'skill' ? 3 : 2;

        if (b.type !== 'normal') {
          ctx.globalAlpha = b.type === 'second' ? 0.24 : 0.30;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r + (b.type === 'second' ? 14 : 8), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        if (b.htmlBullet === 'thunder') {
          ctx.beginPath();
          ctx.moveTo(b.x, b.y - b.r - 7);
          ctx.lineTo(b.x + b.r, b.y - 2);
          ctx.lineTo(b.x + 2, b.y + 3);
          ctx.lineTo(b.x + b.r * 0.7, b.y + b.r + 7);
          ctx.lineTo(b.x - b.r, b.y + 2);
          ctx.lineTo(b.x - 3, b.y - 3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      if (b.explode) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 2.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  function drawEnemyBullets(){
    state.enemyBullets.forEach(b => {
      const image = img(b.image || FALLBACK_ASSET.bossBullet);
      const size = b.r * 3.0;

      ctx.save();

      if (!drawImageContain(ctx, image, b.x, b.y, size, size)) {
        ctx.fillStyle = '#ff5b5b';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = b.r >= 30 ? 4 : 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (b.r >= 30) {
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r + 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });
  }

  function drawParticles(){
    state.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / 34);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawTexts(){
    state.texts.forEach(t => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life / 50);
      ctx.font = '900 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }

  function drawDropCards(){
    state.dropCards.forEach(card => {
      const stone = card.stone;
      const image = img(stone.image);
      const alpha = Math.min(1, card.life / 20);

      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.fillStyle = 'rgba(0,0,0,.72)';
      roundRect(card.x - 46, card.y - 56, 92, 92, 18);
      ctx.fill();

      ctx.strokeStyle = stone.rarity === 'SSR' ? '#ffd83d' : '#58dfff';
      ctx.lineWidth = 3;
      roundRect(card.x - 46, card.y - 56, 92, 92, 18);
      ctx.stroke();

      if (!drawImageContain(ctx, image, card.x, card.y - 18, 48, 48)) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(card.x, card.y - 18, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '900 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe66b';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(stone.rarity, card.x, card.y + 14);
      ctx.fillText(stone.rarity, card.x, card.y + 14);

      ctx.font = '900 8px system-ui';
      ctx.fillStyle = '#fff';
      ctx.strokeText(stone.name, card.x, card.y + 27);
      ctx.fillText(stone.name, card.x, card.y + 27);

      ctx.restore();
    });
  }

  function drawCutins(){
    state.cutins.forEach(c => {
      const rate = c.life / c.maxLife;
      const alpha = Math.min(1, rate < 0.25 ? rate / 0.25 : 1);
      const image = img(c.image);
      const y = c.second ? 102 - (1 - rate) * 18 : 88 - (1 - rate) * 12;

      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.fillStyle = c.second ? 'rgba(35,12,62,.80)' : 'rgba(0,0,0,.64)';
      ctx.fillRect(0, y - 42, W, 84);

      if (imageReady(image)) drawImageContain(ctx, image, 52, y, 72, 72);

      ctx.textAlign = 'left';
      ctx.font = '900 14px system-ui';
      ctx.fillStyle = '#dfe8ff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(c.name, 100, y - 8);
      ctx.fillText(c.name, 100, y - 8);

      ctx.font = c.second ? '1000 24px system-ui' : '1000 22px system-ui';
      ctx.fillStyle = c.second ? '#ffdf35' : '#ffe66b';
      ctx.strokeText((c.second ? 'SECOND ' : '') + c.skill + '!!', 100, y + 24);
      ctx.fillText((c.second ? 'SECOND ' : '') + c.skill + '!!', 100, y + 24);

      ctx.restore();
    });
  }

  function drawMessage(){
    if (state.messageTimer <= 0) return;

    const alpha = Math.min(1, state.messageTimer / 30);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '1000 30px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe66b';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 7;
    ctx.strokeText(state.message, W / 2, H * 0.47);
    ctx.fillText(state.message, W / 2, H * 0.47);
    ctx.restore();
  }

  function drawHpBar(x,y,w,h,rate,color){
    rate = clamp(Number(rate || 0), 0, 1);

    ctx.fillStyle = 'rgba(0,0,0,.65)';
    roundRect(x, y, w, h, 999);
    ctx.fill();

    ctx.fillStyle = color;
    roundRect(x, y, w * rate, h, 999);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,.45)';
    ctx.lineWidth = 1;
    roundRect(x, y, w, h, 999);
    ctx.stroke();
  }

  function roundRect(x,y,w,h,r){
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x,y,w,h,r);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function bindMainButton(){
    const btn = $('openBattleBtn');
    if (!btn) return;

    btn.disabled = false;
    btn.classList.remove('disabled-btn');

    const handler = function(e){
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      }

      open();
      return false;
    };

    btn.onclick = handler;
    btn.onpointerup = handler;
    btn.ontouchend = handler;

    if (!btn.__mobBattleCaptureBound) {
      btn.__mobBattleCaptureBound = true;
      btn.addEventListener('click', handler, true);
      btn.addEventListener('pointerup', handler, { capture:true, passive:false });
      btn.addEventListener('touchend', handler, { capture:true, passive:false });
    }
  }

  window.MobShotBattle = { open, close };

  document.addEventListener('DOMContentLoaded', bindMainButton);
  window.addEventListener('load', bindMainButton);

  setTimeout(bindMainButton, 100);
  setTimeout(bindMainButton, 500);
  setTimeout(bindMainButton, 1000);
  setTimeout(bindMainButton, 1500);

  bindMainButton();
})();
