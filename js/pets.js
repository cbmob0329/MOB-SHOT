'use strict';

(function(){
  const PET_SAVE_KEY = 'mobshot_pet_state_v5';
  const OLD_PET_SAVE_KEY = 'mobshot_pet_state_v4';
  const RUBY_SAVE_FIELD = 'petRuby';

  const BASE_MAX_LEVEL = 50;
  const SECOND_UNLOCK_MAX_LEVEL = 99;
  const MAX_PLUS = 99;
  const MAX_EQUIPPED_PETS = 4;
  const PET_MODE_MAX_LEVEL = 30;

  const SECOND_SKILL_UNLOCK_COIN = 100000;
  const SECOND_SKILL_UNLOCK_DIAMOND = 50;

  const PET_UI_VERSION = '20260706_second_skill_balance_v1';

  const PET_MODE_FIELDS = [
    { key:'hp', name:'HP', rubyBase:2, coinBase:3000 },
    { key:'power', name:'攻撃', rubyBase:2, coinBase:3000 },
    { key:'rapid', name:'連射', rubyBase:3, coinBase:4500 },
    { key:'skill', name:'スキル', rubyBase:3, coinBase:4500 },
    { key:'dodge', name:'回避AI', rubyBase:4, coinBase:6000 }
  ];

  const SECOND_SKILLS = {
    mobdrago:{
      name:'ドラゴフレア',
      desc:'大きめの炎弾を前方へ扇状に8発放つ。万能型の見やすい追撃。',
      atkImage:'',
      htmlBullet:'fire',
      ct:58,
      firstCt:24,
      count:8,
      size:'big',
      powerRate:0.34,
      obstacleRate:0.58,
      bossRate:0.32,
      breakPower:180,
      pattern:'fan'
    },
    mobfrog:{
      name:'アクアスプラッシュ',
      desc:'水弾を横広がりで12発放つ。障害物に特に強い。',
      atkImage:'',
      htmlBullet:'water',
      ct:56,
      firstCt:22,
      count:12,
      size:'normal',
      powerRate:0.22,
      obstacleRate:1.20,
      bossRate:0.20,
      breakPower:280,
      pattern:'wide'
    },
    mobdenden:{
      name:'サンダースプレッド',
      desc:'小さめの雷弾を前方へ18発ばら撒く。雑魚殲滅向き。',
      atkImage:'',
      htmlBullet:'thunder',
      ct:62,
      firstCt:26,
      count:18,
      size:'small',
      powerRate:0.13,
      obstacleRate:0.22,
      bossRate:0.10,
      breakPower:90,
      pattern:'wide'
    },
    mobwolf:{
      name:'ウルフバイトラッシュ',
      desc:'追尾弾を6発放つ。ボスへの倍率が少し高い。',
      atkImage:'',
      htmlBullet:'gray',
      ct:64,
      firstCt:28,
      count:6,
      size:'normal',
      powerRate:0.42,
      obstacleRate:0.55,
      bossRate:0.48,
      breakPower:330,
      pattern:'homing'
    },
    mobstone:{
      name:'グランドキャノン',
      desc:'巨大な岩弾を前方へ3発撃ち出す。遅いが高火力。CTは長め。',
      atkImage:'atk/hinotama.png',
      htmlBullet:'',
      ct:98,
      firstCt:42,
      count:3,
      size:'huge',
      powerRate:0.72,
      obstacleRate:1.65,
      bossRate:0.58,
      breakPower:1050,
      pattern:'bigshot'
    },
    mobslime:{
      name:'スライムガード',
      desc:'HPを回復し、短時間バリアを張る。攻撃弾は控えめ。',
      atkImage:'atk/miraatk.png',
      htmlBullet:'',
      ct:68,
      firstCt:30,
      count:4,
      size:'small',
      powerRate:0.18,
      obstacleRate:0.25,
      bossRate:0.14,
      breakPower:90,
      heal:35,
      barrierSec:3,
      pattern:'support'
    },
    mobchibihawk:{
      name:'ホークストーム',
      desc:'高速小弾を16発連射する。手数で削る第二スキル。',
      atkImage:'atk/hawkatk.png',
      htmlBullet:'',
      ct:55,
      firstCt:20,
      count:16,
      size:'small',
      powerRate:0.16,
      obstacleRate:0.22,
      bossRate:0.12,
      breakPower:600,
      pattern:'rapid'
    },
    punimobpink:{
      name:'コインバブル',
      desc:'低火力バブルを12発放つ。撃破時コインボーナス付き。',
      atkImage:'atk/enetama.png',
      htmlBullet:'',
      ct:64,
      firstCt:24,
      count:12,
      size:'normal',
      powerRate:0.18,
      obstacleRate:0.25,
      bossRate:0.12,
      breakPower:130,
      coinBonusRate:0.08,
      pattern:'bubble'
    },
    minimiramob:{
      name:'ミラージュコピー',
      desc:'左右から分身弾を10発放つ。広範囲を安全に削る。',
      atkImage:'atk/miraatk.png',
      htmlBullet:'',
      ct:60,
      firstCt:24,
      count:10,
      size:'normal',
      powerRate:0.25,
      obstacleRate:0.35,
      bossRate:0.18,
      breakPower:160,
      pattern:'side'
    },
    mobshield:{
      name:'アイアンフォート',
      desc:'味方全員に強めのバリアを張り、大弾も放つ。',
      atkImage:'atk/hinotama.png',
      htmlBullet:'',
      ct:74,
      firstCt:26,
      count:5,
      size:'big',
      powerRate:0.32,
      obstacleRate:0.55,
      bossRate:0.22,
      breakPower:500,
      barrierSec:7,
      barrierHpRate:0.30,
      pattern:'shield'
    },
    neonkidmob:{
      name:'ネオンリングバースト',
      desc:'リング弾を円形に12発展開する。周囲殲滅型。',
      atkImage:'atk/neonring.png',
      htmlBullet:'',
      ct:60,
      firstCt:24,
      count:12,
      size:'normal',
      powerRate:0.24,
      obstacleRate:0.34,
      bossRate:0.16,
      breakPower:220,
      pattern:'circle'
    },
    minidramob:{
      name:'ギガフレア',
      desc:'超大玉を1発放つ。遅いが高火力。',
      atkImage:'atk/hinotama.png',
      htmlBullet:'',
      ct:78,
      firstCt:34,
      count:1,
      size:'huge',
      powerRate:1.35,
      obstacleRate:2.05,
      bossRate:1.15,
      breakPower:1200,
      pattern:'bigshot'
    },
    mobnero:{
      name:'ロケットストーム',
      desc:'追尾ロケットを20発乱射する。',
      atkImage:'atk/rocket.png',
      htmlBullet:'',
      ct:66,
      firstCt:24,
      count:20,
      size:'normal',
      powerRate:0.13,
      obstacleRate:0.22,
      bossRate:0.10,
      breakPower:420,
      pattern:'homing'
    },
    mobton:{
      name:'ギガレーザー',
      desc:'超巨大な貫通弾を直線に放つ。複数敵に強い。',
      atkImage:'atk/atknep.png',
      htmlBullet:'',
      ct:72,
      firstCt:28,
      count:3,
      size:'huge',
      powerRate:0.52,
      obstacleRate:1.05,
      bossRate:0.42,
      breakPower:700,
      pierce:true,
      pattern:'laser'
    },
    mobmany:{
      name:'メガネオンボム',
      desc:'ゆらゆら進む巨大爆弾を5個放つ。爆発範囲が広い。',
      atkImage:'atk/neonbomb.png',
      htmlBullet:'',
      ct:76,
      firstCt:30,
      count:5,
      size:'huge',
      powerRate:0.32,
      obstacleRate:0.85,
      bossRate:0.24,
      breakPower:550,
      explode:true,
      pattern:'bubble'
    },
    babymob:{
      name:'ベビィラッシュ',
      desc:'小弾を100連射する。雑魚処理に非常に強い。',
      atkImage:'atk/atknep.png',
      htmlBullet:'',
      ct:70,
      firstCt:22,
      count:100,
      size:'small',
      powerRate:0.025,
      obstacleRate:0.055,
      bossRate:0.018,
      breakPower:90,
      pattern:'rapid'
    },
    merurumob:{
      name:'ブラッドドレイン',
      desc:'弾8発を放ち、与えたダメージの一部をHP回復に変える。',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      ct:66,
      firstCt:28,
      count:8,
      size:'normal',
      powerRate:0.32,
      obstacleRate:0.45,
      bossRate:0.24,
      breakPower:270,
      drainRate:0.05,
      pattern:'drain'
    },
    lilmoblilith:{
      name:'ローズヘル',
      desc:'大きめの弾を扇状に15発放つ。弾幕型の主力。',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      ct:72,
      firstCt:30,
      count:15,
      size:'big',
      powerRate:0.18,
      obstacleRate:0.30,
      bossRate:0.13,
      breakPower:320,
      pattern:'fan'
    },
    chibimaohmob:{
      name:'魔王カノン改',
      desc:'超大玉を2発放つ。CTは長いが一撃が重い。',
      atkImage:'atk/atkmaoh.png',
      htmlBullet:'',
      ct:84,
      firstCt:36,
      count:2,
      size:'huge',
      powerRate:0.82,
      obstacleRate:1.35,
      bossRate:0.62,
      breakPower:900,
      pattern:'bigshot'
    },
    chibimobtetsu:{
      name:'アイアンシールド',
      desc:'防御バリアを張りつつ小弾を6発放つ。',
      atkImage:'atk/atkmeiru.png',
      htmlBullet:'',
      ct:70,
      firstCt:28,
      count:6,
      size:'small',
      powerRate:0.20,
      obstacleRate:0.40,
      bossRate:0.14,
      breakPower:420,
      barrierSec:4,
      pattern:'shield'
    },
    chibimobmelt:{
      name:'メルトクラッシュ',
      desc:'障害物特攻の大弾を4発放つ。',
      atkImage:'atk/atkmeiru.png',
      htmlBullet:'',
      ct:68,
      firstCt:26,
      count:4,
      size:'big',
      powerRate:0.55,
      obstacleRate:1.90,
      bossRate:0.36,
      breakPower:700,
      pattern:'crush'
    },
    wondamob:{
      name:'BBOYサポート',
      desc:'10秒間、装備ペット全員の連射を少し上げる。',
      atkImage:'atk/book.png',
      htmlBullet:'',
      ct:76,
      firstCt:30,
      count:5,
      size:'small',
      powerRate:0.14,
      obstacleRate:0.25,
      bossRate:0.10,
      breakPower:260,
      petRapidBuffSec:10,
      petRapidBuffRate:1.18,
      pattern:'buff'
    },
    mobflare:{
      name:'ブラックレイン',
      desc:'黒雷弾を3ワイドで連続発射する。弾幕火力型。',
      atkImage:'atk/blackrai.png',
      htmlBullet:'',
      ct:78,
      firstCt:30,
      count:27,
      size:'normal',
      powerRate:0.09,
      obstacleRate:0.18,
      bossRate:0.065,
      breakPower:500,
      pierce:true,
      pattern:'wide'
    },
    lilmobnep:{
      name:'ネプチューンリング',
      desc:'大きめの水弾を円形に16発放つ。範囲殲滅型。',
      atkImage:'atk/atknep.png',
      htmlBullet:'',
      ct:74,
      firstCt:30,
      count:16,
      size:'big',
      powerRate:0.18,
      obstacleRate:0.34,
      bossRate:0.12,
      breakPower:650,
      pattern:'circle'
    },
    chibiulmob:{
      name:'ダークローズバースト',
      desc:'闇弾を前方へ扇状に20発放つ。広範囲だが単発は控えめ。',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      ct:82,
      firstCt:34,
      count:20,
      size:'normal',
      powerRate:0.11,
      obstacleRate:0.22,
      bossRate:0.08,
      breakPower:850,
      pattern:'fan'
    },
    hero:{
      name:'ヒーローバースト',
      desc:'大弾5発と追尾小弾5発を放つ。最終万能スキル。',
      atkImage:'atk/book.png',
      htmlBullet:'',
      ct:88,
      firstCt:36,
      count:10,
      size:'big',
      powerRate:0.24,
      obstacleRate:0.58,
      bossRate:0.18,
      breakPower:3200,
      pattern:'hero'
    }
  };
    const PET_MASTER = [
    {
      key:'mobdrago',
      name:'モブドラゴン',
      role:'万能型',
      unlock:'初期解放',
      unlockType:'initial',
      rank:1,
      price:5000,
      implemented:true,
      frontImage:'pet/pet1A.png',
      backImage:'pet/pet1B.png',
      atkImage:'',
      htmlBullet:'fire',
      skillName:'ドラゴフレイム',
      normalAttackRate:0.70,
      normalRateRate:0.50,
      normalBreakPower:150,
      skillBaseCount:5,
      skillPowerRate:0.88,
      skillObstacleRate:0.88,
      skillBossRate:0.88,
      skillBreakPower:150,
      skillCt:30,
      firstCt:10,
      skillWideAt:[30,50,80],
      normalWideAt:[10,20,40,70],
      growthText:'万能型。Lv50で第二スキル解放可能'
    },
    {
      key:'mobfrog',
      name:'モブイルカエル',
      role:'障害物特化',
      unlock:'初期解放',
      unlockType:'initial',
      rank:1,
      price:5000,
      implemented:true,
      frontImage:'pet/pet2A.png',
      backImage:'pet/pet2B.png',
      atkImage:'',
      htmlBullet:'water',
      skillName:'アクアバースト',
      normalAttackRate:0.60,
      normalRateRate:0.40,
      normalBreakPower:250,
      skillBaseCount:3,
      skillPowerRate:1.56,
      skillObstacleRate:2.30,
      skillBossRate:1.56,
      skillBreakPower:250,
      skillCt:25,
      firstCt:5,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'障害物特化。Lv50で第二スキル解放可能'
    },
    {
      key:'mobdenden',
      name:'モブデンデン',
      role:'雑魚殲滅',
      unlock:'初期解放',
      unlockType:'initial',
      rank:1,
      price:5000,
      implemented:true,
      frontImage:'pet/pet raitokage.png',
      backImage:'pet/pet raitokage2.png',
      atkImage:'',
      htmlBullet:'thunder',
      skillName:'サンダーストーム',
      normalAttackRate:0.50,
      normalRateRate:0.50,
      normalBreakPower:80,
      skillBaseCount:9,
      skillPowerRate:0.57,
      skillObstacleRate:0.57,
      skillBossRate:0.57,
      skillBreakPower:80,
      skillCt:35,
      firstCt:15,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'雑魚殲滅。Lv50で第二スキル解放可能'
    },
    {
      key:'mobwolf',
      name:'モブウルフ',
      role:'ボス特化',
      unlock:'初期解放',
      unlockType:'initial',
      rank:1,
      price:5000,
      implemented:true,
      frontImage:'pet/pet wolf.png',
      backImage:'pet/pet wolf2.png',
      atkImage:'',
      htmlBullet:'gray',
      skillName:'ウルフチェイス',
      normalAttackRate:0.80,
      normalRateRate:0.38,
      normalBreakPower:300,
      skillBaseCount:5,
      skillPowerRate:1.33,
      skillObstacleRate:1.33,
      skillBossRate:2.07,
      skillBreakPower:300,
      skillCt:30,
      firstCt:20,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'ボス特化。Lv50で第二スキル解放可能'
    },
    {
      key:'mobstone',
      name:'モブストーン',
      role:'超重砲',
      unlock:'初期解放',
      unlockType:'initial',
      rank:1,
      price:5000,
      implemented:true,
      frontImage:'pet/gole.png',
      backImage:'pet/gole2.png',
      atkImage:'atk/hinotama.png',
      htmlBullet:'',
      skillName:'メテオボール',
      normalAttackRate:1.25,
      normalRateRate:0.18,
      normalBreakPower:650,
      skillBaseCount:1,
      skillPowerRate:4.35,
      skillObstacleRate:5.25,
      skillBossRate:5.40,
      skillBreakPower:1100,
      skillCt:55,
      firstCt:20,
      skillWideAt:[50,90],
      normalWideAt:[20,50,80],
      growthText:'連射はかなり遅いが高火力。通常ワイドは後半から広がる。Lv50で第二スキル解放可能'
    },
    {
      key:'mobslime',
      name:'モブスラっち',
      role:'回復支援',
      unlock:'草原クリア',
      unlockType:'grassClear',
      rank:1,
      price:10000,
      implemented:true,
      frontImage:'pet/petsr.png',
      backImage:'pet/petsr2.png',
      atkImage:'atk/miraatk.png',
      htmlBullet:'',
      skillName:'スライムヒール',
      normalAttackRate:0.40,
      normalRateRate:0.42,
      normalBreakPower:80,
      skillBaseCount:3,
      skillPowerRate:0.53,
      skillObstacleRate:0.53,
      skillBossRate:0.53,
      skillBreakPower:80,
      skillCt:42,
      firstCt:20,
      skillWideAt:[80],
      normalWideAt:[15,30,45,75],
      healBase:15,
      healLv5:20,
      healLv30:45,
      healLv50:60,
      barrierAt:25,
      growthText:'回復支援。Lv50で第二スキル解放可能'
    },
    {
      key:'mobchibihawk',
      name:'モブチビホーク',
      role:'連射',
      unlock:'草原クリア',
      unlockType:'grassClear',
      rank:1,
      price:10000,
      implemented:true,
      frontImage:'pet/pethawk1.png',
      backImage:'pet/pethawk2.png',
      atkImage:'atk/hawkatk.png',
      htmlBullet:'',
      skillName:'ホークウィング',
      normalAttackRate:0.65,
      normalRateRate:0.65,
      normalBreakPower:600,
      skillBaseCount:1,
      skillPowerRate:2.76,
      skillObstacleRate:2.76,
      skillBossRate:2.76,
      skillBreakPower:600,
      skillCt:28,
      firstCt:8,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'連射型。Lv50で第二スキル解放可能'
    },
    {
      key:'punimobpink',
      name:'ぷにモブピンク',
      role:'コイン特化',
      unlock:'砂漠クリア',
      unlockType:'desertClear',
      rank:1,
      price:30000,
      implemented:true,
      frontImage:'pet/petpink.png',
      backImage:'pet/petpink2.png',
      atkImage:'atk/enetama.png',
      htmlBullet:'',
      skillName:'ラッキーバブル',
      normalAttackRate:0.55,
      normalRateRate:0.50,
      normalBreakPower:120,
      skillBaseCount:6,
      skillPowerRate:0.69,
      skillObstacleRate:0.69,
      skillBossRate:0.69,
      skillBreakPower:120,
      skillCt:40,
      firstCt:12,
      skillWideAt:[25,50,90],
      normalWideAt:[10,20,40,70],
      growthText:'コイン特化。Lv50で第二スキル解放可能'
    },
    {
      key:'minimiramob',
      name:'ミニミラモブ',
      role:'分身型',
      unlock:'砂漠クリア',
      unlockType:'desertClear',
      rank:1,
      price:30000,
      implemented:true,
      frontImage:'pet/petmira1.png',
      backImage:'pet/petmira2.png',
      atkImage:'atk/miraatk.png',
      htmlBullet:'',
      skillName:'ミラージュアタック',
      normalAttackRate:0.60,
      normalRateRate:0.52,
      normalBreakPower:150,
      skillBaseCount:6,
      skillPowerRate:0.92,
      skillObstacleRate:0.92,
      skillBossRate:0.92,
      skillBreakPower:150,
      skillCt:35,
      firstCt:12,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'分身型。Lv50で第二スキル解放可能'
    },
    {
      key:'mobshield',
      name:'モブシールド',
      role:'防御',
      unlock:'田舎町クリア',
      unlockType:'townClear',
      rank:1,
      price:40000,
      implemented:true,
      frontImage:'pet/mobsd.png',
      backImage:'pet/mobsd2.png',
      atkImage:'atk/hinotama.png',
      htmlBullet:'',
      skillName:'フォートレス',
      normalAttackRate:1.60,
      normalRateRate:0.35,
      normalBreakPower:500,
      skillBaseCount:1,
      skillPowerRate:0.69,
      skillObstacleRate:0.69,
      skillBossRate:0.69,
      skillBreakPower:500,
      skillCt:40,
      firstCt:8,
      skillWideAt:[50,90],
      normalWideAt:[40,70],
      barrierHpRate:0.20,
      barrierSec:5,
      growthText:'大きく高火力な通常弾。5秒バリア。Lv50で第二スキル解放可能'
    },
    {
      key:'neonkidmob',
      name:'ネオンキッドモブ',
      role:'連射型',
      unlock:'Rank20',
      unlockType:'rank',
      rank:20,
      price:50000,
      implemented:true,
      frontImage:'pet/petneon1.png',
      backImage:'pet/petneon2.png',
      atkImage:'atk/neonring.png',
      htmlBullet:'',
      skillName:'ネオンボム',
      normalAttackRate:0.60,
      normalRateRate:0.70,
      normalBreakPower:200,
      skillBaseCount:3,
      skillPowerRate:1.20,
      skillObstacleRate:1.20,
      skillBossRate:1.20,
      skillBreakPower:200,
      skillCt:30,
      firstCt:10,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'連射型。Lv50で第二スキル解放可能'
    },
    {
      key:'minidramob',
      name:'ミニドラモブ',
      role:'重砲型',
      unlock:'Rank20',
      unlockType:'rank',
      rank:20,
      price:50000,
      implemented:true,
      frontImage:'pet/petdragoon.png',
      backImage:'pet/petdragoon2.png',
      atkImage:'atk/hinotama.png',
      htmlBullet:'',
      skillName:'メガフレア',
      normalAttackRate:0.90,
      normalRateRate:0.38,
      normalBreakPower:1000,
      skillBaseCount:2,
      skillPowerRate:3.22,
      skillObstacleRate:3.22,
      skillBossRate:3.22,
      skillBreakPower:1000,
      skillCt:38,
      firstCt:18,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'重砲型。Lv50で第二スキル解放可能'
    },
    {
      key:'mobnero',
      name:'モブネロ',
      role:'追尾',
      unlock:'Rank30',
      unlockType:'rank',
      rank:30,
      price:70000,
      implemented:true,
      frontImage:'pet/mobnero.png',
      backImage:'pet/mobnero2.png',
      atkImage:'atk/matrix.png',
      htmlBullet:'',
      skillName:'ネロロケット',
      normalAttackRate:0.65,
      normalRateRate:0.55,
      normalBreakPower:250,
      skillBaseCount:5,
      skillPowerRate:1.66,
      skillObstacleRate:1.66,
      skillBossRate:1.66,
      skillBreakPower:420,
      skillCt:30,
      firstCt:10,
      skillWideAt:[50,90],
      normalWideAt:[20,40,70],
      skillAtkImage:'atk/rocket.png',
      growthText:'通常は追尾弾。スキルはロケットランチャー。Lv50で第二スキル解放可能'
    },
    {
      key:'mobton',
      name:'モブトン',
      role:'貫通',
      unlock:'Rank30',
      unlockType:'rank',
      rank:30,
      price:70000,
      implemented:true,
      frontImage:'pet/mobton.png',
      backImage:'pet/mobton2.png',
      atkImage:'atk/atknep.png',
      htmlBullet:'',
      skillName:'トンブレイク',
      normalAttackRate:0.85,
      normalRateRate:0.45,
      normalBreakPower:400,
      skillBaseCount:1,
      skillPowerRate:3.68,
      skillObstacleRate:3.68,
      skillBossRate:3.68,
      skillBreakPower:700,
      skillCt:33,
      firstCt:10,
      skillWideAt:[50,90],
      normalWideAt:[10,30,60],
      pierce:true,
      growthText:'通常・スキルともに貫通弾。Lv50で第二スキル解放可能'
    },
    {
      key:'mobmany',
      name:'モブマニー',
      role:'爆発',
      unlock:'Rank30',
      unlockType:'rank',
      rank:30,
      price:70000,
      implemented:true,
      frontImage:'pet/mobmany.png',
      backImage:'pet/mobmany2.png',
      atkImage:'atk/neonbomb.png',
      htmlBullet:'',
      skillName:'マニーボム',
      normalAttackRate:0.65,
      normalRateRate:0.48,
      normalBreakPower:260,
      skillBaseCount:1,
      skillPowerRate:4.78,
      skillObstacleRate:4.78,
      skillBossRate:4.78,
      skillBreakPower:550,
      skillCt:38,
      firstCt:12,
      skillWideAt:[50,90],
      normalWideAt:[20,40,70],
      explode:true,
      growthText:'ゆらゆら揺れるワイド弾。巨大爆発弾を放つ。Lv50で第二スキル解放可能'
    },
    {
      key:'babymob',
      name:'ベビィモブ',
      role:'雑魚殲滅',
      unlock:'Rank30',
      unlockType:'rank',
      rank:30,
      price:70000,
      implemented:true,
      frontImage:'pet/babymob.png',
      backImage:'pet/babymob2.png',
      atkImage:'atk/atknep.png',
      htmlBullet:'',
      skillName:'ベビィショット',
      normalAttackRate:0.50,
      normalRateRate:0.72,
      normalBreakPower:120,
      skillBaseCount:25,
      skillPowerRate:0.69,
      skillObstacleRate:0.69,
      skillBossRate:0.69,
      skillBreakPower:120,
      skillCt:24,
      firstCt:5,
      skillWideAt:[50,90],
      normalWideAt:[1,20,40,70],
      growthText:'通常ワイド攻撃。スキルは乱射。Lv50で第二スキル解放可能'
    },
    {
      key:'merurumob',
      name:'メルルモブ',
      role:'吸血',
      unlock:'ハード全クリア',
      unlockType:'hardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petmeru.png',
      backImage:'pet/petmeru2.png',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      skillName:'ブラッドローズ',
      normalAttackRate:0.75,
      normalRateRate:0.50,
      normalBreakPower:250,
      skillBaseCount:5,
      skillPowerRate:1.43,
      skillObstacleRate:1.43,
      skillBossRate:1.43,
      skillBreakPower:250,
      skillCt:36,
      firstCt:14,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'吸血型。Lv50で第二スキル解放可能'
    },
    {
      key:'lilmoblilith',
      name:'リルモブリリス',
      role:'弾幕',
      unlock:'ハード全クリア',
      unlockType:'hardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petriris.png',
      backImage:'pet/petriris2.png',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      skillName:'ローズテンペスト',
      normalAttackRate:0.70,
      normalRateRate:0.60,
      normalBreakPower:300,
      skillBaseCount:9,
      skillPowerRate:0.97,
      skillObstacleRate:0.97,
      skillBossRate:0.97,
      skillBreakPower:300,
      skillCt:42,
      firstCt:16,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'弾幕型。Lv50で第二スキル解放可能'
    },
    {
      key:'chibimaohmob',
      name:'ちび魔王モブ',
      role:'超火力',
      unlock:'ハード全クリア',
      unlockType:'hardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petmaoh.png',
      backImage:'pet/petmaoh2.png',
      atkImage:'atk/atkmaoh.png',
      htmlBullet:'',
      skillName:'デモンカノン',
      normalAttackRate:0.95,
      normalRateRate:0.38,
      normalBreakPower:800,
      skillBaseCount:1,
      skillPowerRate:4.42,
      skillObstacleRate:4.42,
      skillBossRate:4.42,
      skillBreakPower:800,
      skillCt:45,
      firstCt:20,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'超火力。Lv50で第二スキル解放可能'
    },
    {
      key:'chibimobtetsu',
      name:'ちびモブテツ',
      role:'防御補助',
      unlock:'ベリーハード全クリア',
      unlockType:'veryHardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/pettetu.png',
      backImage:'pet/pettetu2.png',
      atkImage:'atk/atkmeiru.png',
      htmlBullet:'',
      skillName:'アイアンウォール',
      normalAttackRate:0.70,
      normalRateRate:0.45,
      normalBreakPower:400,
      skillBaseCount:1,
      skillPowerRate:0.69,
      skillObstacleRate:0.69,
      skillBossRate:0.69,
      skillBreakPower:400,
      skillCt:40,
      firstCt:15,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'防御補助。Lv50で第二スキル解放可能'
    },
    {
      key:'chibimobmelt',
      name:'ちびモブメルト',
      role:'障害物破壊',
      unlock:'ベリーハード全クリア',
      unlockType:'veryHardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petmerut.png',
      backImage:'pet/petmerut2.png',
      atkImage:'atk/atkmeiru.png',
      htmlBullet:'',
      skillName:'メルトハンマー',
      normalAttackRate:0.85,
      normalRateRate:0.40,
      normalBreakPower:600,
      skillBaseCount:2,
      skillPowerRate:2.58,
      skillObstacleRate:3.86,
      skillBossRate:2.58,
      skillBreakPower:600,
      skillCt:38,
      firstCt:14,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'障害物破壊。Lv50で第二スキル解放可能'
    },
    {
      key:'wondamob',
      name:'ワンダモブ',
      role:'支援',
      unlock:'ベリーハード全クリア',
      unlockType:'veryHardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petwon.png',
      backImage:'pet/petwon2.png',
      atkImage:'atk/book.png',
      htmlBullet:'',
      skillName:'bboy',
      normalAttackRate:0.65,
      normalRateRate:0.55,
      normalBreakPower:250,
      skillBaseCount:1,
      skillPowerRate:0.69,
      skillObstacleRate:0.69,
      skillBossRate:0.69,
      skillBreakPower:250,
      skillCt:50,
      firstCt:20,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'支援型。Lv50で第二スキル解放可能'
    },
    {
      key:'mobflare',
      name:'モブフレア',
      role:'弾幕',
      unlock:'Rank40',
      unlockType:'rank',
      rank:40,
      price:120000,
      implemented:true,
      frontImage:'pet/mobfre.png',
      backImage:'pet/mobfre2.png',
      atkImage:'atk/enma.png',
      htmlBullet:'',
      skillName:'フレアレイン',
      normalAttackRate:1.00,
      normalRateRate:0.46,
      normalBreakPower:500,
      skillBaseCount:9,
      skillPowerRate:1.56,
      skillObstacleRate:1.56,
      skillBossRate:1.56,
      skillBreakPower:500,
      skillCt:35,
      firstCt:10,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      skillAtkImage:'atk/blackrai.png',
      pierce:true,
      growthText:'大きめ弾。スキルは貫通弾3ワイド3連射。Lv50で第二スキル解放可能'
    },
    {
      key:'lilmobnep',
      name:'リルモブネプ',
      role:'範囲殲滅',
      unlock:'海の線路クリア',
      unlockType:'seaClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petmobnep.png',
      backImage:'pet/petmobnep2.png',
      atkImage:'atk/atknep.png',
      htmlBullet:'',
      skillName:'ネプチューンウェーブ',
      normalAttackRate:0.88,
      normalRateRate:0.50,
      normalBreakPower:600,
      skillBaseCount:4,
      skillPowerRate:1.93,
      skillObstacleRate:1.93,
      skillBossRate:1.93,
      skillBreakPower:600,
      skillCt:42,
      firstCt:16,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'範囲殲滅。Lv50で第二スキル解放可能'
    },
    {
      key:'chibiulmob',
      name:'ちびウルモブ',
      role:'最終弾幕',
      unlock:'レジェンド全クリア',
      unlockType:'legendClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petul1.png',
      backImage:'pet/petul2.png',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      skillName:'ダークローズレイン',
      normalAttackRate:0.90,
      normalRateRate:0.60,
      normalBreakPower:800,
      skillBaseCount:9,
      skillPowerRate:1.43,
      skillObstacleRate:1.43,
      skillBossRate:1.43,
      skillBreakPower:800,
      skillCt:45,
      firstCt:18,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'最終弾幕。Lv50で第二スキル解放可能'
    },
    {
      key:'hero',
      name:'あのヒーロー',
      role:'最強万能',
      unlock:'レジェンド全クリア',
      unlockType:'legendClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/pet hero.png',
      backImage:'pet/pet hero2.png',
      atkImage:'atk/book.png',
      htmlBullet:'',
      skillName:'ヒーローフィニッシュ',
      normalAttackRate:1.00,
      normalRateRate:0.50,
      normalBreakPower:3000,
      skillBaseCount:3,
      skillPowerRate:3.68,
      skillObstacleRate:3.68,
      skillBossRate:3.68,
      skillBreakPower:3000,
      skillCt:50,
      firstCt:20,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'最強万能。Lv50で第二スキル解放可能'
    }
  ];

  PET_MASTER.forEach(pet => {
    pet.secondSkill = SECOND_SKILLS[pet.key] || null;
    pet.secondSkillName = pet.secondSkill ? pet.secondSkill.name : '';
  });

  function defaultPetMode(){
    return { hp:0, power:0, rapid:0, skill:0, dodge:0 };
  }

  function defaultPetState(){
    return {
      owned:false,
      level:1,
      plus:0,
      secondSkillUnlocked:false,
      petMode:defaultPetMode()
    };
  }

  function defaultState(){
    const pets = {};
    PET_MASTER.forEach(pet => {
      pets[pet.key] = defaultPetState();
    });
    return { equipped:[], pets };
  }

  function showPetToast(message, type){
    ensurePetStyles();

    let toast = document.getElementById('mobshotPetToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mobshotPetToast';
      document.body.appendChild(toast);
    }

    toast.className = 'show ' + (type || 'info');
    toast.textContent = String(message || '');

    clearTimeout(showPetToast._timer);
    showPetToast._timer = setTimeout(function(){
      toast.classList.remove('show');
    }, 1300);
  }

  function normalizePetMode(raw){
    const base = defaultPetMode();
    raw = raw || {};

    PET_MODE_FIELDS.forEach(field => {
      base[field.key] = Math.max(0, Math.min(PET_MODE_MAX_LEVEL, Number(raw[field.key] || 0)));
    });

    return base;
  }

  function normalizePetState(raw){
    const base = defaultPetState();
    raw = Object.assign(base, raw || {});
    raw.owned = !!raw.owned;
    raw.plus = Math.max(0, Math.min(MAX_PLUS, Number(raw.plus || 0)));
    raw.secondSkillUnlocked = !!raw.secondSkillUnlocked;
    raw.petMode = normalizePetMode(raw.petMode);

    const cap = levelCap(raw);
    raw.level = Math.max(1, Math.min(cap, Number(raw.level || 1)));

    return raw;
  }

  function loadRawPetSave(){
    try {
      const raw = localStorage.getItem(PET_SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}

    try {
      const oldRaw = localStorage.getItem(OLD_PET_SAVE_KEY);
      if (oldRaw) return JSON.parse(oldRaw);
    } catch(e) {}

    return null;
  }

  function loadState(){
    const base = defaultState();
    const parsed = loadRawPetSave();

    if (parsed) {
      base.equipped = Array.isArray(parsed.equipped) ? parsed.equipped : [];
      base.pets = Object.assign(base.pets, parsed.pets || {});
    }

    base.equipped = base.equipped.slice(0, MAX_EQUIPPED_PETS);

    PET_MASTER.forEach(pet => {
      base.pets[pet.key] = normalizePetState(base.pets[pet.key]);
    });

    base.equipped = base.equipped.filter((key, index, arr) => {
      const pet = getPet(key);
      return (
        arr.indexOf(key) === index &&
        pet &&
        pet.implemented &&
        base.pets[key] &&
        base.pets[key].owned
      );
    });

    return base;
  }

  function saveState(state){
    state.equipped = Array.isArray(state.equipped) ? state.equipped.slice(0, MAX_EQUIPPED_PETS) : [];

    PET_MASTER.forEach(pet => {
      state.pets[pet.key] = normalizePetState(state.pets[pet.key]);
    });

    try {
      localStorage.setItem(PET_SAVE_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    try {
      return JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};
    } catch(e) {
      return {
        coin:0,
        rank:1,
        score:0,
        diamond:0,
        petRuby:0,
        stageProgress:{
          highestStageIndex:-1,
          clearedStageIds:{}
        }
      };
    }
  }

  function saveMainData(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return true;
    }

    try {
      localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
      return true;
    } catch(e) {
      return false;
    }
  }

  function refreshMainHud(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:petRubyUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:petUpdated'));
  }

  function getRuby(){
    const save = getSave();
    return Number(save[RUBY_SAVE_FIELD] || 0);
  }

  function addRuby(amount){
    const save = getSave();
    save[RUBY_SAVE_FIELD] = Number(save[RUBY_SAVE_FIELD] || 0) + Number(amount || 0);
    saveMainData(save);
    refreshMainHud();
    return Number(save[RUBY_SAVE_FIELD] || 0);
  }

  function spendRuby(amount){
    const save = getSave();
    const have = Number(save[RUBY_SAVE_FIELD] || 0);
    const cost = Number(amount || 0);

    if (have < cost) return false;

    save[RUBY_SAVE_FIELD] = have - cost;
    saveMainData(save);
    refreshMainHud();

    return true;
  }

  function getDiamond(){
    const save = getSave();
    return Number(save.diamond || 0);
  }

  function spendDiamond(amount){
    const save = getSave();
    const have = Number(save.diamond || 0);
    const cost = Number(amount || 0);

    if (have < cost) return false;

    save.diamond = have - cost;
    saveMainData(save);
    refreshMainHud();

    return true;
  }

  function getCoin(){
    const save = getSave();
    return Number(save.coin || 0);
  }

  function spendCoin(amount){
    const save = getSave();
    const have = Number(save.coin || 0);
    const cost = Number(amount || 0);

    if (have < cost) return false;

    save.coin = have - cost;
    saveMainData(save);
    refreshMainHud();

    return true;
  }

  function spendCoinAndDiamond(coinCost, diamondCost){
    const save = getSave();
    const haveCoin = Number(save.coin || 0);
    const haveDiamond = Number(save.diamond || 0);

    if (haveCoin < coinCost || haveDiamond < diamondCost) return false;

    save.coin = haveCoin - coinCost;
    save.diamond = haveDiamond - diamondCost;

    saveMainData(save);
    refreshMainHud();

    return true;
  }

  function getPet(key){
    return PET_MASTER.find(pet => pet.key === key) || null;
  }

  function petPlusCost(currentPlus){
    const next = Math.max(1, Number(currentPlus || 0) + 1);

    if (next === 1) return 1;
    if (next === 2) return 3;
    if (next === 3) return 5;
    if (next === 4) return 7;
    if (next === 5) return 10;

    return 10 + Math.ceil((next - 5) * 1.6);
  }

  function petModeRubyCost(currentLv, fieldKey){
    const field = PET_MODE_FIELDS.find(f => f.key === fieldKey);
    const base = field ? field.rubyBase : 2;
    const lv = Math.max(0, Number(currentLv || 0));
    return base + Math.floor(lv * 1.35) + Math.floor(lv * lv * 0.055);
  }

  function petModeCoinCost(currentLv, fieldKey){
    const field = PET_MODE_FIELDS.find(f => f.key === fieldKey);
    const base = field ? field.coinBase : 3000;
    const lv = Math.max(0, Number(currentLv || 0));
    return base + lv * base + Math.floor(lv * lv * base * 0.18);
  }

  function petModeTotalLevel(mode){
    mode = normalizePetMode(mode);
    return PET_MODE_FIELDS.reduce((sum, field) => sum + Number(mode[field.key] || 0), 0);
  }

  function petModeHpRate(mode){
    mode = normalizePetMode(mode);
    return 1 + Number(mode.hp || 0) * 0.035;
  }

  function petModePowerRate(mode){
    mode = normalizePetMode(mode);
    return 1 + Number(mode.power || 0) * 0.028;
  }

  function petModeRapidRate(mode){
    mode = normalizePetMode(mode);
    return 1 + Number(mode.rapid || 0) * 0.018;
  }

  function petModeSkillRate(mode){
    mode = normalizePetMode(mode);
    return 1 + Number(mode.skill || 0) * 0.032;
  }

  function petModeDodgeRate(mode){
    mode = normalizePetMode(mode);
    return 1 + Number(mode.dodge || 0) * 0.025;
  }

  function plusPowerRate(plus){
    return 1 + Math.max(0, Number(plus || 0)) * 0.001;
  }

  function plusCtBonus(plus){
    return Math.floor(Math.max(0, Number(plus || 0)) / 5) * 0.1;
  }

  function plusSkillTier(plus){
    return Math.floor(Math.max(0, Number(plus || 0)) / 10);
  }

  function plusNormalWideBonus(plus){
    return Number(plus || 0) >= 50 ? 1 : 0;
  }

  function levelCap(petState){
    return petState && petState.secondSkillUnlocked ? SECOND_UNLOCK_MAX_LEVEL : BASE_MAX_LEVEL;
  }

  function levelCapBySecondSkill(unlocked){
    return unlocked ? SECOND_UNLOCK_MAX_LEVEL : BASE_MAX_LEVEL;
  }

  function stageList(){
    if (window.MobShotStorage && window.MobShotStorage.STAGE_LIST) {
      return window.MobShotStorage.STAGE_LIST;
    }

    return [];
  }

  function clearedStageIndex(save){
    return Number(
      save.stageProgress && save.stageProgress.highestStageIndex != null
        ? save.stageProgress.highestStageIndex
        : -1
    );
  }

  function stageIndexById(id){
    const list = stageList();
    return list.findIndex(stage => stage.id === id);
  }

  function hasClearedStageId(save, id){
    if (save.stageProgress && save.stageProgress.clearedStageIds && save.stageProgress.clearedStageIds[id]) {
      return true;
    }

    const targetIndex = stageIndexById(id);

    if (targetIndex >= 0) {
      return clearedStageIndex(save) >= targetIndex;
    }

    return false;
  }

  function canUnlock(pet){
    if (!pet || !pet.implemented) return false;

    const save = getSave();
    const rank = Number(save.rank || 1);

    if (pet.unlockType === 'initial') return true;
    if (pet.unlockType === 'rank') return rank >= Number(pet.rank || 1);

    if (pet.unlockType === 'grassClear') return hasClearedStageId(save, '1-3');
    if (pet.unlockType === 'desertClear') return hasClearedStageId(save, '1-6');
    if (pet.unlockType === 'townClear') return hasClearedStageId(save, '1-9');

    if (pet.unlockType === 'hardClear') return hasClearedStageId(save, '4-9');
    if (pet.unlockType === 'veryHardClear') return hasClearedStageId(save, '6-9');
    if (pet.unlockType === 'infernoClear') return hasClearedStageId(save, '8-9');

    if (pet.unlockType === 'seaClear') return hasClearedStageId(save, '11-9');
    if (pet.unlockType === 'legendClear') return hasClearedStageId(save, '14-9');

    return rank >= Number(pet.rank || 1);
  }

  function isOwned(key){
    const state = loadState();
    return !!(state.pets[key] && state.pets[key].owned);
  }

  function isEquipped(key){
    const state = loadState();
    return state.equipped.includes(key);
  }

  function isSecondSkillUnlocked(key){
    const state = loadState();
    return !!state.pets[key]?.secondSkillUnlocked;
  }

  function getPlus(key){
    const state = loadState();
    return Math.max(0, Math.min(MAX_PLUS, Number(state.pets[key]?.plus || 0)));
  }

  function getPetMode(key){
    const state = loadState();
    return normalizePetMode(state.pets[key]?.petMode);
  }

  function getLevel(key){
    const state = loadState();
    const petState = state.pets[key] || defaultPetState();
    return Math.max(1, Math.min(levelCap(petState), Number(petState.level || 1)));
  }

  function upgradeCost(level){
    const lv = Math.max(1, Number(level || 1));

    if (lv >= SECOND_UNLOCK_MAX_LEVEL) return 0;

    if (lv < 10) return 300 + (lv * 150);
    if (lv < 25) return 1800 + ((lv - 10) * 400);
    if (lv < 40) return 8000 + ((lv - 25) * 900);
    if (lv < 50) return 23000 + ((lv - 40) * 1800);

    return 50000 + ((lv - 50) * 4500);
  }

  function upgradeCostToLevel(currentLevel, targetLevel){
    let total = 0;
    const from = Math.max(1, Number(currentLevel || 1));
    const to = Math.max(from, Number(targetLevel || from));

    for (let lv = from; lv < to; lv++) {
      total += upgradeCost(lv);
    }

    return total;
  }

  function normalLevelRate(level){
    return 1 + ((Math.max(1, Number(level || 1)) - 1) * 0.007);
  }

  function skillLevelRate(level){
    return 1 + ((Math.max(1, Number(level || 1)) - 1) * 0.009);
  }

  function skillCooldown(pet, level, plus){
    const lvCt = Number(pet.skillCt || 30) - ((Math.max(1, Number(level || 1)) - 1) * 0.07);
    return Math.max(4, lvCt - plusCtBonus(plus));
  }

  function secondSkillCooldown(secondSkill, level, plus){
    if (!secondSkill) return 0;
    const lvCt = Number(secondSkill.ct || 60) - ((Math.max(1, Number(level || 1)) - 50) * 0.04);
    return Math.max(18, lvCt - plusCtBonus(plus) * 0.5);
  }

  function normalWideBonus(level, pet, plus){
    const lv = Number(level || 1);
    const list = pet.normalWideAt || [];
    return list.filter(n => lv >= n).length + plusNormalWideBonus(plus);
  }

  function skillWideBonus(level, pet){
    const lv = Number(level || 1);
    const list = pet.skillWideAt || [];
    return list.filter(n => lv >= n).length;
  }

  function buyPet(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    if (!canUnlock(pet)) {
      showPetToast(`${pet.unlock}で解放されます`, 'warn');
      return;
    }

    const state = loadState();

    if (state.pets[key]?.owned) {
      showPetToast('すでに所持しています', 'info');
      return;
    }

    const save = getSave();
    const coin = Number(save.coin || 0);
    const price = Number(pet.price || 0);

    if (coin < price) {
      showPetToast(`COIN不足：必要 ${price.toLocaleString()}`, 'warn');
      return;
    }

    save.coin = coin - price;
    saveMainData(save);

    state.pets[key] = {
      owned:true,
      level:1,
      plus:0,
      secondSkillUnlocked:false,
      petMode:defaultPetMode()
    };

    saveState(state);
    refreshMainHud();
    renderAll();
    showPetToast(`${pet.name}を購入しました`, 'ok');
  }

  function equipPet(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      buyPet(key);
      return;
    }

    if (state.equipped.includes(key)) {
      state.equipped = state.equipped.filter(v => v !== key);
      saveState(state);
      renderAll();
      showPetToast(`${pet.name}を外しました`, 'info');
      return;
    }

    if (state.equipped.length >= MAX_EQUIPPED_PETS) {
      showPetToast(`装備は最大${MAX_EQUIPPED_PETS}体です`, 'warn');
      return;
    }

    state.equipped.push(key);
    saveState(state);
    renderAll();
    showPetToast(`${pet.name}を装備しました`, 'ok');
  }

  function upgradePet(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      showPetToast('先に購入してください', 'warn');
      return;
    }

    const petState = state.pets[key];
    const cap = levelCap(petState);
    const currentLevel = getLevel(key);

    if (currentLevel >= cap) {
      if (!petState.secondSkillUnlocked) {
        showPetToast('Lv99には第二スキル解放が必要です', 'warn');
      } else {
        showPetToast('最大Lvです', 'info');
      }
      return;
    }

    const cost = upgradeCost(currentLevel);

    if (!spendCoin(cost)) {
      showPetToast(`COIN不足：必要 ${cost.toLocaleString()}`, 'warn');
      return;
    }

    petState.level = currentLevel + 1;

    saveState(state);
    refreshMainHud();
    renderAll();
    showPetToast(`${pet.name} Lv${currentLevel} → Lv${currentLevel + 1}`, 'ok');
  }

  function upgradePet10(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      showPetToast('先に購入してください', 'warn');
      return;
    }

    const petState = state.pets[key];
    const cap = levelCap(petState);
    const currentLevel = getLevel(key);

    if (currentLevel >= cap) {
      showPetToast('最大Lvです', 'info');
      return;
    }

    const targetLevel = Math.min(cap, currentLevel + 10);
    const cost = upgradeCostToLevel(currentLevel, targetLevel);

    if (!spendCoin(cost)) {
      showPetToast(`COIN不足：必要 ${cost.toLocaleString()}`, 'warn');
      return;
    }

    petState.level = targetLevel;

    saveState(state);
    refreshMainHud();
    renderAll();

    showPetToast(`${pet.name} Lv${currentLevel} → Lv${targetLevel}`, 'ok');
  }

  function unlockSecondSkill(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();
    const petState = state.pets[key];

    if (!petState || !petState.owned) {
      showPetToast('先に購入してください', 'warn');
      return;
    }

    if (petState.secondSkillUnlocked) {
      showPetToast('第二スキル解放済みです', 'info');
      return;
    }

    if (Number(petState.level || 1) < BASE_MAX_LEVEL) {
      showPetToast(`第二解放にはLv${BASE_MAX_LEVEL}が必要です`, 'warn');
      return;
    }

    const coin = getCoin();
    const diamond = getDiamond();

    if (coin < SECOND_SKILL_UNLOCK_COIN || diamond < SECOND_SKILL_UNLOCK_DIAMOND) {
      showPetToast(`素材不足：${SECOND_SKILL_UNLOCK_COIN.toLocaleString()}C + 💎${SECOND_SKILL_UNLOCK_DIAMOND}`, 'warn');
      return;
    }

    if (!spendCoinAndDiamond(SECOND_SKILL_UNLOCK_COIN, SECOND_SKILL_UNLOCK_DIAMOND)) {
      showPetToast('素材が足りません', 'warn');
      return;
    }

    petState.secondSkillUnlocked = true;
    petState.level = Math.max(BASE_MAX_LEVEL, Number(petState.level || BASE_MAX_LEVEL));

    saveState(state);
    refreshMainHud();
    renderAll();

    showPetToast(`${pet.secondSkillName} 解放！`, 'ok');
  }

  function upgradePetPlus(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      showPetToast('先に購入してください', 'warn');
      return;
    }

    const plus = Math.max(0, Math.min(MAX_PLUS, Number(state.pets[key].plus || 0)));

    if (plus >= MAX_PLUS) {
      showPetToast('+値は最大です', 'info');
      return;
    }

    const cost = petPlusCost(plus);

    if (!spendRuby(cost)) {
      showPetToast(`ルビー不足：必要 ♦${cost}`, 'warn');
      return;
    }

    state.pets[key].plus = plus + 1;

    saveState(state);
    refreshMainHud();
    renderAll();

    showPetToast(`${pet.name} +${plus} → +${plus + 1}`, 'ok');
  }

  function upgradePetMode(key, fieldKey, payType){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      showPetToast('先に購入してください', 'warn');
      return;
    }

    const field = PET_MODE_FIELDS.find(f => f.key === fieldKey);
    if (!field) return;

    const mode = normalizePetMode(state.pets[key].petMode);
    const current = Number(mode[fieldKey] || 0);

    if (current >= PET_MODE_MAX_LEVEL) {
      showPetToast(`${field.name}は最大Lvです`, 'info');
      return;
    }

    const cost = payType === 'coin'
      ? petModeCoinCost(current, fieldKey)
      : petModeRubyCost(current, fieldKey);

    if (payType === 'coin') {
      if (!spendCoin(cost)) {
        showPetToast(`COIN不足：必要 ${cost.toLocaleString()}`, 'warn');
        return;
      }
    } else {
      if (!spendRuby(cost)) {
        showPetToast(`ルビー不足：必要 ♦${cost}`, 'warn');
        return;
      }
    }

    mode[fieldKey] = current + 1;
    state.pets[key].petMode = mode;

    saveState(state);
    refreshMainHud();
    renderAll();

    const modal = document.getElementById('petPerformanceModal');
    if (modal && modal.classList.contains('show')) {
      openPerformanceModal(key);
    }

    showPetToast(`${field.name} Lv${current} → Lv${current + 1}`, 'ok');
  }

  function ensurePetStyles(){
    if (document.getElementById('mobshotPetFullStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobshotPetFullStyle';
    style.textContent = `
      #petOwnedList{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:8px!important;
        align-items:start!important;
      }

      .pet-card{
        min-width:0!important;
        display:flex!important;
        flex-direction:column!important;
        gap:7px!important;
        padding:8px!important;
        border-radius:16px!important;
        overflow:hidden!important;
      }

      .pet-card-icon{
        width:100%!important;
        height:62px!important;
        display:flex!important;
        justify-content:center!important;
        align-items:center!important;
      }

      .pet-card-icon img{
        max-width:58px!important;
        max-height:58px!important;
        object-fit:contain!important;
      }

      .pet-card-body{
        min-width:0!important;
      }

      .pet-card-name{
        display:block!important;
        text-align:center!important;
        font-size:11px!important;
        line-height:1.15!important;
        word-break:keep-all!important;
        overflow:hidden!important;
      }

      .pet-card-name span{
        display:block!important;
        margin-top:3px!important;
        font-size:10px!important;
        color:#ffe66b!important;
      }

      .pet-card-desc,
      .pet-card-price,
      .pet-card-spec{
        display:none!important;
      }

      .pet-card-actions{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:5px!important;
      }

      .pet-card-actions button,
      .pet-card-btn,
      .pet-upgrade-btn,
      .pet-performance-btn,
      .pet-lv10-btn{
        width:100%!important;
        min-height:31px!important;
        border-radius:999px!important;
        font-size:10px!important;
        line-height:1.05!important;
        padding:6px 3px!important;
        font-weight:1000!important;
        white-space:normal!important;
      }

      .pet-performance-btn{
        border:0;
        background:linear-gradient(#64ddff,#1874e8);
        color:#fff;
        box-shadow:0 3px 0 rgba(0,0,0,.35);
      }

      .pet-lv10-btn{
        border:0;
        background:linear-gradient(#9dff73,#26a84d);
        color:#092d12;
        box-shadow:0 3px 0 rgba(0,0,0,.35);
      }

      .pet-lv10-btn:disabled,
      .pet-performance-btn:disabled{
        opacity:.45!important;
        filter:grayscale(1)!important;
      }

      #petPerformanceModal{
        position:fixed;
        inset:0;
        z-index:250000;
        display:none;
        align-items:center;
        justify-content:center;
        background:rgba(0,0,0,.78);
        color:#fff;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }

      #petPerformanceModal.show{
        display:flex!important;
      }

      .pet-performance-panel{
        width:min(94vw,460px);
        max-height:88vh;
        overflow:auto;
        background:linear-gradient(160deg,#17243e,#070d1b);
        border:4px solid rgba(120,170,230,.46);
        border-radius:24px;
        padding:16px;
        box-shadow:0 24px 70px rgba(0,0,0,.6);
      }

      .pet-performance-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        position:sticky;
        top:0;
        background:linear-gradient(160deg,#17243e,#101a2d);
        padding-bottom:10px;
        z-index:2;
      }

      .pet-performance-title{
        font-size:22px;
        font-weight:1000;
        color:#ffe66b;
        text-shadow:0 3px 0 #000;
      }

      .pet-performance-close{
        border:0;
        border-radius:999px;
        padding:9px 13px;
        font-size:14px;
        font-weight:1000;
        color:#fff;
        background:linear-gradient(#4c5d7f,#1d2a45);
      }

      .pet-performance-main{
        display:grid;
        grid-template-columns:84px 1fr;
        gap:12px;
        align-items:center;
        margin:12px 0;
      }

      .pet-performance-img{
        width:84px;
        height:84px;
        border-radius:18px;
        background:rgba(255,255,255,.07);
        border:2px solid rgba(255,255,255,.18);
        display:flex;
        align-items:center;
        justify-content:center;
      }

      .pet-performance-img img{
        max-width:76px;
        max-height:76px;
        object-fit:contain;
      }

      .pet-performance-line{
        margin:7px 0;
        padding:9px 10px;
        border-radius:14px;
        background:rgba(255,255,255,.07);
        border:2px solid rgba(255,255,255,.12);
        font-size:13px;
        line-height:1.45;
        font-weight:900;
      }

      .pet-performance-line b{
        color:#ffe66b;
      }

      .pet-mode-row{
        margin-top:7px;
        padding:8px;
        border-radius:13px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.12);
      }

      .pet-mode-row-title{
        font-size:12px;
        font-weight:1000;
        margin-bottom:6px;
      }

      .pet-mode-actions{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:6px;
      }

      .pet-mode-upgrade-btn{
        border:0;
        border-radius:999px;
        padding:8px 4px;
        font-size:11px;
        font-weight:1000;
        color:#fff;
        background:linear-gradient(#31405f,#172037);
      }

      .pet-mode-upgrade-btn:disabled{
        opacity:.45;
      }

      #mobshotPetToast{
        position:fixed;
        left:50%;
        bottom:calc(18px + env(safe-area-inset-bottom));
        transform:translateX(-50%) translateY(18px);
        z-index:999999;
        max-width:min(90vw,420px);
        padding:11px 16px;
        border-radius:999px;
        background:rgba(12,18,31,.94);
        color:#fff;
        font-size:13px;
        line-height:1.25;
        font-weight:1000;
        text-align:center;
        opacity:0;
        pointer-events:none;
        border:2px solid rgba(255,255,255,.25);
        box-shadow:0 10px 30px rgba(0,0,0,.45);
        transition:opacity .16s ease, transform .16s ease;
      }

      #mobshotPetToast.show{
        opacity:1;
        transform:translateX(-50%) translateY(0);
      }

      #mobshotPetToast.ok{
        border-color:rgba(157,255,115,.9);
        color:#9dff73;
      }

      #mobshotPetToast.warn{
        border-color:rgba(255,230,107,.9);
        color:#ffe66b;
      }

      #mobshotPetToast.info{
        border-color:rgba(100,221,255,.9);
        color:#64ddff;
      }

      @media (max-width:430px){
        #petOwnedList{
          grid-template-columns:repeat(4,minmax(0,1fr))!important;
          gap:6px!important;
        }

        .pet-card{
          padding:6px!important;
        }

        .pet-card-icon{
          height:54px!important;
        }

        .pet-card-icon img{
          max-width:50px!important;
          max-height:50px!important;
        }

        .pet-card-name{
          font-size:10px!important;
        }

        .pet-card-actions button,
        .pet-card-btn,
        .pet-upgrade-btn,
        .pet-performance-btn,
        .pet-lv10-btn{
          font-size:9px!important;
          min-height:29px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePerformanceModal(){
    let modal = document.getElementById('petPerformanceModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'petPerformanceModal';
    modal.innerHTML = `
      <div class="pet-performance-panel">
        <div class="pet-performance-head">
          <div class="pet-performance-title" id="petPerformanceTitle">PET</div>
          <button type="button" class="pet-performance-close" id="petPerformanceCloseBtn">閉じる</button>
        </div>
        <div id="petPerformanceBody"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', function(e){
      if (e.target === modal) closePerformanceModal();
    });

    const closeBtn = document.getElementById('petPerformanceCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closePerformanceModal);

    return modal;
  }

  function closePerformanceModal(){
    const modal = document.getElementById('petPerformanceModal');
    if (modal) modal.classList.remove('show');
  }

  function openPerformanceModal(key){
    const pet = getPet(key);
    if (!pet) return;

    const unlockOk = canUnlock(pet);
    const owned = isOwned(key);
    const equipped = isEquipped(key);
    const lockedView = !unlockOk || !pet.implemented;
    const plus = getPlus(key);
    const level = getLevel(key);
    const petState = loadState().pets[key] || defaultPetState();
    const cap = levelCap(petState);
    const mode = getPetMode(key);
    const secondUnlocked = !!petState.secondSkillUnlocked;
    const second = pet.secondSkill;

    const modal = ensurePerformanceModal();
    const title = document.getElementById('petPerformanceTitle');
    const body = document.getElementById('petPerformanceBody');

    if (title) title.textContent = lockedView ? '？？？' : pet.name;
    if (!body) return;

    const normalPower = Math.round(pet.normalAttackRate * normalLevelRate(level) * plusPowerRate(plus) * 100);
    const skillCt = Math.round(skillCooldown(pet, level, plus) * 10) / 10;
    const secondCt = second ? Math.round(secondSkillCooldown(second, level, plus) * 10) / 10 : 0;

    body.innerHTML = `
      <div class="pet-performance-main">
        <div class="pet-performance-img">
          ${petImageHtml(pet, 'front', lockedView)}
        </div>
        <div>
          <div class="pet-performance-line"><b>${lockedView ? '未解放' : pet.role}</b> / ${pet.unlock || '初期解放'}</div>
          <div class="pet-performance-line">
            ${owned ? '所持中' : '未所持'} ${equipped ? '/ 装備中' : ''}<br>
            Lv${level}/${cap}　+${plus}
          </div>
        </div>
      </div>

      <div class="pet-performance-line">
        <b>通常攻撃</b><br>
        攻撃倍率 ${normalPower}% / 連射 ${Math.round(pet.normalRateRate * petModeRapidRate(mode) * 100)}% / 通常ワイド+${normalWideBonus(level, pet, plus)}<br>
        弾破壊 ${Number(pet.normalBreakPower || 0).toLocaleString()}
      </div>

      <div class="pet-performance-line">
        <b>第一スキル</b><br>
        ${pet.skillName} / CT${skillCt}秒 / スキルワイド+${skillWideBonus(level, pet)}<br>
        攻撃 ${Math.round(pet.skillPowerRate * skillLevelRate(level) * (1 + plusSkillTier(plus) * 0.015) * 100)}% /
        障害物 ${Math.round((pet.skillObstacleRate || pet.skillPowerRate) * skillLevelRate(level) * (1 + plusSkillTier(plus) * 0.015) * 100)}% /
        ボス ${Math.round((pet.skillBossRate || pet.skillPowerRate) * skillLevelRate(level) * (1 + plusSkillTier(plus) * 0.015) * 100)}%
      </div>

      <div class="pet-performance-line">
        <b>第二スキル</b><br>
        ${
          second
            ? `${secondUnlocked ? '解放済み' : '未解放'} / ${second.name} / CT${secondCt || second.ct}秒<br>${second.desc}<br>弾数 ${second.count} / タイプ ${second.pattern}<br>通常モード用にボス倍率を抑制済み`
            : 'なし'
        }
      </div>

      <div class="pet-performance-line">
        <b>+強化効果</b><br>
        +1毎パワー+0.1% / +5毎CT-0.1秒 / +10毎スキル強化 / +50通常ワイド+1
      </div>

      <div class="pet-performance-line">
        <b>育成メモ</b><br>
        ${pet.growthText || ''}
      </div>

      ${petModeHtml(pet, mode, owned, lockedView)}
    `;

    body.querySelectorAll('.pet-mode-upgrade-btn').forEach(btn => {
      btn.addEventListener('click', function(){
        upgradePetMode(
          this.getAttribute('data-pet'),
          this.getAttribute('data-field'),
          this.getAttribute('data-pay')
        );
      });
    });

    modal.classList.add('show');
  }

  function petImageHtml(pet, mode, locked){
    const isLocked = !!locked || !pet.implemented;
    const src = mode === 'back' ? pet.backImage : pet.frontImage;

    if (!src) return `<span class="pet-img-fallback">?</span>`;

    return `
      <img
        src="${src}?v=${PET_UI_VERSION}"
        alt="${isLocked ? 'LOCK' : pet.name}"
        style="${isLocked ? 'filter:brightness(0) opacity(.75);' : ''}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      >
      <span class="pet-img-fallback">?</span>
    `;
  }

  function renderSlots(){
    const wrap = document.getElementById('petEquipSlots');
    if (!wrap) return;

    const state = loadState();
    wrap.innerHTML = '';

    for (let i = 0; i < MAX_EQUIPPED_PETS; i++) {
      const key = state.equipped[i];
      const pet = getPet(key);

      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = pet ? 'pet-slot' : 'pet-slot empty';

      if (pet) {
        slot.innerHTML = `
          <span class="pet-slot-num">${i + 1}</span>
          ${petImageHtml(pet, 'front', false)}
          <span class="pet-slot-name">${pet.name}</span>
        `;

        slot.addEventListener('click', function(){
          equipPet(pet.key);
        });
      } else {
        slot.innerHTML = `
          <span class="pet-slot-num">${i + 1}</span>
          <span class="pet-slot-name">EMPTY</span>
        `;
      }

      wrap.appendChild(slot);
    }
  }

  function renderFloatPets(){
    const layer = document.getElementById('mainPetFloatLayer');
    if (!layer) return;

    const state = loadState();
    layer.innerHTML = '';

    state.equipped.slice(0, MAX_EQUIPPED_PETS).forEach((key, index) => {
      const pet = getPet(key);
      if (!pet) return;

      const el = document.createElement('div');
      el.className = `main-float-pet pet-float-${index + 1}`;
      el.innerHTML = petImageHtml(pet, 'front', false);
      layer.appendChild(el);
    });
  }

  function petModeHtml(pet, mode, owned, lockedView){
    if (lockedView) return `<div class="pet-performance-line">ペットモード強化: 解放後に表示</div>`;
    if (!owned) return `<div class="pet-performance-line">ペットモード強化: 購入後に強化可能</div>`;

    return `
      <div class="pet-performance-line">
        <b>ペットモード専用強化</b><br>
        合計Lv ${petModeTotalLevel(mode)} / ${PET_MODE_FIELDS.length * PET_MODE_MAX_LEVEL}<br>
        ※通常ステージ火力には乗らず、ペットモード専用で反映
      </div>

      ${PET_MODE_FIELDS.map(field => {
        const lv = Number(mode[field.key] || 0);
        const ruby = petModeRubyCost(lv, field.key);
        const coin = petModeCoinCost(lv, field.key);

        return `
          <div class="pet-mode-row">
            <div class="pet-mode-row-title">${field.name} Lv${lv}/${PET_MODE_MAX_LEVEL}</div>
            <div class="pet-mode-actions">
              <button type="button" class="pet-mode-upgrade-btn" data-pet="${pet.key}" data-field="${field.key}" data-pay="ruby" ${lv >= PET_MODE_MAX_LEVEL ? 'disabled' : ''}>
                ♦${lv >= PET_MODE_MAX_LEVEL ? 'MAX' : ruby}
              </button>
              <button type="button" class="pet-mode-upgrade-btn" data-pet="${pet.key}" data-field="${field.key}" data-pay="coin" ${lv >= PET_MODE_MAX_LEVEL ? 'disabled' : ''}>
                ${lv >= PET_MODE_MAX_LEVEL ? 'MAX' : coin.toLocaleString()}C
              </button>
            </div>
          </div>
        `;
      }).join('')}
    `;
  }

  function renderOwnedList(){
    const list = document.getElementById('petOwnedList');
    if (!list) return;

    const state = loadState();
    list.innerHTML = '';

    PET_MASTER.forEach(pet => {
      const unlockOk = canUnlock(pet);
      const owned = !!state.pets[pet.key]?.owned;
      const equipped = state.equipped.includes(pet.key);
      const plus = getPlus(pet.key);
      const petState = state.pets[pet.key] || defaultPetState();
      const secondUnlocked = !!petState.secondSkillUnlocked;
      const cap = levelCap(petState);
      const level = getLevel(pet.key);
      const nextCost = level >= cap ? 0 : upgradeCost(level);
      const lv10Target = Math.min(cap, level + 10);
      const lv10Cost = level >= cap ? 0 : upgradeCostToLevel(level, lv10Target);
      const plusCost = plus >= MAX_PLUS ? 0 : petPlusCost(plus);
      const lockedView = !unlockOk || !pet.implemented;
      const canSecondUnlock = owned && !secondUnlocked && level >= BASE_MAX_LEVEL && pet.secondSkill;

      const card = document.createElement('div');
      card.className =
        'pet-card' +
        (equipped ? ' equipped' : '') +
        (lockedView ? ' locked rank-locked' : '') +
        (secondUnlocked ? ' second-skill-unlocked' : '');

      let mainButtonText = '購入';
      let mainButtonDisabled = false;

      if (!pet.implemented) {
        mainButtonText = '未実装';
        mainButtonDisabled = true;
      } else if (!unlockOk) {
        mainButtonText = 'LOCK';
        mainButtonDisabled = true;
      } else if (owned && equipped) {
        mainButtonText = '外す';
      } else if (owned) {
        mainButtonText = state.equipped.length >= MAX_EQUIPPED_PETS ? '満員' : '装備';
      }

      const displayName = lockedView ? '？？？' : pet.name;
      const displayRole = lockedView ? '未解放' : pet.role;
      const displayUnlock = pet.unlock || '初期解放';

      card.innerHTML = `
        <div class="pet-card-icon">${petImageHtml(pet, 'front', lockedView)}</div>

        <div class="pet-card-body">
          <div class="pet-card-name">
            ${displayName}
            <span>${lockedView ? displayUnlock : `Lv${level}/${cap} +${plus}`}</span>
          </div>

          <div class="pet-card-desc">${displayRole} / ${displayUnlock}</div>
          <div class="pet-card-price">${lockedView ? `条件: ${displayUnlock}` : `購入 ${Number(pet.price || 0).toLocaleString()} COIN`}</div>
          <div class="pet-card-spec">${lockedView ? 'LOCK' : `${owned ? '所持中' : '未所持'} ${equipped ? '/ 装備中' : ''}`}</div>
        </div>

        <div class="pet-card-actions">
          <button type="button" class="pet-card-btn ${equipped ? 'equipped' : ''}" ${mainButtonDisabled ? 'disabled' : ''}>
            ${mainButtonText}
          </button>

          <button type="button" class="pet-performance-btn" ${(!pet.implemented || !unlockOk) ? 'disabled' : ''}>
            性能を見る
          </button>

          <button type="button" class="pet-upgrade-btn" ${(!owned || level >= cap || !pet.implemented || !unlockOk) ? 'disabled' : ''}>
            Lv+1<br>${level >= cap ? 'MAX' : nextCost.toLocaleString()}
          </button>

          <button type="button" class="pet-lv10-btn" ${(!owned || level >= cap || !pet.implemented || !unlockOk) ? 'disabled' : ''}>
            Lv+10<br>${level >= cap ? 'MAX' : lv10Cost.toLocaleString()}
          </button>

          <button type="button" class="pet-upgrade-btn pet-second-btn" ${(!canSecondUnlock || !pet.implemented || !unlockOk) ? 'disabled' : ''}>
            第二<br>${secondUnlocked ? '解放済' : '解放'}
          </button>

          <button type="button" class="pet-upgrade-btn pet-plus-btn" ${(!owned || plus >= MAX_PLUS || !pet.implemented || !unlockOk) ? 'disabled' : ''}>
            +強化<br>${plus >= MAX_PLUS ? 'MAX' : '♦' + plusCost}
          </button>
        </div>
      `;

      const mainBtn = card.querySelector('.pet-card-btn');
      const performanceBtn = card.querySelector('.pet-performance-btn');
      const upgradeBtn = card.querySelector('.pet-upgrade-btn:not(.pet-plus-btn):not(.pet-second-btn)');
      const lv10Btn = card.querySelector('.pet-lv10-btn');
      const secondBtn = card.querySelector('.pet-second-btn');
      const plusBtn = card.querySelector('.pet-plus-btn');

      if (mainBtn && !mainButtonDisabled) {
        mainBtn.addEventListener('click', function(){
          if (!owned) buyPet(pet.key);
          else equipPet(pet.key);
        });
      }

      if (performanceBtn && pet.implemented && unlockOk) {
        performanceBtn.addEventListener('click', function(){
          openPerformanceModal(pet.key);
        });
      }

      if (upgradeBtn && owned && level < cap && pet.implemented && unlockOk) {
        upgradeBtn.addEventListener('click', function(){
          upgradePet(pet.key);
        });
      }

      if (lv10Btn && owned && level < cap && pet.implemented && unlockOk) {
        lv10Btn.addEventListener('click', function(){
          upgradePet10(pet.key);
        });
      }

      if (secondBtn && canSecondUnlock && pet.implemented && unlockOk) {
        secondBtn.addEventListener('click', function(){
          unlockSecondSkill(pet.key);
        });
      }

      if (plusBtn && owned && plus < MAX_PLUS && pet.implemented && unlockOk) {
        plusBtn.addEventListener('click', function(){
          upgradePetPlus(pet.key);
        });
      }

      list.appendChild(card);
    });
  }

  function openModal(){
    const modal = document.getElementById('petEquipModal');
    if (!modal) return;

    renderAll();
    modal.classList.remove('hidden');
  }

  function closeModal(){
    const modal = document.getElementById('petEquipModal');
    if (!modal) return;

    modal.classList.add('hidden');
  }

  function bindButtons(){
    const openBtn = document.getElementById('openPetEquipBtn');

    if (openBtn && !openBtn.__mobPetBound) {
      openBtn.__mobPetBound = true;

      openBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });

      openBtn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }, { passive:false });
    }

    const closeBtn = document.getElementById('petModalCloseBtn');

    if (closeBtn && !closeBtn.__mobPetBound) {
      closeBtn.__mobPetBound = true;

      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    const modal = document.getElementById('petEquipModal');

    if (modal && !modal.__mobPetBgBound) {
      modal.__mobPetBgBound = true;

      modal.addEventListener('click', function(e){
        if (e.target === modal) closeModal();
      });
    }
  }

  function renderAll(){
    ensurePetStyles();
    ensurePerformanceModal();
    renderSlots();
    renderFloatPets();
    renderOwnedList();
  }

  function init(){
    ensurePetStyles();
    ensurePerformanceModal();
    bindButtons();
    renderAll();
  }

  function getSecondSkill(key){
    const pet = getPet(key);
    return pet ? pet.secondSkill : null;
  }

  function getEquippedPets(){
    const state = loadState();

    return state.equipped
      .slice(0, MAX_EQUIPPED_PETS)
      .map((key, index) => {
        const pet = getPet(key);
        if (!pet || !pet.implemented) return null;

        const petState = state.pets[key] || defaultPetState();
        const plus = getPlus(key);
        const level = getLevel(key);
        const mode = getPetMode(key);
        const secondUnlocked = !!petState.secondSkillUnlocked;

        const normalRateForNormalMode = normalLevelRate(level) * plusPowerRate(plus);
        const skillRateForNormalMode = skillLevelRate(level) * (1 + plusSkillTier(plus) * 0.015);

        const secondSkill = secondUnlocked && pet.secondSkill
          ? Object.assign({}, pet.secondSkill, {
              currentCt:secondSkillCooldown(pet.secondSkill, level, plus),
              levelRate:skillRateForNormalMode,
              plusTier:plusSkillTier(plus)
            })
          : null;

        return Object.assign({}, pet, {
          slotIndex:index,
          level,
          plus,
          petRubyPlus:plus,
          petMode:mode,
          secondSkillUnlocked:secondUnlocked,
          secondSkill,
          maxPlus:MAX_PLUS,
          maxLevel:levelCap(petState),
          levelCap:levelCap(petState),

          normalLevelRate:normalRateForNormalMode,
          skillLevelRate:skillRateForNormalMode,

          currentSkillCt:skillCooldown(pet, level, plus),
          currentSecondSkillCt:secondSkill ? secondSkill.currentCt : 0,
          normalWideBonus:normalWideBonus(level, pet, plus),
          skillWideBonus:skillWideBonus(level, pet),
          plusPowerRate:plusPowerRate(plus),
          plusCtBonus:plusCtBonus(plus),
          plusSkillTier:plusSkillTier(plus),
          plusNormalWideBonus:plusNormalWideBonus(plus),

          petModeHpRate:petModeHpRate(mode),
          petModePowerRate:petModePowerRate(mode),
          petModeRapidRate:petModeRapidRate(mode),
          petModeSkillRate:petModeSkillRate(mode),
          petModeDodgeRate:petModeDodgeRate(mode)
        });
      })
      .filter(Boolean);
  }

  document.addEventListener('DOMContentLoaded', init);

  window.MobShotPets = {
    init,
    renderAll,
    openModal,
    closeModal,
    openPerformanceModal,
    closePerformanceModal,

    buyPet,
    equipPet,
    upgradePet,
    upgradePet10,
    unlockSecondSkill,
    upgradePetPlus,
    upgradePetMode,

    getEquippedPets,
    getPet,
    getSecondSkill,
    getLevel,
    getPlus,
    getPetMode,
    isSecondSkillUnlocked,

    getRuby,
    addRuby,
    spendRuby,
    getDiamond,
    spendDiamond,
    getCoin,

    petPlusCost,
    petModeRubyCost,
    petModeCoinCost,
    petModeTotalLevel,
    petModeHpRate,
    petModePowerRate,
    petModeRapidRate,
    petModeSkillRate,
    petModeDodgeRate,

    plusPowerRate,
    plusCtBonus,
    plusSkillTier,
    plusNormalWideBonus,
    levelCap,
    levelCapBySecondSkill,

    upgradeCost,
    upgradeCostToLevel,
    normalLevelRate,
    skillLevelRate,
    skillCooldown,
    secondSkillCooldown,
    normalWideBonus,
    skillWideBonus,
    canUnlock,
    isOwned,
    isEquipped,
    loadState,
    saveState,

    PET_MASTER,
    SECOND_SKILLS,
    PET_MODE_FIELDS,
    BASE_MAX_LEVEL,
    SECOND_UNLOCK_MAX_LEVEL,
    PLUS_UNLOCK_MAX_LEVEL:SECOND_UNLOCK_MAX_LEVEL,
    MAX_LEVEL:BASE_MAX_LEVEL,
    MAX_PLUS,
    PET_MODE_MAX_LEVEL,
    MAX_EQUIPPED_PETS,
    SECOND_SKILL_UNLOCK_COIN,
    SECOND_SKILL_UNLOCK_DIAMOND
  };
})();
