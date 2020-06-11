import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PreloadImageComponent } from '../components/pre-load-image/pre-load-image.component';
import { NoNetworkComponent } from '../components/no-network/no-network.component';

import { TitleScrollVanishDirective } from '../directives/scroll-vanish-title.directive';
import { ScrollVanishDirective } from '../directives/scroll-vanish.directive';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
    ],
    declarations: [
      TitleScrollVanishDirective,
      PreloadImageComponent,
      ScrollVanishDirective,
      NoNetworkComponent,
    ],
    exports: [
      TitleScrollVanishDirective,
      PreloadImageComponent,
      ScrollVanishDirective,
      NoNetworkComponent,
    ]
  })

  export class SharedModule {}
