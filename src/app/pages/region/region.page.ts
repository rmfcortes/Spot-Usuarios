import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { DireccionesPage } from 'src/app/modals/direcciones/direcciones.page';

import { RegionService } from 'src/app/services/region.service';

import { enterAnimation } from 'src/app/animations/enter';


@Component({
  selector: 'app-region',
  templateUrl: './region.page.html',
  styleUrls: ['./region.page.scss'],
})
export class RegionPage implements OnInit {

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private regionService: RegionService,
  ) { }

  ngOnInit() {
  }

  async mostrarDirecciones() {
    const modal = await this.modalCtrl.create({
      component: DireccionesPage,
      enterAnimation,
      componentProps: {changeRegion: true}
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        this.regionService.setRegion(resp.data)
        this.router.navigate(['/home'], { replaceUrl: true })
      }
    })
    return await modal.present()
  }

}
