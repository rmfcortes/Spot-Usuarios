import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegionPageRoutingModule } from './region-routing.module';

import { RegionPage } from './region.page';
import { DireccionesPageModule } from 'src/app/modals/direcciones/direcciones.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DireccionesPageModule,
    RegionPageRoutingModule,
  ],
  declarations: [RegionPage]
})
export class RegionPageModule {}
