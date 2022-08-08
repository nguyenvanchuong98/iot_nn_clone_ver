import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KetNoiCamBienPageRoutingModule } from './ket-noi-cam-bien-routing.module';

import { KetNoiCamBienPage } from './ket-noi-cam-bien.page';
import { ChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChartsModule,
    ReactiveFormsModule,
    SharedModule,
    KetNoiCamBienPageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts
    })
  ],
  declarations: [KetNoiCamBienPage]
})
export class KetNoiCamBienPageModule {}
