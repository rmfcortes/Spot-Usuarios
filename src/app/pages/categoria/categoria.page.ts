import { Component, ViewChild, NgZone, OnInit, OnDestroy } from '@angular/core';
import { IonInfiniteScroll, ModalController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CategoriasPage } from 'src/app/modals/categorias/categorias.page';
import { OfertasPage } from 'src/app/modals/ofertas/ofertas.page';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { OfertasService } from 'src/app/services/ofertas.service';
import { UidService } from 'src/app/services/uid.service';

import { MasConsultado, MasVendido } from 'src/app/interfaces/producto';
import { Negocio, Oferta, InfoGral } from 'src/app/interfaces/negocio';
import { Categoria } from 'src/app/interfaces/categoria.interface';
import { CostoEnvio } from 'src/app/interfaces/envio.interface';
import { Direccion } from 'src/app/interfaces/direcciones';

import { enterAnimationCategoria } from 'src/app/animations/enterCat';
import { leaveAnimationCategoria } from 'src/app/animations/leaveCat';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
})
export class CategoriaPage implements OnInit, OnDestroy{

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll

  categoria: string
  categorias: Categoria[] = []
  subCategorias: string[] = []
  ofertas: Oferta[] = []
  negocios: Negocio[] = []
  status = 'abiertos'

  masConsultados: MasConsultado[] = []
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
    slidesPerView: 4.5,
    speed: 400,
    freeMode: true
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

  promosReady = false
  negociosReady = false

  back: Subscription

  direccion: Direccion
  costo_envio: CostoEnvio

  filtro = 'destacado'

  uid: string

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private categoriaService: CategoriasService,
    private alertService: DisparadoresService,
    private ofertaService: OfertasService,
    private uidService: UidService,
  ) { }

  // Carga datos iniciales

  ngOnInit() {
    this.categoria = this.activatedRoute.snapshot.paramMap.get('cat')
    this.direccion = this.uidService.getDireccion()
    this.getTodo()
    this.getOfertas()
    this.listenCambios()
    this.getCategorias()
    this.getSubCategorias()
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.router.navigate(['/home'])
    })
    this.uid = this.uidService.getUid()
  }

  setFiltro(filtro: string) {
    this.negociosReady = false
    this.negocios = []
    this.lastValue = null
    this.lastKey = ''
    this.noMore = false
    this.status = 'abiertos'
    this.infiniteScroll.disabled = false
    this.filtro = filtro
    this.getNegocios()
  }

  getSubCategorias() {
    this.categoriaService.getSubCategorias(this.categoria)
    .then(subcategorias => {
      this.subCategorias = subcategorias
      this.subCategorias.unshift('todos')
    })
    .catch((err) => console.log(err))
  }

  getTodo() {
    this.negociosReady = false
    this.vendidosReady = false
    this.consultadosReady = false
    this.getNegocios()
    this.getMasVendidos()
    this.getMasConsultados()
  }

  async getOfertas() {
    this.ofertaService.getOfertas(this.batchOfertas + 1, this.categoria)
    .then((ofertas: Oferta[]) => {
      if (ofertas.length === this.batchOfertas + 1) {
        this.hayMas = true
        ofertas.shift()
      }
      this.ofertas = ofertas.reverse()
      this.promosReady = true
    })
    .catch((err) => console.log(err))
  }

  async getNegocios(event?) {
    this.categoriaService
      .getNegocios(this.filtro, this.status, this.categoria, this.subCategoria, this.batch + 1, this.lastKey, this.lastValue)
      .then(async (negocios) => {
        if (negocios.length === this.batch + 1) {
          this.lastKey = negocios[0].id
          this.lastValue = negocios[0].promedio
          negocios.shift()
        } else if (this.status === 'abiertos') {
          this.status = 'cerrados'
          this.lastKey = ''
          this.lastValue = ''
          await this.costoEnvio(negocios)
          this.negocios = this.negocios.concat(negocios.reverse())
          if (event) event.target.complete()
          this.getNegocios(event)
          return
        } else {
          this.noMore = true
        }
        await this.costoEnvio(negocios)
        this.negocios = this.negocios.concat(negocios.reverse())
        if (event) event.target.complete()
        this.negociosReady = true
      })
      .catch((err) => console.log(err))
  }

  getMasVendidos() {
    this.masVendidos = []
    if (this.subCategoria === 'todos') {
      this.categoriaService.getMasVendidosCategoria(this.categoria).then(vendidos => {
        this.masVendidos = vendidos
        this.masVendidos = this.masVendidos.filter(v => !v.agotado)
        this.masVendidos.sort((a, b) => b.ventas - a.ventas)
        this.vendidosReady = true
      })
    } else {
      this.categoriaService.getMasVendidosSubCategoria(this.categoria, this.subCategoria).then(vendidos => {
        this.masVendidos = vendidos
        this.masVendidos = this.masVendidos.filter(v => !v.agotado)
        this.masVendidos.sort((a, b) => b.ventas - a.ventas)
        this.vendidosReady = true
      })
    }
  }

  getMasConsultados() {
    this.masConsultados = []
    if (this.subCategoria === 'todos') {
      this.categoriaService.getMasConsultadosCategoria(this.categoria).then(consultados => {
        this.masConsultados = consultados
        this.masConsultados.sort((a, b) => b.consultas - a.consultas)
        this.consultadosReady = true
      })
    } else {
      this.categoriaService.getMasConsultadosSubCategoria(this.categoria, this.subCategoria).then(consultados => {
        this.masConsultados = consultados
        this.masConsultados.sort((a, b) => b.consultas - a.consultas)
        this.consultadosReady = true
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
    const infoNeg: InfoGral = await this.ofertaService.getStatus(negocio.id)
    const uid = this.uidService.getUid()
    if (uid) this.categoriaService.setVisitaNegocio(uid, infoNeg.idNegocio)
    this.categoriaService.setVisita(infoNeg)
    if (negocio.tipo === 'productos') {
      this.router.navigate([`/negocio/${this.categoria}/${negocio.id}/${infoNeg.abierto}`], {state: {origen_categoria: true}})
    } else {
      this.router.navigate([`/negocio-servicios/${this.categoria}/${negocio.id}/${infoNeg.abierto}`], {state: {origen_categoria: true}})
    }
  }

  async verOfertas() {
    const modal = await this.modalController.create({
      component: OfertasPage,
      componentProps: {categoria: this.categoria, batch: this.batchOfertas}
    })

    return modal.present()
  }

  async irAOferta(oferta: Oferta) {
    const uid = this.uidService.getUid()
    const infoNeg: InfoGral = await this.ofertaService.getStatus(oferta.idNegocio)
    if (uid) this.categoriaService.setVisitaNegocio(uid, oferta.idNegocio)
    this.categoriaService.setVisita(infoNeg)
    this.router.navigate(['/negocio', infoNeg.categoria, oferta.idNegocio, infoNeg.abierto], {state: {origen_categoria: true}})
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
    this.router.navigate(['/categoria', categoria])
  }

  // Filtra por categoria

  async getNegociosSub(subCategoria) {
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

  ionViewWillLeave() {
    if (this.back) this.back.unsubscribe()
  }

  ngOnDestroy() {
    this.categoriaService.listenCambios().query.ref.off('child_changed')
    if (this.back) this.back.unsubscribe()
  }


}
