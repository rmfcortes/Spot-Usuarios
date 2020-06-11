import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NegocioPageRoutingModule } from './negocio-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewsModule } from 'src/app/shared/views.module';

import { NegocioPage } from './negocio.page';

import { LoginPageModule } from 'src/app/modals/login/login.module';
import { ProductoPageModule } from 'src/app/modals/producto/producto.module';
import { CuentaPageModule } from 'src/app/modals/cuenta/cuenta.module';
import { InfoSucursalPageModule } from 'src/app/modals/info-sucursal/info-sucursal.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewsModule,
    SharedModule,
    LoginPageModule,
    CuentaPageModule,
    ProductoPageModule,
    InfoSucursalPageModule,
    NegocioPageRoutingModule
  ],
  declarations: [NegocioPage]
})
export class NegocioPageModule {}
