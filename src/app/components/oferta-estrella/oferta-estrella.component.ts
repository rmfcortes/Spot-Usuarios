import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Oferta } from 'src/app/interfaces/negocio';

@Component({
  selector: 'app-oferta-estrella',
  templateUrl: './oferta-estrella.component.html',
  styleUrls: ['./oferta-estrella.component.scss'],
})
export class OfertaEstrellaComponent implements OnInit {

  @Input() hayMas: boolean
  @Input() ofertas: Oferta[]
  @Output() verOfs = new EventEmitter<any>()
  @Output() verNeg = new EventEmitter<any>()

  slideOpts = {
    centeredSlides: false,
    initialSlide: 0,
    slidesPerView: 1.2,
    speed: 400,
    freeMode: false
  }

  constructor() { }

  ngOnInit() {
    this.ofertas = this.ofertas.filter(o => o.foto)
  }

  verOfertas() {
    this.verOfs.emit(true)
  }  
  verNegocio(oferta: Oferta) {
    this.verNeg.emit(oferta)
  }

  ionSlideDidChange(event) {
  }

}
