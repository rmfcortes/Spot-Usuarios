import { Component, Input, Output, EventEmitter } from '@angular/core';

import { AnimationsService } from 'src/app/services/animations.service';
import { ProductoPasillo } from 'src/app/interfaces/negocio';
import { Producto } from 'src/app/interfaces/producto';
import { UidService } from 'src/app/services/uid.service';
import { FavoritosService } from 'src/app/services/favoritos.service';


@Component({
  selector: 'app-list-img',
  templateUrl: './list-img.component.html',
  styleUrls: ['./list-img.component.scss'],
})
export class ListImgComponent {

  @Input() sections: ProductoPasillo[]
  @Output() showProduct = new EventEmitter<Producto>()

  uid: string

  constructor(
    private animationService: AnimationsService,
    private favoritoService: FavoritosService,
    private uidService: UidService,
  ) { }

  ionViewWillEnter() {
    this.uid = this.uidService.getUid()
  }

  guardaFavorito(producto: Producto) {
    this.favoritoService.guardaFavorito(producto)
  }

  presentProduct(product: Producto) {
    this.showProduct.emit(product)
  }

  ionImgWillLoad(image) {
    this.animationService.enterAnimation(image.target)
  }

  trackSections(index:number, el:ProductoPasillo): number {
    return index;
  }

  trackProducts(index:number, el:Producto): string {
    return el.id;
  }

}
