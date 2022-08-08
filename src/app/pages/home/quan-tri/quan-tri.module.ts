import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuanTriPageRoutingModule } from './quan-tri-routing.module';

import { QuanTriPage } from './quan-tri.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuanTriPageRoutingModule
  ],
  declarations: [QuanTriPage]
})
export class QuanTriPageModule {}
