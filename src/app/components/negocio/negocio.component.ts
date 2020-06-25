import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AnimationsService } from 'src/app/services/animations.service';
import { Direccion } from '../../interfaces/direcciones';

@Component({
  selector: 'app-negocio',
  templateUrl: './negocio.component.html',
  styleUrls: ['./negocio.component.scss'],
})
export class NegocioComponent implements OnInit {

  @Input() negocios
  @Input() direccion: Direccion
  @Output() verNeg = new EventEmitter<any>()

  constructor(
    private animationService: AnimationsService,
  ) { }

  ngOnInit() {}

  verNegocio(producto) {
    this.verNeg.emit(producto)
  }


  ionImgWillLoad(image) {
    this.animationService.enterAnimation(image.target)
  }

    // Tracks

    trackNegocios(index:number, el:any): string {
      return el.id ? el.id : el.idNegocio
    }

}
