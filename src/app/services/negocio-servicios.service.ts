import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Producto, MasConsultado } from '../interfaces/producto';
import { Negocio } from '../interfaces/negocio';

@Injectable({
  providedIn: 'root'
})
export class NegocioServiciosService {

  count = 0

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getNegocioPreview(id, categoria, status): Promise<Negocio> {
    const region = this.uidService.getRegion()
    return new Promise((resolve, reject) => {
      const negSub = this.db.object(`negocios/preview/${region}/${categoria}/todos/${status}/${id}`).valueChanges()
        .subscribe((negocio: Negocio) => {
          negSub.unsubscribe()
          if (negocio) {
            this.count = 0
            resolve(negocio)
          } else {
            this.count++
            if (this.count = 2) return resolve(null)
            if (status === 'abiertos') status = 'cerrados'
            else status = 'abiertos'
            this.getNegocioPreview(id, categoria, status)
          }
        })
    })
  }

  getOfertas(categoria: string, idNegocio: string): Promise<Producto[]> {
    return new Promise((resolve, reject) => {
      const x = this.db.list(`negocios/servicios/${categoria}/${idNegocio}/Ofertas`)
        .valueChanges().subscribe(async (servicios: Producto[]) => {
          x.unsubscribe()
          resolve(servicios)
        })
    })
  }

  getPasillos(categoria, id): Promise<any> {
    return new Promise((resolve, reject) => {
      const detSub = this.db.object(`negocios/pasillos/${categoria}/${id}`).valueChanges()
        .subscribe((pasillos: {}) => {
          detSub.unsubscribe()
          resolve(pasillos)
        })
    })
  }

  getServicios(categoria, id, pasillo, batch, lastKey): Promise<Producto[]> {
    return new Promise((resolve, reject) => {
      if (lastKey) {
        const x = this.db.list(`negocios/servicios/${categoria}/${id}/${pasillo}`, data =>
          data.orderByKey().limitToFirst(batch).startAt(lastKey)).valueChanges().subscribe(async (servicios: Producto[]) => {
            x.unsubscribe()
            resolve(servicios)
          })
      } else {
        const x = this.db.list(`negocios/servicios/${categoria}/${id}/${pasillo}`, data =>
          data.orderByKey().limitToFirst(batch)).valueChanges().subscribe(async (servicios: Producto[]) => {
            x.unsubscribe()
            resolve(servicios)
          })
      }
    })
  }

  setConsulta(servicio: Producto, categoria: string, idNegocio: string, nombreNegocio: string) {
    const region = this.uidService.getRegion()
    const consultado: MasConsultado =  {
      categoria,
      descripcion: servicio.descripcion,
      id: servicio.id,
      idNegocio,
      nombre: servicio.nombre,
      nombreNegocio,
      precio: servicio.precio ? servicio.precio : 1,
      url: servicio.url,
    }
    this.db.object(`vendidos-servicios/${region}/${servicio.id}`).update(consultado)
    this.db.object(`vendidos-servicios/${region}/${servicio.id}/consultas`).query.ref.transaction(consultas => consultas ? consultas + 1 : 1)
  }


}
