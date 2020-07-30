import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoSucursalPage } from './info-sucursal.page';
import { AgmCoreModule } from '@agm/core';

import { environment } from 'src/environments/environment';
import { CallNumber } from '@ionic-native/call-number/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgmCoreModule.forRoot({
      apiKey: environment.mapsApiKey
    }),
  ],
  providers: [CallNumber],
  declarations: [InfoSucursalPage],
  entryComponents: [InfoSucursalPage],
})
export class InfoSucursalPageModule {}
