import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { StorageService } from './storage.service';
import { UidService } from './uid.service';

import { Region, Ubicacion } from '../interfaces/region.interface';

@Injectable({
  providedIn: 'root'
})
export class RegionService {

  constructor(
    private db: AngularFireDatabase,
    private storageService: StorageService,
    private uidService: UidService,
  ) { }

  // Region Guard

  getRegion(): Promise<boolean> {
    return new Promise (async (resolve, reject) => {
      let region
      region = this.uidService.getRegion()
      if (region) return resolve(true)
      region = await this.storageService.getString('region')
      if (region) {
        this.setRegion(region)
        return resolve(true)
      }
      region = await this.getRegionDB()
      if (region) return resolve(true)
      resolve(false)
    })
  }
  
  getRegionDB(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let uid
      uid = await this.uidService.getUid()
      if (uid) return resolve(this.getFromDB(uid))
      uid = await this.storageService.getString('uid')
      if (uid) return resolve(this.getFromDB(uid))
      resolve(false)
    })
  }

  getFromDB(uid: string): Promise<boolean> {
    return new Promise((resolve, reject) => {      
      this.db.object(`usuarios/${uid}/region`).query.ref.once('value', snap => {
        if (snap.val()) {
          this.setRegion(snap.val())
          return resolve(true)
        } else resolve(false)
      })
    })
  }

  // Común
  setRegion(region: string) {
    return new Promise (async (resolve, reject) => {
      this.storageService.guardaString('region', region)
      this.uidService.setRegion(region)
      const uid = this.uidService.getUid()
      if (uid) this.db.object(`usuarios/${uid}/region`).set(region)
      resolve()
    })
  }
  
  // Direcciones Page
  getPolygon(): Promise<Ubicacion[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion()
      const cenSub = this.db.list(`ciudades/${region}/ubicacion`).valueChanges().subscribe((ubicacion: Ubicacion[]) => {
        cenSub.unsubscribe()
        resolve(ubicacion)
      })
    })
  }


  getPolygons(): Promise<Region[]> {
    return new Promise((resolve, reject) => {
      const cenSub = this.db.list(`ciudades/`).valueChanges().subscribe((regiones: Region[]) => {
        cenSub.unsubscribe()
        resolve(regiones)
      })
    })
  }

  getRegionDetalles(region): Promise<Region> {
    return new Promise((resolve, reject) => {
      const cenSub = this.db.object(`ciudades/${region}`).valueChanges().subscribe((region: Region) => {
        cenSub.unsubscribe()
        resolve(region)
      })
    })
  }
  
}
