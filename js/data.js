'use strict';

window.MOBSHOT_DATA = {
  player: {
    maxHp: 50,
    power: 1,
    range: 3,
    wide: 1,
    attackSpeed: 1.0,
    image: 'play/playpink.png',
    bulletImage: 'mt/atk.png'
  },
  stage: {
    id: '1-1',
    name: '草原 1-1',
    background: 'sta/backsougen.png'
  },
  enemies: {
    zako: [
      { name: 'スラモブ', image: 'en/sra.png', hp: 5, score: 10, coinMin: 2, coinMax: 5 },
      { name: 'モブロック', image: 'en/eniwa.png', hp: 6, score: 12, coinMin: 2, coinMax: 5 }
    ],
    midBoss: { name: 'モブプテラ', image: 'en/enpte.png', hp: 100, score: 100, coin: 30 },
    boss: { name: 'ホークモブ', image: 'boss/hawks.png', hp: 500, score: 500, coin: 100 }
  },
  gimmicks: [
    { name: '木箱', image: 'gimi/gimihako.png', hp: 12, score: 8, coinMin: 1, coinMax: 3 },
    { name: '樽', image: 'gimi/gimitaru.png', hp: 18, score: 12, coinMin: 2, coinMax: 4 },
    { name: '看板', image: 'gimi/gimikan.png', hp: 22, score: 16, coinMin: 2, coinMax: 5 }
  ],
  chests: [
    { name: '宝箱銀', image: 'gimi/takagin.png', hp: 10, score: 12, coinMin: 6, coinMax: 12 },
    { name: '宝箱金', image: 'gimi/takagol.png', hp: 14, score: 18, coinMin: 12, coinMax: 22 }
  ],
  gates: [
    { label: 'POWER+1', type: 'power', value: 1, color: '#ff5b4b', image: 'mt/gatepower1.png', weight: 1 },
    { label: 'RANGE+1', type: 'range', value: 1, color: '#49c8ff', image: 'mt/gaterage1.png', weight: 1 },
    { label: 'RAPID+1', type: 'rapid', value: 1, color: '#ff9b2c', image: 'mt/gaterapid1.png', weight: 1 },
    { label: 'LIFE+5', type: 'life', value: 5, color: '#54e96a', image: 'mt/gatelife5.png', weight: 0.35 },
    { label: 'WIDE+1', type: 'wide', value: 1, color: '#a864ff', image: 'mt/gatewide.png', rare: true, weight: 0.04 }
  ]
};
