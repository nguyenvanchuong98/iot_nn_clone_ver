import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinVaiTroPageRoutingModule } from './thong-tin-vai-tro-routing.module';
import { ThongTinVaiTroPage } from './thong-tin-vai-tro.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThongTinVaiTroPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ThongTinVaiTroPage]
})
export class ThongTinVaiTroPageModule {}
