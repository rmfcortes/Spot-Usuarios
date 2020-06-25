import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: Storage,
    private platform: Platform,
  ) { }

  getString(nombre: string): Promise<string> {
    return new Promise((resolve, reject) => {      
      this.storage.ready().then(async () => {
        let value
        if ( this.platform.is('cordova') ) {
          value = await this.storage.get(nombre)
          // Celular
        } else {
          // Escritorio
          value = localStorage.getItem(nombre)
        }
        resolve(value)
      })
    })
  }

  getJson(nombre: string): Promise<any> {
    return new Promise((resolve, reject) => {      
      this.storage.ready().then(async () => {
        let value
        if ( this.platform.is('cordova') ) {
          value = await this.storage.get(nombre)
          // Celular
        } else {
          // Escritorio
          value = localStorage.getItem(nombre)
        }
        resolve(JSON.parse(value))
      })
    })
  }

  guardaString(nombre: string, value: string) {
    if (this.platform.is ('cordova')) {
      this.storage.set(nombre, value)
    } else {
      localStorage.setItem(nombre, value)
    }
  }

  guardaJson(nombre: string, info) {
    if (this.platform.is ('cordova')) {
      this.storage.set(nombre, JSON.stringify(info))
    } else {
      localStorage.setItem(nombre, JSON.stringify(info))
    }
  }

  remove(nombre: string) {
    if ( this.platform.is('cordova') ) {
      this.storage.remove(nombre)
    } else {
      localStorage.removeItem(nombre)
    }
  }
}
