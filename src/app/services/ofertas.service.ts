import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Oferta, InfoGral } from '../interfaces/negocio';
import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class OfertasService {

  subCategoria = 'todos'
  categoria = 'todas'
  ofertas: Oferta[]
  lastKey: string
  noMore = false

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

    // Para home page

    getOfertas(batch: number, categoria: string): Promise<Oferta[]> {
      return new Promise((resolve, reject) => {
        const region = this.uidService.getRegion()
        const oferSub = this.db.list(`ofertas/${region}/${categoria}`, data => data.orderByChild('ventas').limitToLast(batch)).valueChanges()
          .subscribe((ofertas: Oferta[]) => {
            oferSub.unsubscribe()
            resolve(ofertas)
          })
      })
    }

    getOfertasSubCategoria(batch: number, categoria: string, subCategoria: string): Promise<Oferta[]> {
      return new Promise((resolve, reject) => {
        const region = this.uidService.getRegion()
        const oferSub = this.db.list(`ofertas/${region}/subCategorias/${categoria}/${subCategoria}`, 
        data => data.orderByChild('ventas').limitToLast(batch)).valueChanges()
          .subscribe((ofertas: Oferta[]) => {
            oferSub.unsubscribe()
            resolve(ofertas)
          })
      })
    }

    getStatus(idNegocio: string): Promise<InfoGral> {
      return new Promise((resolve, reject) => {
        const region = this.uidService.getRegion()
        const oferSub = this.db.object(`functions/${region}/${idNegocio}`).valueChanges()
          .subscribe((status: InfoGral) => {
            oferSub.unsubscribe()
            resolve(status)
          })
      })
    }

    // Para ofertas Modal
    getOfertasModal(categoria: string, batch: number, lastKey: string, subCategoria: string): Promise<Oferta[]> {
      return new Promise((resolve, reject) => {
        const region = this.uidService.getRegion()
        if (subCategoria === 'todos') {
          if (lastKey) {
            const x = this.db.list(`ofertas/${region}/${categoria}`, data =>
              data.orderByKey().limitToLast(batch).endAt(lastKey.toString())).valueChanges().subscribe(async (ofertas: Oferta[]) => {
                x.unsubscribe()
                resolve(ofertas)
              })
          } else {
            const x = this.db.list(`ofertas/${region}/${categoria}`, data =>
              data.orderByKey().limitToLast(batch)).valueChanges().subscribe(async (ofertas: Oferta[]) => {
                x.unsubscribe()
                resolve(ofertas)
              })
          }
        } else {
          if (lastKey) {
            const x = this.db.list(`ofertas/${region}/subCategorias/${categoria}/${subCategoria}`, data =>
              data.orderByKey().limitToLast(batch).endAt(lastKey.toString())).valueChanges().subscribe(async (ofertas: Oferta[]) => {
                x.unsubscribe()
                resolve(ofertas)
              })
          } else {
            const x = this.db.list(`ofertas/${region}/subCategorias/${categoria}/${subCategoria}`, data =>
              data.orderByKey().limitToLast(batch)).valueChanges().subscribe(async (ofertas: Oferta[]) => {
                x.unsubscribe()
                resolve(ofertas)
              })
          }
        }
      })
    }

    setOfertas(ofertas: Oferta[]) {
      this.ofertas = ofertas
    }

    setSubCategoria(sub: string) {
      this.subCategoria = sub
    }

    setCategoria(cat: string) {
      this.categoria = cat
    }

    setLasKey(key: string){
      this.lastKey = key
    }

    setNoMore(value: boolean) {
      this.noMore = value
    }

    getLastOfertas() {
      return this.ofertas
    }

    getSubCategoria() {
      return this.subCategoria
    }

    getCategoria() {
      return this.categoria
    }

    getLastKey() {
      return this.lastKey
    }

    getNoMore() {
      return this.noMore
    }

    resetOfertas(){
      this.ofertas = []
      this.lastKey = ''
      this.categoria = 'todas'
      this.subCategoria = 'todos'
      this.noMore = false
    }

}
