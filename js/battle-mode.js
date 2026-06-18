'use strict';

(function(){
  const BATTLE_REWARD_COIN = 1000;
  const WIN_NEED = 3;
  const COOP_CLEAR_REWARD_COIN = 5000;

  const FALLBACK_ASSET = {
    bg:'sta/backsougen.png',
    bullet:'mt/atk.png',
    bossBullet:'atk/hinotama.png',
    heavyAttack:'atk/hinotama.png',
    chest:'gimi/takagin.png',
    obstacle:'gimi/gimihako.png'
  };

  const COOP_AREAS = ['grass','desert','town','neon','magma','castle'];

  let canvas = null;
  let ctx = null;
  let W = 0;
  let H = 0;
  let DPR = 1;
  let raf = 0;
  let running = false;
  let mode = 'cpu';
  let boundCanvas = false;

  const images = new Map();

  const state = {
    screen:'title',
    frame:0,
    round:1,
    p1Wins:0,
    p2Wins:0,
    message:'',
    messageTimer:0,
    rewardDone:false,
    selected:{ p1:null, p2:null },
    selectSide:'p1',
    choices:[],
    entities:[],
    bullets:[],
    particles:[],
    enemies:[],
    bosses:[],
    players:[makePlayer(1), makePlayer(2)],
    spawnCd:90,
    coopCountdownStart:0,
    coopCountdownStarted:false,
    coopAreaIndex:0,
    coopBoss:null,
    coopScore:0,
    coopKills:0,
    coopBossKills:0,
    coopClear:false,
    coopResultShown:false,
    coopBarrierTimer:0,
    coopWideTimer:0
  };

  function $(id){ return document.getElementById(id); }

  function img(src){
    if (!src) return null;
    if (!images.has(src)) {
      const image = new Image();
      image.src = src;
      images.set(src, image);
    }
    return images.get(src);
  }

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0;
  }

  function makePlayer(id){
    return {
      id,
      name:id === 1 ? '1P' : '2P',
      image:'play/playpink.png',
      x:0,
      y:0,
      targetX:0,
      hp:100,
      maxHp:100,
      power:1,
      rapid:1,
      wide:1,
      shootCd:0,
      alive:true,
      down:false,
      reviveTimer:0,
      invincibleTimer:0,
      input:false
    };
  }

  function rand(a,b){ return a + Math.random() * (b - a); }
  function intRand(a,b){ return Math.floor(rand(a, b + 1)); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  function getCurrentStageInfo(){
    if (window.MobShotStorage && window.MobShotStorage.getCurrentStage) return window.MobShotStorage.getCurrentStage();
    if (window.MOBSHOT_DATA && window.MOBSHOT_DATA.stage) return window.MOBSHOT_DATA.stage;
    return { areaKey:'grass', background:FALLBACK_ASSET.bg };
  }

  function getAreaDataByKey(key){
    if (window.MOBSHOT_STAGE_DATA && window.MOBSHOT_STAGE_DATA[key]) return window.MOBSHOT_STAGE_DATA[key];
    if (window.MOBSHOT_STAGE_DATA && window.MOBSHOT_STAGE_DATA.grass) return window.MOBSHOT_STAGE_DATA.grass;
    return null;
  }

  function getCurrentAreaData(){
    const info = getCurrentStageInfo();
    return getAreaDataByKey(info.areaKey || 'grass');
  }

  function getBattleBackground(){
    if (mode === 'coop') {
      const area = getAreaDataByKey(COOP_AREAS[state.coopAreaIndex] || 'grass');
      return (area && area.background) || FALLBACK_ASSET.bg;
    }

    const info = getCurrentStageInfo();
    const area = getCurrentAreaData();

    return (
      info.background ||
      (window.MOBSHOT_DATA && window.MOBSHOT_DATA.stage && window.MOBSHOT_DATA.stage.background) ||
      (area && area.background) ||
      FALLBACK_ASSET.bg
    );
  }

  function getBattleChests(){
    if (window.MOBSHOT_DATA && Array.isArray(window.MOBSHOT_DATA.chests) && window.MOBSHOT_DATA.chests.length) {
      return window.MOBSHOT_DATA.chests;
    }

    return [
      { name:'銀の宝箱', image:'gimi/takagin.png', hp:10, score:80 },
      { name:'金の宝箱', image:'gimi/takagol.png', hp:18, score:160 }
    ];
  }

  function getBattleGimmicks(){
    if (window.MOBSHOT_DATA && Array.isArray(window.MOBSHOT_DATA.gimmicks) && window.MOBSHOT_DATA.gimmicks.length) {
      return window.MOBSHOT_DATA.gimmicks;
    }

    const area = mode === 'coop'
      ? getAreaDataByKey(COOP_AREAS[state.coopAreaIndex] || 'grass')
      : getCurrentAreaData();

    if (area && Array.isArray(area.gimmicks) && area.gimmicks.length) return area.gimmicks;

    return [
      { name:'木箱', image:'gimi/gimihako.png', hp:5, score:10 },
      { name:'丸岩', image:'gimi/gimiiwa.png', hp:12, score:20 }
    ];
  }

  function getCoopZako(){
    const area = getAreaDataByKey(COOP_AREAS[state.coopAreaIndex] || 'grass');
    return area && Array.isArray(area.zako) ? area.zako : [];
  }

  function getCoopBossSource(){
    const area = getAreaDataByKey(COOP_AREAS[state.coopAreaIndex] || 'grass');
    if (!area) return null;
    return area.strongBoss || area.boss || null;
  }

  function pickFrom(list){
    if (!Array.isArray(list) || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
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
      #battleScreen{position:absolute!important;inset:0!important;overflow:hidden!important;background:#07101f!important;width:100vw!important;height:100svh!important}
      #battleScreen.active{display:block!important}
      #battleCanvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;background:#3daf55!important;touch-action:none!important;z-index:1!important}
      .battle-overlay{position:absolute!important;inset:0!important;z-index:50!important;pointer-events:none!important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
      .battle-menu{position:absolute!important;inset:0!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;background:rgba(0,0,0,.58)!important;pointer-events:auto!important}
      .battle-card{width:min(92vw,440px)!important;max-height:88svh!important;overflow:auto!important;border-radius:28px!important;padding:20px!important;text-align:center!important;background:linear-gradient(180deg,rgba(35,28,78,.98),rgba(5,8,22,.98))!important;border:3px solid rgba(255,255,255,.35)!important;box-shadow:0 18px 48px rgba(0,0,0,.7)!important}
      .battle-title{margin:0 0 14px!important;font-size:34px!important;font-weight:1000!important;color:#ffe66b!important;text-shadow:0 5px 0 #000!important}
      .battle-help{margin:0 0 16px!important;color:#dfe8ff!important;font-size:13px!important;font-weight:900!important;line-height:1.55!important}
      .battle-actions,.battle-small{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}
      .battle-actions.three{grid-template-columns:1fr 1fr 1fr!important}
      .battle-btn{border:0!important;border-radius:999px!important;padding:14px 12px!important;font-size:18px!important;font-weight:1000!important;color:#201100!important;background:linear-gradient(#ffe66b,#ffb423)!important;box-shadow:0 5px 0 rgba(0,0,0,.36)!important}
      .battle-btn.blue{color:#fff!important;background:linear-gradient(#60d9ff,#1774ee)!important}
      .battle-btn.green{color:#07370f!important;background:linear-gradient(#9dff73,#26b63e)!important}
      .battle-select-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:10px!important;max-height:48svh!important;overflow:auto!important;padding:2px!important;margin-bottom:14px!important}
      .battle-choice{border:2px solid rgba(255,255,255,.26)!important;border-radius:18px!important;padding:8px 5px!important;background:rgba(255,255,255,.10)!important;color:#fff!important;font-weight:1000!important;font-size:11px!important}
      .battle-choice img{width:64px!important;height:64px!important;object-fit:contain!important;display:block!important;margin:0 auto 4px!important}
      #battleTitleLayer,#battleSelectLayer,#battleHud,#battleBanner{display:none!important}
      @media (max-width:430px){.battle-actions.three{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
  }

  function initCanvas(){
    ensureScreen();
    injectStyle();

    canvas = $('battleCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    boundCanvas = false;

    resize();

    window.removeEventListener('resize', resize);
    window.addEventListener('resize', resize);

    if (!boundCanvas) {
      boundCanvas = true;

      canvas.addEventListener('pointerdown', onPointer, { passive:false });
      canvas.addEventListener('pointermove', onPointer, { passive:false });
      canvas.addEventListener('pointerup', function(){
        state.players.forEach(p => p.input = false);
      }, { passive:false });
    }
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

    resetPlayerPositions();
  }

  function resetPlayerPositions(){
    const p1 = state.players[0];
    const p2 = state.players[1];

    if (mode === 'coop') {
      p1.x = W * 0.25;
      p2.x = W * 0.75;
      p1.targetX = W * 0.25;
      p2.targetX = W * 0.75;
      p1.y = H * 0.82;
      p2.y = H * 0.82;
      return;
    }

    p1.x = p1.x || W / 2;
    p2.x = p2.x || W / 2;
    p1.targetX = p1.targetX || W / 2;
    p2.targetX = p2.targetX || W / 2;
    p1.y = H * 0.22;
    p2.y = H * 0.78;
  }

  function onPointer(e){
    if (!running) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const x = e.clientX - rect.left;

    if (mode === 'coop' && state.screen === 'coop') {
      if (x < W / 2) {
        const p1 = state.players[0];
        if (!p1.down) {
          p1.targetX = clamp(x, W * 0.08, W * 0.47);
          p1.input = true;
        }
      } else {
        const p2 = state.players[1];
        if (!p2.down) {
          p2.targetX = clamp(x, W * 0.53, W * 0.92);
          p2.input = true;
        }
      }
      return;
    }

    if (state.screen !== 'battle') return;

    if (y < H / 2) {
      const p1 = state.players[0];
      p1.targetX = x;
      p1.input = true;
    } else if (mode === 'pvp') {
      const p2 = state.players[1];
      p2.targetX = x;
      p2.input = true;
    }
  }

  function open(){
    initCanvas();

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = $('battleScreen');
    if (screen) screen.classList.add('active');

    mode = 'cpu';

    state.screen = 'title';
    state.p1Wins = 0;
    state.p2Wins = 0;
    state.round = 1;
    state.rewardDone = false;
    clearBattleObjects();

    loadChoices();
    renderOverlay();

    running = true;
    cancelAnimationFrame(raf);
    loop();
  }

  function close(){
    running = false;
    cancelAnimationFrame(raf);

    if (document.exitFullscreen) document.exitFullscreen().catch(function(){});

    if (window.MobShotMain && window.MobShotMain.goMain) {
      window.MobShotMain.goMain();
      return;
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const main = $('mainScreen') || $('mainView');
    if (main) main.classList.add('active');
  }

  function avatarName(a){
    return a.name || a.displayName || a.avatarName || a.title || a.label || 'アバター';
  }

  function avatarBackImage(a){
    return a.backImage || '';
  }

  function loadChoices(){
    const list = [];

    if (window.MobShotShop && Array.isArray(window.MobShotShop.AVATAR_MASTER) && window.MobShotShop.loadState) {
      const shopState = window.MobShotShop.loadState();
      const owned = shopState && shopState.avatars ? shopState.avatars : {};

      window.MobShotShop.AVATAR_MASTER.forEach(a => {
        if (!owned[a.key]) return;
        const backImage = avatarBackImage(a);
        if (!backImage) return;

        list.push({
          type:'avatar',
          key:a.key,
          name:avatarName(a),
          image:backImage
        });
      });
    }

    if (!list.length) {
      list.push({ type:'avatar', key:'pink', name:'ピンクモデル', image:'play/playpink.png' });
    }

    state.choices = list;
  }

  function renderOverlay(){
    const overlay = $('battleOverlay');
    if (!overlay) return;

    if (state.screen === 'title') {
      overlay.innerHTML = `
        <div class="battle-menu">
          <div class="battle-card">
            <h1 class="battle-title">BATTLE MODE</h1>
            <p class="battle-help">対戦・CPU戦・協力モードを選べます。</p>
            <div class="battle-actions three">
              <button id="mobBattlePvpBtn" class="battle-btn blue" type="button">PvP</button>
              <button id="mobBattleCpuBtn" class="battle-btn" type="button">CPU</button>
              <button id="mobBattleCoopBtn" class="battle-btn green" type="button">協力</button>
            </div>
            <div style="margin-top:10px">
              <button id="mobBattleMainBtn" class="battle-btn blue" type="button" style="width:100%">メインへ戻る</button>
            </div>
          </div>
        </div>
      `;

      $('mobBattlePvpBtn').onclick = function(){ startSelect('pvp'); };
      $('mobBattleCpuBtn').onclick = function(){ startSelect('cpu'); };
      $('mobBattleCoopBtn').onclick = function(){ startSelect('coop'); };
      $('mobBattleMainBtn').onclick = close;
      return;
    }

    if (state.screen === 'select') {
      const sideText = state.selectSide === 'p1' ? '1Pを選択' : '2Pを選択';

      overlay.innerHTML = `
        <div class="battle-menu">
          <div class="battle-card">
            <h1 class="battle-title">${sideText}</h1>
            <p class="battle-help">所持アバターのステージ出撃用・後ろ姿から選択します。</p>
            <div class="battle-select-grid">
              ${state.choices.map((c,i) => `
                <button class="battle-choice" data-i="${i}" type="button">
                  <img src="${c.image}" alt="">
                  ${c.name}
                </button>
              `).join('')}
            </div>
            <div class="battle-small">
              <button id="mobBattleBackTitle" class="battle-btn blue" type="button">戻る</button>
              <button id="mobBattleCancelMain" class="battle-btn" type="button">メインへ</button>
            </div>
          </div>
        </div>
      `;

      overlay.querySelectorAll('.battle-choice').forEach(btn => {
        btn.onclick = function(){
          chooseCharacter(Number(this.getAttribute('data-i')));
        };
      });

      $('mobBattleBackTitle').onclick = function(){
        state.screen = 'title';
        renderOverlay();
      };

      $('mobBattleCancelMain').onclick = close;
      return;
    }

    overlay.innerHTML = '';
  }

  function startSelect(nextMode){
    mode = nextMode;
    state.screen = 'select';
    state.selectSide = 'p1';
    state.selected.p1 = null;
    state.selected.p2 = null;
    renderOverlay();
  }

  function chooseCharacter(index){
    const choice = state.choices[index];
    if (!choice) return;

    if (state.selectSide === 'p1') {
      state.selected.p1 = choice;
      state.selectSide = 'p2';

      if (mode === 'cpu') {
        state.selected.p2 = state.choices[intRand(0, state.choices.length - 1)];
        beginMatch();
        return;
      }

      renderOverlay();
      return;
    }

    state.selected.p2 = choice;

    if (mode === 'coop') {
      beginCoopReady();
      return;
    }

    beginMatch();
  }

  function tryLandscape(){
    const root = document.documentElement;

    if (root.requestFullscreen) root.requestFullscreen().catch(function(){});
    if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function(){});
  }

  function clearBattleObjects(){
    state.entities.length = 0;
    state.enemies.length = 0;
    state.bosses.length = 0;
    state.bullets.length = 0;
    state.particles.length = 0;
  }

  function beginCoopReady(){
    tryLandscape();

    state.screen = 'coopCountdown';
    state.message = '';
    state.messageTimer = 0;
    state.coopCountdownStart = 0;
    state.coopCountdownStarted = false;

    const p1 = state.players[0];
    const p2 = state.players[1];

    p1.name = '1P';
    p1.image = state.selected.p1.image;
    p2.name = '2P';
    p2.image = state.selected.p2.image;

    resetCoop();
    renderOverlay();
  }

  function resetCoop(){
    clearBattleObjects();

    state.coopAreaIndex = 0;
    state.coopBoss = null;
    state.coopScore = 0;
    state.coopKills = 0;
    state.coopBossKills = 0;
    state.coopClear = false;
    state.coopResultShown = false;
    state.coopBarrierTimer = 0;
    state.coopWideTimer = 0;
    state.spawnCd = 70;

    state.players.forEach(p => {
      p.hp = 140;
      p.maxHp = 140;
      p.power = 2;
      p.rapid = 1;
      p.wide = 2;
      p.shootCd = 20;
      p.alive = true;
      p.down = false;
      p.reviveTimer = 0;
      p.invincibleTimer = 0;
      p.input = false;
    });

    resetPlayerPositions();
  }

  function beginCoopGame(){
    state.screen = 'coop';
    spawnCoopBoss();
    showBattleMessage('START!');
  }

  function bossPersonality(index){
    const table = [
      { moveDelay:120, shootBase:175, heavyBase:620, spread:3, speed:1.25, name:'grass' },
      { moveDelay:105, shootBase:165, heavyBase:590, spread:3, speed:1.35, name:'desert' },
      { moveDelay:95, shootBase:155, heavyBase:560, spread:4, speed:1.42, name:'town' },
      { moveDelay:90, shootBase:148, heavyBase:530, spread:5, speed:1.48, name:'neon' },
      { moveDelay:82, shootBase:140, heavyBase:500, spread:5, speed:1.55, name:'magma' },
      { moveDelay:75, shootBase:132, heavyBase:470, spread:6, speed:1.62, name:'castle' }
    ];

    return table[index] || table[0];
  }

  function spawnCoopBoss(){
    const areaKey = COOP_AREAS[state.coopAreaIndex];
    const area = getAreaDataByKey(areaKey);
    const src = getCoopBossSource();
    const personality = bossPersonality(state.coopAreaIndex);

    if (!src) return;

    const scale = 0.42 + state.coopAreaIndex * 0.18;
    const hp = Math.ceil(Number(src.hp || 200) * scale);

    state.coopBoss = {
      type:'boss',
      name:src.name || 'BOSS',
      image:src.image || '',
      x:W / 2,
      y:H * 0.22,
      targetX:W / 2,
      hp,
      maxHp:hp,
      r:58,
      score:Math.ceil(Number(src.score || 1000) * scale),
      areaName:(area && area.name) || areaKey,
      dead:false,
      shootCd:personality.shootBase,
      heavyCd:personality.heavyBase,
      moveCd:45,
      moveDelay:personality.moveDelay,
      patternIndex:0,
      movePhase:Math.random() * Math.PI * 2,
      personality
    };

    state.bosses = [state.coopBoss];
    showBattleMessage(`${state.coopBoss.areaName} BOSS!`);
  }

  function beginMatch(){
    const p1 = state.players[0];
    const p2 = state.players[1];

    p1.name = '1P';
    p1.image = state.selected.p1.image;
    p2.name = mode === 'cpu' ? 'CPU' : '2P';
    p2.image = state.selected.p2.image;

    state.p1Wins = 0;
    state.p2Wins = 0;
    state.round = 1;
    state.screen = 'battle';
    state.message = 'ROUND 1';
    state.messageTimer = 90;

    resetRound();
    renderOverlay();
  }

  function resetRound(){
    clearBattleObjects();
    state.spawnCd = 80;

    state.players.forEach(p => {
      p.hp = 50;
      p.maxHp = 50;
      p.power = 1;
      p.rapid = 1;
      p.wide = 1;
      p.shootCd = 30;
      p.alive = true;
      p.down = false;
      p.reviveTimer = 0;
      p.invincibleTimer = 0;
      p.x = W / 2;
      p.targetX = W / 2;
    });

    resetPlayerPositions();
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

    if (state.screen === 'coopCountdown') {
      updateCoopCountdown();
      return;
    }

    if (state.screen === 'coop') {
      updateCoop();
      return;
    }

    if (state.screen !== 'battle') return;

    updatePlayers();
    updateCpu();
    updateSpawns();
    updateEntities();
    updateBullets();
    updateParticles();
    checkRoundEnd();
  }

  function updateCoopCountdown(){
    if (H > W) {
      state.coopCountdownStart = 0;
      state.coopCountdownStarted = false;
      return;
    }

    if (!state.coopCountdownStarted) {
      state.coopCountdownStarted = true;
      state.coopCountdownStart = Date.now();
    }

    const left = 5000 - (Date.now() - state.coopCountdownStart);
    if (left <= 0) beginCoopGame();
  }

  function updateCoop(){
    state.coopBarrierTimer = Math.max(0, state.coopBarrierTimer - 1);
    state.coopWideTimer = Math.max(0, state.coopWideTimer - 1);

    state.players.forEach(p => {
      p.invincibleTimer = Math.max(0, Number(p.invincibleTimer || 0) - 1);
    });

    updateCoopDownRevive();

    updatePlayers();
    updateCoopSpawns();
    updateCoopBosses();
    updateCoopEnemies();
    updateEntities();
    updateBullets();
    updateParticles();
    checkCoopEnd();
  }

  function updateCoopDownRevive(){
    const alivePlayers = state.players.filter(p => !p.down && p.hp > 0);
    const downPlayers = state.players.filter(p => p.down);

    if (!alivePlayers.length) return;

    downPlayers.forEach(p => {
      p.reviveTimer = Math.max(0, Number(p.reviveTimer || 0) - 1);

      if (p.reviveTimer <= 0) {
        p.down = false;
        p.alive = true;
        p.hp = Math.ceil(p.maxHp * 0.5);
        p.invincibleTimer = 120;
        showBattleMessage(`${p.name} REVIVE!`);
      }
    });
  }

  function setPlayerDown(p){
    if (!p || p.down) return;

    p.hp = 0;
    p.down = true;
    p.alive = false;
    p.input = false;
    p.reviveTimer = 300;
    showBattleMessage(`${p.name} DOWN!`);
  }

  function updatePlayers(){
    state.players.forEach(p => {
      if (mode === 'coop' && p.down) return;
      if (!p.alive) return;

      p.x += (p.targetX - p.x) * 0.2;

      if (mode === 'coop') {
        if (p.id === 1) p.x = clamp(p.x, W * 0.08, W * 0.47);
        else p.x = clamp(p.x, W * 0.53, W * 0.92);
      } else {
        p.x = clamp(p.x, W * 0.12, W * 0.88);
      }

      p.shootCd--;

      if (p.shootCd <= 0) {
        p.shootCd = Math.max(8, 34 - p.rapid * 4);
        firePlayer(p);
      }
    });
  }

  function updateCpu(){
    if (mode !== 'cpu') return;

    const p = state.players[1];
    const targetBullet = state.bullets.find(b => b.owner === 1 && b.y > H * 0.42);

    if (targetBullet && Math.abs(targetBullet.x - p.x) < 70) {
      p.targetX = p.x + (targetBullet.x < p.x ? 95 : -95);
    } else {
      const targetEntity = state.entities.find(e => e.y > H * 0.43 && e.y < H * 0.57);
      if (targetEntity) p.targetX = targetEntity.x;
      else p.targetX += Math.sin(state.frame * 0.025) * 10;
    }

    p.targetX = clamp(p.targetX, W * 0.14, W * 0.86);
  }

  function firePlayer(p){
    if (mode === 'coop' && p.down) return;

    const dir = mode === 'coop' ? -1 : (p.id === 1 ? 1 : -1);
    const count = mode === 'coop' && state.coopWideTimer > 0 ? 4 : Math.max(1, Number(p.wide || 1));
    const spacing = 18;

    for (let i = 0; i < count; i++) {
      const off = (i - (count - 1) / 2) * spacing;

      state.bullets.push({
        kind:'player',
        owner:p.id,
        x:p.x + off,
        y:p.y + dir * 32,
        vx:0,
        vy:dir * 6,
        r:10,
        power:p.power,
        dead:false
      });
    }
  }

  function updateCoopSpawns(){
    state.spawnCd--;
    if (state.spawnCd > 0) return;

    state.spawnCd = intRand(85, 145);

    const roll = Math.random();

    if (roll < 0.45) {
      spawnCoopEnemy();
      return;
    }

    const isChest = roll < 0.68;
    const src = isChest ? pickFrom(getBattleChests()) : pickFrom(getBattleGimmicks());
    const hp = Math.max(1, Math.ceil(Number(src && src.hp || (isChest ? 10 : 8)) * 0.75));

    state.entities.push({
      type:isChest ? 'chest' : 'obstacle',
      name:src && src.name ? src.name : (isChest ? '宝箱' : '障害物'),
      image:src && src.image ? src.image : (isChest ? FALLBACK_ASSET.chest : FALLBACK_ASSET.obstacle),
      x:rand(W * 0.10, W * 0.90),
      y:rand(H * 0.20, H * 0.42),
      vx:rand(-0.30, 0.30),
      vy:rand(0.06, 0.18),
      hp,
      maxHp:hp,
      r:isChest ? 22 : 25,
      dead:false,
      wobble:Math.random() * Math.PI * 2
    });
  }

  function spawnCoopEnemy(){
    const src = pickFrom(getCoopZako());
    if (!src) return;

    const hp = Math.max(2, Math.ceil(Number(src.hp || 10) * (0.7 + state.coopAreaIndex * 0.18)));

    state.enemies.push({
      type:'zako',
      name:src.name || 'ENEMY',
      image:src.image || '',
      x:rand(W * 0.10, W * 0.90),
      y:-40,
      vx:rand(-0.28, 0.28),
      vy:rand(0.36, 0.66),
      hp,
      maxHp:hp,
      r:24,
      score:Math.ceil(Number(src.score || 50) * (1 + state.coopAreaIndex * 0.4)),
      dead:false
    });
  }

  function updateCoopEnemies(){
    state.enemies.forEach(e => {
      e.x += e.vx;
      e.y += e.vy;

      if (e.x < W * 0.08 || e.x > W * 0.92) e.vx *= -1;

      state.players.forEach(p => {
        if (p.down || e.dead) return;

        if (Math.hypot(e.x - p.x, e.y - p.y) < e.r + 25) {
          damagePlayer(p, 8 + state.coopAreaIndex * 2);
          e.dead = true;
          burst(e.x, e.y, '#ff5b5b', 10);
        }
      });

      if (e.y > H + 80) e.dead = true;
    });

    state.enemies = state.enemies.filter(e => !e.dead);
  }

  function updateCoopBosses(){
    state.bosses.forEach(b => {
      if (b.dead) return;

      b.moveCd--;

      if (b.moveCd <= 0) {
        const left = W * 0.18;
        const right = W * 0.82;
        const centerBias = Math.random() < 0.25 ? W / 2 : rand(left, right);
        b.targetX = centerBias;
        b.moveCd = b.moveDelay + intRand(0, 40);
      }

      b.x += (b.targetX - b.x) * 0.018;
      b.x += Math.sin(state.frame * 0.018 + b.movePhase) * 0.18;
      b.x = clamp(b.x, W * 0.12, W * 0.88);

      b.shootCd--;
      if (b.shootCd <= 0) {
        b.shootCd = Math.max(110, b.personality.shootBase - state.coopAreaIndex * 4);
        fireBossPattern(b);
      }

      b.heavyCd--;
      if (b.heavyCd <= 0) {
        b.heavyCd = Math.max(420, b.personality.heavyBase - state.coopAreaIndex * 10);
        spawnBossHeavyAttack(b);
      }
    });

    state.bosses = state.bosses.filter(b => !b.dead);
  }

  function fireBossPattern(b){
    const area = state.coopAreaIndex;
    const pattern = b.patternIndex % 4;
    b.patternIndex++;

    if (area <= 1) {
      if (pattern % 2 === 0) fireBossAim(b);
      else fireBossSideShot(b);
      return;
    }

    if (area === 2) {
      if (pattern === 0) fireBossAim(b);
      else if (pattern === 1) fireBossSpread(b, 4);
      else fireBossSideShot(b);
      return;
    }

    if (area === 3) {
      if (pattern === 0) fireBossSpread(b, 5);
      else if (pattern === 1) fireBossAim(b);
      else fireBossWave(b);
      return;
    }

    if (area === 4) {
      if (pattern === 0) fireBossSpread(b, 5);
      else if (pattern === 1) fireBossSideShot(b);
      else fireBossWave(b);
      return;
    }

    if (pattern === 0) fireBossSpread(b, 6);
    else if (pattern === 1) fireBossAim(b);
    else if (pattern === 2) fireBossWave(b);
    else fireBossSideShot(b);
  }

  function fireBossAim(b){
    const targets = state.players.filter(p => !p.down);
    if (!targets.length) return;

    targets.forEach(p => {
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const speed = b.personality.speed;

      state.bullets.push({
        kind:'enemy',
        owner:0,
        image:FALLBACK_ASSET.bossBullet,
        x:b.x,
        y:b.y + 38,
        vx:dx / len * speed,
        vy:dy / len * speed,
        r:11,
        power:7 + state.coopAreaIndex * 2,
        dead:false
      });
    });
  }

  function fireBossSpread(b, count){
    const speed = b.personality.speed * 0.95;
    const total = count || b.personality.spread || 4;
    const min = -0.55;
    const max = 0.55;

    for (let i = 0; i < total; i++) {
      const t = total <= 1 ? 0.5 : i / (total - 1);
      const a = min + (max - min) * t;

      state.bullets.push({
        kind:'enemy',
        owner:0,
        image:FALLBACK_ASSET.bossBullet,
        x:b.x,
        y:b.y + 38,
        vx:Math.sin(a) * speed,
        vy:Math.cos(a) * speed,
        r:10,
        power:6 + state.coopAreaIndex * 2,
        dead:false
      });
    }
  }

  function fireBossSideShot(b){
    const targets = [
      { x:W * 0.20, y:H * 0.82 },
      { x:W * 0.80, y:H * 0.82 }
    ];

    targets.forEach(t => {
      const dx = t.x - b.x;
      const dy = t.y - b.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const speed = b.personality.speed * 1.02;

      state.bullets.push({
        kind:'enemy',
        owner:0,
        image:FALLBACK_ASSET.bossBullet,
        x:b.x,
        y:b.y + 38,
        vx:dx / len * speed,
        vy:dy / len * speed,
        r:11,
        power:7 + state.coopAreaIndex * 2,
        dead:false
      });
    });
  }

  function fireBossWave(b){
    const speed = b.personality.speed * 0.88;
    const starts = [
      { x:b.x - 48, a:-0.28 },
      { x:b.x, a:0 },
      { x:b.x + 48, a:0.28 }
    ];

    starts.forEach(s => {
      state.bullets.push({
        kind:'enemy',
        owner:0,
        image:FALLBACK_ASSET.bossBullet,
        x:s.x,
        y:b.y + 38,
        vx:Math.sin(s.a) * speed,
        vy:Math.cos(s.a) * speed,
        r:10,
        power:6 + state.coopAreaIndex * 2,
        dead:false
      });
    });
  }

  function spawnBossHeavyAttack(b){
    const hp = 34 + state.coopAreaIndex * 10;

    state.entities.push({
      type:'heavyAttack',
      name:'必殺・巨大火の玉',
      image:FALLBACK_ASSET.heavyAttack,
      x:b.x,
      baseX:b.x,
      y:b.y + 56,
      vx:0,
      vy:0.30 + state.coopAreaIndex * 0.025,
      amp:Math.max(70, W * 0.14),
      phase:Math.random() * Math.PI * 2,
      hp,
      maxHp:hp,
      r:48,
      score:700 + state.coopAreaIndex * 260,
      dead:false,
      wobble:0
    });

    showBattleMessage('BOSS SPECIAL!');
  }

  function updateSpawns(){
    state.spawnCd--;
    if (state.spawnCd > 0) return;

    state.spawnCd = intRand(90, 150);

    const isChest = Math.random() < 0.45;
    const src = isChest ? pickFrom(getBattleChests()) : pickFrom(getBattleGimmicks());
    const hp = Math.max(1, Number(src && src.hp || (isChest ? 10 : 8)));

    state.entities.push({
      type:isChest ? 'chest' : 'obstacle',
      name:src && src.name ? src.name : (isChest ? '宝箱' : '障害物'),
      image:src && src.image ? src.image : (isChest ? FALLBACK_ASSET.chest : FALLBACK_ASSET.obstacle),
      x:rand(W * 0.16, W * 0.84),
      y:H / 2,
      vx:rand(-0.75, 0.75),
      vy:rand(-0.15, 0.15),
      hp,
      maxHp:hp,
      r:isChest ? 27 : 31,
      dead:false,
      wobble:Math.random() * Math.PI * 2
    });
  }

  function updateEntities(){
    state.entities.forEach(e => {
      if (mode === 'coop' && e.type === 'heavyAttack') {
        e.y += e.vy;
        e.x = e.baseX + Math.sin(state.frame * 0.035 + e.phase) * e.amp;
        e.x = clamp(e.x, W * 0.10, W * 0.90);
      } else {
        e.x += e.vx;
        e.y += e.vy || Math.sin(state.frame * 0.02 + e.wobble) * 0.15;
      }

      if (e.x < W * 0.08 || e.x > W * 0.92) e.vx *= -1;

      if (mode === 'coop') {
        state.players.forEach(p => {
          if (p.down || e.dead) return;

          if (e.type === 'heavyAttack' && Math.hypot(e.x - p.x, e.y - p.y) < e.r + 26) {
            damagePlayer(p, 30 + state.coopAreaIndex * 4);
            e.dead = true;
            burst(e.x, e.y, '#ff5b5b', 22);
            showBattleMessage('SPECIAL HIT!');
            return;
          }

          if (e.type === 'obstacle' && Math.hypot(e.x - p.x, e.y - p.y) < e.r + 24) {
            damagePlayer(p, 5);
            e.dead = true;
            burst(e.x, e.y, '#9deeff', 8);
          }
        });

        if (e.y > H + 90) e.dead = true;
      }
    });

    state.entities = state.entities.filter(e => !e.dead);
  }

  function updateBullets(){
    state.bullets.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;

      if (mode === 'coop' && b.kind === 'enemy') {
        state.players.forEach(p => {
          if (p.down || b.dead) return;

          if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + 24) {
            damagePlayer(p, b.power);
            b.dead = true;
            burst(b.x, b.y, '#ff5b5b', 8);
          }
        });
      }

      if (mode !== 'coop' && b.kind !== 'enemy') {
        const enemyPlayer = state.players[b.owner === 1 ? 1 : 0];

        if (
          enemyPlayer.alive &&
          Math.abs(b.x - enemyPlayer.x) < 28 + b.r &&
          Math.abs(b.y - enemyPlayer.y) < 34 + b.r
        ) {
          enemyPlayer.hp -= b.power;
          b.dead = true;
          burst(b.x, b.y, '#ff5b5b', 8);
        }
      }

      if (b.kind !== 'enemy') {
        hitObjectsByPlayerBullet(b);
      }

      if (b.y < -100 || b.y > H + 100 || b.x < -100 || b.x > W + 100) b.dead = true;
    });

    state.bullets = state.bullets.filter(b => !b.dead);
  }

  function damagePlayer(p, amount){
    if (!p || p.down) return;
    if (state.coopBarrierTimer > 0) return;
    if (Number(p.invincibleTimer || 0) > 0) return;

    p.hp -= Number(amount || 0);

    if (p.hp <= 0) {
      setPlayerDown(p);
    }
  }

  function hitObjectsByPlayerBullet(b){
    state.entities.forEach(e => {
      if (e.dead || b.dead) return;

      if (Math.hypot(b.x - e.x, b.y - e.y) <= e.r + b.r) {
        e.hp -= b.power;
        b.dead = true;
        burst(e.x, e.y, e.type === 'chest' ? '#ffe66b' : e.type === 'heavyAttack' ? '#ff5b5b' : '#9deeff', 6);

        if (e.hp <= 0) {
          e.dead = true;
          onEntityDestroyed(e, b.owner);
        }
      }
    });

    state.enemies.forEach(e => {
      if (e.dead || b.dead) return;

      if (Math.hypot(b.x - e.x, b.y - e.y) <= e.r + b.r) {
        e.hp -= b.power;
        b.dead = true;
        burst(e.x, e.y, '#ffcf5b', 5);

        if (e.hp <= 0) {
          e.dead = true;
          state.coopKills++;
          state.coopScore += Number(e.score || 50);
          burst(e.x, e.y, '#9dff73', 12);
        }
      }
    });

    state.bosses.forEach(e => {
      if (e.dead || b.dead) return;

      if (Math.hypot(b.x - e.x, b.y - e.y) <= e.r + b.r) {
        e.hp -= b.power;
        b.dead = true;
        burst(e.x, e.y, '#ffe66b', 6);

        if (e.hp <= 0) {
          e.dead = true;
          state.coopKills++;
          state.coopBossKills++;
          state.coopScore += Number(e.score || 1000);
          burst(e.x, e.y, '#d86bff', 24);
          nextCoopBoss();
        }
      }
    });
  }

  function nextCoopBoss(){
    state.coopAreaIndex++;

    if (state.coopAreaIndex >= COOP_AREAS.length) {
      state.coopClear = true;
      finishCoop(true);
      return;
    }

    setTimeout(function(){
      if (!running || mode !== 'coop' || state.screen !== 'coop') return;
      spawnCoopBoss();
    }, 900);
  }

  function onEntityDestroyed(e, owner){
    const p = state.players[owner - 1];

    if (e.type === 'heavyAttack') {
      state.coopScore += Number(e.score || 700);
      showBattleMessage('SPECIAL BREAK!');
      burst(e.x, e.y, '#ffcf5b', 18);
      return;
    }

    if (e.type === 'chest') {
      const rewards = mode === 'coop'
        ? ['power1','heal30','rapid1','barrier','wideTemp']
        : ['power1','heal10','rapid1','power2','heal30','rapid2','wide1'];

      const reward = rewards[intRand(0, rewards.length - 1)];

      if (reward === 'power1') {
        state.players.forEach(player => player.power += 1);
        showBattleMessage('POWER UP!');
      }

      if (reward === 'power2') {
        p.power += 2;
        showBattleMessage(ownerText(owner) + ' POWER UP!');
      }

      if (reward === 'rapid1') {
        state.players.forEach(player => player.rapid += 1);
        showBattleMessage('RAPID UP!');
      }

      if (reward === 'rapid2') {
        p.rapid += 2;
        showBattleMessage(ownerText(owner) + ' RAPID UP!');
      }

      if (reward === 'wide1') {
        p.wide += 1;
        showBattleMessage(ownerText(owner) + ' WIDE UP!');
      }

      if (reward === 'heal10') {
        p.hp = Math.min(p.maxHp, p.hp + 10);
        showBattleMessage(ownerText(owner) + ' HEAL!');
      }

      if (reward === 'heal30') {
        state.players.forEach(player => {
          if (!player.down) player.hp = Math.min(player.maxHp, player.hp + 30);
        });
        showBattleMessage('HEAL!');
      }

      if (reward === 'barrier') {
        state.coopBarrierTimer = 300;
        state.players.forEach(player => player.invincibleTimer = Math.max(player.invincibleTimer, 300));
        showBattleMessage('BARRIER 5s!');
      }

      if (reward === 'wideTemp') {
        state.coopWideTimer = 300;
        showBattleMessage('4 WIDE 5s!');
      }

      state.coopScore += 80;
      return;
    }

    if (mode === 'coop') {
      state.players.forEach(player => {
        if (!player.down) {
          player.maxHp += 5;
          player.hp = Math.min(player.maxHp, player.hp + 5);
        }
      });
    } else {
      p.maxHp += 5;
      p.hp += 5;

      const other = state.players[owner === 1 ? 1 : 0];
      other.hp -= Math.max(1, Math.ceil(e.maxHp * 0.35));
    }

    state.coopScore += Number(e.score || 20);
    showBattleMessage(ownerText(owner) + ' BREAK!');
  }

  function checkCoopEnd(){
    const alive = state.players.some(p => !p.down && p.hp > 0);

    if (!alive) {
      finishCoop(false);
    }
  }

  function finishCoop(clear){
    if (state.coopResultShown) return;

    state.coopResultShown = true;
    state.screen = 'coopResult';
    state.coopClear = !!clear;

    const diamondReward = Number(state.coopBossKills || 0);

    if (clear) {
      addCoin(COOP_CLEAR_REWARD_COIN);
    }

    if (diamondReward > 0) {
      addDiamond(diamondReward);
    }

    const overlay = $('battleOverlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="battle-menu">
        <div class="battle-card">
          <h1 class="battle-title">${clear ? 'COOP CLEAR!' : 'GAME OVER'}</h1>
          <p class="battle-help">
            SCORE: ${Number(state.coopScore || 0).toLocaleString()}<br>
            KILL: ${Number(state.coopKills || 0).toLocaleString()}<br>
            BOSS撃破: ${Number(state.coopBossKills || 0).toLocaleString()}<br>
            DIAMOND: +${diamondReward.toLocaleString()}<br>
            ${clear ? `CLEAR報酬: ${COOP_CLEAR_REWARD_COIN.toLocaleString()} COIN` : 'CLEAR報酬なし'}
          </p>
          <button id="mobCoopRetryBtn" class="battle-btn green" type="button">もう一度</button>
          <button id="mobCoopFinishMain" class="battle-btn blue" type="button" style="margin-top:10px;width:100%">メインへ戻る</button>
        </div>
      </div>
    `;

    $('mobCoopRetryBtn').onclick = function(){
      beginCoopReady();
    };

    $('mobCoopFinishMain').onclick = close;
  }

  function ownerText(owner){
    if (owner === 1) return '1P';
    return mode === 'cpu' ? 'CPU' : '2P';
  }

  function updateParticles(){
    state.particles.forEach(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.08;
      pt.life--;
    });

    state.particles = state.particles.filter(pt => pt.life > 0);
  }

  function burst(x,y,color,n){
    for (let i = 0; i < n; i++) {
      state.particles.push({
        x,y,color,
        vx:rand(-3,3),
        vy:rand(-3,3),
        life:intRand(16,30)
      });
    }
  }

  function checkRoundEnd(){
    const p1 = state.players[0];
    const p2 = state.players[1];

    if (p1.hp > 0 && p2.hp > 0) return;

    const winner = p1.hp > 0 ? 1 : 2;

    if (winner === 1) state.p1Wins++;
    else state.p2Wins++;

    if (state.p1Wins >= WIN_NEED || state.p2Wins >= WIN_NEED) {
      finishMatch(winner);
      return;
    }

    state.round++;
    state.screen = 'roundWait';
    showBattleMessage(`${ownerText(winner)} ROUND GET!`);

    setTimeout(function(){
      if (!running) return;
      resetRound();
      state.screen = 'battle';
      showBattleMessage(`ROUND ${state.round}`);
    }, 1350);
  }

  function finishMatch(winner){
    state.screen = 'finish';
    showBattleMessage(`${ownerText(winner)} WIN!`);

    if (!state.rewardDone) {
      state.rewardDone = true;
      addCoin(BATTLE_REWARD_COIN);
    }

    const overlay = $('battleOverlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="battle-menu">
        <div class="battle-card">
          <h1 class="battle-title">${ownerText(winner)} WIN!</h1>
          <p class="battle-help">対戦終了！報酬として ${BATTLE_REWARD_COIN.toLocaleString()} COIN を獲得しました。</p>
          <button id="mobBattleFinishMain" class="battle-btn" type="button">メインへ戻る</button>
        </div>
      </div>
    `;

    $('mobBattleFinishMain').onclick = close;
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

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) window.MobShotMain.refreshMainHud();
    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
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

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) window.MobShotMain.refreshMainHud();
    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function showBattleMessage(text){
    state.message = text;
    state.messageTimer = 100;
  }

  function draw(){
    if (!ctx) return;

    drawBackground();

    if (mode === 'coop') drawCoopLine();
    else drawCenterLine();

    drawHud();

    if (state.screen === 'coopCountdown') {
      drawPlayers();
      drawCoopCountdown();
      return;
    }

    if (state.screen === 'coop') {
      drawEntities();
      drawEnemies();
      drawBosses();
      drawBullets();
      drawPlayers();
      drawParticles();
      drawMessage();
      return;
    }

    if (state.screen === 'battle' || state.screen === 'finish' || state.screen === 'roundWait') {
      drawEntities();
      drawBullets();
      drawPlayers();
      drawParticles();
      drawMessage();
    }
  }

  function drawBackground(){
    const bg = img(getBattleBackground());

    if (imageReady(bg)) ctx.drawImage(bg, 0, 0, W, H);
    else {
      ctx.fillStyle = '#49b852';
      ctx.fillRect(0,0,W,H);
    }

    if (mode !== 'coop') {
      ctx.fillStyle = 'rgba(0,0,0,.16)';
      ctx.fillRect(0, H / 2 - 3, W, 6);
    }
  }

  function drawCenterLine(){
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawCoopLine(){
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.restore();
  }

  function drawHud(){
    if (
      state.screen !== 'battle' &&
      state.screen !== 'finish' &&
      state.screen !== 'roundWait' &&
      state.screen !== 'coopCountdown' &&
      state.screen !== 'coop'
    ) return;

    if (mode === 'coop') {
      const p1 = state.players[0];
      const p2 = state.players[1];

      drawCoopHud(p1, 10, 10, W / 2 - 20);
      drawCoopHud(p2, W / 2 + 10, 10, W / 2 - 20);

      ctx.font = '900 15px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe66b';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      const area = getAreaDataByKey(COOP_AREAS[state.coopAreaIndex] || 'grass');
      const barrier = state.coopBarrierTimer > 0 ? ` / BARRIER ${Math.ceil(state.coopBarrierTimer / 60)}` : '';
      const wide = state.coopWideTimer > 0 ? ` / 4WIDE ${Math.ceil(state.coopWideTimer / 60)}` : '';
      const txt = `${area ? area.name : 'AREA'} / SCORE ${Number(state.coopScore || 0).toLocaleString()}${barrier}${wide}`;
      ctx.strokeText(txt, W / 2, 54);
      ctx.fillText(txt, W / 2, 54);
      return;
    }

    const p1 = state.players[0];
    const p2 = state.players[1];

    drawPlayerHud(p1, 14, 16, true);
    drawPlayerHud(p2, 14, H - 58, false);

    drawSideText(`${state.p1Wins} - ${state.p2Wins}`, W / 2, H * 0.44, true, 18);
    drawSideText(`${state.p1Wins} - ${state.p2Wins}`, W / 2, H * 0.56, false, 18);
  }

  function drawCoopHud(p, x, y, w){
    const rate = clamp(p.hp / p.maxHp, 0, 1);

    ctx.fillStyle = 'rgba(0,0,0,.58)';
    roundRect(x, y, w, 36, 14);
    ctx.fill();

    ctx.fillStyle = p.down ? '#59657f' : '#ff5b5b';
    roundRect(x + 8, y + 8, (w - 16) * rate, 10, 999);
    ctx.fill();

    ctx.font = '900 13px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';

    const text = p.down
      ? `${p.name} DOWN ${Math.ceil(p.reviveTimer / 60)}`
      : `${p.name} HP ${Math.max(0, Math.ceil(p.hp))}/${p.maxHp}`;

    ctx.fillText(text, x + 10, y + 29);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#9deeff';
    ctx.fillText(`P${p.power} R${p.rapid} W${state.coopWideTimer > 0 ? 4 : p.wide}`, x + w - 10, y + 29);
  }

  function drawPlayerHud(p, x, y, upsideDown){
    ctx.save();

    if (upsideDown) {
      ctx.translate(W, H);
      ctx.rotate(Math.PI);
      x = 14;
      y = H - 58;
    }

    const w = W - 28;
    const rate = clamp(p.hp / p.maxHp, 0, 1);

    ctx.fillStyle = 'rgba(0,0,0,.58)';
    roundRect(x, y, w, 36, 14);
    ctx.fill();

    ctx.fillStyle = '#ff5b5b';
    roundRect(x + 8, y + 8, (w - 16) * rate, 10, 999);
    ctx.fill();

    ctx.font = '900 13px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${p.name} HP ${Math.max(0, Math.ceil(p.hp))}/${p.maxHp}`, x + 10, y + 29);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#9deeff';
    ctx.fillText(`P${p.power} R${p.rapid} W${p.wide}`, x + w - 10, y + 29);

    ctx.restore();
  }

  function drawSideText(text, x, y, upsideDown, size){
    ctx.save();
    ctx.translate(x, y);

    if (upsideDown) ctx.rotate(Math.PI);

    ctx.font = `1000 ${size || 26}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe66b';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  function drawCoopCountdown(){
    if (H > W) {
      drawOverlayText('スマホを横向きにしてください', '横向きになったら5秒カウントが始まります');
      return;
    }

    let left = 5;

    if (state.coopCountdownStarted && state.coopCountdownStart) {
      left = Math.max(0, Math.ceil((5000 - (Date.now() - state.coopCountdownStart)) / 1000));
    }

    drawOverlayText(String(left), '協力モード準備中');
  }

  function drawOverlayText(main, sub){
    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,.58)';
    ctx.fillRect(0,0,W,H);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe66b';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.font = '1000 42px system-ui';
    ctx.strokeText(main, W / 2, H / 2 - 10);
    ctx.fillText(main, W / 2, H / 2 - 10);

    ctx.font = '900 18px system-ui';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.strokeText(sub, W / 2, H / 2 + 32);
    ctx.fillText(sub, W / 2, H / 2 + 32);

    ctx.restore();
  }

  function drawPlayers(){
    state.players.forEach(p => {
      if (mode === 'coop' && p.down && Math.floor(state.frame / 8) % 2 === 0) return;

      const image = img(p.image);
      const size = mode === 'coop' ? 52 : 62;

      ctx.save();
      ctx.translate(p.x, p.y);

      if (mode !== 'coop' && p.id === 1) ctx.rotate(Math.PI);

      if (state.coopBarrierTimer > 0 || p.invincibleTimer > 0) {
        ctx.globalAlpha = 0.72;
      }

      if (imageReady(image)) ctx.drawImage(image, -size / 2, -size / 2, size, size);
      else {
        ctx.fillStyle = p.id === 1 ? '#60d9ff' : '#ff7ab8';
        ctx.beginPath();
        ctx.arc(0,0,28,0,Math.PI*2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (state.coopBarrierTimer > 0 || p.invincibleTimer > 0) {
        ctx.strokeStyle = '#9deeff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0,0,size * 0.58,0,Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  function drawEntities(){
    state.entities.forEach(e => {
      const image = img(e.image);
      let size = mode === 'coop' ? (e.type === 'chest' ? 42 : 46) : (e.type === 'chest' ? 54 : 62);

      if (e.type === 'heavyAttack') size = 92;

      if (imageReady(image)) ctx.drawImage(image, e.x - size / 2, e.y - size / 2, size, size);
      else {
        ctx.fillStyle = e.type === 'chest' ? '#ffe66b' : e.type === 'heavyAttack' ? '#ff5b5b' : '#777';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      drawEntityNumber(e);
    });
  }

  function drawEnemies(){
    state.enemies.forEach(e => {
      const image = img(e.image);
      const size = 42;

      if (imageReady(image)) ctx.drawImage(image, e.x - size / 2, e.y - size / 2, size, size);
      else {
        ctx.fillStyle = '#ff7ab8';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      drawEntityNumber(e);
    });
  }

  function drawBosses(){
    state.bosses.forEach(e => {
      const image = img(e.image);
      const size = 116;

      if (imageReady(image)) ctx.drawImage(image, e.x - size / 2, e.y - size / 2, size, size);
      else {
        ctx.fillStyle = '#d86bff';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      drawEntityNumber(e);
    });
  }

  function drawEntityNumber(e){
    const text = String(Math.max(0, Math.ceil(e.hp)));

    if (mode === 'coop') {
      drawSideText(text, e.x, e.y - 32, false, 16);
      return;
    }

    drawSideText(text, e.x, e.y - 11, true, 16);
    drawSideText(text, e.x, e.y + 17, false, 16);
  }

  function drawBullets(){
    state.bullets.forEach(b => {
      const image = img(b.kind === 'enemy' ? FALLBACK_ASSET.bossBullet : FALLBACK_ASSET.bullet);
      const size = b.kind === 'enemy' ? 30 : 24;

      if (imageReady(image)) {
        ctx.drawImage(image, b.x - size / 2, b.y - size / 2, size, size);
      } else {
        ctx.fillStyle = b.kind === 'enemy' ? '#ff5b5b' : '#fff178';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function drawParticles(){
    state.particles.forEach(pt => {
      ctx.globalAlpha = Math.max(0, pt.life / 30);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function drawMessage(){
    if (state.messageTimer <= 0) return;

    const alpha = Math.min(1, state.messageTimer / 24);

    ctx.save();
    ctx.globalAlpha = alpha;

    if (mode === 'coop') {
      drawSideText(state.message, W / 2, H * 0.5, false, 30);
    } else {
      drawSideText(state.message, W / 2, H * 0.34, true, 30);
      drawSideText(state.message, W / 2, H * 0.66, false, 30);
    }

    ctx.restore();
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
