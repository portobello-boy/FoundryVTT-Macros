// This is a DAE macro

console.log(args)
let tokenD = canvas.tokens.get(args[1].tokenId)
//console.log(token)

if (args[0] == "on") {

  new Sequence()
    .effect()
      .file("modules/JB2A_DnD5e/Library/Generic/Fire/FireRing_01_Circle_Red_500.webm")
      .attachTo(tokenD)
      .scale(0.15)
      .persist()
      .name(`Rage-${tokenD.id}`)
      .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
      .fadeOut(1500)
      .opacity(0.7)
      .belowTokens(false)
    .effect()
      .file("modules/JB2A_DnD5e/Library/Generic/Impact/GroundCrackImpact_01_Regular_Orange_600x600.webm")
      .atLocation(tokenD)
      .scale(0.4)
      .fadeOut(1500)
      .opacity(0.7)
      .belowTokens(true)
    .sound()
      .file("music/D&D Ambiance/Sound Effects/Lion Roar.mp3")
      .volume(0.2)
      .startTime(1000)
      .fadeOutAudio(500)
    .play()
}

if (args[0] == "off") {
  Sequencer.EffectManager.endEffects({ name: `Rage-${tokenD.id}`, object: tokenD });
}