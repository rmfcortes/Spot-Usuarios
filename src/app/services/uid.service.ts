import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UidService {

  uid: string;
  foto: string;
  nombre: string;
  region: string;

  public usuario = new BehaviorSubject(null);
  change = new BehaviorSubject<boolean>(false)

  constructor() {  }

  setUid(uid: string) {
    this.uid = uid
    this.usuario.next(uid)
  }

  getUid() {
    return this.uid
  }

  setFoto(foto: string) {
    this.foto = foto
  }

  getFoto() {
    return this.foto
  }

  setNombre(nombre: string) {
    this.nombre = nombre
  }

  getNombre() {
    return this.nombre
  }
  
  setRegion(region) {
    this.region = region
  }

  getRegion() {
    return this.region
  }

  regionChange(val: boolean) {
    this.change.next(val)
  }

}
