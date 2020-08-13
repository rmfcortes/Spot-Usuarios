import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AngularFireDatabase } from '@angular/fire/database';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';

import { UidService } from './uid.service';

import { FormaPago } from '../interfaces/forma-pago.interface';
import { Pedido } from '../interfaces/pedido';
import { environment } from 'src/environments/environment';

declare var Stripe: any

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

  getTarjetas(): Promise<FormaPago[]> { // Conekta
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

  newCard(): Promise<any> {
    return new Promise((resolve, reject) => {
      const cliente = this.uidService.getUid()
      const body = {
        origen: 'newCard',
        data: cliente
      }
      if (this.platform.is ('cordova')) {
        this.http.post('https://us-central1-revistaojo-9a8d3.cloudfunctions.net/request', body, {Authorization: 'secret-key-test'})
        .then(res => resolve(res),
         err => {
           const region = this.uidService.getRegion()
           const error = {
             fecha: Date.now(),
             error: err
           }
           this.db.list(`errores_tarjetas/${region}/${cliente}`).push(error)
           reject(err.error.text)
         }
        )
        .catch(err => {
          const region = this.uidService.getRegion()
          const error = {
            fecha: Date.now(),
            error: err
          }
          this.db.list(`errores_tarjetas/${region}/${cliente}`).push(error)
          reject(err.error)
        })
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
            if (err.status === 200) {
              resolve(err.error.text)
            } else {
              const region = this.uidService.getRegion()
              const error = {
                fecha: Date.now(),
                error: err
              }
              this.db.list(`errores_tarjetas/${region}/${cliente}`).push(error)
              reject(err.error)
            }
          })
      }
    })
  }

  saveCard(idMethod: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const uid = this.uidService.getUid()
        await this.db.object(`usuarios/${uid}/forma-pago/historial/${idMethod}/id`).set(idMethod)
        resolve()
      } catch (error) {
        reject('No pudimos guardar la tarjeta' + error)
      }
    })
  }

  getLastCard(idMethod: string): Promise<FormaPago> {
    return new Promise(async (resolve, reject) => {
      try {
        const uid = this.uidService.getUid()
        const forSub = this.db.object(`usuarios/${uid}/forma-pago/historial/${idMethod}`).valueChanges()
        .subscribe((forma: FormaPago) => {
          if (forma.tipo) {
            forSub.unsubscribe()
            resolve(forma)
          }
        })
      } catch (error) {
        reject('No pudimos guardar la tarjeta' + error)
      }
    })
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
        .catch(err => {
          if (err.status === 200) resolve(err.error.text)
          else {
            if (err.error.idMethod) {
              const stripe = Stripe(environment.stripe, {locale: 'es'})
              return stripe.confirmCardPayment(err.error.secret, {
                payment_method: err.error.idMethod
              }).then(function(result) {
                if (result.error) {
                  reject(result.error.message)
                } else {
                  if (result.paymentIntent.status === 'succeeded') {
                    resolve(result.paymentIntent.id)
                  }
                }
              })
            }
            reject(err.error)
          }
        })
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
            resolve(resp)
          },
          err => {
            if (err.status === 200) resolve(err.error.text)
            else {
              if (err.error.idMethod) {
                const stripe = Stripe(environment.stripe, {locale: 'es'})
                return stripe.confirmCardPayment(err.error.secret, {
                  payment_method: err.error.idMethod
                }).then(function(result) {
                  if (result.error) {
                    reject(result.error.message)
                  } else {
                    if (result.paymentIntent.status === 'succeeded') {
                      resolve(result.paymentIntent.id)
                    }
                  }
                })
              }
              reject(err.error)
            }
          })
      }
    })
  }

}
