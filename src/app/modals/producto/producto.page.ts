import { Component, OnInit, Input, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AnimationsService } from 'src/app/services/animations.service';
import { ProductoService } from 'src/app/services/producto.service';

import { Producto, ListaComplementos, ListaComplementosElegidos, Complemento } from 'src/app/interfaces/producto';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
})
export class ProductoPage implements OnInit {

  @ViewChild('brinca', {static: false}) inputCant: ElementRef;
  @Input() producto: Producto;
  @Input() idNegocio: string;

  variables: ListaComplementos[];
  obligatoriosPendientes = [];
  elegidos: ListaComplementosElegidos[] = [];
  back: Subscription;

  canContinue = false
  showDesc = true

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private animationService: AnimationsService,
    private productoService: ProductoService,
  ) { }

  // Info entrada

  ngOnInit() {
    this.getVariables();
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.cerrar();
    });
  }

  ionViewWillEnter() {
    this.producto.total = this.producto.precio;
    this.producto.cantidad = 1;
  }

  async getVariables() {
    this.variables = await this.productoService.getVariables(this.idNegocio, this.producto.id);
    if (this.variables.length > 0) {
      this.variables.forEach(v => {
        this.obligatoriosPendientes.push(v.obligatorio)
      });
      this.checkObligatorios()
      if (this.producto.complementos && this.producto.complementos.length > 0) this.setComplementos()
    } else this.canContinue = true
  }

  // Acciones

  setComplementos() {
    setTimeout(() => {      
      this.producto.complementos.forEach(c=> {
        const i = this.variables.findIndex(v => v.titulo === c.titulo)
        this.variables[i].radioSelected = c.radioSelected
        if (this.variables[i].limite && this.variables[i].limite > 1) {
          c.complementos.forEach(cFinal => {
            const y = this.variables[i].productos.findIndex(vf => vf.nombre === cFinal.nombre)
            this.variables[i].productos[y].isChecked = true
          })
        }
      })
    }, 500);
  }

  radioSelected(event, i) {
    const y = event.detail.value;
    let unidad = this.producto.total / this.producto.cantidad;
    if (!this.variables[i].elegido) {
      this.variables[i].elegido = true;
      unidad += this.variables[i].productos[y].precio;
      this.elegidos[i] = {
        titulo: this.variables[i].titulo,
        radioSelected: y,
        complementos: [{
          nombre: this.variables[i].productos[y].nombre,
          precio: this.variables[i].productos[y].precio,
        }]
      };
    } else {
      unidad -= this.elegidos[i].complementos[0].precio;
      unidad += this.variables[i].productos[y].precio;
      this.elegidos[i] = {
        titulo: this.variables[i].titulo,
        radioSelected: y,
        complementos: [{
          nombre: this.variables[i].productos[y].nombre,
          precio: this.variables[i].productos[y].precio,
        }]
      };
    }
    this.producto.total = this.producto.cantidad * unidad;
    this.obligatoriosPendientes[i] = false;
    this.checkObligatorios()
  }

  checkChange(i: number, y: number, isChecked: boolean) {
    let checados = 0;
    this.variables[i].productos.forEach(p => {
      if (p.isChecked) {
        checados++
        this.obligatoriosPendientes[i] = false
      }
    })
    if (checados === 0) this.obligatoriosPendientes[i] = true
    if (checados === this.variables[i].limite) {
      this.variables[i].productos.forEach(p => {
        if (p.isChecked) p.deshabilitado = false
        else p.deshabilitado = true
      })
    }
    else {
      this.variables[i].productos.forEach(p => {
        p.deshabilitado = false
      })
    }
    this.checkObligatorios()
    let unidad = this.producto.total / this.producto.cantidad
    if (isChecked)  unidad += this.variables[i].productos[y].precio
    else unidad -= this.variables[i].productos[y].precio
    this.producto.total = this.producto.cantidad * unidad;
  }

  checkObligatorios() {
    this.canContinue = true
    this.obligatoriosPendientes.forEach(o => {
      if (o) this.canContinue = false
    })
  }

  plusProduct() {
    const ele = this.inputCant.nativeElement
    this.animationService.animBrinca(ele)
    const unidad = this.producto.total / this.producto.cantidad;
    this.producto.cantidad++;
    this.producto.total = this.producto.cantidad * unidad;
  }

  minusProduct() {
    if (this.producto.cantidad === 1) {
      return;
    }
    const ele = this.inputCant.nativeElement
    this.animationService.animBrinca(ele)
    const unidad = this.producto.total / this.producto.cantidad;
    this.producto.cantidad--;
    this.producto.total = this.producto.cantidad * unidad;
  }


  // Salida

  agregarProducto() {
    this.variables.forEach((v, i) => {
      if (v.limite > 1) {
        v.productos.forEach((p, y) => {
          if (p.isChecked) {
            if (this.elegidos[i]) {
              const complemento: Complemento = {
                nombre: p.nombre,
                precio: p.precio
              }
              this.elegidos[i].complementos.push(complemento)
            } else {
              this.elegidos[i] = {
                titulo: v.titulo,
                complementos: []
              }
              const complemento: Complemento = {
                nombre: p.nombre,
                precio: p.precio
              }
              this.elegidos[i].complementos.push(complemento)
            }
          }
        })
      }
    })
    this.producto.cantidad = this.producto.cantidad;
    this.producto.complementos = this.elegidos;
    this.modalCtrl.dismiss(this.producto.cantidad);
  }

  cerrar() {
    if (this.back) {this.back.unsubscribe()}
    // this.producto.cantidad = 0;
    this.modalCtrl.dismiss(null);
  }

}
