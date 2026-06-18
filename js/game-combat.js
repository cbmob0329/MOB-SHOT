'use strict';

(function(){
  const PLAYER_ENEMY_BULLET_HIT_R = 12;

  function skillCoinMultiplier(){
    if (
      window.MobShotGameSkills &&
      window.MobShotGameSkills.coinMultiplier
    ) {
      return Math.max(1, Number(window.MobShotGameSkills.coinMultiplier() || 1));
    }

    return 1;
  }

  function isSkillInvincible(entity){
    if (
      window.MobShotGameSkills &&
      window.MobShotGameSkills.isInvincibleAgainst
    ) {
      return window.MobShotGameSkills.isInvincibleAgainst(entity);
    }

    return false;
  }

  function enemyBulletHitRadius(e){
    if (e.hitR != null) {
      return Number(e.hitR);
    }

    return Math.max(10, Math.ceil(Number(e.r || 8) * 0.72));
  }

  function enemyBulletBreakRadius(e){
    if (e.hitR != null) {
      return Math.max(Number(e.hitR), Math.ceil(Number(e.r || 8) * 0.72));
    }

    return Number(e.r || 8);
  }

  function applyGate(gate, tools){
    const state = tools.state;
    const addText = tools.addText;
    const burst = tools.burst;

    if (gate.type === 'power') state.power += gate.value;
    if (gate.type === 'range') state.range += gate.value;
    if (gate.type === 'rapid') state.attackSpeed += 0.12 * gate.value;
    if (gate.type === 'life') state.hp = Math.min(state.maxHp, state.hp + gate.value);

    if (gate.type === 'wide') {
      state.baseWide += gate.value;
      state.wide = state.baseWide;
    }

    if (gate.type === 'cooldown') {
      if (window.MobShotGameSkills && window.MobShotGameSkills.reduceCooldownAll) {
        window.MobShotGameSkills.reduceCooldownAll(gate.value);
      }
    }

    if (gate.type === 'skillmax') {
      if (window.MobShotGameSkills && window.MobShotGameSkills.fillAll) {
        window.MobShotGameSkills.fillAll();
      }
    }

    if (window.MobShotMission && window.MobShotMission.onGateTaken) {
      window.MobShotMission.onGateTaken();
    }

    addText(gate.name, state.player.x, state.player.y - 70, gate.color);
    burst(gate.x, gate.y, gate.color, 24);

    state.entities.forEach(e => {
      if (e.kind === 'gate' && e.pair === gate.pair) {
        e.dead = true;
      }
    });
  }

  function shoot(tools){
    const state = tools.state;

    state.shootCd--;

    if (state.shootCd > 0) return;

    state.shootCd = Math.max(
      7,
      Math.floor(22 / Math.max(0.5, state.attackSpeed))
    );

    const count = Math.max(1, state.wide);
    const maxTravel = 150 + state.range * 20;

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 26;

      state.bullets.push({
        x: state.player.x + offset,
        y: state.player.y - 30,
        startY: state.player.y - 30,
        vy: -8.4,
        r: 7,
        maxTravel,
        dmg: state.power,
        dead: false
      });
    }
  }

  function updateBullets(tools){
    const state = tools.state;
    const W = tools.W;
    const H = tools.H;

    for (const b of state.bullets) {
      if (b.dead) continue;

      b.y += b.vy;

      if (b.startY - b.y >= b.maxTravel) b.dead = true;
      if (b.y < -80) b.dead = true;
    }

    for (const e of state.entities) {
      if (e.dead) continue;
      if (e.kind !== 'enemyBullet') continue;

      if (e.homing) {
        if (e.y > state.player.y - 40) {
          e.dead = true;
          continue;
        }

        const dx = state.player.x - e.x;
        const dy = state.player.y - e.y;

        if (dy <= 0) {
          e.dead = true;
          continue;
        }

        const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const speed = e.homingSpeed || Math.max(2.8, Math.sqrt((e.vx || 0) * (e.vx || 0) + (e.vy || 0) * (e.vy || 0)));
        const targetVx = dx / len * speed;
        const targetVy = dy / len * speed;
        const power = e.homingPower || 0.04;

        e.vx += (targetVx - e.vx) * power;
        e.vy += (targetVy - e.vy) * power;
      }

      e.x += e.vx || 0;
      e.y += e.vy || 0;

      if (e.vy < 0 && e.y < state.player.y) {
        e.dead = true;
        continue;
      }

      if (e.y > state.player.y + 78) {
        e.dead = true;
        continue;
      }

      if (e.life != null) {
        e.life--;
        if (e.life <= 0) e.dead = true;
      }

      if (
        e.x < -140 ||
        e.x > W + 140 ||
        e.y < -160 ||
        e.y > H + 120
      ) {
        e.dead = true;
      }
    }
  }

  function collideBullets(tools){
    const state = tools.state;
    const burst = tools.burst;
    const killEntity = tools.killEntity;
    const addText = tools.addText;

    for (const b of state.bullets) {
      if (b.dead) continue;

      for (const e of state.entities) {
        if (e.dead || e.kind === 'gate') continue;

        if (e.kind === 'enemyBullet') {
          if (!isBreakableEnemyBullet(e)) continue;

          const bulletHit =
            Math.hypot(b.x - e.x, b.y - e.y) <
            enemyBulletBreakRadius(e) + b.r;

          if (!bulletHit) continue;

          b.dead = true;
          e.hp = Number(e.hp || 1) - Number(b.dmg || 1);
          burst(b.x, b.y, '#ffffff', 4);

          if (e.hp <= 0) {
            e.dead = true;
            burst(e.x, e.y, e.color || '#9deeff', 12);
            addText('BREAK', e.x, e.y - 12, '#9deeff');
          }

          break;
        }

        const hit = hitEntity(b.x, b.y, b.r, e);

        if (!hit) continue;

        b.dead = true;
        burst(b.x, b.y, '#ffffff', 4);

        if (hasBarrier(e)) {
          damageBarrier(e, b.dmg, tools);
        } else {
          e.hp -= b.dmg;

          if (e.hp <= 0) {
            killEntity(e);
          }
        }

        break;
      }
    }
  }

  function collidePlayer(tools){
    const state = tools.state;
    const addText = tools.addText;
    const burst = tools.burst;
    const applyGateFn = tools.applyGate;
    const p = state.player;

    for (const e of state.entities) {
      if (e.dead) continue;

      if (e.kind === 'gate') {
        if (
          Math.abs(p.x - e.x) < e.w / 2 &&
          Math.abs(p.y - 20 - e.y) < e.h / 2
        ) {
          applyGateFn(e);
        }

        continue;
      }

      if (e.kind === 'enemyBullet') {
        const hitR = enemyBulletHitRadius(e);

        if (
          Math.hypot(p.x - e.x, p.y - e.y) <
          PLAYER_ENEMY_BULLET_HIT_R + hitR
        ) {
          e.dead = true;

          if (isSkillInvincible(e)) {
            addText('GUARD', p.x, p.y - 50, '#9deeff');
            burst(p.x, p.y, '#9deeff', 10);
            continue;
          }

          const dmg = Math.max(1, Math.ceil(Number(e.dmg || e.hp || 1)));
          state.hp -= dmg;
          addText(`-${dmg}`, p.x, p.y - 50, '#ff5b5b');
          burst(p.x, p.y, '#ff5b5b', 16);
        }

        continue;
      }

      if (e.kind === 'midBoss' && e.diveMode) {
        if (
          Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r &&
          e.hitPlayerCd <= 0
        ) {
          e.hitPlayerCd = 90;

          if (isSkillInvincible(e)) {
            addText('GUARD', p.x, p.y - 50, '#9deeff');
            burst(p.x, p.y, '#9deeff', 14);
            continue;
          }

          const dmg = Math.max(1, Math.ceil(Number(e.contactDmg || 10)));
          state.hp -= dmg;
          addText(`-${dmg}`, p.x, p.y - 50, '#ff5b5b');
          burst(p.x, p.y, '#ff5b5b', 20);
        }

        continue;
      }

      if (e.kind === 'boss' && e.diveMode) {
        if (
          Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r &&
          e.hitPlayerCd <= 0
        ) {
          e.hitPlayerCd = 90;

          if (isSkillInvincible(e)) {
            addText('GUARD', p.x, p.y - 50, '#9deeff');
            burst(p.x, p.y, '#9deeff', 14);
            continue;
          }

          const dmg = Math.max(1, Math.ceil(Number(e.contactDmg || 18)));
          state.hp -= dmg;
          addText(`-${dmg}`, p.x, p.y - 50, '#ff5b5b');
          burst(p.x, p.y, '#ff5b5b', 20);
        }

        continue;
      }

      if (e.kind === 'boss' || e.kind === 'midBoss') {
        continue;
      }

      const hit = hitEntity(p.x, p.y, p.r, e);

      if (hit) {
        e.dead = true;

        if (isSkillInvincible(e)) {
          addText('GUARD', p.x, p.y - 50, '#9deeff');
          burst(p.x, p.y, '#9deeff', 12);
          continue;
        }

        const dmg = Math.max(1, Math.ceil(Number(e.hp || 1)));
        state.hp -= dmg;
        addText(`-${dmg}`, p.x, p.y - 50, '#ff5b5b');
        burst(p.x, p.y, '#ff5b5b', 18);
      }
    }
  }

  function killEntity(e, tools){
    const state = tools.state;
    const intRand = tools.intRand;
    const addText = tools.addText;
    const burst = tools.burst;

    if (e.__rewarded) return;

    e.__rewarded = true;
    e.dead = true;

    burst(
      e.x,
      e.y,
      e.kind === 'boss' ? '#ff4aff' : e.kind === 'midBoss' ? '#ffcf5b' : '#ffe66b',
      e.kind === 'boss' ? 70 : e.kind === 'midBoss' ? 42 : 24
    );

    let baseCoin = 0;
    const score = Number(e.score || 0);

    if (e.kind === 'midBoss' || e.kind === 'boss') {
      baseCoin = Number(e.coin || 0);
    } else {
      baseCoin = intRand(e.coinMin || 1, e.coinMax || 3);
    }

    const multiplier = skillCoinMultiplier();
    const coin = Math.max(0, Math.ceil(baseCoin * multiplier));

    state.coin += coin;
    state.score += score;

    if (window.MobShotMission && window.MobShotMission.onEntityKilled) {
      window.MobShotMission.onEntityKilled(e, coin);
    }

    if (e.kind === 'midBoss') {
      addText('中ボス撃破！', e.x, e.y - 48, '#ffe66b');
    }

    if (e.kind === 'boss') {
      addText('ボス撃破！', e.x, e.y - 56, '#ff4aff');
    }

    addText(`+${score} SCORE`, e.x, e.y - 24, '#6be6ff');

    if (multiplier > 1) {
      addText(`+${coin} COIN ×${multiplier.toFixed(1)}`, e.x, e.y, '#ffcf5b');
    } else {
      addText(`+${coin} COIN`, e.x, e.y, '#ffcf5b');
    }
  }

  function hitEntity(x, y, r, e){
    if (e.r) {
      return Math.hypot(x - e.x, y - e.y) < e.r + r;
    }

    return (
      Math.abs(x - e.x) < e.w / 2 + r &&
      Math.abs(y - e.y) < e.h / 2 + r
    );
  }

  function isBreakableEnemyBullet(e){
    return (
      e.kind === 'enemyBullet' &&
      e.breakable &&
      Number(e.hp || 0) > 0
    );
  }

  function hasBarrier(e){
    return Number(e.barrierTimer || 0) > 0 && Number(e.barrierHp || 0) > 0;
  }

  function damageBarrier(e, dmg, tools){
    const burst = tools.burst;
    const addText = tools.addText;

    e.barrierHp -= Number(dmg || 1);

    burst(e.x, e.y, '#7be6ff', 6);

    if (e.barrierHp <= 0) {
      e.barrierHp = 0;
      e.barrierTimer = 0;
      burst(e.x, e.y, '#7be6ff', 34);
      addText('BARRIER BREAK', e.x, e.y - 82, '#9deeff');
    }
  }

  window.MobShotCombat = {
    applyGate,
    shoot,
    updateBullets,
    collideBullets,
    collidePlayer,
    killEntity
  };
})();
