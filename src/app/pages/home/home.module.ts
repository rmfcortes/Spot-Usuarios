import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';

import { HomePage } from './home.page';
import { OfertasPageModule } from 'src/app/modals/ofertas/ofertas.module';
import { LoginPageModule } from 'src/app/modals/login/login.module';
import { CategoriasPageModule } from 'src/app/modals/categorias/categorias.module';

import { TarjetaPageModule } from 'src/app/modals/tarjeta/tarjeta.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    LoginPageModule,
    OfertasPageModule,
    TarjetaPageModule,
    CategoriasPageModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
