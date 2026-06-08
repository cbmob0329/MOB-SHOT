'use strict';

(function(){
  const D = window.MOBSHOT_DATA;

  const mainScreen =
    document.getElementById('mainScreen') ||
    document.getElementById('mainView') ||
    document.querySelector('.screen');

  const gameScreen =
    document.getElementById('gameScreen') ||
    document.getElementById('gameView');

  function $(id){
    return document.getElementById(id);
  }

  function preventSmartphoneZoom(){
    let lastTouchEnd = 0;

    document.addEventListener('gesturestart', function(e){
      e.preventDefault();
    }, { passive:false });

    document.addEventListener('gesturechange', function(e){
      e.preventDefault();
    }, { passive:false });

    document.addEventListener('gestureend', function(e){
      e.preventDefault();
    }, { passive:false });

    document.addEventListener('dblclick', function(e){
      e.preventDefault();
    }, { passive:false });

    document.addEventListener('touchend', function(e){
      const now = Date.now();

      if (now - lastTouchEnd <= 350) {
        e.preventDefault();
      }

      lastTouchEnd = now;
    }, { passive:false });
  }

  function showScreen(name){
    const screens = document.querySelectorAll('.screen');

    screens.forEach(screen => {
      screen.classList.remove('active');
    });

    if (name === 'game') {
      if (gameScreen) {
        gameScreen.classList.add('active');
      }

      if (window.MobShotGame && window.MobShotGame.start) {
        window.MobShotGame.start();
      } else {
        alert('ゲーム本体が読み込まれていません。js/game.js を確認してください。');
      }

      return;
    }

    if (window.MobShotGame && window.MobShotGame.stop) {
      window.MobShotGame.stop();
    }

    if (mainScreen) {
      mainScreen.classList.add('active');
    }

    refreshMainHud();
    refreshMainVisuals();
  }

  function setImage(id, src){
    const el = $(id);

    if (!el || !src) return;

    el.src = src;

    el.onerror = function(){
      el.style.display = 'none';

      const fallback = el.nextElementSibling;

      if (fallback) {
        fallback.style.display = 'block';
      }
    };
  }

  function readSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    return {
      totalScore: 0,
      bestScore: 0,
      coin: 0,
      diamond: 0,
      rank: 1,
      stageProgress: {
        currentAreaIndex: 0,
        currentStageNo: 1
      }
    };
  }

  function currentStageText(){
    if (window.MobShotStorage && window.MobShotStorage.getCurrentStage) {
      const stage = window.MobShotStorage.getCurrentStage();
      return `${stage.areaName} ${stage.id}`;
    }

    return '草原 1-1';
  }

  function refreshMainHud(){
    const save = readSave();

    const diamond = $('mainDiamond');
    const rank = $('mainRank');
    const coin = $('mainCoin');

    if (diamond) {
      diamond.textContent = Number(save.diamond || 0).toLocaleString();
    }

    if (rank) {
      rank.textContent = Number(save.rank || 1).toLocaleString();
    }

    if (coin) {
      coin.textContent = Number(save.coin || 0).toLocaleString();
    }

    const sortieBtn = $('sortieBtn');

    if (sortieBtn) {
      sortieBtn.setAttribute('data-stage', currentStageText());
    }
  }

  function refreshMainVisuals(){
    if (window.MobShotEquip && window.MobShotEquip.updateMainPlayerImage) {
      window.MobShotEquip.updateMainPlayerImage();
    }

    if (window.MobShotPets && window.MobShotPets.renderAll) {
      window.MobShotPets.renderAll();
    }

    if (window.MobShotShop && window.MobShotShop.render) {
      window.MobShotShop.render();
    }

    if (window.MobShotEquip && window.MobShotEquip.render) {
      window.MobShotEquip.render();
    }

    if (window.MobShotMission && window.MobShotMission.render) {
      window.MobShotMission.render();
    }
  }

  function runHandler(handler, e){
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    handler(e);
  }

  function wireButton(ids, handler){
    ids.forEach(id => {
      const btn = $(id);

      if (!btn || btn.__mobMainBound) return;

      btn.__mobMainBound = true;

      btn.addEventListener('click', function(e){
        runHandler(handler, e);
      }, { passive:false });

      btn.addEventListener('pointerup', function(e){
        runHandler(handler, e);
      }, { passive:false });

      btn.addEventListener('touchend', function(e){
        runHandler(handler, e);
      }, { passive:false });
    });
  }

  function initImages(){
    if (!D) return;

    if (D.menu) {
      setImage('titleImg', D.menu.title);
      setImage('sortieImg', D.menu.sortie);
      setImage('shopImg', D.menu.shop);
      setImage('equipImg', D.menu.equip);
      setImage('petImg', D.menu.pet);
      setImage('gachaImg', D.menu.gacha);
      setImage('missionImg', D.menu.mission);
      setImage('collectionImg', D.menu.collection);
    }

    if (D.player) {
      setImage('mainPlayer', D.player.menuImage || D.player.image);
    }

    if (D.hud) {
      setImage('hudStageImg', D.hud.stage);
      setImage('hudScoreImg', D.hud.score);
      setImage('hudCoinImg', D.hud.coin);
      setImage('hudLifeImg', D.hud.life);
    }
  }

  function goMain(){
    if (window.MobShotGame && window.MobShotGame.stop) {
      window.MobShotGame.stop();
    }

    showScreen('main');
    refreshMainHud();
    refreshMainVisuals();
  }

  function goGame(){
    showScreen('game');
  }

  function openPetEquip(){
    if (window.MobShotPets && window.MobShotPets.openModal) {
      window.MobShotPets.openModal();
      return;
    }

    const modal = $('petEquipModal');

    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  function openShop(){
    if (window.MobShotShop && window.MobShotShop.open) {
      window.MobShotShop.open();
      return;
    }

    const modal = $('shopModal');

    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  function openEquip(){
    if (window.MobShotEquip && window.MobShotEquip.open) {
      window.MobShotEquip.open();
      return;
    }

    const modal = $('equipModal');

    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  function openMission(){
    if (window.MobShotMission && window.MobShotMission.open) {
      window.MobShotMission.open();
      return;
    }

    const modal = $('missionModal');

    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  function createDeleteSaveButton(){
    if (!mainScreen) return;

    let btn = $('deleteSaveBtn');

    if (btn) return;

    btn = document.createElement('button');
    btn.id = 'deleteSaveBtn';
    btn.type = 'button';
    btn.textContent = '🗑';
    btn.className = 'delete-save-btn';
    btn.setAttribute('aria-label', 'セーブ削除');

    btn.style.position = 'absolute';
    btn.style.left = '6.2vw';
    btn.style.top = '17.2svh';
    btn.style.width = '42px';
    btn.style.height = '42px';
    btn.style.zIndex = '20';
    btn.style.border = '2px solid rgba(255,255,255,.45)';
    btn.style.borderRadius = '50%';
    btn.style.padding = '0';
    btn.style.fontWeight = '1000';
    btn.style.fontSize = '20px';
    btn.style.lineHeight = '42px';
    btn.style.textAlign = 'center';
    btn.style.color = '#fff';
    btn.style.background = 'linear-gradient(#ff5b5b,#9d1212)';
    btn.style.boxShadow = '0 4px 0 rgba(0,0,0,.3), inset 0 2px 0 rgba(255,255,255,.18)';

    mainScreen.appendChild(btn);
  }

  function bindPetButtonFallback(){
    const petBtn = $('openPetEquipBtn');

    if (!petBtn || petBtn.__mobPetFallbackBound) return;

    petBtn.__mobPetFallbackBound = true;

    petBtn.addEventListener('click', function(e){
      runHandler(openPetEquip, e);
    }, { passive:false });

    petBtn.addEventListener('pointerup', function(e){
      runHandler(openPetEquip, e);
    }, { passive:false });

    petBtn.addEventListener('touchend', function(e){
      runHandler(openPetEquip, e);
    }, { passive:false });
  }

  function bindShopButtonFallback(){
    const shopBtn = $('openShopBtn');

    if (!shopBtn || shopBtn.__mobShopFallbackBound) return;

    shopBtn.__mobShopFallbackBound = true;

    shopBtn.addEventListener('click', function(e){
      runHandler(openShop, e);
    }, { passive:false });

    shopBtn.addEventListener('pointerup', function(e){
      runHandler(openShop, e);
    }, { passive:false });

    shopBtn.addEventListener('touchend', function(e){
      runHandler(openShop, e);
    }, { passive:false });
  }

  function bindEquipButtonFallback(){
    const equipBtn = $('openEquipBtn');

    if (!equipBtn || equipBtn.__mobEquipFallbackBound) return;

    equipBtn.__mobEquipFallbackBound = true;

    equipBtn.addEventListener('click', function(e){
      runHandler(openEquip, e);
    }, { passive:false });

    equipBtn.addEventListener('pointerup', function(e){
      runHandler(openEquip, e);
    }, { passive:false });

    equipBtn.addEventListener('touchend', function(e){
      runHandler(openEquip, e);
    }, { passive:false });
  }

  function bindMissionButtonFallback(){
    const missionBtn = $('openMissionBtn');

    if (!missionBtn || missionBtn.__mobMissionFallbackBound) return;

    missionBtn.__mobMissionFallbackBound = true;

    missionBtn.addEventListener('click', function(e){
      runHandler(openMission, e);
    }, { passive:false });

    missionBtn.addEventListener('pointerup', function(e){
      runHandler(openMission, e);
    }, { passive:false });

    missionBtn.addEventListener('touchend', function(e){
      runHandler(openMission, e);
    }, { passive:false });
  }

  function bindResultButtons(){
    const retry = $('resultRetryBtn');

    if (retry && !retry.__mobRetryBound) {
      retry.__mobRetryBound = true;

      retry.addEventListener('click', function(e){
        runHandler(goGame, e);
      }, { passive:false });

      retry.addEventListener('pointerup', function(e){
        runHandler(goGame, e);
      }, { passive:false });
    }

    const resultHome = $('resultHomeBtn');

    if (resultHome && !resultHome.__mobHomeBound) {
      resultHome.__mobHomeBound = true;

      resultHome.addEventListener('click', function(e){
        runHandler(goMain, e);
      }, { passive:false });

      resultHome.addEventListener('pointerup', function(e){
        runHandler(goMain, e);
      }, { passive:false });
    }
  }

  function bindDeleteSave(){
    const btn = $('deleteSaveBtn');

    if (!btn || btn.__mobDeleteBound) return;

    btn.__mobDeleteBound = true;

    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();

      const ok = confirm(
        'セーブデータを削除しますか？\nコイン・スコア・ランク・ステージ進行・ペット・ショップ・装備・ミッション状態などが初期化されます。'
      );

      if (!ok) return;

      localStorage.removeItem('mobshot_split_v1');
      localStorage.removeItem('mobshot_save');
      localStorage.removeItem('mobshot_meta');
      localStorage.removeItem('MOBSHOT_SAVE');

      localStorage.removeItem('mobshot_pet_state_v3');
      localStorage.removeItem('mobshot_pet_equip_test');
      localStorage.removeItem('mobshot_pet_equip_test_v2');

      localStorage.removeItem('mobshot_shop_state_v1');
      localStorage.removeItem('mobshot_equip_state_v1');
      localStorage.removeItem('mobshot_mission_state_v1');

      alert('セーブデータを削除しました。');
      location.reload();
    }, { passive:false });
  }

  function initModules(){
    if (window.MobShotShop && window.MobShotShop.init) {
      window.MobShotShop.init();
    }

    if (window.MobShotEquip && window.MobShotEquip.init) {
      window.MobShotEquip.init();
    }

    if (window.MobShotMission && window.MobShotMission.init) {
      window.MobShotMission.init();
    }

    if (window.MobShotPets && window.MobShotPets.init) {
      window.MobShotPets.init();
    }
  }

  function init(){
    preventSmartphoneZoom();
    initImages();
    refreshMainHud();

    createDeleteSaveButton();
    initModules();

    wireButton(['sortieBtn', 'btnSortie', 'mainSortieBtn'], goGame);
    wireButton(['backBtn', 'gameBackBtn'], goMain);

    bindShopButtonFallback();
    bindEquipButtonFallback();
    bindMissionButtonFallback();
    bindPetButtonFallback();

    bindResultButtons();
    bindDeleteSave();

    refreshMainVisuals();

    window.addEventListener('mobshot:saveUpdated', function(){
      refreshMainHud();
      refreshMainVisuals();
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  window.MobShotMain = {
    showScreen,
    refreshMainHud,
    refreshMainVisuals,
    goMain,
    goGame,
    openShop,
    openEquip,
    openMission,
    openPetEquip
  };
})();
