// This macro must have GM permissions to properly execute

console.log("-- APPLY EFFECT SLEEP --")

// Store arguments
const sleepVictims = args[1]

// Iterate over each victim
sleepVictims.forEach((targetToken) => {
    // Retrieve token information
    const target = canvas.tokens.get(targetToken._id ? targetToken._id : targetToken.id)

    // Apply unconscious condition (CUB condition lab handles all additional rules)
    game.cub.addCondition("Unconscious", target)
    
    // Apply effects to token
    new Sequence()
    .effect()
      .file("modules/JB2A_DnD5e/Library/1st_Level/Sleep/Cloud01_01_Regular_Pink_400x400.webm")
      .attachTo(target)
      .scale(0.5)
      .opacity(0.6)
      .name(`Sleep-${target.id}`)
      .fadeIn(1000, { ease: "easeOutCubic", delay: 0 })
      .fadeOut(1000, { ease: "easeOutCubic", delay: 0 })
    .effect()
      .file("modules/JB2A_DnD5e/Library/1st_Level/Sleep/SleepSymbol01_01_Dark_Pink_400x400.webm")
      .attachTo(target)
      .scale(0.5)
      .persist()
      .name(`Sleep-Symbol-${target.id}`)
      .fadeIn(1000, { ease: "easeOutCubic", delay: 0 })
      .fadeOut(1000, { ease: "easeOutCubic", delay: 0 })
    .play()

    // Apply hooks
    const hookIdDamageApplied = Hooks.on("updateToken", (tokenDocument, _, changes) => removeUnconsciousCondition(tokenDocument, changes, target.id, hookIdDamageApplied))
    const hookIdRemoveSleepEffect = Hooks.on("preDeleteActiveEffect", (effect) => removeSleepEffect(effect, target.id, hookIdRemoveSleepEffect, hookIdDamageApplied))
  })

async function removeSleepEffect(effect, targetId, hookIdRemoveSleepEffect, hookIdDamageApplied) {
    // If the token isn't unconscious from the sleep spell, ignore
    if (effect.parent.parent.id != targetId) return
    if (effect.data.label != "Unconscious") return

    // Remove sleep effect
    Sequencer.EffectManager.endEffects({ name: `Sleep-Symbol-${targetId}` })

    // Remove hooks (we also remove the updateToken hook since, if the target isn't unconscious, we assume sleep ended)
    Hooks.off("preDeleteActiveEffect", hookIdRemoveSleepEffect)
    Hooks.off("updateToken", hookIdDamageApplied)
}

async function removeUnconsciousCondition(tokenDocument, changes, targetId, hookIdDamageApplied) {
    // If the token isn't a sleep victim and if the damage isn't negative, ignore
    if (tokenDocument.id != targetId) return
    if (!changes.dhp) return
    if (changes.dhp >= 0) return

    // Remove unconscious condition (triggers removeSleepEffect hook)
    game.cub.removeCondition("Unconscious", tokenDocument)

    // Remove hook
    Hooks.off("updateToken", hookIdDamageApplied)
}