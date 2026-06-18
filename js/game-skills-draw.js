'use strict';

(function(){
  const S = window.MobShotGameSkillsShared = window.MobShotGameSkillsShared || {};

  function state(){ return S.gameState; }
  function effects(){ return S.skillEffects || []; }
  function bullets(){ return S.skillBullets || []; }
  function frame(){ return Number(S.frameCount || 0); }
  function img(src){ return S.img ? S.img(src) : null; }
  function imageReady(image){ return S.imageReady ? S.imageReady(image) : image && image.complete && image.naturalWidth > 0; }

  function draw(ctx){
    if (!state()) return;

    for (const bullet of bullets()) {
      if (bullet.delay && bullet.delay > 0) continue;
      drawSkillBullet(ctx, bullet);
    }

    drawStuckDots(ctx);
    drawEffects(ctx);
  }

  function drawSkillBullet(ctx, bullet){
    let image = img(bullet.skill && bullet.skill.bulletImage);

    if (bullet.type === 'sisterBlue' || bullet.type === 'sisterYellow' || bullet.type === 'sisterRed') {
      image = img('atk/atkriri.png');
    }

    if (bullet.type === 'darkFire') image = img('atk/atkmaoh.png');
    if (bullet.type === 'bookHero') image = img('pet/pet hero.png');

    let size = 34;

    if (bullet.type === 'rocket') size = 54;
    if (bullet.type === 'energyRush') size = 32;
    if (bullet.type === 'twinMissile') size = Number((bullet.skill && bullet.skill.bulletSize) || 44);
    if (bullet.type === 'rosePulse') size = 58;
    if (bullet.type === 'darkThunder') size = 44;
    if (bullet.type === 'darkAura') size = 58;
    if (bullet.type === 'darkFire') size = 72;
    if (bullet.type === 'neonBomb') size = Number((bullet.skill && bullet.skill.bulletSize) || 104);
    if (bullet.type === 'neptuneAttack') size = Number((bullet.skill && bullet.skill.bulletSize) || 64);
    if (bullet.type === 'miraPoison') size = 48;
    if (bullet.type === 'sisterRed') size = 38;
    if (bullet.type === 'sisterBlue' || bullet.type === 'sisterYellow') size = 28;

    const hasDark = effects().some(e => e.type === 'darkPower');

    if (
      hasDark &&
      (
        bullet.type === 'rocket' ||
        bullet.type === 'energyRush' ||
        bullet.type === 'twinMissile'
      )
    ) {
      size *= 1.35;
    }

    if (bullet.type === 'darkAura') {
      drawDarkAuraBullet(ctx, bullet, size);
      return;
    }

    if (bullet.type === 'neonBomb') {
      drawNeonBombBullet(ctx, bullet, size, image);
      return;
    }

    if (bullet.type === 'neptuneAttack') {
      drawRotatedBullet(ctx, bullet, image, size, '#6be6ff');
      return;
    }

    if (bullet.type === 'miraPoison') {
      drawRotatedBullet(ctx, bullet, image, size, '#a6ff5c');
      return;
    }

    if (bullet.type === 'darkFire') {
      drawRotatedBullet(ctx, bullet, image, size, '#8b3cff', true);
      return;
    }

    if (imageReady(image)) {
      ctx.save();

      if (bullet.type === 'rosePulse') {
        ctx.translate(bullet.x, bullet.y);
        ctx.scale(1, -1);
        ctx.drawImage(image, -size / 2, -size / 2, size, size);
      } else {
        ctx.drawImage(image, bullet.x - size / 2, bullet.y - size / 2, size, size);
      }

      ctx.restore();
    } else {
      ctx.fillStyle =
        bullet.type === 'rocket' ? '#ff6b22' :
        bullet.type === 'rosePulse' ? '#ff7ab8' :
        bullet.type === 'darkThunder' ? '#30003f' :
        '#9deeff';

      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRotatedBullet(ctx, bullet, image, size, fallbackColor, glow){
    const angle = Math.atan2(Number(bullet.vy || -1), Number(bullet.vx || 0)) + Math.PI / 2;

    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(angle);

    if (glow) {
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = fallbackColor;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.50, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (imageReady(image)) {
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = fallbackColor;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.28, size * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawNeonBombBullet(ctx, bullet, size, image){
    const pulse = 1 + Math.sin(frame() * 0.18) * 0.08;
    const rot = Math.sin(frame() * 0.08) * 0.22;

    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(rot);

    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#ff3ff2';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.62 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#37e8ff';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.48 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;

    if (imageReady(image)) {
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = '#ff3ff2';
      ctx.strokeStyle = '#37e8ff';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawDarkAuraBullet(ctx, bullet, size){
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.rot || 0);

    ctx.globalAlpha = 0.50;
    ctx.fillStyle = '#08000d';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.42, size * 0.20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#36004f';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.34, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.62;
    ctx.strokeStyle = '#b45cff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.46, size * 0.23, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawStuckDots(ctx){
    if (!state()) return;

    state().entities.forEach(e => {
      if (e.dead) return;

      if (e.__darkDot) drawDotIcon(ctx, e, 'atk/blackrai.png', '#b45cff', 38);
      if (e.__miraPoison) drawPoisonStuck(ctx, e);
      if (e.__neonBurn) drawNeonStuck(ctx, e);
    });
  }

  function drawDotIcon(ctx, e, src, color, baseSize){
    const image = img(src);
    const size = baseSize + Math.sin(frame() * 0.5) * 4;

    ctx.save();

    if (imageReady(image)) {
      ctx.drawImage(image, e.x - size / 2, e.y - size / 2, size, size);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y - 24);
      ctx.lineTo(e.x - 10, e.y);
      ctx.lineTo(e.x + 12, e.y - 4);
      ctx.lineTo(e.x, e.y + 24);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawPoisonStuck(ctx, e){
    const size = 34 + Math.sin(frame() * 0.35) * 4;

    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = '#a6ff5c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(e.x, e.y, size, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#6dff6d';
    ctx.beginPath();
    ctx.arc(e.x, e.y, size * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNeonStuck(ctx, e){
    const size = 40 + Math.sin(frame() * 0.4) * 6;

    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#ff3ff2';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(e.x, e.y, size, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#37e8ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(e.x, e.y, size * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawEffects(ctx){
    const st = state();
    if (!st) return;

    const p = st.player;

    effects().forEach(effect => {
      if (effect.type === 'timeMagic') {
        const alpha = Math.min(0.78, 0.35 + (effect.timer / effect.total) * 0.25);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.restore();
      }

      if (effect.type === 'blackHole') drawBlackHole(ctx, effect);
      if (effect.type === 'goldRush') drawGoldRushCounter(ctx, effect);
      if (effect.type === 'explosion') drawExplosion(ctx, effect);
      if (effect.type === 'smallExplosion') drawSmallExplosion(ctx, effect);
      if (effect.type === 'neonExplosion') drawNeonExplosion(ctx, effect);

      if (effect.type === 'blackHoleDamage') drawDamageText(ctx, effect, '-1', '#ffffff', 18, 18);
      if (effect.type === 'smoke') drawSmoke(ctx, effect);
      if (effect.type === 'muzzleFlash') drawCircleFlash(ctx, effect, '#9deeff', 34, 16);

      if (
        effect.type === 'energyHit' ||
        effect.type === 'roseHit' ||
        effect.type === 'darkThunderHit' ||
        effect.type === 'dotHit' ||
        effect.type === 'darkHit' ||
        effect.type === 'darkFireHit' ||
        effect.type === 'neonHit' ||
        effect.type === 'neptuneHit' ||
        effect.type === 'miraPoisonHit' ||
        effect.type === 'miraPoisonSpark' ||
        effect.type === 'bookHeroHit' ||
        effect.type === 'bookHeroSpark'
      ) {
        drawHitEffect(ctx, effect);
      }

      if (effect.type === 'darkSpark') drawDarkSpark(ctx, effect);
      if (effect.type === 'darkAuraPulse') drawDarkAuraPulse(ctx, effect);

      if (effect.type === 'boomText' || effect.type === 'skillText' || effect.type === 'healNumber') {
        drawFloatingText(ctx, effect);
      }

      if (effect.type === 'thunderFall') drawThunderFall(ctx, effect);
      if (effect.type === 'thunderImpact') drawThunderImpact(ctx, effect);

      if (effect.type === 'arcaneBarrier') drawArcaneBarrier(ctx, effect, p);
      if (effect.type === 'darkPower') drawDarkPower(ctx, effect, p);
      if (effect.type === 'darkAfterImage') drawDarkAfterImage(ctx, effect);
      if (effect.type === 'darkBurst') drawDarkBurst(ctx, effect);
      if (effect.type === 'darkFireFlash') drawCircleFlash(ctx, effect, '#8b3cff', 50, 18);

      if (effect.type === 'shadowClone') drawShadowClone(ctx, effect, p);
      if (effect.type === 'healBreeze') drawHealBreeze(ctx, effect);
      if (effect.type === 'goldRushBurst') drawGoldRushBurst(ctx, effect);
      if (effect.type === 'darkThunderFlash') drawCircleStroke(ctx, effect, '#b45cff', 72, 20);

      if (effect.type === 'lilithSisters') drawLilithSisters(ctx, effect);
      if (effect.type === 'whiteHealMini') drawCircleFlash(ctx, effect, '#ffffff', 26, 16);

      if (effect.type === 'neptuneFlash') drawCircleFlash(ctx, effect, '#6be6ff', 64, 22);
      if (effect.type === 'miraPoisonFlash') drawCircleFlash(ctx, effect, '#a6ff5c', 58, 20);
      if (effect.type === 'bookHero') drawBookHero(ctx, effect);
      if (effect.type === 'bookHeroSummon') drawBookHeroSummon(ctx, effect);
    });
  }

  function drawHitEffect(ctx, effect){
    const max =
      effect.type === 'bookHeroSpark' ? 12 :
      effect.type === 'miraPoisonSpark' ? 14 :
      20;

    const alpha = effect.timer / max;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle =
      effect.type === 'roseHit' ? '#ff8cff' :
      effect.type === 'darkHit' || effect.type === 'darkThunderHit' || effect.type === 'dotHit' || effect.type === 'darkFireHit' ? '#b45cff' :
      effect.type === 'neonHit' ? '#ff3ff2' :
      effect.type === 'neptuneHit' ? '#6be6ff' :
      effect.type === 'miraPoisonHit' || effect.type === 'miraPoisonSpark' ? '#a6ff5c' :
      effect.type === 'bookHeroHit' || effect.type === 'bookHeroSpark' ? '#ffe66b' :
      '#9deeff';

    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 42 * (1 - alpha + .25), 0, Math.PI * 2);
    ctx.fill();

    if (effect.type === 'neonHit') {
      ctx.strokeStyle = '#37e8ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 54 * (1 - alpha * 0.45), 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSmoke(ctx, effect){
    const alpha = Math.max(0, effect.timer / 20);
    ctx.globalAlpha = alpha * 0.38;
    ctx.fillStyle = '#777';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (1.2 - alpha * .2), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawCircleFlash(ctx, effect, color, radius, maxTimer){
    const alpha = effect.timer / maxTimer;

    ctx.save();
    ctx.globalAlpha = alpha * 0.75;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius * (1 - alpha * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCircleStroke(ctx, effect, color, radius, maxTimer){
    const alpha = effect.timer / maxTimer;

    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius * (1 - alpha * 0.4), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawDamageText(ctx, effect, text, color, fontSize, maxTimer){
    const alpha = effect.timer / maxTimer;

    ctx.globalAlpha = alpha;
    ctx.font = `900 ${fontSize}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.strokeText(text, effect.x, effect.y - (1 - alpha) * 20);
    ctx.fillText(text, effect.x, effect.y - (1 - alpha) * 20);
    ctx.globalAlpha = 1;
  }

  function drawBlackHole(ctx, effect){
    const image = img(effect.skill && effect.skill.bulletImage);
    const size = 132 + Math.sin(frame() * 0.25) * 8;

    ctx.save();
    ctx.translate(effect.x, effect.y);
    ctx.rotate(effect.rot || 0);

    if (imageReady(image)) {
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = '#050009';
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#b45cff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawGoldRushCounter(ctx, effect){
    const sec = Math.max(0, Math.ceil(effect.timer / 60));
    const pulse = 1 + Math.sin(frame() * 0.22) * 0.04;
    const x = window.innerWidth / 2;
    const y = 92;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);

    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#ffcf5b';
    roundedRect(ctx, -118, -30, 236, 52, 18);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.font = '900 24px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.fillStyle = '#ffd93d';

    ctx.strokeText(`RUSH ×${Number(effect.multiplier || 1).toFixed(1)} ${sec}`, 0, 0);
    ctx.fillText(`RUSH ×${Number(effect.multiplier || 1).toFixed(1)} ${sec}`, 0, 0);

    ctx.restore();
  }

  function roundedRect(ctx, x, y, w, h, r){
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
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

  function drawExplosion(ctx, effect){
    const alpha = Math.max(0, effect.timer / 32);
    const grow = 1 - alpha;

    ctx.globalAlpha = alpha * 0.25;
    ctx.fillStyle = '#ff3b00';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (.65 + grow * .25), 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.42;
    ctx.fillStyle = '#ffb02e';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (.42 + grow * .18), 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.70;
    ctx.fillStyle = '#fff6a8';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (.18 + grow * .08), 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (.25 + grow * .65), 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  function drawSmallExplosion(ctx, effect){
    const alpha = effect.timer / 20;

    ctx.globalAlpha = alpha * 0.75;
    ctx.fillStyle = '#ffb02e';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (1 - alpha * .25), 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (1 - alpha * .5), 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  function drawNeonExplosion(ctx, effect){
    const alpha = Math.max(0, effect.timer / 44);
    const grow = 1 - alpha;

    ctx.save();

    ctx.globalAlpha = alpha * 0.28;
    ctx.fillStyle = '#ff3ff2';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (.70 + grow * .20), 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.34;
    ctx.fillStyle = '#37e8ff';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (.48 + grow * .18), 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.68;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (.22 + grow * .70), 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.95;
    ctx.strokeStyle = '#ff3ff2';
    ctx.lineWidth = 5;

    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 / 12) * i + frame() * 0.08;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(
        effect.x + Math.cos(a) * effect.radius * (0.35 + grow * 0.65),
        effect.y + Math.sin(a) * effect.radius * (0.35 + grow * 0.65)
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawFloatingText(ctx, effect){
    const max =
      effect.type === 'boomText' ? 44 :
      effect.type === 'healNumber' ? 56 :
      42;

    const alpha = effect.timer / max;

    ctx.globalAlpha = alpha;
    ctx.font =
      effect.type === 'boomText' ? '900 34px system-ui' :
      effect.type === 'healNumber' ? '900 36px system-ui' :
      '900 20px system-ui';

    ctx.textAlign = 'center';
    ctx.fillStyle = effect.type === 'healNumber' ? '#9dff73' : '#ffe66b';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    ctx.strokeText(effect.text, effect.x, effect.y - (1 - alpha) * 28);
    ctx.fillText(effect.text, effect.x, effect.y - (1 - alpha) * 28);
    ctx.globalAlpha = 1;
  }

  function drawThunderFall(ctx, effect){
    const progress = 1 - effect.timer / effect.total;
    const y = effect.y + (effect.targetY - effect.y) * progress;

    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = '#fff36b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(effect.x, -40);
    ctx.lineTo(effect.x - 16, y - 30);
    ctx.lineTo(effect.x + 12, y - 42);
    ctx.lineTo(effect.x, y);
    ctx.stroke();

    ctx.strokeStyle = '#9deeff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(effect.x + 18, -20);
    ctx.lineTo(effect.x + 4, y - 25);
    ctx.lineTo(effect.x + 24, y - 4);
    ctx.stroke();

    ctx.globalAlpha = 1;

    if (effect.timer <= 1 && S.FX && S.FX.thunderImpact) {
      S.FX.thunderImpact(effect);
    }
  }

  function drawThunderImpact(ctx, effect){
    const alpha = effect.timer / 30;

    ctx.globalAlpha = alpha * 0.65;
    ctx.fillStyle = '#fff36b';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 54 * (1 - alpha * .35), 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#9deeff';
    ctx.lineWidth = 4;

    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 / 6) * i + frame() * 0.08;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.x + Math.cos(a) * 62, effect.y + Math.sin(a) * 62);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  function drawDarkSpark(ctx, effect){
    const alpha = effect.timer / 10;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#c04fff';
    ctx.lineWidth = 3;

    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 / 5) * i + frame() * 0.35;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.x + Math.cos(a) * 24, effect.y + Math.sin(a) * 24);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawDarkAuraPulse(ctx, effect){
    const alpha = effect.timer / 18;

    ctx.save();
    ctx.globalAlpha = alpha * 0.38;
    ctx.strokeStyle = '#b45cff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 72 * (1 - alpha * 0.35), 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.16;
    ctx.fillStyle = '#08000d';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 54 * (1 - alpha * 0.15), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawArcaneBarrier(ctx, effect, p){
    const r1 = 72 + Math.sin(frame() * 0.12) * 4;
    const r2 = 88 + Math.cos(frame() * 0.1) * 4;
    const r3 = 104 + Math.sin(frame() * 0.18) * 5;

    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = '#dff9ff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.78;
    ctx.strokeStyle = '#d8e8f2';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#8ea1aa';
    ctx.lineWidth = 4;

    for (let i = 0; i < 12; i++) {
      const a = effect.rot + (Math.PI * 2 / 12) * i;
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(a) * (r1 - 8), p.y + Math.sin(a) * (r1 - 8));
      ctx.lineTo(p.x + Math.cos(a) * (r2 + 8), p.y + Math.sin(a) * (r2 + 8));
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawDarkPower(ctx, effect, p){
    const pulse = 1 + Math.sin(frame() * 0.16) * 0.055;
    const wobble = Math.sin(frame() * 0.27) * 2;

    ctx.save();

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 8, 38 * pulse, 48 * pulse, wobble * 0.02, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#3a005a';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 8, 52 * pulse, 62 * pulse, wobble * 0.015, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#b45cff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 8, 58 * pulse, 68 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    drawDarkOrbitBullets(ctx, p);

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawDarkOrbitBullets(ctx, p){
    const image = img('atk/atkmaoh.png');

    for (let i = 0; i < 5; i++) {
      const a = frame() * 0.045 + (Math.PI * 2 / 5) * i;
      const r = 44 + Math.sin(frame() * 0.08 + i) * 6;
      const x = p.x + Math.cos(a) * r;
      const y = p.y - 12 + Math.sin(a) * r * 0.72;
      const size = 18 + Math.sin(frame() * 0.13 + i) * 3;

      ctx.save();
      ctx.globalAlpha = 0.82;
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2);

      if (imageReady(image)) {
        ctx.drawImage(image, -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = '#8b3cff';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function drawDarkAfterImage(ctx, effect){
    const alpha = effect.timer / 18;

    ctx.globalAlpha = alpha * 0.18;
    ctx.fillStyle = '#07000d';
    ctx.beginPath();
    ctx.ellipse(effect.x, effect.y - 8, 26, 34, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.20;
    ctx.strokeStyle = '#b45cff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(effect.x, effect.y - 8, 30, 38, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  function drawDarkBurst(ctx, effect){
    const alpha = effect.timer / 36;
    const radius = 100 * (1 - alpha);

    ctx.globalAlpha = alpha * 0.45;
    ctx.strokeStyle = '#b45cff';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawShadowClone(ctx, effect, p){
    const count = Number(effect.cloneCount || 2);
    const offsets = count >= 3 ? [-72, 0, 72] : [-54, 54];

    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = '#7cff8a';
    ctx.strokeStyle = '#d7ffdf';
    ctx.lineWidth = 4;

    offsets.forEach((off, i) => {
      const x = p.x + off;
      const y = p.y + Math.sin(frame() * 0.15 + i) * 5;

      ctx.beginPath();
      ctx.ellipse(x, y - 8, 30, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawHealBreeze(ctx, effect){
    ctx.save();

    const alpha = Math.min(1, effect.timer / Math.max(1, effect.total || 600));
    const pulse = 1 + Math.sin(frame() * 0.16) * 0.05;

    ctx.globalAlpha = 0.24 + alpha * 0.18;
    ctx.fillStyle = '#9dff73';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 96 * pulse, 0, Math.PI * 2);
    ctx.fill();

    effect.leaves.forEach(l => {
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.fillStyle = '#9dff73';
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawGoldRushBurst(ctx, effect){
    ctx.save();

    const alpha = effect.timer / 60;

    effect.coins.forEach(c => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);

      ctx.fillStyle = '#ffcf5b';
      ctx.strokeStyle = '#7a4300';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7a4300';
      ctx.font = '900 10px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 1);

      ctx.restore();
    });

    ctx.globalAlpha = alpha * 0.18;
    ctx.fillStyle = '#ffcf5b';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawLilithSisters(ctx, effect){
    effect.sisters.forEach(s => {
      const image = img(s.image);
      const size = 52;

      if (imageReady(image)) {
        ctx.drawImage(image, s.x - size / 2, s.y - size / 2, size, size);
      } else {
        ctx.fillStyle =
          s.id === 'blue' ? '#6be6ff' :
          s.id === 'yellow' ? '#ffe66b' :
          s.id === 'white' ? '#ffffff' :
          '#ff5b5b';

        ctx.beginPath();
        ctx.arc(s.x, s.y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function drawBookHero(ctx, effect){
    const image = img(effect.image || 'pet/pet hero.png');
    const size = Number(effect.size || 70);
    const pulse = 1 + Math.sin(frame() * 0.2) * 0.06;
    const angle = Math.atan2(Number(effect.vy || -1), Number(effect.vx || 0)) + Math.PI / 2;

    ctx.save();
    ctx.translate(effect.x, effect.y);
    ctx.rotate(angle);

    ctx.globalAlpha = 0.26;
    ctx.fillStyle = '#ffe66b';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.58 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.48;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.45 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;

    if (imageReady(image)) {
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = '#ffe66b';
      ctx.strokeStyle = '#7a4300';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBookHeroSummon(ctx, effect){
    const alpha = effect.timer / 34;
    const r = 88 * (1 - alpha * 0.35);

    ctx.save();

    ctx.globalAlpha = alpha * 0.48;
    ctx.fillStyle = '#ffe66b';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, r * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  S.Draw = {
    draw,
    drawSkillBullet,
    drawEffects,
    drawDarkThunderStuck: drawStuckDots
  };
})();
