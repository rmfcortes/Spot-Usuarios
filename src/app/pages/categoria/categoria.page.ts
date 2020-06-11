import { Component, ViewChild, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInfiniteScroll, ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { OfertasPage } from 'src/app/modals/ofertas/ofertas.page';

import { CategoriasService } from 'src/app/services/categorias.service';
import { OfertasService } from 'src/app/services/ofertas.service';
import { UidService } from 'src/app/services/uid.service';

import { Negocio, Oferta, InfoGral } from 'src/app/interfaces/negocio';
import { AnimationsService } from 'src/app/services/animations.service';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
})
export class CategoriaPage implements OnInit, OnDestroy{

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

  categoria: string;
  subCategorias: string[];
  ofertas: Oferta[] = [];
  negocios: Negocio[] = [];
  status = 'abiertos';

  lastKey = '';
  lastValue = null;
  batch = 15;
  noMore = false;

  batchOfertas = 10;
  hayMas = false;

  subCategoria = 'todos';

  slideOpts = {
    centeredSlides: true,
    initialSlide: 0,
    slidesPerView: 1.2,
    speed: 400,
  };

  promosReady = false;
  negociosReady = false;

  back: Subscription;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private animationService: AnimationsService,
    private categoriaService: CategoriasService,
    private ofertaService: OfertasService,
    private uidService: UidService,
  ) { }

  // Carga datos iniciales

  ngOnInit() {
    this.categoria = this.activatedRoute.snapshot.paramMap.get('cat');
    this.getSubCategorias();
    this.getOfertas();
    this.getNegocios();
    this.listenCambios();
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.router.navigate(['/home']);
    });
  }

  getSubCategorias() {
    this.categoriaService.getSubCategorias(this.categoria)
    .then(subcategorias => {
      this.subCategorias = subcategorias;
      this.subCategorias.unshift('todos');
    })
    .catch((err) => console.log(err));
  }

  async getOfertas() {
    this.ofertaService.getOfertas(this.batchOfertas + 1, this.categoria)
    .then((ofertas: Oferta[]) => {
      if (ofertas.length === this.batchOfertas + 1) {
        this.hayMas = true;
        ofertas.shift();
      }
      this.ofertas = ofertas.reverse();
      this.promosReady = true;
    })
    .catch((err) => console.log(err));;
  }

  async getNegocios(event?) {
    this.categoriaService
      .getNegocios(this.status, this.categoria, this.subCategoria, this.batch + 1, this.lastKey, this.lastValue)
      .then(negocios => {
        if (negocios.length === this.batch + 1) {
          this.lastKey = negocios[0].id;
          this.lastValue = negocios[0].promedio;
          negocios.shift();
        } else if (this.status === 'abiertos') {
          this.status = 'cerrados';
          this.lastKey = '';
          this.lastValue = '';
          this.negocios = this.negocios.concat(negocios.reverse());
          if (event) { event.target.complete(); }
          this.getNegocios(event);
          return;
        } else {
          this.noMore = true;
        }
        this.negocios = this.negocios.concat(negocios.reverse());
        if (event) { event.target.complete(); }
        this.negociosReady = true;
      })
      .catch((err) => console.log(err));;
  }

  // Listeners

  listenCambios() {
    this.categoriaService.isOpen().query.ref.on('child_changed', data => {
      this.ngZone.run(() => {
        const negocio = data.val();
        if (this.negocios.length > 0) {
          const i = this.negocios.findIndex(n => n.id === negocio.idNegocio);
          if (i >= 0) {
            this.negocios[i].abierto = negocio.abierto;
          }
        }
      });
    });
  }
  
  // Ver negocio

  async verNegocio(negocio: Negocio) {
    const infoNeg: InfoGral = await this.ofertaService.getStatus(negocio.id);
    const uid = this.uidService.getUid();
    if (uid) {
      this.categoriaService.setVisitaNegocio(uid, infoNeg.idNegocio);
    }
    this.categoriaService.setVisita(infoNeg);
    if (negocio.tipo === 'productos') {
      this.router.navigate([`negocio/${this.categoria}/${negocio.id}/${infoNeg.abierto}`]);
    } else {
      this.router.navigate([`negocio-servicios/${this.categoria}/${negocio.id}/${infoNeg.abierto}`]);
    }
  }

  async verOfertas() {
    const modal = await this.modalController.create({
      component: OfertasPage,
      componentProps: {categoria: this.categoria, batch: this.batchOfertas}
    });

    return modal.present();
  }

  async irAOferta(oferta: Oferta) {
    const uid = this.uidService.getUid();
    const infoNeg: InfoGral = await this.ofertaService.getStatus(oferta.idNegocio);
    if (uid) {
      this.categoriaService.setVisitaNegocio(uid, oferta.idNegocio);
    }
    this.categoriaService.setVisita(infoNeg);
    this.router.navigate(['/negocio', infoNeg.categoria, oferta.idNegocio, infoNeg.abierto]);
  }

  // Filtra por categoria

  async getNegociosSub(subCategoria) {
    this.negociosReady = false;
    this.subCategoria = subCategoria;
    this.negocios = [];
    this.lastValue = null;
    this.lastKey = '';
    this.noMore = false;
    this.status = 'abiertos';
    this.infiniteScroll.disabled = false;
    this.getNegocios();
  }

  // Infinite Scroll

  async loadData(event) {
    if (this.noMore) {
      event.target.disabled = true;
      event.target.complete();
      return;
    }
    this.getNegocios(event);
    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  ionViewWillLeave() {
    if (this.back) {this.back.unsubscribe()}
  }

  ngOnDestroy() {
    this.categoriaService.listenCambios().query.ref.off('child_changed');
    if (this.back) { this.back.unsubscribe(); }
  }

  // Tracks

  trackNegocios(index:number, el:Negocio): string {
    return el.id;
  }

  // Animation
  ionImgWillLoad(image) {
    this.animationService.enterAnimation(image.target)
  }

}
