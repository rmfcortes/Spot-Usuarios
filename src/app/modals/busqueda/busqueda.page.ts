import { ModalController, Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';

import { InfoSucursalPage } from '../info-sucursal/info-sucursal.page';
import { ServicioPage } from '../servicio/servicio.page';
import { ProductoPage } from '../producto/producto.page';
import { CuentaPage } from '../cuenta/cuenta.page';
import { LoginPage } from '../login/login.page';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { AnimationsService } from 'src/app/services/animations.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { BusquedaService } from 'src/app/services/busqueda.service';
import { ProductoService } from 'src/app/services/producto.service';
import { NegocioService } from 'src/app/services/negocio.service';
import { CartService } from 'src/app/services/cart.service';
import { UidService } from 'src/app/services/uid.service';

import { DatosParaCuenta, NegocioAlgolia } from 'src/app/interfaces/negocio';
import { ProductoAlgolia, Producto } from 'src/app/interfaces/producto';

import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';
import { Router } from '@angular/router';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
})
export class BusquedaPage implements OnInit {

  public myOptions: NgxMasonryOptions = {
    gutter: 10
  }

  busqueda: Busqueda = {texto: ''}
  buscando = false

  lista = 'productos'
  pagina_algolia = 0
  noMore = false

  productos: ResultadosBusquedaProducto = {
    hayMas: true,
    resultados: []
  }
  servicios: ResultadosBusquedaProducto = {
    hayMas: true,
    resultados: []
  }
  negocios: ResultadosBusquedaNegocio = {
    hayMas: true,
    resultados: []
  }
  cargando_producto = false

  uid: string

  ultimas_busquedas: string[] = []
  pristine = true

  batch: number

  reOpenSub: Subscription

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private animationService: AnimationsService,
    private categoriaService: CategoriasService,
    private commonService: DisparadoresService,
    private busquedaService: BusquedaService,
    private productoService: ProductoService,
    private negocioService: NegocioService,
    private cartService: CartService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
    this.getBatch()
    this.getAnteriores()
    this.getLastResults()
    this.uid = this.uidService.getUid()
  }

  getLastResults() {
    this.lista = this.busquedaService.getLista()
    this.negocios = this.busquedaService.getNegocios()
    this.servicios = this.busquedaService.getServicios()
    this.productos = this.busquedaService.getProductos()
    this.pagina_algolia = this.busquedaService.getPagina()
    if (this.negocios.resultados.length > 0 ||
        this.productos.resultados.length > 0 ||
        this.servicios.resultados.length > 0 ||
        this.pagina_algolia > 0) this.pristine = false
  }

  ionViewDidEnter() {
    const el: any = document.getElementById('inputSearch')
    el.setFocus()
  }  
  
  ionViewDidLeave() {
  }

  async getAnteriores() {
    this.ultimas_busquedas = await this.busquedaService.getPrevious()
  }

  getBatch() {
    this.busquedaService.getBatch()
    .then(batch => this.batch = batch)
  }

  paginaChange(pagina: string) {
    this.lista = pagina
    this.busquedaService.setLista(pagina)
    if (this.pagina_algolia > 0) {
      switch (pagina) {
        case 'productos':
          this.productos = this.busquedaService.getProductos()
          break;       
        case 'servicios':
          this.servicios = this.busquedaService.getServicios()
          break;        
        case 'negocios':
          this.negocios = this.busquedaService.getNegocios()
          break;
      }
    }
  }

  buscarPrev(prev: string) {
    this.busqueda.texto = prev
    this.buscar()
  }

  buscar(event?) {
    if (!this.batch) {
      this.buscar(event)
      return
    }
    if (event) event.target.blur()
    this.resetResultados()
    this.busquedaService.resetResultados()
    this.pristine = false
    this.buscando = true
    this.busqueda.pagina = this.pagina_algolia
    this.ultimas_busquedas.unshift(this.busqueda.texto)
    this.ultimas_busquedas = this.ultimas_busquedas.filter((value, index, self) => self.indexOf(value) === index)
    if (this.ultimas_busquedas.length > 20) this.ultimas_busquedas.splice(20)
    this.busquedaService.buscar(this.busqueda, this.ultimas_busquedas)
    this.busquedaService.esperaResultados(this.busqueda, this.lista, this.batch)
    .then(resultado => {
      this.pagina_algolia++
      this.buscando = false
      switch (this.lista) {
        case 'productos':          
          if (resultado === 'no_results') {
            this.productos.hayMas = false
          } else {
            this.productos.hayMas = true
            this.productos.resultados = this.productos.resultados.concat(Object.values(resultado))
          }
          break;
        case 'servicios':          
          if (resultado === 'no_results') {
            this.servicios.hayMas = false
          } else {
            this.servicios.hayMas = true
            this.servicios.resultados = this.servicios.resultados.concat(Object.values(resultado))
          }
          break;        
        case 'negocios':          
          if (resultado === 'no_results') {
            this.negocios.hayMas = false
          } else {
            this.negocios.hayMas = true
            this.negocios.resultados = this.negocios.resultados.concat(Object.values(resultado))
          }
          break;
      }
    })
    .catch(err => {
      
    })
  }

  resetResultados() {
    this.pagina_algolia = 0
    this.productos = {
      hayMas: true,
      resultados: []
    }
    this.servicios = {
      hayMas: true,
      resultados: []
    }
    this.negocios = {
      hayMas: true,
      resultados: []
    }
  }

  async muestraProducto(productoAlgolia: ProductoAlgolia) {
    if (productoAlgolia.agotado) {
      this.commonService.presentAlert('Producto agotado', 'Lo sentimos, este producto está temporalmente agotado')
      return
    }
    if (!this.uid) return this.presentAlertNotLogin()
    const abierto = await this.negocioService.isOpen(productoAlgolia.idNegocio)
    if (!abierto) {
      this.commonService.presentAlert('', 'Esta tienda esta cerrada, por favor vuelve más tarde')
      return
    }    
    let producto = await this.productoService.getProducto(productoAlgolia.idNegocio, productoAlgolia.objectID)
    if (!producto) {
      this.commonService.presentAlert('', 'La publicación de este producto ha sido pausada')
      return
    }
    producto.cantidad = 1
    producto.total = producto.precio
    producto.complementos = []

    const modal = await this.modalCtrl.create({
      component: ProductoPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {producto, idNegocio: productoAlgolia.idNegocio, busqueda: true}
    })
    modal.onWillDismiss().then(resp => {
      if (resp.data && resp.data === 'ver_mas') {
        this.uidService.setModal(true)
        setTimeout(() => this.modalCtrl.dismiss('en_negociopage'), 500)
        this.router.navigate([`negocio/${productoAlgolia.categoria}/${productoAlgolia.idNegocio}`], { skipLocationChange: true })
        return
      }
      if (resp.data) {
        producto.cantidad = resp.data
        setTimeout(() => this.verCarrito(producto, productoAlgolia), 100)
      }
    })

    this.categoriaService.setVisitaNegocio(this.uid, productoAlgolia.idNegocio)
    this.categoriaService.setVisitaCategoria(this.uid, productoAlgolia.categoria)
    return await modal.present()
  }

  async verCarrito(producto: Producto, productoAlgolia: ProductoAlgolia) {
    const idNegocio = productoAlgolia.idNegocio
    producto = await this.cartService.updateCart(idNegocio, producto)
    const modal = await this.modalCtrl.create({
      component: CuentaPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {idNegocio, categoria: productoAlgolia.categoria, busqueda: true}
    })

    modal.onWillDismiss().then(resp => {
      if (resp.data && resp.data === 'add') {
        this.uidService.setModal(true)
        setTimeout(() => this.modalCtrl.dismiss('en_negociopage'), 500)
        this.router.navigate([`negocio/${productoAlgolia.categoria}/${productoAlgolia.idNegocio}`], { skipLocationChange: true })
      }
    })

    return await modal.present()
  }

  async muestraServicio(productoAlgolia: ProductoAlgolia) {
    if (productoAlgolia.agotado) {
      this.commonService.presentAlert('Servicio agotado', 'Lo sentimos, este servicio está temporalmente agotado')
      return
    }
    if (!this.uid) return this.presentAlertNotLogin()
    const abierto = await this.negocioService.isOpen(productoAlgolia.idNegocio)
    if (!abierto) {
      this.commonService.presentAlert('', 'Esta tienda esta cerrada, por favor vuelve más tarde')
      return
    }
    const servicio = await this.productoService.getProducto(productoAlgolia.idNegocio, productoAlgolia.objectID)
    const modal = await this.modalCtrl.create({
      component: ServicioPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {servicio, categoria: productoAlgolia.categoria, idNegocio: productoAlgolia.idNegocio}
    })

    modal.onWillDismiss().then(resp => {
      if (resp.data && resp.data === 'ver_mas') {
        this.uidService.setModal(true)
        setTimeout(() => this.modalCtrl.dismiss('en_negociopage'), 500)
        this.router.navigate([`negocio-servicios/${productoAlgolia.categoria}/${productoAlgolia.idNegocio}`], { skipLocationChange: true })
      }
    })

    this.categoriaService.setVisitaNegocio(this.uid, productoAlgolia.idNegocio)
    this.categoriaService.setVisitaCategoria(this.uid, productoAlgolia.categoria)
    return await modal.present()
  }

  verNegocio(negocio: NegocioAlgolia)  {
    this.uidService.setModal(true)
    if (this.uid) {
      this.categoriaService.setVisitaNegocio(this.uid, negocio.objectID)
      this.categoriaService.setVisitaCategoria(this.uid, negocio.categoria)
    }
    this.router.navigate([`negocio/${negocio.categoria}/${negocio.objectID}`], { skipLocationChange: true })
    setTimeout(() => this.modalCtrl.dismiss('en_negociopage'), 500) 
  }

  async verDetallesTienda(abierto: boolean, producto: ProductoAlgolia) {
    const direccion = await this.productoService.getDireccionNegocio(producto.idNegocio)
    const datos: DatosParaCuenta = {
      logo: '',
      direccion,
      nombreNegocio: producto.nombreNegocio,
      idNegocio: producto.idNegocio,
      categoria: producto.categoria
    }
    const modal = await this.modalCtrl.create({
      component: InfoSucursalPage,
      enterAnimation,
      leaveAnimation,
      componentProps : {datos, abierto, verHorario: true}
    })

    return await modal.present()
  }
  
  presentAlertNotLogin() {
    this.commonService.presentAlertNotLogin()
    .then(res => res ? this.presentLogin() : null)
  }

  async presentLogin() {
    const modal = await this.modalCtrl.create({
      component: LoginPage,
      cssClass: 'my-custom-modal-css',
    })
    modal.onWillDismiss().then(() => {
      this.uid = this.uidService.getUid()
    })

    return await modal.present()
  }

  regresar() {
    if (this.busqueda.id) this.busquedaService.borraResultados(this.busqueda.id)
    this.modalCtrl.dismiss()
  }

  ionImgWillLoad(image) {
    this.animationService.enterAnimation(image.target)
  }

  /// Tracks
  trackProducts(index:number, el: ProductoAlgolia): string {
    return el.objectID
  }

  trackServicios(index:number, el: ProductoAlgolia): string {
    return el.objectID
  }

  trackNegocios(index:number, el: NegocioAlgolia): string {
    return el.objectID
  }
}

export interface Busqueda {
  pagina?: number
  texto: string
  id?: string
}

export interface ResultadosBusquedaProducto {
  hayMas: boolean;
  resultados: ProductoAlgolia[]
}

export interface ResultadosBusquedaNegocio {
  hayMas: boolean;
  resultados: NegocioAlgolia[]
}