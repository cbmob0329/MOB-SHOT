'use strict';

(function(){
  const DEFAULT_FIREBALL_IMAGE = 'atk/hinotama.png';

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

    '番人': {
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
    '番人Ⅱ': {
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
      type: 'ptera'
    },
    'モブデュアル': {
      shootCd: 105,
      attackCd: 160,
      moveSpeed: 1.6,
      type: 'dual'
    },
    'モブピー': {
      shootCd: 95,
      attackCd: 150,
      moveSpeed: 1.85,
      type: 'rapid'
    },
    'モブギドラ': {
      shootCd: 110,
      attackCd: 170,
      moveSpeed: 1.45,
      type: 'thunder'
    },
    'マグモブレム': {
      shootCd: 130,
      attackCd: 185,
      moveSpeed: 1.05,
      type: 'magma'
    },
    'グラディモブ': {
      shootCd: 115,
      attackCd: 165,
      moveSpeed: 1.55,
      type: 'blade'
    },
    'モブニコ': {
      shootCd: 120,
      attackCd: 170,
      moveSpeed: 1.45,
      type: 'normal'
    },
    'モブラス': {
      shootCd: 130,
      attackCd: 180,
      moveSpeed: 1.2,
      type: 'heavy'
    },
    'ガトリモブ': {
      shootCd: 95,
      attackCd: 155,
      moveSpeed: 1.8,
      type: 'rapid'
    },
    'ジェイモブ': {
      shootCd: 105,
      attackCd: 155,
      moveSpeed: 1.7,
      type: 'blade'
    },
    'モブサメ': {
      shootCd: 115,
      attackCd: 160,
      moveSpeed: 1.85,
      type: 'dash'
    },
    'モブシャチ': {
      shootCd: 130,
      attackCd: 180,
      moveSpeed: 1.4,
      type: 'heavy'
    },
    'モブコード': {
      shootCd: 105,
      attackCd: 155,
      moveSpeed: 1.7,
      type: 'neon'
    },
    'モブケーブル': {
      shootCd: 115,
      attackCd: 165,
      moveSpeed: 1.5,
      type: 'neon'
    },
    'モブマグシャー': {
      shootCd: 125,
      attackCd: 175,
      moveSpeed: 1.25,
      type: 'magma'
    },
    'モブガラド': {
      shootCd: 120,
      attackCd: 175,
      moveSpeed: 1.35,
      type: 'heavy'
    },
    'モブメルト': {
      shootCd: 125,
      attackCd: 180,
      moveSpeed: 1.25,
      type: 'magma'
    },
    'モブリリス': {
      shootCd: 115,
      attackCd: 165,
      moveSpeed: 1.6,
      type: 'lilith'
    }
  };

  const BOSS_CONFIG = {
    'ホークモブ': {
      shootCd: 135,
      attackCd: 215,
      moveSpeed: 1.35,
      type: 'hawk'
    },
    'ホークモブⅡ': {
      shootCd: 125,
      attackCd: 200,
      moveSpeed: 1.5,
      type: 'hawk'
    },

    'ミラモブ': {
      shootCd: 130,
      attackCd: 210,
      moveSpeed: 1.75,
      type: 'mira'
    },
    'ミラモブⅡ': {
      shootCd: 120,
      attackCd: 195,
      moveSpeed: 1.9,
      type: 'mira'
    },

    '番人': {
      shootCd: 145,
      attackCd: 225,
      moveSpeed: 1.1,
      type: 'guardian'
    },
    '番人Ⅱ': {
      shootCd: 135,
      attackCd: 210,
      moveSpeed: 1.2,
      type: 'guardian'
    },
    'モブガーディアン': {
      shootCd: 145,
      attackCd: 225,
      moveSpeed: 1.1,
      type: 'guardian'
    },
    'モブガーディアンⅡ': {
      shootCd: 135,
      attackCd: 210,
      moveSpeed: 1.2,
      type: 'guardian'
    },

    'ネオンモブ': {
      shootCd: 125,
      attackCd: 205,
      moveSpeed: 1.85,
      type: 'neon'
    },
    'ネオンモブⅡ': {
      shootCd: 115,
      attackCd: 190,
      moveSpeed: 2.0,
      type: 'neon'
    },

    'ドラゴンモブ': {
      shootCd: 145,
      attackCd: 225,
      moveSpeed: 1.2,
      type: 'dragon'
    },
    'ドラゴンモブⅡ': {
      shootCd: 130,
      attackCd: 210,
      moveSpeed: 1.35,
      type: 'dragon'
    },

    'モブリリス': {
      shootCd: 130,
      attackCd: 205,
      moveSpeed: 1.65,
      type: 'lilith'
    },
    'モブ魔王': {
      shootCd: 135,
      attackCd: 215,
      moveSpeed: 1.45,
      type: 'maoh'
    },

    'モブメイル': {
      shootCd: 145,
      attackCd: 220,
      moveSpeed: 1.25,
      type: 'mail'
    },
    'モブスミス': {
      shootCd: 125,
      attackCd: 205,
      moveSpeed: 1.9,
      type: 'smith'
    },
    'モブネプ': {
      shootCd: 140,
      attackCd: 220,
      moveSpeed: 1.45,
      type: 'nep'
    },

    'ブルネオモブ': {
      shootCd: 125,
      attackCd: 205,
      moveSpeed: 2.0,
      type: 'blueNeo'
    },
    'パルネオモブ': {
      shootCd: 125,
      attackCd: 205,
      moveSpeed: 2.0,
      type: 'purpleNeo'
    },

    '閻魔モブ': {
      shootCd: 145,
      attackCd: 230,
      moveSpeed: 1.35,
      type: 'enma'
    },

    'ウルモブリリス': {
      shootCd: 130,
      attackCd: 215,
      moveSpeed: 1.7,
      type: 'ultraLilith'
    }
  };

  function getAttackSpec(name){
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

  function getMidBossConfig(name){
    return MID_BOSS_CONFIG[name] || {
      shootCd: 115,
      attackCd: 170,
      moveSpeed: 1.35,
      type: 'normal'
    };
  }

  function getBossConfig(name){
    return BOSS_CONFIG[name] || {
      shootCd: 135,
      attackCd: 215,
      moveSpeed: 1.35,
      type: 'normal'
    };
  }

  function isStrongBossName(name){
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
    getAttackSpec,
    getMidBossConfig,
    getBossConfig,
    isStrongBossName
  };
})();
