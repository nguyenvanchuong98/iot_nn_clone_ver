import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiQuanLyPageRoutingModule } from './them-moi-quan-ly-routing.module';

import { ThemMoiQuanLyPage } from './them-moi-quan-ly.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThemMoiQuanLyPageRoutingModule,
    SharedModule
  ],
  declarations: [ThemMoiQuanLyPage]
})
export class ThemMoiQuanLyPageModule {}
