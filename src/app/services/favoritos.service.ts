import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';
import { Producto } from '../interfaces/producto';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  guardaFavorito(producto: Producto) {
    const uid = this.uidService.getUid()
    this.db.object(`usuarios/${uid}/favoritos/productos`).update(producto)
  }


}
