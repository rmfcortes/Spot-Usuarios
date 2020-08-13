import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { NegocioService } from 'src/app/services/negocio.service';
import { UidService } from 'src/app/services/uid.service';

import { DatosParaCuenta, NegocioInfo, DetallesNegocio } from 'src/app/interfaces/negocio';
import { Dia } from 'src/app/interfaces/horario.interface';
import { GoogleMap } from '@ionic-native/google-maps';
import { DisparadoresService } from 'src/app/services/disparadores.service';


@Component({
  selector: 'app-info-sucursal',
  templateUrl: './info-sucursal.page.html',
  styleUrls: ['./info-sucursal.page.scss'],
})
export class InfoSucursalPage implements OnInit {

  @Input() datos: DatosParaCuenta
  @Input() verHorario: boolean
  @Input() abierto: boolean

  icon = '../../../assets/img/iconos/tienda.png';
  map: GoogleMap
  mapReady = false

  negocio: NegocioInfo
  despliegueHorario = false
  infoReady = false

  horario: Dia[] = []

  back: Subscription


  constructor(
    private platform: Platform,
    private callNumber: CallNumber,
    private modalController: ModalController,
    private alertService: DisparadoresService,
    private negocioService: NegocioService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
    if (this.verHorario) this.despliegueHorario = true
    this.getInfo()
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar()
    })
  }

  mapLoaded(event) {
    this.mapReady = true
    this.map = event
    this.styleMap()
  }

  llamar(numero: string) {
    this.callNumber.callNumber(numero, true)
    .catch(err => this.alertService.presentAlert('Error', 'Lo sentimos, surgió un error al ejecutar la llamada'))
  }

  styleMap()  {
    const styles = {
      default: null,
      hide: [
        {
          featureType: 'poi.business',
          stylers: [{visibility: 'off'}]
        },
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [{visibility: 'off'}]
        }
      ]
    };
    this.map.setOptions({styles: styles['hide']})
  }

  async getInfo() {
    this.horario = await this.negocioService.getHorario(this.datos.idNegocio)
    const result: DetallesNegocio = await this.negocioService.getSucursalNegocio(this.datos.categoria, this.datos.idNegocio)
    let status
    if (this.abierto) status = 'Abierto'
    else status = 'Cerrado'
    this.negocio = {
      datos: this.datos,
      detalles: result,
      status
    }
    if (!this.datos.direccion) {
      this.datos.direccion = {
        direccion: result.direccion,
        lat: result.lat,
        lng: result.lng,
        region: this.uidService.getRegion()
      }
    }
    this.infoReady = true
  }

  async regresar() {
    if (this.back) this.back.unsubscribe()
    await this.modalController.dismiss()
  }

}
