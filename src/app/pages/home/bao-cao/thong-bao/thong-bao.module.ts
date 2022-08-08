import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongBaoPageRoutingModule } from './thong-bao-routing.module';

import { ThongBaoPage } from './thong-bao.page';
import { ChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';

import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChartsModule,
    ReactiveFormsModule,
    SharedModule,
    ThongBaoPageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts
    })
  ],
  declarations: [ThongBaoPage]
})
export class ThongBaoPageModule {}
