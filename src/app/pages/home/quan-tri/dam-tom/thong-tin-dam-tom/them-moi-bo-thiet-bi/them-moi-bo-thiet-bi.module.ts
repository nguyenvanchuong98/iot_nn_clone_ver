import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiBoThietBiPageRoutingModule } from './them-moi-bo-thiet-bi-routing.module';

import { ThemMoiBoThietBiPage } from './them-moi-bo-thiet-bi.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThemMoiBoThietBiPageRoutingModule,
    SharedModule
  ],
  declarations: [ThemMoiBoThietBiPage]
})
export class ThemMoiBoThietBiPageModule {}
