'use strict';

(function(){
  function fixBossName(name){
    if (name === '番人') return 'モブガーディアン';
    if (name === '番人Ⅱ') return 'モブガーディアンⅡ';
    if (name === '番人II') return 'モブガーディアンⅡ';
    return name;
  }

  function clone(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  function fixDef(def){
    const copy = clone(def);
    copy.name = fixBossName(copy.name);
    return copy;
  }

  const AREA_DATA = {
    grass: {
      name: '草原',
      background: 'sta/backsougen.png',
      zako: [
        { name:'スラモブ', image:'en/sra.png', hp:5, score:20, coinMin:1, coinMax:2 },
        { name:'モブロック', image:'en/eniwa.png', hp:8, score:30, coinMin:1, coinMax:3 }
      ],
      midBoss: [
        { name:'モブプテラ', image:'en/enpte.png', hp:80, score:300, coin:30 }
      ],
      boss: { name:'ホークモブ', image:'boss/hawks.png', hp:220, score:1000, coin:120 },
      strongBoss: { name:'ホークモブⅡ', image:'boss/hawks2.png', hp:420, score:2500, coin:300 },
      gimmicks: [
        { name:'木箱', image:'gimi/gimihako.png', hp:5, score:10, coinMin:1, coinMax:2 },
        { name:'看板', image:'gimi/gimikan.png', hp:8, score:15, coinMin:1, coinMax:3 },
        { name:'丸岩', image:'gimi/gimiiwa.png', hp:12, score:20, coinMin:2, coinMax:4 }
      ]
    },

    desert: {
      name: '砂漠',
      background: 'sta/backsabaku.png',
      zako: [
        { name:'モブ盗賊', image:'en/entozok.png', hp:10, score:40, coinMin:2, coinMax:4 },
        { name:'モブドワーフ', image:'en/endowa.png', hp:13, score:50, coinMin:2, coinMax:5 }
      ],
      midBoss: [
        { name:'モブデュアル', image:'en/sabadual.png', hp:120, score:450, coin:45 }
      ],
      boss: { name:'ミラモブ', image:'boss/miraboss.png', hp:300, score:1300, coin:160 },
      strongBoss: { name:'ミラモブⅡ', image:'boss/bossmira2.png', hp:560, score:3000, coin:380 },
      gimmicks: [
        { name:'樽', image:'gimi/gimitaru.png', hp:10, score:20, coinMin:2, coinMax:4 },
        { name:'砂漠の岩', image:'gimi/gimisabakiwa.png', hp:16, score:30, coinMin:2, coinMax:5 },
        { name:'銅の箱', image:'gimi/gimidou.png', hp:22, score:40, coinMin:3, coinMax:6 }
      ]
    },

    town: {
      name: '田舎町',
      background: 'sta/backumi.png',
      zako: [
        { name:'モブバード', image:'en/enwasi.png', hp:15, score:60, coinMin:3, coinMax:6 },
        { name:'モブファル', image:'en/iwakofal.png', hp:18, score:70, coinMin:3, coinMax:7 }
      ],
      midBoss: [
        { name:'モブピー', image:'en/enmobpi.png', hp:160, score:600, coin:60 }
      ],
      boss: { name:'モブガーディアン', image:'boss/bossban.png', hp:390, score:1600, coin:200 },
      strongBoss: { name:'モブガーディアンⅡ', image:'boss/bossban2.png', hp:720, score:3600, coin:460 },
      gimmicks: [
        { name:'自転車', image:'gimi/gimichari.png', hp:18, score:35, coinMin:3, coinMax:6 },
        { name:'タイヤ', image:'gimi/gimitaiya.png', hp:20, score:38, coinMin:3, coinMax:7 },
        { name:'自販機', image:'gimi/gimihan.png', hp:30, score:55, coinMin:4, coinMax:8 }
      ]
    },

    neon: {
      name: 'ネオン街',
      background: 'sta/backneon.png',
      zako: [
        { name:'ナーガモブ', image:'en/ennarga.png', hp:22, score:85, coinMin:4, coinMax:8 },
        { name:'モブグリズリー', image:'en/enguri.png', hp:28, score:100, coinMin:4, coinMax:9 }
      ],
      midBoss: [
        { name:'モブギドラ', image:'en/neongidra.png', hp:220, score:800, coin:80 }
      ],
      boss: { name:'ネオンモブ', image:'boss/bossneon.png', hp:500, score:2000, coin:260 },
      strongBoss: { name:'ネオンモブⅡ', image:'boss/bossneon2.png', hp:900, score:4300, coin:560 },
      gimmicks: [
        { name:'ネオンスピーカー', image:'gimi/gimineonspi.png', hp:34, score:60, coinMin:5, coinMax:10 },
        { name:'ネオンレコード', image:'gimi/gimineonreco.png', hp:42, score:75, coinMin:6, coinMax:12 },
        { name:'ネオン噴水', image:'gimi/neonhunsui.png', hp:55, score:100, coinMin:8, coinMax:16 }
      ]
    },

    magma: {
      name: 'マグマ',
      background: 'sta/backmagma.png',
      zako: [
        { name:'モブマグトカゲ', image:'en/enmagtokage.png', hp:32, score:120, coinMin:5, coinMax:11 },
        { name:'モブマグプテラ', image:'en/enmagpte.png', hp:38, score:140, coinMin:6, coinMax:12 }
      ],
      midBoss: [
        { name:'マグモブレム', image:'en/enmaggolem.png', hp:300, score:1050, coin:110 }
      ],
      boss: { name:'ドラゴンモブ', image:'boss/bossdragoon.png', hp:660, score:2600, coin:340 },
      strongBoss: { name:'ドラゴンモブⅡ', image:'boss/bossdragoon2.png', hp:1150, score:5200, coin:680 },
      gimmicks: [
        { name:'マグマ', image:'gimi/gimimag.png', hp:44, score:80, coinMin:6, coinMax:13 },
        { name:'マグマ岩柱', image:'gimi/gimimaghasi.png', hp:55, score:100, coinMin:8, coinMax:16 },
        { name:'マグマスピーカー', image:'gimi/gimimagspi.png', hp:66, score:120, coinMin:9, coinMax:18 }
      ]
    },

    castle: {
      name: '魔王城',
      background: 'sta/backmao.png',
      zako: [
        { name:'ダークゴブモブ', image:'en/enmaogob.png', hp:44, score:160, coinMin:7, coinMax:14 },
        { name:'モブアサシン', image:'en/enasa.png', hp:50, score:180, coinMin:8, coinMax:16 }
      ],
      midBoss: [
        { name:'グラディモブ', image:'en/mobgra.png', hp:400, score:1350, coin:140 }
      ],
      boss: { name:'モブリリス', image:'boss/bossriris.png', hp:820, score:3200, coin:420 },
      strongBoss: { name:'モブ魔王', image:'boss/bossmaoh.png', hp:1500, score:6500, coin:900 },
      gimmicks: [
        { name:'石像', image:'gimi/gimiseki.png', hp:60, score:110, coinMin:8, coinMax:16 },
        { name:'魔王の卵', image:'gimi/gimimaotama.png', hp:76, score:150, coinMin:10, coinMax:20 },
        { name:'魔王の箱', image:'gimi/gimimao.png', hp:90, score:180, coinMin:12, coinMax:24 }
      ]
    },

    prison: {
      name: '監獄',
      background: 'sta/stkan.png',
      legend: true,
      zako: [
        { name:'モブテツ', image:'en/mobtetu.png', hp:58, score:220, coinMin:9, coinMax:18, canShoot:true },
        { name:'マルモブ', image:'en/marumob.png', hp:64, score:240, coinMin:10, coinMax:20, canShoot:true }
      ],
      midBoss: [
        { name:'モブニコ', image:'en/mobnico.png', hp:500, score:1800, coin:180 },
        { name:'モブラス', image:'en/mobras.png', hp:560, score:2100, coin:220 }
      ],
      boss: { name:'モブメイル', image:'boss/bossmeiru.png', hp:1800, score:8000, coin:1200 },
      strongBoss: { name:'モブメイル', image:'boss/bossmeiru.png', hp:1800, score:8000, coin:1200 },
      gimmicks: [
        { name:'木箱', image:'gimi/gimihako.png', hp:70, score:130, coinMin:10, coinMax:20 },
        { name:'樽', image:'gimi/gimitaru.png', hp:80, score:150, coinMin:12, coinMax:24 },
        { name:'石像', image:'gimi/gimiseki.png', hp:100, score:190, coinMin:15, coinMax:30 }
      ]
    },

    matrix: {
      name: 'マトリックス',
      background: 'sta/stmatrix.png',
      legend: true,
      zako: [
        { name:'モブサラ', image:'en/mobsara.png', hp:70, score:260, coinMin:11, coinMax:22, canShoot:true },
        { name:'モブシノ', image:'en/mobsino.png', hp:76, score:280, coinMin:12, coinMax:24, canShoot:true }
      ],
      midBoss: [
        { name:'ガトリモブ', image:'en/gatorimob.png', hp:640, score:2300, coin:240 },
        { name:'ジェイモブ', image:'en/jmob.png', hp:700, score:2600, coin:270 }
      ],
      boss: { name:'モブスミス', image:'boss/bosssmith.png', hp:2200, score:9500, coin:1400 },
      strongBoss: { name:'モブスミス', image:'boss/bosssmith.png', hp:2200, score:9500, coin:1400 },
      gimmicks: [
        { name:'自販機', image:'gimi/gimihan.png', hp:110, score:210, coinMin:16, coinMax:32 },
        { name:'銀の箱', image:'gimi/gimigin.png', hp:125, score:240, coinMin:18, coinMax:36 },
        { name:'マグマ', image:'gimi/gimimag.png', hp:135, score:260, coinMin:20, coinMax:40 }
      ]
    },

    seaRail: {
      name: '海の線路',
      background: 'sta/umisenro.png',
      legend: true,
      zako: [
        { name:'ウミシモブ', image:'en/umisimob.png', hp:82, score:300, coinMin:13, coinMax:26, canShoot:true },
        { name:'バブモブ', image:'en/babumob.png', hp:88, score:330, coinMin:14, coinMax:28, canShoot:true }
      ],
      midBoss: [
        { name:'モブサメ', image:'en/mobsame.png', hp:780, score:2800, coin:300 },
        { name:'モブシャチ', image:'en/shatimob.png', hp:840, score:3100, coin:330 }
      ],
      boss: { name:'モブネプ', image:'boss/bossmobnep.png', hp:2600, score:11000, coin:1700 },
      strongBoss: { name:'モブネプ', image:'boss/bossmobnep.png', hp:2600, score:11000, coin:1700 },
      gimmicks: [
        { name:'看板', image:'gimi/gimikan.png', hp:130, score:260, coinMin:20, coinMax:40 },
        { name:'自転車', image:'gimi/gimichari.png', hp:140, score:280, coinMin:22, coinMax:44 },
        { name:'田舎駅', image:'gimi/gimieki.png', hp:180, score:360, coinMin:28, coinMax:56 }
      ]
    },

    neonHighway: {
      name: 'ネオン高速',
      background: 'sta/neonlord.png',
      legend: true,
      doubleBoss: true,
      bossA: { name:'ブルネオモブ', image:'boss/bossneonblue.png', hp:3100, score:13000, coin:2000 },
      bossB: { name:'パルネオモブ', image:'boss/bossneonpur.png', hp:3400, score:15000, coin:2300 },
      zako: [
        { name:'ネオスラモブ', image:'en/neosura.png', hp:96, score:360, coinMin:15, coinMax:30, canShoot:true },
        { name:'モブネオレム', image:'en/neorem.png', hp:105, score:390, coinMin:16, coinMax:32, canShoot:true }
      ],
      midBoss: [
        { name:'モブコード', image:'en/mobcode.png', hp:920, score:3400, coin:360 },
        { name:'モブケーブル', image:'en/mobcable.png', hp:980, score:3700, coin:390 }
      ],
      boss: { name:'ブルネオモブ', image:'boss/bossneonblue.png', hp:3100, score:13000, coin:2000 },
      strongBoss: { name:'パルネオモブ', image:'boss/bossneonpur.png', hp:3400, score:15000, coin:2300 },
      doubleBosses: [
        { name:'ブルネオモブ', image:'boss/bossneonblue.png', hp:3100, score:13000, coin:2000 },
        { name:'パルネオモブ', image:'boss/bossneonpur.png', hp:3400, score:15000, coin:2300 }
      ],
      gimmicks: [
        { name:'ネオンスピーカー', image:'gimi/gimineonspi.png', hp:160, score:320, coinMin:25, coinMax:50 },
        { name:'ネオン街', image:'gimi/gimineon.png', hp:210, score:420, coinMin:32, coinMax:64 },
        { name:'マグマスピーカー', image:'gimi/gimimagspi.png', hp:220, score:440, coinMin:34, coinMax:68 }
      ]
    },

    makai: {
      name: '魔界',
      background: 'sta/makai.png',
      legend: true,
      zako: [
        { name:'モブデビブルー', image:'en/mobdebib.png', hp:115, score:430, coinMin:18, coinMax:36, canShoot:true },
        { name:'モブデビピンク', image:'en/mobdebipink.png', hp:120, score:450, coinMin:19, coinMax:38, canShoot:true },
        { name:'モブデビパープル', image:'en/mobdebip.png', hp:125, score:470, coinMin:20, coinMax:40, canShoot:true }
      ],
      midBoss: [
        { name:'モブマグシャー', image:'en/mobmagsya.png', hp:1100, score:4200, coin:450 },
        { name:'モブガラド', image:'en/mobgarado.png', hp:1180, score:4600, coin:500 }
      ],
      boss: { name:'閻魔モブ', image:'boss/bossenmob.png', hp:3900, score:18000, coin:2800 },
      strongBoss: { name:'閻魔モブ', image:'boss/bossenmob.png', hp:3900, score:18000, coin:2800 },
      gimmicks: [
        { name:'魔王の卵', image:'gimi/gimimaotama.png', hp:240, score:480, coinMin:38, coinMax:76 },
        { name:'魔王の箱', image:'gimi/gimimao.png', hp:260, score:520, coinMin:42, coinMax:84 },
        { name:'ミイラの棺Ⅱ', image:'gimi/gimihitu2.png', hp:280, score:560, coinMin:45, coinMax:90 }
      ]
    },

    last: {
      name: '魔王の間',
      background: 'sta/makailast.png',
      legend: true,
      zako: [
        { name:'モブデビイエロー', image:'en/mobdebiy.png', hp:135, score:520, coinMin:22, coinMax:44, canShoot:true },
        { name:'モブデーモンレッド', image:'en/mobdemonr.png', hp:145, score:560, coinMin:24, coinMax:48, canShoot:true },
        { name:'モブデーモンパープル', image:'en/mobdemonp.png', hp:155, score:600, coinMin:26, coinMax:52, canShoot:true }
      ],
      midBoss: [
        { name:'モブメルト', image:'en/mobmerut.png', hp:1300, score:5200, coin:600 },
        { name:'モブリリス', image:'boss/bossriris.png', hp:1500, score:6200, coin:700 }
      ],
      boss: { name:'ウルモブリリス', image:'boss/bossulriri.png', hp:5200, score:25000, coin:4000 },
      strongBoss: { name:'ウルモブリリス', image:'boss/bossulriri.png', hp:5200, score:25000, coin:4000 },
      gimmicks: [
        { name:'金の像', image:'gimi/gimigold.png', hp:320, score:640, coinMin:50, coinMax:100 },
        { name:'ダイヤの像', image:'gimi/gimidai.png', hp:380, score:760, coinMin:60, coinMax:120 },
        { name:'リリスの宝玉', image:'gimi/gimiriritama.png', hp:450, score:900, coinMin:80, coinMax:160 }
      ]
    }
  };

  const CHESTS = [
    { name:'銀の宝箱', image:'gimi/takagin.png', hp:10, score:80, coinMin:10, coinMax:25 },
    { name:'金の宝箱', image:'gimi/takagol.png', hp:18, score:160, coinMin:25, coinMax:60 }
  ];

  const AREA_ORDER = [
    'grass',
    'desert',
    'town',
    'neon',
    'magma',
    'castle',
    'prison',
    'matrix',
    'seaRail',
    'neonHighway',
    'makai',
    'last'
  ];

  const DIFFICULTY_ORDER = {
    'イージー': 0,
    'ハード': 1,
    'ベリーハード': 2,
    'インフェルノ': 3,
    'レジェンド': 4,
    easy: 0,
    hard: 1,
    veryHard: 2,
    inferno: 3,
    legend: 4
  };

  const DIFFICULTY_KEY = ['easy', 'hard', 'veryHard', 'inferno', 'legend'];

  const STAGE_SCALE_TABLE = {
    easy: {
      grass:  [1.00, 1.12, 1.25],
      desert: [1.35, 1.48, 1.62],
      town:   [1.65, 1.82, 2.00],
      neon:   [2.05, 2.25, 2.48],
      magma:  [2.45, 2.70, 2.95],
      castle: [2.05, 2.25, 2.45]
    },

    hard: {
      grass:  [10.00, 10.60, 11.20],
      desert: [7.25, 7.80, 8.40],
      town:   [6.15, 6.65, 7.20],
      neon:   [5.45, 5.95, 6.50],
      magma:  [4.95, 5.45, 6.00],
      castle: [4.45, 4.95, 5.50]
    },

    veryHard: {
      grass:  [16.00, 17.00, 18.00],
      desert: [12.80, 13.80, 14.80],
      town:   [10.80, 11.80, 12.80],
      neon:   [9.50, 10.50, 11.50],
      magma:  [8.20, 9.20, 10.20],
      castle: [7.20, 8.20, 9.20]
    },

    inferno: {
      grass:  [24.00, 26.00, 28.00],
      desert: [18.50, 20.50, 22.50],
      town:   [15.20, 17.00, 18.80],
      neon:   [13.00, 14.80, 16.60],
      magma:  [11.20, 13.00, 14.80],
      castle: [10.00, 11.80, 13.60]
    },

    legend: {
      prison:      [8.00, 8.50, 9.00],
      matrix:      [7.00, 7.60, 8.20],
      seaRail:     [6.50, 7.10, 7.70],
      neonHighway: [6.20, 6.80, 7.40],
      makai:       [6.00, 6.80, 7.60],
      last:        [5.20, 6.00, 6.80]
    }
  };

  const DIFFICULTY_BASE_SCALE = [1.00, 10.00, 16.00, 24.00, 8.00];
  const DIFFICULTY_MAX_SCALE = [2.95, 11.20, 18.00, 28.00, 9.00];

  function getStageInfo(){
    if (window.MobShotStorage && window.MobShotStorage.getCurrentStage) {
      return window.MobShotStorage.getCurrentStage();
    }

    return {
      index: 0,
      id: '1-1',
      chapter: 1,
      stageNo: 1,
      areaKey: 'grass',
      areaName: '草原',
      difficulty: 'イージー',
      isStrongBoss: false,
      isLegend: false,
      areaSlot: 1,
      isTest: false
    };
  }

  function difficultyIndex(info){
    const diff = info && info.difficulty;

    if (DIFFICULTY_ORDER[diff] != null) return DIFFICULTY_ORDER[diff];

    const chapter = Number(info && info.chapter || 1);

    if (chapter >= 9) return 4;
    if (chapter >= 7) return 3;
    if (chapter >= 5) return 2;
    if (chapter >= 3) return 1;

    return 0;
  }

  function difficultyKey(info){
    const idx = difficultyIndex(info);
    return DIFFICULTY_KEY[idx] || 'easy';
  }

  function areaIndex(info){
    const key = info && info.areaKey;
    const found = AREA_ORDER.indexOf(key);

    if (found >= 0) return found;

    const chapter = Number(info && info.chapter || 1);
    return Math.max(0, chapter - 1);
  }

  function slotIndex(info){
    if (info && info.areaSlot != null) {
      return Math.max(0, Math.min(2, Number(info.areaSlot || 1) - 1));
    }

    const stageNo = Number(info && info.stageNo || 1);
    return Math.max(0, Math.min(2, (stageNo - 1) % 3));
  }

  function progressInDifficulty(info){
    const area = areaIndex(info);
    const slot = slotIndex(info);

    const areaMax = AREA_ORDER.length - 1;
    const areaRate = areaMax > 0 ? area / areaMax : 0;
    const slotRate = slot / 2;

    return Math.max(0, Math.min(1, (areaRate * 0.82) + (slotRate * 0.18)));
  }

  function curveScale(info){
    const diff = difficultyIndex(info);
    const base = DIFFICULTY_BASE_SCALE[diff] || 1;
    const max = DIFFICULTY_MAX_SCALE[diff] || base;
    const progress = progressInDifficulty(info);

    return base + ((max - base) * progress);
  }

  function tableScale(info){
    const diffKey = difficultyKey(info);
    const areaKey = info && info.areaKey;
    const slot = slotIndex(info);

    const diffTable = STAGE_SCALE_TABLE[diffKey];
    if (!diffTable) return null;

    const areaTable = diffTable[areaKey];
    if (!areaTable) return null;

    const value = Number(areaTable[slot]);
    if (!Number.isFinite(value)) return null;

    return value;
  }

  function totalScale(info){
    let scale = tableScale(info);

    if (scale == null) {
      scale = curveScale(info);
    }

    return Math.max(1, scale);
  }

  function scaleList(list, scale){
    return list.map(item => {
      const copy = clone(item);

      copy.name = fixBossName(copy.name);
      copy.hp = Math.ceil(Number(copy.hp || 1) * scale);
      copy.score = Math.ceil(Number(copy.score || 0) * scale);
      copy.coinMin = Math.ceil(Number(copy.coinMin || 1) * scale);
      copy.coinMax = Math.ceil(Number(copy.coinMax || copy.coinMin || 1) * scale);

      if (copy.coin != null) {
        copy.coin = Math.ceil(Number(copy.coin || 0) * scale);
      }

      return copy;
    });
  }

  function scaleBossDef(def, scale, strong){
    const copy = fixDef(def);

    copy.hp = Math.ceil(Number(copy.hp || 1) * scale);
    copy.score = Math.ceil(Number(copy.score || 0) * scale);
    copy.coin = Math.ceil(Number(copy.coin || 0) * scale);
    copy.strong = !!strong;

    return copy;
  }

  function pickMidBoss(area, info){
    const mids = area.midBoss || [];

    if (!mids.length) return [];
    if (!info.isLegend) return [mids[0]];
    if (mids.length === 1) return [mids[0]];

    return [mids[0], mids[1]];
  }

  function buildBoss(area, info, scale){
    const strong = !!info.isStrongBoss || !!info.isLegend;

    if (area.doubleBoss && Array.isArray(area.doubleBosses) && area.doubleBosses.length >= 2) {
      const bosses = area.doubleBosses.map(def => scaleBossDef(def, scale, strong));

      bosses.forEach(boss => {
        boss.isLegendBoss = !!info.isLegend;
        boss.doubleBoss = true;
      });

      return {
        name: bosses.map(b => b.name).join('＆'),
        image: bosses[0].image,
        hp: bosses.reduce((sum, b) => sum + Number(b.hp || 0), 0),
        score: bosses.reduce((sum, b) => sum + Number(b.score || 0), 0),
        coin: bosses.reduce((sum, b) => sum + Number(b.coin || 0), 0),
        strong,
        isLegendBoss: !!info.isLegend,
        doubleBoss: true,
        bosses
      };
    }

    const src = strong ? (area.strongBoss || area.boss) : area.boss;
    const copy = scaleBossDef(src || area.boss, scale, strong);

    copy.isLegendBoss = !!info.isLegend;

    return copy;
  }

  function applyStageToData(){
    const D = window.MOBSHOT_DATA;

    if (!D) return getStageInfo();

    const info = getStageInfo();
    const area = AREA_DATA[info.areaKey] || AREA_DATA.grass;
    const scale = totalScale(info);
    const gimmicks = scaleList(area.gimmicks || [], scale);
    const boss = buildBoss(area, info, scale);

    D.stage = Object.assign(D.stage || {}, {
      id: info.id,
      chapter: info.chapter,
      stageNo: info.stageNo,
      areaKey: info.areaKey,
      areaName: info.areaName,
      areaType: info.areaName,
      areaNo: info.chapter,
      difficulty: info.difficulty,
      background: area.background,
      isStrongBoss: !!info.isStrongBoss,
      isLegend: !!info.isLegend,
      isTest: !!info.isTest,
      stagePowerScale: scale,
      doubleBoss: !!boss.doubleBoss
    });

    D.enemies = D.enemies || {};
    D.enemies.zako = scaleList(area.zako || [], scale);
    D.enemies.midBoss = scaleList(pickMidBoss(area, info), scale);
    D.enemies.boss = boss;

    if (boss.doubleBoss && Array.isArray(boss.bosses)) {
      D.enemies.bosses = boss.bosses.map(b => clone(b));
      D.enemies.bossA = clone(boss.bosses[0]);
      D.enemies.bossB = clone(boss.bosses[1]);
    } else {
      D.enemies.bosses = [clone(boss)];
      delete D.enemies.bossA;
      delete D.enemies.bossB;
    }

    D.gimmicks = gimmicks;
    D.obstacles = gimmicks;
    D.enemies.obstacles = gimmicks;

    D.chests = scaleList(CHESTS, scale);

    return info;
  }

  function MobShotStageFlow(){
    this.reset();
  }

  MobShotStageFlow.prototype.reset = function(){
    this.phase = 'idle';
    this.phaseFrame = 0;
    this.area = 0;
    this.gate = 0;
    this.boss = 0;
    this.midBoss = 0;
    this.finished = false;
    this.stageInfo = applyStageToData();
  };

  MobShotStageFlow.prototype.start = function(){
    this.reset();
    this.phase = 'area';
    this.phaseFrame = 0;
    this.area = 1;

    return {
      type: 'areaStart',
      text: `${this.stageInfo.areaName} ${this.stageInfo.id}`
    };
  };

  MobShotStageFlow.prototype.update = function(){
    this.phaseFrame++;
  };

  MobShotStageFlow.prototype.snapshot = function(){
    return {
      phase: this.phase,
      phaseFrame: this.phaseFrame,
      area: this.area,
      gate: this.gate,
      midBoss: this.midBoss,
      boss: this.boss,
      finished: this.finished,
      stageInfo: this.stageInfo
    };
  };

  MobShotStageFlow.prototype.setPhase = function(phase){
    this.phase = phase;
    this.phaseFrame = 0;
  };

  MobShotStageFlow.prototype.completeArea = function(){
    this.gate = Number(this.gate || 0) + 1;
    this.setPhase('gate');

    return {
      type: 'gateStart',
      text: 'GATE!'
    };
  };

  MobShotStageFlow.prototype.completeGate = function(){
    if (this.gate === 2 || this.gate === 3) {
      this.midBoss++;
      this.setPhase('midBoss');

      return {
        type: 'midBossStart',
        text: '中ボス出現！'
      };
    }

    this.area++;

    if (this.area > 3) {
      this.boss++;
      this.setPhase('boss');

      return {
        type: 'bossStart',
        text: this.stageInfo.isStrongBoss || this.stageInfo.isLegend ? '強力ボス出現！' : 'BOSS!'
      };
    }

    this.setPhase('area');

    return {
      type: 'areaStart',
      text: `AREA ${this.area}`
    };
  };

  MobShotStageFlow.prototype.completeMidBoss = function(){
    this.area++;

    if (this.area > 3) {
      this.boss++;
      this.setPhase('boss');

      return {
        type: 'bossStart',
        text: this.stageInfo.isStrongBoss || this.stageInfo.isLegend ? '強力ボス出現！' : 'BOSS!'
      };
    }

    this.setPhase('area');

    return {
      type: 'areaStart',
      text: `AREA ${this.area}`
    };
  };

  MobShotStageFlow.prototype.completeBoss = function(){
    this.finished = true;
    this.setPhase('clear');

    return {
      type: 'clear',
      text: 'CLEAR!'
    };
  };

  window.MOBSHOT_STAGE_DATA = AREA_DATA;
  window.MobShotStageFlow = MobShotStageFlow;
})();
