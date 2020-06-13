import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { StarsComponent } from '../components/stars/stars.component';
import { NegocioComponent } from '../components/negocio/negocio.component';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
    ],
    declarations: [
      StarsComponent,
      NegocioComponent,
    ],
    exports: [
      StarsComponent,
      NegocioComponent,
    ]
  })

  export class StarsModule {}
