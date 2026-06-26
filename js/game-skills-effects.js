'use strict';

(function(){
  const S = window.MobShotGameSkillsShared = window.MobShotGameSkillsShared || {};

  function state(){ return S.gameState; }
  function effects(){ return S.skillEffects; }
  function bullets(){ return S.skillBullets; }
  function frame(){ return Number(S.frameCount || 0); }

  function playerPower(){
    if (S.playerPower) return S.playerPower();
    return state() ? Number(state().power || 1) : 1;
  }

  function basePlayerPower(){
    if (S.basePlayerPower) return S.basePlayerPower();
    return state() ? Number(state().power || 1) : 1;
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
    if (!st || !Array.isArray(st.entities)) return [];

    return st.entities.filter(e =>
      !e.dead &&
      e.kind !== 'gate' &&
      e.kind !== 'enemyBullet'
    );
  }

  function getBreakableEnemyBullets(){
    const st = state();
    if (!st || !Array.isArray(st.entities)) return [];

    return st.entities.filter(e =>
      !e.dead &&
      e.kind === 'enemyBullet' &&
      e.breakable &&
      Number(e.hp || 0) > 0
    );
  }

  function enemyBulletBreakRadius(e){
    if (e.hitR != null) {
      return Math.max(Number(e.hitR), Math.ceil(Number(e.r || 8) * 0.72));
    }

    return Number(e.r || 8);
  }

  function skillBulletDamageToEnemyBullet(bullet){
    const skill = bullet.skill || {};
    const p = playerPower();

    if (bullet.type === 'rocket') return p * Number((skill.powerRate && skill.powerRate.bullet) || 2.2) + plusDamage(skill);
    if (bullet.type === 'energyRush') return p * Number((skill.powerRate && skill.powerRate.bullet) || 0.8) + plusDamage(skill);
    if (bullet.type === 'twinMissile') return p * Number((skill.powerRate && skill.powerRate.bullet) || 1.4) + plusDamage(skill);
    if (bullet.type === 'darkFire') return Number(bullet.damage || p * 2.2) + plusDamage(skill);
    if (bullet.type === 'shadowCloneShot') return p * Number(bullet.powerRate || 0.5);
    if (bullet.type === 'rosePulse') return p * Number((skill.powerRate && skill.powerRate.rose) || 0.55) + plusDamage(skill);
    if (bullet.type === 'darkThunder') return p * Number((skill.powerRate && skill.powerRate.darkThunder) || 2) + plusDamage(skill);
    if (bullet.type === 'darkAura') return Number(bullet.damage || basePlayerPower());
    if (bullet.type === 'neonBomb') return p * Number((skill.powerRate && skill.powerRate.pierce) || 1.4) + plusDamage(skill);
    if (bullet.type === 'neptuneAttack') return p * Number((skill.powerRate && skill.powerRate.trident) || 1.8) + plusDamage(skill);
    if (bullet.type === 'miraPoison') return p * Number((skill.powerRate && skill.powerRate.bullet) || 0.65) + plusDamage(skill);
    if (bullet.type === 'sisterBlue' || bullet.type === 'sisterYellow') return basePlayerPower() * Number(bullet.powerRate || 1);
    if (bullet.type === 'sisterRed') return (basePlayerPower() + 1) * Number(bullet.powerRate || 1.01);

    return Math.max(1, p);
  }

  function damageEnemyBullet(enemyBullet, damage, x, y, color){
    if (!enemyBullet || enemyBullet.dead) return false;

    enemyBullet.hp = Number(enemyBullet.hp || 0) - Number(damage || 1);

    effects().push({
      type: 'energyHit',
      x: x != null ? x : enemyBullet.x,
      y: y != null ? y : enemyBullet.y,
      timer: 10
    });

    if (enemyBullet.hp <= 0) {
      enemyBullet.dead = true;

      effects().push({
        type: 'smallExplosion',
        x: enemyBullet.x,
        y: enemyBullet.y,
        radius: enemyBullet.bossSpecial ? 72 : 42,
        timer: enemyBullet.bossSpecial ? 22 : 14,
        color: color || enemyBullet.color || '#9deeff'
      });

      effects().push({
        type: 'skillText',
        text: enemyBullet.trident ? 'TRIDENT BREAK' : 'BREAK',
        x: enemyBullet.x,
        y: enemyBullet.y - 18,
        timer: 26
      });

      return true;
    }

    return false;
  }

  function checkSkillBulletHitEnemyBullet(bullet){
    if (!bullet || bullet.dead) return false;

    const list = getBreakableEnemyBullets();
    if (!list.length) return false;

    for (const e of list) {
      const hit =
        Math.hypot(bullet.x - e.x, bullet.y - e.y) <
        enemyBulletBreakRadius(e) + Number(bullet.r || 8);

      if (!hit) continue;

      const damage = skillBulletDamageToEnemyBullet(bullet);
      damageEnemyBullet(e, damage, bullet.x, bullet.y, e.color);

      if (
        bullet.type !== 'neonBomb' &&
        bullet.type !== 'neptuneAttack' &&
        bullet.type !== 'darkAura'
      ) {
        if (bullet.type === 'rocket') explode(bullet.x, bullet.y, bullet.skill);
        if (bullet.type === 'twinMissile' || bullet.type === 'sisterRed') smallExplode(bullet.x, bullet.y, bullet.skill);

        bullet.dead = true;
      }

      return true;
    }

    return false;
  }

  function damageEnemyBulletsInRadius(x, y, radius, damage, color){
    getBreakableEnemyBullets().forEach(e => {
      if (Math.hypot(e.x - x, e.y - y) <= radius + enemyBulletBreakRadius(e)) {
        damageEnemyBullet(e, damage, e.x, e.y, color);
      }
    });
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
        x: st.player.x + (i - (count - 1) / 2) * 34,
        y: st.player.y - 38 - i * 18,
        vx: 0,
        vy: -5.4,
        r: 22,
        smokeTick: 0,
        dead: false
      });
    }
  }

  function fireEnergyRush(skill){
    const st = state();
    const count = Math.max(1, Number(skill.count || 18));

    effects().push({
      type: 'muzzleFlash',
      x: st.player.x,
      y: st.player.y - 45,
      timer: 16
    });

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 1.75 - 0.875);
      const speed = 5.0 + Math.random() * 2.4;

      bullets().push({
        type: 'energyRush',
        skill,
        x: st.player.x + Math.random() * 30 - 15,
        y: st.player.y - 38 + Math.random() * 10 - 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 14,
        delay: i * 2,
        dead: false
      });
    }
  }

  function fireTwinMissile(skill){
    const volleyCount = Math.max(1, Number(skill.twinVolleyCount || 3));

    for (let volley = 0; volley < volleyCount; volley++) {
      fireTwinMissileVolley(skill, volley * 12);
    }
  }

  function fireTwinMissileVolley(skill, delay){
    const st = state();
    const count = Math.max(1, Number(skill.count || 2));
    const radius = Math.max(18, Number(skill.bulletSize || 38) * 0.42);

    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * 22;
      const side = i % 2 === 0 ? -1 : 1;

      bullets().push({
        type: 'twinMissile',
        skill,
        x: st.player.x + spread,
        y: st.player.y - 24 - Math.abs(spread) * 0.18,
        vx: side * 4.2,
        vy: -3.2,
        r: radius,
        openTimer: 18 + i * 2,
        target: findStrongestTarget(),
        smokeTick: 0,
        delay,
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
      timer: Math.floor(Number(skill.duration || 6) * 60),
      damage: Number(skill.barrierDamage || 2),
      hitCd: 0,
      rot: 0,
      rot2: 0,
      rot3: 0
    });
  }

  function startDarkPower(skill){
    const st = state();

    const effect = {
      type: 'darkPower',
      skill,
      timer: Math.floor(Number(skill.duration || 4) * 60),
      attackAdd: Number(skill.darkPowerAttackAdd || 3),
      ghostTick: 0,
      darkFireDone: true
    };

    effects().push(effect);

    effects().push({
      type: 'darkBurst',
      x: st.player.x,
      y: st.player.y,
      timer: 36
    });

    fireDarkFire(effect);
  }

  function fireDarkFire(effect){
    const st = state();
    const p = st.player;
    const angles = [-0.20, 0, 0.20];
    const speed = 4.9;

    angles.forEach((offset, index) => {
      const angle = -Math.PI / 2 + offset;

      bullets().push({
        type: 'darkFire',
        skill: effect.skill,
        x: p.x + (index - 1) * 24,
        y: p.y - 46,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 31,
        damage: playerPower() * Number((effect.skill.powerRate && effect.skill.powerRate.darkFire) || 2.2),
        smokeTick: 0,
        dead: false
      });
    });

    effects().push({
      type: 'darkFireFlash',
      x: p.x,
      y: p.y - 46,
      timer: 18
    });
  }

  function startBlackHole(skill){
    const st = state();

    effects().push({
      type: 'blackHole',
      skill,
      x: st.player.x,
      y: Math.max(92, window.innerHeight * 0.18),
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

    effects().push({
      type: 'healBreeze',
      skill,
      x: st.player.x,
      y: st.player.y,
      amount: Math.ceil(Number(skill.healAmount || 70)),
      tick: 0,
      interval: Math.floor(Number(skill.healInterval || 1.5) * 60),
      timer: Math.floor(Number(skill.duration || 10) * 60),
      total: Math.floor(Number(skill.duration || 10) * 60),
      leaves: makeLeaves(st.player.x, st.player.y, 24)
    });
  }

  function makeLeaves(x, y, count){
    const leaves = [];

    for (let i = 0; i < count; i++) {
      leaves.push({
        x: x + Math.random() * 90 - 45,
        y: y + Math.random() * 90 - 45,
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
      timer: Math.floor(Number(skill.duration || 12) * 60),
      total: Math.floor(Number(skill.duration || 12) * 60),
      multiplier: Number(skill.coinMultiplier || 2.5)
    });
  }

  function makeGoldBurstCoins(){
    const st = state();
    const coins = [];

    for (let i = 0; i < 30; i++) {
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

    effects().push({
      type: 'lilithSisters',
      skill,
      timer: duration,
      sisters: [
        { id:'blue', image:'atk/rib.png', x:p.x - 78, y:p.y - 70, shotCd:30 },
        { id:'yellow', image:'atk/riy.png', x:p.x + 78, y:p.y - 70, shotCd:20 },
        { id:'white', image:'atk/riw.png', x:p.x - 40, y:p.y + 20, healCd:0 },
        { id:'red', image:'atk/rir.png', x:p.x + 40, y:p.y + 20, shotCd:45 }
      ],
      powerRate: Number((skill.powerRate && skill.powerRate.sisters) || 1),
      redRate: Number((skill.powerRate && skill.powerRate.red) || 1.01),
      whiteHeal: Number(skill.whiteHeal || 5)
    });
  }

  function fireNeonBomb(skill){
    const st = state();

    bullets().push({
      type: 'neonBomb',
      skill,
      x: st.player.x,
      y: st.player.y - 54,
      vx: 0,
      vy: -2.35,
      baseX: st.player.x,
      r: Math.max(44, Number(skill.bulletSize || 104) * 0.42),
      phase: 'fly',
      timer: 0,
      stopTimer: Math.floor(Number(skill.duration || 3) * 60),
      hitMap: {},
      wobbleSeed: Math.random() * 999,
      dead: false
    });
  }

  function fireNeptuneAttack(skill){
    const st = state();
    const count = Math.max(5, Number(skill.count || 5));
    const interval = Math.max(1, Number(skill.neptuneShotInterval || 8));

    for (let i = 0; i < count; i++) {
      bullets().push({
        type: 'neptuneAttack',
        skill,
        x: st.player.x,
        y: st.player.y - 48,
        vx: 0,
        vy: -4.25,
        r: Math.max(28, Number(skill.bulletSize || 64) * 0.36),
        delay: i * interval,
        pierce: true,
        hitMap: {},
        dead: false
      });
    }

    effects().push({
      type: 'neptuneFlash',
      x: st.player.x,
      y: st.player.y - 48,
      timer: 22
    });
  }

  function fireMiraPoison(skill){
    const st = state();
    const count = Math.max(5, Number(skill.count || 5));
    const spread = Math.PI * 0.46;
    const base = -Math.PI / 2;

    for (let i = 0; i < count; i++) {
      const angle = base + (i - (count - 1) / 2) * (spread / Math.max(1, count - 1));

      bullets().push({
        type: 'miraPoison',
        skill,
        x: st.player.x,
        y: st.player.y - 40,
        vx: Math.cos(angle) * 5.0,
        vy: Math.sin(angle) * 5.0,
        r: 18,
        dead: false
      });
    }

    effects().push({
      type: 'miraPoisonFlash',
      x: st.player.x,
      y: st.player.y - 42,
      timer: 20
    });
  }

  function startBookHero(skill){
    const st = state();
    const p = st.player;

    effects().push({
      type: 'bookHero',
      skill,
      image: skill.bulletImage,
      x: p.x,
      y: p.y - 92,
      vx: 0,
      vy: -2,
      timer: Math.floor(Number(skill.duration || 8) * 60),
      total: Math.floor(Number(skill.duration || 8) * 60),
      size: Number(skill.bulletSize || 70),
      target: findStrongestTarget(),
      hitMap: {},
      retargetCd: 0,
      spark: 0
    });

    effects().push({
      type: 'bookHeroSummon',
      x: p.x,
      y: p.y - 92,
      timer: 34
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
          effect.ghostTick = 8;

          effects().push({
            type: 'darkAfterImage',
            x: state().player.x,
            y: state().player.y,
            timer: 18
          });
        }
      }

      if (effect.type === 'rosePulse') {
        effect.tick--;

        if (effect.tick <= 0) {
          effect.tick = 22;
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
        const st = state();

        effect.x = st.player.x;
        effect.y = st.player.y;
        effect.tick--;

        if (effect.tick <= 0) {
          effect.tick = Math.max(1, Number(effect.interval || 90));

          const amount = Math.ceil(Number(effect.amount || 70));
          st.hp = Math.min(st.maxHp, Number(st.hp || 0) + amount);

          effects().push({
            type: 'healNumber',
            text: `+${amount}`,
            x: st.player.x,
            y: st.player.y - 70,
            timer: 56
          });
        }

        effect.leaves.forEach(l => {
          l.x += l.vx;
          l.y += l.vy;
          l.rot += l.sp;

          if (l.y < effect.y - 120) {
            l.x = effect.x + Math.random() * 90 - 45;
            l.y = effect.y + Math.random() * 70 - 20;
          }
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
      } else if (bullet.type === 'neonBomb') {
        updateNeonBomb(bullet);
      } else {
        bullet.x += Number(bullet.vx || 0);
        bullet.y += Number(bullet.vy || 0);
      }

      if (bullet.type === 'darkAura') {
        bullet.timer--;
        bullet.rot += 0.18;

        if (bullet.timer <= 0) {
          bullet.dead = true;
          continue;
        }
      }

      if (bullet.type === 'rocket' || bullet.type === 'twinMissile' || bullet.type === 'darkFire') {
        bullet.smokeTick--;

        if (bullet.smokeTick <= 0) {
          bullet.smokeTick = 5;

          effects().push({
            type: 'smoke',
            x: bullet.x,
            y: bullet.y + 12,
            radius: bullet.type === 'darkFire' ? 20 : bullet.type === 'rocket' ? 18 : 14,
            timer: 20
          });
        }
      }

      checkBulletHit(bullet);

      if (
        bullet.type !== 'neonBomb' &&
        (
          bullet.y < -220 ||
          bullet.y > window.innerHeight + 220 ||
          bullet.x < -220 ||
          bullet.x > window.innerWidth + 220
        )
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

      bullet.vx += (dx / d) * 0.28;
      bullet.vy += (dy / d) * 0.28;

      const sp = Math.hypot(bullet.vx, bullet.vy);
      const maxSp = 5.8;

      if (sp > maxSp) {
        bullet.vx = bullet.vx / sp * maxSp;
        bullet.vy = bullet.vy / sp * maxSp;
      }
    }

    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
  }

  function updateNeonBomb(bullet){
    bullet.timer++;

    const topY = Math.max(92, window.innerHeight * 0.16);
    const wobble = Math.sin(frame() * 0.12 + bullet.wobbleSeed) * 26;

    if (bullet.phase === 'fly') {
      bullet.y += bullet.vy;
      bullet.x = bullet.baseX + wobble;

      if (bullet.y <= topY) {
        bullet.phase = 'stop';
        bullet.y = topY;
        bullet.timer = 0;
      }
    } else {
      bullet.x = bullet.baseX + wobble + Math.sin(frame() * 0.31) * 12;
      bullet.y = topY + Math.cos(frame() * 0.14 + bullet.wobbleSeed) * 18;
      bullet.stopTimer--;

      if (bullet.stopTimer <= 0) {
        neonBombExplode(bullet);
      }
    }
  }

  function canIntervalHit(map, key, intervalFrames){
    const now = frame();
    const last = Number(map[key] || -999999);

    if (now - last < intervalFrames) return false;

    map[key] = now;
    return true;
  }

  function entityHitKey(e){
    if (!e.__skillHitId) {
      e.__skillHitId = 'hit_' + Math.random().toString(36).slice(2);
    }

    return e.__skillHitId;
  }

  function checkBulletHit(bullet){
    if (checkSkillBulletHitEnemyBullet(bullet)) return;

    for (const e of state().entities) {
      if (e.dead || e.kind === 'gate' || e.kind === 'enemyBullet') continue;

      const hit = e.r
        ? Math.hypot(bullet.x - e.x, bullet.y - e.y) < e.r + bullet.r
        : Math.abs(bullet.x - e.x) < e.w / 2 + bullet.r &&
          Math.abs(bullet.y - e.y) < e.h / 2 + bullet.r;

      if (!hit) continue;

      if (bullet.type === 'rocket') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        explode(bullet.x, bullet.y, bullet.skill);
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'energyRush') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        effects().push({ type:'energyHit', x:bullet.x, y:bullet.y, timer:10 });
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'twinMissile') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        smallExplode(bullet.x, bullet.y, bullet.skill);
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'darkFire') {
        damageEntity(e, Number(bullet.damage || playerPower() * 2.2) + plusDamage(bullet.skill));
        effects().push({ type:'darkFireHit', x:bullet.x, y:bullet.y, timer:22 });
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'shadowCloneShot') {
        damageEntity(e, playerPower() * Number(bullet.powerRate || 0.5));
        effects().push({ type:'energyHit', x:bullet.x, y:bullet.y, timer:10 });
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'rosePulse') {
        damageEntity(e, playerPower() * Number((bullet.skill.powerRate && bullet.skill.powerRate.rose) || 0.55) + plusDamage(bullet.skill));
        effects().push({ type:'roseHit', x:bullet.x, y:bullet.y, timer:16 });
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'darkThunder') {
        damageEntity(e, playerPower() * Number((bullet.skill.powerRate && bullet.skill.powerRate.darkThunder) || 2) + plusDamage(bullet.skill));
        addDarkDot(e, bullet.skill);
        effects().push({ type:'darkThunderHit', x:bullet.x, y:bullet.y, timer:18 });
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'darkAura') {
        damageEntity(e, Number(bullet.damage || basePlayerPower()));
        effects().push({ type:'darkHit', x:bullet.x, y:bullet.y, timer:20 });
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'neonBomb') {
        const key = entityHitKey(e);

        if (canIntervalHit(bullet.hitMap, key, Math.floor(Number(bullet.skill.neonBombHitInterval || 2) * 60))) {
          damageEntity(e, playerPower() * Number((bullet.skill.powerRate && bullet.skill.powerRate.pierce) || 1.4) + plusDamage(bullet.skill));
          effects().push({ type:'neonHit', x:e.x, y:e.y, timer:18 });
        }

        continue;
      }

      if (bullet.type === 'neptuneAttack') {
        const key = entityHitKey(e);

        if (!bullet.hitMap[key]) {
          bullet.hitMap[key] = true;
          damageEntity(e, playerPower() * Number((bullet.skill.powerRate && bullet.skill.powerRate.trident) || 1.8) + plusDamage(bullet.skill));
          effects().push({ type:'neptuneHit', x:e.x, y:e.y, timer:16 });
        }

        continue;
      }

      if (bullet.type === 'miraPoison') {
        damageEntity(e, playerPower() * Number((bullet.skill.powerRate && bullet.skill.powerRate.bullet) || 0.65) + plusDamage(bullet.skill));
        addMiraPoison(e, bullet.skill);
        effects().push({ type:'miraPoisonHit', x:e.x, y:e.y, timer:18 });
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'sisterBlue' || bullet.type === 'sisterYellow') {
        damageEntity(e, basePlayerPower() * Number(bullet.powerRate || 1));
        bullet.dead = true;
        break;
      }

      if (bullet.type === 'sisterRed') {
        damageEntity(e, (basePlayerPower() + 1) * Number(bullet.powerRate || 1.01));
        smallExplode(bullet.x, bullet.y, bullet.skill);
        bullet.dead = true;
        break;
      }
    }
  }

  function explode(x, y, skill){
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.55;
    const damage = playerPower() * skill.powerRate.explosion + plusDamage(skill);

    effects().push({ type:'explosion', x, y, radius, timer:32 });
    effects().push({ type:'boomText', text:'BOOM!!', x, y:y - 20, timer:34 });

    getTargets().forEach(e => {
      if (Math.hypot(e.x - x, e.y - y) <= radius) {
        damageEntity(e, damage);
      }
    });

    damageEnemyBulletsInRadius(x, y, radius, damage, '#ffcf5b');
  }

  function smallExplode(x, y, skill){
    const radius = Number(skill.explosionRange || 115);
    const damage = playerPower() * Number((skill.powerRate && skill.powerRate.explosion) || 0.65) + plusDamage(skill);

    effects().push({ type:'smallExplosion', x, y, radius, timer:20 });

    getTargets().forEach(e => {
      if (Math.hypot(e.x - x, e.y - y) <= radius) {
        damageEntity(e, damage);
      }
    });

    damageEnemyBulletsInRadius(x, y, radius, damage, '#ffcf5b');
  }

  function neonBombExplode(bullet){
    bullet.dead = true;

    const skill = bullet.skill;
    const radius = Number(skill.explosionRange || 198);
    const damage = playerPower() * Number((skill.powerRate && skill.powerRate.explosion) || 2.2) + plusDamage(skill);

    effects().push({ type:'neonExplosion', x:bullet.x, y:bullet.y, radius, timer:44 });
    effects().push({ type:'boomText', text:'NEON BOOM!!', x:bullet.x, y:bullet.y - 24, timer:44 });

    getTargets().forEach(e => {
      if (Math.hypot(e.x - bullet.x, e.y - bullet.y) <= radius + (e.r || 28)) {
        damageEntity(e, damage);
        addNeonBurn(e, skill);
      }
    });

    damageEnemyBulletsInRadius(bullet.x, bullet.y, radius, damage, '#6be6ff');
  }

  function createThunder(skill){
    const targets = getTargets();
    if (!targets.length) return;

    const target = targets[Math.floor(Math.random() * targets.length)];

    effects().push({
      type: 'thunderFall',
      skill,
      image: skill.bulletImage,
      x: target.x,
      y: -60,
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

    effects().push({
      type: 'thunderImpact',
      image: effect.image,
      x: effect.x,
      y: effect.targetY,
      timer: 30
    });

    const damage = playerPower() * effect.skill.powerRate.thunder + plusDamage(effect.skill);

    if (effect.target && !effect.target.dead) {
      damageEntity(effect.target, damage);
    }

    damageEnemyBulletsInRadius(effect.x, effect.targetY, 86, damage, '#6be6ff');
  }

  function fireRoseBullet(skill){
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) { x = Math.random() * window.innerWidth; y = -50; }
    if (side === 1) { x = Math.random() * window.innerWidth; y = window.innerHeight + 50; }
    if (side === 2) { x = -50; y = Math.random() * window.innerHeight * 0.75; }
    if (side === 3) { x = window.innerWidth + 50; y = Math.random() * window.innerHeight * 0.75; }

    const target = findStrongestTarget() || {
      x: state().player.x,
      y: state().player.y - 300
    };

    const tx = target.x + Math.random() * 80 - 40;
    const ty = target.y + Math.random() * 80 - 40;
    const dx = tx - x;
    const dy = ty - y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const speed = 5.0;

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

  function addMiraPoison(entity, skill){
    entity.__miraPoison = {
      timer: Math.floor(Number(skill.duration || 6) * 60),
      tick: Math.floor(Number(skill.poisonTick || 1.5) * 60),
      interval: Math.floor(Number(skill.poisonTick || 1.5) * 60),
      damage: playerPower() * Number((skill.powerRate && skill.powerRate.poison) || 2.6),
      spark: 0
    };
  }

  function addNeonBurn(entity, skill){
    entity.__neonBurn = {
      timer: 5 * 60,
      tick: 60,
      damage: playerPower() * Number((skill.powerRate && skill.powerRate.dot) || 0.8),
      spark: 0
    };
  }

  function updateDots(){
    state().entities.forEach(e => {
      if (e.__darkDot && !e.dead) {
        e.__darkDot.timer--;
        e.__darkDot.tick--;
        e.__darkDot.spark--;

        if (e.__darkDot.spark <= 0) {
          e.__darkDot.spark = 8;
          effects().push({ type:'darkSpark', x:e.x, y:e.y, timer:10 });
        }

        if (e.__darkDot.tick <= 0) {
          e.__darkDot.tick = 30;
          damageEntity(e, e.__darkDot.damage);
          effects().push({ type:'dotHit', x:e.x, y:e.y, timer:12 });
        }

        if (e.__darkDot.timer <= 0) e.__darkDot = null;
      }

      if (e.__miraPoison && !e.dead) {
        e.__miraPoison.timer--;
        e.__miraPoison.tick--;
        e.__miraPoison.spark--;

        if (e.__miraPoison.spark <= 0) {
          e.__miraPoison.spark = 10;
          effects().push({ type:'miraPoisonSpark', x:e.x, y:e.y, timer:14 });
        }

        if (e.__miraPoison.tick <= 0) {
          e.__miraPoison.tick = Math.floor(Number(e.__miraPoison.interval || 90));
          damageEntity(e, e.__miraPoison.damage);
          effects().push({ type:'miraPoisonHit', x:e.x, y:e.y, timer:18 });
        }

        if (e.__miraPoison.timer <= 0) e.__miraPoison = null;
      }

      if (e.__neonBurn && !e.dead) {
        e.__neonBurn.timer--;
        e.__neonBurn.tick--;
        e.__neonBurn.spark--;

        if (e.__neonBurn.spark <= 0) {
          e.__neonBurn.spark = 8;
          effects().push({ type:'neonHit', x:e.x, y:e.y, timer:14 });
        }

        if (e.__neonBurn.tick <= 0) {
          e.__neonBurn.tick = 60;
          damageEntity(e, e.__neonBurn.damage);
          effects().push({ type:'neonHit', x:e.x, y:e.y, timer:18 });
        }

        if (e.__neonBurn.timer <= 0) e.__neonBurn = null;
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

    damageEnemyBulletsInRadius(p.x, p.y, radius, barrier.damage, '#9deeff');
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
          effects().push({ type:'blackHoleDamage', x:e.x, y:e.y, timer:18 });
        }
      });

      damageEnemyBulletsInRadius(hole.x, hole.y, hole.range, 1, '#8a4cff');
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
          state().hp = Math.min(state().maxHp, Number(state().hp || 0) + Number(effect.whiteHeal || 5));
          effects().push({ type:'whiteHealMini', x:s.x, y:s.y, timer:16 });
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

  function updateBookHero(){
    const hero = effects().find(e => e.type === 'bookHero');
    if (!hero) return;

    hero.spark--;

    if (hero.spark <= 0) {
      hero.spark = 8;
      effects().push({ type:'bookHeroSpark', x:hero.x, y:hero.y, timer:12 });
    }

    hero.retargetCd--;

    if (!hero.target || hero.target.dead || hero.retargetCd <= 0) {
      hero.target = findStrongestTarget();
      hero.retargetCd = 20;
    }

    if (hero.target) {
      const dx = hero.target.x - hero.x;
      const dy = hero.target.y - hero.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const speed = 9.4;

      hero.vx += (dx / d) * 0.78;
      hero.vy += (dy / d) * 0.78;

      const sp = Math.max(1, Math.hypot(hero.vx, hero.vy));
      hero.vx = hero.vx / sp * speed;
      hero.vy = hero.vy / sp * speed;

      hero.x += hero.vx;
      hero.y += hero.vy;

      getBreakableEnemyBullets().forEach(e => {
        const hit = Math.hypot(hero.x - e.x, hero.y - e.y) <= enemyBulletBreakRadius(e) + 58;
        if (!hit) return;

        const key = entityHitKey(e);
        const interval = Math.floor(Number(hero.skill.heroHitInterval || 2.0) * 60);

        if (canIntervalHit(hero.hitMap, key, interval)) {
          damageEnemyBullet(e, playerPower() * Number((hero.skill.powerRate && hero.skill.powerRate.hero) || 2.65) + plusDamage(hero.skill), e.x, e.y, '#ffcf5b');
          effects().push({ type:'bookHeroHit', x:e.x, y:e.y, timer:18 });
          hero.retargetCd = 0;
        }
      });

      getTargets().forEach(e => {
        const hit = Math.hypot(hero.x - e.x, hero.y - e.y) <= (e.r || 28) + 58;
        if (!hit) return;

        const key = entityHitKey(e);
        const interval = Math.floor(Number(hero.skill.heroHitInterval || 2.0) * 60);

        if (canIntervalHit(hero.hitMap, key, interval)) {
          damageEntity(e, playerPower() * Number((hero.skill.powerRate && hero.skill.powerRate.hero) || 2.65) + plusDamage(hero.skill));
          effects().push({ type:'bookHeroHit', x:e.x, y:e.y, timer:18 });
          hero.retargetCd = 0;
        }
      });
    } else {
      const p = state().player;
      hero.x += (p.x - hero.x) * 0.04 + Math.sin(frame() * 0.12) * 4;
      hero.y += (p.y - 180 - hero.y) * 0.04 + Math.cos(frame() * 0.1) * 4;
    }
  }

  function fireSisterBlue(effect, s){
    [-Math.PI / 2 - 0.18, -Math.PI / 2, -Math.PI / 2 + 0.18].forEach(a => {
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
    fireNeonBomb,
    fireNeptuneAttack,
    fireMiraPoison,
    startBookHero,
    updateEffects,
    updateBullets,
    updateBarrierDamage,
    updateBlackHole,
    updateDots,
    updateLilithSisters,
    updateBookHero,
    thunderImpact
  };
})();
