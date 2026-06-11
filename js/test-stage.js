'use strict';

(function(){
  let testLaunchLock = false;

  function $(id){
    return document.getElementById(id);
  }

  function storage(){
    return window.MobShotStorage || null;
  }

  function stageList(){
    const S = storage();

    if (!S || !S.STAGE_LIST) return [];

    return S.STAGE_LIST;
  }

  function openModal(){
    const modal = $('testStageModal');

    if (!modal) return;

    renderStageList();
    modal.classList.remove('hidden');
  }

  function closeModal(){
    const modal = $('testStageModal');

    if (!modal) return;

    modal.classList.add('hidden');
  }

  function groupTitle(stage){
    if (!stage) return '';

    return `${stage.difficulty} / ${stage.name || stage.areaName || ''}`;
  }

  function renderStageList(){
    const list = $('testStageList');

    if (!list) return;

    const stages = stageList();

    list.innerHTML = '';

    if (!stages.length) {
      list.innerHTML = `
        <div class="test-stage-empty">
          ステージデータが読み込まれていません。
        </div>
      `;
      return;
    }

    let lastGroup = '';

    stages.forEach((stage, index) => {
      const group = groupTitle(stage);

      if (group !== lastGroup) {
        lastGroup = group;

        const title = document.createElement('div');
        title.className = 'test-stage-group';
        title.textContent = group;
        list.appendChild(title);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'test-stage-btn';

      const bossText = stage.isLegend || stage.isStrongBoss
        ? '強力ボス'
        : '通常';

      btn.innerHTML = `
        <span class="test-stage-id">${stage.id}</span>
        <span class="test-stage-name">${stage.name || stage.areaName}</span>
        <span class="test-stage-boss">${bossText}</span>
      `;

      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        startTestStage(index);
      }, { passive:false });

      list.appendChild(btn);
    });
  }

  function activateGameScreen(){
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const game = $('gameScreen');

    if (game) {
      game.classList.add('active');
    }
  }

  function startTestStage(index){
    const S = storage();

    if (!S || !S.setTestStageByIndex) {
      alert('テスト出撃の準備ができていません。');
      return;
    }

    S.setTestStageByIndex(index);
    closeModal();

    testLaunchLock = true;

    const sortie = $('sortieBtn');

    if (sortie) {
      sortie.click();
      setTimeout(() => {
        testLaunchLock = false;
      }, 500);
      return;
    }

    activateGameScreen();

    if (window.MobShotGame && window.MobShotGame.start) {
      window.MobShotGame.start();
    }

    setTimeout(() => {
      testLaunchLock = false;
    }, 500);
  }

  function clearTestStageOnNormalSortie(e){
    if (testLaunchLock) return;

    const S = storage();

    if (S && S.clearTestStage) {
      S.clearTestStage();
    }
  }

  function bind(){
    const testBtn = $('testSortieBtn');

    if (testBtn && !testBtn.__mobTestStageBound) {
      testBtn.__mobTestStageBound = true;

      testBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }, { passive:false });

      testBtn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }, { passive:false });
    }

    const closeBtn = $('testStageCloseBtn');

    if (closeBtn && !closeBtn.__mobTestStageCloseBound) {
      closeBtn.__mobTestStageCloseBound = true;

      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }, { passive:false });
    }

    const modal = $('testStageModal');

    if (modal && !modal.__mobTestStageBgBound) {
      modal.__mobTestStageBgBound = true;

      modal.addEventListener('click', function(e){
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    const sortie = $('sortieBtn');

    if (sortie && !sortie.__mobNormalSortieClearTestBound) {
      sortie.__mobNormalSortieClearTestBound = true;

      sortie.addEventListener('click', clearTestStageOnNormalSortie, true);
      sortie.addEventListener('pointerup', clearTestStageOnNormalSortie, true);
    }
  }

  function init(){
    bind();
  }

  document.addEventListener('DOMContentLoaded', init);
  init();

  window.MobShotTestStage = {
    open: openModal,
    close: closeModal,
    render: renderStageList,
    start: startTestStage
  };
})();
