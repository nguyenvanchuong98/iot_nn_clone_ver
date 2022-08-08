import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiHenGioDieuKhienPageRoutingModule } from './them-moi-hen-gio-dieu-khien-routing.module';

import { ThemMoiHenGioDieuKhienPage } from './them-moi-hen-gio-dieu-khien.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThemMoiHenGioDieuKhienPageRoutingModule,
    SharedModule
  ],
  declarations: [ThemMoiHenGioDieuKhienPage]
})
export class ThemMoiHenGioDieuKhienPageModule {}
