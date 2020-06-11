import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegionPageRoutingModule } from './region-routing.module';

import { RegionPage } from './region.page';
import { DireccionesPageModule } from 'src/app/modals/direcciones/direcciones.module';
import { ZonasPageModule } from 'src/app/modals/zonas/zonas.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ZonasPageModule,
    DireccionesPageModule,
    RegionPageRoutingModule,
  ],
  declarations: [RegionPage]
})
export class RegionPageModule {}
