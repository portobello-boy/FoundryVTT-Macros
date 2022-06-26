// This is a DAE macro

console.log(args)
let tokenD = canvas.tokens.get(args[1].tokenId)
// console.log(tokenD)

if (args[0] == "on") {

    new Sequence()
        .effect()
        .file("modules/JB2A_DnD5e/Library/Generic/Marker/MarkerShield_03_Regular_Green_400x400.webm")
        .attachTo(tokenD)
        .scale(0.75)
        .persist()
        .name(`BladeWard-${tokenD.id}`)
        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
        .fadeOut(1500)
        .opacity(0.7)
        .belowTokens(true)
        .play()
}

if (args[0] == "off") {
    Sequencer.EffectManager.endEffects({ name: `BladeWard-${tokenD.id}`, object: tokenD });
}