'use strict';

(function(){
  function specOf(e){
    if (
      window.MobShotBossData &&
      window.MobShotBossData.getAttackSpec
    ) {
      return window.MobShotBossData.getAttackSpec(e.name);
    }

    return {
      image: 'atk/hawkatk.png',
      flipY: true,
      small: 26,
      normal: 34,
      big: 48,
      huge: 62,
      color: '#ff4aff'
    };
  }

  function playerAngle(e, tools, sx, sy){
    const p = tools.state.player;
    return Math.atan2(p.y - sy, p.x - sx);
  }

  function pushEnemyBullet(e, tools, opt){
    opt = opt || {};

    const spec = specOf(e);
    const sizeType = opt.sizeType || 'normal';
    const r = Number(opt.r || spec[sizeType] || spec.normal || 34);
    const hp = Number(opt.hp || 0);
    const speed = Number(opt.speed || 2.8);
    const angle = Number(opt.angle || Math.PI / 2);
    const sx = opt.x != null ? opt.x : e.x;
    const sy = opt.y != null ? opt.y : e.y + 58;

    tools.state.entities.push({
      kind: 'enemyBullet',
      x: sx,
      y: sy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      dmg: Number(opt.dmg || Math.max(6, Math.ceil(r * 0.45))),
      hp,
      maxHp: hp,
      breakable: hp > 0,
      image: opt.image || spec.image,
      flipY: opt.flipY != null ? opt.flipY : spec.flipY,
      dead: false,
      bob: 0,
      color: opt.color || spec.color || '#ff4aff',
      life: Number(opt.life || 420),

      homing: !!opt.homing,
      homingPower: Number(opt.homingPower || 0.012),
      homingSpeed: Number(opt.homingSpeed || speed)
    });
  }

  function fireAimed(e, tools, opt){
    opt = opt || {};

    const sx = opt.x != null ? opt.x : e.x + Number(opt.offsetX || 0);
    const sy = opt.y != null ? opt.y : e.y + Number(opt.offsetY || 58);
    const angle = playerAngle(e, tools, sx, sy);

    pushEnemyBullet(
      e,
      tools,
      Object.assign({}, opt, {
        x: sx,
        y: sy,
        angle
      })
    );
  }

  function fireAngle(e, tools, angle, opt){
    pushEnemyBullet(
      e,
      tools,
      Object.assign({}, opt || {}, {
        angle
      })
    );
  }

  function fireSpread(e, tools, count, spread, opt){
    opt = opt || {};

    const sx = opt.x != null ? opt.x : e.x;
    const sy = opt.y != null ? opt.y : e.y + Number(opt.offsetY || 58);
    const base = playerAngle(e, tools, sx, sy);
    const safeCenter = !!opt.safeCenter;

    for (let i = 0; i < count; i++) {
      if (safeCenter && i === Math.floor(count / 2)) continue;

      const angle = base + (i - (count - 1) / 2) * spread;

      pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, {
          x: sx,
          y: sy,
          angle
        })
      );
    }
  }

  function fireFanDown(e, tools, count, opt){
    opt = opt || {};

    const spread = Number(opt.spread || 0.24);
    const base = Math.PI / 2;

    for (let i = 0; i < count; i++) {
      if (opt.safeCenter && i === Math.floor(count / 2)) continue;

      const angle = base + (i - (count - 1) / 2) * spread;

      pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, {
          angle
        })
      );
    }
  }

  function fireLineDown(e, tools, count, opt){
    opt = opt || {};

    const W = tools.W;
    const left = opt.left != null ? opt.left : W * 0.2;
    const right = opt.right != null ? opt.right : W * 0.8;
    const y = opt.y != null ? opt.y : e.y + 62;

    for (let i = 0; i < count; i++) {
      if (opt.safeCenter && i === Math.floor(count / 2)) continue;

      const x = count <= 1
        ? e.x
        : left + (right - left) * (i / (count - 1));

      pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, {
          x,
          y,
          angle: Math.PI / 2
        })
      );
    }
  }

  function fireWeakHoming(e, tools, count, opt){
    opt = opt || {};

    const p = tools.state.player;

    for (let i = 0; i < count; i++) {
      const sx = e.x + (i - (count - 1) / 2) * 28;
      const sy = e.y + 58;
      const angle = Math.atan2(p.y - sy, p.x - sx) + tools.rand(-0.16, 0.16);

      pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, {
          x: sx,
          y: sy,
          angle,
          speed: opt.speed || 2.25,
          homing: true,
          homingPower: opt.homingPower || 0.010,
          homingSpeed: opt.homingSpeed || 2.25,
          life: opt.life || 220
        })
      );
    }
  }

  function fireDelayedAimed(e, delay, opt){
    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'aim'
      })
    );
  }

  function fireDelayedAngle(e, delay, angle, opt){
    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'angle',
        angle
      })
    );
  }

  function fireDelayedLine(e, delay, count, opt){
    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'line',
        count
      })
    );
  }

  function fireDelayedHoming(e, delay, count, opt){
    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'homing',
        count
      })
    );
  }

  function processPendingShots(e, tools){
    if (!e.pendingShots || !e.pendingShots.length) return;

    for (const shot of e.pendingShots) {
      shot.delay--;
    }

    const ready = e.pendingShots.filter(shot => shot.delay <= 0);
    e.pendingShots = e.pendingShots.filter(shot => shot.delay > 0);

    ready.forEach(shot => {
      if (shot.kind === 'aim') {
        fireAimed(e, tools, shot);
      }

      if (shot.kind === 'angle') {
        fireAngle(e, tools, shot.angle, shot);
      }

      if (shot.kind === 'line') {
        fireLineDown(e, tools, shot.count || 3, shot);
      }

      if (shot.kind === 'homing') {
        fireWeakHoming(e, tools, shot.count || 1, shot);
      }

      if (shot.kind === 'fan') {
        fireFanDown(e, tools, shot.count || 5, shot);
      }

      if (shot.kind === 'spread') {
        fireSpread(
          e,
          tools,
          shot.count || 3,
          shot.spread || 0.22,
          shot
        );
      }
    });
  }

  function chargeAimed(e, tools, text, count, opt){
    opt = opt || {};

    if (tools.addText && text) {
      tools.addText(text, e.x, e.y - 88, opt.textColor || '#ffe66b');
    }

    for (let i = 0; i < count; i++) {
      fireDelayedAimed(
        e,
        46 + i * Number(opt.gap || 24),
        Object.assign({}, opt, {
          sizeType: opt.sizeType || 'big',
          hp: opt.hp || 20,
          speed: opt.speed || 2.15
        })
      );
    }
  }

  function chargeLine(e, tools, text, count, opt){
    opt = opt || {};

    if (tools.addText && text) {
      tools.addText(text, e.x, e.y - 88, opt.textColor || '#ffe66b');
    }

    fireDelayedLine(
      e,
      Number(opt.delay || 48),
      count,
      Object.assign({}, opt, {
        sizeType: opt.sizeType || 'big',
        hp: opt.hp || 18,
        speed: opt.speed || 2.2
      })
    );
  }

  function chargeHoming(e, tools, text, count, opt){
    opt = opt || {};

    if (tools.addText && text) {
      tools.addText(text, e.x, e.y - 88, opt.textColor || '#9deeff');
    }

    for (let i = 0; i < count; i++) {
      fireDelayedHoming(
        e,
        38 + i * Number(opt.gap || 20),
        1,
        Object.assign({}, opt, {
          sizeType: opt.sizeType || 'normal',
          hp: opt.hp || 0,
          speed: opt.speed || 2.15,
          homingPower: opt.homingPower || 0.010
        })
      );
    }
  }

  function fireWave(e, tools, count, opt){
    opt = opt || {};

    const baseY = e.y + 58;
    const W = tools.W;

    for (let i = 0; i < count; i++) {
      const x = W * 0.2 + (W * 0.6) * (i / Math.max(1, count - 1));
      const offsetAngle = Math.sin(i * 0.9) * 0.22;

      pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, {
          x,
          y: baseY,
          angle: Math.PI / 2 + offsetAngle,
          sizeType: opt.sizeType || 'normal',
          speed: opt.speed || 2.35
        })
      );
    }
  }

  function fireCross(e, tools, opt){
    opt = opt || {};

    const angles = [
      Math.PI / 2,
      Math.PI * 0.36,
      Math.PI * 0.64
    ];

    angles.forEach(angle => {
      pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, {
          angle
        })
      );
    });
  }

  window.MobShotBossBullets = {
    pushEnemyBullet,
    fireAimed,
    fireAngle,
    fireSpread,
    fireFanDown,
    fireLineDown,
    fireWeakHoming,
    fireDelayedAimed,
    fireDelayedAngle,
    fireDelayedLine,
    fireDelayedHoming,
    processPendingShots,
    chargeAimed,
    chargeLine,
    chargeHoming,
    fireWave,
    fireCross
  };
})();
