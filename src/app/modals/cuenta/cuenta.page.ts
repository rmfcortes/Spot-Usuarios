import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DireccionesPage } from '../direcciones/direcciones.page';
import { FormasPagoPage } from '../formas-pago/formas-pago.page';
import { ProductoPage } from '../producto/producto.page';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { AnimationsService } from 'src/app/services/animations.service';
import { NegocioService } from 'src/app/services/negocio.service';
import { NetworkService } from 'src/app/services/network.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { PagosService } from 'src/app/services/pagos.service';
import { CartService } from 'src/app/services/cart.service';
import { UidService } from 'src/app/services/uid.service';

import { Pedido, DatosNegocioParaPedido, Cliente } from 'src/app/interfaces/pedido';
import { ProductoPasillo } from 'src/app/interfaces/negocio';
import { FormaPago } from 'src/app/interfaces/forma-pago.interface';
import { CostoEnvio } from 'src/app/interfaces/envio.interface';
import { Direccion } from 'src/app/interfaces/direcciones';
import { Producto } from 'src/app/interfaces/producto';

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
  @Input() busqueda: boolean
  @Input() idNegocio: string
  @Input() categoria: string
  @Input() productos: ProductoPasillo[]

  datosNegocio: DatosNegocioParaPedido
  cart: Producto[]

  direccion: Direccion
  formaPago: FormaPago

  pago_en_efectivo: FormaPago = {
    forma: 'efectivo',
    tipo: 'efectivo',
    id: 'efectivo'
  }

  direcciones = []

  infoReady = false

  comision = 0

  botones_propina = [
    {
      texto: '0%',
      valor: 0.00
    },     
    {
      texto: '5%',
      valor: 0.05
    },    
    {
      texto: '10%',
      valor: 0.1
    },    
    {
      texto: '15%',
      valor: 0.15
    },    
    {
      texto: '20%',
      valor: 0.2
    }
  ]

  propina_sel = 2
  propina = 0
  descuento = 0

  costo_envio: CostoEnvio

  err: string

  script: HTMLScriptElement

  netSub: Subscription

  telefono: string

  confirmar = false
  cuadroAyuda: HTMLElement
  claseAyuda: HTMLElement

  infopagos = ''

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private animationService: AnimationsService,
    private alertSerivce: DisparadoresService,
    private negocioService: NegocioService,
    private pedidoService: PedidoService,
    private netService: NetworkService,
    private pagoService: PagosService,
    private cartService: CartService,
    private uidService: UidService,
  ) { }

  async ngOnInit() {
    const uid = this.uidService.getUid()
    if (!this.cuenta) this.cuenta = await this.negocioService.getCart(uid, this.idNegocio)
    this.getCart()
    this.getDireccion()
    this.calculaPropina(this.propina_sel)
    this.pedidoService.getTelefono().then(tel => this.telefono = tel)
  }
  
  getDireccion() {
    this.direccion = this.uidService.getDireccion()
  }

  getCart() {
    this.cartService.getCart(this.idNegocio).then((cart: Producto[]) => {
      this.cart = cart
      this.getInfo()
      this.getDescuentos()
    })
  }

  getDescuentos() {
    this.descuento = 0
    this.cart.forEach(p => this.descuento += p.descuento ? ((p.descuento/100) * p.precio) * p.cantidad : 0)
  }

  getInfo() {
    this.cartService.getInfoNegocio(this.categoria, this.idNegocio).then(async (neg) => {
      this.datosNegocio = neg
      if (this.datosNegocio.formas_pago.efectivo && !this.datosNegocio.formas_pago.tarjeta && !this.datosNegocio.formas_pago.terminal)
        this.infopagos = 'Este negocio sólo recibe pagos en efectivo'
      if (!this.datosNegocio.formas_pago.efectivo && this.datosNegocio.formas_pago.tarjeta && !this.datosNegocio.formas_pago.terminal)
        this.infopagos = 'Este negocio sólo recibe pagos en línea con tarjeta'
      if (!this.datosNegocio.formas_pago.efectivo && !this.datosNegocio.formas_pago.tarjeta && this.datosNegocio.formas_pago.terminal)
        this.infopagos = 'Este negocio sólo recibe pagos con tarjeta en físico (terminal)'
        
      if (!this.datosNegocio.formas_pago.efectivo && this.datosNegocio.formas_pago.tarjeta && this.datosNegocio.formas_pago.terminal)
        this.infopagos = 'Este negocio no recibe pagos en efectivo'
      if (this.datosNegocio.formas_pago.efectivo && !this.datosNegocio.formas_pago.tarjeta && this.datosNegocio.formas_pago.terminal)
        this.infopagos = 'Este negocio no recibe pagos con tarjeta en línea'  
      if (this.datosNegocio.formas_pago.efectivo && this.datosNegocio.formas_pago.tarjeta && !this.datosNegocio.formas_pago.terminal)
        this.infopagos = 'Este negocio no cuenta con terminal para pagos con tarjeta en físico'      
      if (this.datosNegocio.formas_pago.efectivo && this.datosNegocio.formas_pago.tarjeta && this.datosNegocio.formas_pago.terminal)
        this.infopagos = ''
      this.datosNegocio.envio = await this.costoEnvio()
      this.getFormaPago()
    })
  }

  costoEnvio(): Promise<number> {
    if (!this.costo_envio) this.costo_envio = this.uidService.getCostoEnvio()
    return new Promise(async (resolve, reject) => {
      if (!this.datosNegocio.repartidores_propios) {
        const distancia: number = await this.alertSerivce.calculaDistancia(this.direccion.lat, this.direccion.lng, this.datosNegocio.direccion.lat, this.datosNegocio.direccion.lng)
        return resolve(Math.ceil(distancia * this.costo_envio.costo_km + this.costo_envio.banderazo_cliente))
      }
      if (this.datosNegocio.envio_gratis_pedMin && this.cuenta > this.datosNegocio.envio_gratis_pedMin) return resolve(0)
      if (!this.datosNegocio.envio_costo_fijo) {
        const distancia: number = await this.alertSerivce.calculaDistancia(this.direccion.lat, this.direccion.lng, this.datosNegocio.direccion.lat, this.datosNegocio.direccion.lng)
        return resolve(Math.ceil(distancia * this.costo_envio.costo_km + this.costo_envio.banderazo_cliente))
      } else {
        return resolve(this.datosNegocio.envio)
      }
    })
  }

  calculaPropina(i: number) {
    this.propina_sel = i
    this.propina = this.cuenta * this.botones_propina[i].valor
  }

  async getFormaPago() {
    this.cartService.getUltimaFormaPago().then(forma => {
      if (forma) {
        if (forma.tipo === 'efectivo') {
          this.comision = 0
          if (this.datosNegocio.formas_pago.efectivo) this.formaPago = forma
        } else {
          if (this.datosNegocio.formas_pago.tarjeta || this.datosNegocio.formas_pago.terminal) {
            this.formaPago = forma
            this.comision = ((this.cuenta * 0.05) + 4) * 1.16
          } else {
            this.comision = 0
            this.formaPago = this.pago_en_efectivo
          }
        }
      }
      this.infoReady = true
    })
  }

  // Acciones

  async muestraProducto(producto: Producto) {
    producto.total = producto.precio
    const modal = await this.modalCtrl.create({
      component: ProductoPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {producto, idNegocio: this.idNegocio, modifica: true, fromProdPage: true}
    })

    modal.onWillDismiss().then(async (resp) => {
      if (resp.data) {
        const uid = this.uidService.getUid()
        await this.cartService.editProduct(this.idNegocio, producto)
        this.cuenta = await this.negocioService.getCart(uid, this.idNegocio)
        producto.cantidad = resp.data
        this.getDescuentos()
        this.datosNegocio.envio = await this.costoEnvio()
        this.calculaPropina(this.propina_sel)
      }
    })
    
    return await modal.present()
  }

  async mostrarDirecciones() {
    const modal = await this.modalCtrl.create({
      component: DireccionesPage,
      enterAnimation,
    })
    modal.onWillDismiss().then(async (resp) => {
      if (resp.data) {
        this.direccion = resp.data
        this.datosNegocio.envio = await this.costoEnvio()
      }
    })
    return await modal.present()
  }

  deleteProducto(i) {
    this.alertSerivce.presentAlertAction('Quitar artículo', '¿Estás seguro que deseas eliminar este artículo?', 'Quitar de la lista', 'Conservar')
    .then(async (resp) => {
      if (resp) {
        this.cartService.deleteProd(this.datosNegocio.idNegocio, this.cart[i])
        this.cuenta -= this.cart[i].total
        this.cart[i].cantidad = 0
        this.cart[i].total = 0
        if (this.productos && this.productos.length > 0) {
          this.productos.forEach(p => {
            const index = p.productos.findIndex(x => x.id === this.cart[i].id)
            if (index >= 0) p.productos[index] = this.cart[i]
          })
        }
        this.cart.splice(i, 1)
        if (this.cuenta === 0) this.closeCart()
        this.datosNegocio.envio = await this.costoEnvio()
        this.calculaPropina(this.propina_sel)
        this.getDescuentos()
      }
    })
  }

  async formasPago() {
    const modal = await this.modalCtrl.create({
      component: FormasPagoPage,
      enterAnimation: enterAnimationDerecha,
      leaveAnimation: leaveAnimationDerecha,
      componentProps: {formas_pago_aceptadas: this.datosNegocio.formas_pago, infopagos: this.infopagos}
    })
    modal.onWillDismiss().then(resp => {
      this.formaPago = resp.data ? resp.data : this.formaPago
      if (this.formaPago) {
        if (this.formaPago.forma === 'efectivo') this.comision = 0
        else this.comision = ((this.cuenta * 0.05) + 4) * 1.16
      }
    })

    return await modal.present()
  }

  // Salida

  async ordenar() {
    if (this.netSub) this.netSub.unsubscribe()
    this.netSub = this.netService.isConnected.subscribe(async (isCon) => {
      if (!isCon) {
        this.alertSerivce.presentAlert('', 'Por favor revisa tu conexión a internet. Para generar el pedido es necesaria una conexión a internet')
        return
      }
      if (this.comision > 0) this.comision = Math.round((this.comision + Number.EPSILON) * 100) / 100
      if (this.datosNegocio.envio > 0) this.datosNegocio.envio = Math.round((this.datosNegocio.envio + Number.EPSILON) * 100) / 100
      if (this.propina) this.propina = Math.round((this.propina + Number.EPSILON) * 100) / 100
      this.cuenta = Math.round((this.cuenta + Number.EPSILON) * 100) / 100
      if (!this.direccion) {
        this.alertSerivce.presentAlertAction(
          'Agrega dirección',
          'Por favor agrega una dirección de entrega antes de continuar con el pedido.',
          'Agregar dirección', 'Cancelar')
          .then(resp => {
            if (resp) this.mostrarDirecciones()
            return
          })
        return
      }
      if (!this.formaPago) {
        this.alertSerivce.presentAlertAction(
          'Forma de pago',
          'Antes de continuar por favor agrega una forma de pago',
          'Agregar forma de pago', 'Cancelar'
        ).then(resp => {
          if (resp) this.formasPago()
          return
        })
        return
      }   
      if (!this.telefono) {
        const resp: any = await this.alertSerivce.presentPromptTelefono()
        let tel
        if (resp) {
          tel = resp.telefono.replace(/ /g, "")
          if (tel.length === 10) {
            this.telefono = resp.telefono
            this.pedidoService.guardarTelefono(resp.telefono)
          } else {
            this.alertSerivce.presentAlert('Número incorrecto', 'El teléfono agregado es incorrecto, por favor intenta de nuevo')
            return
          }
        }
      }
      this.claseAyuda = document.querySelector('.cuadro-ayuda') as HTMLElement
      this.claseAyuda.style.setProperty('visibility', 'visible')
      this.cuadroAyuda= document.getElementById('confirm')
      this.animationService.animEntradaDebajo(this.cuadroAyuda)
      this.confirmar = true
    })
  }

  async confirmarPedido() {
    try {      
      await this.alertSerivce.presentLoading('Estamos generando tu orden. Este proceso tomará sólo un momento')
      const cliente: Cliente = {
        direccion: this.direccion,
        nombre: this.uidService.getNombre() || 'No registrado',
        telefono: this.telefono,
        uid: this.uidService.getUid()
      }
      const pedido: Pedido = {
        aceptado: false,
        categoria: this.categoria,
        cliente,
        comision: this.comision,
        createdAt: Date.now(),
        envio: this.datosNegocio.envio,
        propina: this.propina,
        negocio: this.datosNegocio,
        productos: this.cart,
        total: this.cuenta + this.datosNegocio.envio + this.comision + this.propina - this.descuento,
        entrega: this.datosNegocio.entrega || 'indefinido',
        avances: [],
        formaPago: this.formaPago,
        region: this.uidService.getRegion(),
        descuento: this.descuento ? this.descuento : 0,
      }
      pedido.total = Math.round((pedido.total + Number.EPSILON) * 100) / 100
      if (this.formaPago.tipo !== 'efectivo' && this.formaPago.tipo !== 'terminal') {
        pedido.idOrder =  await this.pagoService.cobrar(pedido)
      }
      await this.pedidoService.createPedido(pedido)
      this.alertSerivce.dismissLoading()
      this.router.navigate(['/avances', pedido.id], { skipLocationChange: true })
      this.confirmar = false
      this.claseAyuda.style.setProperty('visibility', 'hidden')
      this.animationService.salidaDebajo(this.cuadroAyuda)
      this.closeCart()
    } catch (error) {
      this.alertSerivce.dismissLoading()
      this.alertSerivce.presentAlert('Error', 'Lo sentimos algo salió mal, por favor intenta de nuevo. ' + error)
    }
  }

  cancelarConfirm() {
    this.confirmar = false
    this.claseAyuda.style.setProperty('visibility', 'hidden')
    this.animationService.salidaDebajo(this.cuadroAyuda)
  }

  closeCart() {
    this.modalCtrl.dismiss(this.cuenta)
  }

  verMas() {
    this.modalCtrl.dismiss('add')
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
    })
    await actionSheet.present()
  }

  comisionInfo() {
    this.alertSerivce.presentToastconBoton('Cargo realizado por pago con tarjeta')
  }

}
