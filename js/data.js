'use strict';

window.MOBSHOT_DATA = {
  stage: {
    id: '1-1',
    name: '草原 1-1',
    areaType: 'grass',
    background: 'sta/backsougen.png'
  },

  player: {
    image: 'play/playpink.png',
    menuImage: 'play/playpink2.png',
    bulletImage: 'mt/atk.png',
    maxHp: 50,
    power: 1,
    range: 3,
    wide: 1,
    attackSpeed: 1
  },

  menu: {
    title: 'mt/menutitle.png',
    sortie: 'mt/menusta.png',
    shop: 'mt/menushop.png',
    equip: 'mt/menusoubi.png',
    pet: 'mt/menupet.png',
    gacha: 'mt/menugacha.png',
    mission: 'mt/menumission.png',
    collection: 'mt/menucolle.png'
  },

  hud: {
    stage: 'mt/stagestage.png',
    score: 'mt/stagescore.png',
    coin: 'mt/stagecoin.png',
    life: 'mt/stagelife.png'
  },

  gates: [
    {
      type: 'power',
      label: 'POWER +1',
      value: 1,
      weight: 8,
      image: 'mt/gatepower1.png',
      color: '#ff574a'
    },
    {
      type: 'power',
      label: 'POWER +2',
      value: 2,
      weight: 1.2,
      minRank: 5,
      image: 'mt/getepower2.png',
      color: '#ff574a'
    },
    {
      type: 'power',
      label: 'POWER +3',
      value: 3,
      weight: 0.55,
      minRank: 10,
      image: 'mt/getepower3.png',
      color: '#ff574a'
    },
    {
      type: 'range',
      label: 'RANGE +1',
      value: 1,
      weight: 8,
      image: 'mt/gaterage1.png',
      color: '#4bb8ff'
    },
    {
      type: 'range',
      label: 'RANGE +2',
      value: 2,
      weight: 1.2,
      minRank: 5,
      image: 'mt/gaterage2.png',
      color: '#4bb8ff'
    },
    {
      type: 'range',
      label: 'RANGE +3',
      value: 3,
      weight: 0.55,
      minRank: 10,
      image: 'mt/gaterage3.png',
      color: '#4bb8ff'
    },
    {
      type: 'rapid',
      label: 'RAPID +1',
      value: 1,
      weight: 8,
      image: 'mt/gaterapid1.png',
      color: '#ff9c2a'
    },
    {
      type: 'life',
      label: 'LIFE +5',
      value: 5,
      weight: 3,
      image: 'mt/gatelife5.png',
      color: '#52e66b'
    },
    {
      type: 'life',
      label: 'LIFE +15',
      value: 15,
      weight: 1,
      minRank: 5,
      image: 'mt/gatelife15.png',
      color: '#52e66b'
    },
    {
      type: 'life',
      label: 'LIFE +30',
      value: 30,
      weight: 0.5,
      minRank: 10,
      image: 'mt/gatelife30.png',
      color: '#52e66b'
    },
    {
      type: 'cooldown',
      label: 'CD -1',
      value: 1,
      weight: 1,
      image: 'mt/gatecd.png',
      color: '#b78cff'
    },
    {
      type: 'wide',
      label: 'WIDE +1',
      value: 1,
      weight: 0.05,
      rare: true,
      image: 'mt/gatewide.png',
      color: '#a85cff'
    },
    {
      type: 'wide',
      label: 'WIDE +2',
      value: 2,
      weight: 0.02,
      rare: true,
      minRank: 20,
      image: 'mt/gatewide2.png',
      color: '#a85cff'
    },
    {
      type: 'skillmax',
      label: 'SKILL MAX',
      value: 1,
      weight: 0.02,
      rare: true,
      minRank: 20,
      image: 'mt/gateskillmax.png',
      color: '#ffe66b'
    }
  ],

  enemiesByArea: {
    grass: [
      {
        name: 'スラモブ',
        image: 'en/sra.png',
        hp: 5,
        score: 10,
        coinMin: 2,
        coinMax: 5
      },
      {
        name: 'モブロック',
        image: 'en/eniwa.png',
        hp: 7,
        score: 12,
        coinMin: 2,
        coinMax: 5
      }
    ],

    desert: [
      {
        name: 'モブ盗賊',
        image: 'en/entozok.png',
        hp: 8,
        score: 14,
        coinMin: 2,
        coinMax: 6
      },
      {
        name: 'モブドワーフ',
        image: 'en/endowa.png',
        hp: 10,
        score: 16,
        coinMin: 3,
        coinMax: 6
      }
    ],

    country: [
      {
        name: 'モブバード',
        image: 'en/enwasi.png',
        hp: 11,
        score: 18,
        coinMin: 3,
        coinMax: 7
      },
      {
        name: 'モブファル',
        image: 'en/iwakofal.png',
        hp: 12,
        score: 20,
        coinMin: 3,
        coinMax: 7
      }
    ],

    neon: [
      {
        name: 'ナーガモブ',
        image: 'en/ennarga.png',
        hp: 14,
        score: 24,
        coinMin: 4,
        coinMax: 8
      },
      {
        name: 'モブグリズリー',
        image: 'en/enguri.png',
        hp: 18,
        score: 28,
        coinMin: 4,
        coinMax: 9
      }
    ],

    magma: [
      {
        name: 'モブマグトカゲ',
        image: 'en/enmagtokage.png',
        hp: 20,
        score: 32,
        coinMin: 5,
        coinMax: 10
      },
      {
        name: 'モブマグプテラ',
        image: 'en/enmagpte.png',
        hp: 22,
        score: 36,
        coinMin: 5,
        coinMax: 10
      }
    ],

    demon: [
      {
        name: 'ダークゴブモブ',
        image: 'en/enmaogob.png',
        hp: 25,
        score: 42,
        coinMin: 6,
        coinMax: 12
      },
      {
        name: 'モブアサシン',
        image: 'en/enasa.png',
        hp: 28,
        score: 48,
        coinMin: 6,
        coinMax: 12
      }
    ]
  },

  midBossByArea: {
    grass: {
      name: 'モブプテラ',
      image: 'en/enpte.png',
      hp: 100,
      score: 100,
      coin: 30
    },
    desert: {
      name: 'モブデュアル',
      image: 'en/sabadual.png',
      hp: 120,
      score: 120,
      coin: 35
    },
    country: {
      name: 'モブピー',
      image: 'en/enmobpi.png',
      hp: 140,
      score: 140,
      coin: 40
    },
    neon: {
      name: 'モブギドラ',
      image: 'en/neongidra.png',
      hp: 160,
      score: 160,
      coin: 45
    },
    magma: {
      name: 'マグモブレム',
      image: 'en/enmaggolem.png',
      hp: 180,
      score: 180,
      coin: 50
    },
    demon: {
      name: 'グラディモブ',
      image: 'en/mobgra.png',
      hp: 200,
      score: 200,
      coin: 60
    }
  },

  bossByArea: {
    grass: {
      name: 'ホークモブ',
      image: 'boss/hawks.png',
      hp: 500,
      score: 500,
      coin: 100
    },
    desert: {
      name: 'ミラモブ',
      image: 'boss/miraboss.png',
      hp: 600,
      score: 600,
      coin: 120
    },
    country: {
      name: '番人',
      image: 'boss/bossban.png',
      hp: 700,
      score: 700,
      coin: 140
    },
    neon: {
      name: 'ネオンモブ',
      image: 'boss/bossneon.png',
      hp: 800,
      score: 800,
      coin: 160
    },
    magma: {
      name: 'ドラゴンモブ',
      image: 'boss/bossdragoon.png',
      hp: 900,
      score: 900,
      coin: 180
    },
    demon: {
      name: 'モブリリス',
      image: 'boss/bossriris.png',
      hp: 1000,
      score: 1000,
      coin: 200
    }
  },

  strongBossByArea: {
    grass: {
      name: 'ホークモブⅡ',
      image: 'boss/hawks2.png',
      hp: 900,
      score: 900,
      coin: 180
    },
    desert: {
      name: 'ミラモブⅡ',
      image: 'boss/bossmira2.png',
      hp: 1000,
      score: 1000,
      coin: 200
    },
    country: {
      name: '番人Ⅱ',
      image: 'boss/bossban2.png',
      hp: 1100,
      score: 1100,
      coin: 220
    },
    neon: {
      name: 'ネオンモブⅡ',
      image: 'boss/bossneon2.png',
      hp: 1200,
      score: 1200,
      coin: 240
    },
    magma: {
      name: 'ドラゴンモブⅡ',
      image: 'boss/bossdragoon2.png',
      hp: 1300,
      score: 1300,
      coin: 260
    },
    demon: {
      name: 'モブ魔王',
      image: 'boss/bossmaoh.png',
      hp: 1500,
      score: 1500,
      coin: 300
    }
  },

  gimmicksByArea: {
    grass: [
      {
        name: '木箱',
        image: 'gimi/gimihako.png',
        hp: 8,
        score: 10,
        coinMin: 2,
        coinMax: 4
      },
      {
        name: '看板',
        image: 'gimi/gimikan.png',
        hp: 10,
        score: 12,
        coinMin: 2,
        coinMax: 5
      },
      {
        name: '丸岩',
        image: 'gimi/gimiiwa.png',
        hp: 14,
        score: 16,
        coinMin: 3,
        coinMax: 6
      }
    ],

    desert: [
      {
        name: '樽',
        image: 'gimi/gimitaru.png',
        hp: 10,
        score: 12,
        coinMin: 2,
        coinMax: 5
      },
      {
        name: '砂漠の岩',
        image: 'gimi/gimisabakiwa.png',
        hp: 16,
        score: 18,
        coinMin: 3,
        coinMax: 6
      },
      {
        name: '銅の箱',
        image: 'gimi/gimidou.png',
        hp: 20,
        score: 22,
        coinMin: 4,
        coinMax: 8
      }
    ],

    country: [
      {
        name: '自転車',
        image: 'gimi/gimichari.png',
        hp: 12,
        score: 14,
        coinMin: 3,
        coinMax: 6
      },
      {
        name: 'タイヤ',
        image: 'gimi/gimitaiya.png',
        hp: 15,
        score: 18,
        coinMin: 3,
        coinMax: 7
      },
      {
        name: '自販機',
        image: 'gimi/gimihan.png',
        hp: 24,
        score: 28,
        coinMin: 5,
        coinMax: 10
      }
    ],

    neon: [
      {
        name: 'ネオンスピーカー',
        image: 'gimi/gimineonspi.png',
        hp: 22,
        score: 26,
        coinMin: 5,
        coinMax: 10
      },
      {
        name: 'ネオンレコード',
        image: 'gimi/gimineonreco.png',
        hp: 28,
        score: 34,
        coinMin: 6,
        coinMax: 12
      },
      {
        name: 'ネオン噴水',
        image: 'gimi/neonhunsui.png',
        hp: 36,
        score: 44,
        coinMin: 8,
        coinMax: 15
      }
    ],

    magma: [
      {
        name: 'マグマ',
        image: 'gimi/gimimag.png',
        hp: 24,
        score: 30,
        coinMin: 6,
        coinMax: 12
      },
      {
        name: 'マグマ岩柱',
        image: 'gimi/gimimaghasi.png',
        hp: 32,
        score: 40,
        coinMin: 7,
        coinMax: 14
      },
      {
        name: 'マグマスピーカー',
        image: 'gimi/gimimagspi.png',
        hp: 38,
        score: 48,
        coinMin: 8,
        coinMax: 16
      }
    ],

    demon: [
      {
        name: '石像',
        image: 'gimi/gimiseki.png',
        hp: 28,
        score: 36,
        coinMin: 7,
        coinMax: 14
      },
      {
        name: '魔王の卵',
        image: 'gimi/gimimaotama.png',
        hp: 34,
        score: 44,
        coinMin: 8,
        coinMax: 16
      },
      {
        name: '魔王の箱',
        image: 'gimi/gimimao.png',
        hp: 42,
        score: 54,
        coinMin: 10,
        coinMax: 20
      }
    ]
  },

  chests: [
    {
      name: '宝箱銀',
      image: 'gimi/takagin.png',
      hp: 4,
      score: 20,
      coinMin: 10,
      coinMax: 20
    },
    {
      name: '宝箱金',
      image: 'gimi/takagol.png',
      hp: 6,
      score: 40,
      coinMin: 20,
      coinMax: 40
    }
  ]
};

(function normalizeCurrentStageData(){
  const D = window.MOBSHOT_DATA;
  const area = D.stage.areaType || 'grass';

  D.enemies = {
    zako: D.enemiesByArea[area] || D.enemiesByArea.grass,
    midBoss: D.midBossByArea[area] || D.midBossByArea.grass,
    boss: D.bossByArea[area] || D.bossByArea.grass
  };

  D.gimmicks = D.gimmicksByArea[area] || D.gimmicksByArea.grass;
})();
