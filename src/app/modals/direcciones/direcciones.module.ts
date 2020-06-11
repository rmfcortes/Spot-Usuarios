import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DireccionesPage } from './direcciones.page';

import { AgmCoreModule } from '@agm/core';

import { environment } from 'src/environments/environment';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AgmCoreModule.forRoot({
      apiKey: environment.mapsApiKey,
      libraries: ['places', 'geometry']
    }),
  ],
  declarations: [DireccionesPage],
  entryComponents: [DireccionesPage]
})
export class DireccionesPageModule {}
