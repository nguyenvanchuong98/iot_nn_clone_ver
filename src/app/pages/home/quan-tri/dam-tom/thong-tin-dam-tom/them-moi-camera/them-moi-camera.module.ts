import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiCameraPageRoutingModule } from './them-moi-camera-routing.module';

import { ThemMoiCameraPage } from './them-moi-camera.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThemMoiCameraPageRoutingModule,
    SharedModule
  ],
  declarations: [ThemMoiCameraPage]
})
export class ThemMoiCameraPageModule {}
