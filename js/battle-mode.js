'use strict';

(function(){
  const SAVE_KEY = 'mobshot_pet_boss_rush_v1';

  const FALLBACK_ASSET = {
    bg:'sta/backsabaku.png',
    petBullet:'mt/atk.png',
    bossBullet:'atk/hinotama.png'
  };

  const DIFFICULTIES = [
    {
      key:'easy',
      name:'イージー',
      icon:'mt/game1.png',
      hpRate:0.65,
      atkRate:0.60,
      rewardCoin:3000,
      rewardDiamond:1
    },
    {
      key:'hard',
      name:'ハード',
      icon:'mt/game2.png',
      hpRate:1.00,
      atkRate:1.00,
      rewardCoin:6000,
      rewardDiamond:2
    },
    {
      key:'veryhard',
      name:'ベリーハード',
      icon:'mt/game3.png',
      hpRate:1.65,
      atkRate:1.45,
      rewardCoin:12000,
      rewardDiamond:4
    },
    {
      key:'inferno',
      name:'インフェルノ',
      icon:'mt/game4.png',
      hpRate:2.45,
      atkRate:2.10,
      rewardCoin:25000,
      rewardDiamond:8
    },
    {
      key:'legend',
      name:'レジェンド',
      icon:'mt/game5.png',
      hpRate:3.60,
      atkRate:3.00,
      rewardCoin:50000,
      rewardDiamond:15
    }
  ];

  const BOSS_WAVES = [
    {
      title:'TAG BOSS 1',
      bosses:[
        {
          key:'hawk',
          name:'ホークモブ',
          image:'boss/hawks.png',
          atkImage:'atk/hawkatk.png',
          hp:1200,
          power:12,
          moveSpeed:0.020,
          shotCd:92,
          pattern:'spread'
        },
        {
          key:'mira',
          name:'ミラモブ',
          image:'boss/miraboss.png',
          atkImage:'atk/miraatk.png',
          hp:1350,
          power:14,
          moveSpeed:0.018,
          shotCd:105,
          pattern:'aim'
        }
      ]
    },
    {
      title:'TAG BOSS 2',
      bosses:[
        {
          key:'dragoon2',
          name:'ドラゴンモブⅡ',
          image:'boss/bossdragoon2.png',
          atkImage:'atk/dragon.png',
          hp:2100,
          power:22,
          moveSpeed:0.016,
          shotCd:118,
          pattern:'heavy'
        },
        {
          key:'neon2',
          name:'ネオンモブⅡ',
          image:'boss/bossneon2.png',
          atkImage:'atk/kaminari.png',
          hp:1950,
          power:20,
          moveSpeed:0.024,
          shotCd:82,
          pattern:'random'
        }
      ]
    },
    {
      title:'FINAL TAG BOSS',
      bosses:[
        {
          key:'lilith',
          name:'モブリリス',
          image:'boss/bossriris.png',
          atkImage:'atk/atkriri.png',
          hp:2700,
          power:28,
          moveSpeed:0.020,
          shotCd:86,
          pattern:'rose'
        },
        {
          key:'maoh',
          name:'モブ魔王',
          image:'boss/bossmaoh.png',
          atkImage:'atk/atkmaoh.png',
          hp:3300,
          power:34,
          moveSpeed:0.017,
          shotCd:115,
          pattern:'maoh'
        }
      ]
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
    difficulty:null,
    waveIndex:0,
    message:'',
    messageTimer:0,
    resultShown:false,
    rewardDone:false,
    pets:[],
    bosses:[],
    petBullets:[],
    bossBullets:[],
    particles:[],
    texts:[],
    support:{
      rapid:1,
      power:1,
      shield:0,
      coin:1
    },
    stats:{
      damage:0,
      petLost:0,
      bossKilled:0,
      clear:false
    }
  };

  function $(id){
    return document.getElementById(id);
  }

  function rand(a,b){
    return a + Math.random() * (b - a);
  }

  function intRand(a,b){
    return Math.floor(rand(a, b + 1));
  }

  function clamp(v,a,b){
    return Math.max(a, Math.min(b, v));
  }

  function img(src){
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=20260626_pet_boss_rush';
      images.set(src, image);
    }

    return images.get(src);
  }

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
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

    screen.innerHTML = `
      <canvas id="battleCanvas"></canvas>
      <div id="battleOverlay" class="battle-overlay"></div>
    `;

    return screen;
  }

  function injectStyle(){
    if ($('mobBattleStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobBattleStyle';
    style.textContent = `
      #battleScreen{
        position:absolute!important;
        inset:0!important;
        width:100vw!important;
        height:100svh!important;
        overflow:hidden!important;
        background:#07101f!important;
        color:#fff!important;
      }
      #battleScreen.active{display:block!important}
      #battleCanvas{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
        touch-action:none!important;
        z-index:1!important;
      }
      .battle-overlay{
        position:absolute!important;
        inset:0!important;
        z-index:50!important;
        pointer-events:none!important;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
      }
      .battle-menu{
        position:absolute!important;
        inset:0!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:18px!important;
        background:rgba(0,0,0,.62)!important;
        pointer-events:auto!important;
      }
      .battle-card{
        width:min(92vw,460px)!important;
        max-height:88svh!important;
        overflow:auto!important;
        border-radius:28px!important;
        padding:20px!important;
        text-align:center!important;
        background:linear-gradient(180deg,rgba(35,28,78,.98),rgba(5,8,22,.98))!important;
        border:3px solid rgba(255,255,255,.35)!important;
        box-shadow:0 18px 48px rgba(0,0,0,.7)!important;
      }
      .battle-title{
        margin:0 0 10px!important;
        font-size:32px!important;
        font-weight:1000!important;
        color:#ffe66b!important;
        text-shadow:0 5px 0 #000!important;
        line-height:1.05!important;
      }
      .battle-help{
        margin:0 0 16px!important;
        color:#dfe8ff!important;
        font-size:13px!important;
        font-weight:900!important;
        line-height:1.55!important;
      }
      .battle-diff-grid{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:10px!important;
        margin-bottom:12px!important;
      }
      .battle-diff-btn{
        display:grid!important;
        grid-template-columns:58px 1fr 76px!important;
        gap:10px!important;
        align-items:center!important;
        width:100%!important;
        border:2px solid rgba(255,255,255,.26)!important;
        border-radius:18px!important;
        padding:10px!important;
        background:linear-gradient(135deg,rgba(50,68,105,.96),rgba(13,22,40,.96))!important;
        color:#fff!important;
        font-weight:1000!important;
        text-align:left!important;
        box-shadow:0 6px 0 rgba(0,0,0,.28)!important;
      }
      .battle-diff-btn img{
        width:54px!important;
        height:54px!important;
        object-fit:contain!important;
      }
      .battle-diff-name{
        font-size:18px!important;
        color:#ffe66b!important;
      }
      .battle-diff-sub{
        margin-top:3px!important;
        font-size:11px!important;
        color:#dfe8ff!important;
        line-height:1.35!important;
      }
      .battle-diff-reward{
        font-size:11px!important;
        color:#9dff73!important;
        text-align:right!important;
        line-height:1.35!important;
      }
      .battle-btn{
        border:0!important;
        border-radius:999px!important;
        padding:14px 12px!important;
        font-size:18px!important;
        font-weight:1000!important;
        color:#201100!important;
        background:linear-gradient(#ffe66b,#ffb423)!important;
        box-shadow:0 5px 0 rgba(0,0,0,.36)!important;
      }
      .battle-btn.blue{
        color:#fff!important;
        background:linear-gradient(#60d9ff,#1774ee)!important;
      }
      .battle-btn.green{
        color:#07370f!important;
        background:linear-gradient(#9dff73,#26b63e)!important;
      }
      .battle-btn.red{
        color:#fff!important;
        background:linear-gradient(#ff6b6b,#c51d1d)!important;
      }
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

    layoutPets();
    layoutBosses();
  }

  function open(){
    initCanvas();

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    const screen = $('battleScreen');
    if (screen) screen.classList.add('active');

    state.screen = 'title';
    state.frame = 0;
    state.difficulty = null;
    state.waveIndex = 0;
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
            <h1 class="battle-title">PET BOSS RUSH</h1>
            <p class="battle-help">
              所持ペット全員で挑むオートバトル。<br>
              砂漠ステージでタッグボス3連戦。<br>
              雑魚・障害物なし。ペットが全滅したら終了。
            </p>
            <div class="battle-diff-grid">
              ${DIFFICULTIES.map(d => `
                <button class="battle-diff-btn" type="button" data-diff="${d.key}">
                  <img src="${d.icon}" alt="">
                  <div>
                    <div class="battle-diff-name">${d.name}</div>
                    <div class="battle-diff-sub">ボスHP x${d.hpRate} / 攻撃 x${d.atkRate}</div>
                  </div>
                  <div class="battle-diff-reward">
                    ${d.rewardCoin.toLocaleString()} COIN<br>
                    +${d.rewardDiamond} 💎
                  </div>
                </button>
              `).join('')}
            </div>
            <button id="mobBattleMainBtn" class="battle-btn blue" type="button" style="width:100%">メインへ戻る</button>
          </div>
        </div>
      `;

      overlay.querySelectorAll('.battle-diff-btn').forEach(btn => {
        btn.onclick = function(){
          const key = this.getAttribute('data-diff');
          const diff = DIFFICULTIES.find(d => d.key === key);
          if (diff) beginRush(diff);
        };
      });

      $('mobBattleMainBtn').onclick = close;
      return;
    }

    if (state.screen === 'result') return;

    overlay.innerHTML = '';
  }

  function beginRush(diff){
    state.difficulty = diff;
    state.screen = 'rush';
    state.frame = 0;
    state.waveIndex = 0;
    state.resultShown = false;
    state.rewardDone = false;

    state.stats = {
      damage:0,
      petLost:0,
      bossKilled:0,
      clear:false
    };

    clearObjects();
    buildPetUnits();
    resetSupport();

    if (!state.pets.length) {
      showResult(false, '所持ペットがいません');
      return;
    }

    spawnWave(0);
    showMessage(`${diff.name} START!`);
    renderOverlay();
  }

  function clearObjects(){
    state.pets.length = 0;
    state.bosses.length = 0;
    state.petBullets.length = 0;
    state.bossBullets.length = 0;
    state.particles.length = 0;
    state.texts.length = 0;
  }

  function resetSupport(){
    state.support.rapid = 1;
    state.support.power = 1;
    state.support.shield = 0;
    state.support.coin = 1;
  }

  function buildPetUnits(){
    const list = [];

    if (window.MobShotPets && Array.isArray(window.MobShotPets.PET_MASTER)) {
      window.MobShotPets.PET_MASTER.forEach(master => {
        if (!master || !master.implemented) return;

        const owned = window.MobShotPets.isOwned ? window.MobShotPets.isOwned(master.key) : false;
        if (!owned) return;

        const lv = window.MobShotPets.getLevel ? window.MobShotPets.getLevel(master.key) : 1;
        const full = window.MobShotPets.getPet ? window.MobShotPets.getPet(master.key) : master;

        list.push(Object.assign({}, full || master, {
          level:Math.max(1, Math.min(50, Number(lv || 1)))
        }));
      });
    }

    list.forEach((pet, index) => {
      const lv = Math.max(1, Math.min(50, Number(pet.level || 1)));

      state.pets.push({
        key:pet.key,
        name:pet.name || 'PET',
        image:pet.frontImage || pet.backImage || '',
        atkImage:pet.atkImage || '',
        htmlBullet:pet.htmlBullet || '',
        role:pet.role || '',
        level:lv,
        maxHp:getPetMaxHp(lv, pet),
        hp:getPetMaxHp(lv, pet),
        power:getPetPower(lv, pet),
        rapid:getPetRapid(lv, pet),
        skillPower:getPetSkillPower(lv, pet),
        skillName:pet.skillName || 'PET SKILL',
        skillCt:Math.max(240, Math.floor(Number(pet.currentSkillCt || pet.skillCt || 30) * 60)),
        skillCd:Math.max(90, Math.floor(Number(pet.firstCt || 8) * 60) + index * 10),
        shootCd:20 + index % 12,
        x:W / 2,
        y:H * 0.72,
        targetX:W / 2,
        targetY:H * 0.72,
        r:20,
        dead:false,
        bob:Math.random() * Math.PI * 2
      });
    });

    layoutPets();
  }

  function getPetMaxHp(lv, pet){
    let hp = 90 + lv * 14 + Math.floor(lv * lv * 0.22);

    if (pet.role && pet.role.includes('防御')) hp *= 1.25;
    if (pet.key === 'chibimobtetsu') hp *= 1.35;
    if (pet.key === 'hero') hp *= 1.20;
    if (pet.key === 'mobslime') hp *= 0.95;

    return Math.ceil(hp);
  }

  function getPetPower(lv, pet){
    const base = Number(pet.normalAttackRate || 0.5);
    return Math.max(1, 5 * base * (1 + (lv - 1) * 0.025));
  }

  function getPetRapid(lv, pet){
    const base = Number(pet.normalRateRate || 0.5);
    return Math.max(0.35, base * (1 + (lv - 1) * 0.006));
  }

  function getPetSkillPower(lv, pet){
    const base = Number(pet.skillPowerRate || 1);
    return Math.max(2, 16 * base * (1 + (lv - 1) * 0.032));
  }

  function layoutPets(){
    const alive = state.pets.filter(p => !p.dead);
    if (!alive.length) return;

    const cols = Math.min(5, Math.ceil(Math.sqrt(alive.length)));
    const spacingX = Math.min(72, W / (cols + 1));
    const spacingY = 54;
    const startY = H * 0.68;

    alive.forEach((p, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const countInRow = Math.min(cols, alive.length - row * cols);
      const rowW = (countInRow - 1) * spacingX;

      p.targetX = W / 2 - rowW / 2 + col * spacingX;
      p.targetY = startY + row * spacingY;
    });
  }

  function layoutBosses(){
    state.bosses.forEach((b, i) => {
      b.targetX = i === 0 ? W * 0.32 : W * 0.68;
      b.y = b.y || H * 0.20;
    });
  }

  function spawnWave(index){
    state.waveIndex = index;
    state.bosses.length = 0;
    state.bossBullets.length = 0;
    state.petBullets.length = 0;

    const wave = BOSS_WAVES[index];
    const diff = state.difficulty || DIFFICULTIES[0];

    wave.bosses.forEach((src, i) => {
      const hp = Math.ceil(src.hp * diff.hpRate);

      state.bosses.push({
        key:src.key,
        name:src.name,
        image:src.image,
        atkImage:src.atkImage || FALLBACK_ASSET.bossBullet,
        hp,
        maxHp:hp,
        power:Math.ceil(src.power * diff.atkRate),
        x:i === 0 ? W * 0.32 : W * 0.68,
        y:H * 0.19,
        targetX:i === 0 ? W * 0.32 : W * 0.68,
        r:48,
        moveSpeed:src.moveSpeed,
        shotCd:src.shotCd + i * 28,
        shotMax:src.shotCd,
        pattern:src.pattern,
        dead:false,
        bob:Math.random() * Math.PI * 2,
        moveTimer:intRand(40,120)
      });
    });

    showMessage(wave.title);
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

    if (state.screen !== 'rush') return;

    updateSupport();
    updatePets();
    updateBosses();
    updatePetBullets();
    updateBossBullets();
    checkRushEnd();
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

    layoutPets();

    alive.forEach(p => {
      p.x += (p.targetX - p.x) * 0.08;
      p.y += (p.targetY - p.y) * 0.08;
      p.bob += 0.08;

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

  function findBossTarget(p){
    const aliveBosses = state.bosses.filter(b => !b.dead);
    if (!aliveBosses.length) return null;

    let best = null;
    let bestD = Infinity;

    aliveBosses.forEach(b => {
      const d = Math.hypot(b.x - p.x, b.y - p.y);
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    });

    return best;
  }

  function firePetNormal(p){
    const target = findBossTarget(p);
    if (!target) return;

    pushPetBullet(p, target, p.power * state.support.power, 'normal', 7);
  }

  function usePetSkill(p){
    if (p.key === 'mobslime') {
      petHeal(p);
      return;
    }

    if (p.key === 'chibimobtetsu') {
      state.support.shield = Math.max(state.support.shield, (p.level >= 50 ? 7 : p.level >= 30 ? 6 : 4) * 60);
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

    const target = findBossTarget(p);
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
    let count = 1;
    const lv = p.level;
    const key = p.key;

    if (key === 'mobdrago') count = lv >= 50 ? 14 : lv >= 30 ? 12 : lv >= 5 ? 6 : 5;
    else if (key === 'mobfrog') count = lv >= 50 ? 6 : lv >= 30 ? 5 : lv >= 5 ? 4 : 3;
    else if (key === 'mobdenden') count = lv >= 50 ? 18 : lv >= 30 ? 16 : lv >= 5 ? 11 : 9;
    else if (key === 'mobwolf') count = lv >= 50 ? 9 : lv >= 30 ? 8 : lv >= 5 ? 6 : 5;
    else if (key === 'mobchibihawk') count = lv >= 50 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'punimobpink') count = lv >= 50 ? 12 : lv >= 30 ? 10 : 6;
    else if (key === 'minimiramob') count = lv >= 50 ? 12 : lv >= 30 ? 10 : lv >= 25 ? 10 : lv >= 5 ? 8 : 6;
    else if (key === 'neonkidmob') count = lv >= 50 ? 5 : lv >= 30 ? 4 : lv >= 5 ? 4 : 3;
    else if (key === 'minidramob') count = lv >= 50 ? 4 : lv >= 30 ? 3 : lv >= 5 ? 3 : 2;
    else if (key === 'merurumob') count = lv >= 50 ? 7 : lv >= 30 ? 6 : lv >= 15 ? 7 : 5;
    else if (key === 'lilmoblilith') count = lv >= 50 ? 16 : lv >= 30 ? 14 : lv >= 25 ? 14 : lv >= 5 ? 11 : 9;
    else if (key === 'chibimaohmob') count = lv >= 50 ? 3 : lv >= 30 ? 2 : 1;
    else if (key === 'chibimobtetsu') count = lv >= 50 ? 2 : 1;
    else if (key === 'chibimobmelt') count = lv >= 50 ? 4 : lv >= 30 ? 3 : lv >= 5 ? 3 : 2;
    else if (key === 'wondamob') count = lv >= 50 ? 2 : 1;
    else if (key === 'lilmobnep') count = lv >= 50 ? 6 : lv >= 30 ? 5 : lv >= 5 ? 5 : 4;
    else if (key === 'chibiulmob') count = lv >= 50 ? 15 : lv >= 30 ? 13 : lv >= 25 ? 14 : lv >= 5 ? 11 : 9;
    else if (key === 'hero') count = lv >= 50 ? 5 : lv >= 30 ? 4 : lv >= 5 ? 4 : 3;

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
    let heal = 15;

    if (p.level >= 50) heal = 60;
    else if (p.level >= 30) heal = 45;
    else if (p.level >= 5) heal = 20;

    target.hp = Math.min(target.maxHp, target.hp + heal);

    addText('HP +' + heal, target.x, target.y - 34, '#9dff73');

    if (p.level >= 25) {
      state.support.shield = Math.max(state.support.shield, 180);
    }
  }

  function updateBosses(){
    state.bosses.forEach(b => {
      if (b.dead) return;

      b.bob += 0.05;
      b.moveTimer--;

      if (b.moveTimer <= 0) {
        b.targetX = rand(W * 0.20, W * 0.80);
        b.moveTimer = intRand(80, 150);
      }

      b.x += (b.targetX - b.x) * b.moveSpeed;
      b.y = H * 0.18 + Math.sin(b.bob) * 6;

      b.shotCd--;

      if (b.shotCd <= 0) {
        b.shotCd = Math.max(42, b.shotMax - state.waveIndex * 8);
        fireBoss(b);
      }
    });
  }

  function fireBoss(b){
    const alivePets = state.pets.filter(p => !p.dead);
    if (!alivePets.length) return;

    if (b.pattern === 'spread') {
      fireBossSpread(b, 4);
    } else if (b.pattern === 'aim') {
      fireBossAim(b, 2);
    } else if (b.pattern === 'heavy') {
      fireBossSpread(b, 5);
      fireBossAim(b, 1);
    } else if (b.pattern === 'random') {
      fireBossRandom(b, 5);
    } else if (b.pattern === 'rose') {
      fireBossSpread(b, 6);
    } else if (b.pattern === 'maoh') {
      fireBossSpread(b, 7);
      fireBossAim(b, 2);
    } else {
      fireBossAim(b, 1);
    }
  }

  function fireBossAim(b, count){
    const alivePets = state.pets.filter(p => !p.dead);
    if (!alivePets.length) return;

    for (let i = 0; i < count; i++) {
      const p = alivePets[intRand(0, alivePets.length - 1)];
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const len = Math.max(1, Math.hypot(dx, dy));

      state.bossBullets.push({
        x:b.x,
        y:b.y + 34,
        vx:dx / len * 3.2,
        vy:dy / len * 3.2,
        r:13,
        power:b.power,
        image:b.atkImage || FALLBACK_ASSET.bossBullet,
        dead:false,
        life:180
      });
    }
  }

  function fireBossSpread(b, count){
    const total = count || 5;
    const speed = 2.7;
    const min = -0.58;
    const max = 0.58;

    for (let i = 0; i < total; i++) {
      const t = total <= 1 ? 0.5 : i / (total - 1);
      const a = min + (max - min) * t;

      state.bossBullets.push({
        x:b.x,
        y:b.y + 34,
        vx:Math.sin(a) * speed,
        vy:Math.cos(a) * speed,
        r:12,
        power:b.power,
        image:b.atkImage || FALLBACK_ASSET.bossBullet,
        dead:false,
        life:200
      });
    }
  }

  function fireBossRandom(b, count){
    for (let i = 0; i < count; i++) {
      const tx = rand(W * 0.10, W * 0.90);
      const ty = rand(H * 0.58, H * 0.90);
      const dx = tx - b.x;
      const dy = ty - b.y;
      const len = Math.max(1, Math.hypot(dx, dy));

      state.bossBullets.push({
        x:b.x,
        y:b.y + 34,
        vx:dx / len * rand(2.4, 3.6),
        vy:dy / len * rand(2.4, 3.6),
        r:11,
        power:b.power,
        image:b.atkImage || FALLBACK_ASSET.bossBullet,
        dead:false,
        life:190
      });
    }
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

        if (target.hp <= 0) {
          killBoss(target);
        }
      }

      if (b.life <= 0 || b.x < -80 || b.x > W + 80 || b.y < -80 || b.y > H + 80) {
        b.dead = true;
      }
    });

    state.petBullets = state.petBullets.filter(b => !b.dead);
  }

  function killBoss(boss){
    if (!boss || boss.dead) return;

    boss.dead = true;
    state.stats.bossKilled++;

    addText('BOSS DOWN!', boss.x, boss.y, '#ffe66b');
    burst(boss.x, boss.y, '#ffe66b', 36);
  }

  function updateBossBullets(){
    state.bossBullets.forEach(b => {
      if (b.dead) return;

      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      state.pets.forEach(p => {
        if (p.dead || b.dead) return;

        if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.r) {
          let damage = b.power;

          if (state.support.shield > 0) {
            damage = Math.ceil(damage * 0.45);
          }

          p.hp -= damage;
          b.dead = true;

          addText('-' + damage, p.x, p.y - 30, '#ff6b6b');
          burst(p.x, p.y, '#ff6b6b', 8);

          if (p.hp <= 0) {
            killPet(p);
          }
        }
      });

      if (b.life <= 0 || b.x < -80 || b.x > W + 80 || b.y < -80 || b.y > H + 80) {
        b.dead = true;
      }
    });

    state.bossBullets = state.bossBullets.filter(b => !b.dead);
  }

  function killPet(p){
    if (!p || p.dead) return;

    p.dead = true;
    p.hp = 0;
    state.stats.petLost++;

    addText('DOWN', p.x, p.y - 28, '#ff6b6b');
    burst(p.x, p.y, '#ff6b6b', 15);
  }

  function checkRushEnd(){
    const alivePets = state.pets.some(p => !p.dead);
    if (!alivePets) {
      showResult(false, 'ペット全滅');
      return;
    }

    const aliveBosses = state.bosses.some(b => !b.dead);
    if (aliveBosses) return;

    if (state.waveIndex + 1 >= BOSS_WAVES.length) {
      showResult(true, 'COMPLETE!');
      return;
    }

    const next = state.waveIndex + 1;
    state.screen = 'waveWait';

    setTimeout(function(){
      if (!running || state.resultShown) return;
      state.screen = 'rush';
      spawnWave(next);
    }, 1200);
  }

  function showResult(clear, reason){
    if (state.resultShown) return;

    state.resultShown = true;
    state.screen = 'result';
    state.stats.clear = !!clear;

    const diff = state.difficulty || DIFFICULTIES[0];

    let rewardCoin = 0;
    let rewardDiamond = 0;

    if (clear) {
      rewardCoin = Math.ceil(diff.rewardCoin * state.support.coin);
      rewardDiamond = diff.rewardDiamond;

      if (!state.rewardDone) {
        state.rewardDone = true;
        addCoin(rewardCoin);
        addDiamond(rewardDiamond);
        saveBest(diff.key, state.stats);
      }
    }

    const overlay = $('battleOverlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="battle-menu">
        <div class="battle-card">
          <h1 class="battle-title">${clear ? 'PET RUSH CLEAR!' : 'RUSH FAILED'}</h1>
          <p class="battle-help">
            ${reason || ''}<br><br>
            難易度: ${diff.name}<br>
            撃破ボス: ${Number(state.stats.bossKilled || 0)} / 6<br>
            ペットDOWN: ${Number(state.stats.petLost || 0)}<br>
            合計ダメージ: ${Math.ceil(state.stats.damage || 0).toLocaleString()}<br><br>
            ${clear ? `報酬: ${rewardCoin.toLocaleString()} COIN / 💎 +${rewardDiamond}` : 'クリア報酬なし'}
          </p>
          <button id="mobRushRetryBtn" class="battle-btn green" type="button" style="width:100%">もう一度</button>
          <button id="mobRushMainBtn" class="battle-btn blue" type="button" style="width:100%;margin-top:10px">メインへ戻る</button>
        </div>
      </div>
    `;

    $('mobRushRetryBtn').onclick = function(){
      beginRush(diff);
    };

    $('mobRushMainBtn').onclick = close;
  }

  function saveBest(diffKey, stats){
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const save = raw ? JSON.parse(raw) : {};
      const old = save[diffKey] || {};

      const newDamage = Math.ceil(stats.damage || 0);
      const oldDamage = Number(old.damage || 0);

      if (!old.clear || newDamage > oldDamage) {
        save[diffKey] = {
          clear:true,
          damage:newDamage,
          bossKilled:Number(stats.bossKilled || 0),
          petLost:Number(stats.petLost || 0),
          updatedAt:Date.now()
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(save));
      }
    } catch(e) {}
  }

  function addCoin(amount){
    let save = null;

    if (window.MobShotStorage && window.MobShotStorage.load) {
      save = window.MobShotStorage.load();
      save.coin = Number(save.coin || 0) + Number(amount || 0);
      window.MobShotStorage.save(save);
    } else {
      try {
        save = JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};
      } catch(e) {
        save = {};
      }

      save.coin = Number(save.coin || 0) + Number(amount || 0);

      try {
        localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
      } catch(e) {}
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
      try {
        save = JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};
      } catch(e) {
        save = {};
      }

      save.diamond = Number(save.diamond || 0) + Number(amount || 0);

      try {
        localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
      } catch(e) {}
    }

    refreshMainHud();
  }

  function refreshMainHud(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function showMessage(text){
    state.message = text;
    state.messageTimer = 110;
  }

  function addText(text, x, y, color){
    state.texts.push({
      text,
      x,
      y,
      color:color || '#fff',
      life:50
    });
  }

  function updateTexts(){
    state.texts.forEach(t => {
      t.y -= 0.65;
      t.life--;
    });

    state.texts = state.texts.filter(t => t.life > 0);
  }

  function burst(x,y,color,n){
    for (let i = 0; i < n; i++) {
      state.particles.push({
        x,
        y,
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
    drawBosses();
    drawPets();
    drawPetBullets();
    drawBossBullets();
    drawParticles();
    drawTexts();
    drawMessage();
  }

  function drawBackground(){
    const bg = img(FALLBACK_ASSET.bg);

    if (imageReady(bg)) {
      ctx.drawImage(bg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#d89b45';
      ctx.fillRect(0,0,W,H);
    }

    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = 'rgba(255,255,255,.08)';
    for (let y = (state.frame * 1.4) % 90 - 90; y < H; y += 90) {
      ctx.fillRect(W * 0.10, y, W * 0.80, 2);
    }
  }

  function drawHud(){
    if (state.screen !== 'rush' && state.screen !== 'waveWait' && state.screen !== 'result') return;

    const diff = state.difficulty || DIFFICULTIES[0];
    const alive = state.pets.filter(p => !p.dead).length;
    const total = state.pets.length;
    const wave = Math.min(BOSS_WAVES.length, state.waveIndex + 1);

    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,.58)';
    roundRect(10, 10, W - 20, 58, 18);
    ctx.fill();

    ctx.font = '900 13px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffe66b';
    ctx.fillText(`PET BOSS RUSH / ${diff.name}`, 22, 32);

    ctx.fillStyle = '#fff';
    ctx.fillText(`WAVE ${wave}/3  PET ${alive}/${total}  BOSS ${state.stats.bossKilled}/6`, 22, 54);

    if (state.support.shield > 0) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#9deeff';
      ctx.fillText(`SHIELD ${Math.ceil(state.support.shield / 60)}`, W - 22, 32);
    }

    ctx.restore();
  }

  function drawBosses(){
    state.bosses.forEach(b => {
      if (b.dead) return;

      const image = img(b.image);
      const size = 100;

      ctx.save();

      if (imageReady(image)) {
        ctx.drawImage(image, b.x - size / 2, b.y - size / 2, size, size);
      } else {
        ctx.fillStyle = '#bd5bff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      drawHpBar(b.x - 50, b.y - 68, 100, 10, b.hp / b.maxHp, '#ff4b4b');

      ctx.font = '900 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(b.name, b.x, b.y + 65);
      ctx.fillText(b.name, b.x, b.y + 65);

      ctx.restore();
    });
  }

  function drawPets(){
    state.pets.forEach(p => {
      if (p.dead) return;

      const image = img(p.image);
      const y = p.y + Math.sin(p.bob) * 3;
      const size = 42;

      ctx.save();

      ctx.fillStyle = 'rgba(0,0,0,.26)';
      ctx.beginPath();
      ctx.ellipse(p.x, y + 20, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      if (imageReady(image)) {
        ctx.drawImage(image, p.x - size / 2, y - size / 2, size, size);
      } else {
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
      ctx.strokeText('Lv' + p.level, p.x, y - 25);
      ctx.fillText('Lv' + p.level, p.x, y - 25);

      ctx.restore();
    });

    if (state.support.shield > 0) {
      const alive = state.pets.filter(p => !p.dead);
      alive.forEach(p => {
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

      if (imageReady(image)) {
        const size = b.type === 'skill' ? b.r * 3.3 : b.r * 2.8;
        ctx.drawImage(image, b.x - size / 2, b.y - size / 2, size, size);
      } else {
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

  function drawBossBullets(){
    state.bossBullets.forEach(b => {
      const image = img(b.image || FALLBACK_ASSET.bossBullet);
      const size = b.r * 3.1;

      ctx.save();

      if (imageReady(image)) {
        ctx.drawImage(image, b.x - size / 2, b.y - size / 2, size, size);
      } else {
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
