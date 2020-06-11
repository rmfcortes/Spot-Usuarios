import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.page.html',
  styleUrls: ['./permisos.page.scss'],
})
export class PermisosPage implements OnInit {

  back: Subscription;

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private notificationService: NotificationsService,
  ) { }

  ngOnInit() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.salir();
    });
  }

  async activaPermisos()  {
    await this.notificationService.setupPush();
    this.modalCtrl.dismiss(true);
  }

  salir() {
    if (this.back) {this.back.unsubscribe()}
    this.modalCtrl.dismiss();
  }

}
