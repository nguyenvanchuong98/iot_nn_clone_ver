import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HoatDongCuaThietBiPageRoutingModule } from './hoat-dong-cua-thiet-bi-routing.module';

import { HoatDongCuaThietBiPage } from './hoat-dong-cua-thiet-bi.page';

import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HoatDongCuaThietBiPageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts
    })
  ],
  declarations: [HoatDongCuaThietBiPage]
})
export class HoatDongCuaThietBiPageModule {}
