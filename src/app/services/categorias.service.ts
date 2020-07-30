import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Negocio, Oferta, visistasNegocio, InfoGral } from '../interfaces/negocio';
import { Categoria } from '../interfaces/categoria.interface';
import { MasVendido, MasConsultado } from '../interfaces/producto';


@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  // Para home Page

  getCategorias(): Promise<Categoria[]> {
    const region = this.uidService.getRegion();
    return new Promise((resolve, reject) => {
      const catSub = this.db.list(`categoria/${region}`, data => data.orderByChild('cantidad').startAt(1).endAt(1000000)).valueChanges().subscribe((categorias: Categoria[]) => {
        catSub.unsubscribe()
        resolve(categorias)
      })
    })
  }

  listenCambios() {
    const region = this.uidService.getRegion()
    return this.db.list(`functions/${region}`)
  }

  isOpen() {
    const region = this.uidService.getRegion()
    return this.db.list(`isOpen/${region}`)
  }


  getPopulares(): Promise<InfoGral[]> {
    const region = this.uidService.getRegion()
    return new Promise((resolve, reject) => {
      const pop = this.db.list(`functions/${region}`, data => data.orderByChild('visitas').limitToLast(15)).valueChanges()
        .subscribe((populares: InfoGral[]) => {
          pop.unsubscribe()
          populares = populares.filter(p => p.visitas)
          resolve(populares)
        })
    })
  }

  getMasVendidos(): Promise<MasVendido[]> {
    return new Promise((resolve, reject) => {      
      const region = this.uidService.getRegion()
      const venSub =  this.db.list(`vendidos/${region}`, data => data.orderByChild('ventas').limitToLast(15))
        .valueChanges().subscribe((vendidos: MasVendido[]) => {
          venSub.unsubscribe()
          resolve(vendidos)
        })

    })
  }

  getMasConsultados(): Promise<MasConsultado[]> {
    return new Promise((resolve, reject) => {      
      const region = this.uidService.getRegion()
      const venSub =  this.db.list(`vendidos-servicios/${region}`, data => data.orderByChild('consultas').limitToLast(15))
        .valueChanges().subscribe((consultados: MasConsultado[]) => {
          venSub.unsubscribe()
          resolve(consultados)
        })

    })
  }

  getVisitas(uid: string) {
    return new Promise((resolve, reject) => {
    const region = this.uidService.getRegion()
      const visSub = this.db.object(`usuarios/${uid}/visitas/${region}`).valueChanges()
        .subscribe((visitas) => {
          visSub.unsubscribe()
          resolve(visitas)
        })
    })
  }

  getVisitasNegocios(uid: string): Promise<visistasNegocio[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      const visSub = this.db.list(`usuarios/${uid}/visitasNegocio/${region}`, data => data.orderByChild('visitas').limitToLast(15)).valueChanges()
        .subscribe((visitas: visistasNegocio[]) => {
          visSub.unsubscribe()
          resolve(visitas)
        })
    })
  }

  setVisitaCategoria(uid: string, categoria: string) {
    const region = this.uidService.getRegion()
    this.db.object(`usuarios/${uid}/visitas/${region}/${categoria}`).query.ref.transaction(cantidad => cantidad ? cantidad + 1 : 1)
  }

  setVisitaNegocio(uid: string, idNegocio: string) {
    const region = this.uidService.getRegion()
    this.db.object(`usuarios/${uid}/visitasNegocio/${region}/${idNegocio}/idNegocio`).set(idNegocio)
    this.db.object(`usuarios/${uid}/visitasNegocio/${region}/${idNegocio}/visitas`).query.ref.transaction(cantidad => cantidad ? cantidad + 1 : 1)
  }

  setVisita(info: InfoGral) {
    if (info.plan && info.plan !== 'basico') {
      const region = this.uidService.getRegion()
      this.db.object(`functions/${region}/${info.idNegocio}/visitas`).query.ref.transaction(cantidad => cantidad ? cantidad + 1 : 1)
    }
  }

  getSubCategorias(categoria): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      const subCat = this.db.list(`categoriaSub/${region}/${categoria}`).valueChanges()
        .subscribe((subcategorias: string[]) => {
          subCat.unsubscribe()
          resolve(subcategorias)
        },
        err => console.log(err))
    })
  }

  getOfertas(categoria): Promise<Oferta[]> {
    const region = this.uidService.getRegion();
    return new Promise((resolve, reject) => {
      const oferSub = this.db.list(`ofertas/${region}/${categoria}`).valueChanges()
        .subscribe((ofertas: Oferta[]) => {
          oferSub.unsubscribe()
          resolve(ofertas)
        }
        ,err => console.log(err))
    })
  }

  getNegocios(filtro: string, status: string, categoria: string, subCategoria: string, batch: number, lastKey?: string, lastValue?: number): Promise<Negocio[]> {
    return new Promise((resolve, reject) => {
      if (filtro === 'destacado') {
        this.getNegociosDestacados(status, categoria, subCategoria, batch, lastKey, lastValue)
        .then(negocios => resolve(negocios))
      }
      else if (filtro === 'envio_gratis') {
        this.getNegociosEnvioGratis(status, categoria, subCategoria, batch, lastKey, lastValue)
        .then(negocios => resolve(negocios))
      }
    })
  }

  getNegociosDestacados(status: string, categoria: string, subCategoria: string, batch: number, lastKey?: string, lastValue?): Promise<Negocio[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      if (lastKey) {
        const negocioSub = this.db.list(`negocios/preview/${region}/${categoria}/${subCategoria}/${status}`, data =>
        data.orderByChild('promedio').limitToLast(batch).endAt(lastValue, lastKey)).valueChanges()
          .subscribe((negocios: Negocio[]) => {
            negocioSub.unsubscribe()
            resolve(negocios)
          })
      } else {
        const negocioSub = this.db.list(`negocios/preview/${region}/${categoria}/${subCategoria}/${status}`, data =>
          data.orderByChild('promedio').limitToLast(batch)).valueChanges()
            .subscribe((negocios: Negocio[]) => {
              negocioSub.unsubscribe()
              resolve(negocios)
            })
      }
    })
  }

  getNegociosEnvioGratis(status, categoria, subCategoria, batch, lastKey?, lastValue?): Promise<Negocio[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      if (lastKey) {
        const negocioSub = this.db.list(`negocios/preview/${region}/${categoria}/${subCategoria}/${status}`, data =>
        data.orderByChild('envio_gratis_pedMin').limitToLast(batch).endAt(lastValue, lastKey)).valueChanges()
          .subscribe((negocios: Negocio[]) => {
            negocioSub.unsubscribe()
            negocios = negocios.filter(n => n.repartidores_propios)
            resolve(negocios)
          })
      } else {
        const negocioSub = this.db.list(`negocios/preview/${region}/${categoria}/${subCategoria}/${status}`, data =>
          data.orderByChild('envio_gratis_pedMin').limitToLast(batch)).valueChanges()
            .subscribe((negocios: Negocio[]) => {
              negocioSub.unsubscribe()
              negocios = negocios.filter(n => n.repartidores_propios)
              negocios = negocios.filter(n => n.envio_gratis_pedMin)
              resolve(negocios)
            })
      }
    })
  }

}
