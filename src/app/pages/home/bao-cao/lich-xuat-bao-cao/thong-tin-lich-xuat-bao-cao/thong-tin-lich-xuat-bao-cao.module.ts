import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinLichXuatBaoCaoPageRoutingModule } from './thong-tin-lich-xuat-bao-cao-routing.module';

import { ThongTinLichXuatBaoCaoPage } from './thong-tin-lich-xuat-bao-cao.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThongTinLichXuatBaoCaoPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ThongTinLichXuatBaoCaoPage]
})
export class ThongTinLichXuatBaoCaoPageModule {}
