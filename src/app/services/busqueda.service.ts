import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Busqueda, ResultadosBusquedaProducto, ResultadosBusquedaNegocio } from '../modals/busqueda/busqueda.page';

@Injectable({
  providedIn: 'root'
})
export class BusquedaService {

  productos: ResultadosBusquedaProducto = {
    hayMas: true,
    resultados: []
  }
  servicios: ResultadosBusquedaProducto = {
    hayMas: true,
    resultados: []
  }
  negocios: ResultadosBusquedaNegocio = {
    hayMas: true,
    resultados: []
  }

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getBatch(): Promise<number> {
    return new Promise((resolve, reject) => {  
      const region = this.uidService.getRegion()
      const resSub = this.db.object(`ciudades/${region}/busqueda_batch`).valueChanges()
      .subscribe((batch: number) => {
        resSub.unsubscribe()
        resolve(batch)
      })
    })
  }

  getPrevious(): Promise<string[]> {
    return new Promise((resolve, reject) => {      
      const uid = this.uidService.getUid()
      if (uid) {
        const ulSub = this.db.object(`usuarios/${uid}/ultima_busqueda`).valueChanges().subscribe(ultima => {
          ulSub.unsubscribe()
          if (ultima) this.borraResultados(ultima)
        })
        const resSub = this.db.list(`usuarios/${uid}/busquedas`).valueChanges()
        .subscribe((resultados: string[]) => {
          if (resultados) {
            resSub.unsubscribe()
            resolve(resultados)
          }
        })
      }
    })
  }

  buscar(busqueda: Busqueda) {
    const region = this.uidService.getRegion()
    const uid = this.uidService.getUid()
    busqueda.id = this.db.createPushId() 
    this.db.object(`busqueda/${region}/${busqueda.id}`).set(busqueda)
    if (uid) {
      this.db.object(`usuarios/${uid}/busquedas/${busqueda.texto}`).set(busqueda.texto)
      this.db.object(`usuarios/${uid}/ultima_busqueda`).set(busqueda.id)
    }
  }

  esperaResultados(busqueda: Busqueda, lista: string, batch: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      const resSub = this.db.object(`busqueda_resultados/${region}/${busqueda.id}`).valueChanges()
      .subscribe((resultado: any) => {
        if (resultado && resultado[lista] && resultado[lista][busqueda.pagina]) 
          resolve(resultado[lista][busqueda.pagina])
        if (resultado && resultado['negocios']) {
          resSub.unsubscribe()

          if (resultado['productos'][busqueda.pagina] === 'no_results') {
            this.productos.hayMas = false
          } else {
            if (resultado['productos'][busqueda.pagina].length < batch) this.productos.hayMas = false
            else this.productos.hayMas = true
            this.productos.resultados = this.productos.resultados.concat(resultado['productos'][busqueda.pagina])
          }

          if (resultado['servicios'][busqueda.pagina] === 'no_results') {
            this.servicios.hayMas = false
          } else {
            if (resultado['servicios'][busqueda.pagina].length < batch) this.servicios.hayMas = false
            else this.servicios.hayMas = true
            this.servicios.resultados = this.servicios.resultados.concat(resultado['servicios'][busqueda.pagina])
          }

          if (resultado['negocios'][busqueda.pagina] === 'no_results') {
            this.negocios.hayMas = false
          } else {
            if (resultado['negocios'][busqueda.pagina].length < batch) this.negocios.hayMas = false
            else this.negocios.hayMas = true
            this.negocios.resultados = this.negocios.resultados.concat(resultado['negocios'][busqueda.pagina])
          }
          this.db.object(`busqueda_resultados/${region}/${busqueda.id}`).remove()
        }
      })
    })
  }

  resetResultados() {
    this.productos = {
      hayMas: true,
      resultados: []
    }
    this.servicios = {
      hayMas: true,
      resultados: []
    }
    this.negocios = {
      hayMas: true,
      resultados: []
    }
  }

  getNegocios() {
    return this.negocios
  }  
  getProductos() {
    return this.productos
  }  
  getServicios() {
    return this.servicios
  }

  borraResultados(idBusqueda) {
    const region = this.uidService.getRegion()
    this.db.object(`busqueda_resultados/${region}/${idBusqueda}`).remove()
  }

}
