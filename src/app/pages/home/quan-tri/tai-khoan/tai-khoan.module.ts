import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TaiKhoanPageRoutingModule } from './tai-khoan-routing.module';

import { TaiKhoanPage } from './tai-khoan.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaiKhoanPageRoutingModule,
    SharedModule
  ],
  declarations: [TaiKhoanPage]
})
export class TaiKhoanPageModule {}
