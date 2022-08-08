import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VaiTroPageRoutingModule } from './vai-tro-routing.module';

import { VaiTroPage } from './vai-tro.page';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VaiTroPageRoutingModule,
    SharedModule
  ],
  declarations: [VaiTroPage]
})
export class VaiTroPageModule {}
