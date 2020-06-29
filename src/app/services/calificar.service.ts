import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';


@Injectable({
  providedIn: 'root'
})
export class CalificarService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  calificar(idPedido, calificacion) {
    const uid = this.uidService.getUid()
    this.db.object(`usuarios/${uid}/pedidos/historial/${idPedido}/calificacion`).update(calificacion)
  }

}
