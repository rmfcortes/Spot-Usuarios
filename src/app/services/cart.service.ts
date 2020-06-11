import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Direccion, Ubicacion } from '../interfaces/direcciones';
import { FormaPago } from '../interfaces/forma-pago.interface';
import { DatosNegocioParaPedido } from '../interfaces/pedido';
import { Region } from '../interfaces/region.interface';
import { Producto } from '../interfaces/producto';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getCart(idNegocio) {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid();
      const cartSub = this.db.list(`usuarios/${uid}/cart/${idNegocio}/detalles`).valueChanges().subscribe((cart: Producto[]) => {
        cartSub.unsubscribe();
        resolve(cart);
      });
    });
  }

  updateCart(idNegocio: string, producto: Producto): Promise<Producto> {
    return new Promise((resolve, reject) => {      
      const uid = this.uidService.getUid();
      producto.idAsCart = this.db.createPushId()
      if (producto.agregados) producto.agregados++
      else producto.agregados = 1
      this.db.object(`usuarios/${uid}/cart/${idNegocio}/detalles/${producto.idAsCart}`).update(producto);
      this.db.object(`usuarios/${uid}/cart/${idNegocio}/cantidades/${producto.id}`).query.ref.transaction(count => count ? count += 1 : 1)
      resolve(producto)
    });
  }

  editProduct(idNegocio: string, producto: Producto) {
    return new Promise((resolve, reject) => {      
      const uid = this.uidService.getUid();
      this.db.object(`usuarios/${uid}/cart/${idNegocio}/detalles/${producto.idAsCart}`).update(producto);
      resolve()
    });
  }

  deleteProd(idNegocio: string, producto: Producto) {
    const uid = this.uidService.getUid();
    this.db.object(`usuarios/${uid}/cart/${idNegocio}/detalles/${producto.idAsCart}`).remove();
    this.db.object(`usuarios/${uid}/cart/${idNegocio}/cantidades/${producto.id}`).query.ref.transaction(count => count ? count -= 1 : 0)
  }

  getUltimaDireccion(): Promise<Direccion> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid();
      const dirSub = this.db.object(`usuarios/${uid}/direcciones/ultima`).valueChanges().subscribe((dir: Direccion) => {
        dirSub.unsubscribe();
        resolve(dir);
      });
    });
  }

  getUltimaFormaPago(): Promise<FormaPago> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid();
      const dirSub = this.db.object(`usuarios/${uid}/forma-pago/ultima`).valueChanges().subscribe((pago: FormaPago) => {
        dirSub.unsubscribe();
        resolve(pago);
      });
    });
  }

  async guardarDireccion(direccion: Direccion) {
    const uid = this.uidService.getUid();
    if (uid){
      this.db.object(`usuarios/${uid}/direcciones/ultima`).update(direccion);
      if (!direccion.id) {
        const id = this.db.createPushId();
        direccion.id = id;
      }
      this.db.object(`usuarios/${uid}/direcciones/historial/${direccion.id}`).set(direccion);
    }
  }

  getDirecciones(): Promise<Direccion[]> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid();
      const dirSub = this.db.list(`usuarios/${uid}/direcciones/historial`).valueChanges().subscribe((dir: Direccion[]) => {
        dirSub.unsubscribe();
        resolve(dir);
      });
    });
  }

  getDireccionesFiltradas(): Promise<Direccion[]> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid();
      const region = this.uidService.getRegion()
      const dirSub = this.db.list(`usuarios/${uid}/direcciones/historial`, data => data.orderByChild('region').equalTo(region))
      .valueChanges().subscribe((dir: Direccion[]) => {
        dirSub.unsubscribe();
        resolve(dir);
      });
    });
  }

  getFormasPago(): Promise<FormaPago[]> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid();
      const dirSub = this.db.list(`usuarios/${uid}/forma-pago/historial`).valueChanges().subscribe((pagos: FormaPago[]) => {
        dirSub.unsubscribe();
        resolve(pagos);
      });
    });
  }

  getInfoNegocio(categoria, idNegocio): Promise<DatosNegocioParaPedido> {
    return new Promise((resolve, reject) => {
      const negSub = this.db.object(`negocios/datos-pedido/${categoria}/${idNegocio}`)
        .valueChanges().subscribe((neg: DatosNegocioParaPedido) => {
          negSub.unsubscribe();
          resolve(neg);
      });
    });
  }

  getPolygon(): Promise<Ubicacion[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      const cenSub = this.db.list(`ciudades/${region}/ubicacion`).valueChanges().subscribe((ubicacion: Ubicacion[]) => {
        cenSub.unsubscribe();
        resolve(ubicacion);
      });
    });
  }

  getRegion(region): Promise<Region> {
    return new Promise((resolve, reject) => {
      const cenSub = this.db.object(`ciudades/${region}`).valueChanges().subscribe((region: Region) => {
        cenSub.unsubscribe();
        resolve(region);
      });
    });
  }

  getPolygons(): Promise<Region[]> {
    return new Promise((resolve, reject) => {
      const cenSub = this.db.list(`ciudades/`).valueChanges().subscribe((regiones: Region[]) => {
        cenSub.unsubscribe();
        resolve(regiones);
      });
    });
  }

}
