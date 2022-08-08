import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CameraPageRoutingModule } from './camera-routing.module';

import { CameraPage } from './camera.page';
import { DftIonSelectComponent } from 'src/app/shared/components/dft-ion-select/dft-ion-select.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CameraPageRoutingModule,
    SharedModule
  ],
  declarations: [CameraPage]
})
export class CameraPageModule {}
