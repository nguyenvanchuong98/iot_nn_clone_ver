import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KichHoatTkPageRoutingModule } from './kich-hoat-tk-routing.module';

import { KichHoatTkPage } from './kich-hoat-tk.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        KichHoatTkPageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [KichHoatTkPage]
})
export class KichHoatTkPageModule {}
