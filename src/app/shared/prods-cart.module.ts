import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';


import { ProdCartComponent } from '../components/prod-cart/prod-cart.component';



@NgModule({
    imports: [
      CommonModule,
      IonicModule,
    ],
    declarations: [
      ProdCartComponent
    ],
    exports: [
      ProdCartComponent
    ]
  })

  export class ProdsCartModule {}
