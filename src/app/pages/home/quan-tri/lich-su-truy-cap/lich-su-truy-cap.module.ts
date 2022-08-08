import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LichSuTruyCapPageRoutingModule } from './lich-su-truy-cap-routing.module';

import { LichSuTruyCapPage } from './lich-su-truy-cap.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LichSuTruyCapPageRoutingModule,
    SharedModule
  ],
  declarations: [LichSuTruyCapPage]
})
export class LichSuTruyCapPageModule {}
