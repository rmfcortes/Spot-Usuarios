import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ProductoEstrellaComponent } from '../components/producto-estrella/producto-estrella.component';
import { OfertaEstrellaComponent } from '../components/oferta-estrella/oferta-estrella.component';
import { SharedModule } from './shared.module';



@NgModule({
    imports: [
      CommonModule,
      IonicModule,
      SharedModule,
    ],
    declarations: [
      ProductoEstrellaComponent,
      OfertaEstrellaComponent
    ],
    exports: [
      ProductoEstrellaComponent,
      OfertaEstrellaComponent
    ]
  })

  export class ProdsOfertasModule {}
