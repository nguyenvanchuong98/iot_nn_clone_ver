import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinLuatCanhBaoPageRoutingModule } from './thong-tin-luat-canh-bao-routing.module';

import { ThongTinLuatCanhBaoPage } from './thong-tin-luat-canh-bao.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThongTinLuatCanhBaoPageRoutingModule,
    SharedModule
  ],
  declarations: [ThongTinLuatCanhBaoPage]
})
export class ThongTinLuatCanhBaoPageModule {}
