// This macro must have GM permissions to properly execute

console.log("-- APPLY EFFECT ARMOR OF AGATHYS --")
console.log(args)

// Store arguments
const casterId = args[0].actorUuid
let caster = await fromUuid(casterId)
const casterToken = await fromUuid(args[0].tokenUuid)
const spell = await fromUuid(args[0].itemUuid)
const spellLevel = parseInt(args[0].spellLevel)

// Add temp hp to caster
await caster.update({"data.attributes.hp.temp": 5 * spellLevel});

// Add spell effects
new Sequence()
  .effect()
    .file("modules/JB2A_DnD5e/Library/Generic/Ice/ShieldIceBelow01_01_Regular_Blue_400x400.webm")
    .attachTo(casterToken)
    .scale(0.4)
    .randomRotation()
    .randomizeMirrorX()
    .randomizeMirrorY()
    .persist()
    .name(`ArmorOfAgathys-Loop-Shield-Below-${caster.id}`)
    .fadeIn(500, { ease: "easeOutCubic", delay: 0 })
    .fadeOut(2000, { ease: "easeOutCubic", delay: 0 })
    .belowTokens()
  .effect()
    .file("modules/JB2A_DnD5e/Library/Generic/Ice/ShieldIceAbove01_01_Regular_Blue_400x400.webm")
    .attachTo(casterToken)
    .scale(0.4)
    .randomRotation()
    .randomizeMirrorX()
    .randomizeMirrorY()
    .persist()
    .name(`ArmorOfAgathys-Loop-Shield-Above-${caster.id}`)
    .fadeIn(500, { ease: "easeOutCubic", delay: 0 })
    .fadeOut(2000, { ease: "easeOutCubic", delay: 0 })
  .play()

async function removeArmorOfAgathys() {
  // Remove temp hp from caster
  await caster.update({"data.attributes.hp.temp": 0});

  // End spell effects
  Sequencer.EffectManager.endEffects({ name: `ArmorOfAgathys-Loop-Shield-Below-${caster.id}`})
  Sequencer.EffectManager.endEffects({ name: `ArmorOfAgathys-Loop-Shield-Above-${caster.id}`})

  // Remove hooks
  Gametime.ElapsedTime.gclearTimeout(hookIdArmorOfAgathysDurationDone)
  Hooks.off("midi-qol.damageApplied", hookIdArmorOfAgathysDamageApplied);
}

async function armorOfAgathysDamageApplied(tokenDoc, delta) {
    // If the victim is not the same as the caster, ignore
    if (tokenDoc.actor.uuid != casterId) return;

    // Draw frost damage effect towards attacker
    const attacker = await fromUuid(delta.workflow.tokenUuid)
    console.log(tokenDoc, delta)
    new Sequence()
      .effect()
        .file("modules/JB2A_DnD5e/Library/Generic/Impact/PartSideImpactFastIceShard01_01_Regular_Blue_600x600.webm")
        .scale(0.4)
        .attachTo(casterToken)
        .rotateTowards(attacker)
      .play()

    // Apply damage to attacker if the attack is melee
    if (delta.item.data.data.actionType[0] == "m") {
        const itemData = mergeObject(duplicate(spell.data), {
            name: "Armor of Agathys - Impact Damage",
            flags: {
                "midi-qol": {
                    noProvokeReaction: true, // no reactions triggered
                    onUseMacroName: null,
                    onUseMacroParts: null
                },
            },
            data: {
                castedLevel: 0,
                level: 0,
                damage: { parts: [[`${5 * spellLevel}`, "cold"]] },
                duration: {units: "inst", value: undefined},
                actionType: "other",
                weaponType: "improv",
                save: {
                  ability: "",
                  dc: null,
                  scaling: ""
                },
                target: {
                  type: "creature",
                  units: "",
                  value: 1,
                  width: null
                }
            }
        }, {overwrite: true, inlace: true, insertKeys: true, insertValues: true});

        // Generate item and options
        const item = new CONFIG.Item.documentClass(itemData, { parent: caster });
        const options = { showFullCard: false, createWorkflow: true, versatile: false, configureDialog: false, targetUuids: [delta.workflow.tokenUuid] };

        // Submit to MidiQOL
        await MidiQOL.completeItemRoll(item, options);
    }

    // If the temp damage does not equal old temp hp, then there is remaining temp hp, and ignore
    if (delta.ditem.tempDamage != delta.ditem.oldTempHP) return;

    removeArmorOfAgathys()
}

// Apply hooks
const hookIdArmorOfAgathysDamageApplied = Hooks.on("midi-qol.damageApplied", (tokenDoc, delta) => armorOfAgathysDamageApplied(tokenDoc, delta));

// Set timer to end Armor of Agathys effect
const hookIdArmorOfAgathysDurationDone = Gametime.doIn(60 * 60, () => {
  ui.notifications.notify(`${caster.name}'s Armor of Agathys is done!`)
  removeArmorOfAgathys()
})

/*
    TODO:
        Cancel effect if temp HP is manually changed
        Try to time the impact damage effect from ranged attacks with the arrival of the projectile
*/