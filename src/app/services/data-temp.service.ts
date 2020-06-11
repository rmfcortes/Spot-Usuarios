import { Injectable } from '@angular/core';
import { Negocio } from '../interfaces/negocio';
import { Direccion } from '../interfaces/direcciones';


@Injectable({
  providedIn: 'root'
})
export class DataTempService {

  negocio: Negocio;

  constructor() { }

  setNegocio(negocio: Negocio) {
    this.negocio = negocio;
  }

  getNegocio() {
    return this.negocio;
  }

}
