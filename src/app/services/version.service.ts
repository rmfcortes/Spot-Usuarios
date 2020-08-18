import { Injectable } from '@angular/core';

import { AppVersion } from '@ionic-native/app-version/ngx';
import { Market } from '@ionic-native/market/ngx';

import { AngularFireDatabase } from '@angular/fire/database';
import { DisparadoresService } from './disparadores.service';

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  constructor(
    private market: Market,
    private appVersion: AppVersion,
    private db: AngularFireDatabase,
    private alertService: DisparadoresService,
  ) { }

  async checkUpdates() {
    const phoneVersion = await this.appVersion.getVersionNumber()
    this.db.object(`1version`).valueChanges().subscribe((fireVersion: string) => {
      const fireVersionArr = fireVersion.split('.')
      fireVersionArr.forEach(f => parseInt(f, 10))
      const phoneVersionArr = phoneVersion.split('.')
      phoneVersionArr.forEach(f => parseInt(f, 10))
      if (phoneVersionArr[0] > fireVersionArr[0]) return
      if (phoneVersionArr[1] > fireVersionArr[1]) return
      if (phoneVersionArr[2] > fireVersionArr[2]) return
      if (phoneVersionArr[0] === fireVersionArr[0] && phoneVersionArr[1] === fireVersionArr[1] && phoneVersionArr[2] === fireVersionArr[2]) return
      this.alertService.presentAlertUpdate('Nueva versión de Plaza', 'Hay una versión de Plaza, '+
      'Obtén las últimas funcionalidades tu app. Trabajamos constantemente para darte el mejor servicio')
      .then(async (resp) => {
        if (resp) {
          const pack = await this.appVersion.getPackageName()
          this.market.open(pack)
        }
      })
    })
  }

}
