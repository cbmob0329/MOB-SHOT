'use strict';

(function(){
  let gameState = null;
  const petImages = new Map();
  const battlePets = [];

  function img(src){
    if(!src) return null;
    if(!petImages.has(src)){
      const image = new Image();
      image.src = src + '?v=20260605_petbattle';
      petImages.set(src, image);
    }
    return petImages.get(src);
  }

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0;
  }

  function levelBonus(level){
    return 1 + ((Math.max(1, level) - 1) * 0.02);
  }

  function init(state){
    gameState = state;
    battlePets.length = 0;

    if(!window.MobShotPets || !window.MobShotPets.getEquippedPets) return;

    const equipped = window.MobShotPets.getEquippedPets();

    equipped.forEach((pet, index) => {
      battlePets.push({
        data: pet,
        x: state.player.x,
        y: state.player.y,
        targetX: state.player.x,
        targetY: state.player.y,
        shootCd: 20 + index * 10,
        skillCd: Math.max(1, pet.firstCt || 10) * 60,
        slotIndex: index
      });
    });
  }

  function update(){
    if(!gameState) return;

    const player = gameState.player;

    battlePets.forEach((pet, index) => {
      if(index === 0){
        pet.targetX = player.x - 48;
        pet.targetY = player.y + 16;
      }else if(index === 1){
        pet.targetX = player.x + 48;
        pet.targetY = player.y + 16;
      }else{
        pet.targetX = player.x + 84;
        pet.targetY = player.y + 42;
      }

      pet.x += (pet.targetX - pet.x) * 0.18;
      pet.y += (pet.targetY - pet.y) * 0.18;

      pet.shootCd--;
      if(pet.shootCd <= 0){
        pet.shootCd = Math.max(8, Math.floor(30 / Math.max(0.1, pet.data.normalRateRate || 1)));
        normalShot(pet);
      }

      pet.skillCd--;
      if(pet.skillCd <= 0){
        pet.skillCd = Math.max(1, pet.data.skillCt || 30) * 60;
        skillShot(pet);
      }
    });
  }

  function validTarget(e){
    return e &&
      !e.dead &&
      e.kind !== 'gate' &&
      e.kind !== 'enemyBullet' &&
      e.hp != null;
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

  function damageTarget(target, damage){
    if(!target || target.dead) return;

    target.hp -= damage;

    if(target.hp <= 0){
      if(window.MobShotGameCore && window.MobShotGameCore.killEntity){
        window.MobShotGameCore.killEntity(target);
      }else{
        target.dead = true;
      }
    }
  }

  function normalShot(pet){
    const target = findTarget(pet);
    if(!target) return;

    const dmg =
      gameState.power *
      (pet.data.normalAttackRate || 0.5) *
      levelBonus(pet.data.level || 1);

    damageTarget(target, dmg);
  }

  function skillShot(pet){
    if(!gameState) return;

    const targets = gameState.entities.filter(validTarget);
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

      damageTarget(target, dmg);
    }
  }

  function draw(ctx){
    battlePets.forEach(pet => {
      const image = img(pet.data.frontImage);

      if(imageReady(image)){
        ctx.drawImage(image, pet.x - 22, pet.y - 22, 44, 44);
        return;
      }

      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pet.x, pet.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  window.MobShotPetBattle = {
    init,
    update,
    draw
  };
})();
