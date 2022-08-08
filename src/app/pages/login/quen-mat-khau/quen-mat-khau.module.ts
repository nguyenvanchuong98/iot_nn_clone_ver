import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuenMatKhauPageRoutingModule } from './quen-mat-khau-routing.module';

import { QuenMatKhauPage } from './quen-mat-khau.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        QuenMatKhauPageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [QuenMatKhauPage]
})
export class QuenMatKhauPageModule {}
