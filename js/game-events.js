'use strict';

(function(){
  const GOLD_STAGE_SECONDS = 120;
  const EVENT_MAX_AGE_MS = 1000 * 60 * 15;
  const GOLD_TICKET_DROP_RATE = 0.08;

  const DIFFICULTY_ICONS = {
    easy: 'mt/game1.png',
    hard: 'mt/game2.png',
    veryHard: 'mt/game3.png',
    inferno: 'mt/game4.png',
    legend: 'mt/game5.png'
  };

  function normalizeDifficultyKey(value){
    const v = String(value || '').toLowerCase();

    if (v === 'easy' || value === 'イージー') return 'easy';
    if (v === 'hard' || value === 'ハード') return 'hard';
    if (v === 'veryhard' || v === 'very_hard' || value === 'ベリーハード') return 'veryHard';
    if (v === 'inferno' || value === 'インフェルノ') return 'inferno';
    if (v === 'legend' || value === 'レジェンド') return 'legend';

    return '';
  }

  function injectHudStyle(){
    if (document.getElementById('mobShotHudDifficultyStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobShotHudDifficultyStyle';
    style.textContent = `
      .game-hud .hud-item span{
        font-size:18px !important;
        font-weight:1000 !important;
        letter-spacing:.02em;
      }
      #hudStageImg{
        width:34px !important;
        height:34px !important;
        object-fit:contain !important;
        filter:drop-shadow(0 3px 0 rgba(0,0,0,.35));
      }
    `;
    document.head.appendChild(style);
  }

  function setHudDifficultyIcon(keyOrName){
    injectHudStyle();

    const img = document.getElementById('hudStageImg');
    if (!img) return;

    const key = normalizeDifficultyKey(keyOrName);
    const src = DIFFICULTY_ICONS[key];

    if (src) {
      img.src = src;
    }
  }

  function readEventSafe(){
    if (!window.MobShotEvents || !window.MobShotEvents.getCurrentEvent) return null;

    const ev = window.MobShotEvents.getCurrentEvent();
    if (!ev || !ev.key) return null;

    if (ev.startedAt && Date.now() - Number(ev.startedAt) > EVENT_MAX_AGE_MS) {
      if (window.MobShotEvents.clearCurrentEvent) {
        window.MobShotEvents.clearCurrentEvent();
      }
      return null;
    }

    return ev;
  }

  function isGoldStageRun(core){ return core.isEventMode('gold'); }
  function isScoreAttackRun(core){ return core.isEventMode('scoreAttack'); }
  function isDoubleBossRun(core){ return core.isEventMode('doubleBoss'); }

  function startCurrentEvent(core){
    const ev = readEventSafe();

    if (!ev) return false;

    if (ev.key === 'gold') {
      startGoldStageMode(core);
      return true;
    }

    if (ev.key === 'scoreAttack') {
      startScoreAttackMode(core);
      return true;
    }

    if (ev.key === 'doubleBoss') {
      startDoubleBossMode(core);
      return true;
    }

    return false;
  }

  function startGoldStageMode(core){
    const diff =
      window.MobShotEvents && window.MobShotEvents.getCurrentGoldDifficulty
        ? window.MobShotEvents.getCurrentGoldDifficulty()
        : {
            key: 'easy',
            name: 'イージー',
            clearCoin: 300,
            firstCoin: 3000,
            firstDiamond: 5,
            chestMul: 0.55,
            bossHpMul: 0.7,
            bossCoinMul: 0.7,
            showMidBoss: false
          };

    core.setEventMode({
      active: true,
      key: 'gold',
      difficulty: diff,
      endFrame: core.frame + GOLD_STAGE_SECONDS * 60,
      nextChest: core.frame + 120,
      nextBoss: core.frame + 70,
      nextBonusEnemy: core.frame + 200,
      bossCount: 0
    });

    setHudDifficultyIcon(diff.key);

    core.showBanner(`GOLD STAGE ${diff.name}`);
    core.addText(`${diff.name} / 120秒`, core.W / 2, core.H * 0.28, '#ffcf5b');

    spawnGoldChestWave(core, 1);
  }

  function buildScoreBossList(core){
    const areaData = window.MOBSHOT_STAGE_DATA || {};
    const order = [
      'grass',
      'desert',
      'town',
      'neon',
      'magma',
      'castle',
      'prison',
      'matrix',
      'seaRail',
      'neonHighway',
      'makai',
      'last'
    ];

    const list = [];

    order.forEach((key, index) => {
      const area = areaData[key];

      if (!area || !area.boss) return;

      const boss = core.clone(area.boss);

      boss.__scoreAreaKey = key;
      boss.__scoreAreaName = area.name || key;
      boss.__scoreBackground = area.background || 'sta/backsougen.png';
      boss.__scoreScale = 1.55 + index * 0.38;

      list.push(boss);
    });

    if (!list.length && core.D.enemies && core.D.enemies.boss) {
      const boss = core.clone(core.D.enemies.boss);

      boss.__scoreAreaKey = 'grass';
      boss.__scoreAreaName = '草原';
      boss.__scoreBackground = core.D.stage.background || 'sta/backsougen.png';
      boss.__scoreScale = 1.8;

      list.push(boss);
    }

    return list;
  }

  function setupStageArea(core, areaKey, label){
    const areaData = window.MOBSHOT_STAGE_DATA || {};
    const area = areaData[areaKey];

    if (!area || !core.D) return;

    core.D.stage = Object.assign(core.D.stage || {}, {
      id: label || 'EVENT',
      areaKey,
      areaName: area.name || label || areaKey,
      areaType: area.name || label || areaKey,
      difficulty: label || 'EVENT',
      background: area.background || core.D.stage.background,
      isStrongBoss: true,
      isLegend: true
    });

    core.D.enemies = core.D.enemies || {};
    core.D.enemies.zako = core.clone(area.zako || []);
    core.D.enemies.midBoss = core.clone(area.midBoss || []);
    core.D.gimmicks = core.clone(area.gimmicks || []);
  }

  function applyScoreArea(core, areaKey){
    setupStageArea(core, areaKey, 'SCORE ATTACK');
  }

  function startScoreAttackMode(core){
    core.setEventMode({
      active: true,
      key: 'scoreAttack',
      scoreBossList: buildScoreBossList(core),
      scoreBossIndex: 0,
      nextEnemy: core.frame + 130,
      nextGate: core.frame + 20 * 60,
      currentAreaKey: 'grass',
      currentAreaName: '草原'
    });

    applyScoreArea(core, 'grass');

    core.showBanner('SCORE ATTACK!');
    core.addText('強化ボス連戦！', core.W / 2, core.H * 0.28, '#6be6ff');

    spawnScoreAttackBoss(core);
  }

  function spawnScoreAttackBoss(core){
    const mode = core.state.eventMode;
    const list = mode.scoreBossList || [];
    const index = Number(mode.scoreBossIndex || 0);

    if (!list.length || index >= list.length) {
      core.finishRun(true);
      return;
    }

    const boss = core.clone(list[index]);
    const areaKey = boss.__scoreAreaKey || 'grass';
    const scale = Number(boss.__scoreScale || 1.5);

    mode.currentAreaKey = areaKey;
    mode.currentAreaName = boss.__scoreAreaName || areaKey;

    applyScoreArea(core, areaKey);

    boss.hp = Math.ceil(Number(boss.hp || 1) * scale);
    boss.score = Math.ceil(Number(boss.score || 0) * (1.8 + index * 0.35));
    boss.coin = Math.ceil(Number(boss.coin || 0) * 0.15);

    core.D.enemies.boss = boss;

    if (window.MobShotSpawn && window.MobShotSpawn.spawnBoss) {
      window.MobShotSpawn.spawnBoss(core.makeTools());
    }

    core.state.entities.forEach(e => {
      if (e.kind !== 'boss') return;
      if (e.__scoreAttackBoss) return;

      e.__scoreAttackBoss = true;
      e.__scoreBossIndex = index;
      e.hp = Math.ceil(Number(e.hp || 1));
      e.maxHp = e.hp;
      e.score = boss.score;
      e.coin = boss.coin;
      e.shootCd = Math.max(35, Math.floor(Number(e.shootCd || 80) * 0.78));
      e.attackCd = Math.max(70, Math.floor(Number(e.attackCd || 140) * 0.8));
    });

    core.showBanner(`${index + 1}/${list.length} ${boss.name}`);
  }

  function startDoubleBossMode(core){
    const info =
      window.MobShotEvents && window.MobShotEvents.getCurrentDoubleBoss
        ? window.MobShotEvents.getCurrentDoubleBoss()
        : {
            difficulty: {
              key: 'veryHard',
              name: 'ベリーハード',
              firstCoin: 5000,
              firstDiamond: 5,
              hpMul: 1.35,
              scoreMul: 1.25
            },
            stage: {
              id: 1,
              areaKey: 'grass',
              areaName: '草原',
              title: '草原',
              bossA: 'ホークモブ',
              bossB: 'ミラモブ'
            }
          };

    const stage = info.stage;
    const diff = info.difficulty;

    core.setEventMode({
      active: true,
      key: 'doubleBoss',
      doubleStage: stage,
      doubleDifficulty: diff,
      currentAreaKey: stage.areaKey,
      currentAreaName: stage.areaName,
      nextGate: core.frame + 20 * 60,
      doubleIntroTimer: 120,
      doubleClearReady: false,
      doubleSpawned: false,
      doubleKilled: 0
    });

    setHudDifficultyIcon(diff.key);

    setupStageArea(core, stage.areaKey, 'DOUBLE BOSS');

    core.showBanner(`DOUBLE BOSS ${diff.name}`);
    core.addText(stage.title, core.W / 2, core.H * 0.24, '#ffe66b');

    if (
      window.MobShotGameBossManager &&
      window.MobShotGameBossManager.doubleBossEntranceEffect
    ) {
      window.MobShotGameBossManager.doubleBossEntranceEffect(core);
    }

    setTimeout(function(){
      if (!core.isRunning() || !core.isEventMode('doubleBoss') || core.isCommitted()) return;

      if (
        window.MobShotGameBossManager &&
        window.MobShotGameBossManager.spawnDoubleBosses
      ) {
        window.MobShotGameBossManager.spawnDoubleBosses(core, stage, diff);
      }
    }, 900);
  }

  function update(core){
    if (isGoldStageRun(core)) {
      updateGoldStageMode(core);
      return true;
    }

    if (isScoreAttackRun(core)) {
      updateScoreAttackMode(core);
      return true;
    }

    if (isDoubleBossRun(core)) {
      updateDoubleBossMode(core);
      return true;
    }

    return false;
  }

  function updateGoldStageMode(core){
    const mode = core.state.eventMode;
    const remain = Math.max(0, Number(mode.endFrame || 0) - core.frame);
    const diff = mode.difficulty || {};

    if (remain <= 0) {
      core.finishRun(true);
      return;
    }

    if (core.frame >= Number(mode.nextChest || 0)) {
      const count = Math.random() < 0.16 ? 2 : 1;
      spawnGoldChestWave(core, count);
      mode.nextChest = core.frame + core.intRand(175, 270);
    }

    if (core.frame >= Number(mode.nextBonusEnemy || 0)) {
      spawnGoldBonusEnemy(core);
      mode.nextBonusEnemy = core.frame + core.intRand(230, 340);
    }

    if (
      diff.showMidBoss &&
      Number(mode.bossCount || 0) > 0 &&
      Number(mode.bossCount || 0) % 3 === 0
    ) {
      const midAlive = core.state.entities.some(e => !e.dead && e.kind === 'midBoss');

      if (!midAlive && Math.random() < 0.018) {
        spawnGoldMidBoss(core);
      }
    }

    const bossAlive = core.state.entities.some(e => !e.dead && e.kind === 'boss');

    if (!bossAlive && core.frame >= Number(mode.nextBoss || 0)) {
      spawnGoldBoss(core);
      mode.nextBoss = core.frame + 999999;
    }
  }

  function spawnGoldBoss(core){
    if (!window.MobShotSpawn || !window.MobShotSpawn.spawnBoss) return;

    const mode = core.state.eventMode;
    const diff = mode.difficulty || {};

    window.MobShotSpawn.spawnBoss(core.makeTools());

    mode.bossCount = Number(mode.bossCount || 0) + 1;

    core.state.entities.forEach(e => {
      if (e.kind !== 'boss') return;
      if (e.__goldStageBoss) return;

      e.__goldStageBoss = true;
      e.hp = Math.ceil(Number(e.hp || 1) * Number(diff.bossHpMul || 1));
      e.maxHp = e.hp;
      e.score = Math.ceil(Number(e.score || 0) * 0.55);
      e.coin = Math.ceil(Number(e.coin || 0) * Number(diff.bossCoinMul || 1));
    });

    core.showBanner(`GOLD BOSS ${mode.bossCount}`);
  }

  function spawnGoldMidBoss(core){
    if (!window.MobShotSpawn || !window.MobShotSpawn.spawnMidBoss) return;

    const mode = core.state.eventMode;
    const diff = mode.difficulty || {};

    window.MobShotSpawn.spawnMidBoss(core.makeTools());

    core.state.entities.forEach(e => {
      if (e.kind !== 'midBoss') return;
      if (e.__goldStageMidBoss) return;

      e.__goldStageMidBoss = true;
      e.hp = Math.ceil(Number(e.hp || 1) * Number(diff.bossHpMul || 1));
      e.maxHp = e.hp;
      e.score = Math.ceil(Number(e.score || 0) * 0.45);
      e.coin = Math.ceil(Number(e.coin || 0) * Number(diff.bossCoinMul || 1));
    });

    core.showBanner('GOLD MID BOSS');
  }

  function spawnGoldChestWave(core, count){
    for (let i = 0; i < count; i++) {
      spawnGoldChest(core, i);
    }
  }

  function spawnGoldChest(core, i){
    const mode = core.state.eventMode;
    const diff = mode.difficulty || {};
    const chestMul = Number(diff.chestMul || 1);
    const gold = Math.random() < 0.2;

    const def = gold
      ? { name:'金の宝箱', image:'gimi/takagol.png', hp:10, score:60, coinMin:16, coinMax:34 }
      : { name:'銀の宝箱', image:'gimi/takagin.png', hp:6, score:30, coinMin:7, coinMax:18 };

    const hp = Math.ceil(def.hp * (0.9 + chestMul * 0.25));

    core.state.entities.push({
      kind: 'chest',
      name: def.name,
      image: def.image,
      x: core.rand(core.W * 0.18, core.W * 0.82),
      y: -80 - i * 58,
      vx: 0,
      vy: 2.05,
      w: 68,
      h: 62,
      hp,
      maxHp: hp,
      score: def.score,
      coinMin: Math.ceil(def.coinMin * chestMul),
      coinMax: Math.ceil(def.coinMax * chestMul),
      dead: false,
      bob: 0,
      __goldStageChest: true
    });
  }

  function spawnGoldBonusEnemy(core){
    if (!window.MobShotSpawn || !window.MobShotSpawn.spawnEnemy) return;

    const mode = core.state.eventMode;
    const diff = mode.difficulty || {};

    window.MobShotSpawn.spawnEnemy(core.makeTools());

    core.state.entities.forEach(e => {
      if (e.kind !== 'enemy') return;
      if (e.__goldStageEnemy) return;

      e.__goldStageEnemy = true;
      e.hp = Math.ceil(Number(e.hp || 1) * 0.85);
      e.maxHp = e.hp;
      e.coinMin = Math.ceil(Number(e.coinMin || 1) * Number(diff.chestMul || 1));
      e.coinMax = Math.ceil(Number(e.coinMax || 3) * Number(diff.chestMul || 1));
    });
  }

  function updateScoreAttackMode(core){
    const mode = core.state.eventMode;
    const bossAlive = core.state.entities.some(e => !e.dead && e.kind === 'boss');

    if (!bossAlive) {
      mode.scoreBossIndex = Number(mode.scoreBossIndex || 0) + 1;

      if (mode.scoreBossIndex >= (mode.scoreBossList || []).length) {
        core.finishRun(true);
        return;
      }

      core.state.entities = core.state.entities.filter(e =>
        e.kind !== 'enemyBullet' &&
        e.kind !== 'enemy'
      );

      mode.nextEnemy = core.frame + 80;
      mode.nextGate = core.frame + 20 * 60;

      spawnScoreAttackBoss(core);
      return;
    }

    if (core.frame >= Number(mode.nextEnemy || 0)) {
      if (window.MobShotSpawn && window.MobShotSpawn.spawnEnemy) {
        window.MobShotSpawn.spawnEnemy(core.makeTools());
      }

      mode.nextEnemy = core.frame + core.intRand(125, 185);
    }

    if (core.frame >= Number(mode.nextGate || 0)) {
      if (window.MobShotSpawn && window.MobShotSpawn.spawnGatePair) {
        window.MobShotSpawn.spawnGatePair(core.makeTools());
      }

      core.setGateEndAt(core.frame + 520);
      mode.nextGate = core.frame + 20 * 60;

      core.showBanner('BONUS GATE!');
    }

    clearExpiredGate(core);
  }

  function updateDoubleBossMode(core){
    const mode = core.state.eventMode;

    if (mode.doubleIntroTimer > 0) {
      mode.doubleIntroTimer--;
    }

    if (core.frame >= Number(mode.nextGate || 0)) {
      if (window.MobShotSpawn && window.MobShotSpawn.spawnGatePair) {
        window.MobShotSpawn.spawnGatePair(core.makeTools());
        core.showBanner('DOUBLE BONUS GATE!');
      }

      core.setGateEndAt(core.frame + 520);
      mode.nextGate = core.frame + 20 * 60;
    }

    clearExpiredGate(core);

    if (
      mode.doubleSpawned &&
      Number(mode.doubleKilled || 0) >= 2 &&
      !mode.doubleClearReady
    ) {
      mode.doubleClearReady = true;

      if (
        window.MobShotGameBossManager &&
        window.MobShotGameBossManager.doubleBossClearEffect
      ) {
        window.MobShotGameBossManager.doubleBossClearEffect(core);
      }

      setTimeout(function(){
        if (!core.isRunning() || core.isCommitted()) return;
        core.finishRun(true);
      }, 900);
    }
  }

  function clearExpiredGate(core){
    const gatesAlive = core.state.entities.some(e => e.kind === 'gate' && !e.dead);

    if (!gatesAlive && core.getGateEndAt() && core.frame > core.getGateEndAt()) {
      core.state.entities.forEach(e => {
        if (e.kind === 'gate') e.dead = true;
      });

      core.setGateEndAt(0);
    }
  }

  function tryDropGoldTicket(e, core){
    if (!e || e.kind !== 'chest') return;
    if (isGoldStageRun(core) || isScoreAttackRun(core) || isDoubleBossRun(core)) return;
    if (Math.random() > GOLD_TICKET_DROP_RATE) return;

    if (window.MobShotEvents && window.MobShotEvents.addGoldTicket) {
      window.MobShotEvents.addGoldTicket(1);
      core.addText('GOLD TICKET +1', e.x, e.y - 38, '#ffcf5b');
      core.burst(e.x, e.y, '#ffcf5b', 30);
    }
  }

  function onEntityKilled(e, core){
    tryDropGoldTicket(e, core);

    if (isGoldStageRun(core) && e) {
      if (e.kind === 'boss') {
        core.state.eventMode.nextBoss = core.frame + 95;

        if (Math.random() < 0.55) {
          spawnGoldChestWave(core, 1);
        }
      }

      if (e.kind === 'midBoss') {
        if (Math.random() < 0.45) {
          spawnGoldChestWave(core, 1);
        }
      }
    }

    if (isScoreAttackRun(core) && e && e.kind === 'boss') {
      core.addText('NEXT BOSS!', e.x, e.y - 70, '#6be6ff');
    }
  }

  function addDiamond(amount){
    if (!amount) return;

    try {
      const save = window.MobShotStorage && window.MobShotStorage.load
        ? window.MobShotStorage.load()
        : JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};

      save.diamond = Number(save.diamond || 0) + Number(amount || 0);

      if (window.MobShotStorage && window.MobShotStorage.save) {
        window.MobShotStorage.save(save);
      } else {
        localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
      }
    } catch(e) {}
  }

  function applyGoldStageClearReward(core){
    const diff = core.state.eventMode.difficulty || {};
    const key = diff.key || 'easy';

    const cleared =
      window.MobShotEvents &&
      window.MobShotEvents.hasGoldCleared &&
      window.MobShotEvents.hasGoldCleared(key);

    const coinReward = cleared ? Number(diff.clearCoin || 300) : Number(diff.firstCoin || 3000);
    const diamondReward = cleared ? 0 : Number(diff.firstDiamond || 0);

    core.state.coin += coinReward;
    addDiamond(diamondReward);

    if (window.MobShotEvents && window.MobShotEvents.markGoldCleared) {
      window.MobShotEvents.markGoldCleared(key);
    }

    return {
      coin: coinReward,
      diamond: diamondReward,
      first: !cleared
    };
  }

  function applyDoubleBossClearReward(core){
    const stage = core.state.eventMode.doubleStage || {};
    const diff = core.state.eventMode.doubleDifficulty || {};
    const difficultyKey = diff.key || 'veryHard';
    const stageId = Number(stage.id || 1);

    const cleared =
      window.MobShotEvents &&
      window.MobShotEvents.hasDoubleCleared &&
      window.MobShotEvents.hasDoubleCleared(difficultyKey, stageId);

    if (cleared) {
      return {
        coin: 0,
        diamond: 0,
        first: false
      };
    }

    const coinReward = Number(stage.final ? stage.firstCoin : diff.firstCoin || 0);
    const diamondReward = Number(stage.final ? stage.firstDiamond : diff.firstDiamond || 0);

    core.state.coin += coinReward;
    addDiamond(diamondReward);

    if (window.MobShotEvents && window.MobShotEvents.markDoubleCleared) {
      window.MobShotEvents.markDoubleCleared(difficultyKey, stageId);
    }

    return {
      coin: coinReward,
      diamond: diamondReward,
      first: true
    };
  }

  function beforeFinish(clear, core){
    const wasGold = isGoldStageRun(core);
    const wasScoreAttack = isScoreAttackRun(core);
    const wasDoubleBoss = isDoubleBossRun(core);

    if (!wasGold && !wasScoreAttack && !wasDoubleBoss) {
      return { event: false };
    }

    let text = '';

    if (clear && wasGold) {
      const diff = core.state.eventMode.difficulty || {};
      const reward = applyGoldStageClearReward(core);

      text =
        `GOLD STAGE ${diff.name || ''} 完了！ ` +
        `報酬 +${reward.coin.toLocaleString()} COIN` +
        `${reward.diamond ? ` / +${reward.diamond} DIAMOND` : ''}`;
    } else if (wasGold && !clear) {
      text = 'GOLD STAGE 失敗';
    } else if (clear && wasDoubleBoss) {
      const stage = core.state.eventMode.doubleStage || {};
      const diff = core.state.eventMode.doubleDifficulty || {};
      const reward = applyDoubleBossClearReward(core);

      const rewardText = reward.first
        ? `初回報酬 +${reward.coin.toLocaleString()} COIN / +${reward.diamond} DIAMOND`
        : 'クリア済み報酬なし';

      text = `ダブルボス ${diff.name || ''} ${stage.title || ''} クリア！ ${rewardText}`;
    } else if (wasDoubleBoss && !clear) {
      text = 'ダブルボス失敗';
    } else if (clear && wasScoreAttack) {
      text = `スコアアタック制覇！ ${(core.state.eventMode.scoreBossList || []).length}体撃破`;
    } else if (wasScoreAttack && !clear) {
      text = `スコアアタック終了 / ${Number(core.state.eventMode.scoreBossIndex || 0)}体撃破`;
    }

    if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
      window.MobShotEvents.clearCurrentEvent();
    }

    return {
      event: true,
      text
    };
  }

  function updateHud(core){
    injectHudStyle();

    if (!core.state.eventMode || !core.state.eventMode.active) {
      return false;
    }

    const mode = core.state.eventMode;

    if (core.hudStage) {
      if (isGoldStageRun(core)) {
        const remain = Math.max(0, Math.ceil((Number(mode.endFrame || 0) - core.frame) / 60));
        const diff = mode.difficulty || {};

        setHudDifficultyIcon(diff.key || diff.name);
        core.hudStage.textContent = `GOLD ${diff.name || ''} ${remain}`;
      } else if (isDoubleBossRun(core)) {
        const stage = mode.doubleStage || {};
        const diff = mode.doubleDifficulty || {};

        setHudDifficultyIcon(diff.key || diff.name);
        core.hudStage.textContent = `DOUBLE ${diff.name || ''} ${stage.id || ''}`;
      } else if (isScoreAttackRun(core)) {
        const now = Math.min(
          Number(mode.scoreBossIndex || 0) + 1,
          (mode.scoreBossList || []).length
        );

        const max = (mode.scoreBossList || []).length || 1;

        core.hudStage.textContent = `SCORE ${now}/${max}`;
      }
    }

    if (core.hudScore) core.hudScore.textContent = Math.floor(core.state.score).toLocaleString();
    if (core.hudCoin) core.hudCoin.textContent = Math.floor(core.state.coin).toLocaleString();
    if (core.hudLife) core.hudLife.textContent = Math.max(0, Math.ceil(core.state.hp));

    return true;
  }

  function draw(ctx, core){
    if (!isDoubleBossRun(core)) return;

    const t = Number(core.state.eventMode.doubleIntroTimer || 0);
    if (t <= 0) return;

    const alpha = Math.min(0.8, t / 120);

    ctx.save();

    ctx.globalAlpha = alpha * 0.38;
    ctx.fillStyle = '#160018';
    ctx.fillRect(0, 0, core.W, core.H);

    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.font = '900 32px system-ui';
    ctx.fillStyle = '#ffe66b';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 7;
    ctx.strokeText('DOUBLE BOSS', core.W / 2, core.H * 0.20);
    ctx.fillText('DOUBLE BOSS', core.W / 2, core.H * 0.20);

    ctx.restore();
  }

  window.MobShotGameEvents = {
    startCurrentEvent,
    startGoldStageMode,
    startScoreAttackMode,
    startDoubleBossMode,

    update,
    updateGoldStageMode,
    updateScoreAttackMode,
    updateDoubleBossMode,

    onEntityKilled,
    beforeFinish,
    updateHud,
    draw,

    setupStageArea,
    spawnScoreAttackBoss,
    spawnGoldBoss,
    spawnGoldMidBoss,
    spawnGoldChestWave,
    spawnGoldBonusEnemy,

    isGoldStageRun,
    isScoreAttackRun,
    isDoubleBossRun
  };
})();
