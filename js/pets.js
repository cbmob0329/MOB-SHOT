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

  const PET_MODE_FIELDS = [
    { key:'hp', name:'HP', rubyBase:2, coinBase:3000 },
    { key:'power', name:'攻撃', rubyBase:2, coinBase:3000 },
    { key:'rapid', name:'連射', rubyBase:3, coinBase:4500 },
    { key:'skill', name:'スキル', rubyBase:3, coinBase:4500 },
    { key:'dodge', name:'回避AI', rubyBase:4, coinBase:6000 }
  ];

  const SECOND_SKILLS = {
    mobdrago:{
      name:'ドラゴメテオ',
      desc:'大きめの炎弾を上から8発落とす。万能型の派手な追撃。',
      atkImage:'',
      htmlBullet:'fire',
      ct:58,
      firstCt:24,
      count:8,
      size:'big',
      powerRate:1.15,
      obstacleRate:1.15,
      bossRate:1.15,
      breakPower:180,
      pattern:'meteor'
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
      powerRate:0.95,
      obstacleRate:2.40,
      bossRate:1.10,
      breakPower:280,
      pattern:'wide'
    },
    mobdenden:{
      name:'サンダーレイン',
      desc:'小さめの雷弾を18発ばら撒く。雑魚殲滅向き。',
      atkImage:'',
      htmlBullet:'thunder',
      ct:62,
      firstCt:26,
      count:18,
      size:'small',
      powerRate:0.62,
      obstacleRate:0.62,
      bossRate:0.62,
      breakPower:90,
      pattern:'rain'
    },
    mobwolf:{
      name:'ウルフバイトラッシュ',
      desc:'追尾弾を6発放つ。ボスへの倍率が高い。',
      atkImage:'',
      htmlBullet:'gray',
      ct:64,
      firstCt:28,
      count:6,
      size:'normal',
      powerRate:1.25,
      obstacleRate:1.20,
      bossRate:2.20,
      breakPower:330,
      pattern:'homing'
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
      powerRate:0.50,
      obstacleRate:0.50,
      bossRate:0.50,
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
      powerRate:0.82,
      obstacleRate:0.82,
      bossRate:0.82,
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
      powerRate:0.70,
      obstacleRate:0.70,
      bossRate:0.70,
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
      powerRate:1.00,
      obstacleRate:1.00,
      bossRate:1.00,
      breakPower:160,
      pattern:'side'
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
      powerRate:1.08,
      obstacleRate:1.08,
      bossRate:1.08,
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
      powerRate:5.20,
      obstacleRate:5.20,
      bossRate:5.20,
      breakPower:1200,
      pattern:'bigshot'
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
      powerRate:1.30,
      obstacleRate:1.30,
      bossRate:1.30,
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
      powerRate:0.95,
      obstacleRate:0.95,
      bossRate:0.95,
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
      powerRate:4.30,
      obstacleRate:4.30,
      bossRate:4.30,
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
      powerRate:0.70,
      obstacleRate:0.70,
      bossRate:0.70,
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
      powerRate:2.10,
      obstacleRate:4.60,
      bossRate:2.10,
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
      powerRate:0.55,
      obstacleRate:0.55,
      bossRate:0.55,
      breakPower:260,
      petRapidBuffSec:10,
      petRapidBuffRate:1.18,
      pattern:'buff'
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
      powerRate:1.35,
      obstacleRate:1.35,
      bossRate:1.35,
      breakPower:650,
      pattern:'circle'
    },
    chibiulmob:{
      name:'ダークローズフォール',
      desc:'闇弾を20発降らせる。広範囲だが単発は控えめ。',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      ct:82,
      firstCt:34,
      count:20,
      size:'normal',
      powerRate:1.05,
      obstacleRate:1.05,
      bossRate:1.05,
      breakPower:850,
      pattern:'rain'
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
      powerRate:2.30,
      obstacleRate:2.30,
      bossRate:2.30,
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
      skillPowerRate:0.95,
      skillObstacleRate:0.95,
      skillBossRate:0.95,
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
      skillPowerRate:1.70,
      skillObstacleRate:2.50,
      skillBossRate:1.70,
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
      skillPowerRate:0.62,
      skillObstacleRate:0.62,
      skillBossRate:0.62,
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
      skillPowerRate:1.45,
      skillObstacleRate:1.45,
      skillBossRate:2.25,
      skillBreakPower:300,
      skillCt:30,
      firstCt:20,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'ボス特化。Lv50で第二スキル解放可能'
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
      skillPowerRate:0.58,
      skillObstacleRate:0.58,
      skillBossRate:0.58,
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
      skillPowerRate:3.00,
      skillObstacleRate:3.00,
      skillBossRate:3.00,
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
      unlock:'Rank10',
      unlockType:'rank',
      rank:10,
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
      skillPowerRate:0.75,
      skillObstacleRate:0.75,
      skillBossRate:0.75,
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
      unlock:'Rank10',
      unlockType:'rank',
      rank:10,
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
      skillPowerRate:1.00,
      skillObstacleRate:1.00,
      skillBossRate:1.00,
      skillBreakPower:150,
      skillCt:35,
      firstCt:12,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'分身型。Lv50で第二スキル解放可能'
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
      skillPowerRate:1.30,
      skillObstacleRate:1.30,
      skillBossRate:1.30,
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
      skillPowerRate:3.50,
      skillObstacleRate:3.50,
      skillBossRate:3.50,
      skillBreakPower:1000,
      skillCt:38,
      firstCt:18,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'重砲型。Lv50で第二スキル解放可能'
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
      skillPowerRate:1.55,
      skillObstacleRate:1.55,
      skillBossRate:1.55,
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
      skillPowerRate:1.05,
      skillObstacleRate:1.05,
      skillBossRate:1.05,
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
      skillPowerRate:4.80,
      skillObstacleRate:4.80,
      skillBossRate:4.80,
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
      skillPowerRate:0.75,
      skillObstacleRate:0.75,
      skillBossRate:0.75,
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
      skillPowerRate:2.80,
      skillObstacleRate:4.20,
      skillBossRate:2.80,
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
      skillPowerRate:0.75,
      skillObstacleRate:0.75,
      skillBossRate:0.75,
      skillBreakPower:250,
      skillCt:50,
      firstCt:20,
      skillWideAt:[50,90],
      normalWideAt:[10,20,40,70],
      growthText:'支援型。Lv50で第二スキル解放可能'
    },
    {
      key:'lilmobnep',
      name:'リルモブネプ',
      role:'範囲殲滅',
      unlock:'インフェルノ全クリア',
      unlockType:'infernoClear',
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
      skillPowerRate:2.10,
      skillObstacleRate:2.10,
      skillBossRate:2.10,
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
      unlock:'インフェルノ全クリア',
      unlockType:'infernoClear',
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
      skillPowerRate:1.55,
      skillObstacleRate:1.55,
      skillBossRate:1.55,
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
      unlock:'インフェルノ全クリア',
      unlockType:'infernoClear',
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
      skillPowerRate:4.00,
      skillObstacleRate:4.00,
      skillBossRate:4.00,
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
    return {
      hp:0,
      power:0,
      rapid:0,
      skill:0,
      dodge:0
    };
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
    return {
      equipped:[],
      pets
    };
  }

  function normalizePetMode(raw){
    const base = defaultPetMode();
    raw = raw || {};

    PET_MODE_FIELDS.forEach(field => {
      base[field.key] = Math.max(
        0,
        Math.min(PET_MODE_MAX_LEVEL, Number(raw[field.key] || 0))
      );
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

    if (haveCoin < coinCost || haveDiamond < diamondCost) {
      return false;
    }

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
    if (pet.unlockType === 'hardClear') return hasClearedStageId(save, '4-9');
    if (pet.unlockType === 'veryHardClear') return hasClearedStageId(save, '6-9');
    if (pet.unlockType === 'infernoClear') return hasClearedStageId(save, '8-9');
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
      alert(`${pet.unlock}で解放されます。`);
      return;
    }

    const state = loadState();

    if (state.pets[key]?.owned) {
      alert('すでに所持しています。');
      return;
    }

    const save = getSave();
    const coin = Number(save.coin || 0);

    if (coin < Number(pet.price || 0)) {
      alert(`COINが足りません。\n必要COIN: ${Number(pet.price || 0).toLocaleString()}`);
      return;
    }

    save.coin = coin - Number(pet.price || 0);
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
      return;
    }

    if (state.equipped.length >= MAX_EQUIPPED_PETS) {
      alert(`装備できるペットは最大${MAX_EQUIPPED_PETS}体です。先に外してください。`);
      return;
    }

    state.equipped.push(key);
    saveState(state);
    renderAll();
  }

  function upgradePet(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      alert('先に購入してください。');
      return;
    }

    const petState = state.pets[key];
    const cap = levelCap(petState);
    const currentLevel = getLevel(key);

    if (currentLevel >= cap) {
      if (!petState.secondSkillUnlocked) {
        alert(`現在の最大Lvです。\nLv99まで育成するには、第二スキル解放が必要です。\n必要: ${SECOND_SKILL_UNLOCK_COIN.toLocaleString()}COIN + ${SECOND_SKILL_UNLOCK_DIAMOND}ダイヤ`);
      } else {
        alert('最大Lvです。');
      }
      return;
    }

    const cost = upgradeCost(currentLevel);

    if (!spendCoin(cost)) {
      alert(`COINが足りません。\n必要COIN: ${cost.toLocaleString()}`);
      return;
    }

    petState.level = currentLevel + 1;

    saveState(state);
    refreshMainHud();
    renderAll();
  }

  function unlockSecondSkill(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();
    const petState = state.pets[key];

    if (!petState || !petState.owned) {
      alert('先に購入してください。');
      return;
    }

    if (petState.secondSkillUnlocked) {
      alert('すでに第二スキル解放済みです。');
      return;
    }

    if (Number(petState.level || 1) < BASE_MAX_LEVEL) {
      alert(`第二スキル解放にはLv${BASE_MAX_LEVEL}が必要です。`);
      return;
    }

    const coin = getCoin();
    const diamond = getDiamond();

    if (coin < SECOND_SKILL_UNLOCK_COIN || diamond < SECOND_SKILL_UNLOCK_DIAMOND) {
      alert(
        `素材が足りません。\n` +
        `必要: ${SECOND_SKILL_UNLOCK_COIN.toLocaleString()}COIN + ${SECOND_SKILL_UNLOCK_DIAMOND}ダイヤ\n` +
        `所持: ${coin.toLocaleString()}COIN + ${diamond}ダイヤ`
      );
      return;
    }

    if (!spendCoinAndDiamond(SECOND_SKILL_UNLOCK_COIN, SECOND_SKILL_UNLOCK_DIAMOND)) {
      alert('素材が足りません。');
      return;
    }

    petState.secondSkillUnlocked = true;
    petState.level = Math.max(BASE_MAX_LEVEL, Number(petState.level || BASE_MAX_LEVEL));

    saveState(state);
    refreshMainHud();
    renderAll();

    alert(`${pet.name}\n第二スキル「${pet.secondSkillName}」解放！\nLv99まで強化可能になりました！`);
  }

  function upgradePetPlus(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      alert('先に購入してください。');
      return;
    }

    const plus = Math.max(0, Math.min(MAX_PLUS, Number(state.pets[key].plus || 0)));

    if (plus >= MAX_PLUS) {
      alert('+値は最大です。');
      return;
    }

    const cost = petPlusCost(plus);

    if (!spendRuby(cost)) {
      alert(`ペットルビーが足りません。\n必要ルビー: ${cost}\n所持ルビー: ${getRuby()}`);
      return;
    }

    state.pets[key].plus = plus + 1;
    saveState(state);
    refreshMainHud();
    renderAll();
  }

  function upgradePetMode(key, fieldKey, payType){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      alert('先に購入してください。');
      return;
    }

    const field = PET_MODE_FIELDS.find(f => f.key === fieldKey);
    if (!field) return;

    const mode = normalizePetMode(state.pets[key].petMode);
    const current = Number(mode[fieldKey] || 0);

    if (current >= PET_MODE_MAX_LEVEL) {
      alert(`${field.name}は最大Lvです。`);
      return;
    }

    const cost = payType === 'coin'
      ? petModeCoinCost(current, fieldKey)
      : petModeRubyCost(current, fieldKey);

    if (payType === 'coin') {
      if (!spendCoin(cost)) {
        alert(`COINが足りません。\n必要COIN: ${cost.toLocaleString()}`);
        return;
      }
    } else {
      if (!spendRuby(cost)) {
        alert(`ペットルビーが足りません。\n必要ルビー: ${cost}\n所持ルビー: ${getRuby()}`);
        return;
      }
    }

    mode[fieldKey] = current + 1;
    state.pets[key].petMode = mode;

    saveState(state);
    refreshMainHud();
    renderAll();
  }

  function petImageHtml(pet, mode, locked){
    const isLocked = !!locked || !pet.implemented;
    const src = mode === 'back' ? pet.backImage : pet.frontImage;

    if (!src) {
      return `<span class="pet-img-fallback">?</span>`;
    }

    return `
      <img
        src="${src}?v=20260627_pet_second_skill"
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
    if (lockedView) {
      return `<div class="pet-card-spec">ペットモード強化: 解放後に表示</div>`;
    }

    if (!owned) {
      return `<div class="pet-card-spec">ペットモード強化: 購入後に強化可能</div>`;
    }

    return `
      <div class="pet-card-spec">
        <b>ペットモード専用強化</b><br>
        合計Lv ${petModeTotalLevel(mode)} / ${PET_MODE_FIELDS.length * PET_MODE_MAX_LEVEL}
      </div>

      ${PET_MODE_FIELDS.map(field => {
        const lv = Number(mode[field.key] || 0);
        const ruby = petModeRubyCost(lv, field.key);
        const coin = petModeCoinCost(lv, field.key);

        return `
          <div class="pet-card-spec" style="margin-top:6px">
            ${field.name} Lv${lv}/${PET_MODE_MAX_LEVEL}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:4px">
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

  function secondSkillHtml(pet, owned, level, unlocked, lockedView){
    if (lockedView) {
      return `<div class="pet-card-spec">第二スキル: ？？？</div>`;
    }

    const second = pet.secondSkill;

    if (!second) {
      return `<div class="pet-card-spec">第二スキル: なし</div>`;
    }

    if (!owned) {
      return `<div class="pet-card-spec">第二スキル: 購入後、Lv50で解放可能</div>`;
    }

    if (unlocked) {
      return `
        <div class="pet-card-spec" style="border-color:rgba(255,230,107,.55);background:rgba(255,230,107,.08)">
          <b>第二スキル解放済み</b><br>
          ${second.name} / CT${second.ct}秒 / ${second.desc}
        </div>
      `;
    }

    return `
      <div class="pet-card-spec" style="border-color:rgba(255,255,255,.25);background:rgba(255,255,255,.05)">
        <b>第二スキル未解放</b><br>
        ${second.name} / ${second.desc}<br>
        条件: Lv50 + ${SECOND_SKILL_UNLOCK_COIN.toLocaleString()}COIN + ${SECOND_SKILL_UNLOCK_DIAMOND}ダイヤ
      </div>
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
      const mode = getPetMode(pet.key);
      const nextCost = level >= cap ? 0 : upgradeCost(level);
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
            <span>${lockedView ? '' : `Lv${level}/${cap} +${plus}`}</span>
          </div>

          <div class="pet-card-desc">${displayRole} / ${displayUnlock}</div>

          <div class="pet-card-price">
            ${lockedView ? `条件: ${displayUnlock}` : `購入 ${Number(pet.price || 0).toLocaleString()} COIN / COIN ${getCoin().toLocaleString()} / ダイヤ ${getDiamond().toLocaleString()} / ルビー ♦${getRuby().toLocaleString()}`}
          </div>

          <div class="pet-card-spec">
            ${lockedView ? 'LOCK' : `${owned ? '所持中' : '未所持'} ${equipped ? '/ 装備中' : ''}`}
          </div>

          <div class="pet-card-spec">
            ${lockedView ? '？？？' : `通常 ${Math.round(pet.normalAttackRate * normalLevelRate(level) * plusPowerRate(plus) * 100)}% / 連射 ${Math.round(pet.normalRateRate * 100)}% / 通常ワイド+${normalWideBonus(level, pet, plus)}`}
          </div>

          <div class="pet-card-spec">
            ${lockedView ? '？？？' : `第一スキル: ${pet.skillName} / CT${Math.round(skillCooldown(pet, level, plus) * 10) / 10}秒 / スキルワイド+${skillWideBonus(level, pet)} / +強化Tier${plusSkillTier(plus)}`}
          </div>

          ${secondSkillHtml(pet, owned, level, secondUnlocked, lockedView)}

          <div class="pet-card-spec">
            ${lockedView ? '解放後に性能表示' : `+効果: +1毎パワー+0.1% / +5毎CT-0.1秒 / +10毎スキル強化 / +50通常ワイド+1`}
          </div>

          ${petModeHtml(pet, mode, owned, lockedView)}
        </div>

        <div class="pet-card-actions">
          <button type="button" class="pet-card-btn ${equipped ? 'equipped' : ''}" ${mainButtonDisabled ? 'disabled' : ''}>
            ${mainButtonText}
          </button>

          <button type="button" class="pet-upgrade-btn" ${(!owned || level >= cap || !pet.implemented || !unlockOk) ? 'disabled' : ''}>
            Lv強化<br>${level >= cap ? 'MAX' : nextCost.toLocaleString()}
          </button>

          <button type="button" class="pet-upgrade-btn pet-second-btn" ${(!canSecondUnlock || !pet.implemented || !unlockOk) ? 'disabled' : ''}>
            第二解放<br>${secondUnlocked ? '解放済' : '100000C+50D'}
          </button>

          <button type="button" class="pet-upgrade-btn pet-plus-btn" ${(!owned || plus >= MAX_PLUS || !pet.implemented || !unlockOk) ? 'disabled' : ''}>
            +強化<br>${plus >= MAX_PLUS ? 'MAX' : '♦' + plusCost}
          </button>
        </div>
      `;

      const mainBtn = card.querySelector('.pet-card-btn');
      const upgradeBtn = card.querySelector('.pet-upgrade-btn:not(.pet-plus-btn):not(.pet-second-btn)');
      const secondBtn = card.querySelector('.pet-second-btn');
      const plusBtn = card.querySelector('.pet-plus-btn');

      if (mainBtn && !mainButtonDisabled) {
        mainBtn.addEventListener('click', function(){
          if (!owned) buyPet(pet.key);
          else equipPet(pet.key);
        });
      }

      if (upgradeBtn && owned && level < cap && pet.implemented && unlockOk) {
        upgradeBtn.addEventListener('click', function(){
          upgradePet(pet.key);
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

      card.querySelectorAll('.pet-mode-upgrade-btn').forEach(btn => {
        btn.addEventListener('click', function(){
          upgradePetMode(
            this.getAttribute('data-pet'),
            this.getAttribute('data-field'),
            this.getAttribute('data-pay')
          );
        });
      });

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
    renderSlots();
    renderFloatPets();
    renderOwnedList();
  }

  function init(){
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
        const secondSkill = secondUnlocked && pet.secondSkill
          ? Object.assign({}, pet.secondSkill, {
              currentCt:secondSkillCooldown(pet.secondSkill, level, plus),
              levelRate:skillLevelRate(level) * petModeSkillRate(mode),
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
          normalLevelRate:normalLevelRate(level) * plusPowerRate(plus),
          skillLevelRate:skillLevelRate(level) * (1 + plusSkillTier(plus) * 0.015),
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

    buyPet,
    equipPet,
    upgradePet,
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
    normalLevelRate,
    skillLevelRate,
    skillCooldown,
    secondSkillCooldown,
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
