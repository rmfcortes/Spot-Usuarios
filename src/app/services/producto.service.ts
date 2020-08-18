import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ListaComplementos, Producto } from '../interfaces/producto';
import { Direccion } from '../interfaces/direcciones';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private db: AngularFireDatabase
  ) { }

  //// Para producto Modal
  getVariables(idNegocio: string, idProducto: string): Promise<ListaComplementos[]> {
    return new Promise((resolve, reject) => {
      const varSub = this.db.list(`negocios/complementos/${idNegocio}/${idProducto}`)
        .valueChanges().subscribe((comple: ListaComplementos[]) => {
          varSub.unsubscribe()
          resolve(comple)
        })
    })
  }


  //// Para Busqueda Modal
  getProducto(idNegocio: string, idProducto: string): Promise<Producto> {
    return new Promise((resolve, reject) => {
      const prodSub = this.db.object(`productos/${idNegocio}/${idProducto}`).valueChanges()
      .subscribe((producto: Producto) => {
        prodSub.unsubscribe()
        resolve(producto)
      })
    })
  }

  getDireccionNegocio(idNegocio: string): Promise<Direccion> {
    return new Promise((resolve, reject) => {
      const prodSub = this.db.object(`perfiles/${idNegocio}/direccion`).valueChanges()
      .subscribe((direccion: Direccion) => {
        prodSub.unsubscribe()
        resolve(direccion)
      })
    })
  }

}
