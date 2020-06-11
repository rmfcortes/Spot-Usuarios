import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServicioPage } from './servicio.page';
import { SharedModule } from 'src/app/shared/shared.module';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
  ],
  declarations: [ServicioPage],
  providers: [SocialSharing],
  entryComponents: [ServicioPage]
})
export class ServicioPageModule {}
