import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AngularFireDatabase } from '@angular/fire/database';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';

import { UidService } from './uid.service';

import { FormaPago } from '../interfaces/forma-pago.interface';
import { Pedido } from '../interfaces/pedido';


@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(
    private http: HTTP,
    private platform: Platform,
    private httpAngular: HttpClient,
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getTarjetas(): Promise<FormaPago[]> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const pagoSub = this.db.list(`usuarios/${uid}/forma-pago/historial`).valueChanges().subscribe((tarjetas: FormaPago[]) => {
        pagoSub.unsubscribe()
        resolve(tarjetas)
      }, err => reject('No pudimos obtener tus tarjetas guardadas' + err))
    })
  }
  
  async guardarFormaPago(pago: FormaPago) {
    return new Promise(async (resolve, reject) => {      
      try {      
        const uid = this.uidService.getUid()
        await this.db.object(`usuarios/${uid}/forma-pago/ultima`).set(pago)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  newCard(cliente): Promise<any> {
    return new Promise((resolve, reject) => {
      const body = {
        origen: 'newCard',
        data: cliente
      }
      cliente.idCliente = this.uidService.getUid()
      if (this.platform.is ('cordova')) {
        this.http.post('https://us-central1-revistaojo-9a8d3.cloudfunctions.net/request', body, {Authorization: 'secret-key-test'})
        .then(res => resolve(res),
         err => reject(err.error.text)
        )
        .catch(err => reject(err.error))
      } else {
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': 'secret-key'
          })
         };
         this.httpAngular.post('https://us-central1-revistaojo-9a8d3.cloudfunctions.net/request', body, httpOptions)
         .subscribe(
          res => {
            resolve(res)
          },
          err => {
            console.log(err);
            if (err.status === 200) {
              resolve()
            } else {
              reject(err.error)
            }
          })
      }
    });
  }

  saveCard(card: FormaPago): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const uid = this.uidService.getUid()
        const idSub = this.db.object(`usuarios/${uid}/forma-pago/nueva`).valueChanges()
        .subscribe(async (idCard: string) => {
          idSub.unsubscribe()
          card.id = idCard
          await this.db.object(`usuarios/${uid}/forma-pago/nueva`).remove()
          await this.db.object(`usuarios/${uid}/forma-pago/historial/${card.id}`).set(card)
          resolve()
        })
      } catch (error) {
        reject('No pudimos guardar la tarjeta' + error)
      }
    });
  }

  cobrar(pedido: Pedido): Promise<string> {
    return new Promise((resolve, reject) => {
      const body = {
        origen: 'cobro',
        data: pedido
      }
      if (this.platform.is ('cordova')) {
        this.http.post('https://us-central1-revistaojo-9a8d3.cloudfunctions.net/request', body, {Authorization: 'secret-key-test'})
        .then((resp: HTTPResponse) => resolve(resp.data))
        .catch(err => reject(err.error.text))
      } else {
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': 'secret-key'
          })
         }
         this.httpAngular.post('https://us-central1-revistaojo-9a8d3.cloudfunctions.net/request', body, httpOptions)
         .subscribe(
          (resp: string) => {
            console.log(resp)
            resolve(resp)
          },
          err => {
            console.log(err);
            if (err.status === 200) resolve(err.error.text)
            else reject(err.error)
          })
      }
    })
  }

}
