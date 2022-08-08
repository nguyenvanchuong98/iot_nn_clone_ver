import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinTaiKhoanPageRoutingModule } from './thong-tin-tai-khoan-routing.module';

import { ThongTinTaiKhoanPage } from './thong-tin-tai-khoan.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThongTinTaiKhoanPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ThongTinTaiKhoanPage]
})
export class ThongTinTaiKhoanPageModule {}
