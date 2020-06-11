import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AvancesPage } from './avances.page';

const routes: Routes = [
  {
    path: '',
    component: AvancesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AvancesPageRoutingModule {}
