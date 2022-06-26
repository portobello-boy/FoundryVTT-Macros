// This macro must have GM permissions to properly execute

console.log("-- APPLY EFFECT HUNGER OF HADAR --")
console.log(args)

// Store arguments
const caster = args[0].actor
const spell = await fromUuid(args[0].uuid)
const templateD = canvas.templates.get(args[0].templateId)
const concentrationId = args[0].itemUuid
const targets = args[0].targets
let hadarVictims = []

// Retrieve values for template calculations
const templateCenterX = templateD.data.x
const templateCenterY = templateD.data.y
const templateRadius = templateD.shape.radius
const canvasGridSize = game.scenes.current.dimensions.size

// Helper - Apply Blinded effect to target
function addBlindness(target) {
  const effects = target.actor.effects.filter(e => e.data.label == "Blinded")

  if (effects.length != 0) return

  hadarVictims.push(target.id)
  game.cub.addCondition("Blinded", target)
}

// Helper - Remove Blinded effect from target
function removeBlindness(target) {
  const effects = target.actor.effects.filter(e => e.data.label == "Blinded")

  if (effects.length != 0 && hadarVictims.includes(target.id)) {
    hadarVictims.splice(hadarVictims.indexOf(target.id), 1)
    game.cub.removeCondition("Blinded", target)
  }
}

// Apply Blinded to each target
targets.forEach((target) => {
  addBlindness(target)
})

// Apply Sequencer effects to 
new Sequence()
  .effect()
    .file("modules/JB2A_DnD5e/Library/Generic/Magic_Signs/ConjurationCircleIntro_02_Dark_Yellow_800x800.webm")
    .attachTo(templateD)
    .zIndex(0)
    .name(`HungerOfHadar-Intro-Circle-${templateD.id}`)
    .waitUntilFinished(-800)
    .belowTokens()
  .effect()
    .file("modules/JB2A_DnD5e/Library/Generic/Magic_Signs/ConjurationCircleLoop_02_Dark_Yellow_800x800.webm")
    .attachTo(templateD)
    .persist()
    .zIndex(0)
    .name(`HungerOfHadar-Loop-Circle-${templateD.id}`)
    .fadeIn(500, { ease: "easeOutCubic", delay: 0 })
    .fadeOut(2000, { ease: "easeOutCubic", delay: 0 })
    .belowTokens()
  .effect()
    .file("modules/JB2A_DnD5e/Library/1st_Level/Arms_Of_Hadar/ArmsOfHadar_01_Dark_Purple_500x500.webm")
    .attachTo(templateD)
    .persist()
    .zIndex(1)
    .scale(2)
    .name(`HungerOfHadar-Loop-Tentacles-${templateD.id}`)
    .fadeIn(500, { ease: "easeOutCubic", delay: 0 })
    .fadeOut(2000, { ease: "easeOutCubic", delay: 0 })
  .effect()
    .file("modules/JB2A_DnD5e/Library/2nd_Level/Darkness/Darkness_01_Black_600x600.webm")
    .attachTo(templateD)
    .persist()
    .zIndex(2)
    .opacity(0.95)
    .scale(1.4)
    .name(`HungerOfHadar-Loop-Darkness-${templateD.id}`)
    .fadeIn(500, { ease: "easeOutCubic", delay: 0 })
    .fadeOut(2000, { ease: "easeOutCubic", delay: 0 })
  .play()

async function hungerOfHadarTemplateDeleted(templateDocument) {
    // If the template deleted isn't the Hunger of Hadar template, ignore
    if(templateDocument !== templateD.document) return;

    // Play outro animation
    new Sequence()
      .effect()
        .file("modules/JB2A_DnD5e/Library/Generic/Magic_Signs/ConjurationCircleOutro_02_Dark_Yellow_800x800.webm")
        .atLocation(templateD, { cacheLocation: true })
        .zIndex(0)
        .startTime(500)
        .name(`HungerOfHadar-Outro-Circle-${templateD.id}`)
        .belowTokens()
      .play()

    // End all existing Sequencer effects
    Sequencer.EffectManager.endEffects({ name: `HungerOfHadar-Intro-Circle-${templateD.id}`, object: templateD })
    Sequencer.EffectManager.endEffects({ name: `HungerOfHadar-Loop-Circle-${templateD.id}`, object: templateD })
    Sequencer.EffectManager.endEffects({ name: `HungerOfHadar-Loop-Tentacles-${templateD.id}`, object: templateD })
    Sequencer.EffectManager.endEffects({ name: `HungerOfHadar-Loop-Darkness-${templateD.id}`, object: templateD })

    // Remove Blinded from remaining targets
    hadarVictims.forEach((targetId) => {
      const target = canvas.tokens.get(targetId)
      game.cub.removeCondition("Blinded", target)
    })
    
    // Remove hooks
    Hooks.off("preDeleteMeasuredTemplate", hookIdHungerOfHadarOutro);
    Hooks.off("updateToken", hookIdUpdateToken);
    Hooks.off("updateCombat", hookIdUpdateCombat);
}

async function hungerOfHadarConcentrationEnd(effect, render, id) {
    // If the concentration ending doesn't belong to the Hunger of Hadar spell, ignore
    if (effect.data.origin != concentrationId) return
  
    // Delete the template
    canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [templateD.id]);
  
    // Remove hook
    Hooks.off("deleteActiveEffect", hookIdConcentrationEnd)
}

async function hungerOfHadarUpdateToken(tokenDoc, delta, flags, actor) {
  // Get token center coordinates
  const tokenCenterX = tokenDoc.data.x + canvasGridSize / 2
  const tokenCenterY = tokenDoc.data.y + canvasGridSize / 2

  // Calculate distance to template center
  const distance = getDistance(templateCenterX, templateCenterY, tokenCenterX, tokenCenterY)

  // Add or remove blindness appropriately
  if (distance <= templateRadius) {
    addBlindness(tokenDoc)
  } else {
    removeBlindness(tokenDoc)
  }
}

// Helper - Get distance using Euclidean formula
function getDistance(sourceX, sourceY, destX, destY) {
  const deltaX = sourceX - destX
  const deltaY = sourceY - destY
  return Math.sqrt(deltaX ** 2 + deltaY ** 2)
}

async function hungerOfHadarUpdateCombat(combat, turn, delta, playerId) {
  // Get current and previous combat tokens
  const currentToken = canvas.tokens.get(combat.current.tokenId);
  const previousToken = canvas.tokens.get(combat.previous.tokenId);

  // Check and apply damage to tokens
  await applyEndTurnDamage(previousToken);
  await applyBeginTurnDamage(currentToken);
}

async function applyBeginTurnDamage(token) {
  // Get token center coordinates
  const tokenCenterX = token.x + canvasGridSize / 2
  const tokenCenterY = token.y + canvasGridSize / 2

  // Calculate distance to template center
  const distance = getDistance(templateCenterX, templateCenterY, tokenCenterX, tokenCenterY)

  // If not within radius of Hunger of Hadar, ignore
  if (distance > templateRadius) return

  // Push notification to game
  ui.notifications.notify(`${token.data.name} beginning turn inside of Hunger of Hadar radius`)

  // Generate spell item based on conditions
  const itemData = mergeObject(duplicate(spell.data), {
    name: "Hunger of Hadar - Begin Turn Damage",
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
      damage: { parts: [[`2d6`, "cold"]] },
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
  const options = { showFullCard: false, createWorkflow: true, versatile: false, configureDialog: false, targetUuids: [token.document.uuid] };

  // Submit to MidiQOL
  await MidiQOL.completeItemRoll(item, options);
}

async function applyEndTurnDamage(token) {
  // Get token center coordinates
  const tokenCenterX = token.x + canvasGridSize / 2
  const tokenCenterY = token.y + canvasGridSize / 2

  // Calculate distance to template center
  const distance = getDistance(templateCenterX, templateCenterY, tokenCenterX, tokenCenterY)

  // If not within radius of Hunger of Hadar, ignore
  if (distance > templateRadius) return

  // Push notification to game
  ui.notifications.notify(`${token.data.name} has finished its turn inside of Hunger of Hadar radius`)

  // Generate spell item based on conditions
  const itemData = mergeObject(duplicate(spell.data), {
    name: "Hunger of Hadar - End Turn Damage",
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
      damage: { parts: [[`2d6`, "acid"]] },
      duration: {units: "inst", value: undefined},
      actionType: "save",
      weaponType: "improv",
      save: {
        ability: "dex",
        dc: caster.data.data.attributes.spelldc,
        scaling: "spell"
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
  const options = { showFullCard: false, createWorkflow: true, versatile: false, configureDialog: false, targetUuids: [token.document.uuid] };

  // Submit to MidiQOL
  await MidiQOL.completeItemRoll(item, options);
}

// Apply hooks
const hookIdHungerOfHadarOutro = Hooks.on("preDeleteMeasuredTemplate", (templateDocument) => hungerOfHadarTemplateDeleted(templateDocument));
const hookIdConcentrationEnd = Hooks.on("deleteActiveEffect", (effect, render, id) => hungerOfHadarConcentrationEnd(effect, render, id));
const hookIdUpdateToken = Hooks.on("updateToken", (tokenDoc, delta, flags, actor) => hungerOfHadarUpdateToken(tokenDoc, delta, flags, actor));
const hookIdUpdateCombat = Hooks.on("updateCombat", (combat, turn, delta, playerId) => hungerOfHadarUpdateCombat(combat, turn, delta, playerId));