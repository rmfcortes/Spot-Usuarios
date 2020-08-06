import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';


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

  buscar(busqueda: string) {
    const region = this.uidService.getRegion()
    this.db.list(`busqueda_modal/${region}`, data => data.orderByKey().equalTo(busqueda))
    .valueChanges().subscribe(resp => console.log(resp))
  }

  esperaResultados(idBusqueda: string) {
    return new Promise((resolve, reject) => {
      // const region = this.uidService.getRegion()
      // const resSub = this.db.object(`busqueda_resultados/${region}/${idBusqueda}`).valueChanges()
      // .subscribe(resultados => {
      //   resSub.unsubscribe()
      //   resolve(resultados)
      // })
    })
  }

}
