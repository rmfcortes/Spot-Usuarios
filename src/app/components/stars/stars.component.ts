import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { AnimationsService } from 'src/app/services/animations.service';
import {  } from 'protractor';

@Component({
  selector: 'app-stars',
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.scss'],
})
export class StarsComponent implements OnChanges {

  @Input() calificacion;
  @Input() readOnly;
  @Output() calficar = new EventEmitter<number>();

  promedio = 5;

  constructor(
    private animationService: AnimationsService,
  ) {}

  ngOnChanges() {
    if (this.calificacion === 0.1) {
      this.promedio = 0.1;
    } else if (this.calificacion > 0 && this.calificacion < 1) {
      this.promedio = 0.5;
    } else if (this.calificacion === 1) {
      this.promedio = 1;
    } else if (this.calificacion > 1 && this.calificacion < 2) {
      this.promedio = 1.5;
    } else if (this.calificacion === 2) {
      this.promedio = 2;
    } else if (this.calificacion > 2 && this.calificacion < 3) {
      this.promedio = 2.5;
    } else if (this.calificacion === 3) {
      this.promedio = 3;
    } else if (this.calificacion > 3 && this.calificacion < 4) {
      this.promedio = 3.5;
    } else if (this.calificacion === 4) {
      this.promedio = 4;
    } else if (this.calificacion > 4 && this.calificacion < 5) {
      this.promedio = 4.5;
    } else if (this.calificacion === 5) {
      this.promedio = 5;
    }
  }

  calificar(calificacion: number, id) {
    if (this.readOnly) return;
    this.promedio = calificacion
    setTimeout(() => {      
      const tit = document.getElementById(id)
      this.animationService.animBrincaPoco(tit)
      this.calficar.emit(calificacion)
    }, 100);
  }

}
