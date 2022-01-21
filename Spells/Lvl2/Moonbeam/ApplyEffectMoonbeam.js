console.log(args)
let templateD = canvas.templates.get(args[0].templateId)
console.log(templateD)

new Sequence()
  .effect()
    .file("modules/JB2A_DnD5e/Library/2nd_Level/Moonbeam/MoonbeamIntro_01_Regular_Blue_400x400.webm")
    .attachTo(templateD)
    .scale(0.38)
    .name(`Moonbeam-Intro-${templateD.id}`)
    .waitUntilFinished(-800)
  .effect()
    .file("modules/JB2A_DnD5e/Library/2nd_Level/Moonbeam/Moonbeam_01_Regular_Blue_400x400.webm")
    .attachTo(templateD)
    .scale(0.38)
    .extraEndDuration(800)
    .persist()
    .name(`Moonbeam-Loop-${templateD.id}`)
    .fadeIn(500, { ease: "easeOutCubic", delay: 0 })
  .play()

async function moonbeamTemplateDeleted(templateDocument){
    if(templateDocument !== templateD.document) {
      return;
    }
    // Do stuff here
    Sequencer.EffectManager.endEffects({ name: `Moonbeam-Loop-${templateD.id}`, object: templateD });

    new Sequence()
      .effect()
        .file("modules/JB2A_DnD5e/Library/2nd_Level/Moonbeam/MoonbeamOutro_01_Regular_Blue_400x400.webm")
        .atLocation(templateD)
        .scale(0.38)
        .startTime(500)
        .name(`Moonbeam-Intro-${templateD.id}`)
      .play()

    
    Hooks.off("preDeleteMeasuredTemplate", hookId);
}

let hookId = Hooks.on("preDeleteMeasuredTemplate", (templateDocument) => moonbeamTemplateDeleted(templateDocument));
console.log(hookId)