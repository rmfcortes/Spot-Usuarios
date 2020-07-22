import { Component, OnInit, NgZone, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { } from 'googlemaps';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { DireccionService } from 'src/app/services/direccion.service';

import { Direccion, Ubicacion } from 'src/app/interfaces/direcciones';
import { Region } from 'src/app/interfaces/region.interface';
import { RegionService } from 'src/app/services/region.service';

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
  polygon: google.maps.Polygon

  zoom = 17;
  dirReady = false;
  lejos = false;

  icon = '../../../assets/img/iconos/pin.png';

  back: Subscription
  sugerencias = []

  geocoder: google.maps.Geocoder
  map: any
  predictions: google.maps.places.AutocompleteService

  constructor(
    private ngZone: NgZone,
    private platform: Platform,
    private modalCtrl: ModalController,
    private direccionService: DireccionService,
    private alertService: DisparadoresService,
    private regionService: RegionService,
  ) { }

  ngOnInit() {
    if (!this.changeRegion) this.getPolygon()
    else this.getPoligonos()
  }

  getPolygon() {
    this.getDireccionesFiltradas()
    this.regionService.getPolygon().then(ubicacion => {
      this.paths = ubicacion
      this.polygon = new google.maps.Polygon({paths: ubicacion})
    })
  }

  getDireccionesFiltradas() {
    this.direccionService.getDireccionesFiltradas()
    .then(direcciones => this.direcciones = direcciones)
    .catch(err => console.log(err))
  }

  getPoligonos() {
    this.getDirecciones()
    this.regionService.getPolygons().then(regiones => this.regiones = regiones)
  }

  getDirecciones() {
    this.direccionService.getDirecciones()
    .then(direcciones => this.direcciones = direcciones)
    .catch(err => console.log(err))
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar()
    })
  }

  updateSearchResults(){
    if (!this.inputDir) return
    if (!this.predictions) this.predictions = new google.maps.places.AutocompleteService()
    this.predictions.getPlacePredictions({ input: this.inputDir },
    (predictions, status) => {
      this.ngZone.run(() => this.sugerencias = predictions)
      })
  }

  async dirSelectedGuardada(dir: Direccion) {
    this.direccion = dir
    this.inputDir = ''
    this.sugerencias = []
    this.dirReady = true
    if (this.changeRegion) {
      this.region = await this.regionService.getRegionDetalles(dir.region)
      this.polygon = new google.maps.Polygon({paths: this.region.ubicacion})
    }
    this.alertService.presentToast('De ser necesario, puedes arrastrar el pin a tu ubicación exacta')
  }

  async getLocation() {
    const coords: Ubicacion =  await this.direccionService.getUbicacion()
    const latLng: google.maps.LatLng = new google.maps.LatLng(coords.lat, coords.lng)
    if (!this.geocoder) this.geocoder = new google.maps.Geocoder
    this.geocoder.geocode({'location': latLng}, (results, status) => {
      this.ngZone.run(() => {
        if (status === 'OK') {
          if (results[0]) {
            this.comparaCobertura(results[0])
          }
        } else {
          this.dirReady = false
          this.alertService.presentAlert('', 'Lo sentimos. Ha surgido un error ')
        }
      })
    })
  }

  dirSelected(id: string) {
    if (!this.geocoder) this.geocoder = new google.maps.Geocoder
    this.map = google.maps
    this.geocoder.geocode({'placeId': id}, (results, status) => {
      this.ngZone.run(async () => {
        if (status === 'OK') {
          if (results[0]) {
            this.comparaCobertura(results[0])
          }
        } else if (status === 'ZERO_RESULTS'){
          this.dirReady = false
          this.alertService.presentAlert('', 'No hay coincidencias de ubicación para esta dirección')
        } else {
          this.dirReady = false
          this.alertService.presentAlert('', 'Lo sentimos. Ha surgido un error ')
        }
      })
    })
  }

  comparaCobertura(place: google.maps.GeocoderResult): Promise<boolean> {
    return new Promise(async (resolve, reject) => {      
      let dentro
      if (!this.map) this.map = google.maps
      if (!this.changeRegion) dentro = await this.map.geometry.poly.containsLocation(place.geometry.location, this.polygon)
      else {
        for (const region of this.regiones) {
          this.polygon = await new this.map.Polygon({paths: region.ubicacion})
          dentro = await this.map.geometry.poly.containsLocation(place.geometry.location, this.polygon)
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
        this.alertService.presentToast('De ser necesario, puedes mover el pin a tu ubicación exacta')
      } else {
        this.dirReady = false
        this.alertService.presentAlert('Fuera de cobertura',
          'Lo sentimos. Por el momento no tenemos cobertura de reparto en tu zona.')
      }
      resolve(dentro)
    })
  }

  async guardaLoc(evento) {
    const dentro = await google.maps.geometry.poly
    .containsLocation(new google.maps.LatLng(evento.coords.lat, evento.coords.lng), this.polygon)
    if (dentro) {
      this.lejos = false
      this.direccion.lat = evento.coords.lat
      this.direccion.lng = evento.coords.lng
    } else {
      this.lejos = true
      this.alertService.presentAlert('Fuera de cobertura',
        'Lo sentimos. Por el momento no tenemos cobertura de reparto en tu zona.')
    }
  }

  setDireccion() {
    if (this.back) this.back.unsubscribe()
    this.direccionService.guardarDireccion(this.direccion)
    if (!this.changeRegion) this.modalCtrl.dismiss(this.direccion)
    else this.modalCtrl.dismiss(this.region.referencia)
  }

  regresar() {
    if (this.back) this.back.unsubscribe()
    this.modalCtrl.dismiss(null)
  }

}
