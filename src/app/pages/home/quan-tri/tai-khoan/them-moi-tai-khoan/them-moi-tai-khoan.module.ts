import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiTaiKhoanPageRoutingModule } from './them-moi-tai-khoan-routing.module';

import { ThemMoiTaiKhoanPage } from './them-moi-tai-khoan.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThemMoiTaiKhoanPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ThemMoiTaiKhoanPage]
})
export class ThemMoiTaiKhoanPageModule {}
