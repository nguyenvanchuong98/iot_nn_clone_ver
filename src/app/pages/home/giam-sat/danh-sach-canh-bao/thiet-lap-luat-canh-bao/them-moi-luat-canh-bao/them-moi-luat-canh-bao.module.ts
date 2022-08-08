import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiLuatCanhBaoPageRoutingModule } from './them-moi-luat-canh-bao-routing.module';

import { ThemMoiLuatCanhBaoPage } from './them-moi-luat-canh-bao.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThemMoiLuatCanhBaoPageRoutingModule,
    SharedModule
  ],
  declarations: [ThemMoiLuatCanhBaoPage]
})
export class ThemMoiLuatCanhBaoPageModule {}
