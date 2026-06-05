'use strict';

window.MobShotStorage = {
  key: 'mobshot_split_v1',
  defaultData() {
    return { diamond: 0, rank: 1, coin: 10000, totalScore: 0, bestScore: 0 };
  },
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? { ...this.defaultData(), ...JSON.parse(raw) } : this.defaultData();
    } catch (e) {
      return this.defaultData();
    }
  },
  save(data) {
    try { localStorage.setItem(this.key, JSON.stringify(data)); } catch (e) {}
  },
  addRunResult(score, coin) {
    const data = this.load();
    data.coin += coin;
    data.totalScore += score;
    data.bestScore = Math.max(data.bestScore || 0, score);
    data.rank = this.calcRank(data.totalScore);
    this.save(data);
    return data;
  },
  calcRank(totalScore) {
    const table = [
      [1500000, 10], [800000, 9], [400000, 8], [200000, 7], [100000, 6],
      [50000, 5], [30000, 4], [12500, 3], [5000, 2]
    ];
    for (const [score, rank] of table) if (totalScore >= score) return rank;
    return 1;
  }
};
