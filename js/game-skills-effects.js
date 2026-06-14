'use strict';

(function(){
  const S = window.MobShotGameSkillsShared = window.MobShotGameSkillsShared || {};

  function state(){
    return S.gameState;
  }

  function effects(){
    return S.skillEffects;
  }

  function bullets(){
    return S.skillBullets;
  }

  function frame(){
    return Number(S.frameCount || 0);
  }

  function showSkillText(text){
    if (S.showSkillText) S.showSkillText(text);
  }

  function playerPower(){
    if (S.playerPower) return S.playerPower();
    return state() ? Number(state().power || 1) : 1;
  }

  function basePlayerPower(){
    const st = state();
    if (!st) return 1;
    return Number(st.power || 1);
  }

  function plusDamage(skill){
    return Number(skill && skill.plus || 0);
  }

  function damageEntity(entity, damage){
    if (!entity || entity.dead) return;

    entity.hp = Number(entity.hp || 0) - Number(damage || 0);

    if (entity.hp <= 0 && !entity.__rewarded) {
      if (window.MobShotGameCore && window.MobShotGameCore.killEntity) {
        window.MobShotGameCore.killEntity(entity);
      } else {
        entity.dead = true;
      }
    }
  }

  function getTargets(){
    const st = state();
    if (!st) return [];

    return st.entities.filter(e =>
      !e.dead &&
      e.kind !== 'gate' &&
      e.kind !== 'enemyBullet'
    );
  }

  function findStrongestTarget(){
    let target = null;
    let bestHp = -1;

    getTargets().forEach(e => {
      const hp = Number(e.hp || 0);

      if (hp > bestHp) {
        bestHp = hp;
        target = e;
      }
    });

    return target;
  }

  function fireRocket(skill){
    const st = state();
    const count = Math.max(1, Number(skill.count || 1));

    for (let i = 0; i < count; i++) {
      bullets().push({
        type: 'rocket',
        skill,
        x: st.player.x + (i - (count - 1) / 2) * 32,
        y: st.player.y - 38 - i * 20,
        vx: 0,
        vy: -5.2,
        r: 22,
        smokeTick: 0,
        dead: false
      });
    }
  }

  function fireEnergyRush(skill){
    const st = state();
    const count = Math.max(1, Number(skill.count || 10));

    effects().push({
      type: 'muzzleFlash',
      x: st.player.x,
      y: st.player.y - 45,
      timer: 16
    });

    for (let i = 0; i < count; i++) {
      const dir = Math.floor(Math.random() * 3);
      let vx = 0;
      let vy = -6.2;

      if (dir === 1) {
        vx = -2.3;
        vy = -5.8;
      }

      if (dir === 2) {
        vx = 2.3;
        vy = -5.8;
      }

      bullets().push({
        type: 'energyRush',
        skill,
        x: st.player.x + Math.random() * 16 - 8,
        y: st.player.y - 38,
        vx,
        vy,
        r: 15,
        delay: i * 3,
        dead: false
      });
    }
  }

  function fireTwinMissile(skill){
    const st = state();
    const count = Math.max(1, Number(skill.count || 2));

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;

      bullets().push({
        type: 'twinMissile',
        skill,
        x: st.player.x + side * 18,
        y: st.player.y - 24,
        vx: side * 4.8,
        vy: -3.2,
        r: 14,
        openTimer: 24,
        target: findStrongestTarget(),
        smokeTick: 0,
        dead: false
      });
    }
  }

  function startShadowClone(skill){
    effects().push({
      type: 'shadowClone',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      wideBonus: Number(skill.wideBonus || 3),
      clonePowerRate: Number(skill.clonePowerRate || 0.5),
      cloneCount: Number(skill.cloneCount || 2),
      shotCd: 0
    });
  }

  function startThunderbolt(skill){
    effects().push({
      type: 'thunderbolt',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      tick: 0
    });
  }

  function startArcaneBarrier(skill){
    effects().push({
      type: 'arcaneBarrier',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      damage: Number(skill.barrierDamage || 0),
      hitCd: 0,
      rot: 0,
      rot2: 0,
      rot3: 0
    });
  }

  function startDarkPower(skill){
    const st = state();

    effects().push({
      type: 'darkPower',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      attackAdd: Number(skill.darkPowerAttackAdd || 5),
      ghostTick: 0,
      auraShotCd: 30
    });

    effects().push({
      type: 'darkBurst',
      x: st.player.x,
      y: st.player.y,
      timer: 36
    });
  }

  function fireDarkAuraWave(effect){
    const st = state();
    const p = st.player;
    const damage = playerPower();
    const speed = 5.0;

    [
      { vx: 0, vy: -speed },
      { vx: 0, vy: speed },
      { vx: -speed, vy: 0 },
      { vx: speed, vy: 0 }
    ].forEach((d, i) => {
      bullets().push({
        type: 'darkAura',
        skill: effect.skill,
        x: p.x,
        y: p.y - 6,
        vx: d.vx,
        vy: d.vy,
        r: 34,
        damage,
        timer: 46,
        rot: i * Math.PI / 2,
        dead: false
      });
    });

    effects().push({
      type: 'darkAuraPulse',
      x: p.x,
      y: p.y,
      timer: 18
    });
  }

  function startBlackHole(skill){
    const st = state();
    const x = st.player.x;
    const y = Math.max(92, window.innerHeight * 0.18);

    effects().push({
      type: 'blackHole',
      skill,
      x,
      y,
      timer: Math.floor(Number(skill.duration || 3) * 60),
      total: Math.floor(Number(skill.duration || 3) * 60),
      range: Number(skill.blackHoleRange || 250),
      power: Number(skill.blackHolePower || 0.065),
      damageTick: 30,
      rot: 0
    });
  }

  function startHealingBreeze(skill){
    const st = state();
    const amount = Math.ceil(Number(skill.healAmount || 100));

    st.hp = Math.min(st.maxHp, Number(st.hp || 0) + amount);

    effects().push({
      type: 'healBreeze',
      x: st.player.x,
      y: st.player.y,
      amount,
      timer: 70,
      leaves: makeLeaves(st.player.x, st.player.y, 18)
    });

    effects().push({
      type: 'healNumber',
      text: `+${amount}`,
      x: st.player.x,
      y: st.player.y - 70,
      timer: 56
    });
  }

  function makeLeaves(x, y, count){
    const leaves = [];

    for (let i = 0; i < count; i++) {
      leaves.push({
        x: x + Math.random() * 80 - 40,
        y: y + Math.random() * 80 - 40,
        vx: Math.random() * 2 - 1,
        vy: -1.4 - Math.random() * 1.2,
        rot: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.12 + 0.04
      });
    }

    return leaves;
  }

  function startRosePulse(skill){
    effects().push({
      type: 'rosePulse',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      tick: 0
    });
  }

  function startGoldRush(skill){
    effects().push({
      type: 'goldRushBurst',
      timer: 60,
      coins: makeGoldBurstCoins()
    });

    effects().push({
      type: 'goldRush',
      skill,
      timer: Math.floor(Number(skill.duration || 10) * 60),
      total: Math.floor(Number(skill.duration || 10) * 60),
      multiplier: Number(skill.coinMultiplier || 1.5)
    });
  }

  function makeGoldBurstCoins(){
    const st = state();
    const coins = [];

    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2.5 + Math.random() * 4;

      coins.push({
        x: st.player.x,
        y: st.player.y - 30,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        rot: Math.random() * Math.PI * 2
      });
    }

    return coins;
  }

  function fireDarkThunder(skill){
    const st = state();
    const count = Math.max(5, Number(skill.count || 5));
    const spread = Math.PI * 0.72;
    const base = -Math.PI / 2;

    for (let i = 0; i < count; i++) {
      const angle = base + (i - (count - 1) / 2) * (spread / Math.max(1, count - 1));

      bullets().push({
        type: 'darkThunder',
        skill,
        x: st.player.x,
        y: st.player.y - 34,
        vx: Math.cos(angle) * 7.2,
        vy: Math.sin(angle) * 7.2,
        r: 16,
        dead: false
      });
    }

    effects().push({
      type: 'darkThunderFlash',
      x: st.player.x,
      y: st.player.y - 40,
      timer: 20
    });
  }

  function startTimeMagic(skill){
    effects().push({
      type: 'timeMagic',
      skill,
      timer: Math.floor(Number(skill.duration || 3) * 60),
      total: Math.floor(Number(skill.duration || 3) * 60)
    });
  }

  function startLilithSisters(skill){
    const st = state();
    const duration = Math.floor(Number(skill.duration || 5) * 60);
    const p = st.player;

    const sisters = [
      { id:'blue', image:'atk/rib.png', x:p.x - 78, y:p.y - 70, shotCd:30 },
      { id:'yellow', image:'atk/riy.png', x:p.x + 78, y:p.y - 70, shotCd:20 },
      { id:'white', image:'atk/riw.png', x:p.x - 40, y:p.y + 20, healCd:0 },
      { id:'red', image:'atk/rir.png', x:p.x + 40, y:p.y + 20, shotCd:45 }
    ];

    effects().push({
      type: 'lilithSisters',
      skill,
      timer: duration,
      sisters,
      powerRate: Number((skill.powerRate && skill.powerRate.sisters) || 1),
      redRate: Number((skill.powerRate && skill.powerRate.red) || 1.01),
      whiteHeal: Number(skill.whiteHeal || 5)
    });
  }

  function updateEffects(){
    for (const effect of effects()) {
      effect.timer--;

      if (effect.type === 'thunderbolt') {
        effect.tick--;

        if (effect.tick <= 0) {
          effect.tick = 18;
          createThunder(effect.skill);
        }
      }

      if (effect.type === 'arcaneBarrier') {
        effect.hitCd--;
        effect.rot += 0.08;
        effect.rot2 -= 0.055;
        effect.rot3 += 0.16;
      }

      if (effect.type === 'darkPower') {
        effect.ghostTick--;

        if (effect.ghostTick <= 0) {
          effect.ghostTick = 5;

          effects().push({
            type: 'darkAfterImage',
            x: state().player.x,
            y: state().player.y,
            timer: 24
          });
        }

        effect.auraShotCd--;

        if (effect.auraShotCd <= 0) {
          effect.auraShotCd = 30;
          fireDarkAuraWave(effect);
        }
      }

      if (effect.type === 'rosePulse') {
        effect.tick--;

        if (effect.tick <= 0) {
          effect.tick = 7;
          fireRoseBullet(effect.skill);
        }
      }

      if (effect.type === 'goldRushBurst') {
        effect.coins.forEach(c => {
          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.15;
          c.rot += 0.18;
        });
      }

      if (effect.type === 'healBreeze') {
        effect.leaves.forEach(l => {
          l.x += l.vx;
          l.y += l.vy;
          l.rot += l.sp;
        });
      }

      if (effect.type === 'blackHole' && effect.timer <= 1) {
        getTargets().forEach(e => {
          delete e.__blackHolePull;
        });
      }
    }

    S.skillEffects = effects().filter(effect => effect.timer > 0);
  }

  function updateBullets(){
    for (const bullet of bullets()) {
      if (bullet.dead) continue;

      if (bullet.delay && bullet.delay > 0) {
        bullet.delay--;
        continue;
      }

      if (bullet.type === 'twinMissile') {
        updateMissile(bullet);
      } else {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
      }

      if (bullet.type === 'darkAura') {
        bullet.timer--;
        bullet.rot += 0.18;

        if (bullet.timer <= 0) {
          bullet.dead = true;
          continue;
        }
      }

      if (bullet.type === 'rocket' || bullet.type === 'twinMissile') {
        bullet.smokeTick--;

        if (bullet.smokeTick <= 0) {
          bullet.smokeTick = 5;

          effects().push({
            type: 'smoke',
            x: bullet.x,
            y: bullet.y + 12,
            radius: bullet.type === 'rocket' ? 18 : 10,
            timer: 20
          });
        }
      }

      checkBulletHit(bullet);

      if (
        bullet.y < -180 ||
        bullet.y > window.innerHeight + 180 ||
        bullet.x < -180 ||
        bullet.x > window.innerWidth + 180
      ) {
        bullet.dead = true;
      }
    }

    S.skillBullets = bullets().filter(b => !b.dead);
  }

  function updateMissile(bullet){
    if (bullet.openTimer > 0) {
      bullet.openTimer--;
      bullet.y += bullet.vy;
      bullet.x += bullet.vx;
      return;
    }

    if (!bullet.target || bullet.target.dead) {
      bullet.target = findStrongestTarget();
    }

    if (bullet.target) {
      const dx = bullet.target.x - bullet.x;
      const dy = bullet.target.y - bullet.y;
      const d = Math.max(1, Math.hypot(dx, dy));

      bullet.vx += (dx / d) * 0.26;
      bullet.vy += (dy / d) * 0.26;

      const sp = Math.hypot(bullet.vx, bullet.vy);
      const maxSp = 5.4;

      if (sp > maxSp) {
        bullet.vx = bullet.vx / sp * maxSp;
        bullet.vy = bullet.vy / sp * maxSp;
      }
    }

    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
  }

  function checkBulletHit(bullet){
    for (const e of state().entities) {
      if (
        e.dead ||
        e.kind === 'gate' ||
        e.kind === 'enemyBullet'
      ) {
        continue;
      }

      const hit = e.r
        ? Math.hypot(bullet.x - e.x, bullet.y - e.y) < e.r + bullet.r
        : Math.abs(bullet.x - e.x) < e.w / 2 + bullet.r &&
          Math.abs(bullet.y - e.y) < e.h / 2 + bullet.r;

      if (!hit) continue;

      if (bullet.type === 'rocket') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        explode(bullet.x, bullet.y, bullet.skill);
      }

      if (bullet.type === 'energyRush') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        effects().push({ type:'energyHit', x:bullet.x, y:bullet.y, timer:10 });
      }

      if (bullet.type === 'twinMissile') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        smallExplode(bullet.x, bullet.y, bullet.skill);
      }

      if (bullet.type === 'shadowCloneShot') {
        damageEntity(e, playerPower() * Number(bullet.powerRate || 0.5));
        effects().push({ type:'energyHit', x:bullet.x, y:bullet.y, timer:10 });
      }

      if (bullet.type === 'rosePulse') {
        damageEntity(e, playerPower() * Number((bullet.skill.powerRate && bullet.skill.powerRate.rose) || 5) + plusDamage(bullet.skill));
        effects().push({ type:'roseHit', x:bullet.x, y:bullet.y, timer:16 });
      }

      if (bullet.type === 'darkThunder') {
        damageEntity(e, playerPower() * Number((bullet.skill.powerRate && bullet.skill.powerRate.darkThunder) || 3) + plusDamage(bullet.skill));
        addDarkDot(e, bullet.skill);
        effects().push({ type:'darkThunderHit', x:bullet.x, y:bullet.y, timer:18 });
      }

      if (bullet.type === 'darkAura') {
        damageEntity(e, Number(bullet.damage || basePlayerPower()));
        effects().push({ type:'darkHit', x:bullet.x, y:bullet.y, timer:20 });
      }

      if (bullet.type === 'sisterBlue' || bullet.type === 'sisterYellow') {
        damageEntity(e, basePlayerPower() * Number(bullet.powerRate || 1));
      }

      if (bullet.type === 'sisterRed') {
        damageEntity(e, (basePlayerPower() + 1) * Number(bullet.powerRate || 1.01));
        smallExplode(bullet.x, bullet.y, bullet.skill);
      }

      bullet.dead = true;
      break;
    }
  }

  function explode(x, y, skill){
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.55;

    effects().push({ type:'explosion', x, y, radius, timer:32 });
    effects().push({ type:'boomText', text:'BOOM!!', x, y:y - 20, timer:34 });

    getTargets().forEach(e => {
      if (Math.hypot(e.x - x, e.y - y) <= radius) {
        damageEntity(e, playerPower() * skill.powerRate.explosion + plusDamage(skill));
      }
    });
  }

  function smallExplode(x, y, skill){
    const radius = 88;

    effects().push({ type:'smallExplosion', x, y, radius, timer:18 });

    getTargets().forEach(e => {
      if (Math.hypot(e.x - x, e.y - y) <= radius) {
        damageEntity(e, playerPower() * 0.8 + plusDamage(skill));
      }
    });
  }

  function createThunder(skill){
    const targets = getTargets();

    if (!targets.length) return;

    const target = targets[Math.floor(Math.random() * targets.length)];
    const startY = -60;

    effects().push({
      type: 'thunderFall',
      skill,
      image: skill.bulletImage,
      x: target.x,
      y: startY,
      targetY: target.y,
      timer: 18,
      total: 18,
      target,
      impacted: false
    });
  }

  function thunderImpact(effect){
    if (effect.impacted) return;

    effect.impacted = true;

    const target = effect.target;

    effects().push({
      type: 'thunderImpact',
      image: effect.image,
      x: effect.x,
      y: effect.targetY,
      timer: 30
    });

    if (target && !target.dead) {
      damageEntity(target, playerPower() * effect.skill.powerRate.thunder + plusDamage(effect.skill));
    }
  }

  function fireRoseBullet(skill){
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) {
      x = Math.random() * window.innerWidth;
      y = -50;
    }

    if (side === 1) {
      x = Math.random() * window.innerWidth;
      y = window.innerHeight + 50;
    }

    if (side === 2) {
      x = -50;
      y = Math.random() * window.innerHeight * 0.75;
    }

    if (side === 3) {
      x = window.innerWidth + 50;
      y = Math.random() * window.innerHeight * 0.75;
    }

    const target = findStrongestTarget() || {
      x: state().player.x,
      y: state().player.y - 300
    };

    const tx = target.x + Math.random() * 80 - 40;
    const ty = target.y + Math.random() * 80 - 40;

    const dx = tx - x;
    const dy = ty - y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const speed = 5.2;

    bullets().push({
      type: 'rosePulse',
      skill,
      x,
      y,
      vx: dx / len * speed,
      vy: dy / len * speed,
      r: 24,
      dead: false
    });
  }

  function addDarkDot(entity, skill){
    entity.__darkDot = {
      timer: 10 * 60,
      tick: 30,
      damage: basePlayerPower() * Number((skill.powerRate && skill.powerRate.dot) || 0.5),
      image: 'atk/blackrai.png',
      spark: 0
    };
  }

  function updateDots(){
    state().entities.forEach(e => {
      if (!e.__darkDot || e.dead) return;

      e.__darkDot.timer--;
      e.__darkDot.tick--;
      e.__darkDot.spark--;

      if (e.__darkDot.spark <= 0) {
        e.__darkDot.spark = 8;
        effects().push({
          type: 'darkSpark',
          x: e.x,
          y: e.y,
          timer: 10
        });
      }

      if (e.__darkDot.tick <= 0) {
        e.__darkDot.tick = 30;
        damageEntity(e, e.__darkDot.damage);

        effects().push({
          type: 'dotHit',
          x: e.x,
          y: e.y,
          timer: 12
        });
      }

      if (e.__darkDot.timer <= 0) {
        e.__darkDot = null;
      }
    });
  }

  function updateBarrierDamage(){
    const barrier = effects().find(e => e.type === 'arcaneBarrier');

    if (!barrier || barrier.damage <= 0 || barrier.hitCd > 0) return;

    barrier.hitCd = 18;

    const p = state().player;
    const radius = 72;

    getTargets().forEach(e => {
      if (Math.hypot(e.x - p.x, e.y - p.y) <= radius + (e.r || 28)) {
        damageEntity(e, barrier.damage);
      }
    });
  }

  function updateBlackHole(){
    const hole = effects().find(e => e.type === 'blackHole');

    if (!hole) return;

    hole.rot += 0.18;
    hole.damageTick--;

    if (hole.damageTick <= 0) {
      hole.damageTick = 30;

      getTargets().forEach(e => {
        const dist = Math.hypot(e.x - hole.x, e.y - hole.y);

        if (dist <= hole.range) {
          damageEntity(e, 1);
          effects().push({
            type: 'blackHoleDamage',
            x: e.x,
            y: e.y,
            timer: 18
          });
        }
      });
    }

    getTargets().forEach(e => {
      const dx = hole.x - e.x;
      const dy = hole.y - e.y;
      const dist = Math.max(1, Math.hypot(dx, dy));

      if (dist > hole.range) {
        delete e.__blackHolePull;
        return;
      }

      const pull = hole.power * (1 - dist / hole.range);
      const shake = Math.sin(frame() * 1.8 + e.x) * 3;

      e.__blackHolePull = true;
      e.x += dx * pull + shake;
      e.y += dy * pull + Math.cos(frame() * 1.6 + e.y) * 2;
    });
  }

  function updateLilithSisters(){
    const effect = effects().find(e => e.type === 'lilithSisters');

    if (!effect) return;

    const p = state().player;

    effect.sisters.forEach((s, i) => {
      const targetX = p.x + [-86, 86, -45, 45][i];
      const targetY = p.y + [-76, -76, 20, 20][i] + Math.sin(frame() * 0.08 + i) * 22;

      s.x += (targetX - s.x) * 0.055 + Math.sin(frame() * 0.1 + i) * 1.4;
      s.y += (targetY - s.y) * 0.055 + Math.cos(frame() * 0.09 + i) * 1.0;

      if (s.id === 'blue') {
        s.shotCd--;

        if (s.shotCd <= 0) {
          s.shotCd = 45;
          fireSisterBlue(effect, s);
        }
      }

      if (s.id === 'yellow') {
        s.shotCd--;

        if (s.shotCd <= 0) {
          s.shotCd = 18;
          fireSisterYellow(effect, s);
        }
      }

      if (s.id === 'white') {
        s.healCd--;

        if (s.healCd <= 0) {
          s.healCd = 30;
          state().hp = Math.min(
            state().maxHp,
            Number(state().hp || 0) + Number(effect.whiteHeal || 5)
          );

          effects().push({
            type:'whiteHealMini',
            x:s.x,
            y:s.y,
            timer:16
          });
        }
      }

      if (s.id === 'red') {
        s.shotCd--;

        if (s.shotCd <= 0) {
          s.shotCd = 60;
          fireSisterRed(effect, s);
        }
      }
    });
  }

  function fireSisterBlue(effect, s){
    const angles = [-Math.PI / 2 - 0.18, -Math.PI / 2, -Math.PI / 2 + 0.18];

    angles.forEach(a => {
      bullets().push({
        type:'sisterBlue',
        skill:effect.skill,
        image:'atk/atkriri.png',
        x:s.x,
        y:s.y,
        vx:Math.cos(a) * 6.4,
        vy:Math.sin(a) * 6.4,
        r:10,
        powerRate:effect.powerRate,
        dead:false
      });
    });
  }

  function fireSisterYellow(effect, s){
    const a = -Math.PI / 2 + (Math.random() * 1.4 - 0.7);

    bullets().push({
      type:'sisterYellow',
      skill:effect.skill,
      image:'atk/atkriri.png',
      x:s.x,
      y:s.y,
      vx:Math.cos(a) * 6.2,
      vy:Math.sin(a) * 6.2,
      r:9,
      powerRate:effect.powerRate,
      dead:false
    });
  }

  function fireSisterRed(effect, s){
    const target = findStrongestTarget();
    let angle = -Math.PI / 2;

    if (target) {
      angle = Math.atan2(target.y - s.y, target.x - s.x);
    }

    bullets().push({
      type:'sisterRed',
      skill:effect.skill,
      image:'atk/atkriri.png',
      x:s.x,
      y:s.y,
      vx:Math.cos(angle) * 5.4,
      vy:Math.sin(angle) * 5.4,
      r:22,
      powerRate:effect.redRate,
      dead:false
    });
  }

  S.FX = {
    fireRocket,
    fireEnergyRush,
    fireTwinMissile,
    startShadowClone,
    startThunderbolt,
    startArcaneBarrier,
    startDarkPower,
    startBlackHole,
    startHealingBreeze,
    startRosePulse,
    startGoldRush,
    fireDarkThunder,
    startTimeMagic,
    startLilithSisters,
    updateEffects,
    updateBullets,
    updateBarrierDamage,
    updateBlackHole,
    updateDots,
    updateLilithSisters,
    thunderImpact
  };
})();
