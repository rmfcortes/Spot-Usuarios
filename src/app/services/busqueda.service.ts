import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';
import { Busqueda } from '../modals/busqueda/busqueda.page';


@Injectable({
  providedIn: 'root'
})
export class BusquedaService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  // async buscar(busqueda: Busqueda) {
  //   const region = this.uidService.getRegion()
  //   busqueda.id = await this.db.createPushId()
  //   this.db.object(`busqueda_modal/${region}/${busqueda.id}`).set(busqueda.texto)
  // }

  buscar(busqueda: Busqueda) {
    const region = this.uidService.getRegion()
    busqueda.id = this.db.createPushId() 
    this.db.object(`busqueda/${region}/${busqueda.id}`).set(busqueda)
  }

  esperaResultados(idBusqueda: string) {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      this.db.object(`busqueda/${region}/${idBusqueda}`).query.ref.on('child_removed', snap => {
        this.db.object(`busqueda/${region}/${idBusqueda}`).query.ref.off('child_removed')
        const resSub = this.db.object(`busqueda_resultados/${region}/${idBusqueda}`).valueChanges()
        .subscribe(resultados => {
          resSub.unsubscribe()
          resolve(resultados)
        })
      })

    })
  }

}
