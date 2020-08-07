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

import { Categoria, SubCategoria } from 'src/app/interfaces/categoria.interface';
import { Negocio, Oferta, InfoGral } from 'src/app/interfaces/negocio';
import { CostoEnvio } from 'src/app/interfaces/envio.interface';
import { Direccion } from 'src/app/interfaces/direcciones';
import { MasVendido } from 'src/app/interfaces/producto';

import { enterAnimationCategoria } from 'src/app/animations/enterCat';
import { leaveAnimationCategoria } from 'src/app/animations/leaveCat';
import { AnimationsService } from 'src/app/services/animations.service';

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

  back: Subscription

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
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private categoriaService: CategoriasService,
    private animationService: AnimationsService,
    private alertService: DisparadoresService,
    private ofertaService: OfertasService,
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
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.router.navigate(['/home'])
    })
    this.uid = this.uidService.getUid()
  }

  async setFiltro(filtro: string) {
    const el = document.getElementById('productos')
    await this.animationService.salida(el)
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
          negocios.shift()
        } else if (this.status === 'abiertos') {
          this.status = 'cerrados'
          this.lastKey = ''
          this.lastValue = ''
          await this.costoEnvio(negocios)
          this.negocios = this.negocios.concat(negocios.reverse())
          if (event) event.target.complete()
          this.getNegocios(event, animarFiltros)
          return
        } else {
          this.noMore = true
        }
        await this.costoEnvio(negocios)
        this.negocios = this.negocios.concat(negocios.reverse())
        if (this.negocios.length && this.primer_vez) this.hayNegocios = true
        if (event) event.target.complete()  
        this.negociosReady = true
        if (animarFiltros && !event) this.animacionEntrada('filtros')
        if (!event) this.animacionEntrada('productos')
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
      componentProps: {categoria: this.categoria, categorias: this.categorias,
                    subCategoria: this.subCategoria, batch: this.batchOfertas, subCategorias: this.subCategorias}
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

  ionViewWillLeave() {
    if (this.back) this.back.unsubscribe()
  }

  ngOnDestroy() {
    this.categoriaService.listenCambios().query.ref.off('child_changed')
    if (this.back) this.back.unsubscribe()
  }


}
