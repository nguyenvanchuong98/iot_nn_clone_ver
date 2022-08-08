import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BaoCaoPageRoutingModule } from './bao-cao-routing.module';

import { BaoCaoPage } from './bao-cao.page';
import { HttpClientModule } from '@angular/common/http';
import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    BaoCaoPageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts
    })
  ],
  declarations: [BaoCaoPage]
})
export class BaoCaoPageModule {}
