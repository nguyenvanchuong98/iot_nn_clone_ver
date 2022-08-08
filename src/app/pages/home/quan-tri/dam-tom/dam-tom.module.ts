import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DamTomPageRoutingModule } from './dam-tom-routing.module';

import { DamTomPage } from './dam-tom.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DamTomPageRoutingModule,
    SharedModule
  ],
  declarations: [DamTomPage]
})
export class DamTomPageModule {}
