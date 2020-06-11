import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Region } from '../interfaces/region.interface';

@Injectable({
  providedIn: 'root'
})
export class RegionService {

  constructor(
    private storage: Storage,
    private platform: Platform,
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getRegionStorage(): Promise<boolean> {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(async () => {
          try {
            const region = await this.storage.get('region');
            if (region) {
              this.uidService.setRegion(region);
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (error) {
            resolve(false);
          }
        });
      } else {
        // Escritorio
        if ( localStorage.getItem('region') ) {
          const region = localStorage.getItem('region');
          this.uidService.setRegion(region);
          resolve(true);
        } else {
          resolve(false);
        }
      }

    });
  }

  getRegiones(): Promise<Region[]> {
    return new Promise((resolve, reject) => {
      const regSub = this.db.list(`ciudades`).valueChanges().subscribe((regiones: Region[]) => {
        regSub.unsubscribe();
        resolve(regiones);
      });
    });
  }

  setRegion(region: string) {
    return new Promise (async (resolve, reject) => {
      if (this.platform.is ('cordova')) {
        this.storage.set('region', region);
      } else {
        localStorage.setItem('region', region);
      }
      this.uidService.setRegion(region);
      resolve();
    });
  }

}
