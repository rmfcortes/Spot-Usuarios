import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NegocioServiciosPageRoutingModule } from './negocio-servicios-routing.module';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';

import { InfoSucursalPageModule } from 'src/app/modals/info-sucursal/info-sucursal.module';
import { NegocioServiciosPage } from './negocio-servicios.page';


import { ServicioPageModule } from 'src/app/modals/servicio/servicio.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewsModule } from 'src/app/shared/views.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewsModule,
    SharedModule,
    ServicioPageModule,
    InfoSucursalPageModule,
    NegocioServiciosPageRoutingModule
  ],
  providers: [
    CallNumber,
    SocialSharing,
  ],
  declarations: [NegocioServiciosPage]
})
export class NegocioServiciosPageModule {}
