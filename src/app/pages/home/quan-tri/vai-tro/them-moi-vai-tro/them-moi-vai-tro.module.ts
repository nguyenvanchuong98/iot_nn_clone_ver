import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemMoiVaiTroPageRoutingModule } from './them-moi-vai-tro-routing.module';

import { ThemMoiVaiTroPage } from './them-moi-vai-tro.page';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThemMoiVaiTroPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ThemMoiVaiTroPage]
})
export class ThemMoiVaiTroPageModule {}
