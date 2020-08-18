import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.page.html',
  styleUrls: ['./permisos.page.scss'],
})
export class PermisosPage implements OnInit {


  constructor(
    private modalCtrl: ModalController,
    private notificationService: NotificationsService,
  ) { }

  ngOnInit() {
  }

  async activaPermisos()  {
    await this.notificationService.setupPush()
    this.modalCtrl.dismiss(true)
  }

  salir() {
    this.modalCtrl.dismiss()
  }

}
