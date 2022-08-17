// This macro must have GM permissions to properly execute

console.log("-- APPLY EFFECT SPIRITUAL WEAPON --")

console.log(args)

const caster = await fromUuid(args[0].tokenUuid)
const spell = await fromUuid(args[0].itemUuid)
const userIdCaster = args[1]
const userIdGm = game.userId // Since this script should be executed at the GM level, this should always be the GM
const templateD = canvas.templates.get(args[0].templateId)
let chatMessage = game.messages.get(args[0].itemCardId)

async function doWeaponAttack() {
    const user = game.users.get(userIdCaster)
    const targets = user.targets

    console.log(user, targets)
    if (targets.size == 0) {
        ui.notifications.notify("No targets? :(")
    }
}

async function applyEffect() {
    new Sequence()
        .effect()
            .file("modules/JB2A_DnD5e/Library/2nd_Level/Spiritual_Weapon/SpiritualWeapon_Maul01_01_Spectral_Blue_200x200.webm")
            .attachTo(templateD)
            .name(`SpiritualWeapon-Loop-${templateD.id}`)
            .fadeIn(500, { ease: "easeOutCubic", delay: 0 })
            .persist()
            .fadeOut(2000, { ease: "easeOutCubic", delay: 0 })
            .randomRotation()
            .randomizeMirrorY() 
        .play()

    await Requestor.request({
        whisper: [userIdGm, userIdCaster],
        description: "Attack with Spiritual Weapon?",
        img: spell.data.img,
        buttonData: [{
            label: "Spiritual Weapon Attack",
            // action: doWeaponAttack
            action: () => {
                console.log(caster)
            }
        }]
    });
}

await applyEffect()

/*
    TODO:
        Create chat message popup upon creation and when template is moved
        Clicking chat message button triggers attack on target
        
    NOTES:
        Damage formula: (floor((@item.level) / 2))d8 + @mod
*/