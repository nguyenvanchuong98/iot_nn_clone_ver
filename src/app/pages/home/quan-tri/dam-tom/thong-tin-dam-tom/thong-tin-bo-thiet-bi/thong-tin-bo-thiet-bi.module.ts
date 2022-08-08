import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinBoThietBiPageRoutingModule } from './thong-tin-bo-thiet-bi-routing.module';

import { ThongTinBoThietBiPage } from './thong-tin-bo-thiet-bi.page';
import {ThongTinThietBiComponent} from "./thong-tin-thiet-bi/thong-tin-thiet-bi.component";
import { SharedModule } from 'src/app/shared/shared.module';
import { AddDeviceSpecialComponent } from './add-device-special/add-device-special.component';
import { InfoDeviceSpecialComponent } from './info-device-special/info-device-special.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThongTinBoThietBiPageRoutingModule,
    SharedModule,
  ],
  declarations: [ThongTinBoThietBiPage, ThongTinThietBiComponent, AddDeviceSpecialComponent, InfoDeviceSpecialComponent]
})
export class ThongTinBoThietBiPageModule {}
