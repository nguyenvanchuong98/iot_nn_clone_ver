import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinCameraPageRoutingModule } from './thong-tin-camera-routing.module';

import { ThongTinCameraPage } from './thong-tin-camera.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThongTinCameraPageRoutingModule,
    SharedModule
  ],
  declarations: [ThongTinCameraPage]
})
export class ThongTinCameraPageModule {}
