import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThongTinDamTomPageRoutingModule } from './thong-tin-dam-tom-routing.module';

import { ThongTinDamTomPage } from './thong-tin-dam-tom.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { SharedModule } from 'src/app/shared/shared.module';
import { SlideZoneComponent } from './slide-zone/slide-zone.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ThongTinDamTomPageRoutingModule,
    IonicSelectableModule,
    SharedModule
  ],
  declarations: [ThongTinDamTomPage, SlideZoneComponent]
})
export class ThongTinDamTomPageModule {}
