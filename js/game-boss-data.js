'use strict';

(function(){
  const BOSS_ATTACKS = {
    'ホークモブ': {
      image: 'atk/hawkatk.png',
      flipY: true,
      small: 26,
      normal: 34,
      big: 48,
      huge: 62,
      color: '#ffe66b'
    },
    'ホークモブⅡ': {
      image: 'atk/hawkatk.png',
      flipY: true,
      small: 28,
      normal: 38,
      big: 52,
      huge: 68,
      color: '#ffe66b'
    },

    'ミラモブ': {
      image: 'atk/miraatk.png',
      flipY: true,
      small: 24,
      normal: 32,
      big: 46,
      huge: 60,
      color: '#b78cff'
    },
    'ミラモブⅡ': {
      image: 'atk/miraatk.png',
      flipY: true,
      small: 26,
      normal: 36,
      big: 50,
      huge: 66,
      color: '#b78cff'
    },

    '番人': {
      image: 'atk/hinotama.png',
      flipY: true,
      small: 26,
      normal: 36,
      big: 52,
      huge: 68,
      color: '#ff7a35'
    },
    'モブガーディアン': {
      image: 'atk/hinotama.png',
      flipY: true,
      small: 26,
      normal: 36,
      big: 52,
      huge: 68,
      color: '#ff7a35'
    },
    '番人Ⅱ': {
      image: 'atk/hinotama.png',
      flipY: true,
      small: 28,
      normal: 40,
      big: 56,
      huge: 72,
      color: '#ff7a35'
    },
    'モブガーディアンⅡ': {
      image: 'atk/hinotama.png',
      flipY: true,
      small: 28,
      normal: 40,
      big: 56,
      huge: 72,
      color: '#ff7a35'
    },

    'ネオンモブ': {
      image: 'atk/kaminari.png',
      flipY: true,
      small: 24,
      normal: 34,
      big: 48,
      huge: 62,
      color: '#6be6ff'
    },
    'ネオンモブⅡ': {
      image: 'atk/kaminari.png',
      flipY: true,
      small: 26,
      normal: 38,
      big: 52,
      huge: 68,
      color: '#6be6ff'
    },

    'ドラゴンモブ': {
      image: 'atk/dragon.png',
      flipY: false,
      small: 30,
      normal: 42,
      big: 58,
      huge: 74,
      color: '#ff5b35'
    },
    'ドラゴンモブⅡ': {
      image: 'atk/dragon.png',
      flipY: false,
      small: 32,
      normal: 46,
      big: 64,
      huge: 82,
      color: '#ff5b35'
    },

    'モブリリス': {
      image: 'atk/atkriri.png',
      flipY: false,
      small: 28,
      normal: 38,
      big: 54,
      huge: 70,
      color: '#ff8cff'
    },
    'モブ魔王': {
      image: 'atk/atkmaoh.png',
      flipY: true,
      small: 32,
      normal: 46,
      big: 64,
      huge: 82,
      color: '#ff4aff'
    },

    'モブメイル': {
      image: 'atk/atkmeiru.png',
      flipY: false,
      small: 30,
      normal: 44,
      big: 62,
      huge: 80,
      color: '#bfc7d5'
    },
    'モブスミス': {
      image: 'atk/matrix.png',
      flipY: true,
      small: 28,
      normal: 38,
      big: 54,
      huge: 70,
      color: '#7bffea'
    },
    'モブネプ': {
      image: 'atk/atknep.png',
      flipY: true,
      small: 30,
      normal: 44,
      big: 62,
      huge: 80,
      color: '#6be6ff'
    },
    'ブルネオモブ': {
      image: 'atk/neonring.png',
      flipY: true,
      small: 28,
      normal: 40,
      big: 56,
      huge: 72,
      color: '#4bb8ff'
    },
    'パルネオモブ': {
      image: 'atk/neonring.png',
      flipY: true,
      small: 28,
      normal: 40,
      big: 56,
      huge: 72,
      color: '#b78cff'
    },
    '閻魔モブ': {
      image: 'atk/enma.png',
      flipY: true,
      small: 32,
      normal: 46,
      big: 64,
      huge: 84,
      color: '#ff3b3b'
    },
    'ウルモブリリス': {
      image: 'atk/atkriri.png',
      flipY: false,
      small: 32,
      normal: 48,
      big: 66,
      huge: 86,
      color: '#ff8cff'
    }
  };

  const MID_BOSS_CONFIG = {
    'モブプテラ': {
      shootCd: 135,
      attackCd: 190,
      moveSpeed: 1.25,
      type: 'ptera'
    },
    'モブデュアル': {
      shootCd: 125,
      attackCd: 185,
      moveSpeed: 1.55,
      type: 'dual'
    },
    'モブピー': {
      shootCd: 115,
      attackCd: 180,
      moveSpeed: 1.75,
      type: 'rapid'
    },
    'モブギドラ': {
      shootCd: 135,
      attackCd: 200,
      moveSpeed: 1.25,
      type: 'thunder'
    },
    'マグモブレム': {
      shootCd: 160,
      attackCd: 230,
      moveSpeed: 0.95,
      type: 'magma'
    },
    'グラディモブ': {
      shootCd: 140,
      attackCd: 200,
      moveSpeed: 1.45,
      type: 'blade'
    },
    'モブニコ': {
      shootCd: 145,
      attackCd: 205,
      moveSpeed: 1.35,
      type: 'normal'
    },
    'モブラス': {
      shootCd: 155,
      attackCd: 215,
      moveSpeed: 1.15,
      type: 'heavy'
    },
    'ガトリモブ': {
      shootCd: 120,
      attackCd: 190,
      moveSpeed: 1.7,
      type: 'rapid'
    },
    'ジェイモブ': {
      shootCd: 130,
      attackCd: 185,
      moveSpeed: 1.6,
      type: 'blade'
    },
    'モブサメ': {
      shootCd: 145,
      attackCd: 190,
      moveSpeed: 1.75,
      type: 'dash'
    },
    'モブシャチ': {
      shootCd: 155,
      attackCd: 215,
      moveSpeed: 1.35,
      type: 'heavy'
    },
    'モブコード': {
      shootCd: 125,
      attackCd: 190,
      moveSpeed: 1.55,
      type: 'neon'
    },
    'モブケーブル': {
      shootCd: 140,
      attackCd: 200,
      moveSpeed: 1.35,
      type: 'neon'
    },
    'モブマグシャー': {
      shootCd: 150,
      attackCd: 215,
      moveSpeed: 1.15,
      type: 'magma'
    },
    'モブガラド': {
      shootCd: 145,
      attackCd: 210,
      moveSpeed: 1.35,
      type: 'heavy'
    },
    'モブメルト': {
      shootCd: 150,
      attackCd: 220,
      moveSpeed: 1.2,
      type: 'magma'
    },
    'モブリリス': {
      shootCd: 135,
      attackCd: 200,
      moveSpeed: 1.55,
      type: 'lilith'
    }
  };

  const BOSS_CONFIG = {
    'ホークモブ': {
      shootCd: 150,
      attackCd: 240,
      moveSpeed: 1.35,
      type: 'hawk'
    },
    'ホークモブⅡ': {
      shootCd: 140,
      attackCd: 225,
      moveSpeed: 1.5,
      type: 'hawk'
    },

    'ミラモブ': {
      shootCd: 145,
      attackCd: 235,
      moveSpeed: 1.75,
      type: 'mira'
    },
    'ミラモブⅡ': {
      shootCd: 135,
      attackCd: 220,
      moveSpeed: 1.9,
      type: 'mira'
    },

    '番人': {
      shootCd: 165,
      attackCd: 250,
      moveSpeed: 1.1,
      type: 'guardian'
    },
    '番人Ⅱ': {
      shootCd: 150,
      attackCd: 235,
      moveSpeed: 1.2,
      type: 'guardian'
    },
    'モブガーディアン': {
      shootCd: 165,
      attackCd: 250,
      moveSpeed: 1.1,
      type: 'guardian'
    },
    'モブガーディアンⅡ': {
      shootCd: 150,
      attackCd: 235,
      moveSpeed: 1.2,
      type: 'guardian'
    },

    'ネオンモブ': {
      shootCd: 140,
      attackCd: 235,
      moveSpeed: 1.85,
      type: 'neon'
    },
    'ネオンモブⅡ': {
      shootCd: 130,
      attackCd: 220,
      moveSpeed: 2.0,
      type: 'neon'
    },

    'ドラゴンモブ': {
      shootCd: 160,
      attackCd: 250,
      moveSpeed: 1.2,
      type: 'dragon'
    },
    'ドラゴンモブⅡ': {
      shootCd: 145,
      attackCd: 235,
      moveSpeed: 1.35,
      type: 'dragon'
    },

    'モブリリス': {
      shootCd: 145,
      attackCd: 230,
      moveSpeed: 1.65,
      type: 'lilith'
    },
    'モブ魔王': {
      shootCd: 145,
      attackCd: 235,
      moveSpeed: 1.45,
      type: 'maoh'
    },

    'モブメイル': {
      shootCd: 155,
      attackCd: 245,
      moveSpeed: 1.25,
      type: 'mail'
    },
    'モブスミス': {
      shootCd: 145,
      attackCd: 230,
      moveSpeed: 1.9,
      type: 'smith'
    },
    'モブネプ': {
      shootCd: 155,
      attackCd: 245,
      moveSpeed: 1.45,
      type: 'nep'
    },

    'ブルネオモブ': {
      shootCd: 140,
      attackCd: 235,
      moveSpeed: 2.0,
      type: 'blueNeo'
    },
    'パルネオモブ': {
      shootCd: 140,
      attackCd: 235,
      moveSpeed: 2.0,
      type: 'purpleNeo'
    },

    '閻魔モブ': {
      shootCd: 155,
      attackCd: 250,
      moveSpeed: 1.35,
      type: 'enma'
    },

    'ウルモブリリス': {
      shootCd: 140,
      attackCd: 230,
      moveSpeed: 1.7,
      type: 'ultraLilith'
    }
  };

  function getAttackSpec(name){
    return BOSS_ATTACKS[name] || {
      image: 'atk/hawkatk.png',
      flipY: true,
      small: 26,
      normal: 34,
      big: 48,
      huge: 62,
      color: '#ff4aff'
    };
  }

  function getMidBossConfig(name){
    return MID_BOSS_CONFIG[name] || {
      shootCd: 140,
      attackCd: 205,
      moveSpeed: 1.25,
      type: 'normal'
    };
  }

  function getBossConfig(name){
    return BOSS_CONFIG[name] || {
      shootCd: 155,
      attackCd: 245,
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
    getAttackSpec,
    getMidBossConfig,
    getBossConfig,
    isStrongBossName
  };
})();
