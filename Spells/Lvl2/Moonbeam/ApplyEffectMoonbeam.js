console.log(args)
let templateD = canvas.templates.get(args[0].templateId)
let concentrationId = args[0].itemUuid
console.log(templateD)

new Sequence()
  .effect()
    .file("modules/JB2A_DnD5e/Library/2nd_Level/Moonbeam/MoonbeamIntro_01_Regular_Blue_400x400.webm")
    .attachTo(templateD)
    .scale(0.5)
    .name(`Moonbeam-Intro-${templateD.id}`)
    .waitUntilFinished(-800)
  .effect()
    .file("modules/JB2A_DnD5e/Library/2nd_Level/Moonbeam/Moonbeam_01_Regular_Blue_400x400.webm")
    .attachTo(templateD)
    .scale(0.5)
    .extraEndDuration(1000)
    .persist()
    .name(`Moonbeam-Loop-${templateD.id}`)
    .fadeIn(500, { ease: "easeOutCubic", delay: 0 })
  .play()

async function moonbeamTemplateDeleted(templateDocument) {
    if(templateDocument !== templateD.document) return;

    // Play outro animation
    let outro = new Sequence()
    .effect()
      .file("modules/JB2A_DnD5e/Library/2nd_Level/Moonbeam/MoonbeamOutro_01_Regular_Blue_400x400.webm")
      .atLocation(templateD, { cacheLocation: true })
      .scale(0.5)
      .fadeIn(600, { ease: "easeOutCubic", delay: 500 })
      .startTime(500)
      .name(`Moonbeam-Outro-${templateD.id}`)
    .play()

    Sequencer.EffectManager.endEffects({ name: `Moonbeam-Loop-${templateD.id}`, object: templateD })

    
    Hooks.off("preDeleteMeasuredTemplate", hookIdMoonbeamOutro);
}

async function moonbeamConcentrationEnd(effect, render, id) {
  if (effect.data.origin != concentrationId) return

  console.log("CONCENTRATION OVER!")

  canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [templateD.id]);

  Hooks.off("deleteActiveEffect", hookIdConcentrationEnd)
}

let hookIdMoonbeamOutro = Hooks.on("preDeleteMeasuredTemplate", (templateDocument) => moonbeamTemplateDeleted(templateDocument));
let hookIdConcentrationEnd = Hooks.on("deleteActiveEffect", (effect, render, id) => moonbeamConcentrationEnd(effect, render, id));