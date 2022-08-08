import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiDamTomPageRoutingModule } from './them-moi-dam-tom-routing.module';

import { ThemMoiDamTomPage } from './them-moi-dam-tom.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    IonicSelectableModule,
    ThemMoiDamTomPageRoutingModule,
    SharedModule
  ],
  declarations: [ThemMoiDamTomPage]
})
export class ThemMoiDamTomPageModule {}
