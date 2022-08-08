import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuanTriMenuPageRoutingModule } from './quan-tri-menu-routing.module';

import { QuanTriMenuPage } from './quan-tri-menu.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuanTriMenuPageRoutingModule,
    SharedModule
  ],
  declarations: [QuanTriMenuPage]
})
export class QuanTriMenuPageModule {}
