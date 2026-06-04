'use strict';

class MobShotStageFlow {
  constructor() {
    this.reset();
  }

  reset() {
    this.phase = 'start';
    this.area = 0;
    this.gate = 0;
    this.midBoss = 0;
    this.done = false;
    this.timer = 0;
    this.phaseFrame = 0;
    return this.snapshot();
  }

  snapshot() {
    return {
      phase: this.phase,
      area: this.area,
      gate: this.gate,
      midBoss: this.midBoss,
      done: this.done,
      phaseFrame: this.phaseFrame
    };
  }

  start() {
    this.phase = 'area';
    this.area = 1;
    this.gate = 0;
    this.midBoss = 0;
    this.done = false;
    this.phaseFrame = 0;
    return { type: 'areaStart', area: 1, text: 'AREA 1' };
  }

  update() {
    this.timer++;
    this.phaseFrame++;
    return null;
  }

  completeArea() {
    if (this.phase !== 'area') return null;
    this.phase = 'gate';
    this.gate = this.area;
    this.phaseFrame = 0;
    return { type: 'gateStart', gate: this.gate, text: `GATE ${this.gate}` };
  }

  completeGate() {
    if (this.phase !== 'gate') return null;

    if (this.gate === 3 || this.gate === 6) {
      this.phase = 'midBoss';
      this.midBoss = this.gate === 3 ? 1 : 2;
      this.phaseFrame = 0;
      return { type: 'midBossStart', midBoss: this.midBoss, text: `CHECKPOINT BOSS ${this.midBoss}` };
    }

    if (this.gate === 9) {
      this.phase = 'boss';
      this.phaseFrame = 0;
      return { type: 'bossStart', text: 'BOSS' };
    }

    this.area += 1;
    this.phase = 'area';
    this.phaseFrame = 0;
    return { type: 'areaStart', area: this.area, text: `AREA ${this.area}` };
  }

  completeMidBoss() {
    if (this.phase !== 'midBoss') return null;
    this.area += 1;
    this.phase = 'area';
    this.phaseFrame = 0;
    return { type: 'areaStart', area: this.area, text: `AREA ${this.area}` };
  }

  completeBoss() {
    if (this.phase !== 'boss') return null;
    this.phase = 'clear';
    this.done = true;
    this.phaseFrame = 0;
    return { type: 'clear', text: 'STAGE CLEAR' };
  }
}

window.MobShotStageFlow = MobShotStageFlow;
