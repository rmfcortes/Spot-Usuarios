import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoriaPageRoutingModule } from './categoria-routing.module';

import { CategoriaPage } from './categoria.page';

import { StarsModule } from 'src/app/shared/stars.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProdsOfertasModule } from 'src/app/shared/prodsofertas.module';
import { OfertasPageModule } from 'src/app/modals/ofertas/ofertas.module';
import { CategoriasPageModule } from 'src/app/modals/categorias/categorias.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StarsModule,
    SharedModule,
    OfertasPageModule,
    ProdsOfertasModule,
    CategoriasPageModule,
    CategoriaPageRoutingModule
  ],
  declarations: [CategoriaPage]
})
export class CategoriaPageModule {}
