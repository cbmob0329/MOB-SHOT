'use strict';

(function(){

  let gameState = null;

  const petImages = new Map();

  function img(src){
    if(!src) return null;

    if(!petImages.has(src)){
      const i = new Image();
      i.src = src;
      petImages.set(src,i);
    }

    return petImages.get(src);
  }

  const battlePets = [];

  function init(state){
    gameState = state;

    battlePets.length = 0;

    if(
      !window.MobShotPets ||
      !window.MobShotPets.getEquippedPets
    ){
      return;
    }

    const equipped =
      window.MobShotPets.getEquippedPets();

    equipped.forEach((pet,index)=>{

      battlePets.push({
        data: pet,

        x: 0,
        y: 0,

        shootCd: 0,
        skillCd: pet.firstCt * 60,

        slotIndex: index
      });

    });
  }

  function levelBonus(level){
    return 1 + ((level - 1) * 0.02);
  }

  function update(){

    if(!gameState) return;

    const player = gameState.player;

    battlePets.forEach((pet,index)=>{

      if(index===0){
        pet.x = player.x - 50;
        pet.y = player.y + 15;
      }

      if(index===1){
        pet.x = player.x + 50;
        pet.y = player.y + 15;
      }

      if(index===2){
        pet.x = player.x + 90;
        pet.y = player.y + 40;
      }

      pet.shootCd--;

      if(pet.shootCd<=0){

        pet.shootCd =
          Math.max(
            8,
            Math.floor(
              30 /
              pet.data.normalRateRate
            )
          );

        normalShot(pet);
      }

      pet.skillCd--;

      if(pet.skillCd<=0){

        pet.skillCd =
          Math.floor(
            pet.data.skillCt * 60
          );

        skillShot(pet);
      }

    });

  }

  function findTarget(){

    if(!gameState) return null;

    let nearest = null;
    let nearestDist = Infinity;

    gameState.entities.forEach(e=>{

      if(
        e.dead ||
        e.kind === 'gate' ||
        e.kind === 'enemyBullet'
      ){
        return;
      }

      const dx =
        e.x -
        gameState.player.x;

      const dy =
        e.y -
        gameState.player.y;

      const d =
        Math.sqrt(dx*dx+dy*dy);

      if(d < nearestDist){
        nearestDist = d;
        nearest = e;
      }

    });

    return nearest;
  }

  function normalShot(pet){

    const target = findTarget();

    if(!target) return;

    const dmg =
      gameState.power *
      pet.data.normalAttackRate *
      levelBonus(pet.data.level);

    target.hp -= dmg;

    if(target.hp <= 0){

      target.dead = true;

      if(window.MobShotGameCore){
        window.MobShotGameCore.killEntity(
          target
        );
      }
    }

  }

  function skillShot(pet){

    if(!gameState) return;

    const targets =
      gameState.entities.filter(e=>
        !e.dead &&
        e.kind!=='gate' &&
        e.kind!=='enemyBullet'
      );

    if(!targets.length) return;

    let count =
      pet.data.skillBaseCount +
      Math.floor(
        pet.data.level / 5
      );

    for(
      let i=0;
      i<count;
      i++
    ){

      const target =
        targets[
          i % targets.length
        ];

      if(!target) continue;

      let rate =
        pet.data.skillPowerRate;

      if(target.kind==='boss'){
        rate *=
          pet.data.skillBossRate;
      }

      const dmg =
        gameState.power *
        rate *
        levelBonus(
          pet.data.level
        );

      target.hp -= dmg;

      if(target.hp <= 0){

        target.dead = true;

        if(window.MobShotGameCore){
          window.MobShotGameCore.killEntity(
            target
          );
        }
      }

    }

  }

  function draw(ctx){

    battlePets.forEach(pet=>{

      const image =
        img(
          pet.data.frontImage
        );

      if(
        image &&
        image.complete &&
        image.naturalWidth
      ){

        ctx.drawImage(
          image,
          pet.x - 20,
          pet.y - 20,
          40,
          40
        );

      }else{

        ctx.fillStyle='#fff';

        ctx.beginPath();

        ctx.arc(
          pet.x,
          pet.y,
          15,
          0,
          Math.PI*2
        );

        ctx.fill();

      }

    });

  }

  window.MobShotPetBattle = {
    init,
    update,
    draw
  };

})();
