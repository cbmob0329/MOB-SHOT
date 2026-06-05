'use strict';

(function(){
  function drawImageContain(ctx, image, centerX, centerY, boxW, boxH) {
    const ratio = Math.min(boxW / image.naturalWidth, boxH / image.naturalHeight);
    const iw = image.naturalWidth * ratio;
    const ih = image.naturalHeight * ratio;
    ctx.drawImage(image, centerX - iw / 2, centerY - ih / 2, iw, ih);
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

  function drawGate(ctx, g, img, imageReady) {
    const im = img(g.image);
    const size = 118;

    if (imageReady(im)) {
      drawImageContain(ctx, im, g.x, g.y, size, size);
      return;
    }

    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = g.color || '#277dff';
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
    ctx.strokeText(g.name, 0, 0);
    ctx.fillText(g.name, 0, 0);
    ctx.restore();
  }

  function drawFallbackEntity(ctx, e, y, size) {
    ctx.save();
    ctx.translate(e.x, y);

    ctx.fillStyle =
      e.kind === 'chest' ? '#b77822' :
      e.kind === 'gimmick' ? '#86664a' :
      e.kind === 'midBoss' || e.kind === 'boss' ? '#42215f' :
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
    ctx.strokeText(e.name || 'NO IMG', 0, 0);
    ctx.fillText(e.name || 'NO IMG', 0, 0);
    ctx.restore();
  }

  function drawHpNumber(ctx, e, y, size) {
    const ratio = Math.max(0, e.hp / e.maxHp);
    const barW = size * 0.78;
    const barH = 8;
    const barX = e.x - barW / 2;
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

    const hpText = String(Math.ceil(e.hp));
    ctx.strokeText(hpText, e.x, barY + 10);
    ctx.fillText(hpText, e.x, barY + 10);
  }

  function drawEntity(ctx, e, img, imageReady) {
    if (e.kind === 'enemyBullet') {
      ctx.fillStyle = '#ff4aff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (e.kind === 'gate') {
      drawGate(ctx, e, img, imageReady);
      return;
    }

    const y =
      e.kind === 'enemy' ||
      e.kind === 'midBoss' ||
      e.kind === 'boss'
        ? e.y + Math.sin(e.bob) * 5
        : e.y;

    const im = e.image ? img(e.image) : null;

    const size =
      e.kind === 'boss' ? 168 :
      e.kind === 'midBoss' ? 130 :
      e.kind === 'enemy' && e.name === 'モブロック' ? 92 :
      e.kind === 'enemy' ? 84 :
      e.kind === 'gimmick' ? 104 :
      e.kind === 'chest' ? 82 :
      70;

    if (imageReady(im)) {
      drawImageContain(ctx, im, e.x, y, size, size);
    } else {
      drawFallbackEntity(ctx, e, y, size);
    }

    if (e.hp != null) drawHpNumber(ctx, e, y, size);
  }

  function drawBullet(ctx, b, D, img, imageReady) {
    const im = img(D.player.bulletImage);

    if (imageReady(im)) {
      drawImageContain(ctx, im, b.x, b.y, 18, 18);
      return;
    }

    ctx.fillStyle = '#ffdf35';
    ctx.strokeStyle = '#7a4300';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawPlayer(ctx, p, D, img, imageReady) {
    const im = img(D.player.image);

    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 35, 40, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    if (imageReady(im)) {
      drawImageContain(ctx, im, p.x, p.y - 8, 76, 92);
      return;
    }

    ctx.fillStyle = '#11131e';
    ctx.strokeStyle = '#2b3654';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawParticle(ctx, p) {
    ctx.globalAlpha = Math.max(0, p.life / 34);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 6, 6);
    ctx.globalAlpha = 1;
  }

  function drawText(ctx, t) {
    ctx.globalAlpha = Math.max(0, t.life / 48);
    ctx.fillStyle = t.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'center';
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
  }

  function drawAll(ctx, state, D, W, H, scroll, img, imageReady) {
    drawBackground(ctx, D, W, H, scroll, img, imageReady);

    for (const e of state.entities) drawEntity(ctx, e, img, imageReady);
    for (const b of state.bullets) drawBullet(ctx, b, D, img, imageReady);

    drawPlayer(ctx, state.player, D, img, imageReady);

    for (const p of state.particles) drawParticle(ctx, p);
    for (const t of state.texts) drawText(ctx, t);
  }

  window.MobShotRender = {
    drawAll
  };
})();
