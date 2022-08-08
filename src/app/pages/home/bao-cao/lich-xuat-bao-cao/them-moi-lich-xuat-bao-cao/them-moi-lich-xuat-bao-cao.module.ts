import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiLichXuatBaoCaoPageRoutingModule } from './them-moi-lich-xuat-bao-cao-routing.module';

import { ThemMoiLichXuatBaoCaoPage } from './them-moi-lich-xuat-bao-cao.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThemMoiLichXuatBaoCaoPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ThemMoiLichXuatBaoCaoPage]
})
export class ThemMoiLichXuatBaoCaoPageModule {}
