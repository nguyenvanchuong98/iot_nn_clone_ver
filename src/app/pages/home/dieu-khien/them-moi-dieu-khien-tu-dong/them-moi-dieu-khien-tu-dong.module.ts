import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiDieuKhienTuDongPageRoutingModule } from './them-moi-dieu-khien-tu-dong-routing.module';

import { ThemMoiDieuKhienTuDongPage } from './them-moi-dieu-khien-tu-dong.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThemMoiDieuKhienTuDongPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ThemMoiDieuKhienTuDongPage]
})
export class ThemMoiDieuKhienTuDongPageModule { }
