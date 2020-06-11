import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NegocioServiciosPage } from './negocio-servicios.page';

const routes: Routes = [
  {
    path: '',
    component: NegocioServiciosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NegocioServiciosPageRoutingModule {}
