import { LimitTempModalComponent } from './limit-temp-modal/limit-temp-modal.component';
import { LimitSalModalComponent } from './limit-sal-modal/limit-sal-modal.component';
import { LimitPhModalComponent } from './limit-ph-modal/limit-ph-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DuLieuCamBienPageRoutingModule } from './du-lieu-cam-bien-routing.module';

import { DuLieuCamBienPage } from './du-lieu-cam-bien.page';
import { ChartsModule } from 'ng2-charts';
import 'chart.js';


import { LimitDoModalComponent } from './limit-do-modal/limit-do-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { LimitTypeUnknownComponent } from './limit-type-unknown/limit-type-unknown.component';
import { BieuDoSensorComponent } from './bieu-do-sensor/bieu-do-sensor.component';

import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChartsModule,
    DuLieuCamBienPageRoutingModule,
    SharedModule,
    NgxEchartsModule.forRoot({
      echarts
    }),
  ],
  declarations: [
    DuLieuCamBienPage, 
    LimitPhModalComponent, 
    LimitSalModalComponent, 
    LimitTempModalComponent, 
    LimitDoModalComponent,
    LimitTypeUnknownComponent,
    BieuDoSensorComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DuLieuCamBienPageModule {}
