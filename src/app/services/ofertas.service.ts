import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Oferta, InfoGral } from '../interfaces/negocio';
import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class OfertasService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

    // Para home page

    getOfertas(batch, categoria): Promise<Oferta[]> {
      return new Promise((resolve, reject) => {
        const region = this.uidService.getRegion();
        const oferSub = this.db.list(`ofertas/${region}/${categoria}`, data => data.orderByKey().limitToLast(batch)).valueChanges()
          .subscribe((ofertas: Oferta[]) => {
            oferSub.unsubscribe();
            resolve(ofertas);
          });
      });
    }

    getStatus(idNegocio: string): Promise<InfoGral> {
      return new Promise((resolve, reject) => {
        const region = this.uidService.getRegion();
        const oferSub = this.db.object(`functions/${region}/${idNegocio}`).valueChanges()
          .subscribe((status: InfoGral) => {
            oferSub.unsubscribe();
            resolve(status);
          });
      });
    }

    // Para ofertas Modal
    getOfertasModal(categoria, batch, lastKey): Promise<Oferta[]> {
      return new Promise((resolve, reject) => {
        const region = this.uidService.getRegion();
        if (lastKey || lastKey === 0) {
          const x = this.db.list(`ofertas/${region}/${categoria}`, data =>
            data.orderByKey().limitToLast(batch).endAt(lastKey.toString())).valueChanges().subscribe(async (ofertas: Oferta[]) => {
              x.unsubscribe();
              resolve(ofertas);
            });
        } else {
          const x = this.db.list(`ofertas/${region}/${categoria}`, data =>
            data.orderByKey().limitToLast(batch)).valueChanges().subscribe(async (ofertas: Oferta[]) => {
              x.unsubscribe();
              resolve(ofertas);
            });
        }
      });
    }

}
