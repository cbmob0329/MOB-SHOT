'use strict';

(function(){
  const GACHA_SAVE_KEY = 'mobshot_gacha_state_v1';

  const RARITY = {
    R:   { max:99, coin:500,   rate:68, image:'mt/R.png' },
    SR:  { max:50, coin:3000,  rate:24, image:'mt/SR.png' },
    SSR: { max:30, coin:5000,  rate:7,  image:'mt/SSR.png' },
    UR:  { max:10, coin:10000, rate:1,  image:'mt/UR.png' }
  };

  const SOUL_CT = {
    R:   { base:0.01, step:0.001 },
    SR:  { base:0.03, step:0.002 },
    SSR: { base:0.05, step:0.005 },
    UR:  { base:0.08, step:0.008 }
  };

  const GACHA_IMAGES = {
    top:'mt/gacha1.png',
    start:'mt/gacha2.png',
    shake:'mt/gacha3.png',
    open:'mt/gacha4.png'
  };

  const STONE_MASTER = [
    { no:1,  name:'スラモブ', image:'co/co1.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:2,  name:'モブロック', image:'co/co2.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:3,  name:'モブ盗賊', image:'co/co3.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:4,  name:'モブドワーフ', image:'co/co4.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:5,  name:'モブバード', image:'co/co5.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:6,  name:'モブファル', image:'co/co6.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:7,  name:'ナーガモブ', image:'co/co7.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:8,  name:'モブグリズリー', image:'co/co8.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:9,  name:'モブマグトカゲ', image:'co/co9.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:10, name:'モブマグプテラ', image:'co/co10.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:11, name:'ダークゴブモブ', image:'co/co11.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:12, name:'モブアサシン', image:'co/co12.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:13, name:'モブテツ', image:'co/co13.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:14, name:'マルモブ', image:'co/co14.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:15, name:'モブサラ', image:'co/co15.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:16, name:'モブシノ', image:'co/co16.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:17, name:'ウミシモブ', image:'co/co17.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:18, name:'バブモブ', image:'co/co18.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:19, name:'ネオスラモブ', image:'co/co19.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:20, name:'モブネオレム', image:'co/co20.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:21, name:'モブデビブルー', image:'co/co21.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:22, name:'モブデビピンク', image:'co/co22.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:23, name:'モブデビパープル', image:'co/co23.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:24, name:'モブデビイエロー', image:'co/co24.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:25, name:'モブデーモンレッド', image:'co/co25.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:26, name:'モブデーモンパープル', image:'co/co26.png', rarity:'R', category:'MOB SHOT ENEMY' },
    { no:27, name:'スラモブ カラー', image:'co/co27.png', rarity:'SR', category:'MOB SHOT ENEMY' },
    { no:28, name:'モブマグトカゲ カラー', image:'co/co28.png', rarity:'SR', category:'MOB SHOT ENEMY' },
    { no:29, name:'ナーガモブ カラー', image:'co/co29.png', rarity:'SR', category:'MOB SHOT ENEMY' },
    { no:30, name:'モブテツ カラー', image:'co/co30.png', rarity:'SSR', category:'MOB SHOT ENEMY' },

    { no:31, name:'モブプテラ', image:'co/co31.png', rarity:'R', category:'MOB SHOT MID BOSS' },
    { no:32, name:'モブデュアル', image:'co/co32.png', rarity:'R', category:'MOB SHOT MID BOSS' },
    { no:33, name:'モブピー', image:'co/co33.png', rarity:'R', category:'MOB SHOT MID BOSS' },
    { no:34, name:'モブギドラ', image:'co/co34.png', rarity:'R', category:'MOB SHOT MID BOSS' },
    { no:35, name:'マグモブレム', image:'co/co35.png', rarity:'R', category:'MOB SHOT MID BOSS' },
    { no:36, name:'グラディモブ', image:'co/co36.png', rarity:'R', category:'MOB SHOT MID BOSS' },
    { no:37, name:'モブニコ', image:'co/co37.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:38, name:'モブラス', image:'co/co38.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:39, name:'ガトリモブ', image:'co/co39.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:40, name:'モブサメ', image:'co/co40.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:41, name:'モブシャチ', image:'co/co41.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:42, name:'モブコード', image:'co/co42.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:43, name:'モブケーブル', image:'co/co43.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:44, name:'モブマグシャー', image:'co/co44.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:45, name:'モブガラド', image:'co/co45.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:46, name:'モブメルト', image:'co/co46.png', rarity:'SR', category:'MOB SHOT MID BOSS' },
    { no:47, name:'グラディモブ カラー', image:'co/co47.png', rarity:'SSR', category:'MOB SHOT MID BOSS' },
    { no:48, name:'モブサメ カラー', image:'co/co48.png', rarity:'SSR', category:'MOB SHOT MID BOSS' },
    { no:49, name:'ガトリモブ カラー', image:'co/co49.png', rarity:'SSR', category:'MOB SHOT MID BOSS' },
    { no:50, name:'モブメルト カラー', image:'co/co50.png', rarity:'SSR', category:'MOB SHOT MID BOSS' },

    { no:51, name:'ホークモブ', image:'co/co51.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:52, name:'ミラモブ', image:'co/co52.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:53, name:'モブガーディアン', image:'co/co53.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:54, name:'ネオンモブ', image:'co/co54.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:55, name:'ドラゴンモブ', image:'co/co55.png', rarity:'SR', category:'MOB SHOT BOSS' },

    { no:56, name:'モブドラゴン', image:'co/co56.png', rarity:'SR', category:'MOB PET', gacha:false },
    { no:57, name:'モブイルカエル', image:'co/co57.png', rarity:'SR', category:'MOB PET', gacha:false },
    { no:58, name:'モブデンデン', image:'co/co58.png', rarity:'SR', category:'MOB PET', gacha:false },

    { no:59, name:'モブリリス', image:'co/co59.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:60, name:'ミラモブⅡ', image:'co/co60.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:61, name:'モブ魔王', image:'co/co61.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:62, name:'モブメイル', image:'co/co62.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:63, name:'モブスミス', image:'co/co63.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:64, name:'モブネプ', image:'co/co64.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:65, name:'ブルネオモブ', image:'co/co65.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:66, name:'パルネオモブ', image:'co/co66.png', rarity:'SR', category:'MOB SHOT BOSS' },
    { no:67, name:'閻魔モブ', image:'co/co67.png', rarity:'SSR', category:'MOB SHOT BOSS' },
    { no:68, name:'ウルモブリリス', image:'co/co68.png', rarity:'SSR', category:'MOB SHOT BOSS' },
    { no:69, name:'モブエース', image:'co/co69.png', rarity:'SSR', category:'MOB SHOT BOSS' },
    { no:70, name:'あのヒーロー', image:'co/co70.png', rarity:'SSR', category:'MOB SHOT BOSS' },

    { no:71, name:'モブRPG 城の兵士', image:'co/co71.png', rarity:'SSR', category:'MOB ARTIST' },
    { no:72, name:'モブRPG 勇者モブ', image:'co/co72.png', rarity:'SSR', category:'MOB ARTIST' },
    { no:73, name:'モブRPG 閻魔モブ', image:'co/co73.png', rarity:'SSR', category:'MOB ARTIST' },
    { no:74, name:'ガチャリリモブ', image:'co/co74.png', rarity:'SSR', category:'MOB ARTIST' },
    { no:75, name:'モフモブサメ', image:'co/co75.png', rarity:'SSR', category:'MOB ARTIST' },
    { no:76, name:'チルモブベンチ', image:'co/co76.png', rarity:'SSR', category:'MOB ARTIST' },
    { no:77, name:'モブネコクー', image:'co/co77.png', rarity:'SSR', category:'MOB ARTIST' },

    { no:78, name:'ミラモブⅡ カラー', image:'co/co78.png', rarity:'UR', category:'MOB SHOT BOSS SP' },
    { no:79, name:'ドラゴンモブⅡ カラー', image:'co/co79.png', rarity:'UR', category:'MOB SHOT BOSS SP' },
    { no:80, name:'モブエース カラー', image:'co/co80.png', rarity:'UR', category:'MOB SHOT BOSS SP' },
    { no:81, name:'モブネプ カラー', image:'co/co81.png', rarity:'UR', category:'MOB SHOT BOSS SP' },
    { no:82, name:'モブ魔王 カラー', image:'co/co82.png', rarity:'UR', category:'MOB SHOT BOSS SP' },
    { no:83, name:'ネオンモブ カラー', image:'co/co83.png', rarity:'UR', category:'MOB SHOT BOSS SP' },
    { no:84, name:'モブリリス カラー', image:'co/co84.png', rarity:'UR', category:'MOB SHOT BOSS SP' },
    { no:85, name:'ウルモブリリス カラー', image:'co/co85.png', rarity:'UR', category:'MOB SHOT BOSS SP' },

    { no:86, name:'モブウルフ', image:'co/co86.png', rarity:'SR', category:'MOB PET', gacha:false },
    { no:87, name:'ミニミラモブ', image:'co/co87.png', rarity:'SR', category:'MOB PET', gacha:false },
    { no:88, name:'ミニネオンモブ', image:'co/co88.png', rarity:'SR', category:'MOB PET', gacha:false },
    { no:89, name:'ミニあのヒーロー', image:'co/co89.png', rarity:'SR', category:'MOB PET', gacha:false },
    { no:90, name:'ミニミラモブ カラー', image:'co/co90.png', rarity:'SSR', category:'MOB PET', gacha:false },

    { no:91, name:'イージー', image:'co/co91.png', rarity:'SSR', category:'MOB EVENT', gacha:false },
    { no:92, name:'ハード', image:'co/co92.png', rarity:'SSR', category:'MOB EVENT', gacha:false },
    { no:93, name:'ベリーハード', image:'co/co93.png', rarity:'SSR', category:'MOB EVENT', gacha:false },
    { no:94, name:'インフェルノ', image:'co/co94.png', rarity:'SSR', category:'MOB EVENT', gacha:false },
    { no:95, name:'レジェンド', image:'co/co95.png', rarity:'SSR', category:'MOB EVENT', gacha:false },
    { no:96, name:'リリス四姉妹', image:'co/co96.png', rarity:'SSR', category:'MOB EVENT', gacha:false },
    { no:97, name:'アカノメラ', image:'co/co97.png', rarity:'SSR', category:'MOB EVENT', gacha:false },
    { no:98, name:'ムラノクラ', image:'co/co98.png', rarity:'SSR', category:'MOB EVENT', gacha:false },
    { no:99, name:'ぷにもち', image:'co/co99.png', rarity:'SSR', category:'MOB EVENT', gacha:false },

    { no:100, name:'モブンコク', image:'co/co100.png', rarity:'UR', category:'MOB EVENT', gacha:false },
    { no:101, name:'モブグリム', image:'co/co101.png', rarity:'UR', category:'MOB EVENT', gacha:false },
    { no:102, name:'モブスウ', image:'co/co102.png', rarity:'UR', category:'MOB EVENT', gacha:false },
    { no:103, name:'モブチャイ', image:'co/co103.png', rarity:'UR', category:'MOB EVENT', gacha:false },
    { no:104, name:'モブムウ', image:'co/co104.png', rarity:'UR', category:'MOB EVENT', gacha:false },
    { no:105, name:'モブライ', image:'co/co105.png', rarity:'UR', category:'MOB EVENT', gacha:false },
    { no:106, name:'リリス四姉妹 カラー', image:'co/co106.png', rarity:'UR', category:'MOB EVENT', gacha:false },
    { no:107, name:'あのヒーロー カラー', image:'co/co107.png', rarity:'UR', category:'MOB EVENT', gacha:false }
  ];

  const SOUL_NAMES = [
    'スラソウル','ロックソウル','盗賊ソウル','ドワーフソウル','バードソウル',
    'ファルソウル','ナーガソウル','グリズリーソウル','マグトカゲソウル','マグプテラソウル',
    'ダークゴブソウル','アサシンソウル','テツソウル','マルソウル','サラソウル',
    'シノソウル','ウミシソウル','バブソウル','ネオスラソウル','ネオレムソウル',
    'デビブルーソウル','デビピンクソウル','デビパープルソウル','デビイエローソウル','デーモンレッドソウル',
    'デーモンパープルソウル','プテラソウル','デュアルソウル','ピーソウル','ギドラソウル',
    'マグモブレムソウル','グラディソウル','ニコソウル','ラスソウル','ガトリソウル',
    'サメソウル','シャチソウル','コードソウル','ケーブルソウル','マグシャーソウル',
    'ガラドソウル','メルトソウル','ホークソウル','ミラソウル','ガーディアンソウル',
    'ネオンソウル','ドラゴンソウル','リリスソウル','魔王ソウル','メイルソウル',
    'スミスソウル','ネプソウル','ブルネオソウル','パルネオソウル','閻魔ソウル',
    'ウルリリスソウル','エースソウル','ヒーローソウル','モブRPGソウル','勇者ソウル',
    'ガチャリリソウル','モフサメソウル','チルベンチソウル','ネコクーソウル','ミラカラーソウル',
    'ドラゴンカラーソウル','エースカラーソウル','ネプカラーソウル','魔王カラーソウル','ネオンカラーソウル',
    'リリスカラーソウル','ウルリリスカラーソウル','ウルフソウル','ミニミラソウル','ミニネオンソウル',
    'ミニヒーローソウル','リリス四姉妹ソウル','アカノメラソウル','ムラノクラソウル','モブグリムソウル'
  ];

  const SOUL_MASTER = SOUL_NAMES.map((name, index) => {
    const no = index + 1;
    let rarity = 'R';

    if (no >= 55 && no <= 72) rarity = 'SR';
    if (no >= 73 && no <= 78) rarity = 'SSR';
    if (no >= 79) rarity = 'UR';

    return {
      no,
      name,
      image:`soul/${no}.png`,
      rarity,
      category:'MOB SOUL'
    };
  });

  let isAnimating = false;
  let lastType = 'stone';

  function $(id){ return document.getElementById(id); }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) return window.MobShotStorage.load();
    try { return JSON.parse(localStorage.getItem('mobshot_split_v1')) || {}; }
    catch(e) { return {}; }
  }

  function saveMain(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return;
    }
    try { localStorage.setItem('mobshot_split_v1', JSON.stringify(save)); } catch(e) {}
  }

  function addCoin(amount){
    if (!amount) return;
    const save = getSave();
    save.coin = Number(save.coin || 0) + Number(amount || 0);
    saveMain(save);

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function defaultState(){
    return {
      stones:{},
      skills:{},
      souls:{}
    };
  }

  function loadState(){
    let state = defaultState();

    try {
      const raw = localStorage.getItem(GACHA_SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) || {};
        state = Object.assign(state, parsed);
        state.stones = Object.assign({}, parsed.stones || {});
        state.skills = Object.assign({}, parsed.skills || {});
        state.souls = Object.assign({}, parsed.souls || {});
      }
    } catch(e) {}

    return state;
  }

  function saveState(state){
    const fixed = Object.assign(defaultState(), state || {});
    fixed.stones = Object.assign({}, fixed.stones || {});
    fixed.skills = Object.assign({}, fixed.skills || {});
    fixed.souls = Object.assign({}, fixed.souls || {});

    try {
      localStorage.setItem(GACHA_SAVE_KEY, JSON.stringify(fixed));
    } catch(e) {}
  }

  function rarityMax(rarity){
    return RARITY[rarity] ? RARITY[rarity].max : 99;
  }

  function rarityCoin(rarity){
    return RARITY[rarity] ? RARITY[rarity].coin : 500;
  }

  function rarityImage(rarity){
    return RARITY[rarity] ? RARITY[rarity].image : RARITY.R.image;
  }

  function rarityClass(rarity){
    if (rarity === 'UR') return 'rarity-frame-ur';
    if (rarity === 'SSR') return 'rarity-frame-ssr';
    if (rarity === 'SR') return 'rarity-frame-sr';
    return 'rarity-frame-r';
  }

  function stoneEffectLabel(stone){
    if (stone.category === 'MOB SHOT ENEMY') return '獲得スコア増加';
    if (stone.category === 'MOB SHOT MID BOSS') return '獲得コイン増加';
    if (stone.category === 'MOB SHOT BOSS') return 'ライフ増加';
    if (stone.category === 'MOB ARTIST') return 'コイン＆スコア増加';
    if (stone.category === 'MOB SHOT BOSS SP') return 'パワー増加';
    if (stone.category === 'MOB PET') return '射程増加';
    if (stone.category === 'MOB EVENT') return stone.rarity === 'UR' ? 'パワー＆射程増加' : 'ライフ増加';
    return '';
  }

  function soulEffectLabel(soul){
    const row = SOUL_CT[soul.rarity] || SOUL_CT.R;
    return `スキルCT -${row.base.toFixed(3)}秒 / +1ごとに -${row.step.toFixed(3)}秒`;
  }

  function allStones(){
    return STONE_MASTER.map(stone => Object.assign({}, stone, {
      id:`stone_${stone.no}`,
      effect:stoneEffectLabel(stone),
      maxPlus:rarityMax(stone.rarity),
      rarityImage:rarityImage(stone.rarity)
    }));
  }

  function allSouls(){
    return SOUL_MASTER.map(soul => Object.assign({}, soul, {
      id:`soul_${soul.no}`,
      type:'soul',
      effect:soulEffectLabel(soul),
      maxPlus:rarityMax(soul.rarity),
      rarityImage:rarityImage(soul.rarity)
    }));
  }

  function gachaStonePool(){
    return allStones().filter(stone => stone.gacha !== false);
  }

  function gachaSoulPool(){
    return allSouls();
  }

  function rollRarity(){
    const total = Object.keys(RARITY).reduce((sum, key) => {
      return sum + Number(RARITY[key].rate || 0);
    }, 0);

    let roll = Math.random() * total;

    for (const key of ['R','SR','SSR','UR']) {
      roll -= Number(RARITY[key].rate || 0);
      if (roll <= 0) return key;
    }

    return 'R';
  }

  function rollStone(){
    const rarity = rollRarity();
    let pool = gachaStonePool().filter(stone => stone.rarity === rarity);

    if (!pool.length) pool = gachaStonePool();

    const stone = pool[Math.floor(Math.random() * pool.length)] || pool[0];

    return Object.assign({}, stone, { type:'stone' });
  }

  function rollSoul(){
    const rarity = rollRarity();
    let pool = gachaSoulPool().filter(soul => soul.rarity === rarity);

    if (!pool.length) pool = gachaSoulPool();

    const soul = pool[Math.floor(Math.random() * pool.length)] || pool[0];

    return Object.assign({}, soul, { type:'soul' });
  }

  function getSkillPool(){
    if (window.MobShotSkills && Array.isArray(window.MobShotSkills.SKILL_MASTER)) {
      return window.MobShotSkills.SKILL_MASTER;
    }

    return [
      { key:'rocket', name:'ロケットランチャー', image:'skill/rocket barrage.png', desc:'ロケット弾で攻撃する。', maxPlus:30 },
      { key:'energyRush', name:'エネルギーラッシュ', image:'skill/energyrush.png', desc:'エネルギー弾を乱射する。', maxPlus:30 },
      { key:'twinMissile', name:'ツインミサイル', image:'skill/double missile.png', desc:'追尾ミサイルを放つ。', maxPlus:30 },
      { key:'shadowClone', name:'影分身', image:'skill/shadowclone.png', desc:'分身を召喚する。', maxPlus:30 },
      { key:'thunderbolt', name:'サンダーボルト', image:'skill/thunderbolt.png', desc:'雷を落とす。', maxPlus:30 },
      { key:'arcaneBarrier', name:'アルカナバリア', image:'skill/arcane barrier.png', desc:'一定時間無敵になる。', maxPlus:30 },
      { key:'darkPower', name:'闇の力', image:'skill/dark oblivion.png', desc:'闇をまとい巨大な火の玉を放つ。', maxPlus:30 },
      { key:'blackHole', name:'ブラックホール', image:'skill/blackhole.png', desc:'敵と障害物を吸引する。', maxPlus:30 },
      { key:'healingBreeze', name:'癒しの風', image:'skill/healingbreeze.png', desc:'一定時間HPを回復する。', maxPlus:30 },
      { key:'rosePulse', name:'薔薇の鼓動', image:'skill/rosepulse.png', desc:'薔薇の弾を飛ばす。', maxPlus:30 },
      { key:'goldRush', name:'ゴールドラッシュ', image:'skill/goldrush.png', desc:'獲得コイン倍率を上げる。', maxPlus:30 },
      { key:'darkThunder', name:'ダークサンダー', image:'skill/darkthunder.png', desc:'闇の雷と持続ダメージを与える。', maxPlus:30 },
      { key:'timeMagic', name:'タイムマジック', image:'skill/timemagic.png', desc:'敵と敵弾を停止させる。', maxPlus:30 },
      { key:'lilithSisters', name:'リリス四姉妹', image:'skill/lili.png', desc:'四姉妹を召喚する。', maxPlus:30 },
      { key:'neonBomb', name:'ネオンボム', image:'skill/neonbomb.png', desc:'巨大なネオンボムを飛ばし大爆発させる。', maxPlus:30 },
      { key:'neptuneAttack', name:'ネプチューンアタック', image:'skill/nepatk.png', desc:'貫通トライデントを5連発射する。', maxPlus:30 },
      { key:'miraPoison', name:'ミラポイズン', image:'skill/mira.png', desc:'毒弾を5ワイドで発射する。', maxPlus:30 },
      { key:'bookHero', name:'読みかけの本', image:'skill/book.png', desc:'黄金のヒーローを召喚する。', maxPlus:30 }
    ];
  }

  function rollSkill(){
    const pool = getSkillPool();
    const skill = pool[Math.floor(Math.random() * pool.length)] || pool[0];

    return {
      type:'skill',
      id:skill.key || skill.id || skill.name,
      name:skill.name || skill.label || 'SKILL',
      image:skill.image || '',
      desc:skill.desc || '',
      maxPlus:Number(skill.maxPlus || 30)
    };
  }

  function syncSkillState(result){
    if (!window.MobShotSkills || !window.MobShotSkills.loadState || !window.MobShotSkills.saveState) return;

    const skillState = window.MobShotSkills.loadState();
    const key = String(result.id);

    if (!skillState.skills) skillState.skills = {};
    if (!skillState.skills[key]) skillState.skills[key] = { owned:false, level:1, plus:0 };

    const item = skillState.skills[key];
    item.owned = true;
    item.level = Math.max(1, Number(item.level || 1));
    item.plus = Number(result.plusAfter || 0);

    if (!Array.isArray(skillState.equipped)) skillState.equipped = [];
    if (!skillState.equipped.length) skillState.equipped.push(key);

    window.MobShotSkills.saveState(skillState);

    if (window.MobShotEquip && window.MobShotEquip.render) {
      window.MobShotEquip.render();
    }
  }

  function addCollectionItem(result, bucketName){
    const state = loadState();
    const key = String(result.no);
    const max = rarityMax(result.rarity);
    const convertCoin = rarityCoin(result.rarity);
    const bucket = state[bucketName] || {};

    const current = bucket[key] || {
      no:result.no,
      rarity:result.rarity,
      plus:0,
      owned:false
    };

    const wasOwned = !!current.owned;

    current.owned = true;
    current.rarity = result.rarity;
    current.name = result.name;
    current.image = result.image;

    if (!wasOwned) {
      current.plus = 0;
      result.isNew = true;
      result.converted = false;
      result.convertCoin = 0;
      result.plusAfter = 0;
    } else if (Number(current.plus || 0) >= max) {
      result.isNew = false;
      result.converted = true;
      result.convertCoin = convertCoin;
      result.plusAfter = max;
      addCoin(convertCoin);
    } else {
      current.plus = Math.min(max, Number(current.plus || 0) + 1);
      result.isNew = false;
      result.converted = false;
      result.convertCoin = 0;
      result.plusAfter = current.plus;
    }

    bucket[key] = current;
    state[bucketName] = bucket;

    saveState(state);

    return result;
  }

  function addResult(result){
    if (!result) return result;

    if (result.type === 'stone') {
      result = addCollectionItem(result, 'stones');
    }

    if (result.type === 'soul') {
      result = addCollectionItem(result, 'souls');
    }

    if (result.type === 'skill') {
      const state = loadState();
      const key = String(result.id);
      const max = Number(result.maxPlus || 30);

      const current = state.skills[key] || {
        id:result.id,
        name:result.name,
        image:result.image,
        owned:false,
        plus:0
      };

      const wasOwned = !!current.owned;

      current.owned = true;
      current.name = result.name;
      current.image = result.image;
      current.desc = result.desc || '';

      if (!wasOwned) {
        current.plus = 0;
        result.isNew = true;
        result.converted = false;
        result.convertCoin = 0;
        result.plusAfter = 0;
      } else if (Number(current.plus || 0) >= max) {
        result.isNew = false;
        result.converted = true;
        result.convertCoin = 10000;
        result.plusAfter = max;
        addCoin(10000);
      } else {
        current.plus = Math.min(max, Number(current.plus || 0) + 1);
        result.isNew = false;
        result.converted = false;
        result.convertCoin = 0;
        result.plusAfter = current.plus;
      }

      state.skills[key] = current;
      saveState(state);
      syncSkillState(result);
    }

    window.dispatchEvent(new CustomEvent('mobshot:gachaUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:soulUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));

    return result;
  }

  function addStoneByNo(no, count){
    const stone = allStones().find(s => Number(s.no) === Number(no));
    const results = [];
    const amount = Math.max(1, Number(count || 1));

    if (!stone) return results;

    for (let i = 0; i < amount; i++) {
      results.push(addResult(Object.assign({}, stone, { type:'stone', fromEvent:true })));
    }

    return results;
  }

  function addSoulByNo(no, count){
    const soul = allSouls().find(s => Number(s.no) === Number(no));
    const results = [];
    const amount = Math.max(1, Number(count || 1));

    if (!soul) return results;

    for (let i = 0; i < amount; i++) {
      results.push(addResult(Object.assign({}, soul, { type:'soul', fromEvent:true })));
    }

    return results;
  }

  function spendDiamond(cost){
    const save = getSave();
    const have = Number(save.diamond || 0);

    if (have < cost) return false;

    save.diamond = have - cost;
    saveMain(save);

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
    return true;
  }

  function calcSoulCooldownReduction(){
    const state = loadState();
    let total = 0;

    allSouls().forEach(soul => {
      const data = state.souls[String(soul.no)];
      if (!data || !data.owned) return;

      const plus = Number(data.plus || 0);
      const row = SOUL_CT[soul.rarity] || SOUL_CT.R;

      total += row.base + plus * row.step;
    });

    return Math.min(3, Math.floor(total * 1000) / 1000);
  }

  function injectStyle(){
    if ($('mobGachaStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobGachaStyle';
    style.textContent = `
      .gacha-modal{position:absolute;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.68)}
      .gacha-modal.hidden{display:none}
      .gacha-card{width:min(94vw,560px);max-height:88vh;overflow:auto;border-radius:26px;padding:16px;background:linear-gradient(180deg,rgba(26,22,62,.98),rgba(5,8,22,.98));border:3px solid rgba(255,255,255,.35);box-shadow:0 18px 48px rgba(0,0,0,.62)}
      .gacha-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .gacha-head h2{margin:0;font-size:25px;font-weight:1000;color:#fff;text-shadow:0 3px 0 #000}
      .gacha-close,.gacha-btn{border:0;border-radius:999px;padding:10px 14px;font-weight:1000;background:linear-gradient(#ffe66b,#ffb423);color:#1d1300;box-shadow:0 4px 0 rgba(0,0,0,.35)}
      .gacha-close.hidden{display:none}
      .gacha-main-img{display:block;width:100%;max-height:220px;object-fit:contain;margin:4px auto 10px;border-radius:18px;background:rgba(0,0,0,.22);animation:gachaTopFloat 2.4s ease-in-out infinite}
      @keyframes gachaTopFloat{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}
      .gacha-diamond{font-weight:1000;color:#9deeff;margin:0 0 10px;text-align:center}
      .gacha-menu{display:grid;grid-template-columns:1fr;gap:10px}
      .gacha-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
      .gacha-btn.big{font-size:18px;padding:14px}
      .gacha-btn.gray{background:linear-gradient(#fff,#b7c1d5);color:#182033}
      .gacha-anim{display:flex;align-items:center;justify-content:center;min-height:280px}
      .gacha-anim img{width:88%;max-height:270px;object-fit:contain;filter:drop-shadow(0 12px 0 rgba(0,0,0,.32))}
      .gacha-anim.shake img{animation:gachaShake .12s linear infinite}
      .gacha-anim.zoom img{animation:gachaZoom 2s ease-out forwards}
      @keyframes gachaShake{0%{transform:translateX(-4px) rotate(-2deg)}50%{transform:translateX(4px) rotate(2deg)}100%{transform:translateX(-4px) rotate(-2deg)}}
      @keyframes gachaZoom{0%{transform:scale(1);filter:brightness(1)}100%{transform:scale(1.42);filter:brightness(2.4)}}
      .gacha-results.one{display:grid;grid-template-columns:1fr;gap:12px;justify-items:center}
      .gacha-results.ten{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
      .gacha-results.fifty{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}
      .gacha-result{position:relative;border-radius:20px;padding:22px 8px 10px;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.22);text-align:center;overflow:visible;min-height:138px}
      .gacha-results.one .gacha-result{width:min(82vw,320px);min-height:250px;padding-top:34px}
      .gacha-results.fifty .gacha-result{min-height:108px;padding:17px 4px 6px;border-radius:14px}
      .gacha-result img.gacha-main-result-img{width:82px;height:82px;object-fit:contain;position:relative;z-index:2;animation:gachaItemFloat 2.2s ease-in-out infinite}
      .gacha-results.one .gacha-result img.gacha-main-result-img{width:180px;height:180px}
      .gacha-results.fifty .gacha-result img.gacha-main-result-img{width:48px;height:48px}
      @keyframes gachaItemFloat{0%{transform:translateY(0)}50%{transform:translateY(-7px)}100%{transform:translateY(0)}}
      .gacha-result-name{font-weight:1000;color:#fff;font-size:11px;margin-top:4px;position:relative;z-index:3;line-height:1.25}
      .gacha-results.one .gacha-result-name{font-size:15px}
      .gacha-results.fifty .gacha-result-name{font-size:8px}
      .gacha-result-note{font-weight:1000;color:#ffcf5b;font-size:10px;margin-top:3px;position:relative;z-index:3;line-height:1.25}
      .gacha-results.one .gacha-result-note{font-size:13px}
      .gacha-results.fifty .gacha-result-note{font-size:8px}
      .gacha-result-rarity-img{position:absolute;left:8px;top:-16px;width:78px;height:42px;object-fit:contain;z-index:8;filter:drop-shadow(0 4px 0 rgba(0,0,0,.55));animation:gachaRarityFloat 1.7s ease-in-out infinite}
      .gacha-results.one .gacha-result-rarity-img{left:14px;top:-26px;width:132px;height:72px}
      .gacha-results.fifty .gacha-result-rarity-img{left:4px;top:-10px;width:48px;height:26px}
      @keyframes gachaRarityFloat{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}
      .rarity-frame-r{border-color:rgba(255,255,255,.24)}
      .rarity-frame-sr{border-color:#58dfff;box-shadow:0 0 8px #58dfff,inset 0 0 8px rgba(88,223,255,.45)}
      .rarity-frame-ssr{border-color:#ffd83d;box-shadow:0 0 12px #ffd83d,0 0 22px rgba(255,216,61,.78),0 0 34px rgba(255,80,230,.28),inset 0 0 12px rgba(255,216,61,.48);animation:ssrCardGlow 2s ease-in-out infinite}
      @keyframes ssrCardGlow{0%{filter:hue-rotate(0deg) brightness(1)}50%{filter:hue-rotate(80deg) brightness(1.25)}100%{filter:hue-rotate(0deg) brightness(1)}}
      .rarity-frame-ur{border-color:#ff3cff;box-shadow:0 0 6px #000,0 0 18px #ff3cff,0 0 32px #6d00ff,inset 0 0 12px #ff3cff;animation:urFramePulse 1.9s ease-in-out infinite}
      .rarity-frame-ur:before{content:'';position:absolute;inset:4px;border-radius:16px;border:2px solid rgba(0,0,0,.86);box-shadow:inset 0 0 12px rgba(0,0,0,.9);pointer-events:none;z-index:1}
      .rarity-frame-ur:after{content:'';position:absolute;inset:-3px;border-radius:23px;border:2px solid rgba(255,60,255,.72);box-shadow:0 0 14px #ff3cff,0 0 26px #6d00ff;pointer-events:none;z-index:1;animation:urLineRotate 2.4s linear infinite}
      @keyframes urFramePulse{0%{filter:brightness(1)}50%{filter:brightness(1.45)}100%{filter:brightness(1)}}
      @keyframes urLineRotate{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
      .gacha-skill-tag,.gacha-soul-tag{display:inline-block;margin-bottom:5px;padding:3px 8px;border-radius:999px;font-size:12px;font-weight:1000}
      .gacha-skill-tag{background:linear-gradient(#9deeff,#4bb8ff);color:#00172a}
      .gacha-soul-tag{background:linear-gradient(#ff9df0,#9b5cff);color:#1b001f}
      .gacha-new-tag{display:inline-block;margin-top:3px;padding:3px 8px;border-radius:999px;background:linear-gradient(#fffa9b,#ffbc2e);color:#2a1700;font-size:10px;font-weight:1000}
      .gacha-cost-diamond{display:inline-flex;align-items:center;justify-content:center;gap:5px}
      .gacha-cost-diamond:before{content:'◆';color:#7be7ff;text-shadow:0 0 8px #7be7ff}
      @media (max-width:430px){
        .gacha-results.ten{grid-template-columns:repeat(5,1fr);gap:6px}
        .gacha-result{min-height:116px;padding:18px 4px 6px;border-radius:15px}
        .gacha-result img.gacha-main-result-img{width:54px;height:54px}
        .gacha-result-rarity-img{width:52px;height:28px;top:-11px;left:4px}
        .gacha-result-name{font-size:9px}
        .gacha-result-note{font-size:8px}
        .gacha-results.fifty{grid-template-columns:repeat(5,1fr);gap:5px}
        .gacha-results.fifty .gacha-result{min-height:100px}
      }
    `;

    document.head.appendChild(style);
  }

  function ensureModal(){
    injectStyle();

    let modal = $('gachaModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'gachaModal';
    modal.className = 'gacha-modal hidden';
    modal.innerHTML = `
      <div class="gacha-card">
        <div class="gacha-head">
          <h2>ガチャ</h2>
          <button id="gachaCloseBtn" class="gacha-close" type="button">閉じる</button>
        </div>
        <div id="gachaContent"></div>
      </div>
    `;

    ($('app') || document.body).appendChild(modal);

    $('gachaCloseBtn').addEventListener('click', function(){
      if (!isAnimating) close();
    });

    modal.addEventListener('click', function(e){
      if (e.target === modal && !isAnimating) close();
    });

    return modal;
  }

  function setCloseVisible(show){
    const btn = $('gachaCloseBtn');
    if (btn) btn.classList.toggle('hidden', !show);
  }

  function diamondText(){
    return `DIAMOND: ${Number(getSave().diamond || 0).toLocaleString()}`;
  }

  function open(){
    ensureModal();
    renderTop();
    $('gachaModal').classList.remove('hidden');
  }

  function close(){
    if (isAnimating) return;

    const modal = $('gachaModal');
    if (modal) modal.classList.add('hidden');
  }

  function renderTop(){
    isAnimating = false;
    setCloseVisible(true);

    const content = $('gachaContent');
    if (!content) return;

    content.innerHTML = `
      <img class="gacha-main-img" src="${GACHA_IMAGES.top}" alt="GACHA">
      <div class="gacha-diamond">${diamondText()}</div>
      <div class="gacha-menu">
        <button id="stoneGachaBtn" class="gacha-btn big" type="button">石板ガチャ</button>
        <button id="skillGachaBtn" class="gacha-btn big" type="button">スキルガチャ</button>
        <button id="soulGachaBtn" class="gacha-btn big" type="button">モブソウルガチャ</button>
        <button id="gachaCancelBtn" class="gacha-btn big gray" type="button">引かない</button>
      </div>
    `;

    $('stoneGachaBtn').addEventListener('click', function(){ renderChoice('stone'); });
    $('skillGachaBtn').addEventListener('click', function(){ renderChoice('skill'); });
    $('soulGachaBtn').addEventListener('click', function(){ renderChoice('soul'); });
    $('gachaCancelBtn').addEventListener('click', close);
  }

  function gachaTitle(type){
    if (type === 'skill') return 'スキルガチャ';
    if (type === 'soul') return 'モブソウルガチャ';
    return '石板ガチャ';
  }

  function gachaCosts(type){
    if (type === 'stone') return { one:1, ten:10, fifty:50 };
    if (type === 'skill') return { one:5, ten:50, fifty:250 };
    if (type === 'soul') return { one:5, ten:50, fifty:250 };
    return { one:1, ten:10, fifty:50 };
  }

  function renderChoice(type){
    isAnimating = false;
    setCloseVisible(true);
    lastType = type;

    const content = $('gachaContent');
    const title = gachaTitle(type);
    const cost = gachaCosts(type);

    content.innerHTML = `
      <img class="gacha-main-img" src="${GACHA_IMAGES.top}" alt="GACHA">
      <div class="gacha-diamond">${diamondText()}</div>
      <div class="gacha-menu">
        <button id="gachaOneBtn" class="gacha-btn big" type="button">${title} 1回 / <span class="gacha-cost-diamond">${cost.one}</span></button>
        <button id="gachaTenBtn" class="gacha-btn big" type="button">${title} 10連 / <span class="gacha-cost-diamond">${cost.ten}</span></button>
        <button id="gachaFiftyBtn" class="gacha-btn big" type="button">${title} 50連 / <span class="gacha-cost-diamond">${cost.fifty}</span></button>
        <button id="gachaBackBtn" class="gacha-btn big gray" type="button">やめる</button>
      </div>
    `;

    $('gachaOneBtn').addEventListener('click', function(){ startRoll(type, 1, cost.one); });
    $('gachaTenBtn').addEventListener('click', function(){ startRoll(type, 10, cost.ten); });
    $('gachaFiftyBtn').addEventListener('click', function(){ startRoll(type, 50, cost.fifty); });
    $('gachaBackBtn').addEventListener('click', renderTop);
  }

  function rollByType(type){
    if (type === 'skill') return rollSkill();
    if (type === 'soul') return rollSoul();
    return rollStone();
  }

  function startRoll(type, count, cost){
    if (!spendDiamond(cost)) {
      showMessage('ダイヤが足りません');
      return;
    }

    lastType = type;

    const results = [];

    for (let i = 0; i < count; i++) {
      results.push(addResult(rollByType(type)));
    }

    playAnimation(results);
  }

  function playAnimation(results){
    isAnimating = true;
    setCloseVisible(false);

    const content = $('gachaContent');
    content.innerHTML = `
      <div id="gachaAnim" class="gacha-anim">
        <img id="gachaAnimImg" src="${GACHA_IMAGES.start}" alt="GACHA">
      </div>
    `;

    setTimeout(function(){
      const imgEl = $('gachaAnimImg');
      if (imgEl) imgEl.src = GACHA_IMAGES.shake;

      const anim = $('gachaAnim');
      if (anim) anim.classList.add('shake');
    }, 520);

    setTimeout(function(){
      const imgEl = $('gachaAnimImg');
      if (imgEl) imgEl.src = GACHA_IMAGES.open;

      const anim = $('gachaAnim');
      if (anim) {
        anim.classList.remove('shake');
        anim.classList.add('zoom');
      }
    }, 3000);

    setTimeout(function(){
      isAnimating = false;
      setCloseVisible(true);
      renderResults(results);
    }, 5000);
  }

  function resultListClass(results){
    if (results.length >= 50) return 'fifty';
    if (results.length >= 10) return 'ten';
    return 'one';
  }

  function renderResults(results){
    const content = $('gachaContent');
    const listClass = resultListClass(results);

    content.innerHTML = `
      <div class="gacha-diamond">${diamondText()}</div>
      <div id="gachaResultList" class="gacha-results ${listClass}"></div>
      <div class="gacha-row">
        <button id="gachaAgainBtn" class="gacha-btn" type="button">もう一度</button>
        <button id="gachaDoneBtn" class="gacha-btn gray" type="button">終了</button>
      </div>
    `;

    const list = $('gachaResultList');

    results.forEach(result => {
      const card = document.createElement('div');
      card.className = 'gacha-result';

      if (result.type === 'stone' || result.type === 'soul') {
        card.classList.add(rarityClass(result.rarity));
      }

      card.innerHTML = resultCardHtml(result);
      list.appendChild(card);
    });

    $('gachaAgainBtn').addEventListener('click', function(){ renderChoice(lastType); });
    $('gachaDoneBtn').addEventListener('click', close);
  }

  function resultNote(r){
    if (r.converted) {
      return `MAX変換 +${Number(r.convertCoin || 0).toLocaleString()} COIN`;
    }

    if (r.isNew) return 'NEW!! アンロック';

    return `+${r.plusAfter}/${rarityMax(r.rarity)}`;
  }

  function resultCardHtml(r){
    if (r.type === 'skill') {
      return `
        <div class="gacha-skill-tag">SKILL</div>
        <img class="gacha-main-result-img" src="${r.image}" alt="${r.name}" onerror="this.style.display='none'">
        <div class="gacha-result-name">${r.name}</div>
        <div class="gacha-result-note">${r.converted ? `MAX変換 +${Number(r.convertCoin || 0).toLocaleString()} COIN` : r.isNew ? 'NEW!! アンロック' : `+${r.plusAfter}/${r.maxPlus}`}</div>
      `;
    }

    if (r.type === 'soul') {
      return `
        <img class="gacha-result-rarity-img" src="${rarityImage(r.rarity)}" alt="${r.rarity}">
        <div class="gacha-soul-tag">SOUL</div>
        <img class="gacha-main-result-img" src="${r.image}" alt="${r.name}" onerror="this.style.display='none'">
        <div class="gacha-result-name">No.${String(r.no).padStart(2, '0')} ${r.name}</div>
        <div class="gacha-result-note">${resultNote(r)}</div>
      `;
    }

    return `
      <img class="gacha-result-rarity-img" src="${rarityImage(r.rarity)}" alt="${r.rarity}">
      <img class="gacha-main-result-img" src="${r.image}" alt="${r.name}" onerror="this.style.display='none'">
      <div class="gacha-result-name">No.${String(r.no).padStart(2, '0')} ${r.name}</div>
      <div class="gacha-result-note">${resultNote(r)}</div>
    `;
  }

  function showMessage(text){
    isAnimating = false;
    setCloseVisible(true);

    const content = $('gachaContent');

    content.innerHTML = `
      <div class="gacha-diamond">${diamondText()}</div>
      <div style="padding:22px;text-align:center;color:#fff;font-weight:1000">${text}</div>
      <button id="gachaMsgBackBtn" class="gacha-btn big gray" type="button">戻る</button>
    `;

    $('gachaMsgBackBtn').addEventListener('click', renderTop);
  }

  function bind(){
    const gachaBtn = $('openGachaBtn') || ($('gachaImg') && $('gachaImg').closest('button'));

    if (gachaBtn && !gachaBtn.__mobGachaBound) {
      gachaBtn.__mobGachaBound = true;
      gachaBtn.classList.remove('disabled-btn');
      gachaBtn.disabled = false;

      gachaBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        open();
      });

      gachaBtn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        open();
      }, { passive:false });
    }
  }

  function init(){
    ensureModal();
    bind();
  }

  document.addEventListener('DOMContentLoaded', init);
  init();

  window.MobShotGacha = {
    open,
    close,

    loadState,
    saveState,

    allStones,
    allSouls,
    gachaStonePool,
    gachaSoulPool,

    rollStone,
    rollSoul,
    rollSkill,

    addResult,
    addStoneByNo,
    addSoulByNo,

    rarityMax,
    rarityCoin,
    rarityImage,
    rarityClass,

    calcSoulCooldownReduction,

    STONE_MASTER,
    SOUL_MASTER,
    SOUL_CT,
    GACHA_SAVE_KEY
  };

  window.MobShotSoul = {
    allSouls,
    loadState,
    calcCooldownReduction:calcSoulCooldownReduction,
    getCooldownReduction:calcSoulCooldownReduction,
    rarityImage,
    rarityClass,
    rarityMax,
    SOUL_MASTER,
    SOUL_CT
  };
})();
