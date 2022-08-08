import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThongTinDieuKhienThuCongPage } from './thong-tin-dieu-khien-thu-cong.page';

const routes: Routes = [
  {
    path: '',
    component: ThongTinDieuKhienThuCongPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThongTinDieuKhienThuCongPageRoutingModule {}
