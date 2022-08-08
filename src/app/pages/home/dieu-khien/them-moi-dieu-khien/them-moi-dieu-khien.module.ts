import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiDieuKhienPageRoutingModule } from './them-moi-dieu-khien-routing.module';

import { ThemMoiDieuKhienPage } from './them-moi-dieu-khien.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ThemMoiDieuKhienPageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [ThemMoiDieuKhienPage]
})
export class ThemMoiDieuKhienPageModule {}
