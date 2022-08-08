import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinBoDieuKhienPageRoutingModule } from './thong-tin-bo-dieu-khien-routing.module';

import { ThongTinBoDieuKhienPage } from './thong-tin-bo-dieu-khien.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThongTinBoDieuKhienPageRoutingModule
  ],
  declarations: [ThongTinBoDieuKhienPage]
})
export class ThongTinBoDieuKhienPageModule {}
