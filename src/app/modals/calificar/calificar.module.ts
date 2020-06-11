import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalificarPage } from './calificar.page';

import { StarsModule } from 'src/app/shared/stars.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StarsModule,
  ],
  declarations: [CalificarPage],
  entryComponents: [CalificarPage]
})
export class CalificarPageModule {}
