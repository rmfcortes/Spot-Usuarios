import { Injectable, NgZone } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';

import { UidService } from './uid.service';

import { Pedido } from '../interfaces/pedido';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(
    private ngZone: NgZone,
    private db: AngularFireDatabase,
    public authFirebase: AngularFireAuth,
    private uidService: UidService,
  ) { }

  getPedidosActivos() {
    const uid = this.uidService.getUid()
    return this.db.list(`usuarios/${uid}/pedidos/activos`).valueChanges()
  }

  listenEntregados() {
    const uid = this.uidService.getUid()
    return this.db.object(`usuarios/${uid}/pedidos/activos`)
  }

  async createPedido(pedido: Pedido) {
    return new Promise(async (resolve, reject) => {
      try {
        const uid = this.uidService.getUid();
        const idPedido = this.db.createPushId();
        pedido.id = idPedido;
        console.log(pedido);
        await this.db.object(`usuarios/${uid}/pedidos/activos/${idPedido}`).update(pedido);
        await this.db.object(`usuarios/${uid}/cart/${pedido.negocio.idNegocio}`).remove();
        resolve()
      } catch (error) {
        reject(error)
      }      
    });
  }

  getPedido(idPedido: string): Promise<Pedido> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const pedSub = this.db.object(`usuarios/${uid}/pedidos/activos/${idPedido}`).valueChanges()
        .subscribe((ped: Pedido) => {
          if (!ped) return reject()
          delete ped.avances
          pedSub.unsubscribe()
          resolve(ped)
        })
    })
  }

  trackTipoEntrega(idPedido: string) {
    const uid = this.uidService.getUid()
    return this.db.object(`usuarios/${uid}/pedidos/activos/${idPedido}/entrega`).valueChanges()
  }

  trackAcept(idPedido: string) {
    const uid = this.uidService.getUid()
    return this.db.object(`usuarios/${uid}/pedidos/activos/${idPedido}/aceptado`).valueChanges()
  }

  trackAvances(idPedido: string) {
    const uid = this.uidService.getUid()
    return this.db.object(`usuarios/${uid}/pedidos/activos/${idPedido}/avances`)
  }

  trackRepartidor(idPedido: string) {
    const uid = this.uidService.getUid()
    return this.db.object(`usuarios/${uid}/pedidos/activos/${idPedido}/repartidor`).valueChanges()
  }

  trackEntregado(idPedido: string) {
    const uid = this.uidService.getUid()
    return this.db.object(`usuarios/${uid}/pedidos/historial/${idPedido}/entregado`).valueChanges()
  }

  trackUbicacion(idRepartidor: string) {
    return this.db.object(`ubicaciones/${idRepartidor}`).valueChanges()
  }

  getTelefono(): Promise<string>  {
    return new Promise((resolve, reject) => {
     const uid = this.uidService.getUid()
     const telSub = this.db.object(`usuarios/${uid}/datos/telefono`).valueChanges().subscribe((telefono: string) => {
       telSub.unsubscribe()
       resolve(telefono)
     })
    })
  }

  async guardarTelefono(tel: string) {
    const uid = this.uidService.getUid()
    await this.db.object(`usuarios/${uid}/datos/telefono`).set(tel)
    const user = await this.authFirebase.auth.currentUser
    user.phoneNumber = '+52' + tel
    this.authFirebase.auth.updateCurrentUser(user)
 }

  listenCalificar() {
    const uid = this.uidService.getUid()
    const calRef = this.db.object(`entregados/${uid}`)
    calRef.query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        const idPedido = snapshot.val()
        })
      })
  }

  getToken(): Promise<string>  {
    return new Promise((resolve, reject) => {
     const uid = this.uidService.getUid()
     const tokSub = this.db.object(`usuarios/${uid}/token`).valueChanges().subscribe((token: string) => {
       tokSub.unsubscribe()
       resolve(token)
     })
    })
  }

}
