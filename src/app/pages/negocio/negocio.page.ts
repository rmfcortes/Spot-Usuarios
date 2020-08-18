import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, IonInfiniteScroll } from '@ionic/angular';

import { InfoSucursalPage } from 'src/app/modals/info-sucursal/info-sucursal.page';
import { ProductoPage } from 'src/app/modals/producto/producto.page';
import { CuentaPage } from 'src/app/modals/cuenta/cuenta.page';
import { LoginPage } from 'src/app/modals/login/login.page';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { NegocioService } from 'src/app/services/negocio.service';
import { CartService } from 'src/app/services/cart.service';
import { UidService } from 'src/app/services/uid.service';

import { Negocio, DatosParaCuenta, InfoPasillos, ProductoPasillo } from 'src/app/interfaces/negocio';
import { CostoEnvio } from '../../interfaces/envio.interface';
import { Direccion } from '../../interfaces/direcciones';
import { Producto } from 'src/app/interfaces/producto';

import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';
import { StorageService } from 'src/app/services/storage.service';


@Component({
  selector: 'app-negocio',
  templateUrl: './negocio.page.html',
  styleUrls: ['./negocio.page.scss'],
})
export class NegocioPage {

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll

  uid: string
  direccion: Direccion
  categoria: string

  negocio: Negocio
  portada: string
  vista: string
  productos: ProductoPasillo[] = []
  pasillos: InfoPasillos = {
    vista: '',
    portada: '',
    pasillos: []
  }

  infiniteCall: number
  productosCargados: number
  yPasillo = 0

  batch = 15
  lastKey = ''
  noMore = false

  cuenta = 0

  pasilloFiltro = ''
  cambiandoPasillo = false

  cargandoProds = true
  hasOfertas = false
  error = false

  origen_categoria = false

  costo_envio: CostoEnvio

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private commonService: DisparadoresService,
    private negocioService: NegocioService,
    private storageService: StorageService,
    private cartService: CartService,
    private uidService: UidService,
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.origen_categoria = this.router.getCurrentNavigation().extras.state.origen_categoria
    } else this.origen_categoria = false
  }

  // Get info inicial

  ionViewWillEnter() {
    this.yPasillo = 0
    this.lastKey = ''
    this.productos = []
    this.noMore = false
    this.infiniteCall = 1
    this.productosCargados = 0
    this.uid = this.uidService.getUid()
    this.categoria = this.activatedRoute.snapshot.paramMap.get('cat')
    this.getNegocio()
  }

  async getNegocio() {
    const id = this.activatedRoute.snapshot.paramMap.get('id')
    const abierto = await this.negocioService.isOpen(id)
    let status
    if (abierto) status = 'abiertos'
    else status = 'cerrados'
    this.negocio = await this.negocioService.getNegocioPreview(id, this.categoria, status)
    this.costoEnvio()
    if (!this.negocio) {
      this.error = true
      return
    }
    if (this.uid) {
      this.cuenta = await this.negocioService.getCart(this.uid, this.negocio.id)
    }
    this.getPasillos()
  }

  async costoEnvio() {
    this.direccion = this.uidService.getDireccion()
    if (!this.costo_envio) this.costo_envio = this.uidService.getCostoEnvio()
    if (this.negocio.repartidores_propios) {
      if (!this.negocio.envio_costo_fijo && !this.negocio.envio_gratis_pedMin) {
        const distancia: number = await this.commonService.calculaDistancia(this.direccion.lat, this.direccion.lng, this.negocio.direccion.lat, this.negocio.direccion.lng)
        this.negocio.envio =  Math.ceil(distancia * this.costo_envio.costo_km + this.costo_envio.banderazo_cliente)
      }
    } else {
      if (this.negocio.direccion && this.negocio.tipo === 'productos') {
        const distancia: number = await this.commonService.calculaDistancia(this.direccion.lat, this.direccion.lng, this.negocio.direccion.lat, this.negocio.direccion.lng)
        this.negocio.envio = Math.ceil(distancia * this.costo_envio.costo_km + this.costo_envio.banderazo_cliente)
      }
    }
  }

  async getPasillos() {
    const detalles: InfoPasillos = await this.negocioService.getPasillos(this.categoria, this.negocio.id)
    detalles.pasillos = detalles.pasillos.filter(p => p.cantidad)
    this.portada = detalles.portada
    const vista = await this.storageService.getString('vista')
    this.vista = vista ? vista : 'list-img'
    this.pasillos.pasillos = detalles.pasillos
    this.pasillos.pasillos = this.pasillos.pasillos.sort((a, b) => a.prioridad - b.prioridad)
    this.getOfertas()
  }

  // Get Productos

  getOfertas() {
    this.cargandoProds = true
    this.negocioService.getOfertas(this.categoria, this.negocio.id).then(async (ofertas: Producto[]) => {
      if (ofertas && ofertas.length > 0) {
        this.hasOfertas = true
        this.agregaProductos(ofertas, 'Ofertas')
      } else {
        this.hasOfertas = false
        this.cargandoProds = false
      }
      if (!this.pasilloFiltro && this.pasillos.pasillos.length > 0) {
        this.getInfoProdsLista()
      } else this.noMore = true
    })
  }

  async getInfoProdsLista() {
    this.infiniteCall = 1
    this.productosCargados = 0
    this.cargandoProds = true
    this.getProds()
  }

  async getProds(event?) {
    return new Promise(async (resolve, reject) => {
      const productos = await this.negocioService
      .getProductosLista(this.categoria, this.negocio.id, this.pasillos.pasillos[this.yPasillo].nombre, this.batch + 1, this.lastKey)
      this.cambiandoPasillo = false
      if (productos && productos.length > 0) {
        this.lastKey = productos[productos.length - 1].id
        this.evaluaProdsLista(productos, event)
      } else if ( this.yPasillo + 1 < this.pasillos.pasillos.length ) {
        this.yPasillo++
        this.lastKey = null
        if (this.productosCargados < this.batch * this.infiniteCall) {
          this.getProds()
        }
      } else {
        this.noMore = true
        this.cargandoProds = false
        if (this.productos.length === 0) {

        }
        if (event) event.target.complete()
        resolve()
      }
    })
  }

  async evaluaProdsLista(productos, event?) {
    if (productos.length === this.batch + 1) {
      productos.pop()
      return await this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event)
    } else if (productos.length === this.batch && this.yPasillo + 1 < this.pasillos.pasillos.length) {
      return await this.nextPasillo(productos, event)
    } else if (this.yPasillo + 1 >= this.pasillos.pasillos.length) {
      this.noMore = true;
      if (event) event.target.complete()
      return await this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event)
    }
    if (productos.length < this.batch && this.yPasillo + 1 < this.pasillos.pasillos.length) {
      await this.nextPasillo(productos, event)
      if (this.productosCargados < this.batch * this.infiniteCall) {
        return this.getProds()
      }
    } else {
      this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event)
      this.noMore = true
    }
  }

  async nextPasillo(productos, event?) {
    return new Promise(async (resolve, reject) => {
      await this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event)
      this.yPasillo++
      this.lastKey = null
      resolve()
    });
  }

  async agregaProductos(prod: Producto[], pasillo, event?) {
    return new Promise(async (resolve, reject) => {
      this.productosCargados += prod.length
      if ( this.productos.length > 0 && this.productos[this.productos.length - 1].nombre === pasillo) {
        this.productos[this.productos.length - 1].productos = this.productos[this.productos.length - 1].productos.concat(prod)
      } else {
        const prodArray: ProductoPasillo = {
          nombre: pasillo,
          productos: prod
        }
        this.productos.push(prodArray)
      }
      if (event) event.target.complete()
      resolve()
      this.cargandoProds = false
    })
  }

  loadDataLista(event) {
    if (this.cambiandoPasillo) {
      event.target.complete()
      return
    }
    this.infiniteCall++
    if (this.noMore) {
      event.target.disabled = true
      event.target.complete()
      return
    }
    this.getProds(event)

    if (this.noMore) event.target.disabled = true
  }

  // Acciones
  async muestraProducto(producto: Producto) {
    if (!this.negocio.abierto) {
      this.commonService.presentAlert('', 'Esta tienda esta cerrada, por favor vuelve más tarde')
      return
    }    
    if (producto.agotado) {
      this.commonService.presentAlert('Producto agotado', 'Lo sentimos, este producto está temporalmente agotado')
      return
    }
    producto.cantidad = 1
    producto.total = producto.precio
    producto.complementos = []
    if (!this.uid) return this.presentAlertNotLogin()
    const modal = await this.modalController.create({
      component: ProductoPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {producto, idNegocio: this.negocio.id, fromProdPage: true}
    })
    modal.onWillDismiss().then(async (resp) => {
      if (resp.data) {
        producto = await this.cartService.updateCart(this.negocio.id, producto)
        this.cuenta = await this.negocioService.getCart(this.uid, this.negocio.id)
      }
    })
    return await modal.present()
  }
  
  async verCuenta() {
    const modal = await this.modalController.create({
      component: CuentaPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {cuenta: this.cuenta, productos: this.productos, idNegocio: this.negocio.id, categoria: this.categoria}
    })
    modal.onWillDismiss().then(async () => {
      this.cuenta = await this.negocioService.getCart(this.uid, this.negocio.id)
      this.productos.forEach(async(p) => p.productos = await this.negocioService.comparaCart(p.productos))
    })

    return await modal.present()
  }

  async getProdsFiltrados(event?) {
    this.cargandoProds = true
    const productos = await this.negocioService
      .getProductosLista(this.categoria, this.negocio.id, this.pasilloFiltro, this.batch + 1, this.lastKey)
    this.cambiandoPasillo = false
    if (productos && productos.length > 0) {
      this.lastKey = productos[productos.length - 1].id
      this.cargaFiltrados(productos, event)
    } else {
      this.noMore = true
      this.cargandoProds = false
    }
  }

  cargaFiltrados(productos, event) {
    if (productos.length === this.batch + 1) {
      this.lastKey = productos[productos.length - 1].id
      productos.pop()
    } else {
      this.noMore = true
    }
    if (this.productos.length === 0) {
      this.productos =  [{
        nombre: this.pasilloFiltro,
        productos: [...productos]
      }]
    } else {
      this.productos =  [{
        nombre: this.pasilloFiltro,
        productos: this.productos[0].productos.concat(productos)
      }]
    }
    if (event) {
      event.target.complete()
    }
    this.cargandoProds = false
  }

  resetProds(pasillo?) {
    this.cambiandoPasillo = true
    this.lastKey = ''
    this.yPasillo = 0
    this.productos = []
    this.productosCargados = 0
    this.infiniteCall = 1
    this.noMore = false
    this.infiniteScroll.disabled = false
    this.pasilloFiltro = pasillo
    if (!pasillo || pasillo === 'Ofertas') {
      this.getOfertas()
    } else {
      this.getProdsFiltrados()
    }
  }

  loadDataListaFiltrada(event) {
    if (this.cambiandoPasillo) {
      event.target.complete()
      return
    }
    if (this.noMore) {
      event.target.disabled = true
      event.target.complete()
      return
    }
    this.getProdsFiltrados(event)

    if (this.noMore) event.target.disabled = true
  }

  async verInfo() {
    const datos: DatosParaCuenta = {
      logo: this.negocio.foto,
      direccion: this.negocio.direccion,
      nombreNegocio: this.negocio.nombre,
      idNegocio: this.negocio.id,
      categoria: this.categoria
    }

    const modal = await this.modalController.create({
      component: InfoSucursalPage,
      enterAnimation,
      leaveAnimation,
      componentProps : {datos, abierto: this.negocio.abierto}
    })

    return await modal.present()
  }

  cambiarVista() {
    this.commonService.presentOpcionesVista()
    .then(vista => this.vista = vista)
  }


  // Login
  async presentLogin() {
    const modal = await this.modalController.create({
      component: LoginPage,
      cssClass: 'my-custom-modal-css',
    })
    modal.onWillDismiss().then(() => {
      this.uid = this.uidService.getUid()
    })

    return await modal.present()
  }

  // Salida

  regresar() {
    if (this.origen_categoria) this.router.navigate(['/categoria', this.categoria], { skipLocationChange: true })
    else this.router.navigate(['/home'], { replaceUrl: true })
  }

  // Mensajes

  presentAlertNotLogin() {
    this.commonService.presentAlertNotLogin()
    .then(res => res ? this.presentLogin() : null)
  }

  // Auxiliares

  reintentar() {
    location.reload()
  }



}
