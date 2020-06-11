import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ActionSheetController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DireccionesPage } from '../direcciones/direcciones.page';
import { FormasPagoPage } from '../formas-pago/formas-pago.page';
import { ProductoPage } from '../producto/producto.page';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { AnimationsService } from 'src/app/services/animations.service';
import { NegocioService } from 'src/app/services/negocio.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { PagosService } from 'src/app/services/pagos.service';
import { CartService } from 'src/app/services/cart.service';
import { UidService } from 'src/app/services/uid.service';

import { Producto, ListaComplementosElegidos, Complemento } from 'src/app/interfaces/producto';
import { Pedido, DatosNegocioParaPedido, Cliente } from 'src/app/interfaces/pedido';
import { DatosParaCuenta, ProductoPasillo } from 'src/app/interfaces/negocio';
import { FormaPago } from 'src/app/interfaces/forma-pago.interface';
import { Direccion } from 'src/app/interfaces/direcciones';

import { enterAnimationDerecha } from 'src/app/animations/enterDerecha';
import { leaveAnimationDerecha } from 'src/app/animations/leaveDerecha';
import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
})
export class CuentaPage implements OnInit {

  @Input() cuenta: number
  @Input() datos: DatosParaCuenta
  @Input() productos: ProductoPasillo[]

  datosNegocio: DatosNegocioParaPedido
  cart: Producto[]

  direccion: Direccion
  formaPago: FormaPago

  direcciones = []

  back: Subscription
  infoReady = false

  comision: number

  constructor(
    private router: Router,
    private platform: Platform,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private animationService: AnimationsService,
    private alertSerivce: DisparadoresService,
    private negocioService: NegocioService,
    private pedidoService: PedidoService,
    private pagoService: PagosService,
    private cartService: CartService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
    this.getDireccion()
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.closeCart()
    });
  }
  
  getDireccion() {
    this.cartService.getUltimaDireccion().then(dir => {
      this.direccion = dir;
      this.getCart()
    });
  }

  getCart() {
    this.cartService.getCart(this.datos.idNegocio).then((cart: Producto[]) => {
      this.cart = cart;
      this.getInfo()
    });
  }

  getInfo() {
    this.cartService.getInfoNegocio(this.datos.categoria, this.datos.idNegocio).then(neg => {
      this.datosNegocio = neg
      this.getFormaPago()
      Object.assign(this.datosNegocio, this.datos)
    });
  }

  getFormaPago() {
    this.cartService.getUltimaFormaPago().then(forma => {
      if (forma.tipo === 'efectivo') {
        this.comision = 0
        if (this.datosNegocio.formas_pago.efectivo) this.formaPago = forma
        else this.formaPago = null
      } else {
        this.comision = ((this.cuenta * 0.04) + 3) * 1.16
        if (this.datosNegocio.formas_pago.tarjeta) this.formaPago = forma
        else this.formaPago = null
      }
      this.infoReady = true
    })
  }


  // Acciones

  async muestraProducto(producto: Producto) {
    const modal = await this.modalCtrl.create({
      component: ProductoPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {producto, idNegocio: this.datos.idNegocio}
    });
    modal.onWillDismiss().then(async (resp) => {
      if (resp.data) {
        const uid = this.uidService.getUid()
        await this.cartService.editProduct(this.datos.idNegocio, producto);
        this.cuenta = await this.negocioService.getCart(uid, this.datos.idNegocio);
      }
    });
    return await modal.present();
  }

  async mostrarDirecciones() {
    const modal = await this.modalCtrl.create({
      component: DireccionesPage,
      enterAnimation,
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        this.direccion = resp.data;
      }
    });
    return await modal.present();
  }

  deleteProducto(i) {
    this.alertSerivce.presentAlertAction('Quitar artículo', '¿Estás seguro que deseas eliminar este artículo?')
    .then(resp => {
      if (resp) {
        this.cartService.deleteProd(this.datosNegocio.idNegocio, this.cart[i]);
        this.cuenta -= this.cart[i].total;
        this.cart[i].cantidad = 0;
        this.cart[i].total = 0;
        this.productos.forEach(p => {
          const index = p.productos.findIndex(x => x.id === this.cart[i].id);
          if (index >= 0) {
            p.productos[index] = this.cart[i];
          }
        });
        this.cart.splice(i, 1);
        if (this.cuenta === 0) {
          this.closeCart();
        }
      }
    });

  }

  async formasPago() {
    const modal = await this.modalCtrl.create({
      component: FormasPagoPage,
      enterAnimation: enterAnimationDerecha,
      leaveAnimation: leaveAnimationDerecha,
      componentProps: {formas_pago_aceptadas: this.datosNegocio.formas_pago}
    })
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        if (resp.data.tipo === 'efectivo') {
          this.comision = 0
        } else {
          this.comision = ((this.cuenta * 0.04) + 3) * 1.16
        }
        this.formaPago = resp.data
      }
    })

    return await modal.present()
  }

  // Salida

  async ordenar() {
    if (!this.direccion) {
      this.alertSerivce.presentAlertAction(
        'Agrega dirección',
        'Por favor agrega una dirección de entrega antes de continuar con el pedido.')
        .then(resp => {
          if (resp) this.mostrarDirecciones()
          return
        })
      return
    }
    if (!this.formaPago) {
      this.alertSerivce.presentAlertAction(
        'Forma de pago',
        'Antes de continuar por favor agrega una forma de pago'
      ).then(resp => {
        if (resp) this.formasPago()
        return
      })
      return
    }
    try {      
      const telefono: string = await this.pedidoService.getTelefono();
      if (!telefono) {
        const resp: any = await this.alertSerivce.presentPromptTelefono();
        let tel;
        if (resp) {
          tel = resp.telefono.replace(/ /g, "");
          if (tel.length === 10) {
            this.pedidoService.guardarTelefono(resp.telefono);
          } else {
            this.alertSerivce.presentAlert('Número incorrecto', 'El teléfono agregado es incorrecto, por favor intenta de nuevo');
            return;
          }
        }
      }
      await this.alertSerivce.presentLoading()
      const cliente: Cliente = {
        direccion: this.direccion,
        nombre: this.uidService.getNombre() || 'No registrado',
        telefono,
        uid: this.uidService.getUid()
      }
      const pedido: Pedido = {
        aceptado: false,
        categoria: this.datos.categoria,
        cliente,
        comision: this.comision,
        createdAt: Date.now(),
        negocio: this.datosNegocio,
        productos: this.cart,
        total: this.cuenta + this.datosNegocio.envio + this.comision,
        entrega: this.datosNegocio.entrega || 'indefinido',
        avances: [],
        formaPago: this.formaPago,
        region: this.uidService.getRegion()
      }
      if (this.formaPago.tipo !== 'efectivo') {
        await this.pagoService.cobrar(pedido)
      }
      await this.pedidoService.createPedido(pedido)
      this.alertSerivce.dismissLoading()
      this.router.navigate(['/avances', pedido.id])
      this.closeCart();
    } catch (error) {
      this.alertSerivce.dismissLoading()
      this.alertSerivce.presentAlert('Error', 'Lo sentimos algo salió mal, por favor intenta de nuevo ' + error)
    }
  }

  closeCart() {
    if (this.back) {this.back.unsubscribe()}
    this.modalCtrl.dismiss(this.cuenta)
  }

  async presentActionOpciones(producto: Producto, i: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Qué deseas hacer?',
      buttons: [
        {
          text: 'Editar',
          icon: 'pencil',
          handler: () => {
            this.muestraProducto(producto)
          }
        },
        {
          text: 'Eliminar',
          icon: 'trash',
          handler: () => {
            this.deleteProducto(i)
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        },
      ]
    });
    await actionSheet.present();
  }

  ionImgWillLoad(image) {
    this.animationService.enterAnimation(image.target)
  }

  // Track by

  trackCart(index:number, el: Producto): string {
    return el.id;
  }

  trackProdComplementos(index:number, el: ListaComplementosElegidos): number {
    return index;
  }

  trackComplementos(index:number, el: Complemento): number {
    return index;
  }

}
