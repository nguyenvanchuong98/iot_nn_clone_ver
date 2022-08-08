import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HoatDongCuaThietBiPage } from './hoat-dong-cua-thiet-bi.page';

const routes: Routes = [
  {
    path: '',
    component: HoatDongCuaThietBiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HoatDongCuaThietBiPageRoutingModule {}
