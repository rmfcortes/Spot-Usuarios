import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Producto, MasVendido } from '../interfaces/producto';
import { Negocio, InfoPasillos } from '../interfaces/negocio';

@Injectable({
  providedIn: 'root'
})
export class NegocioServiciosService {

  count = 0

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getWhats(categoria: string, id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const detSub = this.db.object(`negocios/pasillos/${categoria}/${id}/whats`).valueChanges()
        .subscribe((whats: string) => {
          detSub.unsubscribe()
          resolve(whats)
        })
    })
  }

  isOpen(idNegocio: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      const oferSub = this.db.object(`functions/${region}/${idNegocio}/abierto`).valueChanges()
        .subscribe((status: boolean) => {
          oferSub.unsubscribe()
          resolve(status)
        })
    })
  }

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

  getPasillos(categoria, id): Promise<InfoPasillos> {
    return new Promise((resolve, reject) => {
      const detSub = this.db.object(`negocios/pasillos/${categoria}/${id}`).valueChanges()
        .subscribe((pasillos: InfoPasillos) => {
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

  async setConsulta(servicio: Producto, categoria: string, idNegocio: string) {
    const region = this.uidService.getRegion()
    const nomSub = this.db.object(`negocios/preview/${region}/${categoria}/todos/abiertos/${idNegocio}/nombre`)
    .valueChanges().subscribe((nombreNegocio: string) => {
      console.log(nombreNegocio);
      nomSub.unsubscribe()
      if (nombreNegocio) {
        const consultado: MasVendido =  {
          categoria,
          idNegocio,
          nombreNegocio,
          id: servicio.id,
          url: servicio.url,
          nombre: servicio.nombre,
          pasillo: servicio.pasillo,
          descripcion: servicio.descripcion,
          precio: servicio.precio ? servicio.precio : 1,
          agotado: servicio.agotado ? servicio.agotado : false,
          dosxuno: servicio.dosxuno ? servicio.dosxuno : false,
          descuento: servicio.descuento ? servicio.descuento : 0,
        }
        const subSub = this.db.list(`perfiles/${idNegocio}/subCategoria`).valueChanges().subscribe(subs => {
          subSub.unsubscribe()
          this.db.object(`vendidos-servicios/${region}/todos/${servicio.id}`).update(consultado)
          this.db.object(`vendidos-servicios/${region}/categorias/${categoria}/${servicio.id}`).update(consultado)
          this.db.object(`vendidos-servicios/${region}/todos/${servicio.id}/ventas`).query.ref.transaction(ventas => ventas ? ventas + 1 : 1)
          this.db.object(`vendidos-servicios/${region}/categorias/${categoria}/${servicio.id}/ventas`).query.ref.transaction(ventas => ventas ? ventas + 1 : 1)
          for (const sub of subs) {
            this.db.object(`vendidos-servicios/${region}/subCategorias/${categoria}/${sub}/${servicio.id}`).update(consultado)
            this.db.object(`vendidos-servicios/${region}/subCategorias/${categoria}/${sub}/${servicio.id}/ventas`).query.ref.transaction(ventas => ventas ? ventas + 1 : 1)
          }
        })
      }
    })
  }

  setConsultaOferta() {
    
  }


}
