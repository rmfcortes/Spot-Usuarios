import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedidoActivoPage } from './pedido-activo.page';

import { CalificarPageModule } from '../calificar/calificar.module';
import { ProdsCartModule } from 'src/app/shared/prods-cart.module';
import { StarsModule } from 'src/app/shared/stars.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StarsModule,
    ProdsCartModule,
    CalificarPageModule,
  ],
  declarations: [PedidoActivoPage],
  entryComponents: [PedidoActivoPage]
})
export class PedidoActivoPageModule {}
