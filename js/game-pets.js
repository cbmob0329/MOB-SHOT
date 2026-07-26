'use strict';

(function(){
  let gameState = null;

  const petImages = new Map();
  const battlePets = [];
  const petBullets = [];
  const petTexts = [];
  const cutins = [];
  const supportEffects = [];

  /*
   * 通常ステージ用の共通バランス補正。
   * 弾数・演出・ペットごとの個性は維持し、実ダメージだけを抑える。
   */
  const NORMAL_ATTACK_GLOBAL_RATE = 0.55;
  const FIRST_SKILL_GLOBAL_RATE = 0.30;
  const SECOND_SKILL_GLOBAL_RATE = 0.32;
  const SECOND_SKILL_BOSS_EXTRA_RATE = 0.70;
  const SECOND_SKILL_EXPLOSION_RATE = 0.24;
  const FIRST_SKILL_BOSS_SAFETY_RATE = 0.72;

  const PET_BATTLE_VERSION = '20260727_game_pets_balance_v3';

  function img(src){
    if (!src) return null;

    if (!petImages.has(src)) {
      const image = new Image();
      image.src = src + '?v=' + PET_BATTLE_VERSION;
      petImages.set(src, image);
    }

    return petImages.get(src);
  }

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  }

  function level(pet){
    const cap = Number(pet.data.levelCap || pet.data.maxLevel || 50);
    return Math.max(1, Math.min(cap, Number(pet.data.level || 1)));
  }

  function plus(pet){
    return Math.max(0, Math.min(99, Number(pet.data.plus || pet.data.petRubyPlus || 0)));
  }

  function plusSkillTier(pet){
    return Math.floor(plus(pet) / 10);
  }

  function isBossTarget(target){
    return !!(target && (target.kind === 'boss' || target.kind === 'midBoss'));
  }

  function isObstacleTarget(target){
    return !!(target && (target.kind === 'gimmick' || target.kind === 'chest'));
  }

  function normalRate(pet){
    return (
      Number(pet.data.normalAttackRate || 0.5) *
      Number(pet.data.normalLevelRate || 1) *
      NORMAL_ATTACK_GLOBAL_RATE
    );
  }

  function skillRate(pet, baseRate, isSecond){
    const global = isSecond ? SECOND_SKILL_GLOBAL_RATE : FIRST_SKILL_GLOBAL_RATE;
    return Number(baseRate || 1) * Number(pet.data.skillLevelRate || 1) * global;
  }

  function currentSkillCt(pet){
    let ct = Math.max(3, Number(pet.data.currentSkillCt || pet.data.skillCt || 30));

    if (pet.data.key === 'mobstone') {
      ct = Math.max(55, ct);
    }

    return ct;
  }

  function currentSecondSkillCt(pet){
    const second = pet.data.secondSkill;
    let ct = Math.max(18, Number(pet.data.currentSecondSkillCt || second?.currentCt || second?.ct || 60));

    if (pet.data.key === 'mobstone') {
      ct = Math.max(98, ct);
    }

    return ct;
  }

  function normalWide(pet){
    let wide = 1 + Number(pet.data.normalWideBonus || 0);

    if (pet.data.key === 'mobstone') {
      wide = Math.min(3, wide);
    }

    return Math.max(1, wide);
  }

  function skillWide(pet){
    return 1 + Number(pet.data.skillWideBonus || 0);
  }

  function init(state){
    gameState = state;
    battlePets.length = 0;
    petBullets.length = 0;
    petTexts.length = 0;
    cutins.length = 0;
    supportEffects.length = 0;

    if (!window.MobShotPets || !window.MobShotPets.getEquippedPets) return;

    const equipped = window.MobShotPets.getEquippedPets().slice(0, 4);

    equipped.forEach((pet, index) => {
      const firstCt = pet.key === 'mobstone'
        ? Math.max(20, Number(pet.firstCt || 20))
        : Math.max(1, Number(pet.firstCt || 10));

      const secondFirstCt = pet.key === 'mobstone'
        ? Math.max(42, Number(pet.secondSkill?.firstCt || 42))
        : Math.max(18, Number(pet.secondSkill?.firstCt || 25));

      battlePets.push({
        data:pet,
        x:state.player.x,
        y:state.player.y,
        targetX:state.player.x,
        targetY:state.player.y,
        shootCd:initialShootCd(pet, index),
        skillCd:firstCt * 60,
        secondSkillCd:pet.secondSkillUnlocked && pet.secondSkill
          ? secondFirstCt * 60
          : 99999999,
        slotIndex:index,
        bob:Math.random() * Math.PI * 2
      });
    });
  }

  function initialShootCd(data, index){
    if (data.key === 'mobstone') {
      return 54 + index * 12;
    }

    return 18 + index * 9;
  }

  function update(){
    if (!gameState) return;

    updateSupportEffects();

    const player = gameState.player;

    battlePets.forEach((pet, index) => {
      if (index === 0) {
        pet.targetX = player.x - 58;
        pet.targetY = player.y + 18;
      } else if (index === 1) {
        pet.targetX = player.x + 58;
        pet.targetY = player.y + 18;
      } else if (index === 2) {
        pet.targetX = player.x - 82;
        pet.targetY = player.y + 50;
      } else {
        pet.targetX = player.x + 82;
        pet.targetY = player.y + 50;
      }

      pet.x += (pet.targetX - pet.x) * 0.18;
      pet.y += (pet.targetY - pet.y) * 0.18;
      pet.bob += 0.08;

      pet.shootCd--;

      if (pet.shootCd <= 0) {
        pet.shootCd = nextNormalShootCd(pet);
        normalShot(pet);
      }

      pet.skillCd--;

      if (pet.skillCd <= 0) {
        pet.skillCd = currentSkillCt(pet) * 60;
        skillShot(pet);
      }

      if (pet.data.secondSkillUnlocked && pet.data.secondSkill) {
        pet.secondSkillCd--;

        if (pet.secondSkillCd <= 0) {
          pet.secondSkillCd = currentSecondSkillCt(pet) * 60;
          secondSkillShot(pet);
        }
      }
    });

    updateBullets();
    updateTexts();
    updateCutins();
  }

  function nextNormalShootCd(pet){
    const rapid = Math.max(0.1, Number(pet.data.normalRateRate || 1) * getSupportRapidRate());
    let cd = Math.floor(30 / rapid);

    if (pet.data.key === 'mobstone') {
      cd = Math.floor(cd * 1.38);
      return Math.max(38, cd);
    }

    return Math.max(8, cd);
  }

  function validTarget(e){
    if (!gameState) return false;

    return e &&
      !e.dead &&
      e.kind !== 'gate' &&
      e.kind !== 'enemyBullet' &&
      e.hp != null &&
      e.y < gameState.player.y - 25;
  }

  function validBreakableBullet(e){
    return e &&
      !e.dead &&
      e.kind === 'enemyBullet' &&
      e.breakable &&
      Number(e.hp || 0) > 0;
  }

  function findTarget(pet){
    if (!gameState) return null;

    let nearest = null;
    let nearestDist = Infinity;

    gameState.entities.forEach(e => {
      if (!validTarget(e) && !validBreakableBullet(e)) return;

      const dx = e.x - pet.x;
      const dy = e.y - pet.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    });

    return nearest;
  }

  function getFrontTargets(){
    if (!gameState) return [];

    return gameState.entities
      .filter(e => validTarget(e) || validBreakableBullet(e))
      .sort((a, b) => b.y - a.y);
  }

  function normalShot(pet){
    const target = findTarget(pet);
    if (!target) return;

    const count = normalWide(pet);
    const baseDmg = gameState.power * normalRate(pet) * getSupportPowerRate();
    const key = pet.data.key;

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * normalOffsetWidth(pet);
      pushBullet(pet, target, baseDmg, 'normal', offset, {
        pierce:key === 'mobton' || !!pet.data.pierce,
        explode:key === 'mobmany' || !!pet.data.explode,
        wave:key === 'mobmany',
        homing:key === 'mobnero'
      });
    }
  }

  function normalOffsetWidth(pet){
    if (pet.data.key === 'mobstone') return 24;
    return 18;
  }

  function skillShot(pet){
    if (!gameState) return;

    showCutin(pet, false);

    const key = pet.data.key;

    if (key === 'mobslime') healPlayer(pet);
    if (key === 'chibimobtetsu' || key === 'mobshield') addShield(pet);

    if (key === 'wondamob') {
      addSupport('rapid', getWondaRapidRate(pet), 8 * 60);
      addSupport('power', getWondaPowerRate(pet), 8 * 60);
    }

    if (key === 'punimobpink') {
      addSupport('coin', getPuniCoinRate(pet), 8 * 60);
    }

    const targets = getFrontTargets();
    if (!targets.length && key !== 'mobslime' && key !== 'chibimobtetsu' && key !== 'wondamob' && key !== 'mobshield') return;

    const count = getSkillCount(pet);
    const wide = skillWide(pet);

    for (let i = 0; i < count; i++) {
      for (let w = 0; w < wide; w++) {
        const target = targets.length ? targets[(i + w) % targets.length] : null;
        if (!target || target.dead) continue;

        const rate = getSkillPowerRate(pet, target);
        const dmg = gameState.power * rate * getSupportPowerRate();
        const offset = (w - (wide - 1) / 2) * skillOffsetWidth(pet);

        pushBullet(pet, target, dmg, 'skill', offset, {
          image:getSkillImage(pet),
          pierce:key === 'mobton' || key === 'mobflare' || !!pet.data.pierce,
          explode:key === 'mobmany' || !!pet.data.explode,
          wave:key === 'mobmany',
          homing:key === 'mobnero'
        });
      }
    }

    petTexts.push({
      text:pet.data.skillName || 'PET SKILL',
      x:pet.x,
      y:pet.y - 34,
      life:50,
      color:bulletColor(pet.data, 'skill')
    });

    if (window.MobShotMission && window.MobShotMission.onSkillUsed) {
      window.MobShotMission.onSkillUsed();
    }
  }

  function skillOffsetWidth(pet){
    if (pet.data.key === 'mobstone') return 38;
    if (pet.data.key === 'mobton') return 34;
    return 26;
  }

  function getSkillImage(pet){
    return pet.data.skillAtkImage || pet.data.atkImage || '';
  }

  function secondSkillShot(pet){
    if (!gameState || !pet.data.secondSkillUnlocked || !pet.data.secondSkill) return;

    const second = normalizeSecondPattern(pet.data.secondSkill);
    const targets = getFrontTargets();

    showCutin(pet, true);

    if (second.heal) {
      gameState.hp = Math.min(gameState.maxHp || gameState.hp, gameState.hp + Number(second.heal || 0));
      petTexts.push({
        text:'HP +' + Number(second.heal || 0),
        x:gameState.player.x,
        y:gameState.player.y - 68,
        life:55,
        color:'#9dff73'
      });
    }

    if (second.barrierSec) addSupport('shield', 1, Number(second.barrierSec || 3) * 60);

    if (second.petRapidBuffSec) {
      addSupport('rapid', Number(second.petRapidBuffRate || 1.15), Number(second.petRapidBuffSec || 8) * 60);
    }

    if (second.coinBonusRate) {
      addSupport('coin', 1 + Number(second.coinBonusRate || 0), 10 * 60);
    }

    if (!targets.length && !second.heal && !second.barrierSec && !second.petRapidBuffSec) return;

    const count = Math.max(1, Number(second.count || 1));
    const pattern = second.pattern || 'burst';

    if (pattern === 'support' || pattern === 'shield' || pattern === 'buff') {
      supportSecondBullets(pet, targets, second, count);
    } else if (pattern === 'wide' || pattern === 'fan') {
      fanSecondBullets(pet, targets, second, count);
    } else if (pattern === 'circle') {
      circleSecondBullets(pet, targets, second, count);
    } else if (pattern === 'side') {
      sideSecondBullets(pet, targets, second, count);
    } else if (pattern === 'bigshot' || pattern === 'crush' || pattern === 'laser') {
      bigSecondBullets(pet, targets, second, count);
    } else if (pattern === 'bubble' || pattern === 'drain') {
      fanSecondBullets(pet, targets, second, count);
    } else {
      homingSecondBullets(pet, targets, second, count);
    }

    petTexts.push({
      text:second.name || 'SECOND SKILL',
      x:pet.x,
      y:pet.y - 44,
      life:60,
      color:bulletColorForSecond(pet, second)
    });

    if (window.MobShotMission && window.MobShotMission.onSkillUsed) {
      window.MobShotMission.onSkillUsed();
    }
  }

  function normalizeSecondPattern(second){
    const copy = Object.assign({}, second || {});
    const raw = copy.pattern || 'burst';

    if (raw === 'meteor') {
      copy.pattern = 'bigshot';
    } else if (raw === 'rain') {
      copy.pattern = 'fan';
    }

    return copy;
  }

  function supportSecondBullets(pet, targets, second, count){
    if (!targets.length) return;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const offset = (i - (count - 1) / 2) * 18;
      pushSecondBullet(pet, target, second, offset, { speed:6.0 });
    }
  }

  function fanSecondBullets(pet, targets, second, count){
    if (!targets.length) return;

    const center = targets[0];
    const spread = second.pattern === 'wide' ? 34 : 28;

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * spread;
      const target = targets[i % targets.length] || center;

      pushSecondBullet(pet, target, second, offset, {
        aimOffsetX:offset * 1.35,
        speed:second.pattern === 'wide' ? 5.9 : 5.4,
        startJitterY:(i % 3) * -8
      });
    }
  }

  function circleSecondBullets(pet, targets, second, count){
    if (!targets.length) return;

    const cx = pet.x;
    const cy = pet.y - 18;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const angle = (Math.PI * 2 / count) * i;
      const sx = cx + Math.cos(angle) * 34;
      const sy = cy + Math.sin(angle) * 34;

      pushSecondBullet(pet, target, second, 0, {
        x:sx,
        y:sy,
        speed:5.7
      });
    }
  }

  function sideSecondBullets(pet, targets, second, count){
    if (!targets.length) return;

    const W = gameState.width || gameState.w || window.innerWidth || 390;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const left = i % 2 === 0;
      const sx = left ? 18 : W - 18;
      const sy = Math.max(50, Math.min((gameState.height || window.innerHeight || 720) - 180, target.y + random(-80, 30)));

      pushSecondBullet(pet, target, second, 0, {
        x:sx,
        y:sy,
        speed:6.2
      });
    }
  }

  function bigSecondBullets(pet, targets, second, count){
    if (!targets.length) return;

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const offset = (i - (count - 1) / 2) * bigSecondOffset(second);

      pushSecondBullet(pet, target, second, offset, {
        speed:second.pattern === 'laser' ? 7.0 : bigSecondSpeed(pet, second),
        radiusBoost:second.pattern === 'laser' ? 1.75 : bigSecondRadiusBoost(pet, second),
        aimOffsetX:offset * 0.75,
        startJitterY:(i % 2) * -12
      });
    }
  }

  function bigSecondOffset(second){
    if (second.pattern === 'laser') return 36;
    if (second.pattern === 'crush') return 40;
    return 42;
  }

  function bigSecondSpeed(pet, second){
    if (pet.data.key === 'mobstone') return 4.0;
    if (second.pattern === 'crush') return 4.7;
    return 4.3;
  }

  function bigSecondRadiusBoost(pet, second){
    if (pet.data.key === 'mobstone') return 1.22;
    if (second.pattern === 'crush') return 1.30;
    return 1.35;
  }

  function homingSecondBullets(pet, targets, second, count){
    if (!targets.length) return;

    if (second.pattern === 'hero') {
      const mainCount = Math.max(1, Math.floor(count / 2));
      const subCount = Math.max(1, count - mainCount);

      for (let i = 0; i < mainCount; i++) {
        const target = targets[i % targets.length];
        const offset = (i - (mainCount - 1) / 2) * 22;

        pushSecondBullet(pet, target, second, offset, {
          speed:5.8
        });
      }

      for (let i = 0; i < subCount; i++) {
        const target = targets[i % targets.length];

        pushSecondBullet(pet, target, second, random(-40, 40), {
          speed:7.0,
          radiusBoost:0.65,
          damageRate:0.55
        });
      }

      return;
    }

    for (let i = 0; i < count; i++) {
      const target = targets[i % targets.length];
      const offset = (i - (count - 1) / 2) * 20;

      pushSecondBullet(pet, target, second, offset, {
        speed:second.pattern === 'rapid' ? 7.4 : 5.8
      });
    }
  }

  function pushSecondBullet(pet, target, second, offset, opt){
    if (!target) return;

    opt = opt || {};

    const sx = opt.x != null ? opt.x : pet.x + Number(offset || 0);
    const sy = opt.y != null ? opt.y : pet.y - 12 + Number(opt.startJitterY || 0);
    const tx = target.x + Number(opt.aimOffsetX || 0);
    const ty = target.y;

    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const speed = Number(opt.speed || 5.6);

    const rate = secondPowerRate(pet, second, target) * Number(opt.damageRate || 1);
    const dmg = gameState.power * rate * getSupportPowerRate();
    const radius = secondRadius(second) * Number(opt.radiusBoost || 1);

    petBullets.push({
      x:sx,
      y:sy,
      vx:dx / len * speed,
      vy:dy / len * speed,
      r:radius,
      damage:dmg,
      target,
      type:'second',
      life:150,
      color:bulletColorForSecond(pet, second),
      image:second.atkImage || pet.data.atkImage || '',
      htmlBullet:second.htmlBullet || pet.data.htmlBullet || '',
      petKey:pet.data.key,
      second:true,
      pierce:!!second.pierce || second.pattern === 'laser',
      explode:!!second.explode || pet.data.key === 'mobmany',
      wave:pet.data.key === 'mobmany' || second.pattern === 'bubble',
      homing:second.pattern === 'homing',
      drainRate:Number(second.drainRate || 0),
      phase:Math.random() * Math.PI * 2,
      hitIds:new Set()
    });
  }

  function secondPowerRate(pet, second, target){
    let rate = Number(second.powerRate || 1);

    if (isObstacleTarget(target)) {
      rate = Number(second.obstacleRate || rate);
    }

    if (isBossTarget(target)) {
      rate = Number(second.bossRate || rate);
      rate *= SECOND_SKILL_BOSS_EXTRA_RATE;
    }

    if (target && target.kind === 'enemyBullet') {
      rate = Number(second.bulletRate || rate);
    }

    if (pet.data.key === 'mobstone') {
      rate *= 0.88;
    }

    return skillRate(pet, rate, true);
  }

  function secondRadius(second){
    const size = second.size || 'normal';

    if (size === 'small') return 10;
    if (size === 'normal') return 16;
    if (size === 'big') return 24;
    if (size === 'huge') return 36;

    return 16;
  }

  function random(a, b){
    return a + Math.random() * (b - a);
  }

  function getWondaRapidRate(pet){
    const lv = level(pet);
    const tier = plusSkillTier(pet);

    let rate = 1.15;
    if (lv >= 5) rate = 1.23;
    if (lv >= 30) rate = 1.35;
    if (lv >= 50) rate = 1.42;

    return rate + tier * 0.01;
  }

  function getWondaPowerRate(pet){
    const lv = level(pet);
    const tier = plusSkillTier(pet);

    let rate = 1;
    if (lv >= 15) rate = 1.08;
    if (lv >= 25) rate = 1.12;
    if (lv >= 50) rate = 1.18;

    return rate + tier * 0.006;
  }

  function getPuniCoinRate(pet){
    const lv = level(pet);
    const tier = plusSkillTier(pet);

    let rate = 2.0;
    if (lv >= 5) rate = 2.5;
    if (lv >= 30) rate = 2.75;
    if (lv >= 50) rate = 3.0;

    return rate + tier * 0.03;
  }

  function getSkillCount(pet){
    const lv = level(pet);
    const key = pet.data.key;
    const tier = plusSkillTier(pet);
    let count = Number(pet.data.skillBaseCount || 1);

    if (key === 'mobdrago') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 10;
      if (lv >= 50) count = 12;
    } else if (key === 'mobfrog') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 5;
      if (lv >= 50) count = 6;
    } else if (key === 'mobdenden') {
      if (lv >= 5) count += 2;
      if (lv >= 30) count = 14;
      if (lv >= 50) count = 16;
    } else if (key === 'mobwolf') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 8;
      if (lv >= 50) count = 9;
    } else if (key === 'mobstone') {
      if (lv >= 30) count = 2;
      if (lv >= 50) count = 3;
    } else if (key === 'mobslime') {
      if (lv >= 30) count = 5;
    } else if (key === 'mobchibihawk') {
      if (lv >= 30) count = 2;
      if (lv >= 50) count = 3;
    } else if (key === 'punimobpink') {
      if (lv >= 30) count = 10;
      if (lv >= 50) count = 12;
    } else if (key === 'minimiramob') {
      if (lv >= 5) count += 2;
      if (lv >= 25) count += 2;
      if (lv >= 30) count = 10;
      if (lv >= 50) count = 12;
    } else if (key === 'mobshield') {
      if (lv >= 30) count = 2;
      if (lv >= 50) count = 3;
    } else if (key === 'neonkidmob') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 4;
      if (lv >= 50) count = 5;
    } else if (key === 'minidramob') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 3;
      if (lv >= 50) count = 4;
    } else if (key === 'mobnero') {
      if (lv >= 10) count = 6;
      if (lv >= 20) count = 7;
      if (lv >= 30) count = 8;
      if (lv >= 40) count = 9;
      if (lv >= 50) count = 10;
    } else if (key === 'mobton') {
      if (lv >= 30) count = 2;
      if (lv >= 40) count = 3;
      if (lv >= 50) count = 5;
    } else if (key === 'mobmany') {
      if (lv >= 30) count = 2;
      if (lv >= 40) count = 3;
      if (lv >= 50) count = 4;
    } else if (key === 'babymob') {
      if (lv >= 10) count = 30;
      if (lv >= 20) count = 35;
      if (lv >= 30) count = 40;
      if (lv >= 40) count = 45;
      if (lv >= 50) count = 60;
    } else if (key === 'merurumob') {
      if (lv >= 15) count += 2;
      if (lv >= 30) count = 6;
      if (lv >= 50) count = 7;
    } else if (key === 'lilmoblilith') {
      if (lv >= 5) count += 2;
      if (lv >= 25) count += 3;
      if (lv >= 30) count = 14;
      if (lv >= 50) count = 16;
    } else if (key === 'chibimaohmob') {
      if (lv >= 30) count = 2;
      if (lv >= 50) count = 3;
    } else if (key === 'chibimobtetsu') {
      if (lv >= 50) count = 2;
    } else if (key === 'chibimobmelt') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 3;
      if (lv >= 50) count = 4;
    } else if (key === 'wondamob') {
      if (lv >= 50) count = 2;
    } else if (key === 'mobflare') {
      if (lv >= 10) count = 12;
      if (lv >= 20) count = 15;
      if (lv >= 30) count = 18;
      if (lv >= 40) count = 21;
      if (lv >= 50) count = 27;
    } else if (key === 'lilmobnep') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 5;
      if (lv >= 50) count = 6;
    } else if (key === 'chibiulmob') {
      if (lv >= 5) count += 2;
      if (lv >= 25) count += 3;
      if (lv >= 30) count = 13;
      if (lv >= 50) count = 15;
    } else if (key === 'hero') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 4;
      if (lv >= 50) count = 5;
    }

    count += Math.floor(tier / 5);

    return Math.max(1, count);
  }

  function getSkillPowerRate(pet, target){
    const lv = level(pet);
    const key = pet.data.key;
    let rate = Number(pet.data.skillPowerRate || 1);

    if (isObstacleTarget(target)) {
      rate = Number(pet.data.skillObstacleRate || rate);
    }

    if (isBossTarget(target)) {
      rate = Number(pet.data.skillBossRate || rate);
    }

    if (target && target.kind === 'enemyBullet') {
      rate = Number(pet.data.skillBulletRate || rate);
    }

    if (key === 'mobdrago') {
      if (lv >= 50) rate = 1.62;
      else if (lv >= 30) rate = 1.44;
    }

    if (key === 'mobfrog') {
      if (lv >= 50) rate = isObstacleTarget(target) ? 3.85 : 2.55;
      else if (lv >= 30) rate = isObstacleTarget(target) ? 3.35 : 2.28;
    }

    if (key === 'mobdenden') {
      if (lv >= 50) rate = 0.96;
      else if (lv >= 30) rate = 0.86;
    }

    if (key === 'mobwolf') {
      if (lv >= 50) rate = isBossTarget(target) ? 3.45 : 2.22;
      else if (lv >= 30) rate = isBossTarget(target) ? 3.00 : 1.95;
    }

    if (key === 'mobstone') {
      if (lv >= 30) rate *= 1.08;
      if (lv >= 50) rate *= 1.16;
      rate *= 0.94;
    }

    if (key === 'mobslime') {
      if (lv >= 50) rate = 1.25;
      else if (lv >= 30) rate = 1.07;
    }

    if (key === 'mobchibihawk') {
      rate = lv >= 50 ? 5.75 : lv >= 30 ? 5.20 : lv >= 5 ? 3.15 : 2.80;
    }

    if (key === 'punimobpink') {
      if (lv >= 50) rate = 1.34;
      else if (lv >= 30) rate = 1.16;
    }

    if (key === 'minimiramob') {
      if (lv >= 50) rate = 1.72;
      else if (lv >= 30) rate = 1.48;
    }

    if (key === 'mobshield') {
      if (lv >= 20) rate *= 1.14;
      if (lv >= 50) rate *= 1.26;
    }

    if (key === 'neonkidmob') {
      if (lv >= 50) rate = 2.18;
      else if (lv >= 30) rate = 1.95;
    }

    if (key === 'minidramob') {
      if (lv >= 50) rate = 5.75;
      else if (lv >= 30) rate = 5.10;
    }

    if (key === 'mobnero') {
      if (lv >= 30) rate *= 1.12;
      if (lv >= 50) rate *= 1.24;
    }

    if (key === 'mobton') {
      if (lv >= 20) rate = 4.15;
      if (lv >= 50) rate = 4.82;
    }

    if (key === 'mobmany') {
      if (lv >= 20) rate = 5.35;
      if (lv >= 50) rate = 6.10;
    }

    if (key === 'babymob') {
      if (lv >= 30) rate = 0.80;
      if (lv >= 50) rate = 0.90;
    }

    if (key === 'merurumob') {
      if (lv >= 50) rate = 2.55;
      else if (lv >= 30) rate = 2.27;
    }

    if (key === 'lilmoblilith') {
      if (lv >= 50) rate = 1.80;
      else if (lv >= 30) rate = 1.62;
    }

    if (key === 'chibimaohmob') {
      rate = lv >= 50 ? 7.50 : lv >= 30 ? 6.75 : lv >= 5 ? 4.85 : 4.45;
    }

    if (key === 'chibimobtetsu') {
      if (lv >= 50) rate = 1.02;
    }

    if (key === 'chibimobmelt') {
      if (lv >= 50) rate = isObstacleTarget(target) ? 6.65 : 4.82;
      else if (lv >= 30) rate = isObstacleTarget(target) ? 5.95 : 4.35;
    }

    if (key === 'wondamob') {
      if (lv >= 50) rate = 1.04;
    }

    if (key === 'mobflare') {
      if (lv >= 30) rate *= 1.12;
      if (lv >= 50) rate *= 1.28;
    }

    if (key === 'lilmobnep') {
      if (lv >= 50) rate = 3.42;
      else if (lv >= 30) rate = 3.06;
    }

    if (key === 'chibiulmob') {
      if (lv >= 50) rate = 2.60;
      else if (lv >= 30) rate = 2.32;
    }

    if (key === 'hero') {
      if (lv >= 50) rate = 6.65;
      else if (lv >= 30) rate = 5.95;
    }

    /*
     * +強化によるスキル補正はpets.js側のskillLevelRateへ
     * すでに含まれているため、ここでは重ねて掛けない。
     */

    if (isBossTarget(target)) {
      rate *= FIRST_SKILL_BOSS_SAFETY_RATE;
    }

    return skillRate(pet, rate, false);
  }

  function pushBullet(pet, target, damage, type, offset, opt){
    if (!target) return;

    opt = opt || {};

    const sx = pet.x + Number(offset || 0);
    const sy = pet.y - 8;
    const dx = target.x - sx;
    const dy = target.y - sy;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const speed = getBulletSpeed(pet, type);

    petBullets.push({
      x:sx,
      y:sy,
      vx:dx / len * speed,
      vy:dy / len * speed,
      r:getBulletRadius(pet, type),
      damage,
      target,
      type,
      life:type === 'skill' ? 125 : 78,
      color:bulletColor(pet.data, type),
      image:opt.image != null ? opt.image : (pet.data.atkImage || ''),
      htmlBullet:pet.data.htmlBullet || '',
      petKey:pet.data.key,
      pierce:!!opt.pierce,
      explode:!!opt.explode,
      wave:!!opt.wave,
      homing:!!opt.homing,
      phase:Math.random() * Math.PI * 2,
      hitIds:new Set()
    });
  }

  function getBulletSpeed(pet, type){
    const key = pet.data.key;
    const lv = level(pet);
    let speed = type === 'skill' ? 5.6 : 7.4;

    if (key === 'mobstone') speed = type === 'skill' ? 3.0 : 4.4;
    if (key === 'mobton') speed = type === 'skill' ? 6.9 : 8.2;
    if (key === 'mobnero') speed = type === 'skill' ? 6.6 : 7.2;
    if (key === 'mobmany') speed = type === 'skill' ? 3.8 : 5.6;
    if (key === 'babymob') speed = type === 'skill' ? 8.2 : 7.8;
    if (key === 'mobflare') speed = type === 'skill' ? 6.7 : 6.5;

    if (type === 'skill') {
      if (key === 'mobdrago' && lv >= 15) speed *= 1.12;
      if (key === 'mobchibihawk' && lv >= 25) speed *= 1.35;
      if (key === 'lilmobnep' && lv >= 25) speed *= 1.18;
      if (key === 'neonkidmob' && lv >= 25) speed *= 1.15;
      if (lv >= 50) speed *= 1.06;
    }

    return speed;
  }

  function getBulletRadius(pet, type){
    const key = pet.data.key;
    const lv = level(pet);
    let r = type === 'skill' ? 18 : 5;

    if (pet.data.atkImage && type === 'skill') r = 22;

    if (key === 'mobstone') r = type === 'skill' ? 38 : 9;
    if (key === 'mobshield') r = type === 'skill' ? 26 : 10;
    if (key === 'mobnero') r = type === 'skill' ? 18 : 7;
    if (key === 'mobton') r = type === 'skill' ? 34 : 8;
    if (key === 'mobmany') r = type === 'skill' ? 38 : 8;
    if (key === 'babymob') r = type === 'skill' ? 8 : 5;
    if (key === 'mobflare') r = type === 'skill' ? 18 : 9;

    if (key === 'chibimaohmob' && type === 'skill') r = 32;
    if (key === 'minidramob' && type === 'skill') r = 28;
    if (key === 'lilmobnep' && type === 'skill' && lv >= 15) r *= 1.25;
    if (key === 'hero' && type === 'skill' && lv >= 25) r *= 1.35;
    if (key === 'chibimobmelt' && type === 'skill' && lv >= 25) r *= 1.25;
    if (type === 'skill' && lv >= 50) r *= 1.06;

    return r;
  }

  function bulletColor(data, type){
    const key = data.key;

    if (data.htmlBullet === 'fire') return type === 'skill' ? '#ff6530' : '#ffb347';
    if (data.htmlBullet === 'water') return type === 'skill' ? '#4bd8ff' : '#69dfff';
    if (data.htmlBullet === 'thunder') return type === 'skill' ? '#ffe84a' : '#fff35a';
    if (data.htmlBullet === 'gray') return type === 'skill' ? '#d8f1ff' : '#e8f4ff';

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

    return type === 'skill' ? '#ffffff' : '#dfe8ff';
  }

  function bulletColorForSecond(pet, second){
    if (second.htmlBullet === 'fire') return '#ff6530';
    if (second.htmlBullet === 'water') return '#4bd8ff';
    if (second.htmlBullet === 'thunder') return '#ffe84a';
    if (second.htmlBullet === 'gray') return '#d8f1ff';

    return bulletColor(pet.data, 'skill');
  }

  function updateBullets(){
    for (const b of petBullets) {
      if (b.dead) continue;

      if (b.homing && b.target && !b.target.dead) {
        const dx = b.target.x - b.x;
        const dy = b.target.y - b.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const speed = Math.max(2.5, Math.hypot(b.vx, b.vy));
        b.vx = b.vx * 0.88 + (dx / len * speed) * 0.12;
        b.vy = b.vy * 0.88 + (dy / len * speed) * 0.12;
      }

      if (b.wave) {
        b.phase += 0.12;
        b.x += Math.sin(b.phase) * 1.4;
      }

      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if (validBreakableBullet(b.target)) {
        const target = b.target;
        const hitRadius = target.r || 8;

        if (Math.hypot(b.x - target.x, b.y - target.y) < hitRadius + b.r) {
          if (!b.hitIds) b.hitIds = new Set();

          if (!b.hitIds.has(target)) {
            b.hitIds.add(target);
            damageBreakableBullet(target, b);
          }

          if (!b.pierce) {
            b.dead = true;
          } else {
            b.damage *= 0.72;
            b.target = findNextTarget(b, target);

            if (!b.target) b.dead = true;
          }
        }

        if (b.life <= 0) b.dead = true;
        continue;
      }

      if (!validTarget(b.target)) {
        if (b.pierce || b.explode) {
          hitNearbyTargets(b);
        } else {
          b.dead = true;
        }

        if (b.life <= 0) b.dead = true;
        continue;
      }

      const target = b.target;
      const hitRadius = target.r || Math.max(target.w || 40, target.h || 40) / 2;

      if (Math.hypot(b.x - target.x, b.y - target.y) < hitRadius + b.r) {
        if (!b.hitIds) b.hitIds = new Set();

        if (!b.hitIds.has(target)) {
          b.hitIds.add(target);
          damageTarget(target, b.damage, b);

          if (b.explode) explodeBullet(b, target.x, target.y);
        }

        if (!b.pierce) {
          b.dead = true;
        } else {
          b.damage *= 0.72;
          b.target = findNextTarget(b, target);

          if (!b.target) b.dead = true;
        }
      }

      if (b.life <= 0) b.dead = true;
    }

    for (let i = petBullets.length - 1; i >= 0; i--) {
      if (petBullets[i].dead) petBullets.splice(i, 1);
    }
  }

  function hitNearbyTargets(b){
    if (!gameState || b.dead) return;

    if (!b.hitIds) b.hitIds = new Set();

    for (const target of gameState.entities) {
      if (!validTarget(target) && !validBreakableBullet(target)) continue;
      if (b.hitIds.has(target)) continue;

      const hitRadius = target.r || Math.max(target.w || 40, target.h || 40) / 2;
      if (Math.hypot(b.x - target.x, b.y - target.y) >= hitRadius + b.r) continue;

      b.hitIds.add(target);

      if (validBreakableBullet(target)) {
        damageBreakableBullet(target, b);
      } else {
        damageTarget(target, b.damage, b);
      }

      if (b.explode) explodeBullet(b, target.x, target.y);

      if (!b.pierce) {
        b.dead = true;
        break;
      }

      b.damage *= 0.72;
    }

    if (b.pierce && !b.dead && (!b.target || b.target.dead || b.hitIds.has(b.target))) {
      b.target = findNextTarget(b, b.target || null);
      if (!b.target) b.dead = true;
    }
  }

  function findNextTarget(b, oldTarget){
    if (!gameState) return null;

    let nearest = null;
    let nearestDist = Infinity;

    gameState.entities.forEach(e => {
      if (e === oldTarget) return;
      if (b.hitIds && b.hitIds.has(e)) return;
      if (!validTarget(e) && !validBreakableBullet(e)) return;

      const d = Math.hypot(e.x - b.x, e.y - b.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    });

    return nearest;
  }

  function explodeBullet(b, x, y){
    if (!gameState || b.__exploded) return;
    b.__exploded = true;

    const radius = b.type === 'second' ? b.r * 3.2 : b.r * 2.6;
    const damage = Number(b.damage || 0) * (b.type === 'second' ? SECOND_SKILL_EXPLOSION_RATE : 0.45);

    petTexts.push({
      text:'BOMB',
      x,
      y:y - 20,
      life:30,
      color:b.color || '#fff'
    });

    gameState.entities.forEach(target => {
      if (!validTarget(target) && !validBreakableBullet(target)) return;
      if (target === b.target) return;

      const hitRadius = target.r || Math.max(target.w || 40, target.h || 40) / 2;

      if (Math.hypot(x - target.x, y - target.y) <= radius + hitRadius) {
        if (validBreakableBullet(target)) {
          damageBreakableBullet(target, Object.assign({}, b, { damage }));
        } else {
          damageTarget(target, damage, b);
        }
      }
    });
  }

  function damageBreakableBullet(target, bullet){
    if (!target || target.dead) return;

    const damage = Math.max(1, Number(bullet.damage || 1));
    target.hp = Number(target.hp || 1) - damage;

    petTexts.push({
      text:'-' + Math.ceil(damage),
      x:target.x,
      y:target.y - 12,
      life:26,
      color:'#9deeff'
    });

    if (target.hp <= 0) {
      target.dead = true;
      petTexts.push({
        text:'BREAK',
        x:target.x,
        y:target.y - 26,
        life:28,
        color:'#9deeff'
      });
    }
  }

  function damageTarget(target, damage, bullet){
    if (!target || target.dead) return;

    target.hp -= damage;

    petTexts.push({
      text:'-' + Math.ceil(damage),
      x:target.x,
      y:target.y - 18,
      life:28,
      color:bullet ? bullet.color : '#ffffff'
    });

    if (bullet && bullet.petKey === 'merurumob') {
      vampHeal(damage, levelFromKey('merurumob'), plusFromKey('merurumob'));
    }

    if (bullet && bullet.drainRate) {
      const heal = Math.max(1, Math.floor(Number(damage || 0) * Number(bullet.drainRate || 0)));
      gameState.hp = Math.min(gameState.maxHp || gameState.hp, gameState.hp + heal);
    }

    if (target.hp <= 0) {
      if (window.MobShotGameCore && window.MobShotGameCore.killEntity) {
        window.MobShotGameCore.killEntity(target);
      } else {
        target.dead = true;
      }
    }
  }

  function levelFromKey(key){
    const pet = battlePets.find(p => p.data.key === key);
    return pet ? level(pet) : 1;
  }

  function plusFromKey(key){
    const pet = battlePets.find(p => p.data.key === key);
    return pet ? plus(pet) : 0;
  }

  function healPlayer(pet){
    if (!gameState) return;

    const lv = level(pet);
    const tier = plusSkillTier(pet);
    let heal = 15;

    if (lv >= 5) heal = 20;
    if (lv >= 30) heal = 45;
    if (lv >= 50) heal = 60;

    heal += tier * 2;

    gameState.hp = Math.min(gameState.maxHp || gameState.hp, gameState.hp + heal);

    petTexts.push({
      text:'HP +' + heal,
      x:gameState.player.x,
      y:gameState.player.y - 58,
      life:50,
      color:'#9dff73'
    });

    if (lv >= 25 || plus(pet) >= 30) addShield(pet);
  }

  function vampHeal(damage, lv, plusValue){
    if (!gameState) return;

    const tier = Math.floor(Number(plusValue || 0) / 10);
    let rate = 0;

    if (lv >= 5) rate = 0.02;
    if (lv >= 25) rate = 0.07;
    if (lv >= 30) rate = 0.10;
    if (lv >= 50) rate = 0.12;

    rate += tier * 0.002;

    if (rate <= 0) return;

    const heal = Math.max(1, Math.floor(Number(damage || 0) * rate));
    gameState.hp = Math.min(gameState.maxHp || gameState.hp, gameState.hp + heal);
  }

  function addShield(pet){
    const lv = level(pet);
    const tier = plusSkillTier(pet);
    let duration = 3;

    if (lv >= 5) duration = 4;
    if (lv >= 25) duration = 5;
    if (lv >= 30) duration = 6;
    if (lv >= 50) duration = 7;

    if (pet.data.key === 'mobshield') {
      duration = 5;
      if (lv >= 30) duration = 6;
      if (lv >= 50) duration = 7;
    }

    duration += Math.floor(tier / 5);

    addSupport('shield', 1, duration * 60);

    petTexts.push({
      text:'SHIELD',
      x:gameState.player.x,
      y:gameState.player.y - 72,
      life:50,
      color:'#dfe8ff'
    });
  }

  function addSupport(type, value, frames){
    supportEffects.push({ type, value, frames });
  }

  function updateSupportEffects(){
    for (const e of supportEffects) e.frames--;

    for (let i = supportEffects.length - 1; i >= 0; i--) {
      if (supportEffects[i].frames <= 0) supportEffects.splice(i, 1);
    }
  }

  function getSupportRapidRate(){
    let rate = 1;

    supportEffects.forEach(e => {
      if (e.type === 'rapid') rate = Math.max(rate, Number(e.value || 1));
    });

    return rate;
  }

  function getSupportPowerRate(){
    let rate = 1;

    supportEffects.forEach(e => {
      if (e.type === 'power') rate = Math.max(rate, Number(e.value || 1));
    });

    return rate;
  }

  function getCoinMultiplier(){
    let rate = 1;

    supportEffects.forEach(e => {
      if (e.type === 'coin') rate = Math.max(rate, Number(e.value || 1));
    });

    return rate;
  }

  function updateTexts(){
    for (const t of petTexts) {
      t.y -= 0.8;
      t.life--;
    }

    for (let i = petTexts.length - 1; i >= 0; i--) {
      if (petTexts[i].life <= 0) petTexts.splice(i, 1);
    }
  }

  function showCutin(pet, isSecond){
    const plusText = plus(pet) > 0 ? ` +${plus(pet)}` : '';
    const second = pet.data.secondSkill;

    cutins.push({
      name:pet.data.name + plusText,
      skill:isSecond && second ? second.name : (pet.data.skillName || 'PET SKILL'),
      image:pet.data.frontImage || pet.data.backImage,
      life:isSecond ? 72 : 58,
      maxLife:isSecond ? 72 : 58,
      second:!!isSecond
    });
  }

  function updateCutins(){
    for (const c of cutins) c.life--;

    for (let i = cutins.length - 1; i >= 0; i--) {
      if (cutins[i].life <= 0) cutins.splice(i, 1);
    }
  }

  function draw(ctx){
    drawBullets(ctx);
    drawPets(ctx);
    drawTexts(ctx);
    drawCutins(ctx);
    drawShield(ctx);
  }

  function drawPets(ctx){
    battlePets.forEach(pet => {
      const image = img(pet.data.backImage || pet.data.frontImage);
      const y = pet.y + Math.sin(pet.bob) * 3;

      ctx.save();

      ctx.fillStyle = 'rgba(0,0,0,.22)';
      ctx.beginPath();
      ctx.ellipse(pet.x, y + 20, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      if (imageReady(image)) {
        ctx.drawImage(image, pet.x - 25, y - 28, 50, 50);
      } else {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pet.x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (plus(pet) > 0) {
        ctx.font = '900 10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff7dff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('+' + plus(pet), pet.x, y - 30);
        ctx.fillText('+' + plus(pet), pet.x, y - 30);
      }

      if (pet.data.secondSkillUnlocked) {
        ctx.font = '900 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe66b';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('Ⅱ', pet.x + 18, y - 24);
        ctx.fillText('Ⅱ', pet.x + 18, y - 24);
      }

      ctx.restore();
    });
  }

  function drawBullets(ctx){
    petBullets.forEach(b => {
      ctx.save();

      const image = img(b.image);

      if (imageReady(image)) {
        const size = b.type === 'second' ? b.r * 4.2 : (b.type === 'skill' ? b.r * 3.5 : b.r * 2.8);
        ctx.drawImage(image, b.x - size / 2, b.y - size / 2, size, size);
      } else {
        drawHtmlBullet(ctx, b);
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

  function drawHtmlBullet(ctx, b){
    ctx.fillStyle = b.color;
    ctx.strokeStyle = '#111';
    ctx.lineWidth = b.type === 'second' ? 4 : (b.type === 'skill' ? 3 : 2);

    if (b.type === 'second') {
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (b.htmlBullet === 'fire') {
      ctx.fillStyle = b.type === 'second' ? '#ff4a1d' : (b.type === 'skill' ? '#ff6530' : '#ffb347');
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffe66b';
      ctx.beginPath();
      ctx.arc(b.x - 2, b.y - 2, b.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.htmlBullet === 'water') {
      ctx.fillStyle = b.type === 'second' ? '#20cfff' : (b.type === 'skill' ? '#4bd8ff' : '#69dfff');
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (b.type !== 'normal') {
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else if (b.htmlBullet === 'thunder') {
      ctx.fillStyle = '#fff35a';
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - b.r - 6);
      ctx.lineTo(b.x + b.r, b.y - 2);
      ctx.lineTo(b.x + 3, b.y + 3);
      ctx.lineTo(b.x + b.r * 0.8, b.y + b.r + 7);
      ctx.lineTo(b.x - b.r, b.y + 2);
      ctx.lineTo(b.x - 3, b.y - 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      if (b.type !== 'normal') {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 7, 0, Math.PI * 2);
        ctx.globalAlpha = 0.28;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawTexts(ctx){
    petTexts.forEach(t => {
      ctx.save();

      ctx.globalAlpha = Math.max(0, t.life / 50);
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.font = '900 14px system-ui';
      ctx.textAlign = 'center';

      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);

      ctx.restore();
    });
  }

  function drawCutins(ctx){
    cutins.forEach(c => {
      const rate = c.life / c.maxLife;
      const alpha = Math.min(1, rate < 0.25 ? rate / 0.25 : 1);
      const image = img(c.image);

      ctx.save();
      ctx.globalAlpha = alpha;

      const y = c.second ? 100 - (1 - rate) * 18 : 88 - (1 - rate) * 14;

      ctx.fillStyle = c.second ? 'rgba(25,10,45,.78)' : 'rgba(0,0,0,.62)';
      ctx.fillRect(0, y - 44, ctx.canvas.width, 88);

      if (imageReady(image)) ctx.drawImage(image, 18, y - 38, 76, 76);

      ctx.textAlign = 'left';
      ctx.font = '900 15px system-ui';
      ctx.fillStyle = '#dfe8ff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(c.name, 105, y - 8);
      ctx.fillText(c.name, 105, y - 8);

      ctx.font = c.second ? '1000 26px system-ui' : '1000 24px system-ui';
      ctx.fillStyle = c.second ? '#ffdf35' : '#ffe66b';
      ctx.strokeText((c.second ? 'SECOND ' : '') + c.skill + '!!', 105, y + 24);
      ctx.fillText((c.second ? 'SECOND ' : '') + c.skill + '!!', 105, y + 24);

      ctx.restore();
    });
  }

  function drawShield(ctx){
    if (!gameState) return;

    const active = supportEffects.some(e => e.type === 'shield');
    if (!active) return;

    const p = gameState.player;

    ctx.save();
    ctx.globalAlpha = 0.36;
    ctx.strokeStyle = '#dfe8ff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  window.MobShotPetBattle = {
    init,
    update,
    draw,
    getCoinMultiplier
  };
})();
