import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoriaPageRoutingModule } from './categoria-routing.module';

import { CategoriaPage } from './categoria.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { OfertasPageModule } from 'src/app/modals/ofertas/ofertas.module';
import { StarsModule } from 'src/app/shared/stars.module';
import { CategoriasPageModule } from 'src/app/modals/categorias/categorias.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StarsModule,
    SharedModule,
    OfertasPageModule,
    CategoriasPageModule,
    CategoriaPageRoutingModule
  ],
  declarations: [CategoriaPage]
})
export class CategoriaPageModule {}
