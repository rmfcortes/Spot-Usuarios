import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { CategoriasPage } from '../categorias/categorias.page';
import { ProductoPage } from '../producto/producto.page';
import { LoginPage } from '../login/login.page';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { AnimationsService } from 'src/app/services/animations.service';
import { ProductoService } from 'src/app/services/producto.service';
import { NegocioService } from 'src/app/services/negocio.service';
import { OfertasService } from 'src/app/services/ofertas.service';
import { UidService } from 'src/app/services/uid.service';

import { SubCategoria } from 'src/app/interfaces/categoria.interface';
import { Oferta } from 'src/app/interfaces/negocio';

import { enterAnimationCategoria } from 'src/app/animations/enterCat';
import { leaveAnimationCategoria } from 'src/app/animations/leaveCat';
import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';
import { Producto } from 'src/app/interfaces/producto';
import { CartService } from 'src/app/services/cart.service';
import { CuentaPage } from '../cuenta/cuenta.page';
import { ServicioPage } from '../servicio/servicio.page';



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
  @Input() fromCats: boolean

  lastKey = ''
  ofertasReady = false
  ofertas: Oferta[] = []

  subCategorias: SubCategoria[] = []
  subCategoriaReady = false

  noMore = false

  uid: string

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private animationService: AnimationsService,
    private categoriaService: CategoriasService,
    private alertService: DisparadoresService,
    private productoService: ProductoService,
    private negocioService: NegocioService,
    private ofertaService: OfertasService,
    private cartService: CartService,
    private uidSerice: UidService,
  ) { }

  ngOnInit() {
    this.uid = this.uidSerice.getUid()
    const reinicio = this.uidSerice.getOfertas()
    if (reinicio) {
      this.reInicia()
      return
    }
    this.getOfertas()
    this.getSubCategorias()
  }

  async reInicia() {
    this.subCategoria = this.ofertaService.getSubCategoria()
    this.categoria = this.ofertaService.getCategoria()
    this.ofertas = this.ofertaService.getLastOfertas()
    this.lastKey = this.ofertaService.getLastKey()
    this.noMore = this.ofertaService.getNoMore()
    this.ofertasReady = true
    await this.getSubCategorias()
    this.uidSerice.setOfertas(false)
  }

  // Carga de ofertas

  subcategoriaChange(subcategoria: string) {
    this.subCategoria = subcategoria
    this.ofertaService.setSubCategoria(this.subCategoria)
    this.resetOfertas()
  }

  resetOfertas() {
    this.lastKey = ''
    this.ofertas = []
    this.noMore = false
    this.ofertasReady = false
    this.ofertaService.resetOfertas()
    this.getOfertas()
  }

  getOfertas(event?) {
    this.ofertaService.getOfertasModal(this.categoria, this.batch + 1, this.lastKey, this.subCategoria)
      .then((ofertas: Oferta[]) => this.cargaOfertas(ofertas, event))
  }

  cargaOfertas(ofertas, event) {
    if (ofertas.length === this.batch + 1) {
      this.lastKey = ofertas[0].id
      this.ofertaService.setLasKey(this.lastKey)
      ofertas.shift()
    } else {
      this.noMore = true
      this.ofertaService.setNoMore(this.noMore)
    }
    this.ofertas = this.ofertas.concat(ofertas.reverse())
    this.ofertaService.setOfertas(this.ofertas)
    this.ofertasReady = true
    if (event) event.target.complete()
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
    if (oferta.tipo === 'servicios') return this.muestraServicio(oferta)
    if (oferta.agotado) {
      this.alertService.presentAlert('Producto agotado', 'Lo sentimos, este producto está temporalmente agotado')
      return
    }
    if (!this.uid) return this.presentAlertNotLogin()
    const abierto = await this.negocioService.isOpen(oferta.idNegocio)
    if (!abierto) {
      this.alertService.presentAlert('', 'Esta tienda esta cerrada, por favor vuelve más tarde')
      return
    }    
    const producto: Producto = await this.productoService.getProducto(oferta.idNegocio, oferta.id)
    if (!producto) {
      this.alertService.presentAlert('', 'La publicación de este producto ha sido pausada')
      return
    }
    producto.cantidad = 1
    producto.total = producto.precio
    producto.complementos = []

    const modal = await this.modalCtrl.create({
      component: ProductoPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {producto, idNegocio: oferta.idNegocio, busqueda: true}
    })
    modal.onWillDismiss().then(resp => {
      if (resp.data && resp.data === 'ver_mas') {
        this.uidSerice.setOfertas(true)
        setTimeout(() => this.modalCtrl.dismiss('en_negociopage'), 500)
        if (this.fromCats) this.router.navigate([`negocio/${oferta.categoria}/${oferta.idNegocio}`], {state: {origen_categoria: true}, skipLocationChange: true})
        else  this.router.navigate([`negocio/${oferta.categoria}/${oferta.idNegocio}`], { skipLocationChange: true })
        return
      }
      if (resp.data) {
        producto.cantidad = resp.data
        setTimeout(() => this.verCarrito(producto, oferta), 100)
      }
    })

    if (this.uid) {
      this.categoriaService.setVisitaCategoria(this.uid, oferta.categoria)
      this.categoriaService.setVisitaNegocio(this.uid, oferta.idNegocio)
    }
    this.categoriaService.setVisita(oferta.idNegocio)
    return await modal.present()
  }

  async verCarrito(producto: Producto, oferta: Oferta) {
    const idNegocio = oferta.idNegocio
    producto = await this.cartService.updateCart(idNegocio, producto)

    const modal = await this.modalCtrl.create({
      component: CuentaPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {idNegocio, categoria: oferta.categoria, busqueda: true}
    })

    modal.onWillDismiss().then(resp => {
      if (resp.data && resp.data === 'add') {
        this.uidSerice.setOfertas(true)
        setTimeout(() => this.modalCtrl.dismiss('en_negociopage'), 500)
        if (this.fromCats) this.router.navigate([`negocio/${oferta.categoria}/${oferta.idNegocio}`], {state: {origen_categoria: true}, skipLocationChange: true})
        else  this.router.navigate([`negocio/${oferta.categoria}/${oferta.idNegocio}`], { skipLocationChange: true })
      }
    })

    return await modal.present()
  }

  async muestraServicio(serv: Oferta) {
    if (serv.agotado) {
      this.alertService.presentAlert('Servicio agotado', 'Lo sentimos, este servicio está temporalmente agotado')
      return
    }
    if (!this.uid) return this.presentAlertNotLogin()
    const abierto = await this.negocioService.isOpen(serv.idNegocio)
    if (!abierto) {
      this.alertService.presentAlert('', 'Esta tienda esta cerrada, por favor vuelve más tarde')
      return
    }    

    const servicio = await this.productoService.getProducto(serv.idNegocio, serv.id)
    const modal = await this.modalCtrl.create({
      component: ServicioPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {servicio, categoria: serv.categoria, idNegocio: serv.idNegocio}
    })

    modal.onWillDismiss().then(resp => {
      if (resp.data && resp.data === 'ver_mas') {
        this.uidSerice.setOfertas(true)
        setTimeout(() => this.modalCtrl.dismiss('en_negociopage'), 500)
        if (this.fromCats) this.router.navigate([`negocio-servicios/${serv.categoria}/${serv.idNegocio}`], {state: {origen_categoria: true}, skipLocationChange: true})
        else  this.router.navigate([`negocio-servicios/${serv.categoria}/${serv.idNegocio}`], { skipLocationChange: true })
        return
      }
    })

    this.categoriaService.setVisitaNegocio(this.uid, serv.idNegocio)
    this.categoriaService.setVisitaCategoria(this.uid, serv.categoria)
    return await modal.present()
  }

  presentAlertNotLogin() {
    this.alertService.presentAlertNotLogin()
    .then(res => res ? this.login() : null)
  }

  async login() {
    const modal = await this.modalCtrl.create({
      cssClass: 'my-custom-modal-css',
      component: LoginPage,
    })

    return await modal.present()
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
        this.ofertaService.setCategoria(this.categoria)
        this.ofertaService.setSubCategoria(this.subCategoria)
        this.subCategoriaReady = false
        this.getSubCategorias()
        this.resetOfertas()
      }
    })

    return await modal.present()
  }

  getSubCategorias(): Promise<boolean> {
    return new Promise((resolve, reject) => {      
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
        resolve(true)
      })
      .catch((err) => console.log(err))
    })
  }

  ionImgWillLoad(image, i: number) {
    this.animationService.enterAnimation(image.target)
    this.ofertas[i].loaded = true
  }

  regresar() {
    this.modalCtrl.dismiss()
  }

}
