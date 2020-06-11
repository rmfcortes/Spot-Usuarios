import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';
import { Pedido } from '../interfaces/pedido';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getHistorial(batch, lastKey): Promise<Pedido[]> {
    const uid = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      if (lastKey || lastKey === 0) {
        const hisSub = this.db.list(`usuarios/${uid}/pedidos/historial`, data => data.orderByKey().limitToLast(batch).endAt(lastKey))
          .valueChanges().subscribe((historial: Pedido[]) => {
            hisSub.unsubscribe();
            resolve(historial);
          });
      } else {
        const hisSub = this.db.list(`usuarios/${uid}/pedidos/historial`, data => data.orderByKey().limitToLast(batch)).valueChanges()
          .subscribe((historial: Pedido[]) => {
            hisSub.unsubscribe();
            resolve(historial);
          });
      }
    });
  }
}
