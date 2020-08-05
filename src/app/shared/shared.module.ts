import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PreloadImageComponent } from '../components/pre-load-image/pre-load-image.component';
import { NoNetworkComponent } from '../components/no-network/no-network.component';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
    ],
    declarations: [
      PreloadImageComponent,
      NoNetworkComponent,
    ],
    exports: [
      PreloadImageComponent,
      NoNetworkComponent,
    ]
  })

  export class SharedModule {}
