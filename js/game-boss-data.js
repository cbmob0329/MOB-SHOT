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
      small: 24,
      normal: 32,
      big: 44,
      huge: 58,
      super: 72,
      color: '#ffe66b'
    },
    'ホークモブⅡ': {
      image: 'atk/hawkatk.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 26,
      normal: 36,
      big: 48,
      huge: 64,
      super: 78,
      color: '#ffe66b'
    },

    'ミラモブ': {
      image: 'atk/miraatk.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 23,
      normal: 31,
      big: 44,
      huge: 58,
      super: 72,
      color: '#b78cff'
    },
    'ミラモブⅡ': {
      image: 'atk/miraatk.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 25,
      normal: 34,
      big: 48,
      huge: 64,
      super: 78,
      color: '#b78cff'
    },

    'モブガーディアン': {
      image: DEFAULT_FIREBALL_IMAGE,
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 25,
      normal: 35,
      big: 50,
      huge: 66,
      super: 80,
      color: '#ff7a35'
    },
    'モブガーディアンⅡ': {
      image: DEFAULT_FIREBALL_IMAGE,
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 27,
      normal: 38,
      big: 54,
      huge: 70,
      super: 86,
      color: '#ff7a35'
    },

    'ネオンモブ': {
      image: 'atk/kaminari.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 23,
      normal: 32,
      big: 46,
      huge: 60,
      super: 74,
      color: '#6be6ff'
    },
    'ネオンモブⅡ': {
      image: 'atk/kaminari.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 25,
      normal: 36,
      big: 50,
      huge: 66,
      super: 80,
      color: '#6be6ff'
    },

    'ドラゴンモブ': {
      image: 'atk/dragon.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 28,
      normal: 40,
      big: 56,
      huge: 72,
      super: 88,
      color: '#ff5b35'
    },
    'ドラゴンモブⅡ': {
      image: 'atk/dragon.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 30,
      normal: 44,
      big: 62,
      huge: 80,
      super: 96,
      color: '#ff5b35'
    },

    'モブリリス': {
      image: 'atk/atkriri.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 26,
      normal: 36,
      big: 52,
      huge: 68,
      super: 84,
      color: '#ff8cff'
    },
    'モブ魔王': {
      image: 'atk/atkmaoh.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 30,
      normal: 44,
      big: 62,
      huge: 80,
      super: 96,
      color: '#ff4aff'
    },

    'モブメイル': {
      image: 'atk/atkmeiru.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 28,
      normal: 42,
      big: 60,
      huge: 78,
      super: 94,
      color: '#bfc7d5'
    },
    'モブスミス': {
      image: 'atk/matrix.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 26,
      normal: 36,
      big: 52,
      huge: 68,
      super: 84,
      color: '#7bffea'
    },
    'モブネプ': {
      image: 'atk/atknep.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 28,
      normal: 42,
      big: 60,
      huge: 78,
      super: 94,
      color: '#6be6ff'
    },
    'ブルネオモブ': {
      image: 'atk/neonring.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 26,
      normal: 38,
      big: 54,
      huge: 70,
      super: 86,
      color: '#4bb8ff'
    },
    'パルネオモブ': {
      image: 'atk/neonring.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 26,
      normal: 38,
      big: 54,
      huge: 70,
      super: 86,
      color: '#b78cff'
    },
    '閻魔モブ': {
      image: 'atk/enma.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 30,
      normal: 44,
      big: 62,
      huge: 82,
      super: 98,
      color: '#ff3b3b'
    },
    'ウルモブリリス': {
      image: 'atk/atkriri.png',
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: false,
      small: 30,
      normal: 46,
      big: 64,
      huge: 84,
      super: 100,
      color: '#ff8cff'
    }
  };

  const MID_BOSS_CONFIG = {
    'モブプテラ': {
      shootCd: 115,
      attackCd: 165,
      moveSpeed: 1.35,
      type: 'ptera',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'threeWayDouble',
        'dash',
        'summonZako',
        'unbreakableNormalShot'
      ]
    },
    'モブデュアル': {
      shootCd: 105,
      attackCd: 160,
      moveSpeed: 1.6,
      type: 'dual',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'swayDash',
        'fastFourBurst',
        'unbreakableNormalShot'
      ]
    },
    'モブピー': {
      shootCd: 95,
      attackCd: 150,
      moveSpeed: 1.85,
      type: 'rapid',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'dash',
        'fakeDashThreeWay',
        'speedMoveShot',
        'unbreakableNormalShot'
      ]
    },
    'モブギドラ': {
      shootCd: 110,
      attackCd: 170,
      moveSpeed: 1.45,
      type: 'thunder',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'threeWayNormal',
        'randomSixBurst',
        'fastDash',
        'unbreakableNormalShot'
      ]
    },
    'マグモブレム': {
      shootCd: 130,
      attackCd: 185,
      moveSpeed: 1.05,
      type: 'magma',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'dash',
        'randomFiveBurst',
        'unbreakableNormalShot'
      ]
    },
    'グラディモブ': {
      shootCd: 115,
      attackCd: 165,
      moveSpeed: 1.55,
      type: 'blade',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'twoWayBurst',
        'homingBreakable',
        'homingBreakableDouble',
        'unbreakableNormalShot'
      ]
    },

    'モブニコ': {
      shootCd: 120,
      attackCd: 170,
      moveSpeed: 1.45,
      type: 'normal',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'threeWayDouble'
      ]
    },
    'モブラス': {
      shootCd: 130,
      attackCd: 180,
      moveSpeed: 1.2,
      type: 'heavy',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'slowHugeBreakable'
      ]
    },
    'ガトリモブ': {
      shootCd: 95,
      attackCd: 155,
      moveSpeed: 1.8,
      type: 'rapid',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'fastFourBurst'
      ]
    },
    'ジェイモブ': {
      shootCd: 105,
      attackCd: 155,
      moveSpeed: 1.7,
      type: 'blade',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'twoWayBurst'
      ]
    },
    'モブサメ': {
      shootCd: 115,
      attackCd: 160,
      moveSpeed: 1.85,
      type: 'dash',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'fastDash'
      ]
    },
    'モブシャチ': {
      shootCd: 130,
      attackCd: 180,
      moveSpeed: 1.4,
      type: 'heavy',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'slowHugeBreakable'
      ]
    },
    'モブコード': {
      shootCd: 105,
      attackCd: 155,
      moveSpeed: 1.7,
      type: 'neon',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'randomSixBurst'
      ]
    },
    'モブケーブル': {
      shootCd: 115,
      attackCd: 165,
      moveSpeed: 1.5,
      type: 'neon',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'threeWayNormal'
      ]
    },
    'モブマグシャー': {
      shootCd: 125,
      attackCd: 175,
      moveSpeed: 1.25,
      type: 'magma',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'randomFiveBurst'
      ]
    },
    'モブガラド': {
      shootCd: 120,
      attackCd: 175,
      moveSpeed: 1.35,
      type: 'heavy',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'slowHugeBreakable'
      ]
    },
    'モブメルト': {
      shootCd: 125,
      attackCd: 180,
      moveSpeed: 1.25,
      type: 'magma',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'randomFiveBurst'
      ]
    },
    'モブリリス': {
      shootCd: 115,
      attackCd: 165,
      moveSpeed: 1.6,
      type: 'lilith',
      normalAttackBreakable: false,
      spawnStageObstacles: true,
      patterns: [
        'unbreakableNormalShot',
        'lilithRandomShot',
        'lilithBarrier'
      ]
    }
  };

  const BOSS_CONFIG = {
    'ホークモブ': {
      shootCd: 135,
      attackCd: 215,
      moveSpeed: 1.35,
      type: 'hawk',
      spawnWeakEnemies: true,
      specialHpMul: 1.65,
      patterns: [
        'fourWayNormal',
        'fastSixBurst',
        'chargedHugeTriple',
        'sideFastContinuous',
        'summonStageZako',
        'fastDash'
      ]
    },
    'ホークモブⅡ': {
      shootCd: 125,
      attackCd: 200,
      moveSpeed: 1.5,
      type: 'hawk',
      spawnWeakEnemies: true,
      specialHpMul: 1.85,
      patterns: [
        'fiveWayNormal',
        'fastEightBurst',
        'chargedHugeFive',
        'sideFastContinuous',
        'summonStageZako',
        'fastDash'
      ]
    },

    'ミラモブ': {
      shootCd: 130,
      attackCd: 210,
      moveSpeed: 1.75,
      type: 'mira',
      spawnWeakEnemies: true,
      specialHpMul: 1.65,
      patterns: [
        'fourWayDifferentSpeed',
        'slowHugeThreeWay',
        'fastThreeBurst',
        'invisibleHugeTriple',
        'randomMoveFastContinuous',
        'summonStageZako',
        'stationaryBarrage',
        'invisibleThreeSeconds'
      ]
    },
    'ミラモブⅡ': {
      shootCd: 120,
      attackCd: 195,
      moveSpeed: 1.9,
      type: 'mira',
      spawnWeakEnemies: true,
      specialHpMul: 1.85,
      patterns: [
        'fourWayDifferentSpeed',
        'slowHugeFiveWay',
        'fastThreeBurst',
        'invisibleHugeFive',
        'randomMoveFastContinuous',
        'summonStageZako',
        'stationaryBarrage',
        'invisibleThreeSeconds'
      ]
    },

    'モブガーディアン': {
      shootCd: 145,
      attackCd: 225,
      moveSpeed: 1.1,
      type: 'guardian',
      spawnWeakEnemies: true,
      specialHpMul: 1.7,
      patterns: [
        'threeWayNormal',
        'hugeTwoWay',
        'fastFourBurst',
        'jumpHugeFour',
        'approachFastContinuous',
        'summonStageZako',
        'swayDash',
        'frontBreakableBarrier'
      ]
    },
    'モブガーディアンⅡ': {
      shootCd: 135,
      attackCd: 210,
      moveSpeed: 1.2,
      type: 'guardian',
      spawnWeakEnemies: true,
      specialHpMul: 1.9,
      patterns: [
        'threeWayNormal',
        'hugeFiveWay',
        'fastSixBurst',
        'jumpHugeSix',
        'approachFastContinuous',
        'summonStageZako',
        'swayDash',
        'frontBreakableBarrier'
      ]
    },

    'ネオンモブ': {
      shootCd: 125,
      attackCd: 205,
      moveSpeed: 1.85,
      type: 'neon',
      spawnWeakEnemies: true,
      specialHpMul: 1.75,
      patterns: [
        'randomFiveNormal',
        'hugeFourWay',
        'fastFourBurst',
        'chargedSlowThree',
        'approachRandomFast',
        'summonStageZako',
        'giantStrongBall'
      ]
    },
    'ネオンモブⅡ': {
      shootCd: 115,
      attackCd: 190,
      moveSpeed: 2.0,
      type: 'neon',
      spawnWeakEnemies: true,
      specialHpMul: 1.95,
      patterns: [
        'randomFiveNormal',
        'hugeEightWay',
        'fastFourBurst',
        'chargedSlowFive',
        'approachRandomFast',
        'summonStageZako',
        'giantStrongBall'
      ]
    },

    'ドラゴンモブ': {
      shootCd: 145,
      attackCd: 225,
      moveSpeed: 1.2,
      type: 'dragon',
      spawnWeakEnemies: true,
      specialHpMul: 1.75,
      patterns: [
        'randomThreeNormal',
        'hugeThreeWay',
        'fastFourBurst',
        'chargedSlowFive',
        'wideRandomFast',
        'summonStageZako',
        'weakFlameBarrage'
      ]
    },
    'ドラゴンモブⅡ': {
      shootCd: 130,
      attackCd: 210,
      moveSpeed: 1.35,
      type: 'dragon',
      spawnWeakEnemies: true,
      specialHpMul: 2.0,
      patterns: [
        'randomFiveNormal',
        'hugeFiveWay',
        'fastEightBurst',
        'chargedSlowTen',
        'wideRandomFast',
        'summonStageZako',
        'weakFlameBarrage'
      ]
    },

    'モブリリス': {
      shootCd: 130,
      attackCd: 205,
      moveSpeed: 1.65,
      type: 'lilith',
      spawnWeakEnemies: true,
      specialHpMul: 1.85,
      cloneMoveBoost: 1.65,
      patterns: [
        'randomFiveNormal',
        'breakableBarrierThreeSeconds',
        'summonLilithClones',
        'hugeThreeWay',
        'movingFastFourBurst',
        'lightningRandomTen',
        'healTenPercent',
        'summonStageZako',
        'activeMovingClones'
      ]
    },
    'モブ魔王': {
      shootCd: 135,
      attackCd: 215,
      moveSpeed: 1.45,
      type: 'maoh',
      spawnWeakEnemies: true,
      specialHpMul: 2.05,
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
      shootCd: 145,
      attackCd: 220,
      moveSpeed: 1.25,
      type: 'mail',
      spawnWeakEnemies: true,
      specialHpMul: 1.9,
      patterns: [
        'twoWayNormal',
        'fastFourBurst',
        'halfHpSummonMidAndZako',
        'jumpHomingBreakable',
        'sideHugeTriple',
        'summonStageZako',
        'fastDashBarrage'
      ]
    },
    'モブスミス': {
      shootCd: 125,
      attackCd: 205,
      moveSpeed: 1.9,
      type: 'smith',
      spawnWeakEnemies: true,
      specialHpMul: 1.9,
      patterns: [
        'oneWayFastNormal',
        'superFastThreeBurst',
        'dashInvisibleBarrage',
        'farHomingFive',
        'hyperEvadeAttack',
        'summonStageZako'
      ]
    },
    'モブネプ': {
      shootCd: 140,
      attackCd: 220,
      moveSpeed: 1.45,
      type: 'nep',
      spawnWeakEnemies: true,
      specialHpMul: 1.9,
      patterns: [
        'oneWayFastNormal',
        'superFastThreeBurst',
        'dashInvisibleBarrage',
        'farHomingFive',
        'hyperEvadeAttack',
        'summonStageZako',
        'giantSlowTrident'
      ]
    },

    'ブルネオモブ': {
      shootCd: 125,
      attackCd: 205,
      moveSpeed: 2.0,
      type: 'blueNeo',
      spawnWeakEnemies: true,
      specialHpMul: 1.9,
      patterns: [
        'blueNeoDefault'
      ]
    },
    'パルネオモブ': {
      shootCd: 125,
      attackCd: 205,
      moveSpeed: 2.0,
      type: 'purpleNeo',
      spawnWeakEnemies: true,
      specialHpMul: 1.9,
      patterns: [
        'purpleNeoDefault'
      ]
    },

    '閻魔モブ': {
      shootCd: 145,
      attackCd: 230,
      moveSpeed: 1.35,
      type: 'enma',
      spawnWeakEnemies: true,
      specialHpMul: 2.15,
      patterns: [
        'enmaDefault',
        'fastDash',
        'swayBarrage'
      ]
    },

    'ウルモブリリス': {
      shootCd: 130,
      attackCd: 215,
      moveSpeed: 1.7,
      type: 'ultraLilith',
      spawnWeakEnemies: true,
      specialHpMul: 2.2,
      patterns: [
        'ultraLilithDefault'
      ]
    }
  };

  const BOSS_PATTERN_INFO = {
    fourWayNormal: {
      label: '4方向通常攻撃',
      breakable: false,
      power: 'normal'
    },
    fiveWayNormal: {
      label: '5方向通常攻撃',
      breakable: false,
      power: 'normal'
    },
    threeWayNormal: {
      label: '3方向通常攻撃',
      breakable: false,
      power: 'normal'
    },
    twoWayNormal: {
      label: '2方向通常攻撃',
      breakable: false,
      power: 'normal'
    },
    oneWayFastNormal: {
      label: '高速通常攻撃',
      breakable: false,
      power: 'normal'
    },
    randomThreeNormal: {
      label: '3方向ランダム通常攻撃',
      breakable: false,
      power: 'normal'
    },
    randomFiveNormal: {
      label: '5方向ランダム通常攻撃',
      breakable: false,
      power: 'normal'
    },
    randomSixNormal: {
      label: '6方向ランダム通常攻撃',
      breakable: false,
      power: 'normal'
    },
    fourWayDifferentSpeed: {
      label: '速度違い4方向攻撃',
      breakable: false,
      power: 'normal'
    },

    fastThreeBurst: {
      label: '高速3連射',
      breakable: false,
      power: 'normal'
    },
    fastFourBurst: {
      label: '高速4連射',
      breakable: false,
      power: 'normal'
    },
    fastSixBurst: {
      label: '高速6連射',
      breakable: false,
      power: 'normal'
    },
    fastEightBurst: {
      label: '高速8連射',
      breakable: false,
      power: 'normal'
    },
    superFastThreeBurst: {
      label: '超高速3連射',
      breakable: false,
      power: 'normal'
    },

    slowHugeThreeWay: {
      label: '巨大スロー3方向',
      breakable: true,
      power: 'huge'
    },
    slowHugeFiveWay: {
      label: '巨大スロー5方向',
      breakable: true,
      power: 'huge'
    },
    hugeTwoWay: {
      label: '巨大2方向',
      breakable: true,
      power: 'huge'
    },
    hugeThreeWay: {
      label: '巨大3方向',
      breakable: true,
      power: 'huge'
    },
    hugeFourWay: {
      label: '巨大4方向',
      breakable: true,
      power: 'huge'
    },
    hugeFiveWay: {
      label: '巨大5方向',
      breakable: true,
      power: 'huge'
    },
    hugeEightWay: {
      label: '巨大8方向',
      breakable: true,
      power: 'huge'
    },

    chargedHugeTriple: {
      label: '溜め巨大3連射',
      breakable: true,
      power: 'super'
    },
    chargedHugeFive: {
      label: '溜め巨大5連射',
      breakable: true,
      power: 'super'
    },
    chargedSlowThree: {
      label: '溜めスロー3連射',
      breakable: true,
      power: 'super'
    },
    chargedSlowFive: {
      label: '溜めスロー5連射',
      breakable: true,
      power: 'super'
    },
    chargedSlowTen: {
      label: '溜めスロー10連射',
      breakable: true,
      power: 'super'
    },

    fastDash: {
      label: '高速突進',
      breakable: false,
      power: 'dash'
    },
    swayDash: {
      label: '左右揺れ突進',
      breakable: false,
      power: 'dash'
    },
    fastDashBarrage: {
      label: '高速突進乱射',
      breakable: false,
      power: 'dash'
    },
    swayBarrage: {
      label: '左右揺れ乱射',
      breakable: false,
      power: 'normal'
    },

    stationaryBarrage: {
      label: 'その場乱射',
      breakable: false,
      power: 'normal'
    },
    invisibleThreeSeconds: {
      label: '3秒透明化',
      breakable: false,
      power: 'state'
    },
    invisibleHugeTriple: {
      label: '透明化巨大3連射',
      breakable: true,
      power: 'huge'
    },
    invisibleHugeFive: {
      label: '透明化巨大5連射',
      breakable: true,
      power: 'huge'
    },

    frontBreakableBarrier: {
      label: '前面バリア',
      breakable: true,
      power: 'barrier'
    },
    circleBreakableBarrier: {
      label: '円形バリア',
      breakable: true,
      power: 'barrier'
    },
    darkBreakableBarrier: {
      label: '闇バリア',
      breakable: true,
      power: 'barrier'
    },
    breakableBarrierThreeSeconds: {
      label: '3秒バリア',
      breakable: true,
      power: 'barrier'
    },

    giantStrongBall: {
      label: '強化巨大玉',
      breakable: true,
      power: 'super'
    },
    weakFlameBarrage: {
      label: '弱火炎乱射',
      breakable: true,
      power: 'small'
    },
    giantSlowTrident: {
      label: '巨大スロートライデント',
      breakable: true,
      power: 'super'
    },

    summonStageZako: {
      label: '弱めの敵召喚',
      breakable: false,
      power: 'summon'
    },
    activeMovingClones: {
      label: '動き回る分身',
      breakable: true,
      power: 'clone'
    }
  };

  const DEFAULT_BOSS_CONFIG = {
    shootCd: 135,
    attackCd: 215,
    moveSpeed: 1.35,
    type: 'normal',
    spawnWeakEnemies: true,
    specialHpMul: 1.65,
    patterns: [
      'threeWayNormal',
      'fastFourBurst',
      'hugeThreeWay',
      'summonStageZako'
    ]
  };

  const DEFAULT_MID_BOSS_CONFIG = {
    shootCd: 115,
    attackCd: 170,
    moveSpeed: 1.35,
    type: 'normal',
    normalAttackBreakable: false,
    spawnStageObstacles: true,
    patterns: [
      'unbreakableNormalShot',
      'threeWayNormal'
    ]
  };

  function getAttackSpec(name){
    name = canonicalBossName(name);

    return BOSS_ATTACKS[name] || {
      image: DEFAULT_FIREBALL_IMAGE,
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 24,
      normal: 32,
      big: 46,
      huge: 60,
      super: 74,
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
    return Number(config.specialHpMul || 1.65);
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
