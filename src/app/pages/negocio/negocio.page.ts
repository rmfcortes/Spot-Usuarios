import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, IonInfiniteScroll, NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { InfoSucursalPage } from 'src/app/modals/info-sucursal/info-sucursal.page';
import { ProductoPage } from 'src/app/modals/producto/producto.page';
import { CuentaPage } from 'src/app/modals/cuenta/cuenta.page';
import { LoginPage } from 'src/app/modals/login/login.page';

import { NegocioService } from 'src/app/services/negocio.service';
import { CartService } from 'src/app/services/cart.service';
import { UidService } from 'src/app/services/uid.service';

import { Negocio, DatosParaCuenta, InfoPasillos, ProductoPasillo } from 'src/app/interfaces/negocio';
import { Producto } from 'src/app/interfaces/producto';

import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';
import { AnimationsService } from 'src/app/services/animations.service';


@Component({
  selector: 'app-negocio',
  templateUrl: './negocio.page.html',
  styleUrls: ['./negocio.page.scss'],
})
export class NegocioPage {

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

  uid: string;
  categoria: string;

  negocio: Negocio;
  portada: string;
  vista: string;
  productos: ProductoPasillo[] = [];
  pasillos: InfoPasillos = {
    vista: '',
    portada: '',
    pasillos: []
  };

  infiniteCall: number;
  productosCargados: number;
  yPasillo = 0;

  batch = 15;
  lastKey = '';
  noMore = false;

  cuenta = 0;

  pasilloFiltro = '';
  cambiandoPasillo = false;

  cargandoProds = true;
  hasOfertas = false;
  infoReady = false;
  error = false;

  back: Subscription;

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private alertController: AlertController,
    private animationService: AnimationsService,
    private negocioService: NegocioService,
    private cartService: CartService,
    private uidService: UidService,
  ) { }

  // Get info inicial

  ionViewWillEnter() {
    this.uid = this.uidService.getUid();
    this.categoria = this.activatedRoute.snapshot.paramMap.get('cat');
    this.getNegocio();
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
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
    this.negocio = await this.negocioService.getNegocioPreview(id, this.categoria, status);
    if (!this.negocio) {
      this.infoReady = true;
      this.error = true;
      return;
    }
    if (this.uid) {
      this.cuenta = await this.negocioService.getCart(this.uid, this.negocio.id);
    }
    this.getPasillos();
  }

  async getPasillos() {
    const detalles: InfoPasillos = await this.negocioService.getPasillos(this.categoria, this.negocio.id);
    this.portada = detalles.portada;
    this.vista = detalles.vista || 'lista';
    this.pasillos.pasillos = detalles.pasillos;
    this.pasillos.pasillos = this.pasillos.pasillos.sort((a, b) => a.prioridad - b.prioridad);
    this.getOfertas();
  }

  // Get Productos

  getOfertas() {
    this.cargandoProds = true;
    this.negocioService.getOfertas(this.categoria, this.negocio.id).then(async (ofertas: Producto[]) => {
      if (ofertas && ofertas.length > 0) {
        this.hasOfertas = true;
        this.agregaProductos(ofertas, 'Ofertas');
      } else {
        this.hasOfertas = false;
        this.cargandoProds = false;
      }
      if (!this.pasilloFiltro) {
        this.getInfoProdsLista();
      }
    });
  }

  async getInfoProdsLista() {
    this.infiniteCall = 1;
    this.productosCargados = 0;
    this.cargandoProds = true;
    this.getProds();
  }

  async getProds(event?) {
    return new Promise(async (resolve, reject) => {
      const productos = await this.negocioService
      .getProductosLista(this.categoria, this.negocio.id, this.pasillos.pasillos[this.yPasillo].nombre, this.batch + 1, this.lastKey);
      this.cambiandoPasillo = false;
      if (productos && productos.length > 0) {
        this.lastKey = productos[productos.length - 1].id;
        this.evaluaProdsLista(productos, event);
      } else if ( this.yPasillo + 1 < this.pasillos.pasillos.length ) {
        this.yPasillo++;
        this.lastKey = null;
        if (this.productosCargados < this.batch * this.infiniteCall) {
          this.getProds();
        }
      } else {
        this.noMore = true;
        this.infoReady = true;
        this.cargandoProds = false;
        if (this.productos.length === 0) {

        }
        if (event) { event.target.complete(); }
        resolve();
      }
    });
  }

  async evaluaProdsLista(productos, event?) {
    if (productos.length === this.batch + 1) {
      productos.pop();
      return await this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event);
    } else if (productos.length === this.batch && this.yPasillo + 1 < this.pasillos.pasillos.length) {
      return await this.nextPasillo(productos, event);
    } else if (this.yPasillo + 1 >= this.pasillos.pasillos.length) {
      this.noMore = true;
      if (event) { event.target.complete(); }
      return await this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event);
    }
    if (productos.length < this.batch && this.yPasillo + 1 < this.pasillos.pasillos.length) {
      await this.nextPasillo(productos, event);
      if (this.productosCargados < this.batch * this.infiniteCall) {
        return this.getProds();
      }
    } else {
      this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event);
      this.noMore = true;
    }
  }

  async nextPasillo(productos, event?) {
    return new Promise(async (resolve, reject) => {
      await this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event);
      this.yPasillo++;
      this.lastKey = null;
      resolve();
    });
  }

  async agregaProductos(prod: Producto[], pasillo, event?) {
    return new Promise(async (resolve, reject) => {
      this.productosCargados += prod.length;
      if ( this.productos.length > 0 && this.productos[this.productos.length - 1].nombre === pasillo) {
        this.productos[this.productos.length - 1].productos = this.productos[this.productos.length - 1].productos.concat(prod);
      } else {
        const prodArray: ProductoPasillo = {
          nombre: pasillo,
          productos: prod
        };
        this.productos.push(prodArray);
      }
      if (event) { event.target.complete(); }
      resolve();
      this.infoReady = true;
      this.cargandoProds = false;
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
    this.getProds(event);

    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  // Acciones
  async muestraProducto(producto: Producto) {
    const modal = await this.modalController.create({
      component: ProductoPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {producto, idNegocio: this.negocio.id}
    });
    modal.onWillDismiss().then(async (resp) => {
      if (resp.data) {
        producto = await this.cartService.updateCart(this.negocio.id, producto);
        this.cuenta = await this.negocioService.getCart(this.uid, this.negocio.id);
      }
    });
    return await modal.present();
  }
  
  async verCuenta() {
    const datos: DatosParaCuenta = {
      logo: this.negocio.foto,
      nombreNegocio: this.negocio.nombre,
      idNegocio: this.negocio.id,
      categoria: this.categoria
    };
    const modal = await this.modalController.create({
      component: CuentaPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {cuenta: this.cuenta, datos, productos: this.productos}
    });
    modal.onWillDismiss().then(async (resp) => {
      this.cuenta = await this.negocioService.getCart(this.uid, this.negocio.id);
    });
    return await modal.present();
  }

  async getProdsFiltrados(event?) {
    this.cargandoProds = true;
    const productos = await this.negocioService
      .getProductosLista(this.categoria, this.negocio.id, this.pasilloFiltro, this.batch + 1, this.lastKey);
    this.cambiandoPasillo = false;
    this.lastKey = productos[productos.length - 1].id;
    this.cargaFiltrados(productos, event);
  }

  cargaFiltrados(productos, event) {
    if (productos.length === this.batch + 1) {
      this.lastKey = productos[productos.length - 1].id;
      productos.pop();
    } else {
      this.noMore = true;
    }
    if (this.productos.length === 0) {
      this.productos =  [{
        nombre: this.pasilloFiltro,
        productos: [...productos]
      }];
    } else {
      this.productos =  [{
        nombre: this.pasilloFiltro,
        productos: this.productos[0].productos.concat(productos)
      }];
    }
    if (event) {
      event.target.complete();
    }
    this.cargandoProds = false;
  }

  resetProds(pasillo?) {
    this.cambiandoPasillo = true;
    this.lastKey = '';
    this.yPasillo = 0;
    this.productos = [];
    this.productosCargados = 0;
    this.infiniteCall = 1;
    this.noMore = false;
    this.infiniteScroll.disabled = false;
    this.pasilloFiltro = pasillo;
    if (!pasillo || pasillo === 'Ofertas') {
      this.getOfertas();
    } else {
      this.getProdsFiltrados();
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
    this.getProdsFiltrados(event);

    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
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
      leaveAnimation,
      componentProps : {datos, abierto: this.negocio.abierto}
    });

    return await modal.present();
  }

  // Login
  async presentLogin() {
    const modal = await this.modalController.create({
      component: LoginPage,
      cssClass: 'my-custom-modal-css',
    });
    return await modal.present();
  }

  // Salida

  regresar() {
    if (this.back) {this.back.unsubscribe()}
    this.navCtrl.back();
  }

  // Mensajes

  async presentAlertNotLogin() {
    const alert = await this.alertController.create({
      header: 'Inicia sesión',
      message: `Para darte la mejor experiencia, por favor inicia sesión antes de continuar con tu pedido. <br> ¡Es muy sencillo!`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'tertiary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        },
        {
          text: 'Iniciar sesión',
          cssClass: 'primary',
          handler: (blah) => {
            this.presentLogin();
          }
        }
      ]
    });

    await alert.present();
  }

  // Auxiliares

  reintentar() {
    location.reload();
  }

}
