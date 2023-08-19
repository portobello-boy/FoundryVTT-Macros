// This macro must have GM permissions to properly execute

console.log("-- APPLY EFFECT HUNGER OF HADAR --")

const args = scope.args
const item = scope.item

// Store arguments
const caster = await fromUuid(args[0].actorUuid)
const spell = await fromUuid(item.itemUuid)
const templateD = await fromUuid(args[0].templateUuid)
const concentrationId = args[0].itemUuid
const targets = args[0].targets
let hadarVictims = []
let ambientSoundIds = []

// Retrieve values for template calculations
const canvasGridSize = game.scenes.current.dimensions.size
const canvasGridDistance = game.scenes.current.dimensions.distance
const templateCenterX = templateD.x
const templateCenterY = templateD.y
const templateRadius = templateD.object.shape.radius
const templateRadiusFeet = (templateRadius/canvasGridSize) * canvasGridDistance

// Helper - Apply Blinded effect to target
function addBlindness(target) {
  console.log(target)
  const actor = target.actor ? target.actor : game.actors.get(target.actorId)
  const effects = actor.effects.filter(e => e.label == "Blinded")

  if (effects.length != 0) return

  hadarVictims.push(target.id)
  game.cub.addCondition("Blinded", target)
}

// Helper - Remove Blinded effect from target
function removeBlindness(target) {
  const effects = target.actor.effects.filter(e => e.label == "Blinded")

  if (effects.length != 0 && hadarVictims.includes(target.id)) {
    hadarVictims.splice(hadarVictims.indexOf(target.id), 1)
    game.cub.removeCondition("Blinded", target)
  }
}

// Helper - Get distance using Euclidean formula
function getDistance(sourceX, sourceY, destX, destY) {
  const deltaX = sourceX - destX
  const deltaY = sourceY - destY
  return Math.sqrt(deltaX ** 2 + deltaY ** 2)
}

// Helper - Get distance between token and Hunger of Hadar center
function getDistanceFromSpellTemplate(token, templateD) {
  // Get token center coordinates
  const tokenCenterX = token.x + (canvasGridSize * token.width) / 2
  const tokenCenterY = token.y + (canvasGridSize * token.width) / 2

  return getDistance(tokenCenterX, tokenCenterY, templateD.x, templateD.y)
}

// Helper - Apply damage at the beginning of a token's turn
async function applyBeginTurnDamage(token) {
  // Calculate distance from token to template center
  const distance = getDistanceFromSpellTemplate(token, templateD)

  // If not within radius of Hunger of Hadar, ignore
  if (distance > templateRadius) return

  // Push notification to game
  ui.notifications.notify(`${token.name} beginning turn inside of Hunger of Hadar radius`)

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
    system: {
      castedLevel: 0,
      level: 0,
      components: { concentration: false },
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

  console.log(itemData)
  console.log(item)

  // Submit to MidiQOL
  await MidiQOL.completeItemRoll(item, options);
}

// Helper - Apply damage at the end of a token's turn
async function applyEndTurnDamage(token) {
  // Calculate distance from token to template center
  const distance = getDistanceFromSpellTemplate(token, templateD)

  console.log(distance, token, templateD)

  // If not within radius of Hunger of Hadar, ignore
  if (distance > templateRadius) return

  // Push notification to game
  ui.notifications.notify(`${token.name} has finished its turn inside of Hunger of Hadar radius`)

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
    system: {
      castedLevel: 0,
      level: 0,
      components: { concentration: false },
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

async function applyEffect() {
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

    // Create Ambient Sounds
    const soundData = [{
        x: templateD.x,
        y: templateD.y,
        radius: templateRadiusFeet + 2*canvasGridDistance,
        path: "music/Sound%20Effects/Spells/hungerOfHadar/whispers.mp3",
        repeat: true,
        volume: 0.5,
        walls: true,
        easing: true,
        hidden: false,
        darkness: {min: 0, max: 1}
      },
      {
        x: templateD.x,
        y: templateD.y,
        radius: templateRadiusFeet + 2*canvasGridDistance,
        path: "music/Sound%20Effects/Spells/hungerOfHadar/squelching.mp3",
        repeat: true,
        volume: 1,
        walls: true,
        easing: true,
        hidden: false,
        darkness: {min: 0, max: 1}
    }];
    
    // Place Ambient Sounds in the scene
    const ambientSounds = await canvas.scene.createEmbeddedDocuments("AmbientSound", soundData);
    console.log(ambientSounds)
    
    ambientSounds.forEach((sound) => {
      console.log(sound)
      ambientSoundIds.push(sound.id)
    })
}

async function removeEffect() {
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

  console.log(ambientSoundIds)
  await canvas.scene.deleteEmbeddedDocuments("AmbientSound", ambientSoundIds)
}

await applyEffect()

async function hook_templateDeleted(templateDocument) {
    // If the template deleted isn't the Hunger of Hadar template, ignore
    if(templateDocument !== templateD.document) return;

    removeEffect()
    
    // Remove hooks
    Hooks.off("preDeleteMeasuredTemplate", hookId_templateDeleted);
    Hooks.off("updateToken", hookId_updateToken);
    Hooks.off("combatTurn", hookId_combatTurn);
}

async function hook_concentrationEnded(effect, render, id) {
    // If the concentration ending doesn't belong to the Hunger of Hadar spell, ignore
    if (effect.origin != concentrationId) return
  
    // Delete the template
    canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [templateD.id]);
  
    // Remove hook
    Hooks.off("deleteActiveEffect", hookId_deleteActiveEffect)
}

async function hook_tokenWithinTemplate(tokenDoc, delta, flags, actor) {
  // Calculate distance from token to template center
  const distance = getDistanceFromSpellTemplate(tokenDoc, templateD)

  // Add or remove blindness appropriately
  if (distance <= templateRadius) {
    addBlindness(tokenDoc)
  } else {
    removeBlindness(tokenDoc)
  }
}

async function hook_turnChangeDamage(combat, turn, delta) {
  console.log("COMBAT")
  console.log(combat)

  console.log(combat.previous.tokenId, combat.current.tokenId)
  console.log(await canvas.tokens.get(combat.previous.tokenId), await canvas.tokens.get(combat.current.tokenId))

  // Get current and previous combat tokens
  const previousToken = await canvas.tokens.get(combat.previous.tokenId);
  const currentToken = await canvas.tokens.get(combat.current.tokenId);

  console.log(previousToken, currentToken)

  // Check and apply damage to tokens
  await applyEndTurnDamage(previousToken);
  await applyBeginTurnDamage(currentToken);
}

// Apply hooks
const hookId_templateDeleted = Hooks.on("preDeleteMeasuredTemplate", (templateDocument) => hook_templateDeleted(templateDocument));
const hookId_deleteActiveEffect = Hooks.on("deleteActiveEffect", (effect, render, id) => hook_concentrationEnded(effect, render, id));
const hookId_updateToken = Hooks.on("updateToken", (tokenDoc, delta, flags, actor) => hook_tokenWithinTemplate(tokenDoc, delta, flags, actor));
const hookId_combatTurn = Hooks.on("combatTurn", (combat, turn, delta) => hook_turnChangeDamage(combat, turn, delta));

/*
    TODO:
        Correctly apply blinded effect to large+ entities
*/