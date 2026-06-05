js/game-render.js を丸ごと置き換えてください。

'use strict';
(function(){
  function drawImageContain(ctx, image, centerX, centerY, boxW, boxH) {
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    const ratio = Math.min(
      boxW / image.naturalWidth,
      boxH / image.naturalHeight
    );
    const iw = image.naturalWidth * ratio;
    const ih = image.naturalHeight * ratio;
    ctx.drawImage(
      image,
      centerX - iw / 2,
      centerY - ih / 2,
      iw,
      ih
    );
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function drawBackground(ctx, D, W, H, scroll, img, imageReady) {
    const bg = img(D.stage.background);
    if (imageReady(bg)) {
      const y1 = (scroll % H) - H;
      ctx.drawImage(bg, 0, y1, W, H);
      ctx.drawImage(bg, 0, y1 + H, W, H);
      ctx.drawImage(bg, 0, y1 + H * 2, W, H);
      return;
    }
    ctx.fillStyle = '#58ba48';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#3b9b37';
    ctx.beginPath();
    ctx.moveTo(W * 0.12, 0);
    ctx.lineTo(W * 0.88, 0);
    ctx.lineTo(W * 0.8, H);
    ctx.lineTo(W * 0.2, H);
    ctx.closePath();
    ctx.fill();
  }
  function drawGate(ctx, gate, img, imageReady) {
    const im = img(gate.image);
    const size = 118;
    if (imageReady(im)) {
      drawImageContain(ctx, im, gate.x, gate.y, size, size);
      return;
    }
    ctx.save();
    ctx.translate(gate.x, gate.y);
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = gate.color || '#277dff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 54, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(gate.name || 'GATE', 0, 0);
    ctx.fillText(gate.name || 'GATE', 0, 0);
    ctx.restore();
  }
  function drawFallbackEntity(ctx, entity, y, size) {
    ctx.save();
    ctx.translate(entity.x, y);
    ctx.fillStyle =
      entity.kind === 'chest' ? '#b77822' :
      entity.kind === 'gimmick' ? '#86664a' :
      entity.kind === 'midBoss' || entity.kind === 'boss' ? '#42215f' :
      '#151822';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = '900 11px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(entity.name || 'NO IMG', 0, 0);
    ctx.fillText(entity.name || 'NO IMG', 0, 0);
    ctx.restore();
  }
  function drawHpNumber(ctx, entity, y, size) {
    const ratio = Math.max(0, entity.hp / entity.maxHp);
    const barW = size * 0.78;
    const barH = 8;
    const barX = entity.x - barW / 2;
    const barY = y + size / 2 + 6;
    ctx.fillStyle = 'rgba(0,0,0,.58)';
    roundRect(ctx, barX, barY, barW, barH, 6);
    ctx.fill();
    ctx.fillStyle = ratio > 0.45 ? '#ffe66b' : '#ff5b5b';
    roundRect(ctx, barX, barY, barW * ratio, barH, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const hpText = String(Math.ceil(entity.hp));
    ctx.strokeText(hpText, entity.x, barY + 10);
    ctx.fillText(hpText, entity.x, barY + 10);
  }
  function entitySize(entity) {
    if (entity.kind === 'boss') return 168;
    if (entity.kind === 'midBoss') return 130;
    if (entity.kind === 'enemy' && entity.name === 'モブロック') return 92;
    if (entity.kind === 'enemy') return 84;
    if (entity.kind === 'gimmick') return 104;
    if (entity.kind === 'chest') return 82;
    return 70;
  }
  function drawEntity(ctx, entity, img, imageReady) {
    if (entity.kind === 'enemyBullet') {
      ctx.fillStyle = '#ff4aff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, entity.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (entity.kind === 'gate') {
      drawGate(ctx, entity, img, imageReady);
      return;
    }
    const y =
      entity.kind === 'enemy' ||
      entity.kind === 'midBoss' ||
      entity.kind === 'boss'
        ? entity.y + Math.sin(entity.bob || 0) * 5
        : entity.y;
    const size = entitySize(entity);
    const im = entity.image ? img(entity.image) : null;
    if (imageReady(im)) {
      drawImageContain(ctx, im, entity.x, y, size, size);
    } else {
      drawFallbackEntity(ctx, entity, y, size);
    }
    if (entity.hp != null && entity.maxHp != null) {
      drawHpNumber(ctx, entity, y, size);
    }
  }
  function drawBullet(ctx, bullet, D, img, imageReady) {
    const im = img(D.player.bulletImage);
    if (imageReady(im)) {
      drawImageContain(ctx, im, bullet.x, bullet.y, 18, 18);
      return;
    }
    ctx.fillStyle = '#ffdf35';
    ctx.strokeStyle = '#7a4300';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  function drawPlayer(ctx, player, D, img, imageReady) {
    const im = img(D.player.image);
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + 35, 40, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    if (imageReady(im)) {
      drawImageContain(ctx, im, player.x, player.y - 8, 76, 92);
      return;
    }
    ctx.fillStyle = '#11131e';
    ctx.strokeStyle = '#2b3654';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  function drawParticle(ctx, particle) {
    ctx.globalAlpha = Math.max(0, particle.life / 34);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, 6, 6);
    ctx.globalAlpha = 1;
  }
  function drawText(ctx, textItem) {
    ctx.globalAlpha = Math.max(0, textItem.life / 48);
    ctx.fillStyle = textItem.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'center';
    ctx.strokeText(textItem.text, textItem.x, textItem.y);
    ctx.fillText(textItem.text, textItem.x, textItem.y);
    ctx.globalAlpha = 1;
  }
  function drawAll(ctx, state, D, W, H, scroll, img, imageReady) {
    ctx.clearRect(0, 0, W, H);
    drawBackground(ctx, D, W, H, scroll, img, imageReady);
    for (const entity of state.entities) {
      drawEntity(ctx, entity, img, imageReady);
    }
    for (const bullet of state.bullets) {
      drawBullet(ctx, bullet, D, img, imageReady);
    }
    drawPlayer(ctx, state.player, D, img, imageReady);
    for (const particle of state.particles) {
      drawParticle(ctx, particle);
    }
    for (const textItem of state.texts) {
      drawText(ctx, textItem);
    }
  }
  window.MobShotRender = {
    drawAll
  };
})();
