'use strict';

(function(){
  function updateMidBoss(e, tools){
    if (
      window.MobShotBossAI &&
      window.MobShotBossAI.updateMidBoss
    ) {
      window.MobShotBossAI.updateMidBoss(e, tools);
    }
  }

  function updateBoss(e, tools){
    if (
      window.MobShotBossAI &&
      window.MobShotBossAI.updateBoss
    ) {
      window.MobShotBossAI.updateBoss(e, tools);
    }
  }

  window.MobShotBoss = {
    updateMidBoss,
    updateBoss
  };
})();
