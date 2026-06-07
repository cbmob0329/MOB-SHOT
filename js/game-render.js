'use strict';

(function(){

  function imageReady(image){
    return image &&
      image.complete &&
      image.naturalWidth > 0 &&
      image.naturalHeight > 0;
  }

  function drawImageContain(
    ctx,
    image,
    centerX,
    centerY,
    boxW,
    boxH
  ){
    if(!imageReady(image)) return;

    const ratio = Math.min(
      boxW / image.naturalWidth,
      boxH / image.naturalHeight
    );

    const iw = image.naturalWidth * ratio;
    const ih = image.naturalHeight * ratio;

    ctx.drawImage(
      image,
      centerX - iw/2,
      centerY - ih/2,
      iw,
      ih
    );
  }

  function roundRect(
    ctx,
    x,
    y,
    w,
    h,
    r
  ){
    ctx.beginPath();

    ctx.moveTo(x+r,y);

    ctx.arcTo(
      x+w,
      y,
      x+w,
      y+h,
      r
    );

    ctx.arcTo(
      x+w,
      y+h,
      x,
      y+h,
      r
    );

    ctx.arcTo(
      x,
      y+h,
      x,
      y,
      r
    );

    ctx.arcTo(
      x,
      y,
      x+w,
      y,
      r
    );

    ctx.closePath();
  }

  function drawBackground(
    ctx,
    W,
    H,
    scroll,
    bgImage
  ){

    if(imageReady(bgImage)){

      const y1 =
        (scroll % H) - H;

      ctx.drawImage(
        bgImage,
        0,
        y1,
        W,
        H
      );

      ctx.drawImage(
        bgImage,
        0,
        y1 + H,
        W,
        H
      );

      ctx.drawImage(
        bgImage,
        0,
        y1 + H * 2,
        W,
        H
      );

      return;
    }

    ctx.fillStyle='#58ba48';
    ctx.fillRect(
      0,
      0,
      W,
      H
    );
  }

  function drawGate(
    ctx,
    gate,
    gateImage
  ){

    const size = 118;

    if(imageReady(gateImage)){

      drawImageContain(
        ctx,
        gateImage,
        gate.x,
        gate.y,
        size,
        size
      );

      return;
    }

    ctx.save();

    ctx.translate(
      gate.x,
      gate.y
    );

    ctx.fillStyle =
      gate.color || '#277dff';

    ctx.strokeStyle='#fff';
    ctx.lineWidth=5;

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      54,
      42,
      0,
      0,
      Math.PI*2
    );

    ctx.fill();
    ctx.stroke();

    ctx.fillStyle='#fff';
    ctx.strokeStyle='#000';

    ctx.font='900 16px system-ui';
    ctx.textAlign='center';
    ctx.textBaseline='middle';

    ctx.strokeText(
      gate.name,
      0,
      0
    );

    ctx.fillText(
      gate.name,
      0,
      0
    );

    ctx.restore();
  }

  function entitySize(entity){

    if(entity.kind==='boss'){
      return 260;
    }

    if(entity.kind==='midBoss'){
      return 140;
    }

    if(
      entity.kind==='enemy' &&
      entity.name==='モブロック'
    ){
      return 92;
    }

    if(entity.kind==='enemy'){
      return 84;
    }

    if(entity.kind==='gimmick'){
      return 104;
    }

    if(entity.kind==='chest'){
      return 82;
    }

    return 70;
  }

  function drawHpNumber(
    ctx,
    entity,
    y,
    size
  ){

    const ratio =
      Math.max(
        0,
        entity.hp /
        entity.maxHp
      );

    const barW =
      size * 0.78;

    const barH = 8;

    const barX =
      entity.x -
      barW/2;

    const barY =
      y +
      size/2 -
      10;

    ctx.fillStyle =
      'rgba(0,0,0,.6)';

    roundRect(
      ctx,
      barX,
      barY,
      barW,
      barH,
      6
    );

    ctx.fill();

    ctx.fillStyle =
      ratio > 0.4
      ? '#ffe66b'
      : '#ff5b5b';

    roundRect(
      ctx,
      barX,
      barY,
      barW * ratio,
      barH,
      6
    );

    ctx.fill();

    ctx.fillStyle='#fff';
    ctx.strokeStyle='#000';
    ctx.lineWidth=4;

    ctx.font='900 18px system-ui';
    ctx.textAlign='center';

    const hpText =
      String(
        Math.ceil(entity.hp)
      );

    ctx.strokeText(
      hpText,
      entity.x,
      barY + 20
    );

    ctx.fillText(
      hpText,
      entity.x,
      barY + 20
    );
  }

  window.MobShotRender = {
    imageReady,
    drawImageContain,
    roundRect,
    drawBackground,
    drawGate,
    entitySize,
    drawHpNumber
  };

})();
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

  function drawEntity(ctx,entity,getImage){
    if(entity.kind === 'enemyBullet'){
      ctx.fillStyle = entity.color || '#ff4aff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(entity.x,entity.y,entity.r,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
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

    if(imageReady(image)){
      drawImageContain(ctx,image,entity.x,y,size,size);
    }else{
      drawFallbackEntity(ctx,entity,y,size);
    }

    if(entity.hp != null && entity.maxHp != null){
      drawHpNumber(ctx,entity,y,size);
    }
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
    drawEntity,
    drawBullet,
    drawPlayer,
    drawParticle,
    drawText,
    drawAll
  };

})();
