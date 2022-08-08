import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';
import {DoiMatKhauPageRoutingModule} from './doi-mat-khau-routing.module';

import {DoiMatKhauPage} from './doi-mat-khau.page';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        DoiMatKhauPageRoutingModule,
        SharedModule
    ],
    declarations: [DoiMatKhauPage]
})
export class DoiMatKhauPageModule {
}
