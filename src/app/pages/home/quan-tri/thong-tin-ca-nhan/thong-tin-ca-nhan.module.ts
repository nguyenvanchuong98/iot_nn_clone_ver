import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ThongTinCaNhanPageRoutingModule} from './thong-tin-ca-nhan-routing.module';

import {ThongTinCaNhanPage} from './thong-tin-ca-nhan.page';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        ThongTinCaNhanPageRoutingModule,
        SharedModule
    ],
    declarations: [ThongTinCaNhanPage]
})
export class ThongTinCaNhanPageModule {
}
