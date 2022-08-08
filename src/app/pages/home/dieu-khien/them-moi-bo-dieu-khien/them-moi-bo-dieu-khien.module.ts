import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiBoDieuKhienPageRoutingModule } from './them-moi-bo-dieu-khien-routing.module';

import { ThemMoiBoDieuKhienPage } from './them-moi-bo-dieu-khien.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ThemMoiBoDieuKhienPageRoutingModule
  ],
  declarations: [ThemMoiBoDieuKhienPage]
})
export class ThemMoiBoDieuKhienPageModule {}
