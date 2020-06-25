import { Injectable } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFireDatabase } from '@angular/fire/database';

import { StorageService } from './storage.service';
import { UidService } from './uid.service';

import { Ubicacion } from '../interfaces/region.interface';
import { Direccion } from '../interfaces/direcciones';

@Injectable({
  providedIn: 'root'
})
export class DireccionService {

  constructor(
    private db: AngularFireDatabase,
    private geolocation: Geolocation,
    private storageService: StorageService,
    private uidService: UidService,
  ) { }

  getDireccion(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {      
      let direccion: Direccion
      direccion = await this.uidService.getDireccion()
      if (direccion) return resolve(true)
      direccion = await this.storageService.getJson('direccion')
      if (direccion) {
        this.setDireccion(direccion)
        return resolve(true)
      }
      direccion = await this.getDireccionFromDB()
      if (direccion) return resolve(true)
      resolve(false)
    })
  }

  getDireccionFromDB(): Promise<Direccion> {
    return new Promise(async (resolve, reject) => {      
      let uid
      uid = this.uidService.getUid()
      if (!uid) uid = await this.storageService.getString('uid')
      if (uid) {
        const dir: Direccion = await this.getUltimaDireccion()
        if (dir) {
          this.setDireccion(dir)
          return resolve(dir)
        }
      }
      resolve(null)
    })
  }

  getUltimaDireccion(): Promise<Direccion> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const dirSub = this.db.object(`usuarios/${uid}/direcciones/ultima`).valueChanges().subscribe((dir: Direccion) => {
        dirSub.unsubscribe()
        resolve(dir)
      })
    })
  }

    // Común

  setDireccion(direccion: Direccion) {
    this.uidService.setDireccion(direccion)
    this.storageService.guardaJson('direccion', direccion)
  }

    // Direcciones page

  async guardarDireccion(direccion: Direccion) {
    const uid = this.uidService.getUid()
    this.uidService.setDireccion(direccion)
    this.storageService.guardaJson('direccion', direccion)
    if (uid){
      this.db.object(`usuarios/${uid}/direcciones/ultima`).update(direccion)
      if (!direccion.id) {
        const id = this.db.createPushId()
        direccion.id = id
      }
      this.db.object(`usuarios/${uid}/direcciones/historial/${direccion.id}`).set(direccion)
    }
  }

  getDirecciones(): Promise<Direccion[]> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      if (!uid) return resolve()
      const dirSub = this.db.list(`usuarios/${uid}/direcciones/historial`).valueChanges().subscribe((dir: Direccion[]) => {
        dirSub.unsubscribe()
        resolve(dir)
      })
    })
  }

  getDireccionesFiltradas(): Promise<Direccion[]> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const region = this.uidService.getRegion()
      const dirSub = this.db.list(`usuarios/${uid}/direcciones/historial`, data => data.orderByChild('region').equalTo(region))
      .valueChanges().subscribe((dir: Direccion[]) => {
        dirSub.unsubscribe()
        resolve(dir)
      })
    })
  }

  getUbicacion(): Promise<Ubicacion> {
    return new Promise((resolve, reject) => {      
      const coords: Ubicacion = {
        lat: 22.5661915,
        lng: -102.2500984
      }
      return resolve(coords)
      // this.geolocation.getCurrentPosition().then(resp => {
      //   console.log(resp);
      // })
    })
  }
  
}
