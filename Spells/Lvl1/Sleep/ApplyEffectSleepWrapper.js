console.log("-- APPLY EFFECT SLEEP WRAPPER --")

// Store arguments
const templateD = canvas.templates.get(args[0].templateId)
let sleepPool = args[0].damageTotal
let sleepTargets = args[0].targets
sleepTargets.sort((a, b) => a._actor.data.data.attributes.hp.value - b._actor.data.data.attributes.hp.value)
let sleepVictims = []

console.log(sleepTargets)

// Iterate over each sleep target
sleepTargets.forEach((target) => {
  // Get HP value
  const hp = target._actor.data.data.attributes.hp.value
  console.log(hp)

  // Get condition immunities
  const immunities = target._actor.data.data.traits.ci.value
  console.log(immunities)

  // Fetch creature type (use placeholder if label doesn't exist, we just care about Undead)
  const creatureType = target._actor.labels.creatureType ? target._actor.labels.creatureType : "creatureType"
  console.log(creatureType)

  // If the target is immune to being charmed, ignore
  if (immunities.includes('charmed')) return
  
  // If the target is an undead, ignore
  if (creatureType == 'Undead') return

  // If this HP would reduce health pool below zero, ingore
  if (sleepPool - hp < 0) return

  // Reduce from the total health pool
  sleepPool -= hp

  // Add to list of victims
  sleepVictims.push(target)
})

// Delete template since it's not needed any more
canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [templateD.id]);

// Call GM-level macro to apply effects and conditions
game.macros.getName("Apply-Effect-Sleep").execute(args[0], sleepVictims)