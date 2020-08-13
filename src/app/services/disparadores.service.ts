import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController, ActionSheetController } from '@ionic/angular';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DisparadoresService {

  loader: any

  constructor(
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private storageService: StorageService,
  ) { }

  presentAlertNotLogin() {
    return new Promise(async (resolve, reject) => {      
      const alert = await this.alertController.create({
        header: 'Inicia sesión',
        message: `Para darte la mejor experiencia, por favor inicia sesión antes de continuar con tu pedido. <br> ¡Es muy sencillo!`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'tertiary',
            handler: () => resolve(false)
          },
          {
            text: 'Iniciar sesión',
            cssClass: 'primary',
            handler: () => resolve(true)
          }
        ]
      })
  
      await alert.present()
    })
  }

  async presentOpcionesVista(): Promise<string> {
    return new Promise(async (resolve, reject) => {      
      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Mostrar productos como',
        buttons: [
          {
            text: 'Lista con imágenes',
            icon: 'list',
            handler: () => {
              this.storageService.guardaString('vista', 'list-img')
              resolve('list-img')
            }
          },     
          {
            text: 'Mosaico',
            icon: 'grid',
            handler: () => {
              this.storageService.guardaString('vista', 'block')
              resolve('block')
            }
          },        
          {
            text: 'Tarjetas',
            icon: 'browsers',
            handler: () => {
              this.storageService.guardaString('vista', 'cards')
              resolve('cards')
            }
          },        
          {
            text: 'Galería sin texto',
            icon: 'images',
            handler: () => {
              this.storageService.guardaString('vista', 'gallery')
              resolve('gallery')
            }
          },
          {
            text: 'Lista sólo texto',
            icon: 'reorder-four',
            handler: () => {
              this.storageService.guardaString('vista', 'list')
              resolve('list')
            }
          },   
        ]
      })
      await actionSheet.present()
    })
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    })
    toast.present()
  }  
  
  async presentToastconBoton(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      buttons: [
        {
          text: 'Aceptar',
          role: 'cancel',
        }
      ]
    })
    toast.present()
  }

  async presentAlert(titulo, msn) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msn,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    })

    await alert.present()
  }

  async presentAlertAction(titulo, msn) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: titulo,
        message: msn,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(false);
            }
          },
          {
            text: 'Ok',
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(true);
            }
          }
        ]
      })

      await alert.present()
    })
  }

  async presentAlertUpdate(titulo, msn) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: titulo,
        message: msn,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(false);
            }
          },
          {
            text: 'Actualizar',
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(true);
            }
          }
        ]
      });

      await alert.present()
    })
  }

  async presentAlertError(error) {
    const alert = await this.alertController.create({
      header: 'Ups, algo salió mal, intenta de nuevo',
      message: error,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    })

    await alert.present()
  }

  async presentPromptTelefono() {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: 'Agrega un teléfono',
        message: 'Contar con tu teléfono es importante, ' +
          'en caso de que el repartidor o el restaurante necesiten ponerse en contacto contigo. ' + 
          'El número debe ser de 10 dígitos',
        inputs: [
          {
            name: 'telefono',
            type: 'tel',
            placeholder: 'Ej. 4581188913',
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              resolve(false)
            }
          }, {
            text: 'Agregar',
            handler: (data) => {
              resolve(data)
            }
          }
        ]
      });
      await alert.present()
    })
  }

  async presentLoading(message?) {
    this.loader = await this.loadingCtrl.create({
     spinner: 'crescent',
     message,
    })
    return await this.loader.present()
  }

  dismissLoading() {
    if (this.loader) this.loader.dismiss();
  }

  calculaDistancia( lat1: number, lng1: number, lat2: number, lng2: number): Promise<number> {
    return new Promise (async (resolve, reject) => {
      const R = 6371; // Radius of the earth in km
      const dLat = this.deg2rad(lat2 - lat1) // this.deg2rad below
      const dLon = this.deg2rad(lng2 - lng1)
      const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
         Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const d = R * c // Distance in kms
      resolve(d)
    })
  }

  deg2rad( deg ) {
    return deg * (Math.PI / 180)
  }

}
