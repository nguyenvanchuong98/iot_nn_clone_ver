import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThietLapLuatCanhBaoPageRoutingModule } from './thiet-lap-luat-canh-bao-routing.module';

import { ThietLapLuatCanhBaoPage } from './thiet-lap-luat-canh-bao.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThietLapLuatCanhBaoPageRoutingModule,
    SharedModule
  ],
  declarations: [ThietLapLuatCanhBaoPage]
})
export class ThietLapLuatCanhBaoPageModule {}
