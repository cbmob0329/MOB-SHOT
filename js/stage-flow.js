'use strict';

(function(){
  const AREA_DATA = {
    grass: {
      areaNo: 1,
      name: '草原',
      background: 'sta/backsougen.png',
      zako: [
        { name:'スラモブ', image:'en/sra.png', hp:5, score:20, coinMin:1, coinMax:2 },
        { name:'モブロック', image:'en/eniwa.png', hp:8, score:30, coinMin:1, coinMax:3 }
      ],
      midBoss: [
        { name:'モブプテラ', image:'en/enpte.png', hp:80, score:300, coin:30 }
      ],
      boss: { name:'ホークモブ', image:'boss/hawks.png', hp:220, score:1000, coin:120 },
      strongBoss: { name:'ホークモブⅡ', image:'boss/hawks2.png', hp:420, score:2500, coin:300 },
      gimmicks: [
        { name:'木箱', image:'gimi/gimihako.png', hp:5, score:10, coinMin:1, coinMax:2 },
        { name:'看板', image:'gimi/gimikan.png', hp:8, score:15, coinMin:1, coinMax:3 },
        { name:'丸岩', image:'gimi/gimiiwa.png', hp:12, score:20, coinMin:2, coinMax:4 }
      ]
    },

    desert: {
      areaNo: 2,
      name: '砂漠',
      background: 'sta/backsabaku.png',
      zako: [
        { name:'モブ盗賊', image:'en/entozok.png', hp:10, score:40, coinMin:2, coinMax:4 },
        { name:'モブドワーフ', image:'en/endowa.png', hp:13, score:50, coinMin:2, coinMax:5 }
      ],
      midBoss: [
        { name:'モブデュアル', image:'en/sabadual.png', hp:120, score:450, coin:45 }
      ],
      boss: { name:'ミラモブ', image:'boss/miraboss.png', hp:300, score:1300, coin:160 },
      strongBoss: { name:'ミラモブⅡ', image:'boss/bossmira2.png', hp:560, score:3000, coin:380 },
      gimmicks: [
        { name:'樽', image:'gimi/gimitaru.png', hp:10, score:20, coinMin:2, coinMax:4 },
        { name:'砂漠の岩', image:'gimi/gimisabakiwa.png', hp:16, score:30, coinMin:2, coinMax:5 },
        { name:'銅の箱', image:'gimi/gimidou.png', hp:22, score:40, coinMin:3, coinMax:6 }
      ]
    },

    town: {
      areaNo: 3,
      name: '田舎町',
      background: 'sta/backumi.png',
      zako: [
        { name:'モブバード', image:'en/enwasi.png', hp:15, score:60, coinMin:3, coinMax:6 },
        { name:'モブファル', image:'en/iwakofal.png', hp:18, score:70, coinMin:3, coinMax:7 }
      ],
      midBoss: [
        { name:'モブピー', image:'en/enmobpi.png', hp:160, score:600, coin:60 }
      ],
      boss: { name:'番人', image:'boss/bossban.png', hp:390, score:1600, coin:200 },
      strongBoss: { name:'番人Ⅱ', image:'boss/bossban2.png', hp:720, score:3600, coin:460 },
      gimmicks: [
        { name:'自転車', image:'gimi/gimichari.png', hp:18, score:35, coinMin:3, coinMax:6 },
        { name:'タイヤ', image:'gimi/gimitaiya.png', hp:20, score:38, coinMin:3, coinMax:7 },
        { name:'自販機', image:'gimi/gimihan.png', hp:30, score:55, coinMin:4, coinMax:8 }
      ]
    },

    neon: {
      areaNo: 4,
      name: 'ネオン街',
      background: 'sta/backneon.png',
      zako: [
        { name:'ナーガモブ', image:'en/ennarga.png', hp:22, score:85, coinMin:4, coinMax:8 },
        { name:'モブグリズリー', image:'en/enguri.png', hp:28, score:100, coinMin:4, coinMax:9 }
      ],
      midBoss: [
        { name:'モブギドラ', image:'en/neongidra.png', hp:220, score:800, coin:80 }
      ],
      boss: { name:'ネオンモブ', image:'boss/bossneon.png', hp:500, score:2000, coin:260 },
      strongBoss: { name:'ネオンモブⅡ', image:'boss/bossneon2.png', hp:900, score:4300, coin:560 },
      gimmicks: [
        { name:'ネオンスピーカー', image:'gimi/gimineonspi.png', hp:34, score:60, coinMin:5, coinMax:10 },
        { name:'ネオンレコード', image:'gimi/gimineonreco.png', hp:42, score:75, coinMin:6, coinMax:12 },
        { name:'ネオン噴水', image:'gimi/neonhunsui.png', hp:55, score:100, coinMin:8, coinMax:16 }
      ]
    },

    magma: {
      areaNo: 5,
      name: 'マグマ',
      background: 'sta/backmagma.png',
      zako: [
        { name:'モブマグトカゲ', image:'en/enmagtokage.png', hp:32, score:120, coinMin:5, coinMax:11 },
        { name:'モブマグプテラ', image:'en/enmagpte.png', hp:38, score:140, coinMin:6, coinMax:12 }
      ],
      midBoss: [
        { name:'マグモブレム', image:'en/enmaggolem.png', hp:300, score:1050, coin:110 }
      ],
      boss: { name:'ドラゴンモブ', image:'boss/bossdragoon.png', hp:660, score:2600, coin:340 },
      strongBoss: { name:'ドラゴンモブⅡ', image:'boss/bossdragoon2.png', hp:1150, score:5200, coin:680 },
      gimmicks: [
        { name:'マグマ', image:'gimi/gimimag.png', hp:44, score:80, coinMin:6, coinMax:13 },
        { name:'マグマ岩柱', image:'gimi/gimimaghasi.png', hp:55, score:100, coinMin:8, coinMax:16 },
        { name:'マグマスピーカー', image:'gimi/gimimagspi.png', hp:66, score:120, coinMin:9, coinMax:18 }
      ]
    },

    castle: {
      areaNo: 6,
      name: '魔王城',
      background: 'sta/backmao.png',
      zako: [
        { name:'ダークゴブモブ', image:'en/enmaogob.png', hp:44, score:160, coinMin:7, coinMax:14 },
        { name:'モブアサシン', image:'en/enasa.png', hp:50, score:180, coinMin:8, coinMax:16 }
      ],
      midBoss: [
        { name:'グラディモブ', image:'en/mobgra.png', hp:400, score:1350, coin:140 }
      ],
      boss: { name:'モブリリス', image:'boss/bossriris.png', hp:820, score:3200, coin:420 },
      strongBoss: { name:'モブ魔王', image:'boss/bossmaoh.png', hp:1500, score:6500, coin:900 },
      gimmicks: [
        { name:'石像', image:'gimi/gimiseki.png', hp:60, score:110, coinMin:8, coinMax:16 },
        { name:'魔王の卵', image:'gimi/gimimaotama.png', hp:76, score:150, coinMin:10, coinMax:20 },
        { name:'魔王の箱', image:'gimi/gimimao.png', hp:90, score:180, coinMin:12, coinMax:24 }
      ]
    }
  };

  const CHESTS = [
    { name:'銀の宝箱', image:'gimi/takagin.png', hp:10, score:80, coinMin:10, coinMax:25 },
    { name:'金の宝箱', image:'gimi/takagol.png', hp:18, score:160, coinMin:25, coinMax:60 }
  ];

  function clone(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  function difficultyScale(stageNo){
    stageNo = Number(stageNo || 1);
    return 1 + Math.max(0, stageNo - 1) * 0.18;
  }

  function getStageInfo(){
    if (window.MobShotStorage && window.MobShotStorage.getCurrentStage) {
      return window.MobShotStorage.getCurrentStage();
    }

    return {
      areaIndex: 0,
      areaKey: 'grass',
      areaNo: 1,
      areaName: '草原',
      stageNo: 1,
      id: '1-1',
      isStrongBoss: false,
      difficulty: 'EASY'
    };
  }

  function buildScaledList(list, scale){
    return list.map(item => {
      const copy = clone(item);

      copy.hp = Math.ceil(Number(copy.hp || 1) * scale);
      copy.score = Math.ceil(Number(copy.score || 0) * scale);
      copy.coinMin = Math.ceil(Number(copy.coinMin || 1) * scale);
      copy.coinMax = Math.ceil(Number(copy.coinMax || copy.coinMin || 1) * scale);

      if (copy.coin != null) {
        copy.coin = Math.ceil(Number(copy.coin || 0) * scale);
      }

      return copy;
    });
  }

  function buildScaledBoss(boss, scale, strong){
    const copy = clone(boss);

    copy.hp = Math.ceil(Number(copy.hp || 1) * scale * (strong ? 1.35 : 1));
    copy.score = Math.ceil(Number(copy.score || 0) * scale * (strong ? 1.25 : 1));
    copy.coin = Math.ceil(Number(copy.coin || 0) * scale * (strong ? 1.25 : 1));
    copy.strong = !!strong;

    return copy;
  }

  function applyStageToData(){
    const D = window.MOBSHOT_DATA;

    if (!D) return getStageInfo();

    const info = getStageInfo();
    const area = AREA_DATA[info.areaKey] || AREA_DATA.grass;
    const scale = difficultyScale(info.stageNo);

    D.stage = Object.assign(D.stage || {}, {
      id: info.id,
      areaKey: info.areaKey,
      areaName: info.areaName,
      areaNo: info.areaNo,
      stageNo: info.stageNo,
      difficulty: info.difficulty,
      background: area.background,
      isStrongBoss: info.isStrongBoss
    });

    D.enemies = D.enemies || {};
    D.enemies.zako = buildScaledList(area.zako, scale);
    D.enemies.midBoss = buildScaledList(area.midBoss, scale);
    D.enemies.boss = buildScaledBoss(
      info.isStrongBoss ? area.strongBoss : area.boss,
      scale,
      info.isStrongBoss
    );

    D.gimmicks = buildScaledList(area.gimmicks, scale);
    D.chests = buildScaledList(CHESTS, scale);

    return info;
  }

  function MobShotStageFlow(){
    this.reset();
  }

  MobShotStageFlow.prototype.reset = function(){
    this.phase = 'idle';
    this.phaseFrame = 0;
    this.area = 0;
    this.gate = 0;
    this.midBoss = 0;
    this.boss = 0;
    this.finished = false;
    this.stageInfo = applyStageToData();
  };

  MobShotStageFlow.prototype.start = function(){
    this.reset();
    this.phase = 'area';
    this.phaseFrame = 0;
    this.area = 1;

    return {
      type: 'areaStart',
      text: `${this.stageInfo.areaName} ${this.stageInfo.id}`
    };
  };

  MobShotStageFlow.prototype.update = function(){
    this.phaseFrame++;
  };

  MobShotStageFlow.prototype.snapshot = function(){
    return {
      phase: this.phase,
      phaseFrame: this.phaseFrame,
      area: this.area,
      gate: this.gate,
      midBoss: this.midBoss,
      boss: this.boss,
      finished: this.finished,
      stageInfo: this.stageInfo
    };
  };

  MobShotStageFlow.prototype.setPhase = function(phase){
    this.phase = phase;
    this.phaseFrame = 0;
  };

  MobShotStageFlow.prototype.completeArea = function(){
    if (this.area <= 3) {
      this.gate++;
      this.setPhase('gate');

      return {
        type: 'gateStart',
        text: 'GATE!'
      };
    }

    this.boss++;
    this.setPhase('boss');

    return {
      type: 'bossStart',
      text: this.stageInfo.isStrongBoss ? '強力ボス出現！' : 'BOSS!'
    };
  };

  MobShotStageFlow.prototype.completeGate = function(){
    if (this.gate === 2 || this.gate === 3) {
      this.midBoss++;
      this.setPhase('midBoss');

      return {
        type: 'midBossStart',
        text: '中ボス出現！'
      };
    }

    this.area++;
    this.setPhase('area');

    return {
      type: 'areaStart',
      text: `AREA ${this.area}`
    };
  };

  MobShotStageFlow.prototype.completeMidBoss = function(){
    this.area++;
    this.setPhase('area');

    return {
      type: 'areaStart',
      text: `AREA ${this.area}`
    };
  };

  MobShotStageFlow.prototype.completeBoss = function(){
    this.finished = true;
    this.setPhase('clear');

    return {
      type: 'clear',
      text: 'CLEAR!'
    };
  };

  window.MOBSHOT_STAGE_DATA = AREA_DATA;
  window.MobShotStageFlow = MobShotStageFlow;
})();
