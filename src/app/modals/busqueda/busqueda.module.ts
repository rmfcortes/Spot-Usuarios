import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BusquedaPage } from './busqueda.page';
import { ProductoPageModule } from '../producto/producto.module';
import { LoginPageModule } from '../login/login.module';
import { InfoSucursalPageModule } from '../info-sucursal/info-sucursal.module';
import { CuentaPageModule } from '../cuenta/cuenta.module';
import { ServicioPageModule } from '../servicio/servicio.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageModule,
    CuentaPageModule,
    ServicioPageModule,
    ProductoPageModule,
    InfoSucursalPageModule,
  ],
  declarations: [BusquedaPage],
  entryComponents: [BusquedaPage]
})
export class BusquedaPageModule {}
