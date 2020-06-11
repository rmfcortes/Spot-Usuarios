import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ModalController, IonInfiniteScroll, NavController, Platform } from '@ionic/angular';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';

import { InfoSucursalPage } from 'src/app/modals/info-sucursal/info-sucursal.page';
import { ServicioPage } from 'src/app/modals/servicio/servicio.page';

import { NegocioServiciosService } from 'src/app/services/negocio-servicios.service';
import { DisparadoresService } from 'src/app/services/disparadores.service';

import { Negocio, DatosParaCuenta, InfoPasillos, ProductoPasillo } from 'src/app/interfaces/negocio';

import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';
import { Producto } from 'src/app/interfaces/producto';


@Component({
  selector: 'app-negocio-servicios',
  templateUrl: './negocio-servicios.page.html',
  styleUrls: ['./negocio-servicios.page.scss'],
})
export class NegocioServiciosPage {

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

  portada: string;
  telefono: string;
  whats: string;
  categoria: string;
  vista: string;

  negocio: Negocio;
  servicios: ProductoPasillo[] = [];

  pasillos: InfoPasillos = {
    vista: '',
    portada: '',
    pasillos: []
  };
  yPasillo = 0;

  batch = 20;
  lastKey = '';
  noMore = false;

  infiniteCall = 1;
  serviciosCargados = 0;

  pasilloFiltro = '';
  cambiandoPasillo = false;

  hasOfertas = false;
  infoReady = false;
  error = false;

  cargandoProds = true;

  backButtonSubscription: Subscription;

  constructor(
    private platform: Platform,
    private callNumber: CallNumber,
    private navCtrl: NavController,
    private socialSharing: SocialSharing,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private negServicios: NegocioServiciosService,
    private alertService: DisparadoresService,
  ) { }

  ionViewWillEnter() {
    this.categoria = this.activatedRoute.snapshot.paramMap.get('cat');
    this.getNegocio();
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar();
    });
  }

  async getNegocio() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    const abierto = this.activatedRoute.snapshot.paramMap.get('status');
    let status;
    if (abierto === 'true') {
      status = 'abiertos';
    } else {
      status = 'cerrados';
    }
    this.negocio = await this.negServicios.getNegocioPreview(id, this.categoria, status);
    if (!this.negocio) {
      this.infoReady = true;
      this.error = true;
      return;
    }
    this.getPasillos();
  }

  async getPasillos() {
    const detalles: InfoPasillos = await this.negServicios.getPasillos(this.categoria, this.negocio.id);
    this.portada = detalles.portada;
    this.telefono = detalles.telefono;
    this.pasillos.pasillos = detalles.pasillos;
    this.vista = detalles.vista || 'cards';
    this.whats = detalles.whats;
    this.pasillos.pasillos = this.pasillos.pasillos.sort((a, b) => a.prioridad - b.prioridad);
    this.getInfoServicios();
  }

  // Get Servicios

  getOfertas() {
    this.cargandoProds = true;
    this.negServicios.getOfertas(this.categoria, this.negocio.id).then(async (ofertas: Producto[]) => {
      if (ofertas && ofertas.length > 0) {
        this.hasOfertas = true;
        this.agregaServicios(ofertas, 'Ofertas');
      } else {
        this.cargandoProds = false;
        this.hasOfertas = false;
      }
      if (!this.pasilloFiltro) {
        this.cargandoProds = false;
        this.getInfoServicios();
      }
    });
  }

  async getInfoServicios() {
    this.infiniteCall = 1;
    this.serviciosCargados = 0;
    this.cargandoProds = true;
    this.getServices();
  }

  async getServices(event?) {
    return new Promise(async (resolve, reject) => {
      const servicios = await this.negServicios
        .getServicios(this.categoria, this.negocio.id, this.pasillos.pasillos[this.yPasillo].nombre, this.batch + 1, this.lastKey);
      this.cambiandoPasillo = false;
      if (servicios && servicios.length > 0) {
        this.lastKey = servicios[servicios.length - 1].id;
        this.evaluaServicios(servicios, event);
      } else if ( this.yPasillo + 1 < this.pasillos.pasillos.length ) {
        this.yPasillo++;
        this.lastKey = null;
        if (this.serviciosCargados < this.batch * this.infiniteCall) {
          this.getServices();
        }
      } else {
        this.infoReady = true;
        this.cargandoProds = false;
        this.noMore = true;
        if (event) { event.target.complete(); }
        resolve();
      }
    });
  }

  async evaluaServicios(servicios, event?) {
    if (servicios.length === this.batch + 1) {
      servicios.pop();
      return await this.agregaServicios(servicios, this.pasillos.pasillos[this.yPasillo].nombre, event);
    } else if (servicios.length === this.batch && this.yPasillo + 1 < this.pasillos.pasillos.length) {
      return await this.nextPasillo(servicios, event);
    } else if (this.yPasillo + 1 >= this.pasillos.pasillos.length) {
      this.noMore = true;
      if (event) { event.target.complete(); }
      return await this.agregaServicios(servicios, this.pasillos.pasillos[this.yPasillo].nombre, event);
    }
    if (servicios.length < this.batch && this.yPasillo + 1 < this.pasillos.pasillos.length) {
      await this.nextPasillo(servicios, event);
      if (this.serviciosCargados < this.batch * this.infiniteCall) {
        return this.getServices();
      }
    } else {
      this.agregaServicios(servicios, this.pasillos.pasillos[this.yPasillo].nombre, event);
      this.noMore = true;
    }
  }

  async nextPasillo(servicios, event?) {
    return new Promise(async (resolve, reject) => {
      await this.agregaServicios(servicios, this.pasillos.pasillos[this.yPasillo].nombre, event);
      this.yPasillo++;
      this.lastKey = null;
      resolve();
    });
  }

  async agregaServicios(productos: Producto[], pasillo, event?) {
    return new Promise(async (resolve, reject) => {
      this.serviciosCargados += productos.length;
      if ( this.servicios.length > 0 && this.servicios[this.servicios.length - 1].nombre === pasillo) {
        this.servicios[this.servicios.length - 1].productos = this.servicios[this.servicios.length - 1].productos.concat(productos);
      } else {
        const prodArray: ProductoPasillo = {
          nombre: pasillo,
          productos
        };
        this.servicios.push(prodArray);
      }
      if (event) { event.target.complete(); }
      this.infoReady = true;
      this.cargandoProds = false;
      console.log(this.servicios);
      resolve();
    });
  }

  loadDataLista(event) {
    if (this.cambiandoPasillo) {
      event.target.complete();
      return;
    }
    this.infiniteCall++;
    if (this.noMore) {
      event.target.disabled = true;
      event.target.complete();
      return;
    }
    this.getServices(event);

    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  // Al filtrar

  async getServFiltrados(event?) {
    const servicios = await this.negServicios
      .getServicios(this.categoria, this.negocio.id, this.pasilloFiltro, this.batch + 1, this.lastKey);
    this.cambiandoPasillo = false;
    this.lastKey = servicios[servicios.length - 1].id;
    this.cargaFiltrados(servicios, event);
  }

  cargaFiltrados(servicios, event) {
    if (servicios.length === this.batch + 1) {
      this.lastKey = servicios[servicios.length - 1].id;
      servicios.pop();
    } else {
      this.noMore = true;
    }
    if (this.servicios.length === 0) {
      this.servicios =  [{
        nombre: this.pasilloFiltro,
        productos: [...servicios]
      }];
    } else {
      this.servicios =  [{
        nombre: this.pasilloFiltro,
        productos: this.servicios[0].productos.concat(servicios)
      }];
    }
    if (event) {
      event.target.complete();
    }
  }

  resetProds(pasillo?) {
    this.cambiandoPasillo = true;
    this.lastKey = '';
    this.yPasillo = 0;
    this.servicios = [];
    this.serviciosCargados = 0;
    this.infiniteCall = 1;
    this.noMore = false;
    this.infiniteScroll.disabled = false;
    this.pasilloFiltro = pasillo;
    if (!pasillo || pasillo === 'Ofertas') {
      this.getOfertas();
    } else {
      this.getServFiltrados();
    }
  }

  loadDataListaFiltrada(event) {
    if (this.cambiandoPasillo) {
      event.target.complete();
      return;
    }
    if (this.noMore) {
      event.target.disabled = true;
      event.target.complete();
      return;
    }
    this.getServFiltrados(event);

    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  // Acciones

  async verServicio(servicio) {
    const modal = await this.modalController.create({
      component: ServicioPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {servicio, whats: this.whats}
    });

    return await modal.present();
  }

  llamar() {
    this.callNumber.callNumber(this.telefono.toString(), true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.error(err));
  }

  async contactViaWhatsApp() {
    const tel = '+52' + this.whats;
    this.socialSharing.shareViaWhatsAppToReceiver(
      tel,
      'Hola, vi tu negocio en Spot, me interesa más información'
    ).then(resp => {
      console.log('Success');
    }).catch(err => {
      this.alertService.presentAlert('Error', err);
    });
  }

  async verInfo() {
    const datos: DatosParaCuenta = {
      logo: this.negocio.foto,
      nombreNegocio: this.negocio.nombre,
      idNegocio: this.negocio.id,
      categoria: this.categoria
    };
    const modal = await this.modalController.create({
      component: InfoSucursalPage,
      enterAnimation,
      componentProps : {datos, abierto: this.negocio.abierto}
    });

    return await modal.present();
  }

  // Salida

  regresar() {
    if (this.backButtonSubscription) { this.backButtonSubscription.unsubscribe() }
    this.navCtrl.back();
  }

    // Auxiliares

    reintentar() {
      location.reload();
    }

}
