import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Producto, MasVendido } from 'src/app/interfaces/producto';


@Component({
  selector: 'app-producto-estrella',
  templateUrl: './producto-estrella.component.html',
  styleUrls: ['./producto-estrella.component.scss'],
})
export class ProductoEstrellaComponent implements OnInit {

  @Input() titulo: string
  @Input() masVendidos: MasVendido[]
  @Output() verProd = new EventEmitter<any>()

  slideVendidos = {
    centeredSlides: false,
    initialSlide: 0,
    freeMode: true,
    breakpoints: {
      // when window width is =< 200px
      200: { slidesPerView: 1.3 },
      380: { slidesPerView: 2.3 },
      640: { slidesPerView: 2.3 },
      900: { slidesPerView: 3.5}
    }
  }

  constructor() { }

  ngOnInit() {}

  verProducto(producto: Producto) {
    this.verProd.emit(producto)
  }

}
