import { Component, OnDestroy } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { DireccionesPage } from './modals/direcciones/direcciones.page';
import { ChatPage } from './modals/chat/chat.page';

import { NetworkService } from './services/network.service';
import { VersionService } from './services/version.service';
import { AuthService } from './services/auth.service';
import { UidService } from './services/uid.service';

import { enterAnimation } from 'src/app/animations/enter';
import { RegionService } from './services/region.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy{

  uid: string
  uidSub: Subscription

  constructor(
    private router: Router,
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private modalCtrl: ModalController,
    private versionService: VersionService,
    private regionService: RegionService,
    private netService: NetworkService,
    private authService: AuthService,
    private uidService: UidService,
  ) {
    this.initializeApp()
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', (event) => {
          event.preventDefault()
          event.stopPropagation()
        }, false)
      })
      this.getUser()
      this.splashScreen.hide()
      this.statusBar.styleBlackTranslucent()
      this.netService.checkNetStatus()
      this.versionService.checkUpdates()
    })
  }

  getUser() {
    this.authService.getUser()
    this.uidSub = this.uidService.usuario.subscribe(uid => this.uid = uid)
  }

  async soporte() {
    const modal = await this.modalCtrl.create({
      component: ChatPage,
      componentProps: {
        idRepartidor: 'soporte',
        idPedido: this.uidService.getUid(),
        nombre: 'Soporte',
        foto: '../assets/img/avatar/soporte.jpg'
      }
    })

    return await modal.present()
  }

  async verDirecciones() {
    const modal = await this.modalCtrl.create({
      component: DireccionesPage,
      enterAnimation,
      componentProps: {changeRegion: true}
    })
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        this.regionService.setRegion(resp.data)
        this.router.navigate(['/home'])
      }
    })
    return await modal.present()
  }

  salir() {
    this.authService.logout()
    this.router.navigate(['/home'])
  }

  ngOnDestroy() {
    this.netService.stopCheckNet()
  }
}
