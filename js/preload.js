'use strict';

(function(){
  const PRELOAD_ASSETS = [
    // main
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

    // player default
    'play/playpink2.png',
    'play/playpink.png',

    // hud
    'mt/stagestage.png',
    'mt/stagescore.png',
    'mt/stagecoin.png',
    'mt/stagelife.png',

    // stage backgrounds
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
    'sta/makailast.png',

    // bullets
    'mt/atk.png',
    'atk/hinotama.png',

    // chests
    'gimi/takagin.png',
    'gimi/takagol.png',

    // gimmicks
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

    // enemies
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

    // mid bosses
    'en/enpte.png',
    'en/sabadual.png',
    'en/enmobpi.png',
    'en/neongidra.png',
    'en/enmaggolem.png',
    'en/mobgra.png',

    // bosses
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

  function $(id){
    return document.getElementById(id);
  }

  function unique(list){
    return Array.from(new Set(list.filter(Boolean)));
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
      const image = new Image();

      image.onload = function(){ resolve(true); };
      image.onerror = function(){ resolve(false); };

      image.src = src;
    });
  }

  async function start(){
    const loading = $('loadingScreen');
    const assets = unique(PRELOAD_ASSETS);
    let done = 0;

    setProgress(0, assets.length);

    for (const src of assets) {
      await preloadImage(src);
      done++;
      setProgress(done, assets.length);
    }

    setProgress(assets.length, assets.length);

    setTimeout(function(){
      if (loading) loading.classList.add('hidden');
      window.dispatchEvent(new CustomEvent('mobshot:preloadComplete'));
    }, 350);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
