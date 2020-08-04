import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CategoriasPage } from 'src/app/modals/categorias/categorias.page';
import { OfertasPage } from 'src/app/modals/ofertas/ofertas.page';
import { LoginPage } from 'src/app/modals/login/login.page';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { NegocioService } from 'src/app/services/negocio.service';
import { OfertasService } from 'src/app/services/ofertas.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { ChatService } from 'src/app/services/chat.service';
import { UidService } from 'src/app/services/uid.service';

import { Oferta, InfoGral, NegocioBusqueda } from 'src/app/interfaces/negocio';
import { Categoria } from 'src/app/interfaces/categoria.interface';
import { UnreadMsg } from 'src/app/interfaces/chat.interface';
import { CostoEnvio } from '../../interfaces/envio.interface';
import { MasConsultado } from '../../interfaces/producto';
import { Direccion } from '../../interfaces/direcciones';
import { MasVendido } from 'src/app/interfaces/producto';
import { Pedido } from 'src/app/interfaces/pedido';

import { enterAnimationCategoria } from 'src/app/animations/enterCat';
import { leaveAnimationCategoria } from 'src/app/animations/leaveCat';
import { AnimationsService } from 'src/app/services/animations.service';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  ofertas: Oferta[] =  [ ]
  batch = 10
  hayMas = false

  slideOpts = {
    centeredSlides: false,
    initialSlide: 0,
    slidesPerView: 1.2,
    speed: 400,
    freeMode: true
  }

  slideCategorias = {
    centeredSlides: false,
    initialSlide: 0,
    speed: 400,
    freeMode: true,
    breakpoints: {
      // when window width is =< 200px
      200: { slidesPerView: 2.5 },
      380: { slidesPerView: 4.6, spaceBetween: 8 },
      640: { slidesPerView: 4.6, spaceBetween: 10 },
      900: { slidesPerView: 7.5}
    }
  }

  slideVendidos = {
    centeredSlides: false,
    initialSlide: 0,
    freeMode: true,
    breakpoints: {
      // when window width is =< 200px
      200: { slidesPerView: 1.3 },
      380: { slidesPerView: 2.3 },
      640: { slidesPerView: 2.3 },
      900: { slidesPerView: 3.5}
    }
  }

  pedidos: Pedido[] = []
  pedSub: Subscription
  msgSub: Subscription

  uidSub: Subscription
  uid: string

  categorias: Categoria[] = []

  verPedidos = false;

  busqueda = ''
  negociosBusqueda: NegocioBusqueda[] = []
  negMatch: NegocioBusqueda[] = []

  masConsultados: MasConsultado[] = []
  negociosVisitados: InfoGral[] = []
  negociosPopulares: InfoGral[] = []
  masVendidos: MasVendido[] = []

  catsReady = false
  promosReady = false
  pedidosReady = false
  vendidosReady = false
  visitadosReady = false
  popularesReady = false
  consultadosReady = false

  buscando = false

  back: Subscription

  direccion: Direccion

  costo_envio: CostoEnvio

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private platform: Platform,
    private modalController: ModalController,
    private categoriaService: CategoriasService,
    private animationService: AnimationsService,
    private alertService: DisparadoresService,
    private negocioService: NegocioService,
    private ofertaService: OfertasService,
    private pedidoService: PedidoService,
    private chatService: ChatService,
    private uidService: UidService,
  ) {}


  async ngOnInit() {
    await this.getCategorias()
    this.direccion = this.uidService.getDireccion()
    this.getUid()
    this.getOfertas()
    this.getPopulares()
    this.getMasVendidos()
    this.getMasConsultados()
    this.listenCambios()
    this.listenRegion()
  }

  listenRegion() {
    this.uidService.change.subscribe(resp => {
      if (resp) {
        this.uidService.regionChange(false)
        location.reload()
      }
    })
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      const nombre = 'app'
      navigator[nombre].exitApp()
    })
    if (this.uid) this.getPedidosActivos()
  }

  getUid() {
    this.uidSub = this.uidService.usuario.subscribe(uid => {
      if (uid) {
        this.ngZone.run(async () => {
          this.pedidos = []
          this.negociosVisitados = []
          this.catsReady = false
          this.pedidosReady = false
          this.visitadosReady = false
          this.uid = uid
          this.getVisitas() // Ordena categorías
          this.getPedidosActivos() // Pedidos en curso
          this.getNegociosVisitados()
        })
      } else {
        this.uid = null
        this.pedidos = []
        this.negociosVisitados = []
        this.catsReady = true
        this.pedidosReady = true
        this.visitadosReady = true
        if (this.pedSub) this.pedSub.unsubscribe()
        if (this.msgSub) this.msgSub.unsubscribe()
        this.pedidoService.listenEntregados().query.ref.off('child_removed')
      }
    })
  }

  getVisitas() { // para ordenar categorías
    this.categoriaService.getVisitas(this.uid).then(visitas => {
      if (visitas) {
        this.categorias.forEach(c => c.visitas = 0)
        Object.entries(visitas).forEach(v => {
          const i = this.categorias.findIndex(c => c.categoria === v[0])
          if (i >= 0) this.categorias[i].visitas = v[1]
        })
        this.categorias.sort((a, b) => b.visitas - a.visitas)
      }
      this.catsReady = true
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

  getPedidosActivos() {
    if (this.pedSub) this.pedSub.unsubscribe()
    this.pedSub = this.pedidoService.getPedidosActivos().subscribe((pedidos: Pedido[]) => {
      this.ngZone.run(() => {
        if (pedidos && pedidos.length > 0) {
          this.pedidos = pedidos
          this.listenNewMsg()
          this.listenEntregados()
          this.pedidos.reverse()
        } else {
          this.pedSub.unsubscribe()
        }
        this.pedidosReady = true
      })
    })
  }

  getOfertas() {
    this.ofertaService.getOfertas(this.batch + 1, 'todas').then((ofertas: Oferta[]) => {
      if (ofertas.length === this.batch + 1) {
        this.hayMas = true
        ofertas.shift()
      }
      this.ofertas = ofertas.reverse()
      this.promosReady = true
    })
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

  getMasVendidos() {
    this.categoriaService.getMasVendidos().then(vendidos => {
      this.masVendidos = vendidos
      this.masVendidos = this.masVendidos.filter(v => !v.agotado)
      this.masVendidos.sort((a, b) => b.ventas - a.ventas)
      this.vendidosReady = true
    })
  }

  getMasConsultados() {
    this.categoriaService.getMasConsultados().then(consultados => {
      this.masConsultados = consultados
      this.masConsultados.sort((a, b) => b.consultas - a.consultas)
      this.consultadosReady = true
    })
  }

  getNegociosVisitados() { // Mis Favoritos
    this.negociosVisitados = []
    this.categoriaService.getVisitasNegocios(this.uid).then(n => {
      if (n.length > 0) {
        n.forEach(async (x) => {
          this.ofertaService.getStatus(x.idNegocio).then((info: InfoGral) => {
            if (info) {
              info.visitas = x.visitas
              this.negociosVisitados.push(info)
              this.negociosVisitados.sort((a, b) => b.visitas - a.visitas)
              this.negociosVisitados.sort((a, b) => a.abierto === b.abierto ? 0 : a.abierto ? -1 : 1)
              this.costoEnvio(this.negociosVisitados)
            }
          })
        })
      }
      this.visitadosReady = true
    })
  }

  getPopulares() {
    this.categoriaService.getPopulares().then(async (populares)  => {
      this.negociosPopulares = populares
      this.negociosPopulares.sort((a, b) => b.calificaciones - a.calificaciones)
      this.negociosPopulares.sort((a, b) => b.promedio - a.promedio)
      this.negociosPopulares.sort((a, b) => b.visitas - a.visitas)
      this.negociosPopulares.sort((a, b) => a.abierto === b.abierto ? 0 : a.abierto ? -1 : 1)
      this.costoEnvio(this.negociosPopulares)
      this.popularesReady = true
    })
  }

    // Listeners

  listenCambios() {
    this.categoriaService.isOpen().query.ref.on('child_changed', data => {
      this.ngZone.run(() => {
        const status = data.val()
        if (this.negociosVisitados.length > 0) {
          const i = this.negociosVisitados.findIndex(n => n.idNegocio === status.idNegocio)
          if (i >= 0) this.negociosVisitados[i].abierto = status.abierto
        }
        if (this.negociosPopulares.length > 0) {
          const y = this.negociosPopulares.findIndex(n => n.idNegocio === status.idNegocio)
          if (y >= 0) this.negociosPopulares[y].abierto = status.abierto
        }
        if (this.negMatch.length > 0) {
          const x = this.negMatch.findIndex(n => n.idNegocio = status.idNegocio)
          if (x >= 0) this.negMatch[x].abierto = status.abierto
        }
      })
    })
  }

  listenNewMsg() {
    if (this.msgSub) this.msgSub.unsubscribe()
    this.msgSub = this.chatService.listenMsg().subscribe((unReadmsg: UnreadMsg[]) => {
      this.ngZone.run(() => {
        this.pedidos.forEach(p => {
          const i = unReadmsg.findIndex(u => u.idPedido === p.id)
          if (i >= 0) p.unRead = unReadmsg[i].cantidad
          else  p.unRead = 0
        })
      })
    })
  }

  listenEntregados() {
    this.pedidoService.listenEntregados().query.ref.on('child_removed', snapshot => {
      this.ngZone.run(() => {
        const pedidoEliminado: Pedido = snapshot.val()
        const index = this.pedidos.findIndex(p => p.id === pedidoEliminado.id)
        this.pedidos.splice(index, 1)
        if (pedidoEliminado.entregado) this.alertService.presentToast(`Tu pedido de ${pedidoEliminado.negocio.nombreNegocio} ha sido entregado.`)
        if (this.pedidos.length === 0) {
          this.pedidoService.listenEntregados().query.ref.off('child_removed')
          if (this.msgSub) this.msgSub.unsubscribe()
        }
      })
    })
  }

  // Acciones

  async login() {
    const modal = await this.modalController.create({
      cssClass: 'my-custom-modal-css',
      component: LoginPage,
    })

    return await modal.present()
  }

  async buscar(event?) {
    if (event) event.target.blur()
    if (this.busqueda.length === 0) return
    this.negMatch = []
    this.buscando = true
    if (this.negociosBusqueda.length === 0) {
      this.negociosBusqueda = await this.negocioService.getPalabrasClave()
    }
    for (let i = 0; i < this.negociosBusqueda.length; i++) {
      const busquedaArray = this.busqueda.toLocaleLowerCase().split(' ')
      if (busquedaArray.length > 0) {
        let incluir = false
        for (let index = 0; index < busquedaArray.length; index++) {
          const element = busquedaArray[index]
          const includes = this.negociosBusqueda[i].palabras.toLocaleLowerCase().includes(element)
          if (includes) {
            incluir = true
          } else {
            incluir = false
            break
          }
        }
        if (incluir) {
          this.negMatch.push(this.negociosBusqueda[i])
          setTimeout(async () => {      
            const el = document.getElementById(this.negociosBusqueda[i].idNegocio)
            this.animationService.animBrincaDelay(el, 'scale(.7)', 'scale(1.2)', i)
            if (this.negMatch.length === 1) {
              const tit = document.getElementById('tituloBusqueda')
              this.animationService.animEntradaCrescent(tit)
            }
          }, 50)
        }
      }
    }
    if (this.negMatch.length === 0) this.alertService.presentAlert('No hay resultados', 'No se encontraron coincidencias con ' + this.busqueda)
    await this.costoEnvio(this.negMatch)
    this.buscando = false
  }

  resetBusqueda() {
    this.busqueda = ''
    const tit = document.getElementById('cardBusqueda')
    this.animationService.salida(tit)
    .then(() => this.negMatch = [])
  }

  async verOfertas() {
    const modal = await this.modalController.create({
      component: OfertasPage,
      componentProps: {categoria: 'todas', batch: this.batch}
    })

    return modal.present()
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

  // Redirección

  verPedido(pedido: Pedido) {
    this.router.navigate(['/avances', pedido.id])
  }

  async verProducto(prod: MasVendido) {
    const infoNeg: InfoGral = await this.ofertaService.getStatus(prod.idNegocio)
    const uid = this.uidService.getUid()
    if (uid) {
      this.categoriaService.setVisitaNegocio(uid, infoNeg.idNegocio)
      this.categoriaService.setVisitaCategoria(this.uid, infoNeg.categoria)
    }
    this.categoriaService.setVisita(infoNeg)
    if (infoNeg.tipo === 'productos') this.router.navigate([`negocio/${prod.categoria}/${prod.idNegocio}/${infoNeg.abierto}`])
    else this.router.navigate([`negocio-servicios/${prod.categoria}/${prod.idNegocio}/${infoNeg.abierto}`])
  }

  async verProductoConInfo(prod: InfoGral) {
    const uid = this.uidService.getUid()
    if (uid) {
      this.categoriaService.setVisitaNegocio(uid, prod.idNegocio)
      this.categoriaService.setVisitaCategoria(this.uid, prod.categoria)
    }
    this.categoriaService.setVisita(prod)
    if (prod.tipo === 'productos') {
      this.router.navigate([`negocio/${prod.categoria}/${prod.idNegocio}/${prod.abierto}`])
    } else {
      this.router.navigate([`negocio-servicios/${prod.categoria}/${prod.idNegocio}/${prod.abierto}`])
    }
  }

  irACategoria(categoria: string) {
    if (this.uid) this.categoriaService.setVisitaCategoria(this.uid, categoria)
    this.router.navigate(['/categoria', categoria])
  }

  async irAOferta(oferta: Oferta) {
    const infoNeg: InfoGral = await this.ofertaService.getStatus(oferta.idNegocio)
    if (this.uid) {
      this.categoriaService.setVisitaCategoria(this.uid, infoNeg.categoria)
      this.categoriaService.setVisitaNegocio(this.uid, infoNeg.idNegocio)
    }
    this.categoriaService.setVisita(infoNeg)
    if (infoNeg.tipo === 'productos') {
      this.router.navigate([`negocio/${infoNeg.categoria}/${oferta.idNegocio}/${infoNeg.abierto}`])
    } else {
      this.router.navigate([`negocio-servicios/${infoNeg.categoria}/${oferta.idNegocio}/${infoNeg.abierto}`])
    }
  }

  ionViewWillLeave() {
    if (this.back) this.back.unsubscribe()
  }

  ngOnDestroy() {
    if (this.pedSub) this.pedSub.unsubscribe()
    if (this.uidSub) this.uidSub.unsubscribe()
    if (this.msgSub) this.msgSub.unsubscribe()
    this.pedidoService.listenEntregados().query.ref.off('child_removed')
    this.categoriaService.listenCambios().query.ref.off('child_changed')
  }

  // Animation
  ionImgWillLoad(image) {
    this.animationService.enterAnimation(image.target)
  }

}
