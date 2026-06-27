'use strict';

(function(){
  const DEFAULT_FIREBALL_IMAGE = 'atk/hinotama.png';

  function canonicalBossName(name){
    const raw = String(name || '').trim();

    if (raw === '番人') return 'モブガーディアン';
    if (raw === '番人Ⅱ') return 'モブガーディアンⅡ';
    if (raw === '番人II') return 'モブガーディアンⅡ';

    return raw;
  }

  const BOSS_ATTACKS = {
    'ホークモブ': {
      image: 'atk/hawkatk.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 26,
      normal: 35,
      big: 48,
      huge: 64,
      super: 80,
      color: '#ffe66b'
    },
    'ホークモブⅡ': {
      image: 'atk/hawkatk.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 28,
      normal: 39,
      big: 54,
      huge: 72,
      super: 88,
      color: '#ffe66b'
    },

    'ミラモブ': {
      image: 'atk/miraatk.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 25,
      normal: 34,
      big: 48,
      huge: 64,
      super: 80,
      color: '#b78cff'
    },
    'ミラモブⅡ': {
      image: 'atk/miraatk.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 27,
      normal: 38,
      big: 54,
      huge: 72,
      super: 88,
      color: '#b78cff'
    },

    'モブガーディアン': {
      image: DEFAULT_FIREBALL_IMAGE,
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 27,
      normal: 38,
      big: 54,
      huge: 72,
      super: 88,
      color: '#ff7a35'
    },
    'モブガーディアンⅡ': {
      image: DEFAULT_FIREBALL_IMAGE,
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 30,
      normal: 42,
      big: 60,
      huge: 78,
      super: 96,
      color: '#ff7a35'
    },

    'ネオンモブ': {
      image: 'atk/kaminari.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 25,
      normal: 36,
      big: 50,
      huge: 66,
      super: 82,
      color: '#6be6ff'
    },
    'ネオンモブⅡ': {
      image: 'atk/kaminari.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 28,
      normal: 40,
      big: 56,
      huge: 74,
      super: 92,
      color: '#6be6ff'
    },

    'ドラゴンモブ': {
      image: 'atk/dragon.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 30,
      normal: 44,
      big: 62,
      huge: 82,
      super: 100,
      color: '#ff5b35'
    },
    'ドラゴンモブⅡ': {
      image: 'atk/dragon.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 34,
      normal: 50,
      big: 70,
      huge: 92,
      super: 112,
      color: '#ff5b35'
    },

    'モブリリス': {
      image: 'atk/atkriri.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 28,
      normal: 40,
      big: 58,
      huge: 76,
      super: 94,
      color: '#ff8cff'
    },
    'モブ魔王': {
      image: 'atk/atkmaoh.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 34,
      normal: 50,
      big: 70,
      huge: 92,
      super: 112,
      color: '#ff4aff'
    },

    'モブメイル': {
      image: 'atk/atkmeiru.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 32,
      normal: 48,
      big: 68,
      huge: 88,
      super: 108,
      color: '#bfc7d5'
    },
    'モブスミス': {
      image: 'atk/matrix.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 30,
      normal: 42,
      big: 60,
      huge: 78,
      super: 96,
      color: '#7bffea'
    },
    'モブネプ': {
      image: 'atk/atknep.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 32,
      normal: 48,
      big: 68,
      huge: 88,
      super: 108,
      color: '#6be6ff'
    },
    'ブルネオモブ': {
      image: 'atk/neonring.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 30,
      normal: 44,
      big: 62,
      huge: 82,
      super: 100,
      color: '#4bb8ff'
    },
    'パルネオモブ': {
      image: 'atk/neonring.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 30,
      normal: 44,
      big: 62,
      huge: 82,
      super: 100,
      color: '#b78cff'
    },
    '閻魔モブ': {
      image: 'atk/enma.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 34,
      normal: 50,
      big: 72,
      huge: 94,
      super: 116,
      color: '#ff3b3b'
    },
    'ウルモブリリス': {
      image: 'atk/atkriri.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 34,
      normal: 52,
      big: 74,
      huge: 96,
      super: 120,
      color: '#ff8cff'
    }
  };

  const MID_BOSS_CONFIG = {
    'モブプテラ': {
      shootCd: 96,
      attackCd: 145,
      moveSpeed: 1.42,
      type: 'ptera',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'threeWayDouble',
        'dash',
        'summonZako',
        'unbreakableNormalShot',
        'threeWayNormal'
      ]
    },
    'モブデュアル': {
      shootCd: 88,
      attackCd: 140,
      moveSpeed: 1.68,
      type: 'dual',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'swayDash',
        'fastFourBurst',
        'unbreakableNormalShot',
        'threeWayNormal'
      ]
    },
    'モブピー': {
      shootCd: 78,
      attackCd: 132,
      moveSpeed: 1.95,
      type: 'rapid',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'dash',
        'fakeDashThreeWay',
        'speedMoveShot',
        'unbreakableNormalShot',
        'fastFourBurst'
      ]
    },
    'モブギドラ': {
      shootCd: 90,
      attackCd: 145,
      moveSpeed: 1.55,
      type: 'thunder',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'threeWayNormal',
        'randomSixBurst',
        'fastDash',
        'unbreakableNormalShot',
        'fourWayNormal'
      ]
    },
    'マグモブレム': {
      shootCd: 108,
      attackCd: 158,
      moveSpeed: 1.12,
      type: 'magma',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'dash',
        'randomFiveBurst',
        'unbreakableNormalShot',
        'threeWayNormal'
      ]
    },
    'グラディモブ': {
      shootCd: 94,
      attackCd: 145,
      moveSpeed: 1.62,
      type: 'blade',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'twoWayBurst',
        'homingBreakable',
        'homingBreakableDouble',
        'unbreakableNormalShot',
        'threeWayNormal'
      ]
    },

    'モブニコ': {
      shootCd: 96,
      attackCd: 145,
      moveSpeed: 1.52,
      type: 'normal',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'threeWayDouble',
        'threeWayNormal'
      ]
    },
    'モブラス': {
      shootCd: 106,
      attackCd: 155,
      moveSpeed: 1.28,
      type: 'heavy',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'slowHugeBreakable',
        'threeWayNormal'
      ]
    },
    'ガトリモブ': {
      shootCd: 78,
      attackCd: 132,
      moveSpeed: 1.9,
      type: 'rapid',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'fastFourBurst',
        'randomSixBurst'
      ]
    },
    'ジェイモブ': {
      shootCd: 86,
      attackCd: 132,
      moveSpeed: 1.78,
      type: 'blade',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'twoWayBurst',
        'fastFourBurst'
      ]
    },
    'モブサメ': {
      shootCd: 92,
      attackCd: 138,
      moveSpeed: 1.95,
      type: 'dash',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'fastDash',
        'fastFourBurst'
      ]
    },
    'モブシャチ': {
      shootCd: 106,
      attackCd: 155,
      moveSpeed: 1.48,
      type: 'heavy',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'slowHugeBreakable',
        'threeWayNormal'
      ]
    },
    'モブコード': {
      shootCd: 86,
      attackCd: 132,
      moveSpeed: 1.82,
      type: 'neon',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'randomSixBurst',
        'fourWayNormal'
      ]
    },
    'モブケーブル': {
      shootCd: 94,
      attackCd: 142,
      moveSpeed: 1.6,
      type: 'neon',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'threeWayNormal',
        'fastFourBurst'
      ]
    },
    'モブマグシャー': {
      shootCd: 102,
      attackCd: 150,
      moveSpeed: 1.34,
      type: 'magma',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'randomFiveBurst',
        'threeWayNormal'
      ]
    },
    'モブガラド': {
      shootCd: 98,
      attackCd: 150,
      moveSpeed: 1.44,
      type: 'heavy',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'slowHugeBreakable',
        'threeWayNormal'
      ]
    },
    'モブメルト': {
      shootCd: 102,
      attackCd: 155,
      moveSpeed: 1.34,
      type: 'magma',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'randomFiveBurst',
        'threeWayNormal'
      ]
    },
    'モブリリス': {
      shootCd: 92,
      attackCd: 142,
      moveSpeed: 1.7,
      type: 'lilith',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'lilithRandomShot',
        'lilithBarrier',
        'randomFiveNormal'
      ]
    }
  };

  const BOSS_CONFIG = {
    'ホークモブ': {
      shootCd: 112,
      attackCd: 188,
      moveSpeed: 1.42,
      type: 'hawk',
      spawnWeakEnemies: true,
      specialHpMul: 1.8,
      patterns: [
        'fourWayNormal',
        'fastSixBurst',
        'chargedHugeTriple',
        'sideFastContinuous',
        'summonStageZako',
        'fastDash',
        'fiveWayNormal'
      ]
    },
    'ホークモブⅡ': {
      shootCd: 102,
      attackCd: 172,
      moveSpeed: 1.58,
      type: 'hawk',
      spawnWeakEnemies: true,
      specialHpMul: 2.0,
      patterns: [
        'fiveWayNormal',
        'fastEightBurst',
        'chargedHugeFive',
        'sideFastContinuous',
        'summonStageZako',
        'fastDash',
        'randomSixNormal'
      ]
    },

    'ミラモブ': {
      shootCd: 108,
      attackCd: 182,
      moveSpeed: 1.84,
      type: 'mira',
      spawnWeakEnemies: true,
      specialHpMul: 1.8,
      patterns: [
        'fourWayDifferentSpeed',
        'slowHugeThreeWay',
        'fastThreeBurst',
        'invisibleHugeTriple',
        'randomMoveFastContinuous',
        'summonStageZako',
        'stationaryBarrage',
        'invisibleThreeSeconds',
        'randomFiveNormal'
      ]
    },
    'ミラモブⅡ': {
      shootCd: 98,
      attackCd: 168,
      moveSpeed: 2.0,
      type: 'mira',
      spawnWeakEnemies: true,
      specialHpMul: 2.0,
      patterns: [
        'fourWayDifferentSpeed',
        'slowHugeFiveWay',
        'fastThreeBurst',
        'invisibleHugeFive',
        'randomMoveFastContinuous',
        'summonStageZako',
        'stationaryBarrage',
        'invisibleThreeSeconds',
        'randomSixNormal'
      ]
    },

    'モブガーディアン': {
      shootCd: 120,
      attackCd: 195,
      moveSpeed: 1.18,
      type: 'guardian',
      spawnWeakEnemies: true,
      specialHpMul: 1.85,
      patterns: [
        'threeWayNormal',
        'hugeTwoWay',
        'fastFourBurst',
        'jumpHugeFour',
        'approachFastContinuous',
        'summonStageZako',
        'swayDash',
        'frontBreakableBarrier',
        'fourWayNormal'
      ]
    },
    'モブガーディアンⅡ': {
      shootCd: 110,
      attackCd: 180,
      moveSpeed: 1.28,
      type: 'guardian',
      spawnWeakEnemies: true,
      specialHpMul: 2.05,
      patterns: [
        'threeWayNormal',
        'hugeFiveWay',
        'fastSixBurst',
        'jumpHugeSix',
        'approachFastContinuous',
        'summonStageZako',
        'swayDash',
        'frontBreakableBarrier',
        'fiveWayNormal'
      ]
    },

    'ネオンモブ': {
      shootCd: 102,
      attackCd: 175,
      moveSpeed: 1.95,
      type: 'neon',
      spawnWeakEnemies: true,
      specialHpMul: 1.9,
      patterns: [
        'randomFiveNormal',
        'hugeFourWay',
        'fastFourBurst',
        'chargedSlowThree',
        'approachRandomFast',
        'summonStageZako',
        'giantStrongBall',
        'randomSixNormal'
      ]
    },
    'ネオンモブⅡ': {
      shootCd: 94,
      attackCd: 162,
      moveSpeed: 2.12,
      type: 'neon',
      spawnWeakEnemies: true,
      specialHpMul: 2.1,
      patterns: [
        'randomFiveNormal',
        'hugeEightWay',
        'fastFourBurst',
        'chargedSlowFive',
        'approachRandomFast',
        'summonStageZako',
        'giantStrongBall',
        'randomSixNormal'
      ]
    },

    'ドラゴンモブ': {
      shootCd: 118,
      attackCd: 192,
      moveSpeed: 1.28,
      type: 'dragon',
      spawnWeakEnemies: true,
      specialHpMul: 1.95,
      patterns: [
        'randomThreeNormal',
        'hugeThreeWay',
        'fastFourBurst',
        'chargedSlowFive',
        'wideRandomFast',
        'summonStageZako',
        'weakFlameBarrage',
        'randomFiveNormal'
      ]
    },
    'ドラゴンモブⅡ': {
      shootCd: 106,
      attackCd: 178,
      moveSpeed: 1.44,
      type: 'dragon',
      spawnWeakEnemies: true,
      specialHpMul: 2.2,
      patterns: [
        'randomFiveNormal',
        'hugeFiveWay',
        'fastEightBurst',
        'chargedSlowTen',
        'wideRandomFast',
        'summonStageZako',
        'weakFlameBarrage',
        'randomSixNormal'
      ]
    },

    'モブリリス': {
      shootCd: 105,
      attackCd: 175,
      moveSpeed: 1.75,
      type: 'lilith',
      spawnWeakEnemies: true,
      specialHpMul: 2.05,
      cloneMoveBoost: 1.75,
      patterns: [
        'randomFiveNormal',
        'breakableBarrierThreeSeconds',
        'summonLilithClones',
        'hugeThreeWay',
        'movingFastFourBurst',
        'lightningRandomTen',
        'healTenPercent',
        'summonStageZako',
        'activeMovingClones',
        'randomSixNormal'
      ]
    },
    'モブ魔王': {
      shootCd: 108,
      attackCd: 182,
      moveSpeed: 1.54,
      type: 'maoh',
      spawnWeakEnemies: true,
      specialHpMul: 2.3,
      patterns: [
        'randomSixNormal',
        'hugeFiveWay',
        'teleportAttack',
        'fastEightBurst',
        'summonLilithOnce',
        'darkBreakableBarrier',
        'chargedSlowTen',
        'wideRandomFast',
        'summonStageZako',
        'circleBreakableBarrier'
      ]
    },

    'モブメイル': {
      shootCd: 114,
      attackCd: 186,
      moveSpeed: 1.34,
      type: 'mail',
      spawnWeakEnemies: true,
      specialHpMul: 2.1,
      patterns: [
        'twoWayNormal',
        'fastFourBurst',
        'halfHpSummonMidAndZako',
        'jumpHomingBreakable',
        'sideHugeTriple',
        'summonStageZako',
        'fastDashBarrage',
        'threeWayNormal'
      ]
    },
    'モブスミス': {
      shootCd: 96,
      attackCd: 172,
      moveSpeed: 2.05,
      type: 'smith',
      spawnWeakEnemies: true,
      specialHpMul: 2.1,
      patterns: [
        'oneWayFastNormal',
        'superFastThreeBurst',
        'dashInvisibleBarrage',
        'farHomingFive',
        'hyperEvadeAttack',
        'summonStageZako',
        'randomFiveNormal'
      ]
    },
    'モブネプ': {
      shootCd: 110,
      attackCd: 186,
      moveSpeed: 1.55,
      type: 'nep',
      spawnWeakEnemies: true,
      specialHpMul: 2.1,
      patterns: [
        'oneWayFastNormal',
        'superFastThreeBurst',
        'dashInvisibleBarrage',
        'farHomingFive',
        'hyperEvadeAttack',
        'summonStageZako',
        'giantSlowTrident',
        'randomFiveNormal'
      ]
    },

    'ブルネオモブ': {
      shootCd: 96,
      attackCd: 172,
      moveSpeed: 2.12,
      type: 'blueNeo',
      spawnWeakEnemies: true,
      specialHpMul: 2.1,
      patterns: [
        'blueNeoDefault',
        'randomFiveNormal',
        'fastSixBurst'
      ]
    },
    'パルネオモブ': {
      shootCd: 96,
      attackCd: 172,
      moveSpeed: 2.12,
      type: 'purpleNeo',
      spawnWeakEnemies: true,
      specialHpMul: 2.1,
      patterns: [
        'purpleNeoDefault',
        'randomFiveNormal',
        'fastSixBurst'
      ]
    },

    '閻魔モブ': {
      shootCd: 108,
      attackCd: 190,
      moveSpeed: 1.44,
      type: 'enma',
      spawnWeakEnemies: true,
      specialHpMul: 2.4,
      patterns: [
        'enmaDefault',
        'fastDash',
        'swayBarrage',
        'randomSixNormal',
        'hugeFiveWay'
      ]
    },

    'ウルモブリリス': {
      shootCd: 102,
      attackCd: 182,
      moveSpeed: 1.8,
      type: 'ultraLilith',
      spawnWeakEnemies: true,
      specialHpMul: 2.45,
      patterns: [
        'ultraLilithDefault',
        'randomSixNormal',
        'activeMovingClones',
        'lightningRandomTen'
      ]
    }
  };

  const BOSS_PATTERN_INFO = {
    fourWayNormal: { label:'4方向通常攻撃', breakable:false, power:'normal' },
    fiveWayNormal: { label:'5方向通常攻撃', breakable:false, power:'normal' },
    threeWayNormal: { label:'3方向通常攻撃', breakable:false, power:'normal' },
    twoWayNormal: { label:'2方向通常攻撃', breakable:false, power:'normal' },
    oneWayFastNormal: { label:'高速通常攻撃', breakable:false, power:'normal' },
    randomThreeNormal: { label:'3方向ランダム通常攻撃', breakable:false, power:'normal' },
    randomFiveNormal: { label:'5方向ランダム通常攻撃', breakable:false, power:'normal' },
    randomSixNormal: { label:'6方向ランダム通常攻撃', breakable:false, power:'normal' },
    fourWayDifferentSpeed: { label:'速度違い4方向攻撃', breakable:false, power:'normal' },

    fastThreeBurst: { label:'高速3連射', breakable:false, power:'normal' },
    fastFourBurst: { label:'高速4連射', breakable:false, power:'normal' },
    fastSixBurst: { label:'高速6連射', breakable:false, power:'normal' },
    fastEightBurst: { label:'高速8連射', breakable:false, power:'normal' },
    superFastThreeBurst: { label:'超高速3連射', breakable:false, power:'normal' },

    slowHugeThreeWay: { label:'巨大スロー3方向', breakable:true, power:'huge' },
    slowHugeFiveWay: { label:'巨大スロー5方向', breakable:true, power:'huge' },
    hugeTwoWay: { label:'巨大2方向', breakable:true, power:'huge' },
    hugeThreeWay: { label:'巨大3方向', breakable:true, power:'huge' },
    hugeFourWay: { label:'巨大4方向', breakable:true, power:'huge' },
    hugeFiveWay: { label:'巨大5方向', breakable:true, power:'huge' },
    hugeEightWay: { label:'巨大8方向', breakable:true, power:'huge' },

    chargedHugeTriple: { label:'溜め巨大3連射', breakable:true, power:'super' },
    chargedHugeFive: { label:'溜め巨大5連射', breakable:true, power:'super' },
    chargedSlowThree: { label:'溜めスロー3連射', breakable:true, power:'super' },
    chargedSlowFive: { label:'溜めスロー5連射', breakable:true, power:'super' },
    chargedSlowTen: { label:'溜めスロー10連射', breakable:true, power:'super' },

    fastDash: { label:'高速突進', breakable:false, power:'dash' },
    swayDash: { label:'左右揺れ突進', breakable:false, power:'dash' },
    fastDashBarrage: { label:'高速突進乱射', breakable:false, power:'dash' },
    swayBarrage: { label:'左右揺れ乱射', breakable:false, power:'normal' },

    stationaryBarrage: { label:'その場乱射', breakable:false, power:'normal' },
    invisibleThreeSeconds: { label:'3秒透明化', breakable:false, power:'state' },
    invisibleHugeTriple: { label:'透明化巨大3連射', breakable:true, power:'huge' },
    invisibleHugeFive: { label:'透明化巨大5連射', breakable:true, power:'huge' },

    frontBreakableBarrier: { label:'前面バリア', breakable:true, power:'barrier' },
    circleBreakableBarrier: { label:'円形バリア', breakable:true, power:'barrier' },
    darkBreakableBarrier: { label:'闇バリア', breakable:true, power:'barrier' },
    breakableBarrierThreeSeconds: { label:'3秒バリア', breakable:true, power:'barrier' },

    giantStrongBall: { label:'強化巨大玉', breakable:true, power:'super' },
    weakFlameBarrage: { label:'火炎乱射', breakable:true, power:'small' },
    giantSlowTrident: { label:'巨大スロートライデント', breakable:true, power:'super' },

    summonStageZako: { label:'弱めの敵召喚', breakable:false, power:'summon' },
    activeMovingClones: { label:'動き回る分身', breakable:true, power:'clone' },

    threeWayDouble: { label:'3方向2連射', breakable:false, power:'normal' },
    dash: { label:'突進', breakable:false, power:'dash' },
    summonZako: { label:'雑魚召喚', breakable:false, power:'summon' },
    unbreakableNormalShot: { label:'破壊不可通常弾', breakable:false, power:'normal' },
    fakeDashThreeWay: { label:'フェイク突進3方向', breakable:false, power:'normal' },
    speedMoveShot: { label:'高速移動射撃', breakable:false, power:'normal' },
    randomSixBurst: { label:'ランダム6連射', breakable:false, power:'normal' },
    randomFiveBurst: { label:'ランダム5連射', breakable:false, power:'normal' },
    twoWayBurst: { label:'2方向連射', breakable:false, power:'normal' },
    homingBreakable: { label:'破壊可能追跡弾', breakable:true, power:'normal' },
    homingBreakableDouble: { label:'破壊可能追跡弾2連射', breakable:true, power:'normal' },
    slowHugeBreakable: { label:'破壊可能巨大弾', breakable:true, power:'huge' },
    lilithRandomShot: { label:'リリスランダム攻撃', breakable:false, power:'normal' },
    lilithBarrier: { label:'リリスバリア', breakable:true, power:'barrier' },

    sideFastContinuous: { label:'横移動高速連射', breakable:false, power:'normal' },
    randomMoveFastContinuous: { label:'ランダム移動高速連射', breakable:false, power:'normal' },
    jumpHugeFour: { label:'大ジャンプ巨大4連射', breakable:true, power:'huge' },
    jumpHugeSix: { label:'大ジャンプ巨大6連射', breakable:true, power:'huge' },
    approachFastContinuous: { label:'接近高速連射', breakable:false, power:'normal' },
    approachRandomFast: { label:'接近ランダム高速連射', breakable:false, power:'normal' },
    wideRandomFast: { label:'広範囲ランダム高速連射', breakable:false, power:'normal' },
    movingFastFourBurst: { label:'移動高速4連射', breakable:false, power:'normal' },
    lightningRandomTen: { label:'雷ランダム10連射', breakable:true, power:'normal' },
    summonLilithClones: { label:'リリス分身', breakable:true, power:'clone' },
    summonLilithOnce: { label:'リリス召喚', breakable:true, power:'summon' },
    healTenPercent: { label:'HP10%回復', breakable:false, power:'state' },
    teleportAttack: { label:'瞬間移動攻撃', breakable:false, power:'normal' },
    halfHpSummonMidAndZako: { label:'HP半分以下召喚', breakable:false, power:'summon' },
    jumpHomingBreakable: { label:'大ジャンプ追跡弾', breakable:true, power:'normal' },
    sideHugeTriple: { label:'横移動巨大3発', breakable:true, power:'huge' },
    dashInvisibleBarrage: { label:'透明突進乱射', breakable:false, power:'dash' },
    farHomingFive: { label:'遠距離追跡5発', breakable:true, power:'normal' },
    hyperEvadeAttack: { label:'超回避攻撃', breakable:false, power:'normal' },
    blueNeoDefault: { label:'ブルネオ専用攻撃', breakable:false, power:'normal' },
    purpleNeoDefault: { label:'パルネオ専用攻撃', breakable:false, power:'normal' },
    enmaDefault: { label:'閻魔専用攻撃', breakable:true, power:'super' },
    ultraLilithDefault: { label:'ウルリリス専用攻撃', breakable:true, power:'super' }
  };

  const DEFAULT_BOSS_CONFIG = {
    shootCd: 110,
    attackCd: 185,
    moveSpeed: 1.45,
    type: 'normal',
    spawnWeakEnemies: true,
    specialHpMul: 1.85,
    patterns: [
      'threeWayNormal',
      'fastFourBurst',
      'hugeThreeWay',
      'summonStageZako',
      'fourWayNormal'
    ]
  };

  const DEFAULT_MID_BOSS_CONFIG = {
    shootCd: 94,
    attackCd: 145,
    moveSpeed: 1.45,
    type: 'normal',
    normalAttackBreakable: false,
    spawnStageObstacles: true,
    patterns: [
      'unbreakableNormalShot',
      'threeWayNormal',
      'fastFourBurst'
    ]
  };

  function getAttackSpec(name){
    name = canonicalBossName(name);

    return BOSS_ATTACKS[name] || {
      image: DEFAULT_FIREBALL_IMAGE,
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 26,
      normal: 36,
      big: 50,
      huge: 66,
      super: 82,
      color: '#ff7a35'
    };
  }

  function cloneConfig(config){
    const out = Object.assign({}, config || {});

    if (Array.isArray(config && config.patterns)) {
      out.patterns = config.patterns.slice();
    }

    return out;
  }

  function getMidBossConfig(name){
    name = canonicalBossName(name);
    return cloneConfig(MID_BOSS_CONFIG[name] || DEFAULT_MID_BOSS_CONFIG);
  }

  function getBossConfig(name){
    name = canonicalBossName(name);
    return cloneConfig(BOSS_CONFIG[name] || DEFAULT_BOSS_CONFIG);
  }

  function getBossPatterns(name){
    const config = getBossConfig(name);
    return Array.isArray(config.patterns) ? config.patterns.slice() : [];
  }

  function getMidBossPatterns(name){
    const config = getMidBossConfig(name);
    return Array.isArray(config.patterns) ? config.patterns.slice() : [];
  }

  function getPatternInfo(patternKey){
    return BOSS_PATTERN_INFO[patternKey] || {
      label: patternKey || '通常攻撃',
      breakable: false,
      power: 'normal'
    };
  }

  function isPatternBreakable(patternKey){
    return !!getPatternInfo(patternKey).breakable;
  }

  function getSpecialHpMultiplier(name){
    const config = getBossConfig(name);
    return Number(config.specialHpMul || 1.85);
  }

  function shouldBossSpawnWeakEnemies(name){
    const config = getBossConfig(name);
    return config.spawnWeakEnemies !== false;
  }

  function shouldMidBossSpawnStageObstacles(name){
    const config = getMidBossConfig(name);
    return config.spawnStageObstacles !== false;
  }

  function isMidBossNormalAttackBreakable(name){
    const config = getMidBossConfig(name);
    return config.normalAttackBreakable === true;
  }

  function isStrongBossName(name){
    name = canonicalBossName(name);

    return (
      String(name || '').indexOf('Ⅱ') >= 0 ||
      name === 'モブ魔王' ||
      name === 'モブメイル' ||
      name === 'モブスミス' ||
      name === 'モブネプ' ||
      name === 'ブルネオモブ' ||
      name === 'パルネオモブ' ||
      name === '閻魔モブ' ||
      name === 'ウルモブリリス'
    );
  }

  window.MobShotBossData = {
    DEFAULT_FIREBALL_IMAGE,
    BOSS_ATTACKS,
    MID_BOSS_CONFIG,
    BOSS_CONFIG,
    BOSS_PATTERN_INFO,

    canonicalBossName,
    getAttackSpec,
    getMidBossConfig,
    getBossConfig,
    getBossPatterns,
    getMidBossPatterns,
    getPatternInfo,
    isPatternBreakable,
    getSpecialHpMultiplier,
    shouldBossSpawnWeakEnemies,
    shouldMidBossSpawnStageObstacles,
    isMidBossNormalAttackBreakable,
    isStrongBossName
  };
})();
