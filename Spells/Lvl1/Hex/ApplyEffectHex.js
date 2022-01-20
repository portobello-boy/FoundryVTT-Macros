// This macro must have GM permissions to properly execute

console.log("-- APPLY EFFECT HEX  --")

const spellItem = await fromUuid(args[0].itemUuid)
const hexUuid = args[0].itemUuid
const spellSlot = args[0].powerLevel
const stat = args[1]
const targetToken = args[2]
const hookIdHexDamage = args[3]

let hexEffectIds = []

// Apply hooks
let hookIdRemoveHex = Hooks.on("preDeleteActiveEffect", (effect) => removeHexEffect(effect))

// Create active effect for hex
const hexEffect = {
    changes: [{ key: `flags.midi-qol.disadvantage.ability.check.${stat}`, mode: 2, value: 1, priority: 20 }],
    origin: hexUuid,
    label: spellItem.name,
    icon: spellItem.img,
    duration: {
        "seconds": 3600 * (spellSlot >= 5 ? 24 : (spellSlot >= 3 ? 8 : 1)), startTime: game.time.worldTime
    },
}

let hexEffectId = ""
const target = canvas.tokens.get(targetToken.id)

// Apply active effect to target token and store effect ID for later
await target.actor.createEmbeddedDocuments("ActiveEffect", [hexEffect])
    .then((res) => {
        hexEffectId = res[0].id
        hexEffectIds.push(hexEffectId)
    })

// Create and apply effect to target token
new Sequence()
    .effect()
    .file("modules/JB2A_DnD5e/Library/Generic/Marker/MarkerHorror_03_Regular_Purple_400x400.webm")
    .attachTo(target)
    .scale(targetToken.data.width < 2 ? 0.6 : 1)
    .persist()
    .name(`Hex-${hexEffectId}`)
    .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
    .fadeOut(1500)
    .opacity(0.7)
    .belowTokens(targetToken.data.width < 3 ? true : false)
    .play()

// When the effect ends, remove hex effects on the target token
async function removeHexEffect(effect) {
    console.log("-- REMOVE HEX EFFECT --")

    // If the effect is not a hex effect, ignore
    if (!hexEffectIds.includes(effect.id)) return

    Sequencer.EffectManager.endEffects({ name: `Hex-${effect.id}` });

    Hooks.off("midi-qol.RollComplete", hookIdHexDamage)
    Hooks.off("preDeleteActiveEffect", hookIdRemoveHex)
}