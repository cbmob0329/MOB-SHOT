'use strict';

(function(){
  const ASSETS = [
    'mt/mainback.png',
    'mt/menutitle.png',
    'play/playpink2.png',
    'play/playpink.png',

    'mt/menusta.png',
    'mt/menuevent.png',
    'mt/menushop.png',
    'mt/menusoubi.png',
    'mt/menupet.png',
    'mt/menugacha.png',
    'mt/menumission.png',
    'mt/menucolle.png',

    'sta/backsougen.png',
    'sta/backsabaku.png',
    'sta/backumi.png',
    'sta/backneon.png',
    'sta/backmagma.png',
    'sta/backmao.png',

    'gimi/takagin.png',
    'gimi/takagol.png',
    'gimi/gimihako.png',
    'gimi/gimiiwa.png',
    'atk/hinotama.png',
    'mt/atk.png'
  ];

  function $(id){
    return document.getElementById(id);
  }

  function unique(list){
    return Array.from(new Set(list.filter(Boolean)));
  }

  function setProgress(done,total){
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
    const assets = unique(ASSETS);
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
