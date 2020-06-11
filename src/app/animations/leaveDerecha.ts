import { createAnimation } from '@ionic/core';
import { enterAnimationDerecha } from './enterDerecha';

export const leaveAnimationDerecha = (baseEl: any) => {
  return enterAnimationDerecha(baseEl).direction('reverse');
  }