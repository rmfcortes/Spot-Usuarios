import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductoPasillo } from 'src/app/interfaces/negocio';
import { Producto } from 'src/app/interfaces/producto';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent implements OnInit {

  @Input() sections: ProductoPasillo[]

  @Output() showProduct = new EventEmitter<Producto>()


  constructor() { }

  ngOnInit() {}

  presentProduct(product: Producto) {
    this.showProduct.emit(product)
  }

  trackSections(index:number, el:ProductoPasillo): number {
    return index;
  }

  trackProducts(index:number, el:Producto): string {
    return el.id;
  }

}
