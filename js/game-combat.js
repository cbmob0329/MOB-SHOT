'use strict';

(function(){
  function isSkillInvincible(entity){
    if (
      window.MobShotGameSkills &&
      window.MobShotGameSkills.isInvincibleAgainst
    ) {
      return window.MobShotGameSkills.isInvincibleAgainst(entity);
    }

    return false;
  }

  function applyGate(gate, tools){
    const state = tools.state;
    const addText = tools.addText;
    const burst = tools.burst;

    if (gate.type === 'power') {
      state.power += gate.value;
    }

    if (gate.type === 'range') {
      state.range += gate.value;
    }

    if (gate.type === 'rapid') {
      state.attackSpeed += 0.25 * gate.value;
    }

    if (gate.type === 'life') {
      state.hp = Math.min(state.maxHp, state.hp + gate.value);
    }

    if (gate.type === 'wide') {
      state.baseWide += gate.value;
      state.wide = state.baseWide;
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
    const maxTravel = 150 + state.range * 45;

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

    for (const b of state.bullets) {
      b.y += b.vy;

      if (b.startY - b.y >= b.maxTravel) {
        b.dead = true;
      }
    }
  }

  function collideBullets(tools){
    const state = tools.state;
    const burst = tools.burst;
    const killEntity = tools.killEntity;

    for (const b of state.bullets) {
      if (b.dead) continue;

      for (const e of state.entities) {
        if (
          e.dead ||
          e.kind === 'gate' ||
          e.kind === 'enemyBullet'
        ) {
          continue;
        }

        const hit = e.r
          ? Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r
          : Math.abs(b.x - e.x) < e.w / 2 &&
            Math.abs(b.y - e.y) < e.h / 2;

        if (!hit) continue;

        b.dead = true;
        e.hp -= b.dmg;
        burst(b.x, b.y, '#ffffff', 4);

        if (e.hp <= 0) {
          killEntity(e);
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
        if (Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r) {
          e.dead = true;

          if (isSkillInvincible(e)) {
            addText('GUARD', p.x, p.y - 50, '#9deeff');
            burst(p.x, p.y, '#9deeff', 10);
            continue;
          }

          state.hp -= e.dmg;
          addText(`-${e.dmg}`, p.x, p.y - 50, '#ff5b5b');
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

          state.hp -= e.contactDmg;
          addText(`-${e.contactDmg}`, p.x, p.y - 50, '#ff5b5b');
          burst(p.x, p.y, '#ff5b5b', 20);
        }

        continue;
      }

      if (e.kind === 'boss' || e.kind === 'midBoss') {
        continue;
      }

      const hit = e.r
        ? Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r
        : Math.abs(p.x - e.x) < e.w / 2 + p.r &&
          Math.abs(p.y - e.y) < e.h / 2 + p.r;

      if (hit) {
        e.dead = true;

        if (isSkillInvincible(e)) {
          addText('GUARD', p.x, p.y - 50, '#9deeff');
          burst(p.x, p.y, '#9deeff', 12);
          continue;
        }

        const dmg = Math.max(1, Math.ceil(e.hp));
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
      e.kind === 'boss' ? '#ff4aff' : '#ffe66b',
      e.kind === 'boss' ? 70 : 24
    );

    let coin = 0;
    const score = e.score || 0;

    if (e.kind === 'midBoss' || e.kind === 'boss') {
      coin = Number(e.coin || 0);
    } else {
      coin = intRand(e.coinMin || 1, e.coinMax || 3);
    }

    state.coin += coin;
    state.score += score;

    if (window.MobShotMission && window.MobShotMission.onEntityKilled) {
      window.MobShotMission.onEntityKilled(e, coin);
    }

    addText(`+${score} SCORE`, e.x, e.y - 24, '#6be6ff');
    addText(`+${coin} COIN`, e.x, e.y, '#ffcf5b');
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
