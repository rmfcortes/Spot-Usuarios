import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormasPagoPage } from './formas-pago.page';
import { TarjetaPageModule } from '../tarjeta/tarjeta.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TarjetaPageModule,
  ],
  declarations: [FormasPagoPage],
  entryComponents: [FormasPagoPage]
})
export class FormasPagoPageModule {}
