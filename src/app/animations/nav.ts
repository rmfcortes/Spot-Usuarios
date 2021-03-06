import { Animation } from '@ionic/core'
import { AnimationController } from '@ionic/angular'

export function enterPageAnimation (baseEl: HTMLElement, opts?: any): Animation {

    const DURATION = 450

    const animationCtrl = new AnimationController()
    if (opts.direction === 'forward') {
        return animationCtrl.create()
        .addElement(opts.enteringEl)
        .duration(DURATION)
        .easing('ease-in')
        .fromTo('opacity', 0, 1)
    } else {
        const rootAnimation = animationCtrl.create()
        .addElement(opts.enteringEl)
        .duration(DURATION)
        .easing('ease-in')
        .fromTo('opacity', 0, 1)

        const leaveAnimation = animationCtrl.create()
        .addElement(opts.leavingEl)
        .duration(DURATION)
        .easing('ease-out')
        .fromTo('opacity', 1, 0)

        return animationCtrl.create().addAnimation([rootAnimation, leaveAnimation])
    }

}