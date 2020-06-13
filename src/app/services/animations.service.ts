import { Injectable } from '@angular/core';
import { GestureController } from '@ionic/angular';
import { createAnimation, Animation, Gesture} from '@ionic/core';


@Injectable({
  providedIn: 'root'
})
export class AnimationsService {

  hidePortadaGesture: Gesture
  delta: number
  delta_anterior: number
  ultima_altura: number

  constructor(
    private gestureCtrl: GestureController,
  ) { }

  hidePortada(contenido: HTMLElement, portada: HTMLElement, heightPortada: number, segment: HTMLElement) {
    console.log('Anima');
    this.hidePortadaGesture = this.gestureCtrl.create({
      el: contenido,
      gestureName: 'hide',
      direction: 'y',
      onMove: ev => {
        const alturaActual = portada.clientHeight
        if (ev.deltaY > 0 && alturaActual === heightPortada) {
          console.log('Nada que hacer')
          console.log('////////')
          return
        }
        let nuevaH
        console.log(this.delta_anterior);
        if (!this.delta_anterior) nuevaH = heightPortada + ev.deltaY
        else if (this.delta_anterior < 0 && ev.deltaY < 0 || this.delta_anterior > 0 && ev.deltaY > 0)nuevaH = heightPortada + ev.deltaY + this.delta_anterior
        else nuevaH = this.ultima_altura + ev.deltaY
        console.log('///////////');
        console.log('Altura actual' + alturaActual);
        console.log('Delta Y' + ev.deltaY);
        console.log('Nueva altura' + nuevaH);
        console.log('Altura inicial' + heightPortada);
        console.log('CurrentY' + ev.currentY);
        if (ev.deltaY < 0) { // Baja, oculta portada
          if (alturaActual <= 0) return
          if (nuevaH > 0) { // Está bajando
            console.log('Baja');
            const opacity = nuevaH / heightPortada
            portada.style.height = nuevaH.toString() + 'px'
            portada.style.opacity = opacity.toString()
            segment.style.top = nuevaH.toString() + 'px'
          } else { // Ya no está en la vista
            console.log('Tope mínimo');
            portada.style.height = '0px'
            portada.style.opacity = '0'
            segment.style.top = '0px'
          }
        } else { // Sube, muestra portada
          if (nuevaH > heightPortada) {  // Sobrepasaría la altura inicial
            console.log('Tope máximo');
            portada.style.height = heightPortada + 'px'
            portada.style.opacity = '1'
            segment.style.top = heightPortada + 'px'
          }
          else if (nuevaH > 0) { // está creciendo
            console.log('Sube');
            const opacity = nuevaH / heightPortada
            portada.style.height = nuevaH.toString() + 'px !important'
            portada.style.opacity = opacity.toString()
            segment.style.top = nuevaH.toString() + 'px !important'
          }
        }
        this.delta = ev.deltaY
        this.ultima_altura = alturaActual
      },
      onEnd: ev => {
        this.delta_anterior = this.delta
      }
    })
    this.hidePortadaGesture.enable(true)
  }

  enterAnimation(element) {
    createAnimation()
      .addElement(element)
      .easing('ease-out')
      .duration(500)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' }
      ])
      .play();
  }

  animBrincaDelay(element, inicial, final, delay) {
    createAnimation()
      .addElement(element)
      .duration(500)
      .iterations(1)
      .delay(delay * 70)
      .keyframes([
        { offset: 0, transform: inicial, opacity: '0.5' },
        { offset: 0.5, transform: final, opacity: '0.8' },
        { offset: 1, transform: 'scale(1)', opacity: '1' }
      ])
      .play()
  }

  animBrincaCustom(element, inicial, final) {
    createAnimation()
      .addElement(element)
      .duration(500)
      .iterations(1)
      .keyframes([
        { offset: 0, transform: inicial, opacity: '0.5' },
        { offset: 0.5, transform: final, opacity: '0.8' },
        { offset: 1, transform: 'scale(1)', opacity: '1' }
      ])
      .play()
  }

  animBrincaPoco(element) {
    createAnimation()
      .addElement(element)
      .duration(500)
      .iterations(1)
      .keyframes([
        { offset: 0, transform: 'scale(0.9)', opacity: '0.5' },
        { offset: 0.5, transform: 'scale(1.5)', opacity: '1' },
        { offset: 1, transform: 'scale(1)', opacity: '1' }
      ])
      .play()
  }

  animBrinca(element) {
    createAnimation()
      .addElement(element)
      .duration(500)
      .iterations(1)
      .keyframes([
        { offset: 0, transform: 'scale(0.9)', opacity: '0.5' },
        { offset: 0.5, transform: 'scale(2)', opacity: '1' },
        { offset: 1, transform: 'scale(1)', opacity: '1' }
      ])
      .play()
  }

  animEntradaIzquierda(element) {
    createAnimation()
      .addElement(element)
      .duration(750)
      .iterations(1)
      .fromTo('transform', 'translateX(-100%)', 'translateX(0%)')
      .play()
  }

  animEntradaDebajo(element) {
    createAnimation()
      .addElement(element)
      .duration(400)
      .iterations(1)
      .fromTo('transform', 'translateY(80%)', 'translateY(0%)')
      .play()
  }

  salidaDebajo(element) {
    createAnimation()
      .addElement(element)
      .duration(400)
      .iterations(1)
      .fromTo('transform', 'translateY(0%)', 'translateY(80%)')
      .play()
  }

  animEntradaCrescent(element) {
    createAnimation()
      .addElement(element)
      .duration(500)
      .iterations(1)
      .keyframes([
        { offset: 0, transform: 'scale(0.1)', opacity: '0.5' },
        { offset: 0.5, transform: 'scale(0.5)', opacity: '0.75' },
        { offset: 1, transform: 'scale(1)', opacity: '1' }
      ])
      .play()
  }

  salida(element) {
    return new Promise((resolve, reject) => {
      const anim: Animation = createAnimation()
      .addElement(element)
      .duration(500)
      .iterations(1)
      .keyframes([
        { offset: 0, transform: 'scale(1)', opacity: '0.99' },
        { offset: 1, transform: 'scale(0)', opacity: '0' }
      ])
      anim.play()
      anim.onFinish(() => resolve())
    })
    
  }

}
