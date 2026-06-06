'use strict';

(function(){
  function updateMidBoss(e, tools){
    const state = tools.state;
    const W = tools.W;
    const H = tools.H;
    const rand = tools.rand;
    const clamp = tools.clamp;
    const addText = tools.addText;

    if (e.y < e.targetY && !e.diveMode) {
      e.y += e.vy;
      return;
    }

    if (e.hitPlayerCd > 0) {
      e.hitPlayerCd--;
    }

    if (e.diveMode) {
      e.x += e.diveVx;
      e.y += e.diveVy;

      if (e.y > H + 90) {
        e.diveMode = false;
        e.diveReturn = true;
        e.x = clamp(e.x, W * 0.2, W * 0.8);
        e.y = -110;
        e.targetY = e.baseY;
        e.vx = rand(1.1, 1.7) * (Math.random() < 0.5 ? -1 : 1);
        e.attackCd = 95;
      }

      return;
    }

    if (e.diveReturn) {
      e.y += e.vy;

      if (e.y >= e.baseY) {
        e.y = e.baseY;
        e.diveReturn = false;
      }

      return;
    }

    e.x += e.vx;

    if (e.x < W * 0.18 || e.x > W * 0.82) {
      e.vx *= -1;
    }

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = 76;
      enemyShot(e, tools);
    }

    if (e.attackCd <= 0) {
      startMidBossDive(e, tools);
    }
  }

  function startMidBossDive(e, tools){
    const state = tools.state;
    const addText = tools.addText;

    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const speed = 6.4;

    e.diveMode = true;
    e.diveVx = dx / len * speed;
    e.diveVy = dy / len * speed;

    addText('突進！', e.x, e.y - 54, '#ffcf5b');
  }

  function updateBoss(e, tools){
    const W = tools.W;

    if (e.y < e.targetY) {
      e.y += e.vy;
      return;
    }

    e.x += e.vx;

    if (e.x < W * 0.18 || e.x > W * 0.82) {
      e.vx *= -1;
    }

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = 48;
      bossFanShot(e, tools);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = 88;

      if (e.attackStep % 3 === 1) {
        bossWideRain(e, tools);
      } else if (e.attackStep % 3 === 2) {
        bossAimBurst(e, tools);
      } else {
        bossCrossShot(e, tools);
      }
    }
  }

  function enemyShot(e, tools){
    const state = tools.state;

    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const base = Math.atan2(dy, dx);

    state.entities.push({
      kind: 'enemyBullet',
      x: e.x,
      y: e.y + 30,
      vx: Math.cos(base) * 3.8,
      vy: Math.sin(base) * 3.8,
      r: 8,
      dmg: 9,
      dead: false,
      bob: 0,
      color: '#ff4aff'
    });
  }

  function bossFanShot(e, tools){
    const state = tools.state;

    const count = 5;
    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const base = Math.atan2(dy, dx);

    for (let i = 0; i < count; i++) {
      const angle = base + (i - (count - 1) / 2) * 0.22;

      state.entities.push({
        kind: 'enemyBullet',
        x: e.x,
        y: e.y + 64,
        vx: Math.cos(angle) * 3.6,
        vy: Math.sin(angle) * 3.6,
        r: 11,
        dmg: 14,
        dead: false,
        bob: 0,
        color: '#ff4aff'
      });
    }
  }

  function bossAimBurst(e, tools){
    const state = tools.state;
    const rand = tools.rand;
    const addText = tools.addText;

    addText('連射！', e.x, e.y - 92, '#ff5bff');

    for (let i = 0; i < 9; i++) {
      const delayAngle = (i - 4) * 0.08;
      const dx = state.player.x - e.x;
      const dy = state.player.y - e.y;
      const base = Math.atan2(dy, dx) + delayAngle;

      state.entities.push({
        kind: 'enemyBullet',
        x: e.x + rand(-28, 28),
        y: e.y + 66,
        vx: Math.cos(base) * 4.2,
        vy: Math.sin(base) * 4.2,
        r: 9,
        dmg: 11,
        dead: false,
        bob: 0,
        color: '#ff8cff'
      });
    }
  }

  function bossWideRain(e, tools){
    const state = tools.state;
    const W = tools.W;
    const addText = tools.addText;

    addText('羽弾！', e.x, e.y - 92, '#ffe66b');

    for (let i = 0; i < 7; i++) {
      const x = W * 0.18 + (W * 0.64) * (i / 6);

      state.entities.push({
        kind: 'enemyBullet',
        x,
        y: e.y + 42,
        vx: (i - 3) * 0.12,
        vy: 3.55 + Math.abs(i - 3) * 0.08,
        r: 10,
        dmg: 12,
        dead: false,
        bob: 0,
        color: '#ffe66b'
      });
    }
  }

  function bossCrossShot(e, tools){
    const state = tools.state;
    const addText = tools.addText;

    addText('拡散！', e.x, e.y - 92, '#6be6ff');

    const angles = [
      Math.PI * 0.28,
      Math.PI * 0.36,
      Math.PI * 0.44,
      Math.PI * 0.56,
      Math.PI * 0.64,
      Math.PI * 0.72
    ];

    angles.forEach(angle => {
      state.entities.push({
        kind: 'enemyBullet',
        x: e.x,
        y: e.y + 64,
        vx: Math.cos(angle) * 3.35,
        vy: Math.sin(angle) * 3.35,
        r: 10,
        dmg: 12,
        dead: false,
        bob: 0,
        color: '#6be6ff'
      });
    });
  }

  window.MobShotBoss = {
    updateMidBoss,
    updateBoss
  };
})();
