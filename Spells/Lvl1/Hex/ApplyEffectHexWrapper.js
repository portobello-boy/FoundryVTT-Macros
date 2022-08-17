console.log("-- APPLY EFFECT HEX WRAPPER --")

const spellTargets = args[0].targets
const spellActor = await fromUuid(args[0].actorUuid)
const spellItem = await fromUuid(args[0].itemUuid)
const hexUuid = args[0].itemUuid

// Set hookId variable
let hookIdHexDamage = -1
let hookIdRemoveHexDamage = -1

// Create dialogue popup
new Dialog({
  title: 'Choose a damage type',
  content: `
    <form class="flexcol">
      <div class="form-group">
        <select id="stat">
          <option value="str">Strength</option>
          <option value="dex">Dexterity</option>
          <option value="con">Constitution</option>
          <option value="int">Intelligence</option>
          <option value="wis">Wisdom</option>
          <option value="cha">Charisma</option>
        </select>
      </div>
    </form>
  `,
  buttons: {
    yes: {
      icon: '<i class="fas fa-bolt"></i>',
      label: 'Select',
      callback: async (html) => {
        const stat = html.find('#stat').val()

        spellTargets.forEach(async (targetToken) => {
          // If the target token already has hex applied, return
          if (targetToken.actor.effects._source.find((ae) => ae.origin == hexUuid)) return

          // Apply hook
          hookIdHexDamage = Hooks.on("midi-qol.RollComplete", (workflow) => addHexDamage(workflow))
          hookIdRemoveHexDamage = Hooks.on("deleteActiveEffect", (effect) => removeHexDamage(effect))
          console.log(`Created hook ${hookIdHexDamage} (hookIdHexDamage) and ${hookIdRemoveHexDamage} (hookIdRemoveHexDamage)`)

          // Call the GM-level Apply-Effect-Hex macro
          game.macros.getName("Apply-Effect-Hex").execute(args[0], stat, targetToken)
        })
      },
    },
  }
}).render(true);

// When an attack/damage roll is completed, apply hex damage to target token
async function addHexDamage(workflow) {
  console.log("-- ADD HEX DAMAGE --")
  console.log(workflow)

  // If damage is triggered by hex itself, don't apply it
  if (workflow.itemUuid == hexUuid) return

  // Retrieve damaged targets which have the hex effect
  const targets = [...workflow.applicationTargets].filter((target) => target.document.actor.data.effects._source.find((ae) => ae.origin == hexUuid))

  // If there are no targets with this hex effect, return
  if (!targets.length) return

  // If the aggressor is not the caster of this hex effect, return
  if (workflow.actor.id != spellActor.id) return

  // Retrieve attack card data
  const itemCardId = workflow.itemCardId
  let chatMessage = await game.messages.get(itemCardId)
  let content = await duplicate(chatMessage.data.content)

  // Roll necrotic damage for hex
  let damageRoll = new Roll(`1d6`).evaluate({ async: false })
  console.log(`Roll parameters`, damageRoll, game.user)
  game.dice3d.showForRoll(damageRoll, game.user, true)
    .then(async (rolled) => {
      if (!rolled) return
      
      targets.forEach((target) => {
        // Apply damage to token using the Hex spellItem
        MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: "necrotic" }], damageRoll.total, new Set([target]), spellItem, new Set())
      })
    
      // Prepare roll info for attack card
      const dataIdCount = (chatMessage.data.content.match(/data-id=/g) || []).length;
      const cardDamageRow = `	
        <div class="dice-roll red-dual" data-id="${dataIdCount}" data-group="4" data-type="damage">
          <div class="br5e-roll-label">Damage - Necrotic (Hex)</div>
          <div class="dice-result">
            <div class="dice-formula dice-tooltip">1d6</div>
              <div class="dice-row tooltips">
                <div class="tooltip dual-left dice-row-item">
                  <div class="dice-tooltip">
                  <section class="tooltip-part">
                      <div class="dice">
                          <header class="part-header flexrow">
                              <span class="part-formula">1d6</span>
                              
                              <span class="part-total">${damageRoll.total}</span>
                          </header>
                          <ol class="dice-rolls">
                              <li class="roll die d6">4</li>
                          </ol>
                      </div>
                  </section>
                </div>
                </div>
                  </div>
                  <div class="dice-row">
                <h4 class="dice-total dice-row-item red-damage" data-damagetype="force">
                  <div class="red-base-die inline red-base-damage " data-value="${damageRoll.total}">${damageRoll.total}</div>
                  
                </h4>
              </div>
            
            </div>
        </div>`
      const searchString = /<div class="midi-qol-hits-display"><div class="midi-qol-single-hit-card">/g
      const replaceString = `${cardDamageRow}<div class="midi-qol-hits-display"><div class="midi-qol-single-hit-card">`
    
      // Insert hex result into attack card and update
      content = await content.replace(searchString, replaceString)
      await chatMessage.update({ content: content })
    })
}

// When the effect ends, remove hex damage effect from the target token
async function removeHexDamage(effect) {
  console.log("-- REMOVE HEX EFFECT --")

  // If the effect is not a hex effect, ignore
  if (effect.data.origin != hexUuid) return

  console.log(`Removing hooks ${hookIdRemoveHexDamage} (hookIdRemoveHexDamage) and ${hookIdHexDamage} (hookIdHexDamage)`)

  Hooks.off("midi-qol.RollComplete", hookIdHexDamage)
  Hooks.off("deleteActiveEffect", hookIdRemoveHexDamage)
}

/*
  TODO:
    Refactor code so most of it is in the GM level macro
*/