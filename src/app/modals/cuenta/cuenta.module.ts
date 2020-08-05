import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CuentaPage } from './cuenta.page';

import { DireccionesPageModule } from '../direcciones/direcciones.module';
import { FormasPagoPageModule } from '../formas-pago/formas-pago.module';
import { ProdsCartModule } from 'src/app/shared/prods-cart.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ProdsCartModule,
    FormasPagoPageModule,
    DireccionesPageModule,
  ],
  entryComponents: [CuentaPage],
  declarations: [CuentaPage]
})
export class CuentaPageModule {}
