import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CuentaPage } from './cuenta.page';

import { DireccionesPageModule } from '../direcciones/direcciones.module';
import { FormasPagoPageModule } from '../formas-pago/formas-pago.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormasPagoPageModule,
    DireccionesPageModule,
  ],
  entryComponents: [CuentaPage],
  declarations: [CuentaPage]
})
export class CuentaPageModule {}
