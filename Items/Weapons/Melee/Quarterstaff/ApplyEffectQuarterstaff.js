console.log("-- APPLY EFFECT QUARTERSTAFF --")

const attacker = canvas.tokens.get(args[0].tokenId)
const target = args[0].targets[0]
const missed = args[0].hitTargets.length === 0

new Sequence()
    .effect()
        .file("customJB2AAssets/Weapons/Melee/Quarterstaff/Quarterstaff02_0{{number}}_Regular_Purple_800x600.webm")
        .setMustache({
            "number": () => {
                return Math.floor(Math.random() * 6) + 1;
            }
        })
        .atLocation(attacker)
        .stretchTo(target)
        .template({ gridSize: 200, startPoint: 300, endPoint: 300 })
        .randomizeMirrorY()
        .missed(missed)
        .waitUntilFinished(-1000)
    .effect()
        .file("customJB2AAssets/Weapons/Melee/Generic/WeaponAttack/DmgBludgeoning_01_Regular_Yellow_2Handed_800x600.webm")
        .atLocation(attacker)
        .stretchTo(target)
        .template({ gridSize: 200, startPoint: 300, endPoint: 300 })
        .playIf(!missed)
    .play()

/*
    TODO:
        Time the 2 handed bludgeoning effect to the impact of each variation of the quarterstaff attack
*/