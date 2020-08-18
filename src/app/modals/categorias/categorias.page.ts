import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Categoria } from 'src/app/interfaces/categoria.interface';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
})
export class CategoriasPage implements OnInit {

  @Input() categorias: Categoria[]

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }

  irCategoria(categoria) {
    this.modalCtrl.dismiss(categoria)
  }

  regresar() {
    this.modalCtrl.dismiss()
  }

}
