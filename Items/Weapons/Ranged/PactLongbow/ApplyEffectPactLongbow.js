console.log("-- APPLY EFFECT PACT LONGBOW --")

const attacker = canvas.tokens.get(args[0].tokenId)
const target = args[0].targets[0]
const missed = args[0].hitTargets.length === 0

new Sequence()
    .effect()
        .file({
            "05ft": "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow02_01_Regular_Purple_Physical_05ft_600x400.webm",
            "15ft": "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow02_01_Regular_Purple_Physical_15ft_1000x400.webm",
            "30ft": "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow02_01_Regular_Purple_Physical_30ft_1600x400.webm",
            "60ft": "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow02_01_Regular_Purple_Physical_60ft_2800x400.webm",
            "90ft": "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow02_01_Regular_Purple_Physical_90ft_4000x400.webm"
        })
        .atLocation(attacker)
        .stretchTo(target)
        .template({ gridSize: 200, startPoint: 200, endPoint: 200 })
        .missed(missed)
    .play()