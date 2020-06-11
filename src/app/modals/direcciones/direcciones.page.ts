import { Component, OnInit, NgZone, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { } from 'googlemaps';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { CartService } from 'src/app/services/cart.service';

import { Direccion, Ubicacion } from 'src/app/interfaces/direcciones';
import { Region } from 'src/app/interfaces/region.interface';

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.page.html',
  styleUrls: ['./direcciones.page.scss'],
})
export class DireccionesPage implements OnInit {

  @Input() changeRegion: boolean

  direcciones: Direccion[]

  inputDir = '';
  direccion: Direccion = {
    direccion: '',
    region: '',
    lat: null,
    lng: null
  };

  paths: Ubicacion[] = []
  region: Region = {
    centro: {
      lat: null,
      lng: null,
    },
    ciudad: '',
    referencia: '',
    ubicacion: []
  }
  regiones: Region[] = []
  polygon: any

  zoom = 17;
  dirReady = false;
  lejos = false;

  icon = '../../../assets/img/iconos/pin.png';

  back: Subscription
  sugerencias = []

  constructor(
    private ngZone: NgZone,
    private platform: Platform,
    private modalCtrl: ModalController,
    private alertService: DisparadoresService,
    private cartService: CartService,
  ) { }

  ngOnInit() {
    if (!this.changeRegion) this.getPolygon()
    else this.getPoligonos()
  }

  getPolygon() {
    this.getDireccionesFiltradas()
    this.cartService.getPolygon().then(ubicacion => {
      this.paths = ubicacion
      this.polygon = new google.maps.Polygon({paths: ubicacion})
    });
  }

  getDireccionesFiltradas() {
    this.cartService.getDireccionesFiltradas()
    .then(direcciones => this.direcciones = direcciones)
    .catch(err => console.log(err))
  }

  getDirecciones() {
    this.cartService.getDirecciones()
    .then(direcciones => this.direcciones = direcciones)
    .catch(err => console.log(err))
  }

  getPoligonos() {
    this.getDirecciones()
    this.cartService.getPolygons().then(regiones => {
      this.regiones = regiones
    });
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar();
    });
  }

  updateSearchResults(){
    if (this.inputDir === '') {
      return;
    }
    const pred = new google.maps.places.AutocompleteService()
    pred.getPlacePredictions({ input: this.inputDir },
    (predictions, status) => {
      this.ngZone.run(() => {
          this.sugerencias = predictions
        })
      })
  }

  async dirSelectedGuardada(dir: Direccion) {
    this.direccion = dir
    this.inputDir = '';
    this.sugerencias = []
    this.dirReady = true;
    if (this.changeRegion) {
      this.region = await this.cartService.getRegion(dir.region)
      this.polygon = new google.maps.Polygon({paths: this.region.ubicacion})
    }
    this.alertService.presentToast('De ser necesario, puedes arrastrar el pin a tu ubicación exacta');
  }

  dirSelected(id: string) {
    const geocoder = new google.maps.Geocoder
    const map = google.maps
    geocoder.geocode({'placeId': id}, (results, status) => {
      this.ngZone.run(async () => {
        if (status === 'OK') {
          if (results[0]) {
            const place = results[0]
            let dentro = false
            if (!this.changeRegion) dentro = await map.geometry.poly.containsLocation(place.geometry.location, this.polygon)
            else {
              for (const region of this.regiones) {
                this.polygon = await new map.Polygon({paths: region.ubicacion})
                dentro = await map.geometry.poly.containsLocation(place.geometry.location, this.polygon)
                if (dentro) {
                  this.region = region
                  break
                }
              }
            }
            if (dentro) {
              this.direccion.lat = place.geometry.location.lat()
              this.direccion.lng = place.geometry.location.lng()
              this.direccion.direccion = place.formatted_address
              this.direccion.region = this.region.referencia
              this.inputDir = ''
              this.sugerencias = []
              this.dirReady = true
              this.alertService.presentToast('De ser necesario, puedes mover el pin a tu ubicación exacta');
            } else {
              this.dirReady = false;
              this.alertService.presentAlert('Fuera de cobertura',
                'Lo sentimos. Por el momento no tenemos cobertura de reparto en tu zona.');
            }
          }
        }
      })
    })
  }

  async guardaLoc(evento) {
    const dentro = await google.maps.geometry.poly
    .containsLocation(new google.maps.LatLng(evento.coords.lat, evento.coords.lng), this.polygon)
    if (dentro) {
      this.lejos = false;
      this.direccion.lat = evento.coords.lat;
      this.direccion.lng = evento.coords.lng;
    } else {
      this.lejos = true;
      this.alertService.presentAlert('Fuera de cobertura',
        'Lo sentimos. Por el momento no tenemos cobertura de reparto en tu zona.');
    }
  }

  setDireccion() {
    if (this.back) this.back.unsubscribe()
    this.cartService.guardarDireccion(this.direccion)
    if (!this.changeRegion) this.modalCtrl.dismiss(this.direccion)
    else this.modalCtrl.dismiss(this.region.referencia)
  }

  regresar() {
    if (this.back) {this.back.unsubscribe()}
    this.modalCtrl.dismiss(null);
  }

}
