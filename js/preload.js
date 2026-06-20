'use strict';

(function(){
  const CRITICAL_ASSETS = [
    'mt/mainback.png',
    'mt/menutitle.png',
    'mt/menusta.png',
    'mt/menuevent.png',
    'mt/menushop.png',
    'mt/menusoubi.png',
    'mt/menupet.png',
    'mt/menugacha.png',
    'mt/menumission.png',
    'mt/menucolle.png',
    'play/playpink2.png',
    'play/playpink.png',
    'mt/stagestage.png',
    'mt/stagescore.png',
    'mt/stagecoin.png',
    'mt/stagelife.png',
    'mt/atk.png',
    'atk/hinotama.png'
  ];

  const BACKGROUND_ASSETS = [
    'sta/backsougen.png',
    'sta/backsabaku.png',
    'sta/backumi.png',
    'sta/backneon.png',
    'sta/backmagma.png',
    'sta/backmao.png',
    'sta/stkan.png',
    'sta/stmatrix.png',
    'sta/umisenro.png',
    'sta/neonlord.png',
    'sta/makai.png',
    'sta/makailast.png'
  ];

  const EXTRA_ASSETS = [
    'gimi/takagin.png',
    'gimi/takagol.png',
    'gimi/gimihako.png',
    'gimi/gimikan.png',
    'gimi/gimiiwa.png',
    'gimi/gimitaru.png',
    'gimi/gimisabakiwa.png',
    'gimi/gimidou.png',
    'gimi/gimichari.png',
    'gimi/gimitaiya.png',
    'gimi/gimihan.png',
    'gimi/gimineonspi.png',
    'gimi/gimineonreco.png',
    'gimi/neonhunsui.png',
    'gimi/gimimag.png',
    'gimi/gimimaghasi.png',
    'gimi/gimimagspi.png',
    'gimi/gimiseki.png',
    'gimi/gimimaotama.png',
    'gimi/gimimao.png',

    'en/sra.png',
    'en/eniwa.png',
    'en/entozok.png',
    'en/endowa.png',
    'en/enwasi.png',
    'en/iwakofal.png',
    'en/ennarga.png',
    'en/enguri.png',
    'en/enmagtokage.png',
    'en/enmagpte.png',
    'en/enmaogob.png',
    'en/enasa.png',

    'en/enpte.png',
    'en/sabadual.png',
    'en/enmobpi.png',
    'en/neongidra.png',
    'en/enmaggolem.png',
    'en/mobgra.png',

    'boss/hawks.png',
    'boss/hawks2.png',
    'boss/miraboss.png',
    'boss/bossmira2.png',
    'boss/bossban.png',
    'boss/bossban2.png',
    'boss/bossneon.png',
    'boss/bossneon2.png',
    'boss/bossdragoon.png',
    'boss/bossdragoon2.png',
    'boss/bossriris.png',
    'boss/bossmaoh.png'
  ];

  const imageCache = new Map();

  function $(id){
    return document.getElementById(id);
  }

  function unique(list){
    return Array.from(new Set((list || []).filter(Boolean)));
  }

  function setProgress(done, total){
    const percent = total <= 0 ? 100 : Math.floor((done / total) * 100);
    const text = $('loadingPercent');
    const bar = $('loadingBarFill');

    if (text) text.textContent = String(percent);
    if (bar) bar.style.width = percent + '%';
  }

  function preloadImage(src){
    return new Promise(resolve => {
      if (!src) {
        resolve(false);
        return;
      }

      if (imageCache.has(src)) {
        resolve(true);
        return;
      }

      const image = new Image();

      image.onload = function(){
        imageCache.set(src, image);
        resolve(true);
      };

      image.onerror = function(){
        resolve(false);
      };

      image.src = src;
    });
  }

  async function preloadBatch(list, onProgress){
    const assets = unique(list);
    let done = 0;

    await Promise.all(
      assets.map(src =>
        preloadImage(src).then(function(){
          done++;
          if (typeof onProgress === 'function') onProgress(done, assets.length);
        })
      )
    );
  }

  function preloadInBackground(list){
    const assets = unique(list);
    let index = 0;

    function step(){
      const chunk = assets.slice(index, index + 4);
      index += 4;

      if (!chunk.length) {
        window.dispatchEvent(new CustomEvent('mobshot:backgroundPreloadComplete'));
        return;
      }

      Promise.all(chunk.map(preloadImage)).finally(function(){
        setTimeout(step, 16);
      });
    }

    setTimeout(step, 80);
  }

  async function preloadForStage(assetList){
    await preloadBatch(assetList || []);
  }

  function hideLoading(){
    const loading = $('loadingScreen');
    if (loading) loading.classList.add('hidden');
    window.dispatchEvent(new CustomEvent('mobshot:preloadComplete'));
  }

  async function start(){
    const critical = unique(CRITICAL_ASSETS);

    setProgress(0, critical.length);

    await preloadBatch(critical, function(done, total){
      setProgress(done, total);
    });

    setProgress(critical.length, critical.length);

    setTimeout(function(){
      hideLoading();
      preloadInBackground(BACKGROUND_ASSETS.concat(EXTRA_ASSETS));
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.MobShotPreloader = {
    preloadImage,
    preloadBatch,
    preloadForStage,
    preloadInBackground,
    imageCache
  };
})();
