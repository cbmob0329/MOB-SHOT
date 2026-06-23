'use strict';

(function(){
  const EVENT_SAVE_KEY = 'mobshot_event_mode_v1';
  const GOLD_CLEAR_KEY = 'mobshot_gold_stage_clear_v1';
  const DOUBLE_CLEAR_KEY = 'mobshot_double_boss_clear_v1';
  const EVENT_ITEM_KEY = 'mobshot_event_items_v1';
  const EVENT_STATS_KEY = 'mobshot_event_stats_v1';

  const TEST_GOLD_TICKET_START = 0;

  const GOLD_DIFFICULTIES = [
    { key:'easy', name:'イージー', icon:'mt/game1.png', color:'#9dff73', firstCoin:3000, firstDiamond:5, clearCoin:300, chestMul:0.8, bossHpMul:1.0, bossCoinMul:1.0, bossCount:2, bosses:['ホークモブ','ミラモブ'], midBossCount:0, enemySpawn:true, showMidBoss:false, label:'ホークモブ + ミラモブ' },
    { key:'hard', name:'ハード', icon:'mt/game2.png', color:'#6be6ff', firstCoin:8000, firstDiamond:8, clearCoin:800, chestMul:1.4, bossHpMul:1.35, bossCoinMul:1.8, bossCount:2, bosses:['ミラモブⅡ','ネオンモブ'], midBossCount:0, enemySpawn:true, showMidBoss:false, label:'ミラモブⅡ + ネオンモブ' },
    { key:'veryHard', name:'ベリーハード', icon:'mt/game3.png', color:'#ffcf5b', firstCoin:15000, firstDiamond:10, clearCoin:1500, chestMul:2.2, bossHpMul:1.8, bossCoinMul:3.2, bossCount:2, bosses:['ドラゴンモブ','ドラゴンモブⅡ'], midBossCount:0, enemySpawn:true, showMidBoss:false, label:'ドラゴンモブ + ドラゴンモブⅡ' },
    { key:'inferno', name:'インフェルノ', icon:'mt/game4.png', color:'#ff5b5b', firstCoin:30000, firstDiamond:20, clearCoin:3000, chestMul:3.5, bossHpMul:2.35, bossCoinMul:6.0, bossCount:2, bosses:['モブリリス','ドラゴンモブⅡ'], midBossCount:0, enemySpawn:true, showMidBoss:false, label:'モブリリス + ドラゴンモブⅡ' },
    { key:'legend', name:'レジェンド', icon:'mt/game5.png', color:'#d86bff', firstCoin:80000, firstDiamond:50, clearCoin:7000, chestMul:5.5, bossHpMul:3.2, bossCoinMul:10.0, bossCount:2, bosses:['モブリリス','モブ魔王'], midBossCount:0, enemySpawn:true, showMidBoss:false, label:'モブリリス + モブ魔王' }
  ];

  const DOUBLE_DIFFICULTIES = [
    { key:'veryHard', name:'ベリーハード', icon:'mt/game3.png', color:'#ffcf5b', firstCoin:5000, firstDiamond:5, hpMul:1.35, scoreMul:1.25, bossMinHp:2200 },
    { key:'inferno', name:'インフェルノ', icon:'mt/game4.png', color:'#ff5b5b', firstCoin:10000, firstDiamond:10, hpMul:1.95, scoreMul:1.55, bossMinHp:4300 },
    { key:'legend', name:'レジェンド', icon:'mt/game5.png', color:'#d86bff', firstCoin:30000, firstDiamond:50, hpMul:2.75, scoreMul:2.1, bossMinHp:7800 }
  ];

  const DOUBLE_STAGES = [
    { id:1, areaKey:'grass', areaName:'草原', title:'草原', background:'sta/backsougen.png', bossA:'ホークモブ', bossB:'ミラモブ', allowed:['veryHard','inferno','legend'], final:false },
    { id:2, areaKey:'desert', areaName:'砂漠', title:'砂漠', background:'sta/backsabaku.png', bossA:'モブガーディアン', bossB:'ネオンモブ', allowed:['veryHard','inferno','legend'], final:false },
    { id:3, areaKey:'neon', areaName:'ネオン街', title:'ネオン街', background:'sta/backneon.png', bossA:'ドラゴンモブ', bossB:'ドラゴンモブⅡ', allowed:['veryHard','inferno','legend'], final:false },
    { id:4, areaKey:'castle', areaName:'魔王城', title:'魔王城', background:'sta/backmao.png', bossA:'モブリリス', bossB:'モブ魔王', allowed:['veryHard','inferno','legend'], final:false },
    { id:5, areaKey:'prison', areaName:'監獄', title:'監獄', background:'sta/stkan.png', bossA:'モブメイル', bossB:'モブスミス', allowed:['veryHard','inferno','legend'], final:false },
    { id:6, areaKey:'seaRail', areaName:'海の線路', title:'海の線路', background:'sta/umisenro.png', bossA:'モブネプ', bossB:'ホークモブⅡ', allowed:['veryHard','inferno','legend'], final:false },
    { id:7, areaKey:'last', areaName:'魔王の間', title:'魔王の間', background:'sta/makailast.png', bossA:'閻魔モブ', bossB:'ウルモブリリス', allowed:['legend'], final:true, firstCoin:50000, firstDiamond:100 }
  ];

  const QUEST_DIFFICULTIES = [
    { key:'easy', name:'イージー', icon:'mt/game1.png', color:'#9dff73', cost:5000, hpMul:0.85, scoreMul:1.0, coinMul:0.8, enemyHpMul:0.8, label:'低難度 / 初回確認向け' },
    { key:'veryHard', name:'ベリーハード', icon:'mt/game3.png', color:'#ffcf5b', cost:30000, hpMul:1.6, scoreMul:1.6, coinMul:1.2, enemyHpMul:1.35, label:'高難度 / 中盤以降向け' },
    { key:'legend', name:'レジェンド', icon:'mt/game5.png', color:'#d86bff', cost:100000, hpMul:2.8, scoreMul:2.5, coinMul:1.8, enemyHpMul:2.2, label:'超高難度 / 終盤向け' }
  ];

  const QUEST_STAGES = [
    { id:1, key:'pterarush', title:'プテラッシュ', areaKey:'grass', areaName:'草原', background:null, desc:'中ボスのプテラが2体 → 3体 → 5体で出現。全て倒すとクリア。', label:'プテラ 2→3→5', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:2, key:'guardian_test', title:'番人試験', areaKey:'town', areaName:'田舎町', background:null, desc:'番人が2体同時に出現。両方倒すとクリア。', label:'番人 2体同時', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:3, key:'grass_traveler', title:'草原の旅人', areaKey:'grass', areaName:'草原', background:null, desc:'グラディモブ2体とモブニコ2体が同時出現。全て倒すとクリア。', label:'グラディ2 + ニコ2', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:4, key:'thieves', title:'盗賊団', areaKey:'desert', areaName:'砂漠', background:null, desc:'ミラモブ1体と砂漠の雑魚敵を倒すとクリア。雑魚湧きは少なめ。', label:'ミラモブ + 雑魚少なめ', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:5, key:'desert_ruler', title:'砂漠を統べる者', areaKey:'desert', areaName:'砂漠', background:null, desc:'ミラモブⅡが2体同時出現。全て倒すとクリア。', label:'ミラモブⅡ 2体', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:6, key:'desert_sharks', title:'砂漠に潜む鮫', areaKey:'desert', areaName:'砂漠', background:null, desc:'モブサメが4体同時出現。全て倒すとクリア。', label:'モブサメ 4体', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:7, key:'hot_magma', title:'アチアチマグマ', areaKey:'magma', areaName:'マグマ', background:null, desc:'開始直後からドラゴンと中ボス2体が同時出現。全て倒すとクリア。', label:'ドラゴン + 中ボス2体', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:8, key:'magma_guardian', title:'マグマに潜むガーディアン', areaKey:'magma', areaName:'マグマ', background:null, desc:'マグモブレム3体とモブガーディアンⅡが同時出現。全て倒すとクリア。', label:'マグレム3 + 番人Ⅱ', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:9, key:'sky_rulers', title:'空の支配者', areaKey:'town', areaName:'田舎町', background:null, desc:'モブバード、モブファル、モブマグプテラが少し出現。ホークモブⅡとドラゴンモブⅡを両方倒すとクリア。', label:'ホークⅡ + ドラゴンⅡ', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:10, key:'neon_nightmare', title:'ネオン街の悪夢', areaKey:'neon', areaName:'ネオン街', background:null, desc:'モブコード、モブケーブル、ネオンモブが同時出現。全て倒すとクリア。', label:'コード + ケーブル + ネオン', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:11, key:'nine_heads', title:'9つの首', areaKey:'neon', areaName:'ネオン街', background:null, desc:'ネオンギドラ3体同時 → ネオンギドラ1体。倒すとクリア。', label:'ギドラ3体 + ギドラ1体', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:12, key:'town_dragon', title:'街を襲うドラゴン', areaKey:'town', areaName:'田舎町', background:null, desc:'ドラゴンモブⅡとモブギドラ2体が同時出現。全て倒すとクリア。', label:'ドラゴンⅡ + ギドラ2', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:13, key:'three_birds', title:'三鳥見参', areaKey:'grass', areaName:'草原', background:null, desc:'ホークモブ2体とホークモブⅡが同時出現。全て倒すとクリア。', label:'ホーク2 + ホークⅡ', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:14, key:'neon_maoh', title:'ネオン街の魔王', areaKey:'neon', areaName:'ネオン街', background:null, desc:'モブ魔王、モブケーブル、モブコードが同時出現。全て倒すとクリア。', label:'魔王 + ケーブル + コード', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:15, key:'magma_beauty', title:'マグマを好む美女', areaKey:'magma', areaName:'マグマ', background:null, desc:'モブリリスとモブメルト3体が同時出現。全て倒すとクリア。', label:'リリス + メルト3', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:16, key:'maoh_duel', title:'対峙する魔王', areaKey:'castle', areaName:'魔王城', background:null, desc:'モブ魔王を倒すと、次のモブ魔王と2体のミラモブが出現。全て倒すとクリア。', label:'魔王 → 魔王 + ミラ2体', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:17, key:'lilith_sisters', title:'リリス四姉妹', areaKey:'castle', areaName:'魔王城', background:null, desc:'モブリリスが4体同時に出現。全て倒すとクリア。', label:'モブリリス 4体同時', rank:10, questEnemyMode:'low', gimmickSpawn:false },
    { id:18, key:'castle_machine', title:'魔王城の精密機械', areaKey:'castle', areaName:'魔王城', background:null, desc:'ネオンモブ3体とホークモブが同時出現。全て倒すとクリア。', label:'ネオン3 + ホーク', rank:10, questEnemyMode:'low', gimmickSpawn:false }
  ];

  const EVENTS = [
    { key:'gold', name:'GOLD STAGE', image:'mt/event_gold.png', desc:'自由に挑戦できるコイン稼ぎイベント。' },
    { key:'scoreAttack', name:'スコアアタック', image:'mt/event_score.png', desc:'歴代ボスを順番に倒してハイスコアを目指すイベント。' },
    { key:'eventQuest', name:'イベントクエスト', image:'mt/ieve.png', desc:'難易度別に特別な石板がドロップ！' },
    { key:'secretBoss', name:'シークレットボス', image:'mt/event_secret.png', desc:'COMING SOON' }
  ];

  function qs(id){
    return document.getElementById(id);
  }

  function clone(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeDifficultyKey(key){
    const raw = String(key || '').trim();

    if (raw === 'イージー') return 'easy';
    if (raw === 'ハード') return 'hard';
    if (raw === 'ベリーハード') return 'veryHard';
    if (raw === 'インフェルノ') return 'inferno';
    if (raw === 'レジェンド') return 'legend';

    if (raw === 'easy') return 'easy';
    if (raw === 'hard') return 'hard';
    if (raw === 'veryHard') return 'veryHard';
    if (raw === 'veryhard') return 'veryHard';
    if (raw === 'inferno') return 'inferno';
    if (raw === 'legend') return 'legend';

    return raw || 'easy';
  }

  function injectEventStyle(){
    if (document.getElementById('mobEventUiStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobEventUiStyle';
    style.textContent = `
      .event-card{
        grid-template-columns:72px 1fr !important;
        align-items:start !important;
        gap:10px !important;
        padding:10px !important;
      }

      .event-icon{
        width:64px !important;
        height:64px !important;
        object-fit:contain !important;
      }

      .event-info h3{
        font-size:19px !important;
        margin-bottom:3px !important;
      }

      .event-info p{
        font-size:11px !important;
        margin-bottom:6px !important;
      }

      .event-info p:empty{
        display:none !important;
      }

      .event-difficulty-grid{
        display:grid;
        grid-template-columns:1fr;
        gap:7px;
        margin-top:8px;
      }

      .event-difficulty-card{
        position:relative;
        width:100%;
        min-height:56px;
        overflow:hidden;
        border:0;
        border-radius:15px;
        padding:0;
        background:rgba(255,255,255,.08);
        box-shadow:0 4px 0 rgba(0,0,0,.34);
      }

      .event-difficulty-card:disabled{
        opacity:.45;
        filter:grayscale(1);
      }

      .event-difficulty-card img{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:cover;
      }

      .event-difficulty-card::after{
        content:"";
        position:absolute;
        inset:0;
        background:linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.14),rgba(0,0,0,.44));
        pointer-events:none;
      }

      .event-difficulty-name{
        position:absolute;
        left:12px;
        top:7px;
        z-index:2;
        font-size:15px;
        font-weight:1000;
        color:#fff;
        text-shadow:0 3px 0 #000;
        letter-spacing:.04em;
      }

      .event-difficulty-small{
        position:absolute;
        left:12px;
        bottom:7px;
        z-index:2;
        font-size:10px;
        line-height:1.2;
        font-weight:1000;
        color:#dfe8ff;
        text-shadow:0 2px 0 #000;
        text-align:left;
        max-width:76%;
      }

      .event-difficulty-badge{
        position:absolute;
        right:8px;
        top:7px;
        z-index:2;
        padding:4px 7px;
        border-radius:999px;
        font-size:10px;
        font-weight:1000;
        color:#151000;
        background:linear-gradient(#ffe66b,#ffb423);
        box-shadow:0 3px 0 rgba(0,0,0,.35);
      }

      .event-quest-wrap{
        display:grid;
        grid-template-columns:1fr;
        gap:9px;
        margin-top:8px;
        max-height:60vh;
        overflow:auto;
        padding-right:2px;
      }

      .event-quest-box{
        padding:8px;
        border-radius:16px;
        background:rgba(255,255,255,.07);
        border:2px solid rgba(255,255,255,.15);
      }

      .event-quest-title{
        font-size:16px;
        font-weight:1000;
        color:#fff;
        text-shadow:0 2px 0 #000;
        margin-bottom:7px;
      }

      .event-quest-label{
        font-size:10px;
        font-weight:900;
        color:#dfe8ff;
        text-shadow:0 2px 0 #000;
        margin:-3px 0 7px;
        line-height:1.35;
      }

      .event-quest-diff-row{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:6px;
      }

      .event-quest-diff-btn{
        position:relative;
        width:100%;
        height:48px;
        overflow:hidden;
        border:0;
        border-radius:13px;
        padding:0;
        background:rgba(255,255,255,.08);
        box-shadow:0 3px 0 rgba(0,0,0,.34);
      }

      .event-quest-diff-btn:disabled{
        opacity:.45;
        filter:grayscale(1);
      }

      .event-quest-diff-btn img{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:cover;
      }

      .event-quest-diff-btn::after{
        content:"";
        position:absolute;
        inset:0;
        background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.58));
        pointer-events:none;
      }

      .event-quest-diff-name{
        position:absolute;
        left:4px;
        right:4px;
        bottom:5px;
        z-index:2;
        color:#fff;
        font-size:10px;
        font-weight:1000;
        text-align:center;
        text-shadow:0 2px 0 #000;
        white-space:nowrap;
      }

      .event-quest-diff-lock{
        position:absolute;
        top:4px;
        right:4px;
        z-index:3;
        padding:2px 5px;
        border-radius:999px;
        background:rgba(0,0,0,.68);
        color:#ffe66b;
        font-size:8px;
        font-weight:1000;
      }
    `;
    document.head.appendChild(style);
  }

  function injectConfirmStyle(){
    if (document.getElementById('mobEventConfirmStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobEventConfirmStyle';
    style.textContent = `
      .mob-event-confirm{
        position:absolute;
        inset:0;
        z-index:120;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
        background:rgba(0,0,0,.72);
      }
      .mob-event-confirm.hidden{display:none}
      .mob-event-confirm-card{
        width:min(90vw,440px);
        border-radius:28px;
        padding:18px;
        background:linear-gradient(180deg,rgba(34,26,70,.98),rgba(6,8,24,.98));
        border:4px solid rgba(255,255,255,.35);
        box-shadow:0 18px 48px rgba(0,0,0,.65), inset 0 0 0 2px rgba(255,255,255,.08);
        text-align:center;
      }
      .mob-event-confirm-title{
        margin:0 0 10px;
        font-size:26px;
        font-weight:1000;
        color:#fff;
        text-shadow:0 4px 0 #000;
      }
      .mob-event-confirm-sub{
        margin:0 0 14px;
        font-size:17px;
        font-weight:1000;
        color:#ffe66b;
        line-height:1.45;
      }
      .mob-event-confirm-reward{
        margin:10px 0;
        padding:12px;
        border-radius:18px;
        background:rgba(255,255,255,.10);
        border:2px solid rgba(255,255,255,.22);
        color:#fff;
        font-size:15px;
        font-weight:900;
        line-height:1.55;
      }
      .mob-event-confirm-extra{
        margin:8px 0 14px;
        color:#dfe8ff;
        font-size:13px;
        font-weight:800;
        line-height:1.45;
      }
      .mob-event-confirm-actions{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
      }
      .mob-event-confirm-yes,
      .mob-event-confirm-no{
        border:0;
        border-radius:999px;
        padding:14px 18px;
        font-size:18px;
        font-weight:1000;
        box-shadow:0 5px 0 rgba(0,0,0,.38);
      }
      .mob-event-confirm-yes{
        background:linear-gradient(#9dff73,#26b63e);
        color:#07370f;
      }
      .mob-event-confirm-no{
        background:linear-gradient(#ffffff,#aeb7c8);
        color:#182033;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureConfirmModal(){
    injectConfirmStyle();

    let modal = qs('mobEventConfirm');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'mobEventConfirm';
    modal.className = 'mob-event-confirm hidden';
    modal.innerHTML = `
      <div class="mob-event-confirm-card">
        <h2 id="mobEventConfirmTitle" class="mob-event-confirm-title">EVENT</h2>
        <p id="mobEventConfirmSub" class="mob-event-confirm-sub"></p>
        <div id="mobEventConfirmReward" class="mob-event-confirm-reward"></div>
        <div id="mobEventConfirmExtra" class="mob-event-confirm-extra"></div>
        <div class="mob-event-confirm-actions">
          <button id="mobEventConfirmYes" class="mob-event-confirm-yes" type="button">はい</button>
          <button id="mobEventConfirmNo" class="mob-event-confirm-no" type="button">いいえ</button>
        </div>
      </div>
    `;

    const app = qs('app') || document.body;
    app.appendChild(modal);

    return modal;
  }

  function openConfirm(opt){
    const modal = ensureConfirmModal();
    const title = qs('mobEventConfirmTitle');
    const sub = qs('mobEventConfirmSub');
    const reward = qs('mobEventConfirmReward');
    const extra = qs('mobEventConfirmExtra');
    const yes = qs('mobEventConfirmYes');
    const no = qs('mobEventConfirmNo');

    if (title) title.textContent = opt.title || 'EVENT';
    if (sub) sub.textContent = opt.sub || '';
    if (reward) reward.innerHTML = String(opt.reward || '').replace(/\n/g, '<br>');
    if (extra) extra.innerHTML = String(opt.extra || '').replace(/\n/g, '<br>');

    if (yes) {
      yes.textContent = opt.yesText || 'はい';
      yes.style.display = '';
    }

    if (no) {
      no.textContent = opt.noText || 'いいえ';
      no.style.display = opt.hideNo ? 'none' : '';
    }

    modal.classList.remove('hidden');

    yes.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      modal.classList.add('hidden');
      if (typeof opt.onYes === 'function') opt.onYes();
    };

    no.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      modal.classList.add('hidden');
      if (typeof opt.onNo === 'function') opt.onNo();
    };
  }

  function showMessage(title, message){
    openConfirm({
      title,
      sub: message,
      reward: '',
      extra: '',
      yesText:'OK',
      hideNo:true
    });
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) return window.MobShotStorage.load();

    try {
      return JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};
    } catch(e) {
      return {};
    }
  }

  function saveMainData(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return true;
    }

    try {
      localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
      return true;
    } catch(e) {
      return false;
    }
  }

  function getRank(){
    return Number(getSave().rank || 1);
  }

  function isUnlocked(){
    return getRank() >= 10;
  }

  function isDifficultyAllCleared(difficultyName){
    if (!window.MobShotStorage || !window.MobShotStorage.STAGE_LIST || !window.MobShotStorage.load) {
      return false;
    }

    const save = window.MobShotStorage.load();
    const cleared = save.stageProgress && save.stageProgress.clearedStageIds
      ? save.stageProgress.clearedStageIds
      : {};

    const targets = window.MobShotStorage.STAGE_LIST.filter(stage => stage.difficulty === difficultyName);

    if (!targets.length) return false;

    return targets.every(stage => !!cleared[stage.id]);
  }

  function isEventQuestUnlocked(){
    return isUnlocked() && isDifficultyAllCleared('イージー');
  }

  function isDoubleBossUnlocked(){
    return isUnlocked() && isDifficultyAllCleared('ハード');
  }

  function defaultItems(){
    return { goldTicket:0, __testInitialized:true };
  }

  function loadItems(){
    let items = null;

    try {
      items = JSON.parse(localStorage.getItem(EVENT_ITEM_KEY)) || null;
    } catch(e) {
      items = null;
    }

    if (!items || !items.__testInitialized) {
      items = defaultItems();
      saveItems(items);
    }

    items.goldTicket = Math.max(0, Number(items.goldTicket || 0));
    return items;
  }

  function saveItems(items){
    try {
      localStorage.setItem(EVENT_ITEM_KEY, JSON.stringify(items || defaultItems()));
    } catch(e) {}
  }

  function defaultStats(){
    return {
      goldClear:0,
      scoreAttackClear:0,
      doubleBossClear:0,
      eventQuestClear:0,
      eventCoinTotal:0,
      eventBossKills:0,
      goldTicketTotal:0,
      goldTicketSpent:0,
      bossKills:{},
      doubleClearByDifficulty:{ veryHard:0, inferno:0, legend:0 },
      doubleStageClear:{},
      questClearByDifficulty:{ easy:0, veryHard:0, legend:0 },
      questStageClear:{}
    };
  }

  function loadStats(){
    let stats = null;

    try {
      stats = JSON.parse(localStorage.getItem(EVENT_STATS_KEY)) || null;
    } catch(e) {
      stats = null;
    }

    stats = Object.assign(defaultStats(), stats || {});
    stats.bossKills = stats.bossKills || {};
    stats.doubleClearByDifficulty = Object.assign({ veryHard:0, inferno:0, legend:0 }, stats.doubleClearByDifficulty || {});
    stats.doubleStageClear = stats.doubleStageClear || {};
    stats.questClearByDifficulty = Object.assign({ easy:0, veryHard:0, legend:0 }, stats.questClearByDifficulty || {});
    stats.questStageClear = stats.questStageClear || {};

    return stats;
  }

  function saveStats(stats){
    try {
      localStorage.setItem(EVENT_STATS_KEY, JSON.stringify(stats || defaultStats()));
    } catch(e) {}
  }

  function addStat(key, amount){
    const stats = loadStats();
    stats[key] = Number(stats[key] || 0) + Number(amount || 0);
    saveStats(stats);
    notifyMission();
    return stats[key];
  }

  function getGoldTicket(){
    return 0;
  }

  function addGoldTicket(amount){
    return 0;
  }

  function consumeGoldTicket(amount){
    return true;
  }

  function resetTestTickets(){
    render();
    window.dispatchEvent(new CustomEvent('mobshot:eventItemsUpdated'));
  }

  function getDifficulty(key){
    key = normalizeDifficultyKey(key);
    return GOLD_DIFFICULTIES.find(d => d.key === key) || GOLD_DIFFICULTIES[0];
  }

  function getDoubleDifficulty(key){
    key = normalizeDifficultyKey(key || 'veryHard');
    return DOUBLE_DIFFICULTIES.find(d => d.key === key) || DOUBLE_DIFFICULTIES[0];
  }

  function getDoubleStage(id){
    return DOUBLE_STAGES.find(s => Number(s.id) === Number(id)) || DOUBLE_STAGES[0];
  }

  function getQuestDifficulty(key){
    key = normalizeDifficultyKey(key);
    return QUEST_DIFFICULTIES.find(d => d.key === key) || QUEST_DIFFICULTIES[0];
  }

  function getQuestStage(id){
    return QUEST_STAGES.find(s => Number(s.id) === Number(id)) || QUEST_STAGES[0];
  }

  function loadGoldClear(){
    try {
      return JSON.parse(localStorage.getItem(GOLD_CLEAR_KEY)) || {};
    } catch(e) {
      return {};
    }
  }

  function saveGoldClear(data){
    try {
      localStorage.setItem(GOLD_CLEAR_KEY, JSON.stringify(data || {}));
    } catch(e) {}
  }

  function hasGoldCleared(difficultyKey){
    return !!loadGoldClear()[normalizeDifficultyKey(difficultyKey)];
  }

  function markGoldCleared(difficultyKey){
    const data = loadGoldClear();
    data[normalizeDifficultyKey(difficultyKey)] = true;
    saveGoldClear(data);
  }

  function loadDoubleClear(){
    try {
      return JSON.parse(localStorage.getItem(DOUBLE_CLEAR_KEY)) || {};
    } catch(e) {
      return {};
    }
  }

  function saveDoubleClear(data){
    try {
      localStorage.setItem(DOUBLE_CLEAR_KEY, JSON.stringify(data || {}));
    } catch(e) {}
  }

  function doubleClearKey(difficultyKey, stageId){
    return `${normalizeDifficultyKey(difficultyKey)}_${Number(stageId || 0)}`;
  }

  function hasDoubleCleared(difficultyKey, stageId){
    return !!loadDoubleClear()[doubleClearKey(difficultyKey, stageId)];
  }

  function markDoubleCleared(difficultyKey, stageId){
    const data = loadDoubleClear();
    data[doubleClearKey(difficultyKey, stageId)] = true;
    saveDoubleClear(data);
  }

  function isDoubleDifficultyUnlocked(difficultyKey){
    difficultyKey = normalizeDifficultyKey(difficultyKey);

    if (!isDoubleBossUnlocked()) return false;

    if (difficultyKey === 'veryHard') return true;

    if (difficultyKey === 'inferno') {
      return DOUBLE_STAGES.filter(s => !s.final).every(s => hasDoubleCleared('veryHard', s.id));
    }

    if (difficultyKey === 'legend') {
      return DOUBLE_STAGES.filter(s => !s.final).every(s => hasDoubleCleared('inferno', s.id));
    }

    return false;
  }

  function questClearKey(difficultyKey, questId){
    return `${normalizeDifficultyKey(difficultyKey)}_${Number(questId || 0)}`;
  }

  function hasQuestCleared(difficultyKey, questId){
    const stats = loadStats();
    return !!(stats.questStageClear && stats.questStageClear[questClearKey(difficultyKey, questId)]);
  }

  function canPlayQuest(stage, diff){
    if (!stage || !diff) return false;
    return isEventQuestUnlocked() && getRank() >= Number(stage.rank || 10);
  }

  function consumeCoin(amount){
    const need = Number(amount || 0);
    const save = getSave();
    const coin = Number(save.coin || 0);

    if (coin < need) return false;

    save.coin = coin - need;
    saveMainData(save);

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));

    return true;
  }

  function recordGoldClear(difficultyKey, coinAmount){
    const stats = loadStats();
    stats.goldClear = Number(stats.goldClear || 0) + 1;
    stats.eventCoinTotal = Number(stats.eventCoinTotal || 0) + Number(coinAmount || 0);
    saveStats(stats);
    notifyMission();
  }

  function recordScoreAttackClear(coinAmount){
    const stats = loadStats();
    stats.scoreAttackClear = Number(stats.scoreAttackClear || 0) + 1;
    stats.eventCoinTotal = Number(stats.eventCoinTotal || 0) + Number(coinAmount || 0);
    saveStats(stats);
    notifyMission();
  }

  function recordDoubleBossClear(difficultyKey, stageId, coinAmount){
    difficultyKey = normalizeDifficultyKey(difficultyKey);

    const stats = loadStats();
    const stageKey = doubleClearKey(difficultyKey, stageId);

    stats.doubleBossClear = Number(stats.doubleBossClear || 0) + 1;
    stats.eventCoinTotal = Number(stats.eventCoinTotal || 0) + Number(coinAmount || 0);
    stats.doubleClearByDifficulty[difficultyKey] = Number(stats.doubleClearByDifficulty[difficultyKey] || 0) + 1;
    stats.doubleStageClear[stageKey] = Number(stats.doubleStageClear[stageKey] || 0) + 1;

    saveStats(stats);
    notifyMission();
  }

  function recordEventQuestClear(difficultyKey, questId, coinAmount){
    difficultyKey = normalizeDifficultyKey(difficultyKey);

    const stats = loadStats();
    const stageKey = questClearKey(difficultyKey, questId);

    stats.eventQuestClear = Number(stats.eventQuestClear || 0) + 1;
    stats.eventCoinTotal = Number(stats.eventCoinTotal || 0) + Number(coinAmount || 0);
    stats.questClearByDifficulty[difficultyKey] = Number(stats.questClearByDifficulty[difficultyKey] || 0) + 1;
    stats.questStageClear[stageKey] = Number(stats.questStageClear[stageKey] || 0) + 1;

    saveStats(stats);
    notifyMission();
  }

  function recordEventBossKill(bossName){
    const stats = loadStats();
    const name = String(bossName || 'BOSS');

    stats.eventBossKills = Number(stats.eventBossKills || 0) + 1;
    stats.bossKills[name] = Number(stats.bossKills[name] || 0) + 1;

    saveStats(stats);
    notifyMission();
  }

  function notifyMission(){
    if (window.MobShotMission && window.MobShotMission.refresh) {
      window.MobShotMission.refresh();
    }

    window.dispatchEvent(new CustomEvent('mobshot:eventStatsUpdated'));
  }

  function openModal(){
    const modal = qs('eventModal');
    if (!modal) return;

    clearCurrentEvent();
    injectEventStyle();
    render();
    modal.classList.remove('hidden');
  }

  function closeModal(){
    const modal = qs('eventModal');
    if (!modal) return;
    modal.classList.add('hidden');
  }

  function rewardTextGold(diff){
    const cleared = hasGoldCleared(diff.key);

    if (cleared) {
      return `クリア報酬\n${diff.clearCoin.toLocaleString()} COIN`;
    }

    return `初回報酬\n${diff.firstCoin.toLocaleString()} COIN + ${diff.firstDiamond} DIAMOND`;
  }

  function rewardTextDouble(diff, stage){
    const cleared = hasDoubleCleared(diff.key, stage.id);

    if (cleared) return 'クリア済み\n初回報酬なし';

    const coin = stage.final ? stage.firstCoin : diff.firstCoin;
    const diamond = stage.final ? stage.firstDiamond : diff.firstDiamond;

    return `初回報酬\n${coin.toLocaleString()} COIN + ${diamond} DIAMOND`;
  }

  function rewardTextQuest(diff, stage){
    const cleared = hasQuestCleared(diff.key, stage.id);
    const rewardText = cleared ? 'クリア済み\n難易度別の特別な石板がドロップ！' : '初回クリア報酬\n難易度別の特別な石板がドロップ！';

    return `${rewardText}\n\n消費: ${Number(diff.cost || 0).toLocaleString()} COIN`;
  }

  function render(){
    injectEventStyle();

    const list = qs('eventList');
    const lock = qs('eventLockText');

    if (!list) return;

    const unlocked = isUnlocked();
    const eventQuestUnlocked = isEventQuestUnlocked();

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

      if (ev.key === 'eventQuest' && !eventQuestUnlocked) {
        desc.textContent = unlocked ? '通常ステージのイージー全クリアで解放 / 難易度別に特別な石板がドロップ！' : 'ランク10で解放';
      } else {
        desc.textContent = ev.desc || '';
      }

      info.appendChild(title);
      info.appendChild(desc);

      if (ev.key === 'gold') {
        renderGoldButtons(info, unlocked);
      } else if (ev.key === 'scoreAttack') {
        renderScoreAttackButton(info, unlocked);
      } else if (ev.key === 'eventQuest') {
        renderQuestButtons(info, eventQuestUnlocked);
      } else {
        const btn = document.createElement('button');
        btn.className = 'event-play-btn';
        btn.type = 'button';
        btn.textContent = unlocked ? 'COMING SOON' : 'LOCK';
        btn.disabled = true;
        info.appendChild(btn);
      }

      card.appendChild(icon);
      card.appendChild(info);
      list.appendChild(card);
    });
  }

  function renderGoldButtons(parent, unlocked){
    const wrap = document.createElement('div');
    wrap.className = 'event-difficulty-grid';

    GOLD_DIFFICULTIES.forEach(diff => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'event-difficulty-card';
      btn.disabled = !unlocked;

      const status =
        !unlocked ? 'LOCK' :
        hasGoldCleared(diff.key) ? 'CLEAR済' :
        'START';

      btn.innerHTML = `
        <img src="${diff.icon}" alt="${diff.name}">
        <span class="event-difficulty-name">${diff.name}</span>
        <span class="event-difficulty-small">${diff.label}</span>
        <span class="event-difficulty-badge">${status}</span>
      `;

      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();

        if (!unlocked) return;

        openConfirm({
          title:'GOLD STAGE',
          sub:`${diff.name}に出撃しますか？`,
          reward:rewardTextGold(diff),
          extra:`チケット消費なし\n自由に挑戦できます。\n\n${diff.label}`,
          onYes:function(){
            startEvent('gold', diff.key);
          }
        });
      });

      wrap.appendChild(btn);
    });

    parent.appendChild(wrap);
  }

  function renderScoreAttackButton(parent, unlocked){
    const btn = document.createElement('button');

    btn.className = 'event-difficulty-card';
    btn.type = 'button';
    btn.disabled = !unlocked;
    btn.style.marginTop = '8px';

    btn.innerHTML = `
      <img src="mt/game2.png" alt="スコアアタック">
      <span class="event-difficulty-name">挑戦する</span>
      <span class="event-difficulty-small">歴代ボス連戦 / ハイスコア</span>
      <span class="event-difficulty-badge">${unlocked ? 'START' : 'LOCK'}</span>
    `;

    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();

      if (!unlocked) return;

      openConfirm({
        title:'スコアアタック',
        sub:'ボス連戦に挑戦しますか？',
        reward:'報酬\nスコア記録のみ',
        extra:'歴代ボスを順番に撃破します。',
        onYes:function(){
          startEvent('scoreAttack', '');
        }
      });
    });

    parent.appendChild(btn);
  }

  function renderQuestButtons(parent, unlocked){
    const wrap = document.createElement('div');
    wrap.className = 'event-quest-wrap';

    QUEST_STAGES.forEach(stage => {
      const box = document.createElement('div');
      box.className = 'event-quest-box';

      const title = document.createElement('div');
      title.className = 'event-quest-title';
      title.textContent = `${stage.id}. ${stage.title}`;

      const label = document.createElement('div');
      label.className = 'event-quest-label';
      label.textContent = stage.label || stage.desc || '';

      const diffRow = document.createElement('div');
      diffRow.className = 'event-quest-diff-row';

      box.appendChild(title);
      box.appendChild(label);

      QUEST_DIFFICULTIES.forEach(diff => {
        const playOk = unlocked && canPlayQuest(stage, diff);
        const cleared = hasQuestCleared(diff.key, stage.id);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'event-quest-diff-btn';
        btn.disabled = !playOk;

        const status =
          !unlocked ? 'LOCK' :
          getRank() < Number(stage.rank || 10) ? `R${stage.rank}` :
          cleared ? 'CLEAR' :
          '';

        btn.innerHTML = `
          <img src="${diff.icon}" alt="${diff.name}">
          <span class="event-quest-diff-name">${diff.name}</span>
          ${status ? `<span class="event-quest-diff-lock">${status}</span>` : ''}
        `;

        btn.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();

          if (!playOk) return;

          const save = getSave();
          const haveCoin = Number(save.coin || 0);
          const cost = Number(diff.cost || 0);

          if (haveCoin < cost) {
            showMessage('COIN不足', `必要COIN: ${cost.toLocaleString()}\n現在COIN: ${haveCoin.toLocaleString()}`);
            return;
          }

          openConfirm({
            title:'イベントクエスト',
            sub:`${stage.title} / ${diff.name}に出撃しますか？`,
            reward:rewardTextQuest(diff, stage),
            extra:`消費COIN: ${cost.toLocaleString()}\n\n${stage.desc || stage.label || ''}`,
            onYes:function(){
              startEvent('eventQuest', diff.key, stage.id);
            }
          });
        });

        diffRow.appendChild(btn);
      });

      box.appendChild(diffRow);
      wrap.appendChild(box);
    });

    parent.appendChild(wrap);
  }

  function makeEventData(key, diffKey, selectedStageId){
    diffKey = normalizeDifficultyKey(diffKey || '');

    const data = {
      key,
      difficulty:diffKey,
      difficultyKey:diffKey,
      stageId:Number(selectedStageId || 0),
      startedAt:Date.now()
    };

    if (key === 'gold') {
      const diff = getDifficulty(diffKey || 'easy');

      data.goldDifficulty = clone(diff);
      data.difficultyData = clone(diff);
    }

    if (key === 'doubleBoss') {
      const diff = getDoubleDifficulty(diffKey || 'veryHard');
      const stage = getDoubleStage(selectedStageId || 1);

      data.doubleStageId = Number(stage.id);
      data.doubleBossStageId = Number(stage.id);
      data.selectedStageId = Number(stage.id);
      data.stageId = Number(stage.id);

      data.difficultyData = clone(diff);
      data.difficultyData.key = diff.key;

      data.stage = clone(stage);
      data.doubleStage = clone(stage);

      data.areaKey = stage.areaKey;
      data.areaName = stage.areaName;
      data.title = stage.title;
      data.background = stage.background || null;
      data.bossA = stage.bossA;
      data.bossB = stage.bossB;
    }

    if (key === 'eventQuest') {
      const diff = getQuestDifficulty(diffKey || 'easy');
      const quest = getQuestStage(selectedStageId || 1);

      data.difficultyData = clone(diff);
      data.questDifficulty = clone(diff);
      data.questStageId = Number(quest.id);
      data.stageId = Number(quest.id);
      data.stage = clone(quest);
      data.questStage = clone(quest);
      data.questEnemyMode = quest.questEnemyMode || 'low';
      data.gimmickSpawn = quest.gimmickSpawn === true;
    }

    return data;
  }

  function startEvent(key, difficultyKey, selectedStageId){
    difficultyKey = normalizeDifficultyKey(difficultyKey || '');

    if (key === 'doubleBoss' && !isDoubleBossUnlocked()) {
      showMessage('LOCK', '通常ステージのハードを全てクリアすると解放されます。');
      return;
    }

    if (key === 'eventQuest' && !isEventQuestUnlocked()) {
      showMessage('LOCK', '通常ステージのイージーを全てクリアすると解放されます。');
      return;
    }

    if (key === 'eventQuest') {
      const diff = getQuestDifficulty(difficultyKey || 'easy');
      const quest = getQuestStage(selectedStageId || 1);

      if (!canPlayQuest(quest, diff)) {
        showMessage('LOCK', 'このクエストはまだ解放されていません。');
        return;
      }

      if (!consumeCoin(Number(diff.cost || 0))) {
        const save = getSave();
        showMessage('COIN不足', `必要COIN: ${Number(diff.cost || 0).toLocaleString()}\n現在COIN: ${Number(save.coin || 0).toLocaleString()}`);
        return;
      }
    }

    const eventData = makeEventData(key, difficultyKey, selectedStageId);

    try {
      localStorage.setItem(EVENT_SAVE_KEY, JSON.stringify(eventData));
    } catch(e) {}

    closeModal();

    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const game = qs('gameScreen');
    if (game) game.classList.add('active');

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

  function isScoreAttack(){
    const ev = getCurrentEvent();
    return !!(ev && ev.key === 'scoreAttack');
  }

  function isDoubleBoss(){
    const ev = getCurrentEvent();
    return !!(ev && ev.key === 'doubleBoss');
  }

  function isEventQuest(){
    const ev = getCurrentEvent();
    return !!(ev && ev.key === 'eventQuest');
  }

  function getCurrentGoldDifficulty(){
    const ev = getCurrentEvent();
    if (!ev || ev.key !== 'gold') return getDifficulty('easy');
    return getDifficulty(ev.difficulty || ev.difficultyKey || 'easy');
  }

  function getCurrentDoubleBoss(){
    const ev = getCurrentEvent();

    if (!ev || ev.key !== 'doubleBoss') {
      return {
        difficulty:getDoubleDifficulty('veryHard'),
        stage:getDoubleStage(1)
      };
    }

    const diffKey = normalizeDifficultyKey(ev.difficulty || ev.difficultyKey || 'veryHard');
    const difficulty = getDoubleDifficulty(diffKey);

    const id = Number(
      ev.stageId ||
      ev.doubleStageId ||
      ev.doubleBossStageId ||
      ev.selectedStageId ||
      (ev.stage && ev.stage.id) ||
      (ev.doubleStage && ev.doubleStage.id) ||
      1
    );

    let stage = getDoubleStage(id);

    if (ev.stage && ev.stage.bossA && ev.stage.bossB) {
      stage = Object.assign({}, stage, ev.stage);
    }

    if (ev.doubleStage && ev.doubleStage.bossA && ev.doubleStage.bossB) {
      stage = Object.assign({}, stage, ev.doubleStage);
    }

    if (ev.bossA) stage.bossA = ev.bossA;
    if (ev.bossB) stage.bossB = ev.bossB;
    if (ev.areaKey) stage.areaKey = ev.areaKey;
    if (ev.areaName) stage.areaName = ev.areaName;
    if (ev.title) stage.title = ev.title;
    if (ev.background) stage.background = ev.background;

    return { difficulty, stage };
  }

  function getCurrentQuest(){
    const ev = getCurrentEvent();
    const difficulty = getQuestDifficulty(ev && (ev.difficulty || ev.difficultyKey) ? (ev.difficulty || ev.difficultyKey) : 'easy');
    const stage = getQuestStage(ev && ev.stageId ? ev.stageId : 1);

    return { difficulty, stage };
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
        if (e.target === modal) closeModal();
      });
    }
  }

  function init(){
    loadItems();
    loadStats();
    injectEventStyle();
    bind();
    ensureConfirmModal();
  }

  document.addEventListener('DOMContentLoaded', init);
  init();

  window.MobShotEvents = {
    EVENTS,
    GOLD_DIFFICULTIES,
    DOUBLE_DIFFICULTIES,
    DOUBLE_STAGES,
    QUEST_DIFFICULTIES,
    QUEST_STAGES,
    EVENT_SAVE_KEY,
    GOLD_CLEAR_KEY,
    DOUBLE_CLEAR_KEY,
    EVENT_ITEM_KEY,
    EVENT_STATS_KEY,
    TEST_GOLD_TICKET_START,

    openModal,
    closeModal,
    render,
    startEvent,
    getCurrentEvent,
    clearCurrentEvent,

    isGoldStage,
    isScoreAttack,
    isDoubleBoss,
    isEventQuest,
    isUnlocked,
    isEventQuestUnlocked,
    isDoubleBossUnlocked,
    isDifficultyAllCleared,

    getDifficulty,
    getCurrentGoldDifficulty,
    getDoubleDifficulty,
    getDoubleStage,
    getCurrentDoubleBoss,

    getQuestDifficulty,
    getQuestStage,
    getCurrentQuest,
    hasQuestCleared,

    hasGoldCleared,
    markGoldCleared,

    loadDoubleClear,
    saveDoubleClear,
    hasDoubleCleared,
    markDoubleCleared,
    isDoubleDifficultyUnlocked,

    loadItems,
    saveItems,
    getGoldTicket,
    addGoldTicket,
    consumeGoldTicket,
    resetTestTickets,

    loadStats,
    saveStats,
    addStat,
    recordGoldClear,
    recordScoreAttackClear,
    recordDoubleBossClear,
    recordEventQuestClear,
    recordEventBossKill,

    makeEventData,
    normalizeDifficultyKey
  };
})();
