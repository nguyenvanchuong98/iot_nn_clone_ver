import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinDieuKhienThuCongPageRoutingModule } from './thong-tin-dieu-khien-thu-cong-routing.module';

import { ThongTinDieuKhienThuCongPage } from './thong-tin-dieu-khien-thu-cong.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThongTinDieuKhienThuCongPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ThongTinDieuKhienThuCongPage]
})
export class ThongTinDieuKhienThuCongPageModule {}
