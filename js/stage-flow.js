'use strict';

(function(){
  class MobShotStageFlow {
    constructor(){
      this.reset();
    }

    reset(){
      this.phase = 'idle';
      this.phaseFrame = 0;
      this.area = 0;
      this.gate = 0;
      this.midBoss = 0;
      this.boss = 0;
      this.step = 0;

      this.steps = [
        { type:'areaStart', text:'AREA 1' },
        { type:'gateStart', text:'GATE 1' },
        { type:'areaStart', text:'AREA 2' },
        { type:'gateStart', text:'GATE 2' },
        { type:'midBossStart', text:'中ボス出現！' },

        { type:'areaStart', text:'AREA 3' },
        { type:'gateStart', text:'GATE 3' },
        { type:'areaStart', text:'AREA 4' },
        { type:'gateStart', text:'GATE 4' },
        { type:'midBossStart', text:'中ボス出現！' },

        { type:'areaStart', text:'AREA 5' },
        { type:'gateStart', text:'GATE 5' },
        { type:'areaStart', text:'AREA 6' },
        { type:'gateStart', text:'GATE 6' },
        { type:'bossStart', text:'BOSS 出現！' }
      ];
    }

    start(){
      this.step = 0;
      return this.nextStep();
    }

    update(){
      this.phaseFrame++;
    }

    snapshot(){
      return {
        phase: this.phase,
        phaseFrame: this.phaseFrame,
        area: this.area,
        gate: this.gate,
        midBoss: this.midBoss,
        boss: this.boss
      };
    }

    nextStep(){
      const ev = this.steps[this.step];

      if (!ev) {
        this.phase = 'clear';
        this.phaseFrame = 0;
        return { type:'clear', text:'CLEAR!' };
      }

      this.step++;
      this.phaseFrame = 0;

      if (ev.type === 'areaStart') {
        this.phase = 'area';
        this.area++;
      }

      if (ev.type === 'gateStart') {
        this.phase = 'gate';
        this.gate++;
      }

      if (ev.type === 'midBossStart') {
        this.phase = 'midBoss';
        this.midBoss++;
      }

      if (ev.type === 'bossStart') {
        this.phase = 'boss';
        this.boss++;
      }

      return ev;
    }

    completeArea(){
      return this.nextStep();
    }

    completeGate(){
      return this.nextStep();
    }

    completeMidBoss(){
      return this.nextStep();
    }

    completeBoss(){
      return this.nextStep();
    }
  }

  window.MobShotStageFlow = MobShotStageFlow;
})();
