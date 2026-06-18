'use strict';

(function(){
  const BATTLE_REWARD_COIN = 1000;
  const WIN_NEED = 3;

  const ASSET = {
    bg:'sta/backsougen.png',
    bullet:'mt/atk.png',
    chest:'mt/takara.png',
    obstacle:'mt/iwa.png'
  };

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
    players:[makePlayer(1), makePlayer(2)],
    spawnCd:90
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
      hp:50,
      maxHp:50,
      power:1,
      rapid:1,
      wide:1,
      shootCd:0,
      score:0,
      alive:true,
      input:false
    };
  }

  function rand(a,b){ return a + Math.random() * (b - a); }
  function intRand(a,b){ return Math.floor(rand(a, b + 1)); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

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
        overflow:hidden!important;
        background:#07101f!important;
        width:100vw!important;
        height:100svh!important;
      }

      #battleScreen.active{
        display:block!important;
      }

      #battleCanvas{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
        background:#3daf55!important;
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
        background:rgba(0,0,0,.58)!important;
        pointer-events:auto!important;
      }

      .battle-card{
        width:min(92vw,440px)!important;
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
        margin:0 0 14px!important;
        font-size:34px!important;
        font-weight:1000!important;
        color:#ffe66b!important;
        text-shadow:0 5px 0 #000!important;
      }

      .battle-help{
        margin:0 0 16px!important;
        color:#dfe8ff!important;
        font-size:13px!important;
        font-weight:900!important;
        line-height:1.55!important;
      }

      .battle-actions,
      .battle-small{
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        gap:10px!important;
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

      .battle-select-grid{
        display:grid!important;
        grid-template-columns:repeat(3,1fr)!important;
        gap:10px!important;
        max-height:48svh!important;
        overflow:auto!important;
        padding:2px!important;
        margin-bottom:14px!important;
      }

      .battle-choice{
        border:2px solid rgba(255,255,255,.26)!important;
        border-radius:18px!important;
        padding:8px 5px!important;
        background:rgba(255,255,255,.10)!important;
        color:#fff!important;
        font-weight:1000!important;
        font-size:11px!important;
      }

      .battle-choice img{
        width:64px!important;
        height:64px!important;
        object-fit:contain!important;
        display:block!important;
        margin:0 auto 4px!important;
      }

      #battleTitleLayer,
      #battleSelectLayer,
      #battleHud,
      #battleBanner{
        display:none!important;
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
    const rect = screen ? screen.getBoundingClientRect() : {
      width:window.innerWidth,
      height:window.innerHeight
    };

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

    p1.x = p1.x || W / 2;
    p2.x = p2.x || W / 2;

    p1.targetX = p1.targetX || W / 2;
    p2.targetX = p2.targetX || W / 2;

    p1.y = H * 0.22;
    p2.y = H * 0.78;
  }

  function onPointer(e){
    if (!running || state.screen !== 'battle') return;

    e.preventDefault();
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const x = e.clientX - rect.left;

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

    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
    });

    const screen = $('battleScreen');
    if (screen) screen.classList.add('active');

    state.screen = 'title';
    state.p1Wins = 0;
    state.p2Wins = 0;
    state.round = 1;
    state.rewardDone = false;
    state.entities.length = 0;
    state.bullets.length = 0;
    state.particles.length = 0;

    loadChoices();
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

    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
    });

    const main = $('mainScreen') || $('mainView');
    if (main) main.classList.add('active');
  }

  function loadChoices(){
    const list = [];

    if (window.MobShotEquip && window.MobShotEquip.getOwnedAvatars) {
      window.MobShotEquip.getOwnedAvatars().forEach(a => {
        const backImage = a.backImage || a.stageImage || a.playImage || '';

        if (!backImage) return;

        list.push({
          type:'avatar',
          name:a.name || 'AVATAR',
          image:backImage
        });
      });
    }

    if (!list.length) {
      list.push(
        { type:'avatar', name:'PINK', image:'play/playpink.png' },
        { type:'avatar', name:'GREEN', image:'play/green.png' }
      );
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
            <p class="battle-help">3本先取の対戦モードです。所持アバターの後ろ姿だけ使用できます。</p>
            <div class="battle-actions">
              <button id="mobBattlePvpBtn" class="battle-btn blue" type="button">PvP</button>
              <button id="mobBattleCpuBtn" class="battle-btn" type="button">CPU</button>
            </div>
            <div style="margin-top:10px">
              <button id="mobBattleMainBtn" class="battle-btn blue" type="button" style="width:100%">メインへ戻る</button>
            </div>
          </div>
        </div>
      `;

      $('mobBattlePvpBtn').onclick = function(){ startSelect('pvp'); };
      $('mobBattleCpuBtn').onclick = function(){ startSelect('cpu'); };
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
    beginMatch();
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
    state.entities.length = 0;
    state.bullets.length = 0;
    state.particles.length = 0;
    state.spawnCd = 80;

    state.players.forEach(p => {
      p.hp = 50;
      p.maxHp = 50;
      p.power = 1;
      p.rapid = 1;
      p.wide = 1;
      p.shootCd = 30;
      p.alive = true;
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

    if (state.screen !== 'battle') return;

    updatePlayers();
    updateCpu();
    updateSpawns();
    updateEntities();
    updateBullets();
    updateParticles();
    checkRoundEnd();
  }

  function updatePlayers(){
    state.players.forEach(p => {
      p.x += (p.targetX - p.x) * 0.2;
      p.x = clamp(p.x, W * 0.12, W * 0.88);

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
    const dir = p.id === 1 ? 1 : -1;
    const count = Math.max(1, Number(p.wide || 1));
    const spacing = 18;

    for (let i = 0; i < count; i++) {
      const off = (i - (count - 1) / 2) * spacing;

      state.bullets.push({
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

  function updateSpawns(){
    state.spawnCd--;

    if (state.spawnCd > 0) return;

    state.spawnCd = intRand(90, 150);

    const isChest = Math.random() < 0.45;
    const hp = isChest ? intRand(6, 12) : intRand(4, 12);

    state.entities.push({
      type:isChest ? 'chest' : 'obstacle',
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
      e.x += e.vx;
      e.y += Math.sin(state.frame * 0.02 + e.wobble) * 0.15;

      if (e.x < W * 0.12 || e.x > W * 0.88) e.vx *= -1;
    });

    state.entities = state.entities.filter(e => !e.dead);
  }

  function updateBullets(){
    state.bullets.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;

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

      state.entities.forEach(e => {
        if (e.dead || b.dead) return;

        if (Math.hypot(b.x - e.x, b.y - e.y) <= e.r + b.r) {
          e.hp -= b.power;
          b.dead = true;
          burst(e.x, e.y, e.type === 'chest' ? '#ffe66b' : '#9deeff', 6);

          if (e.hp <= 0) {
            e.dead = true;
            onEntityDestroyed(e, b.owner);
          }
        }
      });

      if (b.y < -80 || b.y > H + 80) b.dead = true;
    });

    state.bullets = state.bullets.filter(b => !b.dead);
  }

  function onEntityDestroyed(e, owner){
    const p = state.players[owner - 1];

    if (e.type === 'chest') {
      const reward = ['power1','heal10','rapid1','power2','heal30','rapid2','wide1'][intRand(0, 6)];

      if (reward === 'power1') p.power += 1;
      if (reward === 'power2') p.power += 2;
      if (reward === 'rapid1') p.rapid += 1;
      if (reward === 'rapid2') p.rapid += 2;
      if (reward === 'wide1') p.wide += 1;
      if (reward === 'heal10') p.hp = Math.min(p.maxHp, p.hp + 10);
      if (reward === 'heal30') p.hp = Math.min(p.maxHp, p.hp + 30);

      showBattleMessage(ownerText(owner) + ' POWER UP!');
      return;
    }

    p.maxHp += 5;
    p.hp += 5;

    const other = state.players[owner === 1 ? 1 : 0];
    other.hp -= Math.max(1, Math.ceil(e.maxHp * 0.35));

    showBattleMessage(ownerText(owner) + ' WALL BREAK!');
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

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function showBattleMessage(text){
    state.message = text;
    state.messageTimer = 100;
  }

  function draw(){
    if (!ctx) return;

    drawBackground();
    drawCenterLine();
    drawHud();

    if (state.screen === 'battle' || state.screen === 'finish' || state.screen === 'roundWait') {
      drawEntities();
      drawBullets();
      drawPlayers();
      drawParticles();
      drawMessage();
    }
  }

  function drawBackground(){
    const bg = img(ASSET.bg);

    if (imageReady(bg)) {
      ctx.drawImage(bg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#49b852';
      ctx.fillRect(0,0,W,H);
    }

    ctx.fillStyle = 'rgba(0,0,0,.16)';
    ctx.fillRect(0, H / 2 - 3, W, 6);
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

  function drawHud(){
    if (state.screen !== 'battle' && state.screen !== 'finish' && state.screen !== 'roundWait') return;

    const p1 = state.players[0];
    const p2 = state.players[1];

    drawPlayerHud(p1, 14, 16, true);
    drawPlayerHud(p2, 14, H - 58, false);

    drawSideText(`${state.p1Wins} - ${state.p2Wins}`, W / 2, H * 0.44, true, 18);
    drawSideText(`${state.p1Wins} - ${state.p2Wins}`, W / 2, H * 0.56, false, 18);
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

  function drawPlayers(){
    state.players.forEach(p => {
      const image = img(p.image);
      const size = 62;

      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.id === 1) ctx.rotate(Math.PI);

      if (imageReady(image)) {
        ctx.drawImage(image, -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = p.id === 1 ? '#60d9ff' : '#ff7ab8';
        ctx.beginPath();
        ctx.arc(0,0,28,0,Math.PI*2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  function drawEntities(){
    state.entities.forEach(e => {
      const image = img(e.type === 'chest' ? ASSET.chest : ASSET.obstacle);
      const size = e.type === 'chest' ? 54 : 62;

      if (imageReady(image)) {
        ctx.drawImage(image, e.x - size / 2, e.y - size / 2, size, size);
      } else {
        ctx.fillStyle = e.type === 'chest' ? '#ffe66b' : '#777';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '900 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.strokeText(String(Math.max(0, Math.ceil(e.hp))), e.x, e.y + 6);
      ctx.fillText(String(Math.max(0, Math.ceil(e.hp))), e.x, e.y + 6);
    });
  }

  function drawBullets(){
    const image = img(ASSET.bullet);

    state.bullets.forEach(b => {
      if (imageReady(image)) {
        ctx.drawImage(image, b.x - 12, b.y - 12, 24, 24);
      } else {
        ctx.fillStyle = '#fff178';
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

    drawSideText(state.message, W / 2, H * 0.34, true, 30);
    drawSideText(state.message, W / 2, H * 0.66, false, 30);

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
