import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';

import { CategoriasPage } from '../categorias/categorias.page';

import { CategoriasService } from 'src/app/services/categorias.service';
import { OfertasService } from 'src/app/services/ofertas.service';

import { Oferta, InfoGral } from 'src/app/interfaces/negocio';
import { SubCategoria } from 'src/app/interfaces/categoria.interface';
import { enterAnimationCategoria } from 'src/app/animations/enterCat';
import { leaveAnimationCategoria } from 'src/app/animations/leaveCat';


@Component({
  selector: 'app-ofertas',
  templateUrl: './ofertas.page.html',
  styleUrls: ['./ofertas.page.scss'],
})
export class OfertasPage implements OnInit {

  @Input() batch: number
  @Input() categoria: string
  @Input() categorias: string[]
  @Input() subCategoria: string

  lastKey = ''
  ofertasReady = false
  ofertas: Oferta[] = []

  subCategorias: SubCategoria[] = []
  subCategoriaReady = false

  noMore = false

  back: Subscription

  constructor(
    private router: Router,
    private platform: Platform,
    private modalCtrl: ModalController,
    private categoriaService: CategoriasService,
    private ofertaService: OfertasService,
  ) { }

  ngOnInit() {
    this.getOfertas()
    this.getSubCategorias()
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar()
    })
  }

  // Carga de ofertas

  subcategoriaChange(subcategoria: string) {
    this.subCategoria = subcategoria
    this.resetOfertas()
  }

  resetOfertas() {
    this.lastKey = ''
    this.ofertas = []
    this.noMore = false
    this.ofertasReady = false
    this.getOfertas()
  }

  getOfertas(event?) {
    this.ofertaService.getOfertasModal(this.categoria, this.batch + 1, this.lastKey, this.subCategoria)
      .then((ofertas: Oferta[]) => this.cargaOfertas(ofertas, event))
  }

  cargaOfertas(ofertas, event) {
    if (ofertas.length === this.batch + 1) {
      this.lastKey = ofertas[0].id
      ofertas.shift()
    } else this.noMore = true
    this.ofertas = this.ofertas.concat(ofertas.reverse())
    if (event) event.target.complete()
    this.ofertasReady = true
  }

  async loadData(event) {
    if (this.noMore) {
      event.target.disabled = true
      event.target.complete()
      return
    }
    this.getOfertas(event)

    if (this.noMore) event.target.disabled = true
  }

  // Acciones

  async verOferta(oferta: Oferta) {
    const infoNeg: InfoGral = await this.ofertaService.getStatus(oferta.idNegocio)
    this.router.navigate(['/negocio', infoNeg.categoria, oferta.idNegocio, infoNeg.abierto])
    this.modalCtrl.dismiss()
  }

  async verCategorias() {
    const modal = await this.modalCtrl.create({
      component: CategoriasPage,
      cssClass: 'modal-categorias',
      enterAnimation: enterAnimationCategoria,
      leaveAnimation: leaveAnimationCategoria,
      componentProps: {categorias: this.categorias}
    })

    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        this.categoria = resp.data
        this.subCategoria = 'todos'
        this.subCategoriaReady = false
        this.getSubCategorias()
        this.resetOfertas()
      }
    })

    return await modal.present()
  }

  getSubCategorias() {
    this.categoriaService.getSubCategorias(this.categoria, 'ofertas')
    .then(subcategorias => {
      this.subCategorias = subcategorias
      const todos: SubCategoria = {
        cantidad: 1,
        subCategoria: 'todos',
        alias: 'todas'
      }
      this.subCategorias.unshift(todos)
      this.subCategoriaReady = true
    })
    .catch((err) => console.log(err))
  }

  regresar() {
    if (this.back) this.back.unsubscribe()
    this.modalCtrl.dismiss()
  }

}
