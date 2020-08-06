import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { BusquedaService } from 'src/app/services/busqueda.service';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
})
export class BusquedaPage implements OnInit {

  busqueda: Busqueda = {texto: ''}
  buscando = false

  constructor(
    private modalCtrl: ModalController,
    private busquedaService: BusquedaService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    const el: any = document.getElementById('inputSearch')
    el.setFocus()
  }

  buscar(event) {
    if (event) event.target.blur()
    // this.buscando = true
    this.busquedaService.buscar(this.busqueda.texto)
    // this.busquedaService.esperaResultados(this.busqueda.id)
    // .then(resultados => {
    //   this.buscando = false
    //   console.log(resultados);
    // })
  }

  regresar() {
    this.modalCtrl.dismiss()
  }

}


export interface Busqueda {
  texto: string
  id?: string
}