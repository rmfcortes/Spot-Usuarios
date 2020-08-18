import { Component, ViewChild, NgZone, OnInit, OnDestroy } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { CategoriasPage } from 'src/app/modals/categorias/categorias.page';
import { ServicioPage } from 'src/app/modals/servicio/servicio.page';
import { ProductoPage } from 'src/app/modals/producto/producto.page';
import { OfertasPage } from 'src/app/modals/ofertas/ofertas.page';
import { CuentaPage } from 'src/app/modals/cuenta/cuenta.page';
import { LoginPage } from 'src/app/modals/login/login.page';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { AnimationsService } from 'src/app/services/animations.service';
import { ProductoService } from 'src/app/services/producto.service';
import { OfertasService } from 'src/app/services/ofertas.service';
import { NegocioService } from 'src/app/services/negocio.service';
import { CartService } from 'src/app/services/cart.service';
import { UidService } from 'src/app/services/uid.service';

import { Categoria, SubCategoria } from 'src/app/interfaces/categoria.interface';
import { MasVendido, Producto } from 'src/app/interfaces/producto';
import { CostoEnvio } from 'src/app/interfaces/envio.interface';
import { Negocio, Oferta } from 'src/app/interfaces/negocio';
import { Direccion } from 'src/app/interfaces/direcciones';

import { enterAnimationCategoria } from 'src/app/animations/enterCat';
import { leaveAnimationCategoria } from 'src/app/animations/leaveCat';
import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
})
export class CategoriaPage implements OnInit, OnDestroy{

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll

  categoria: string
  categorias: Categoria[] = []
  subCategorias: SubCategoria[] = []
  ofertas: Oferta[] = []
  negocios: Negocio[] = []
  filtrados: Negocio[] = []
  status = 'abiertos'

  masConsultados: MasVendido[] = []
  masVendidos: MasVendido[] = []
  vendidosReady = false
  consultadosReady = false

  lastKey = ''
  lastValue = null
  batch = 15
  noMore = false

  batchOfertas = 10
  hayMas = false

  subCategoria = 'todos'

  slideCategorias = {
    centeredSlides: false,
    initialSlide: 0,
    slidesPerView: 4.5,
    speed: 400,
    freeMode: true
  }

  promosReady = false
  negociosReady = false

  direccion: Direccion
  costo_envio: CostoEnvio

  filtro = 'destacado'

  uid: string

  filtrosAnimated = false
  ofertasAnimated = false
  vendidosAnimated = false
  productosAnimated = false
  consultadosAnimated = false

  hayNegocios = false
  primer_vez = true

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private categoriaService: CategoriasService,
    private animationService: AnimationsService,
    private alertService: DisparadoresService,
    private productoService: ProductoService,
    private negocioService: NegocioService,
    private ofertaService: OfertasService,
    private cartService: CartService,
    private uidService: UidService,
  ) { }

  // Carga datos iniciales

  ngOnInit() {
    this.categoria = this.activatedRoute.snapshot.paramMap.get('cat')
    this.direccion = this.uidService.getDireccion()
    this.getTodo()
    this.listenCambios()
    this.getCategorias()
    this.getSubCategorias()
  }

  ionViewWillEnter() {
    this.categoria = this.activatedRoute.snapshot.paramMap.get('cat')
    this.uid = this.uidService.getUid()
    const ofertas = this.uidService.getOfertas()
    if (ofertas) this.verOfertas()
  }

  async setFiltro(filtro: string) {
    if (this.negocios.length > 0) {
      const el = document.getElementById('productos')
      if (el) await this.animationService.salida(el)
    }
    this.productosAnimated = false
    this.negociosReady = false
    this.negocios = []
    this.lastValue = null
    this.lastKey = ''
    this.noMore = false
    this.status = 'abiertos'
    this.infiniteScroll.disabled = false
    this.filtro = filtro
    this.getNegocios(null, false)
  }

  getSubCategorias() {
    this.categoriaService.getSubCategorias(this.categoria, 'cantidad')
    .then(subcategorias => {
      this.subCategorias = subcategorias
      const todos: SubCategoria = {
        cantidad: 1,
        subCategoria: 'todos',
        alias: 'todos'
      }
      this.subCategorias.unshift(todos)
    })
    .catch((err) => console.log(err))
  }

  getTodo() {
    this.promosReady = false
    this.negociosReady = false
    this.vendidosReady = false
    this.consultadosReady = false
    this.getOfertas()
    this.getNegocios(null, true)
    this.getMasVendidos()
    this.getMasConsultados()
  }

  async getOfertas() {
    this.ofertas = []
    if (this.subCategoria === 'todos') {
      this.ofertaService.getOfertas(this.batchOfertas + 1, this.categoria)
      .then(async (ofertas: Oferta[]) => {
        if (ofertas.length === this.batchOfertas + 1) {
          this.hayMas = true
          ofertas.shift()
        }
        this.ofertas = ofertas.reverse()
        this.promosReady = true
        this.animacionEntrada('ofertas')
      })
      .catch((err) => console.log(err))      
    } else {
      this.ofertaService.getOfertasSubCategoria(this.batchOfertas + 1, this.categoria, this.subCategoria)
      .then(async (ofertas: Oferta[]) => {
        if (ofertas.length === this.batchOfertas + 1) {
          this.hayMas = true
          ofertas.shift()
        }
        this.ofertas = ofertas.reverse()
        this.promosReady = true
        this.animacionEntrada('ofertas')
      })
      .catch((err) => console.log(err))

    }
  }

  async getNegocios(event?, animarFiltros?: boolean) {
    this.categoriaService
      .getNegocios(this.filtro, this.status, this.categoria, this.subCategoria, this.batch + 1, this.lastKey, this.lastValue)
      .then(async (negocios) => {
        if (negocios.length === this.batch + 1) {
          this.lastKey = negocios[0].id
          this.lastValue = negocios[0].promedio
          if (this.filtro === 'envio_gratis') {
            negocios = negocios.filter(n => n.repartidores_propios && n.envio_gratis_pedMin)
            await this.costoEnvio(negocios)
            this.negocios = this.negocios.concat(negocios.reverse())
            this.filtrados = this.filtrados.concat(negocios.reverse())
            if (this.filtrados.length < this.batch)  return this.getNegocios(event, animarFiltros)
            return this.muestraProductos(event, animarFiltros)
          } else {
            negocios.shift()
          }
        } else if (this.status === 'abiertos') {
          this.status = 'cerrados'
          this.lastKey = ''
          this.lastValue = ''
          if (this.filtro === 'envio_gratis') {
            negocios = negocios.filter(n => n.repartidores_propios && n.envio_gratis_pedMin)
            await this.costoEnvio(negocios)
            this.negocios = this.negocios.concat(negocios.reverse())
            this.filtrados = this.filtrados.concat(negocios.reverse())
          } else {
            await this.costoEnvio(negocios)
            this.negocios = this.negocios.concat(negocios.reverse())
          }
          this.getNegocios(event, animarFiltros)
          return
        } else {
          this.noMore = true
        }
        if (this.filtro === 'envio_gratis') negocios = negocios.filter(n => n.repartidores_propios && n.envio_gratis_pedMin)
        await this.costoEnvio(negocios)
        this.negocios = this.negocios.concat(negocios.reverse())
        this.muestraProductos(event, animarFiltros)
      })
      .catch((err) => console.log(err))
  }

  muestraProductos(event?, animarFiltros?: boolean) {
    this.filtrados = []
    if (this.negocios.length && this.primer_vez) this.hayNegocios = true
    if (event) event.target.complete()  
    this.negociosReady = true
    if (animarFiltros && !event) this.animacionEntrada('filtros')
    if (!event) this.animacionEntrada('productos')
  }

  getMasVendidos() {
    this.masVendidos = []
    if (this.subCategoria === 'todos') {
      this.categoriaService.getMasVendidosCategoria(this.categoria).then(vendidos => {
        this.masVendidos = vendidos
        this.masVendidos = this.masVendidos.filter(v => !v.agotado)
        this.masVendidos.sort((a, b) => b.ventas - a.ventas)
        this.vendidosReady = true
        this.animacionEntrada('vendidos')

      })
    } else {
      this.categoriaService.getMasVendidosSubCategoria(this.categoria, this.subCategoria).then(vendidos => {
        this.masVendidos = vendidos
        this.masVendidos = this.masVendidos.filter(v => !v.agotado)
        this.masVendidos.sort((a, b) => b.ventas - a.ventas)
        this.vendidosReady = true
        this.animacionEntrada('vendidos')
      })
    }
  }

  animacionEntrada(id: string) {
    setTimeout(async () => {
      const el = document.getElementById(id)
      if (id === 'filtros') this.filtrosAnimated = true
      if (id === 'ofertas') this.ofertasAnimated = true
      if (id === 'vendidos') this.vendidosAnimated = true
      if (id === 'productos') this.productosAnimated = true
      if (id === 'consultados') this.consultadosAnimated = true
      this.animationService.enterAnimation(el)
    }, 350)
  }

  getMasConsultados() {
    this.masConsultados = []
    if (this.subCategoria === 'todos') {
      this.categoriaService.getMasConsultadosCategoria(this.categoria).then(consultados => {
        this.masConsultados = consultados
        this.masConsultados.sort((a, b) => b.ventas - a.ventas)
        this.consultadosReady = true
        this.animacionEntrada('consultados')
      })
    } else {
      this.categoriaService.getMasConsultadosSubCategoria(this.categoria, this.subCategoria).then(consultados => {
        this.masConsultados = consultados
        this.masConsultados.sort((a, b) => b.ventas - a.ventas)
        this.consultadosReady = true
        this.animacionEntrada('consultados')
      })
    }
  }

  costoEnvio(negocios) {
    if (!this.costo_envio) this.costo_envio = this.uidService.getCostoEnvio()
    return new Promise(async (resolve, reject) => {
      for (const n of negocios) {
        if (n.repartidores_propios) {
          if (!n.envio_costo_fijo && !n.envio_gratis_pedMin) {
            const distancia: number = await this.alertService.calculaDistancia(this.direccion.lat, this.direccion.lng, n.direccion.lat, n.direccion.lng)
            n.envio =  Math.ceil(distancia * this.costo_envio.costo_km + this.costo_envio.banderazo_cliente)
          }
        } else {
          if (n.direccion && n.tipo === 'productos') {
            const distancia: number = await this.alertService.calculaDistancia(this.direccion.lat, this.direccion.lng, n.direccion.lat, n.direccion.lng)
            n.envio = Math.ceil(distancia * this.costo_envio.costo_km + this.costo_envio.banderazo_cliente)
          }
        }
      }
      resolve()
    })
  }

  getCategorias() {
    return new Promise((resolve, reject) => {
      this.categoriaService.getCategorias().then(categorias => {
        this.categorias = categorias
        resolve()
      })
    })
  }

  // Listeners

  listenCambios() {
    this.categoriaService.isOpen().query.ref.on('child_changed', data => {
      this.ngZone.run(() => {
        const negocio = data.val()
        if (this.negocios.length > 0) {
          const i = this.negocios.findIndex(n => n.id === negocio.idNegocio)
          if (i >= 0) {
            this.negocios[i].abierto = negocio.abierto;
          }
        }
      })
    })
  }
  
  // Acciones

  async verNegocio(negocio: Negocio) {
    const uid = this.uidService.getUid()
    if (uid) this.categoriaService.setVisitaNegocio(uid, negocio.id)
    this.categoriaService.setVisita(negocio.id)
    if (negocio.tipo === 'productos') {
      this.router.navigate([`/negocio/${this.categoria}/${negocio.id}`], {skipLocationChange: true ,state: {origen_categoria: true}})
    } else {
      this.router.navigate([`/negocio-servicios/${this.categoria}/${negocio.id}`], {skipLocationChange: true ,state: {origen_categoria: true}})
    }
  }

  async verOfertas() {
    const modal = await this.modalController.create({
      component: OfertasPage,
      componentProps: {categoria: this.categoria, categorias: this.categorias,
                    subCategoria: this.subCategoria, batch: this.batchOfertas, subCategorias: this.subCategorias,
                    fromCats: true}
    })

    return modal.present()
  }

  async muestraProducto(oferta: Oferta) {
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
    const producto = await this.productoService.getProducto(oferta.idNegocio, oferta.id)
    if (!producto) {
      this.alertService.presentAlert('', 'La publicación de este producto ha sido pausada')
      return
    }
    producto.cantidad = 1
    producto.total = producto.precio
    producto.complementos = []

    const modal = await this.modalController.create({
      component: ProductoPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {producto, idNegocio: oferta.idNegocio, busqueda: true}
    })
    modal.onWillDismiss().then(async (resp) => {
      if (resp.data && resp.data === 'ver_mas') {
        this.router.navigate([`negocio/${oferta.categoria}/${oferta.idNegocio}`], {skipLocationChange: true, state: {origen_categoria: true}})
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
    const modal = await this.modalController.create({
      component: ServicioPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {servicio, categoria: serv.categoria, idNegocio: serv.idNegocio}
    })

    modal.onWillDismiss().then(resp => {
      if (resp.data && resp.data === 'ver_mas') {
        this.router.navigate([`negocio-servicios/${serv.categoria}/${serv.idNegocio}`], { skipLocationChange: true, state: {origen_categoria: true} })
      }
    })

    this.categoriaService.setVisitaNegocio(this.uid, serv.idNegocio)
    this.categoriaService.setVisitaCategoria(this.uid, serv.categoria)
    return await modal.present()
  }


  async verCarrito(producto: Producto, oferta: Oferta) {
    const idNegocio = oferta.idNegocio
    producto = await this.cartService.updateCart(idNegocio, producto)

    const modal = await this.modalController.create({
      component: CuentaPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {idNegocio, categoria: oferta.categoria, busqueda: true}
    })

    modal.onWillDismiss().then(resp => {
      if (resp.data && resp.data === 'add') {
        this.router.navigate([`negocio/${oferta.categoria}/${oferta.idNegocio}`], {skipLocationChange: true ,state: {origen_categoria: true}})
      }
    })

    return await modal.present()
  }

  presentAlertNotLogin() {
    this.alertService.presentAlertNotLogin()
    .then(res => res ? this.login() : null)
  }

  async login() {
    const modal = await this.modalController.create({
      cssClass: 'my-custom-modal-css',
      component: LoginPage,
    })

    return await modal.present()
  }

  async verCategorias() {
    const modal = await this.modalController.create({
      component: CategoriasPage,
      cssClass: 'modal-categorias',
      enterAnimation: enterAnimationCategoria,
      leaveAnimation: leaveAnimationCategoria,
      componentProps: {categorias: this.categorias}
    })

    modal.onWillDismiss().then(resp => {
      if (resp.data) this.irACategoria(resp.data)
    })

    return await modal.present()
  }

  irACategoria(categoria: string) {
    if (this.uid) this.categoriaService.setVisitaCategoria(this.uid, categoria)
    this.router.navigate(['/categoria', categoria], { skipLocationChange: true })
  }

  // Filtra por categoria

  async getNegociosSub(subCategoria) {
    const el = document.getElementsByClassName('salida')
    await this.animationService.salida(el)
    this.ofertasAnimated = false
    this.filtrosAnimated = false
    this.vendidosAnimated = false
    this.productosAnimated = false
    this.consultadosAnimated = false
    this.negociosReady = false
    this.subCategoria = subCategoria
    this.negocios = []
    this.lastValue = null
    this.lastKey = ''
    this.noMore = false
    this.status = 'abiertos'
    this.infiniteScroll.disabled = false
    this.getTodo()
  }

  // Infinite Scroll

  async loadData(event) {
    if (this.noMore) {
      event.target.disabled = true
      event.target.complete()
      return
    }
    this.getNegocios(event)
    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) event.target.disabled = true
  }

  ngOnDestroy() {
    this.categoriaService.listenCambios().query.ref.off('child_changed')
  }


}
