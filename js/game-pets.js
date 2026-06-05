'use strict';

(function(){

  const pets = [];

  const SLOT_POS = [
    { x:-42, y:28 },
    { x: 26, y:20 },
    { x: 52, y:34 }
  ];

  function img(src){
    const i = new Image();
    i.src = src;
    return i;
  }

  const cache = {};

  function getImage(src){
    if(!src) return null;

    if(!cache[src]){
      cache[src] = img(src);
    }

    return cache[src];
  }

  function createPet(def,index,player){

    const pos = SLOT_POS[index] || SLOT_POS[0];

    return {
      key:def.key,
      name:def.name,

      x:player.x + pos.x,
      y:player.y + pos.y,

      targetOffsetX:pos.x,
      targetOffsetY:pos.y,

      attackRate:def.normalAttackRate || 0.5,
      attackSpeed:def.normalRateRate || 0.5,

      image:def.backImage,

      shootCd:0,
      bob:Math.random()*6.28
    };
  }

  function syncPets(state){

    if(!window.MobShotPets) return;

    const equipped = window.MobShotPets.getEquippedPets();

    if(!equipped) return;

    if(pets.length === equipped.length) return;

    pets.length = 0;

    equipped.forEach((pet,index)=>{
      pets.push(
        createPet(
          pet,
          index,
          state.player
        )
      );
    });
  }

  function getTarget(state){

    const bosses = state.entities.filter(e =>
      !e.dead &&
      (e.kind === 'boss' || e.kind === 'midBoss')
    );

    if(bosses.length){
      return bosses[0];
    }

    const enemies = state.entities.filter(e =>
      !e.dead &&
      e.kind === 'enemy'
    );

    if(enemies.length){
      return enemies[0];
    }

    return null;
  }

  function shootPet(pet,state){

    const target = getTarget(state);

    pet.shootCd--;

    const delay =
      Math.max(
        12,
        Math.floor(40 / pet.attackSpeed)
      );

    if(pet.shootCd > 0) return;

    pet.shootCd = delay;

    state.bullets.push({
      x:pet.x,
      y:pet.y - 10,
      vy:-7.4,
      r:6,
      life:70,
      dmg:Math.max(
        1,
        Math.ceil(
          state.power * pet.attackRate
        )
      ),
      dead:false,
      petBullet:true
    });

  }

  function update(state){

    syncPets(state);

    const player = state.player;

    pets.forEach(pet=>{

      const tx =
        player.x +
        pet.targetOffsetX;

      const ty =
        player.y +
        pet.targetOffsetY;

      pet.x += (tx - pet.x) * 0.12;
      pet.y += (ty - pet.y) * 0.12;

      pet.bob += 0.05;

      shootPet(
        pet,
        state
      );

    });

  }

  function draw(ctx){

    pets.forEach(pet=>{

      const image =
        getImage(
          pet.image
        );

      const drawY =
        pet.y +
        Math.sin(pet.bob) * 3;

      ctx.save();

      ctx.globalAlpha = 0.25;

      ctx.fillStyle = '#000';

      ctx.beginPath();
      ctx.ellipse(
        pet.x,
        drawY + 18,
        12,
        5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();

      if(
        image &&
        image.complete &&
        image.naturalWidth > 0
      ){

        const size = 42;

        ctx.drawImage(
          image,
          pet.x - size/2,
          drawY - size/2,
          size,
          size
        );

      }else{

        ctx.fillStyle='#fff';

        ctx.beginPath();
        ctx.arc(
          pet.x,
          drawY,
          12,
          0,
          Math.PI*2
        );
        ctx.fill();

      }

    });

  }

  window.MobShotPetGame = {
    update,
    draw
  };

})();
