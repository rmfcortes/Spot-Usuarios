import { Injectable, NgZone } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { AngularFireDatabase } from '@angular/fire/database';

import { OneSignal } from '@ionic-native/onesignal/ngx';

import { UidService } from './uid.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  uid: string;

  constructor(
    private ngZone: NgZone,
    private oneSignal: OneSignal,
    private db: AngularFireDatabase,
    private toastController: ToastController,
    private uidService: UidService,
  ) { }

  async setupPush() {
    return new Promise(async (resolve, reject) => {
      await this.oneSignal.startInit(environment.oneSignalID, environment.senderID);
      this.oneSignal.getIds().then(data => {
        this.uid = this.uidService.getUid();
        this.db.object(`usuarios/${this.uid}/token`).set(data.userId);
      });
      await this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      this.oneSignal.handleNotificationReceived().subscribe(data => {
        this.ngZone.run(() => {
          if (data.payload.additionalData.mensaje) {
            this.presentToast('Nuevo mensaje recibido');
          }
          if (data.payload.additionalData.pedido) {
            this.presentToast('Nuevo pedido');
          }
        });
      });

      await this.oneSignal.endInit();
      resolve();
    });
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500
    });
    toast.present();
  }

}
