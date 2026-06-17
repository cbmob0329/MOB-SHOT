'use strict';

(function(){
  let gameState = null;

  const petImages = new Map();
  const battlePets = [];
  const petBullets = [];
  const petTexts = [];
  const cutins = [];
  const supportEffects = [];

  function img(src){
    if (!src) return null;

    if (!petImages.has(src)) {
      const image = new Image();
      image.src = src + '?v=20260616_pet_battle_v3_balance';
      petImages.set(src, image);
    }

    return petImages.get(src);
  }

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  }

  function clamp(v, a, b){
    return Math.max(a, Math.min(b, v));
  }

  function level(pet){
    return Math.max(1, Math.min(30, Number(pet.data.level || 1)));
  }

  function normalRate(pet){
    return Number(pet.data.normalAttackRate || 0.5) * (pet.data.normalLevelRate || 1);
  }

  function skillRate(pet, baseRate){
    return Number(baseRate || 1) * (pet.data.skillLevelRate || 1);
  }

  function currentSkillCt(pet){
    return Math.max(5, Number(pet.data.currentSkillCt || pet.data.skillCt || 30));
  }

  function normalWide(pet){
    return 1 + Number(pet.data.normalWideBonus || 0);
  }

  function skillWide(pet){
    return 1 + Number(pet.data.skillWideBonus || 0);
  }

  function init(state){
    gameState = state;
    battlePets.length = 0;
    petBullets.length = 0;
    petTexts.length = 0;
    cutins.length = 0;
    supportEffects.length = 0;

    if (!window.MobShotPets || !window.MobShotPets.getEquippedPets) return;

    const equipped = window.MobShotPets.getEquippedPets();

    equipped.forEach((pet, index) => {
      battlePets.push({
        data:pet,
        x:state.player.x,
        y:state.player.y,
        targetX:state.player.x,
        targetY:state.player.y,
        shootCd:18 + index * 9,
        skillCd:Math.max(1, pet.firstCt || 10) * 60,
        slotIndex:index,
        bob:Math.random() * Math.PI * 2
      });
    });
  }

  function update(){
    if (!gameState) return;

    updateSupportEffects();

    const player = gameState.player;

    battlePets.forEach((pet, index) => {
      if (index === 0) {
        pet.targetX = player.x - 48;
        pet.targetY = player.y + 18;
      } else if (index === 1) {
        pet.targetX = player.x + 48;
        pet.targetY = player.y + 18;
      } else {
        pet.targetX = player.x + 86;
        pet.targetY = player.y + 45;
      }

      pet.x += (pet.targetX - pet.x) * 0.18;
      pet.y += (pet.targetY - pet.y) * 0.18;
      pet.bob += 0.08;

      pet.shootCd--;

      if (pet.shootCd <= 0) {
        pet.shootCd = Math.max(
          8,
          Math.floor(30 / Math.max(0.1, Number(pet.data.normalRateRate || 1) * getSupportRapidRate()))
        );

        normalShot(pet);
      }

      pet.skillCd--;

      if (pet.skillCd <= 0) {
        pet.skillCd = currentSkillCt(pet) * 60;
        skillShot(pet);
      }
    });

    updateBullets();
    updateTexts();
    updateCutins();
  }

  function validTarget(e){
    if (!gameState) return false;

    return e &&
      !e.dead &&
      e.kind !== 'gate' &&
      e.kind !== 'enemyBullet' &&
      e.hp != null &&
      e.y < gameState.player.y - 25;
  }

  function validBreakableBullet(e){
    return e &&
      !e.dead &&
      e.kind === 'enemyBullet' &&
      e.breakable &&
      Number(e.hp || 0) > 0;
  }

  function findTarget(pet){
    if (!gameState) return null;

    let nearest = null;
    let nearestDist = Infinity;

    gameState.entities.forEach(e => {
      if (!validTarget(e) && !validBreakableBullet(e)) return;

      const dx = e.x - pet.x;
      const dy = e.y - pet.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    });

    return nearest;
  }

  function getFrontTargets(){
    if (!gameState) return [];

    return gameState.entities
      .filter(e => validTarget(e) || validBreakableBullet(e))
      .sort((a, b) => b.y - a.y);
  }

  function normalShot(pet){
    const target = findTarget(pet);
    if (!target) return;

    const count = normalWide(pet);
    const baseDmg = gameState.power * normalRate(pet) * getSupportPowerRate();

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 18;
      pushBullet(pet, target, baseDmg, 'normal', offset);
    }
  }

  function skillShot(pet){
    if (!gameState) return;

    showCutin(pet);

    const key = pet.data.key;

    if (key === 'mobslime') {
      healPlayer(pet);
    }

    if (key === 'chibimobtetsu') {
      addShield(pet);
    }

    if (key === 'wondamob') {
      addSupport('rapid', level(pet) >= 30 ? 1.35 : 1.15, 8 * 60);
    }

    if (key === 'punimobpink') {
      addSupport('coin', level(pet) >= 5 ? 2.5 : 2.0, 8 * 60);
    }

    const targets = getFrontTargets();
    if (!targets.length && key !== 'mobslime' && key !== 'chibimobtetsu' && key !== 'wondamob') return;

    const count = getSkillCount(pet);
    const wide = skillWide(pet);

    for (let i = 0; i < count; i++) {
      for (let w = 0; w < wide; w++) {
        const target = targets.length ? targets[(i + w) % targets.length] : null;
        if (!target || target.dead) continue;

        const rate = getSkillPowerRate(pet, target);
        const dmg = gameState.power * rate * getSupportPowerRate();
        const offset = (w - (wide - 1) / 2) * 26;

        pushBullet(pet, target, dmg, 'skill', offset);
      }
    }

    petTexts.push({
      text:pet.data.skillName || 'PET SKILL',
      x:pet.x,
      y:pet.y - 34,
      life:50,
      color:bulletColor(pet.data, 'skill')
    });

    if (window.MobShotMission && window.MobShotMission.onSkillUsed) {
      window.MobShotMission.onSkillUsed();
    }
  }

  function getSkillCount(pet){
    const lv = level(pet);
    const key = pet.data.key;
    let count = Number(pet.data.skillBaseCount || 1);

    if (key === 'mobdrago') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 12;
    } else if (key === 'mobfrog') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 5;
    } else if (key === 'mobdenden') {
      if (lv >= 5) count += 2;
      if (lv >= 30) count = 16;
    } else if (key === 'mobwolf') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 8;
    } else if (key === 'mobslime') {
      if (lv >= 30) count = 6;
    } else if (key === 'mobchibihawk') {
      if (lv >= 30) count = 2;
    } else if (key === 'punimobpink') {
      if (lv >= 30) count = 10;
    } else if (key === 'minimiramob') {
      if (lv >= 5) count += 2;
      if (lv >= 25) count += 2;
      if (lv >= 30) count = 10;
    } else if (key === 'neonkidmob') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 4;
    } else if (key === 'minidramob') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 3;
    } else if (key === 'merurumob') {
      if (lv >= 15) count += 2;
      if (lv >= 30) count = 6;
    } else if (key === 'lilmoblilith') {
      if (lv >= 5) count += 2;
      if (lv >= 25) count += 3;
      if (lv >= 30) count = 14;
    } else if (key === 'chibimaohmob') {
      if (lv >= 30) count = 2;
    } else if (key === 'chibimobmelt') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 3;
    } else if (key === 'lilmobnep') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 5;
    } else if (key === 'chibiulmob') {
      if (lv >= 5) count += 2;
      if (lv >= 25) count += 3;
      if (lv >= 30) count = 13;
    } else if (key === 'hero') {
      if (lv >= 5) count += 1;
      if (lv >= 30) count = 4;
    }

    return Math.max(1, count);
  }

  function getSkillPowerRate(pet, target){
    const lv = level(pet);
    const key = pet.data.key;
    let rate = Number(pet.data.skillPowerRate || 1);

    if (target && (target.kind === 'gimmick' || target.kind === 'chest')) {
      rate = Number(pet.data.skillObstacleRate || rate);
    }

    if (target && (target.kind === 'boss' || target.kind === 'midBoss')) {
      rate = Number(pet.data.skillBossRate || rate);
    }

    if (key === 'mobdrago' && lv >= 30) rate = 1.7;
    if (key === 'mobfrog' && lv >= 30) rate = target && (target.kind === 'gimmick' || target.kind === 'chest') ? 4.0 : 2.7;
    if (key === 'mobdenden' && lv >= 30) rate = 1.0;
    if (key === 'mobwolf' && lv >= 30) rate = target && (target.kind === 'boss' || target.kind === 'midBoss') ? 3.6 : 2.3;
    if (key === 'mobslime' && lv >= 30) rate = 1.4;
    if (key === 'mobchibihawk') rate = lv >= 30 ? 6.0 : lv >= 5 ? 3.5 : 3.0;
    if (key === 'punimobpink' && lv >= 30) rate = 1.35;
    if (key === 'minimiramob' && lv >= 30) rate = 1.75;
    if (key === 'neonkidmob' && lv >= 30) rate = 2.3;
    if (key === 'minidramob' && lv >= 30) rate = 6.0;
    if (key === 'merurumob' && lv >= 30) rate = 2.7;
    if (key === 'lilmoblilith' && lv >= 30) rate = 1.9;
    if (key === 'chibimaohmob') rate = lv >= 30 ? 8.0 : lv >= 5 ? 5.5 : 4.8;
    if (key === 'chibimobmelt' && lv >= 30) rate = target && (target.kind === 'gimmick' || target.kind === 'chest') ? 7.0 : 5.0;
    if (key === 'lilmobnep' && lv >= 30) rate = 3.6;
    if (key === 'chibiulmob' && lv >= 30) rate = 2.7;
    if (key === 'hero' && lv >= 30) rate = 7.0;

    return skillRate(pet, rate);
  }

  function getBreakPower(pet, type){
    const lv = level(pet);
    let power = Number(type === 'skill' ? pet.data.skillBreakPower || 0 : pet.data.normalBreakPower || 0);

    if (type === 'skill') {
      if (pet.data.key === 'mobdrago' && lv >= 30) power = 350;
      if (pet.data.key === 'mobfrog' && lv >= 30) power = 550;
      if (pet.data.key === 'mobdenden' && lv >= 30) power = 220;
      if (pet.data.key === 'mobwolf' && lv >= 30) power = 700;
      if (pet.data.key === 'mobchibihawk' && lv >= 30) power = 1000;
      if (pet.data.key === 'minidramob' && lv >= 30) power = 1600;
      if (pet.data.key === 'hero' && lv >= 30) power = 2000;
    }

    return power;
  }

  function pushBullet(pet, target, damage, type, offset){
    if (!target) return;

    const dx = target.x - (pet.x + Number(offset || 0));
    const dy = target.y - pet.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const speed = getBulletSpeed(pet, type);

    petBullets.push({
      x:pet.x + Number(offset || 0),
      y:pet.y - 8,
      vx:dx / len * speed,
      vy:dy / len * speed,
      r:getBulletRadius(pet, type),
      damage,
      target,
      type,
      life:type === 'skill' ? 125 : 78,
      color:bulletColor(pet.data, type),
      image:pet.data.atkImage || '',
      htmlBullet:pet.data.htmlBullet || '',
      breakPower:getBreakPower(pet, type),
      petKey:pet.data.key
    });
  }

  function getBulletSpeed(pet, type){
    let speed = type === 'skill' ? 5.6 : 7.4;

    if (type === 'skill') {
      if (pet.data.key === 'mobdrago' && level(pet) >= 15) speed *= 1.12;
      if (pet.data.key === 'mobchibihawk' && level(pet) >= 25) speed *= 1.35;
      if (pet.data.key === 'lilmobnep' && level(pet) >= 25) speed *= 1.18;
      if (pet.data.key === 'neonkidmob' && level(pet) >= 25) speed *= 1.15;
    }

    return speed;
  }

  function getBulletRadius(pet, type){
    let r = type === 'skill' ? 18 : 5;

    if (pet.data.atkImage && type === 'skill') r = 22;
    if (pet.data.key === 'chibimaohmob' && type === 'skill') r = 32;
    if (pet.data.key === 'minidramob' && type === 'skill') r = 28;
    if (pet.data.key === 'lilmobnep' && type === 'skill' && level(pet) >= 15) r *= 1.25;
    if (pet.data.key === 'hero' && type === 'skill' && level(pet) >= 25) r *= 1.35;
    if (pet.data.key === 'chibimobmelt' && type === 'skill' && level(pet) >= 25) r *= 1.25;

    return r;
  }

  function bulletColor(data, type){
    const key = data.key;

    if (data.htmlBullet === 'fire') return type === 'skill' ? '#ff6530' : '#ffb347';
    if (data.htmlBullet === 'water') return type === 'skill' ? '#4bd8ff' : '#69dfff';
    if (data.htmlBullet === 'thunder') return type === 'skill' ? '#ffe84a' : '#fff35a';
    if (data.htmlBullet === 'gray') return type === 'skill' ? '#d8f1ff' : '#e8f4ff';

    if (key.includes('riri') || key.includes('lilith') || key.includes('ul') || key === 'merurumob') return '#ff73c9';
    if (key.includes('neon')) return '#5ffcff';
    if (key.includes('maoh')) return '#bd5bff';
    if (key.includes('nep')) return '#55d6ff';
    if (key === 'hero') return '#ffe66b';

    return type === 'skill' ? '#ffffff' : '#dfe8ff';
  }

  function updateBullets(){
    for (const b of petBullets) {
      if (b.dead) continue;

      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if (validBreakableBullet(b.target)) {
        const target = b.target;
        const hitRadius = target.r || 8;

        if (Math.hypot(b.x - target.x, b.y - target.y) < hitRadius + b.r) {
          damageBreakableBullet(target, b);
          b.dead = true;
        }

        if (b.life <= 0) b.dead = true;
        continue;
      }

      if (!validTarget(b.target)) {
        b.dead = true;
        continue;
      }

      const target = b.target;
      const hitRadius = target.r || Math.max(target.w || 40, target.h || 40) / 2;

      if (Math.hypot(b.x - target.x, b.y - target.y) < hitRadius + b.r) {
        damageTarget(target, b.damage, b);
        b.dead = true;
      }

      if (b.life <= 0) {
        b.dead = true;
      }
    }

    for (let i = petBullets.length - 1; i >= 0; i--) {
      if (petBullets[i].dead) {
        petBullets.splice(i, 1);
      }
    }
  }

  function damageBreakableBullet(target, bullet){
    if (!target || target.dead) return;

    target.hp = Number(target.hp || 1) - Number(bullet.breakPower || 0);

    petTexts.push({
      text:'BREAK',
      x:target.x,
      y:target.y - 12,
      life:26,
      color:'#9deeff'
    });

    if (target.hp <= 0) {
      target.dead = true;
    }
  }

  function damageTarget(target, damage, bullet){
    if (!target || target.dead) return;

    target.hp -= damage;

    petTexts.push({
      text:'-' + Math.ceil(damage),
      x:target.x,
      y:target.y - 18,
      life:28,
      color:bullet ? bullet.color : '#ffffff'
    });

    if (bullet && bullet.petKey === 'merurumob') {
      vampHeal(damage, levelFromKey('merurumob'));
    }

    if (target.hp <= 0) {
      if (window.MobShotGameCore && window.MobShotGameCore.killEntity) {
        window.MobShotGameCore.killEntity(target);
      } else {
        target.dead = true;
      }
    }
  }

  function levelFromKey(key){
    const pet = battlePets.find(p => p.data.key === key);
    return pet ? level(pet) : 1;
  }

  function healPlayer(pet){
    if (!gameState) return;

    const lv = level(pet);
    const heal = lv >= 30 ? 100 : lv >= 5 ? 50 : 30;

    gameState.hp = Math.min(gameState.maxHp || gameState.hp, gameState.hp + heal);

    petTexts.push({
      text:'HP +' + heal,
      x:gameState.player.x,
      y:gameState.player.y - 58,
      life:50,
      color:'#9dff73'
    });

    if (lv >= 15) {
      addShield(pet);
    }
  }

  function vampHeal(damage, lv){
    if (!gameState) return;

    const rate = lv >= 30 ? 0.10 : lv >= 25 ? 0.07 : lv >= 5 ? 0.02 : 0;
    if (rate <= 0) return;

    const heal = Math.max(1, Math.floor(Number(damage || 0) * rate));
    gameState.hp = Math.min(gameState.maxHp || gameState.hp, gameState.hp + heal);
  }

  function addShield(pet){
    const lv = level(pet);
    const duration = lv >= 30 ? 6 : lv >= 25 ? 6 : lv >= 5 ? 4 : 3;

    addSupport('shield', 1, duration * 60);

    petTexts.push({
      text:'SHIELD',
      x:gameState.player.x,
      y:gameState.player.y - 72,
      life:50,
      color:'#dfe8ff'
    });
  }

  function addSupport(type, value, frames){
    supportEffects.push({
      type,
      value,
      frames
    });
  }

  function updateSupportEffects(){
    for (const e of supportEffects) {
      e.frames--;
    }

    for (let i = supportEffects.length - 1; i >= 0; i--) {
      if (supportEffects[i].frames <= 0) {
        supportEffects.splice(i, 1);
      }
    }
  }

  function getSupportRapidRate(){
    let rate = 1;

    supportEffects.forEach(e => {
      if (e.type === 'rapid') rate = Math.max(rate, Number(e.value || 1));
    });

    return rate;
  }

  function getSupportPowerRate(){
    let rate = 1;

    supportEffects.forEach(e => {
      if (e.type === 'power') rate = Math.max(rate, Number(e.value || 1));
    });

    return rate;
  }

  function getCoinMultiplier(){
    let rate = 1;

    supportEffects.forEach(e => {
      if (e.type === 'coin') rate = Math.max(rate, Number(e.value || 1));
    });

    return rate;
  }

  function updateTexts(){
    for (const t of petTexts) {
      t.y -= 0.8;
      t.life--;
    }

    for (let i = petTexts.length - 1; i >= 0; i--) {
      if (petTexts[i].life <= 0) {
        petTexts.splice(i, 1);
      }
    }
  }

  function showCutin(pet){
    cutins.push({
      name:pet.data.name,
      skill:pet.data.skillName || 'PET SKILL',
      image:pet.data.frontImage || pet.data.backImage,
      life:58,
      maxLife:58
    });
  }

  function updateCutins(){
    for (const c of cutins) {
      c.life--;
    }

    for (let i = cutins.length - 1; i >= 0; i--) {
      if (cutins[i].life <= 0) {
        cutins.splice(i, 1);
      }
    }
  }

  function draw(ctx){
    drawBullets(ctx);
    drawPets(ctx);
    drawTexts(ctx);
    drawCutins(ctx);
    drawShield(ctx);
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

      if (imageReady(image)) {
        ctx.drawImage(image, pet.x - 25, y - 28, 50, 50);
      } else {
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

      const image = img(b.image);

      if (imageReady(image)) {
        const size = b.type === 'skill' ? b.r * 3.5 : b.r * 2.8;
        ctx.drawImage(image, b.x - size / 2, b.y - size / 2, size, size);
      } else {
        drawHtmlBullet(ctx, b);
      }

      ctx.restore();
    });
  }

  function drawHtmlBullet(ctx, b){
    ctx.fillStyle = b.color;
    ctx.strokeStyle = '#111';
    ctx.lineWidth = b.type === 'skill' ? 3 : 2;

    if (b.htmlBullet === 'fire') {
      ctx.fillStyle = b.type === 'skill' ? '#ff6530' : '#ffb347';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffe66b';
      ctx.beginPath();
      ctx.arc(b.x - 2, b.y - 2, b.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.htmlBullet === 'water') {
      ctx.fillStyle = b.type === 'skill' ? '#4bd8ff' : '#69dfff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (b.type === 'skill') {
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else if (b.htmlBullet === 'thunder') {
      ctx.fillStyle = '#fff35a';
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - b.r - 6);
      ctx.lineTo(b.x + b.r, b.y - 2);
      ctx.lineTo(b.x + 3, b.y + 3);
      ctx.lineTo(b.x + b.r * 0.8, b.y + b.r + 7);
      ctx.lineTo(b.x - b.r, b.y + 2);
      ctx.lineTo(b.x - 3, b.y - 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      if (b.type === 'skill') {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 7, 0, Math.PI * 2);
        ctx.globalAlpha = 0.28;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
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

  function drawCutins(ctx){
    cutins.forEach(c => {
      const rate = c.life / c.maxLife;
      const alpha = Math.min(1, rate < 0.25 ? rate / 0.25 : 1);
      const image = img(c.image);

      ctx.save();
      ctx.globalAlpha = alpha;

      const y = 88 - (1 - rate) * 14;

      ctx.fillStyle = 'rgba(0,0,0,.62)';
      ctx.fillRect(0, y - 44, ctx.canvas.width, 88);

      if (imageReady(image)) {
        ctx.drawImage(image, 18, y - 38, 76, 76);
      }

      ctx.textAlign = 'left';
      ctx.font = '900 15px system-ui';
      ctx.fillStyle = '#dfe8ff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(c.name, 105, y - 8);
      ctx.fillText(c.name, 105, y - 8);

      ctx.font = '1000 24px system-ui';
      ctx.fillStyle = '#ffe66b';
      ctx.strokeText(c.skill + '!!', 105, y + 24);
      ctx.fillText(c.skill + '!!', 105, y + 24);

      ctx.restore();
    });
  }

  function drawShield(ctx){
    if (!gameState) return;

    const active = supportEffects.some(e => e.type === 'shield');
    if (!active) return;

    const p = gameState.player;

    ctx.save();
    ctx.globalAlpha = 0.36;
    ctx.strokeStyle = '#dfe8ff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  window.MobShotPetBattle = {
    init,
    update,
    draw,
    getCoinMultiplier
  };
})();
