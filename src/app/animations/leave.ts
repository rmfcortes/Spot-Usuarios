import { enterAnimation } from './enter';

export const leaveAnimation = (baseEl: any) => {
  return enterAnimation(baseEl).direction('reverse');
}