/**
 * Creates an animation for a ranged attack
 * @param {tokenDocument} attacker Token document of the attacker
 * @param {tokenDocument} target Token document of the target
 * @param {boolean} missed Boolean determining if the attack hit or missed
 * @param {string} animationPath File path of the desired animation
 */
export async function rangedAttackAnimation(attacker, target, missed, animationPath) {
    new Sequence()
        .effect()
            .file(animationPath)
            .atLocation(attacker)
            .reachTowards(target)
            .missed(missed)
        .play()
}