import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GiamSatPageRoutingModule } from './giam-sat-routing.module';
import { GiamSatPage } from './giam-sat.page';
import { DashboardDataComponent } from './dashboard-data/dashboard-data.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GiamSatZoneComponent } from './giam-sat-zone/giam-sat-zone.component';
import { GiamSatCameraComponent } from './giam-sat-camera/giam-sat-camera.component';
import { GiamSatDieuKhienActiveComponent } from './giam-sat-dieu-khien-active/giam-sat-dieu-khien-active.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GiamSatPageRoutingModule,
    SharedModule
  ],
  declarations: [
    GiamSatPage,
    DashboardDataComponent,
    GiamSatZoneComponent,
    GiamSatCameraComponent,
    GiamSatDieuKhienActiveComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GiamSatPageModule {}
