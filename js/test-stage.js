'use strict';

(function(){
  const TEST_BOSS_SAVE_KEY = 'mobshot_test_boss_v1';

  let testLaunchLock = false;
  let currentTab = 'stage';

  const TEST_BOSS_LIST = [
    { group:'通常ボス', name:'ホークモブ', image:'boss/hawks.png', area:'草原', strong:false },
    { group:'通常ボス', name:'ミラモブ', image:'boss/miraboss.png', area:'砂漠', strong:false },
    { group:'通常ボス', name:'モブガーディアン', image:'boss/bossban.png', area:'田舎町', strong:false },
    { group:'通常ボス', name:'ネオンモブ', image:'boss/bossneon.png', area:'ネオン街', strong:false },
    { group:'通常ボス', name:'ドラゴンモブ', image:'boss/bossdragoon.png', area:'マグマ', strong:false },
    { group:'通常ボス', name:'モブリリス', image:'boss/bossriris.png', area:'魔王城', strong:false },

    { group:'強力ボス', name:'ホークモブⅡ', image:'boss/hawks2.png', area:'草原', strong:true },
    { group:'強力ボス', name:'ミラモブⅡ', image:'boss/bossmira2.png', area:'砂漠', strong:true },
    { group:'強力ボス', name:'モブガーディアンⅡ', image:'boss/bossban2.png', area:'田舎町', strong:true },
    { group:'強力ボス', name:'ネオンモブⅡ', image:'boss/bossneon2.png', area:'ネオン街', strong:true },
    { group:'強力ボス', name:'ドラゴンモブⅡ', image:'boss/bossdragoon2.png', area:'マグマ', strong:true },
    { group:'強力ボス', name:'モブ魔王', image:'boss/bossmaoh.png', area:'魔王城', strong:true },

    { group:'レジェンド', name:'モブメイル', image:'boss/bossmeiru.png', area:'監獄', strong:true },
    { group:'レジェンド', name:'モブスミス', image:'boss/bosssmith.png', area:'マトリックス', strong:true },
    { group:'レジェンド', name:'モブネプ', image:'boss/bossmobnep.png', area:'海の線路', strong:true },
    { group:'レジェンド', name:'ブルネオモブ', image:'boss/bossneonblue.png', area:'ネオン高速', strong:true },
    { group:'レジェンド', name:'パルネオモブ', image:'boss/bossneonpur.png', area:'ネオン高速', strong:true },
    { group:'レジェンド', name:'閻魔モブ', image:'boss/bossenmob.png', area:'魔界', strong:true },
    { group:'レジェンド', name:'ウルモブリリス', image:'boss/bossulriri.png', area:'魔王の間', strong:true }
  ];

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

  function saveTestBoss(boss){
    window.__mobshotTestBoss = boss || null;

    try {
      if (boss) {
        localStorage.setItem(TEST_BOSS_SAVE_KEY, JSON.stringify(boss));
      } else {
        localStorage.removeItem(TEST_BOSS_SAVE_KEY);
      }
    } catch(e) {}
  }

  function getTestBoss(){
    if (window.__mobshotTestBoss) return window.__mobshotTestBoss;

    try {
      const raw = localStorage.getItem(TEST_BOSS_SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e) {
      return null;
    }
  }

  function clearTestBoss(){
    saveTestBoss(null);
  }

  function clearTestStage(){
    const S = storage();
    if (S && S.clearTestStage) {
      S.clearTestStage();
    }
  }

  function openModal(){
    const modal = $('testStageModal');
    if (!modal) return;

    ensureTabs();
    renderCurrentTab();
    modal.classList.remove('hidden');
  }

  function closeModal(){
    const modal = $('testStageModal');
    if (!modal) return;
    modal.classList.add('hidden');
  }

  function ensureTabs(){
    const list = $('testStageList');
    if (!list) return;

    const modal = $('testStageModal');
    if (!modal) return;

    if ($('testStageTabBar')) return;

    const tabBar = document.createElement('div');
    tabBar.id = 'testStageTabBar';
    tabBar.className = 'test-stage-tab-bar';

    const stageBtn = document.createElement('button');
    stageBtn.type = 'button';
    stageBtn.id = 'testStageTabStage';
    stageBtn.className = 'test-stage-tab active';
    stageBtn.textContent = 'ステージ';

    const bossBtn = document.createElement('button');
    bossBtn.type = 'button';
    bossBtn.id = 'testStageTabBoss';
    bossBtn.className = 'test-stage-tab';
    bossBtn.textContent = 'ボス直行';

    tabBar.appendChild(stageBtn);
    tabBar.appendChild(bossBtn);

    if (list.parentNode) {
      list.parentNode.insertBefore(tabBar, list);
    }

    stageBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      currentTab = 'stage';
      renderCurrentTab();
    }, { passive:false });

    bossBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      currentTab = 'boss';
      renderCurrentTab();
    }, { passive:false });
  }

  function syncTabs(){
    const stageBtn = $('testStageTabStage');
    const bossBtn = $('testStageTabBoss');

    if (stageBtn) stageBtn.classList.toggle('active', currentTab === 'stage');
    if (bossBtn) bossBtn.classList.toggle('active', currentTab === 'boss');
  }

  function renderCurrentTab(){
    syncTabs();

    if (currentTab === 'boss') {
      renderBossList();
      return;
    }

    renderStageList();
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

  function renderBossList(){
    const list = $('testStageList');
    if (!list) return;

    list.innerHTML = '';

    let lastGroup = '';

    TEST_BOSS_LIST.forEach((boss, index) => {
      if (boss.group !== lastGroup) {
        lastGroup = boss.group;

        const title = document.createElement('div');
        title.className = 'test-stage-group';
        title.textContent = boss.group;
        list.appendChild(title);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'test-stage-btn test-boss-btn';

      btn.innerHTML = `
        <span class="test-stage-id">${index + 1}</span>
        <span class="test-stage-name">${boss.name}</span>
        <span class="test-stage-boss">${boss.area}</span>
      `;

      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        startTestBoss(index);
      }, { passive:false });

      list.appendChild(btn);
    });
  }

  function activateGameScreen(){
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const game =
      $('gameScreen') ||
      $('gameView');

    if (game) {
      game.classList.add('active');
    }
  }

  function launchGame(){
    testLaunchLock = true;

    const sortie = $('sortieBtn') || $('btnSortie');

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

  function startTestStage(index){
    const S = storage();

    if (!S || !S.setTestStageByIndex) {
      alert('テスト出撃の準備ができていません。');
      return;
    }

    clearTestBoss();
    S.setTestStageByIndex(index);
    closeModal();
    launchGame();
  }

  function startTestBoss(index){
    const boss = TEST_BOSS_LIST[index];

    if (!boss) {
      alert('ボスデータが見つかりません。');
      return;
    }

    clearTestStage();

    saveTestBoss({
      mode: 'boss',
      name: boss.name,
      image: boss.image,
      area: boss.area,
      group: boss.group,
      strong: !!boss.strong,
      isStrongBoss: !!boss.strong,
      isTestBoss: true,
      startedAt: Date.now()
    });

    closeModal();
    launchGame();
  }

  function clearTestOnNormalSortie(){
    if (testLaunchLock) return;

    clearTestBoss();
    clearTestStage();
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

    const sortie =
      $('sortieBtn') ||
      $('btnSortie');

    if (sortie && !sortie.__mobNormalSortieClearTestBound) {
      sortie.__mobNormalSortieClearTestBound = true;

      sortie.addEventListener('click', clearTestOnNormalSortie, true);
      sortie.addEventListener('pointerup', clearTestOnNormalSortie, true);
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
    render: renderCurrentTab,
    renderStage: renderStageList,
    renderBoss: renderBossList,
    start: startTestStage,
    startBoss: startTestBoss,
    getBoss: getTestBoss,
    clearBoss: clearTestBoss,
    clearAll: function(){
      clearTestBoss();
      clearTestStage();
    },
    bossList: TEST_BOSS_LIST.slice()
  };
})();
