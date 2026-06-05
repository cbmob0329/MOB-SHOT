'use strict';

(function(){
  let gameState = null;

  const petImages = new Map();
  const battlePets = [];
  const petBullets = [];
  const petTexts = [];

  function img(src){
    if(!src) return null;

    if(!petImages.has(src)){
      const image = new Image();
      image.src = src + '?v=20260606_pet_front_only';
      petImages.set(src, image);
    }

    return petImages.get(src);
  }

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  }

  function levelBonus(level){
    return 1 + ((Math.max(1, level) - 1) * 0.02);
  }

  function init(state){
    gameState = state;
    battlePets.length = 0;
    petBullets.length = 0;
    petTexts.length = 0;

    if(!window.MobShotPets || !window.MobShotPets.getEquippedPets) return;

    const equipped = window.MobShotPets.getEquippedPets();

    equipped.forEach((pet, index) => {
      battlePets.push({
        data: pet,
        x: state.player.x,
        y: state.player.y,
        targetX: state.player.x,
        targetY: state.player.y,
        shootCd: 18 + index * 9,
        skillCd: Math.max(1, pet.firstCt || 10) * 60,
        slotIndex: index,
        bob: Math.random() * Math.PI * 2
      });
    });
  }

  function update(){
    if(!gameState) return;

    const player = gameState.player;

    battlePets.forEach((pet, index) => {
      if(index === 0){
        pet.targetX = player.x - 48;
        pet.targetY = player.y + 18;
      }else if(index === 1){
        pet.targetX = player.x + 48;
        pet.targetY = player.y + 18;
      }else{
        pet.targetX = player.x + 86;
        pet.targetY = player.y + 45;
      }

      pet.x += (pet.targetX - pet.x) * 0.18;
      pet.y += (pet.targetY - pet.y) * 0.18;
      pet.bob += 0.08;

      pet.shootCd--;

      if(pet.shootCd <= 0){
        pet.shootCd = Math.max(
          8,
          Math.floor(30 / Math.max(0.1, pet.data.normalRateRate || 1))
        );

        normalShot(pet);
      }

      pet.skillCd--;

      if(pet.skillCd <= 0){
        pet.skillCd = Math.max(1, pet.data.skillCt || 30) * 60;
        skillShot(pet);
      }
    });

    updateBullets();
    updateTexts();
  }

  function validTarget(e){
    if(!gameState) return false;

    return e &&
      !e.dead &&
      e.kind !== 'gate' &&
      e.kind !== 'enemyBullet' &&
      e.hp != null &&
      e.y < gameState.player.y - 25;
  }

  function findTarget(pet){
    if(!gameState) return null;

    let nearest = null;
    let nearestDist = Infinity;

    gameState.entities.forEach(e => {
      if(!validTarget(e)) return;

      const dx = e.x - pet.x;
      const dy = e.y - pet.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if(d < nearestDist){
        nearestDist = d;
        nearest = e;
      }
    });

    return nearest;
  }

  function getFrontTargets(){
    if(!gameState) return [];

    return gameState.entities.filter(validTarget).sort((a, b) => {
      return b.y - a.y;
    });
  }

  function pushBullet(pet, target, damage, type){
    if(!target) return;

    const dx = target.x - pet.x;
    const dy = target.y - pet.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const speed = type === 'skill' ? 9.2 : 7.4;

    petBullets.push({
      x: pet.x,
      y: pet.y - 8,
      vx: dx / len * speed,
      vy: dy / len * speed,
      r: type === 'skill' ? 8 : 5,
      damage,
      target,
      type,
      life: 70,
      color: bulletColor(pet.data.key, type)
    });
  }

  function bulletColor(key, type){
    if(type === 'skill'){
      if(key === 'mobdrago') return '#ff6530';
      if(key === 'mobfrog') return '#4bd8ff';
      if(key === 'mobdenden') return '#ffe84a';
      if(key === 'mobwolf') return '#d8f1ff';
      return '#ffffff';
    }

    if(key === 'mobdrago') return '#ffb347';
    if(key === 'mobfrog') return '#69dfff';
    if(key === 'mobdenden') return '#fff35a';
    if(key === 'mobwolf') return '#e8f4ff';
    return '#ffffff';
  }

  function normalShot(pet){
    const target = findTarget(pet);
    if(!target) return;

    const dmg =
      gameState.power *
      (pet.data.normalAttackRate || 0.5) *
      levelBonus(pet.data.level || 1);

    pushBullet(pet, target, dmg, 'normal');
  }

  function skillShot(pet){
    if(!gameState) return;

    const targets = getFrontTargets();
    if(!targets.length) return;

    const baseCount = pet.data.skillBaseCount || 1;
    const level = pet.data.level || 1;
    const count = baseCount + Math.floor(level / 5);

    for(let i = 0; i < count; i++){
      const target = targets[i % targets.length];
      if(!target || target.dead) continue;

      let rate = pet.data.skillPowerRate || 1;

      if(target.kind === 'gimmick' || target.kind === 'chest'){
        rate = pet.data.skillObstacleRate || rate;
      }

      const dmg =
        gameState.power *
        rate *
        levelBonus(level);

      pushBullet(pet, target, dmg, 'skill');
    }

    petTexts.push({
      text: pet.data.skillName || 'PET SKILL',
      x: pet.x,
      y: pet.y - 34,
      life: 50,
      color: bulletColor(pet.data.key, 'skill')
    });
  }

  function updateBullets(){
    for(const b of petBullets){
      if(b.dead) continue;

      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if(!validTarget(b.target)){
        b.dead = true;
        continue;
      }

      const target = b.target;
      const hitRadius = target.r || Math.max(target.w || 40, target.h || 40) / 2;

      if(Math.hypot(b.x - target.x, b.y - target.y) < hitRadius + b.r){
        damageTarget(target, b.damage, b);
        b.dead = true;
      }

      if(b.life <= 0){
        b.dead = true;
      }
    }

    for(let i = petBullets.length - 1; i >= 0; i--){
      if(petBullets[i].dead){
        petBullets.splice(i, 1);
      }
    }
  }

  function damageTarget(target, damage, bullet){
    if(!target || target.dead) return;

    target.hp -= damage;

    petTexts.push({
      text: '-' + Math.ceil(damage),
      x: target.x,
      y: target.y - 18,
      life: 28,
      color: bullet ? bullet.color : '#ffffff'
    });

    if(target.hp <= 0){
      if(window.MobShotGameCore && window.MobShotGameCore.killEntity){
        window.MobShotGameCore.killEntity(target);
      }else{
        target.dead = true;
      }
    }
  }

  function updateTexts(){
    for(const t of petTexts){
      t.y -= 0.8;
      t.life--;
    }

    for(let i = petTexts.length - 1; i >= 0; i--){
      if(petTexts[i].life <= 0){
        petTexts.splice(i, 1);
      }
    }
  }

  function draw(ctx){
    drawBullets(ctx);
    drawPets(ctx);
    drawTexts(ctx);
  }

  function drawPets(ctx){
    battlePets.forEach(pet => {
      const image = img(pet.data.backImage || pet.data.frontImage);
      const y = pet.y + Math.sin(pet.bob) * 3;

      ctx.save();

      ctx.fillStyle = 'rgba(0,0,0,.22)';
      ctx.beginPath();
      ctx.ellipse(pet.x, y + 20, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      if(imageReady(image)){
        ctx.drawImage(image, pet.x - 25, y - 28, 50, 50);
      }else{
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pet.x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  function drawBullets(ctx){
    petBullets.forEach(b => {
      ctx.save();

      ctx.fillStyle = b.color;
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;

      if(b.type === 'skill'){
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 3, 0, Math.PI * 2);
        ctx.globalAlpha = 0.28;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    });
  }

  function drawTexts(ctx){
    petTexts.forEach(t => {
      ctx.save();

      ctx.globalAlpha = Math.max(0, t.life / 50);
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.font = '900 14px system-ui';
      ctx.textAlign = 'center';

      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);

      ctx.restore();
    });
  }

  window.MobShotPetBattle = {
    init,
    update,
    draw
  };
})();
