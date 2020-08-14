import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OfertasPage } from './ofertas.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { CategoriasPageModule } from '../categorias/categorias.module';
import { LoginPageModule } from '../login/login.module';
import { ProductoPageModule } from '../producto/producto.module';
import { CuentaPageModule } from '../cuenta/cuenta.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    LoginPageModule,
    CuentaPageModule,
    ProductoPageModule,
    CategoriasPageModule,
  ],
  declarations: [OfertasPage],
  entryComponents: [OfertasPage]
})
export class OfertasPageModule {}
