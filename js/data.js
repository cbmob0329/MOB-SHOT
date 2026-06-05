'use strict';

window.MOBSHOT_DATA = {
  stage: {
    id: '1-1',
    name: '草原 1-1',
    areaType: '草原',
    difficulty: 'イージー',
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
    { type: 'power', label: 'パワーアップ', value: 1, weight: 8, image: 'mt/gatepower1.png', color: '#ff574a' },
    { type: 'range', label: '射程距離+1', value: 1, weight: 8, image: 'mt/gaterage1.png', color: '#4bb8ff' },
    { type: 'rapid', label: '連射速度+1', value: 1, weight: 8, image: 'mt/gaterapid1.png', color: '#ff9c2a' },
    { type: 'life', label: 'ライフ回復+5', value: 5, weight: 3, image: 'mt/gatelife5.png', color: '#52e66b' },
    { type: 'cooldown', label: 'スキルクールダウン-1秒', value: 1, weight: 1.2, image: 'mt/gatecd.png', color: '#b78cff' },
    { type: 'wide', label: 'ワイド+1', value: 1, weight: 0.05, rare: true, image: 'mt/gatewide.png', color: '#a85cff' },
    { type: 'wide', label: 'WIDE+2', value: 2, weight: 0.02, rare: true, minRank: 20, image: 'mt/gatewide2.png', color: '#a85cff' },
    { type: 'skillmax', label: 'SKILL MAX', value: 1, weight: 0.02, rare: true, minRank: 20, image: 'mt/gateskillmax.png', color: '#ffe66b' }
  ],

  enemies: {
    zako: [
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
        hp: 5,
        score: 10,
        coinMin: 2,
        coinMax: 5
      }
    ],

    midBoss: [
      {
        name: 'モブプテラ',
        image: 'en/enpte.png',
        hp: 100,
        score: 100,
        coin: 30
      }
    ],

    boss: {
      name: 'ホークモブ',
      image: 'boss/hawks.png',
      hp: 500,
      score: 500,
      coin: 100
    }
  },

  gimmicks: [
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

  chests: [
    {
      name: '宝箱銀',
      image: 'gimi/takagin.png',
      hp: 4,
      score: 20,
      coinMin: 10,
      coinMax: 20,
      weight: 8
    },
    {
      name: '宝箱金',
      image: 'gimi/takagol.png',
      hp: 6,
      score: 40,
      coinMin: 20,
      coinMax: 40,
      weight: 2
    }
  ]
};
