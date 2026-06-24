'use strict';

(function(){

  function imageReady(image){
    return image &&
      image.complete &&
      image.naturalWidth > 0 &&
      image.naturalHeight > 0;
  }

  function drawImageContain(ctx,image,centerX,centerY,boxW,boxH){
    if(!imageReady(image)) return;

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

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function drawBackground(ctx,W,H,scroll,bgImage){
    if(imageReady(bgImage)){
      const y1 = (scroll % H) - H;

      ctx.drawImage(bgImage,0,y1,W,H);
      ctx.drawImage(bgImage,0,y1+H,W,H);
      ctx.drawImage(bgImage,0,y1+H*2,W,H);
      return;
    }

    ctx.fillStyle = '#58ba48';
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = '#3b9b37';
    ctx.beginPath();
    ctx.moveTo(W*0.12,0);
    ctx.lineTo(W*0.88,0);
    ctx.lineTo(W*0.8,H);
    ctx.lineTo(W*0.2,H);
    ctx.closePath();
    ctx.fill();
  }

  function drawGate(ctx,gate,gateImage){
    const size = 118;

    if(imageReady(gateImage)){
      drawImageContain(ctx,gateImage,gate.x,gate.y,size,size);
      return;
    }

    ctx.save();
    ctx.translate(gate.x,gate.y);

    ctx.globalAlpha = 0.95;
    ctx.fillStyle = gate.color || '#277dff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.ellipse(0,0,54,42,0,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeText(gate.name || 'GATE',0,0);
    ctx.fillText(gate.name || 'GATE',0,0);

    ctx.restore();
  }

  function entitySize(entity){
    if(entity.kind === 'boss') return 260;
    if(entity.kind === 'midBoss') return 140;
    if(entity.kind === 'enemy' && entity.name === 'モブロック') return 92;
    if(entity.kind === 'enemy') return 84;
    if(entity.kind === 'gimmick') return 104;
    if(entity.kind === 'chest') return 82;
    return 70;
  }

  function drawFallbackEntity(ctx,entity,y,size){
    ctx.save();
    ctx.translate(entity.x,y);

    ctx.fillStyle =
      entity.kind === 'chest' ? '#b77822' :
      entity.kind === 'gimmick' ? '#86664a' :
      entity.kind === 'midBoss' || entity.kind === 'boss' ? '#42215f' :
      '#151822';

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(0,0,size/2,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = '900 11px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeText(entity.name || 'NO IMG',0,0);
    ctx.fillText(entity.name || 'NO IMG',0,0);

    ctx.restore();
  }

  function drawHpNumber(ctx,entity,y,size){
    const ratio = Math.max(0,entity.hp / entity.maxHp);
    const barW = size * 0.72;
    const barH = entity.kind === 'boss' ? 10 : 8;
    const barX = entity.x - barW / 2;
    const barY = entity.kind === 'boss'
      ? y + size * 0.34
      : y + size * 0.42;

    ctx.fillStyle = 'rgba(0,0,0,.58)';
    roundRect(ctx,barX,barY,barW,barH,6);
    ctx.fill();

    ctx.fillStyle = ratio > 0.45 ? '#ffe66b' : '#ff5b5b';
    roundRect(ctx,barX,barY,barW * ratio,barH,6);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = entity.kind === 'boss' ? '900 18px system-ui' : '900 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const hpText = String(Math.ceil(entity.hp));

    ctx.strokeText(hpText,entity.x,barY + barH + 2);
    ctx.fillText(hpText,entity.x,barY + barH + 2);
  }

  function drawSingleBarrierGauge(ctx,entity,y,size,opt){
    const hp = Number(entity[opt.hpKey] || 0);
    const maxHp = Math.max(1,Number(entity[opt.maxKey] || hp || 1));
    const timer = Number(entity[opt.timerKey] || 0);

    if(hp <= 0 && timer <= 0) return;

    const ratio = Math.max(0,Math.min(1,hp / maxHp));

    const barW = entity.kind === 'boss' ? size * 0.78 : size * 0.74;
    const barH = entity.kind === 'boss' ? 9 : 7;
    const barX = entity.x - barW / 2;
    const barY = y - size * 0.53 + opt.offsetY;

    ctx.save();

    ctx.globalAlpha = 0.96;

    ctx.fillStyle = 'rgba(0,0,0,.68)';
    roundRect(ctx,barX,barY,barW,barH,6);
    ctx.fill();

    ctx.fillStyle = opt.color;
    roundRect(ctx,barX,barY,barW * ratio,barH,6);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 2;
    roundRect(ctx,barX,barY,barW,barH,6);
    ctx.stroke();

    const label = entity[opt.labelKey] || opt.label;
    const text = label + ' ' + Math.ceil(Math.max(0,hp)) + '/' + Math.ceil(maxHp);

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = entity.kind === 'boss' ? '900 14px system-ui' : '900 12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    ctx.strokeText(text,entity.x,barY - 2);
    ctx.fillText(text,entity.x,barY - 2);

    ctx.restore();
  }

  function drawBarrierGauges(ctx,entity,y,size){
    drawSingleBarrierGauge(ctx,entity,y,size,{
      hpKey:'barrierHp',
      maxKey:'barrierMaxHp',
      timerKey:'barrierTimer',
      labelKey:'barrierLabel',
      label:'バリア',
      color:entity.barrierColor || '#9deeff',
      offsetY:0
    });

    drawSingleBarrierGauge(ctx,entity,y,size,{
      hpKey:'frontBarrierHp',
      maxKey:'frontBarrierMaxHp',
      timerKey:'frontBarrierTimer',
      labelKey:'frontBarrierLabel',
      label:'前面バリア',
      color:entity.frontBarrierColor || '#ffcf5b',
      offsetY:18
    });

    drawSingleBarrierGauge(ctx,entity,y,size,{
      hpKey:'circleBarrierHp',
      maxKey:'circleBarrierMaxHp',
      timerKey:'circleBarrierTimer',
      labelKey:'circleBarrierLabel',
      label:'円形バリア',
      color:entity.circleBarrierColor || '#ff4aff',
      offsetY:36
    });
  }

  function drawBarrierAura(ctx,entity,y,size){
    const hasNormal = Number(entity.barrierHp || 0) > 0 || Number(entity.barrierTimer || 0) > 0;
    const hasFront = Number(entity.frontBarrierHp || 0) > 0 || Number(entity.frontBarrierTimer || 0) > 0;
    const hasCircle = Number(entity.circleBarrierHp || 0) > 0 || Number(entity.circleBarrierTimer || 0) > 0;

    if(!hasNormal && !hasFront && !hasCircle) return;

    ctx.save();

    const pulse = 1 + Math.sin(Date.now() / 120) * 0.035;
    const r = size * 0.43 * pulse;

    if(hasNormal){
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = entity.barrierColor || '#9deeff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(entity.x,y,r,0,Math.PI*2);
      ctx.stroke();
    }

    if(hasFront){
      ctx.globalAlpha = 0.62;
      ctx.strokeStyle = entity.frontBarrierColor || '#ffcf5b';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(entity.x,y,r,Math.PI*0.12,Math.PI*0.88);
      ctx.stroke();
    }

    if(hasCircle){
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = entity.circleBarrierColor || '#ff4aff';
      ctx.lineWidth = 7;
      ctx.setLineDash([10,8]);
      ctx.beginPath();
      ctx.arc(entity.x,y,r + 9,0,Math.PI*2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  function drawEnemyBulletNumber(ctx,entity){
    if(!entity.breakable) return;
    if(!entity.hp || entity.hp <= 0) return;

    const text = String(Math.ceil(entity.hp));
    const y = entity.y + (entity.r || 10) + 18;

    ctx.save();

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.font = '900 15px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeText(text,entity.x,y);
    ctx.fillText(text,entity.x,y);

    ctx.restore();
  }

  function drawEnemyBullet(ctx,entity,getImage){
    const image = entity.image ? getImage(entity.image) : null;
    const size = (entity.r || 10) * 2.4;

    if(imageReady(image)){
      ctx.save();

      if(entity.flipY){
        ctx.translate(entity.x,entity.y);
        ctx.scale(1,-1);
        drawImageContain(ctx,image,0,0,size,size);
      }else{
        drawImageContain(ctx,image,entity.x,entity.y,size,size);
      }

      ctx.restore();
    }else{
      ctx.fillStyle = entity.color || '#ff4aff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(entity.x,entity.y,entity.r || 8,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
    }

    drawEnemyBulletNumber(ctx,entity);
  }

  function drawEntity(ctx,entity,getImage){
    if(entity.kind === 'enemyBullet'){
      drawEnemyBullet(ctx,entity,getImage);
      return;
    }

    if(entity.kind === 'gate'){
      drawGate(ctx,entity,getImage(entity.image));
      return;
    }

    const y =
      entity.kind === 'enemy' ||
      entity.kind === 'midBoss' ||
      entity.kind === 'boss'
        ? entity.y + Math.sin(entity.bob || 0) * 5
        : entity.y;

    const size = entitySize(entity);
    const image = entity.image ? getImage(entity.image) : null;

    drawBarrierAura(ctx,entity,y,size);

    if(imageReady(image)){
      drawImageContain(ctx,image,entity.x,y,size,size);
    }else{
      drawFallbackEntity(ctx,entity,y,size);
    }

    if(entity.hp != null && entity.maxHp != null){
      drawHpNumber(ctx,entity,y,size);
    }

    drawBarrierGauges(ctx,entity,y,size);
  }

  function drawBullet(ctx,bullet,bulletImage){
    if(imageReady(bulletImage)){
      drawImageContain(ctx,bulletImage,bullet.x,bullet.y,18,18);
      return;
    }

    ctx.fillStyle = '#ffdf35';
    ctx.strokeStyle = '#7a4300';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(bullet.x,bullet.y,bullet.r,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
  }

  function drawPlayer(ctx,state,playerImage){
    const p = state.player;

    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath();
    ctx.ellipse(p.x,p.y+35,40,11,0,0,Math.PI*2);
    ctx.fill();

    if(imageReady(playerImage)){
      drawImageContain(ctx,playerImage,p.x,p.y-8,76,92);
      return;
    }

    ctx.fillStyle = '#11131e';
    ctx.strokeStyle = '#2b3654';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(p.x,p.y,28,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
  }

  function drawParticle(ctx,particle){
    ctx.globalAlpha = Math.max(0,particle.life / 34);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x,particle.y,6,6);
    ctx.globalAlpha = 1;
  }

  function drawText(ctx,textItem){
    ctx.globalAlpha = Math.max(0,textItem.life / 48);

    ctx.fillStyle = textItem.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'center';

    ctx.strokeText(textItem.text,textItem.x,textItem.y);
    ctx.fillText(textItem.text,textItem.x,textItem.y);

    ctx.globalAlpha = 1;
  }

  function drawAll(tools){
    const ctx = tools.ctx;
    const state = tools.state;
    const W = tools.W;
    const H = tools.H;
    const scroll = tools.scroll;
    const getImage = tools.getImage;
    const D = tools.D;

    ctx.clearRect(0,0,W,H);

    drawBackground(
      ctx,
      W,
      H,
      scroll,
      getImage(D.stage.background)
    );

    for(const entity of state.entities){
      drawEntity(ctx,entity,getImage);
    }

    for(const bullet of state.bullets){
      drawBullet(
        ctx,
        bullet,
        getImage(state.bulletImage || D.player.bulletImage)
      );
    }

    drawPlayer(
      ctx,
      state,
      getImage(state.playerImage || D.player.image)
    );

    if(window.MobShotPetBattle && window.MobShotPetBattle.draw){
      window.MobShotPetBattle.draw(ctx);
    }

    for(const particle of state.particles){
      drawParticle(ctx,particle);
    }

    for(const textItem of state.texts){
      drawText(ctx,textItem);
    }
  }

  window.MobShotRender = {
    imageReady,
    drawImageContain,
    roundRect,
    drawBackground,
    drawGate,
    entitySize,
    drawHpNumber,
    drawBarrierGauges,
    drawBarrierAura,
    drawEnemyBulletNumber,
    drawEnemyBullet,
    drawEntity,
    drawBullet,
    drawPlayer,
    drawParticle,
    drawText,
    drawAll
  };

})();
