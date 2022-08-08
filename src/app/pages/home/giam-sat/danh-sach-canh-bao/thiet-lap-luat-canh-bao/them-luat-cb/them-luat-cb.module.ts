import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemLuatCbPageRoutingModule } from './them-luat-cb-routing.module';

import { ThemLuatCbPage } from './them-luat-cb.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThemLuatCbPageRoutingModule
  ],
  declarations: [ThemLuatCbPage]
})
export class ThemLuatCbPageModule {}
