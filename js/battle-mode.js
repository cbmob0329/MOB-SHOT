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
      image.src = src + '?v=20260626_pet_modes_ruby_gacha_link';
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
                  <div><div class="battle-name">${p.name}</div><div class="battle-sub">${p.role || ''} / Lv${p.level} +${p.plus || 0}</div></div>
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
        const full = window.MobShotPets.getPet ? window.MobShotPets.getPet(master.key) : master;
        const cap = window.MobShotPets.levelCapByPlus ? window.MobShotPets.levelCapByPlus(plus) : 50;

        list.push(Object.assign({}, full || master, {
          level:Math.max(1, Math.min(cap, Number(lv || 1))),
          plus:Math.max(0, Math.min(99, Number(plus || 0))),
          levelCap:cap
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
  }

  function clearBattleObjectsOnly(){
    state.enemies.length = 0;
    state.bosses.length = 0;
    state.petBullets.length = 0;
    state.enemyBullets.length = 0;
    state.particles.length = 0;
    state.texts.length = 0;
    state.dropCards.length = 0;
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
      const hp = getPetMaxHp(lv, pet, plus);

      state.pets.push({
        key:pet.key,
        name:pet.name || 'PET',
        image:pet.backImage || pet.frontImage || '',
        atkImage:pet.atkImage || '',
        htmlBullet:pet.htmlBullet || '',
        role:pet.role || '',
        level:lv,
        plus,
        maxHp:hp,
        hp,
        power:getPetPower(lv, pet, plus),
        rapid:getPetRapid(lv, pet),
        skillPower:getPetSkillPower(lv, pet, plus),
        skillName:pet.skillName || 'PET SKILL',
        skillCt:Math.max(180, Math.floor(getPetSkillCt(lv, pet, plus) * 60)),
        skillCd:Math.max(90, Math.floor(Number(pet.firstCt || 8) * 60) + index * 10),
        shootCd:20 + index % 12,
        x:W / 2,
        y:H * 0.72,
        homeX:W / 2,
        homeY:H * 0.72,
        targetX:W / 2,
        targetY:H * 0.72,
        aiCd:intRand(20,90),
        dodgeCd:0,
        laneShift:rand(-22,22),
        r:20,
        dead:false,
        bob:Math.random() * Math.PI * 2
      });
    });

    assignPetFormationTargets();
  }

  function getPetMaxHp(lv, pet, plus){
    let hp = 90 + lv * 14 + Math.floor(lv * lv * 0.22);

    if (pet.role && pet.role.includes('防御')) hp *= 1.25;
    if (pet.key === 'chibimobtetsu') hp *= 1.35;
    if (pet.key === 'hero') hp *= 1.20;
    if (pet.key === 'mobslime') hp *= 0.95;

    hp *= 1 + Number(plus || 0) * 0.001;

    return Math.ceil(hp);
  }

  function getPetPower(lv, pet, plus){
    const base = Number(pet.normalAttackRate || 0.5);
    return Math.max(1, 5 * base * (1 + (lv - 1) * 0.025) * (1 + Number(plus || 0) * 0.001));
  }

  function getPetRapid(lv, pet){
    const base = Number(pet.normalRateRate || 0.5);
    return Math.max(0.35, base * (1 + (lv - 1) * 0.006));
  }

  function getPetSkillPower(lv, pet, plus){
    const base = Number(pet.skillPowerRate || 1);
    const tier = Math.floor(Number(plus || 0) / 10);
    return Math.max(2, 16 * base * (1 + (lv - 1) * 0.032) * (1 + tier * 0.015));
  }

  function getPetSkillCt(lv, pet, plus){
    const base = Number(pet.skillCt || 30) - ((lv - 1) * 0.1);
    const plusBonus = Math.floor(Number(plus || 0) / 5) * 0.1;
    return Math.max(3, base - plusBonus);
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
        e.targetX = W * (0.25 + i * 0.25);
        e.targetY = H * 0.22;
      } else if (state.bosses.length >= 2) {
        const bossIndex = state.bosses.indexOf(e);
        e.targetX = bossIndex === 0 ? W * 0.32 : W * 0.68;
        e.targetY = H * 0.18;
      } else {
        e.targetX = W / 2;
        e.targetY = H * 0.18;
      }
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
      targetX:W / 2,
      targetY:type === 'zako' ? H * 0.25 : H * 0.18,
      r:type === 'zako' ? 28 : type === 'midBoss' ? 42 : 50,
      moveCd:intRand(40,120),
      shotCd:intRand(80,160),
      shotMax:type === 'zako' ? 150 : type === 'midBoss' ? 115 : 90,
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

    alive.forEach((p, index) => {
      p.bob += 0.08;
      p.aiCd--;
      p.dodgeCd = Math.max(0, p.dodgeCd - 1);

      const danger = findNearestDanger(p);

      if (danger && danger.dist < 82) {
        p.dodgeCd = 22;
        const dir = danger.x < p.x ? 1 : -1;
        p.targetX = clamp(p.x + dir * rand(42, 76), W * 0.08, W * 0.92);
        p.targetY = clamp(p.y + rand(-16, 22), H * 0.50, H * 0.92);
      } else if (p.aiCd <= 0) {
        const enemy = findEnemyTarget(p);
        const toward = enemy ? clamp(enemy.x - p.homeX, -36, 36) * 0.35 : 0;

        p.laneShift = rand(-42, 42) + toward;
        p.targetX = clamp(p.homeX + p.laneShift, W * 0.08, W * 0.92);
        p.targetY = clamp(p.homeY + rand(-16, 18), H * 0.50, H * 0.93);
        p.aiCd = intRand(38, 95);
      }

      if (p.dodgeCd <= 0) p.targetX += Math.sin(state.frame * 0.025 + index) * 0.9;

      p.x += (p.targetX - p.x) * 0.075;
      p.y += (p.targetY - p.y) * 0.075;
      p.x = clamp(p.x, W * 0.07, W * 0.93);
      p.y = clamp(p.y, H * 0.48, H * 0.94);

      p.shootCd--;
      if (p.shootCd <= 0) {
        p.shootCd = Math.max(10, Math.floor(44 / Math.max(0.15, p.rapid * state.support.rapid)));
        firePetNormal(p);
      }

      p.skillCd--;
      if (p.skillCd <= 0) {
        p.skillCd = p.skillCt;
        usePetSkill(p);
      }
    });
  }

  function findNearestDanger(p){
    let best = null;
    let bestDist = Infinity;

    state.enemyBullets.forEach(b => {
      if (b.dead) return;
      const d = Math.hypot(b.x - p.x, b.y - p.y);
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

  function firePetNormal(p){
    const target = findEnemyTarget(p);
    if (!target) return;
    pushPetBullet(p, target, p.power * state.support.power, 'normal', 7);
  }

  function usePetSkill(p){
    if (p.key === 'mobslime') {
      petHeal(p);
      return;
    }

    if (p.key === 'chibimobtetsu') {
      state.support.shield = Math.max(state.support.shield, (p.level >= 100 ? 8 : p.level >= 50 ? 7 : p.level >= 30 ? 6 : 4) * 60);
      addText('ALL SHIELD', p.x, p.y - 32, '#dfe8ff');
    }

    if (p.key === 'wondamob') {
      state.support.rapid = Math.max(state.support.rapid, p.level >= 100 ? 1.5 : p.level >= 50 ? 1.42 : p.level >= 30 ? 1.35 : 1.20);
      state.support.power = Math.max(state.support.power, p.level >= 100 ? 1.25 : p.level >= 50 ? 1.18 : p.level >= 25 ? 1.12 : 1.05);
      addText('ALL BOOST', p.x, p.y - 32, '#9deeff');
    }

    if (p.key === 'punimobpink') {
      state.support.coin = Math.max(state.support.coin, p.level >= 100 ? 3.35 : p.level >= 50 ? 3.0 : p.level >= 30 ? 2.75 : p.level >= 5 ? 2.5 : 2.0);
      addText('COIN UP', p.x, p.y - 32, '#ffe66b');
    }

    const target = findEnemyTarget(p);
    if (!target) return;

    const count = getPetSkillCount(p);
    const damage = p.skillPower * state.support.power;
    const radius = p.key === 'chibimaohmob' || p.key === 'hero' ? 18 : 12;

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 8;
      pushPetBullet(p, target, damage, 'skill', radius, offset);
    }

    addText(p.skillName, p.x, p.y - 35, bulletColor(p));
  }

  function getPetSkillCount(p){
    const lv = p.level;
    const tier = Math.floor(Number(p.plus || 0) / 10);
    const key = p.key;
    let count = 1;

    if (key === 'mobdrago') count = lv >= 100 ? 16 : lv >= 50 ? 14 : lv >= 30 ? 12 : lv >= 5 ? 6 : 5;
    else if (key === 'mobfrog') count = lv >= 100 ? 7 : lv >= 50 ? 6 : lv >= 30 ? 5 : lv >= 5 ? 4 : 3;
    else if (key === 'mobdenden') count = lv >= 100 ? 20 : lv >= 50 ? 18 : lv >= 30 ? 16 : lv >= 5 ? 11 : 9;
    else if (key === 'mobwolf') count = lv >= 100 ? 10 : lv >= 50 ? 9 : lv >= 30 ? 8 : lv >= 5 ? 6 : 5;
    else if (key === 'mobslime') count = lv >= 100 ? 6 : lv >= 30 ? 5 : 3;
    else if (key === 'mobchibihawk') count = lv >= 100 ? 4 : lv >= 50 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'punimobpink') count = lv >= 100 ? 14 : lv >= 50 ? 12 : lv >= 30 ? 10 : 6;
    else if (key === 'minimiramob') count = lv >= 100 ? 14 : lv >= 50 ? 12 : lv >= 30 ? 10 : lv >= 25 ? 10 : lv >= 5 ? 8 : 6;
    else if (key === 'neonkidmob') count = lv >= 100 ? 6 : lv >= 50 ? 5 : lv >= 30 ? 4 : lv >= 5 ? 4 : 3;
    else if (key === 'minidramob') count = lv >= 100 ? 5 : lv >= 50 ? 4 : lv >= 30 ? 3 : lv >= 5 ? 3 : 2;
    else if (key === 'merurumob') count = lv >= 100 ? 8 : lv >= 50 ? 7 : lv >= 30 ? 6 : lv >= 15 ? 7 : 5;
    else if (key === 'lilmoblilith') count = lv >= 100 ? 18 : lv >= 50 ? 16 : lv >= 30 ? 14 : lv >= 25 ? 14 : lv >= 5 ? 11 : 9;
    else if (key === 'chibimaohmob') count = lv >= 100 ? 4 : lv >= 50 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'chibimobtetsu') count = lv >= 100 ? 3 : lv >= 50 ? 2 : 1;
    else if (key === 'chibimobmelt') count = lv >= 100 ? 5 : lv >= 50 ? 4 : lv >= 30 ? 3 : lv >= 5 ? 3 : 2;
    else if (key === 'wondamob') count = lv >= 100 ? 3 : lv >= 50 ? 2 : 1;
    else if (key === 'lilmobnep') count = lv >= 100 ? 7 : lv >= 50 ? 6 : lv >= 30 ? 5 : lv >= 5 ? 5 : 4;
    else if (key === 'chibiulmob') count = lv >= 100 ? 17 : lv >= 50 ? 15 : lv >= 30 ? 13 : lv >= 25 ? 14 : lv >= 5 ? 11 : 9;
    else if (key === 'hero') count = lv >= 100 ? 6 : lv >= 50 ? 5 : lv >= 30 ? 4 : lv >= 5 ? 4 : 3;

    count += Math.floor(tier / 5);

    return Math.max(1, count);
  }

  function pushPetBullet(p, target, damage, type, radius, offset){
    const sx = p.x + Number(offset || 0);
    const sy = p.y - 12;
    const dx = target.x - sx;
    const dy = target.y - sy;
    const len = Math.max(1, Math.hypot(dx, dy));
    const speed = type === 'skill' ? 6.2 : 7.8;

    state.petBullets.push({
      x:sx,
      y:sy,
      vx:dx / len * speed,
      vy:dy / len * speed,
      r:radius,
      damage,
      target,
      type,
      image:p.atkImage || '',
      color:bulletColor(p),
      dead:false,
      life:type === 'skill' ? 130 : 90
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
    if (p.level >= 100) heal = 85;

    heal += tier * 2;

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

      e.bob += 0.04;
      e.moveCd--;

      if (e.moveCd <= 0) {
        const range = e.type === 'zako' ? 42 : 78;
        e.targetX = clamp(e.targetX + rand(-range, range), W * 0.12, W * 0.88);
        e.moveCd = intRand(70, 150);
      }

      e.x += (e.targetX - e.x) * (e.type === 'zako' ? 0.025 : 0.018);
      e.y += (e.targetY + Math.sin(e.bob) * 5 - e.y) * 0.04;

      e.shotCd--;

      if (e.shotCd <= 0) {
        e.shotCd = Math.max(42, e.shotMax - (state.difficulty && state.difficulty.legend ? 16 : 0));
        fireEnemy(e, index);
      }
    });
  }

  function fireEnemy(e, index){
    const alivePets = state.pets.filter(p => !p.dead);
    if (!alivePets.length) return;

    if (e.type === 'zako') {
      fireEnemyAim(e, 1, 2.5);
      return;
    }

    const pattern = e.pattern || 'boss';

    if (pattern === 'hawk' || pattern === 'hawk2') fireEnemySpread(e, pattern === 'hawk2' ? 5 : 4, 2.8);
    else if (pattern === 'mira' || pattern === 'mira2') { fireEnemyAim(e, 2, 3.2); fireEnemySlow(e); }
    else if (pattern === 'guardian' || pattern === 'guardian2') fireEnemyFan(e, pattern === 'guardian2' ? 5 : 3);
    else if (pattern === 'neon' || pattern === 'neon2') fireEnemyRandom(e, pattern === 'neon2' ? 6 : 4);
    else if (pattern === 'dragon' || pattern === 'dragon2') { fireEnemySpread(e, pattern === 'dragon2' ? 6 : 4, 3.0); fireEnemyAim(e, 1, 3.5); }
    else if (pattern === 'lilith') { fireEnemySpread(e, 5, 2.9); fireEnemyRandom(e, 3); }
    else if (pattern === 'maoh') { fireEnemySpread(e, 7, 3.1); fireEnemyAim(e, 2, 3.4); }
    else if (pattern === 'mid') { fireEnemySpread(e, 3, 2.7); fireEnemyAim(e, 1, 2.8); }
    else fireEnemyAim(e, 1, 3.0);
  }

  function fireEnemyAim(e, count, speed){
    const alivePets = state.pets.filter(p => !p.dead);
    if (!alivePets.length) return;

    for (let i = 0; i < count; i++) {
      const p = pick(alivePets);
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      pushEnemyBullet(e, dx / len * speed, dy / len * speed, 12);
    }
  }

  function fireEnemySpread(e, count, speed){
    const min = -0.60;
    const max = 0.60;

    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const a = min + (max - min) * t;
      pushEnemyBullet(e, Math.sin(a) * speed, Math.cos(a) * speed, 12);
    }
  }

  function fireEnemyFan(e, count){
    fireEnemySpread(e, count, 2.7);
    setTimeout(function(){
      if (!running || state.screen !== 'battle' || e.dead) return;
      fireEnemySpread(e, count, 3.1);
    }, 280);
  }

  function fireEnemyRandom(e, count){
    for (let i = 0; i < count; i++) {
      const tx = rand(W * 0.10, W * 0.90);
      const ty = rand(H * 0.54, H * 0.93);
      const dx = tx - e.x;
      const dy = ty - e.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const speed = rand(2.4, 3.6);
      pushEnemyBullet(e, dx / len * speed, dy / len * speed, 11);
    }
  }

  function fireEnemySlow(e){
    pushEnemyBullet(e, 0, 1.8, 20, Math.ceil(e.power * 1.35));
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
      life:210
    });
  }

  function updatePetBullets(){
    state.petBullets.forEach(b => {
      if (b.dead) return;

      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      const target = b.target;

      if (!target || target.dead) {
        b.dead = true;
        return;
      }

      if (Math.hypot(b.x - target.x, b.y - target.y) < b.r + target.r) {
        target.hp -= b.damage;
        state.stats.damage += b.damage;
        b.dead = true;

        addText('-' + Math.ceil(b.damage), target.x, target.y - 35, b.color);
        burst(target.x, target.y, b.color, b.type === 'skill' ? 12 : 5);

        if (target.hp <= 0) killEnemy(target);
      }

      if (b.life <= 0 || b.x < -80 || b.x > W + 80 || b.y < -80 || b.y > H + 80) b.dead = true;
    });

    state.petBullets = state.petBullets.filter(b => !b.dead);
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

      if (b.life <= 0 || b.x < -80 || b.x > W + 80 || b.y < -80 || b.y > H + 80) b.dead = true;
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

    if (diff.key === 'easy') {
      pool = PET_STONES.filter(s => s.rarity === 'SR');
    } else if (diff.key === 'hard') {
      pool = PET_STONES.filter(s => s.rarity === 'SR');
    } else if (diff.key === 'veryhard') {
      pool = PET_STONES;
    } else if (diff.key === 'inferno') {
      pool = PET_STONES;
    } else if (diff.key === 'legend') {
      pool = PET_STONES;
    }

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
      const state = raw ? JSON.parse(raw) : { stones:{}, skills:{} };

      state.stones = state.stones || {};
      state.skills = state.skills || {};

      const key = String(stone.no);
      const max = rarityMax(stone.rarity);
      const current = state.stones[key] || {
        no:stone.no,
        rarity:stone.rarity,
        plus:0,
        owned:false
      };

      const wasOwned = !!current.owned;
      let result = {
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

      state.stones[key] = current;

      localStorage.setItem(GACHA_SAVE_KEY, JSON.stringify(state));
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
    if (key.includes('riri') || key.includes('lilith') || key.includes('ul') || key === 'merurumob') return '#ff73c9';
    if (key.includes('neon')) return '#5ffcff';
    if (key.includes('maoh')) return '#bd5bff';
    if (key.includes('nep')) return '#55d6ff';
    if (key === 'hero') return '#ffe66b';
    return '#dfe8ff';
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
      const y = p.y + Math.sin(p.bob) * 3;

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

      ctx.save();

      if (!drawImageContain(ctx, image, b.x, b.y, b.type === 'skill' ? b.r * 3.3 : b.r * 2.8, b.type === 'skill' ? b.r * 3.3 : b.r * 2.8)) {
        ctx.fillStyle = b.color;
        ctx.strokeStyle = '#111';
        ctx.lineWidth = b.type === 'skill' ? 3 : 2;

        if (b.type === 'skill') {
          ctx.globalAlpha = 0.30;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r + 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  function drawEnemyBullets(){
    state.enemyBullets.forEach(b => {
      const image = img(b.image || FALLBACK_ASSET.bossBullet);
      const size = b.r * 3.1;

      ctx.save();

      if (!drawImageContain(ctx, image, b.x, b.y, size, size)) {
        ctx.fillStyle = '#ff5b5b';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
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

  window.MobShotBattle = {
    open,
    close
  };

  document.addEventListener('DOMContentLoaded', bindMainButton);
  window.addEventListener('load', bindMainButton);

  setTimeout(bindMainButton, 100);
  setTimeout(bindMainButton, 500);
  setTimeout(bindMainButton, 1000);
  setTimeout(bindMainButton, 1500);

  bindMainButton();
})();
