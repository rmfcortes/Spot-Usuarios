import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AnimationsService } from 'src/app/services/animations.service';

import { Producto, ListaComplementosElegidos, Complemento } from 'src/app/interfaces/producto';

@Component({
  selector: 'app-prod-cart',
  templateUrl: './prod-cart.component.html',
  styleUrls: ['./prod-cart.component.scss'],
})
export class ProdCartComponent implements OnInit {

  @Input() cart: Producto[]
  @Output() verAcciones = new EventEmitter<any>()


  constructor(
    private animationService: AnimationsService,
  ) { }

  ngOnInit() {
    
  }

  presentActionOpciones(prod: Producto, y: number) {
    const value = {
      prod,
      y
    }
    this.verAcciones.emit(value)
  }

  ionImgWillLoad(image) {
    this.animationService.enterAnimation(image.target)
  }

  // Track by

  trackProdComplementos(index:number, el: ListaComplementosElegidos): number {
    return index
  }

  trackComplementos(index:number, el: Complemento): number {
    return index
  }

  trackCart(index:number, el: Producto): string {
    return el.id
  }

}
