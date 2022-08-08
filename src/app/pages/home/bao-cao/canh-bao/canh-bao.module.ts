import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CanhBaoPageRoutingModule } from './canh-bao-routing.module';

import { CanhBaoPage } from './canh-bao.page';
import { ChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ChartsModule,
    SharedModule,
    CanhBaoPageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts
    })
  ],
  declarations: [CanhBaoPage]
})
export class CanhBaoPageModule {}
