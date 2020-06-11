import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Negocio, Oferta, visistasNegocio, InfoGral } from '../interfaces/negocio';
import { Categoria } from '../interfaces/categoria.interface';
import { MasVendido } from '../interfaces/producto';


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
      const catSub = this.db.list(`categoria/${region}`).valueChanges().subscribe((categorias: Categoria[]) => {
        catSub.unsubscribe();
        resolve(categorias);
      });
    });
  }

  listenCambios() {
    const region = this.uidService.getRegion();
    return this.db.list(`functions/${region}`);
  }

  isOpen() {
    const region = this.uidService.getRegion();
    return this.db.list(`isOpen/${region}`);
  }


  getPopulares(): Promise<InfoGral[]> {
    const region = this.uidService.getRegion();
    return new Promise((resolve, reject) => {
      const pop = this.db.list(`functions/${region}`, data => data.orderByChild('visitas').limitToLast(15)).valueChanges()
        .subscribe((populares: InfoGral[]) => {
          pop.unsubscribe();
          populares = populares.filter(p => p.visitas);
          resolve(populares);
        });
    });
  }

  getMasVendidos() {
    const region = this.uidService.getRegion();
    return this.db.list(`vendidos/${region}`).valueChanges();
  }

  getVisitas(uid: string) {
    return new Promise((resolve, reject) => {
    const region = this.uidService.getRegion()
      const visSub = this.db.object(`usuarios/${uid}/visitas/${region}`).valueChanges()
        .subscribe((visitas) => {
          visSub.unsubscribe();
          resolve(visitas);
        });
    });
  }

  getVisitasNegocios(uid: string): Promise<visistasNegocio[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      const visSub = this.db.list(`usuarios/${uid}/visitasNegocio/${region}`, data => data.orderByChild('visitas').limitToLast(5)).valueChanges()
        .subscribe((visitas: visistasNegocio[]) => {
          visSub.unsubscribe();
          resolve(visitas);
        });
    });
  }

  setVisitaCategoria(uid: string, categoria: string) {
    const region = this.uidService.getRegion()
    this.db.object(`usuarios/${uid}/visitas/${region}/${categoria}`).query.ref.transaction(cantidad => cantidad ? cantidad + 1 : 1);
  }

  setVisitaNegocio(uid: string, idNegocio: string) {
    const region = this.uidService.getRegion()
    this.db.object(`usuarios/${uid}/visitasNegocio/${idNegocio}/idNegocio/${region}`).set(idNegocio);
    this.db.object(`usuarios/${uid}/visitasNegocio/${idNegocio}/visitas/${region}`).query.ref.transaction(cantidad => cantidad ? cantidad + 1 : 1);
  }

  setVisita(info: InfoGral) {
    if (info.cuenta && info.cuenta !== 'basica') {
      const region = this.uidService.getRegion();
      this.db.object(`functions/${region}/${info.idNegocio}/visitas`).query.ref.transaction(cantidad => cantidad ? cantidad + 1 : 1);
    }
  }

  getSubCategorias(categoria): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion();
      const subCat = this.db.list(`categoriaSub/${region}/${categoria}`).valueChanges()
        .subscribe((subcategorias: string[]) => {
          subCat.unsubscribe();
          resolve(subcategorias);
        },
        err => console.log(err));
    });
  }

  getOfertas(categoria): Promise<Oferta[]> {
    const region = this.uidService.getRegion();
    return new Promise((resolve, reject) => {
      const oferSub = this.db.list(`ofertas/${region}/${categoria}`).valueChanges()
        .subscribe((ofertas: Oferta[]) => {
          oferSub.unsubscribe();
          resolve(ofertas);
        }
        ,err => console.log(err));
    });
  }

  getNegocios(status, categoria, subCategoria, batch, lastKey?, lastValue?): Promise<Negocio[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion();
      if (lastKey) {
        const negocioSub = this.db.list(`negocios/preview/${region}/${categoria}/${subCategoria}/${status}`, data =>
        data.orderByChild('rate').limitToLast(batch).endAt(lastValue, lastKey)).valueChanges()
          .subscribe((negocios: Negocio[]) => {
            negocioSub.unsubscribe();
            resolve(negocios);
          });
      } else {
        const negocioSub = this.db.list(`negocios/preview/${region}/${categoria}/${subCategoria}/${status}`, data =>
          data.orderByChild('rate').limitToLast(batch)).valueChanges()
            .subscribe((negocios: Negocio[]) => {
              negocioSub.unsubscribe();
              resolve(negocios);
            });
      }
    });
  }

}
