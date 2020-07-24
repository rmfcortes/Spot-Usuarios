import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPage } from './chat.page';
import { BubblesComponent } from 'src/app/components/bubbles/bubbles.component';

import { AutosizeModule } from 'ngx-autosize';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AutosizeModule,
  ],
  declarations: [ChatPage, BubblesComponent],
  entryComponents: [ChatPage]
})
export class ChatPageModule {}
