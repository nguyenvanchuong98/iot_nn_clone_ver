import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinDieuKhienTuDongPageRoutingModule } from './thong-tin-dieu-khien-tu-dong-routing.module';

import { ThongTinDieuKhienTuDongPage } from './thong-tin-dieu-khien-tu-dong.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThongTinDieuKhienTuDongPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ThongTinDieuKhienTuDongPage]
})
export class ThongTinDieuKhienTuDongPageModule { }
