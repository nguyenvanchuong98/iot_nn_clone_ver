import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DanhSachCanhBaoPageRoutingModule } from './danh-sach-canh-bao-routing.module';

import { DanhSachCanhBaoPage } from './danh-sach-canh-bao.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DanhSachCanhBaoPageRoutingModule,
    SharedModule
  ],
  declarations: [DanhSachCanhBaoPage]
})
export class DanhSachCanhBaoPageModule {}
