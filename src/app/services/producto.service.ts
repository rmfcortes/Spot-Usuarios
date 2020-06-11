import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ListaComplementos } from '../interfaces/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private db: AngularFireDatabase
  ) { }

  getVariables(idNegocio, idProducto): Promise<ListaComplementos[]> {
    return new Promise((resolve, reject) => {
      const varSub = this.db.list(`negocios/complementos/${idNegocio}/${idProducto}`)
        .valueChanges().subscribe((comple: ListaComplementos[]) => {
          varSub.unsubscribe();
          resolve(comple);
        });

    });
  }
}
