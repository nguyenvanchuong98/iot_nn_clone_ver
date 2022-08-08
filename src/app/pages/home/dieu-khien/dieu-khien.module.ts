import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DieuKhienPageRoutingModule } from './dieu-khien-routing.module';

import { DieuKhienPage } from './dieu-khien.page';
import { PickertimeComponent } from "./pickertime/pickertime.component";
import { TabDieuKhienTuDongComponent } from './tu-dong/tab-dieu-khien-tu-dong/tab-dieu-khien-tu-dong.component';
import { NhomDieuKhienComponent } from './nhom-dieu-khien/nhom-dieu-khien.component';
import { ThemMoiSuKienModalComponent } from './them-moi-dieu-khien-tu-dong/them-moi-su-kien-modal/them-moi-su-kien-modal.component';
import { PickertimeGroupControlComponent } from './nhom-dieu-khien/pickertimecontrolgroup/pickertimegc.component';

import { ThemMoiRpcModalComponent } from './them-moi-dieu-khien-tu-dong/them-moi-rpc-modal/them-moi-rpc-modal.component';
import { TabHenGioDieuKhienComponent } from './tab-hen-gio-dieu-khien/tab-hen-gio-dieu-khien.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ThemMoiDieuKienThietBiModalComponent } from './them-moi-dieu-khien-tu-dong/them-moi-dieu-kien-thiet-bi-modal/them-moi-dieu-kien-thiet-bi-modal.component';
import { DieuKhienThuCongComponent } from './dieu-khien-thu-cong/dieu-khien-thu-cong.component';
import { TabLichSuDieuKhienComponent } from './tab-lich-su-dieu-khien/tab-lich-su-dieu-khien.component';
import { CapNhatNhomComponent } from './cap-nhat-nhom/cap-nhat-nhom.component';
import { ChonThietBiComponent } from './chon-thiet-bi/chon-thiet-bi.component';
import { ThemMoiNhomComponent } from './them-moi-nhom/them-moi-nhom.component';
import { DieuKhienRemComponent } from './dieu-khien-thu-cong/dieu-khien-rem/dieu-khien-rem.component';
import { ThietLapDkRemComponent } from './dieu-khien-thu-cong/thiet-lap-dk-rem/thiet-lap-dk-rem.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    DieuKhienPageRoutingModule,
    SharedModule
  ],
  declarations: [
    DieuKhienPage,
    PickertimeComponent,
    TabDieuKhienTuDongComponent,
    NhomDieuKhienComponent,
    ThemMoiSuKienModalComponent,
    PickertimeGroupControlComponent,
    ThemMoiRpcModalComponent,
    TabHenGioDieuKhienComponent,
    ThemMoiDieuKienThietBiModalComponent,
    DieuKhienThuCongComponent,
    TabLichSuDieuKhienComponent,
    CapNhatNhomComponent,
    ThemMoiNhomComponent,
    ChonThietBiComponent,
    DieuKhienRemComponent,
    ThietLapDkRemComponent
  ]
})
export class DieuKhienPageModule { }
