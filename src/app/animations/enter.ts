import { createAnimation } from '@ionic/core';

export const enterAnimation = (baseEl: any) => {
    const backdropAnimation = createAnimation('')
      .addElement(baseEl.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation('')
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' }
      ]);

    return createAnimation('')
      .addElement(baseEl)
      .easing('ease-out')
      .duration(350)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }
