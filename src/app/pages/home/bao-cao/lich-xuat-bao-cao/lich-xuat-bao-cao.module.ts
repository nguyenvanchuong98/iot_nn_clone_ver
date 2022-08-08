import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LichXuatBaoCaoPageRoutingModule } from './lich-xuat-bao-cao-routing.module';

import { LichXuatBaoCaoPage } from './lich-xuat-bao-cao.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LichXuatBaoCaoPageRoutingModule,
    SharedModule
  ],
  declarations: [LichXuatBaoCaoPage]
})
export class LichXuatBaoCaoPageModule {}
