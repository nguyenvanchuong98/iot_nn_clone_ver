import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { QuanLyNhomPageRoutingModule } from "./quan-ly-nhom-routing.module";
import { QuanLyNhomPage } from "./quan-ly-nhom.page";
import { SharedModule } from "src/app/shared/shared.module";
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        QuanLyNhomPageRoutingModule,
        ReactiveFormsModule,
        SharedModule
    ],
  declarations: [QuanLyNhomPage],
})
export class QuanLyNhomPageModule {}
