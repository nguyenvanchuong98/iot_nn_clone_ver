import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinHenGioDieuKhienPageRoutingModule } from './thong-tin-hen-gio-dieu-khien-routing.module';

import { ThongTinHenGioDieuKhienPage } from './thong-tin-hen-gio-dieu-khien.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThongTinHenGioDieuKhienPageRoutingModule,
    SharedModule
  ],
  declarations: [ThongTinHenGioDieuKhienPage]
})
export class ThongTinHenGioDieuKhienPageModule {}
