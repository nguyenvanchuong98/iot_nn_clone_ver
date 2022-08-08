import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DuLieuGiamSatPageRoutingModule } from './du-lieu-giam-sat-routing.module';

import { DuLieuGiamSatPage } from './du-lieu-giam-sat.page';
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
    DuLieuGiamSatPageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts
    })
  ],
  declarations: [DuLieuGiamSatPage]
})
export class DuLieuGiamSatPageModule {}
