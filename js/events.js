'use strict';

(function(){
  const EVENT_SAVE_KEY = 'mobshot_event_mode_v1';

  const EVENTS = [
    {
      key: 'gold',
      name: 'GOLD STAGE',
      image: 'mt/event_gold.png',
      desc: '120秒間、宝箱とボスを倒してコインを稼ぐイベントステージ。'
    },
    {
      key: 'scoreAttack',
      name: 'スコアアタック',
      image: 'mt/event_score.png',
      desc: 'COMING SOON'
    },
    {
      key: 'doubleBoss',
      name: 'ダブルボス',
      image: 'mt/event_double.png',
      desc: 'COMING SOON'
    },
    {
      key: 'secretBoss',
      name: 'シークレットボス',
      image: 'mt/event_secret.png',
      desc: 'COMING SOON'
    }
  ];

  function qs(id){
    return document.getElementById(id);
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    try {
      return JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};
    } catch(e) {
      return {};
    }
  }

  function getRank(){
    const save = getSave();
    return Number(save.rank || 1);
  }

  function isUnlocked(){
    return getRank() >= 10;
  }

  function openModal(){
    const modal = qs('eventModal');
    if (!modal) return;

    render();
    modal.classList.remove('hidden');
  }

  function closeModal(){
    const modal = qs('eventModal');
    if (!modal) return;

    modal.classList.add('hidden');
  }

  function render(){
    const list = qs('eventList');
    const lock = qs('eventLockText');

    if (!list) return;

    const unlocked = isUnlocked();

    if (lock) {
      lock.classList.toggle('hidden', unlocked);
      lock.textContent = `ランク10で解放されます。現在ランク: ${getRank()}`;
    }

    list.innerHTML = '';

    EVENTS.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'event-card';

      const icon = document.createElement('img');
      icon.className = 'event-icon';
      icon.src = ev.image;
      icon.alt = ev.name;

      const info = document.createElement('div');
      info.className = 'event-info';

      const title = document.createElement('h3');
      title.textContent = ev.name;

      const desc = document.createElement('p');
      desc.textContent = ev.desc;

      const btn = document.createElement('button');
      btn.className = 'event-play-btn';
      btn.type = 'button';

      const comingSoon = ev.key !== 'gold';

      if (!unlocked) {
        btn.textContent = 'LOCK';
        btn.disabled = true;
      } else if (comingSoon) {
        btn.textContent = 'COMING SOON';
        btn.disabled = true;
      } else {
        btn.textContent = '挑戦する';
        btn.disabled = false;
      }

      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();

        if (!unlocked || comingSoon) return;

        startEvent(ev.key);
      });

      info.appendChild(title);
      info.appendChild(desc);
      info.appendChild(btn);

      card.appendChild(icon);
      card.appendChild(info);

      list.appendChild(card);
    });
  }

  function startEvent(key){
    const eventData = {
      key,
      startedAt: Date.now()
    };

    try {
      localStorage.setItem(EVENT_SAVE_KEY, JSON.stringify(eventData));
    } catch(e) {}

    closeModal();

    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const game = qs('gameScreen');

    if (game) {
      game.classList.add('active');
    }

    if (window.MobShotGame && window.MobShotGame.start) {
      window.MobShotGame.start();
    }
  }

  function getCurrentEvent(){
    try {
      const raw = localStorage.getItem(EVENT_SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  function isGoldStage(){
    const ev = getCurrentEvent();
    return !!(ev && ev.key === 'gold');
  }

  function clearCurrentEvent(){
    try {
      localStorage.removeItem(EVENT_SAVE_KEY);
    } catch(e) {}
  }

  function bind(){
    const openBtn = qs('openEventBtn');
    const closeBtn = qs('eventCloseBtn');
    const modal = qs('eventModal');

    if (openBtn && !openBtn.__mobEventBound) {
      openBtn.__mobEventBound = true;

      openBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });

      openBtn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }, { passive:false });
    }

    if (closeBtn && !closeBtn.__mobEventBound) {
      closeBtn.__mobEventBound = true;

      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    if (modal && !modal.__mobEventBgBound) {
      modal.__mobEventBgBound = true;

      modal.addEventListener('click', function(e){
        if (e.target === modal) {
          closeModal();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', bind);
  bind();

  window.MobShotEvents = {
    EVENTS,
    EVENT_SAVE_KEY,
    openModal,
    closeModal,
    render,
    startEvent,
    getCurrentEvent,
    clearCurrentEvent,
    isGoldStage,
    isUnlocked
  };
})();
