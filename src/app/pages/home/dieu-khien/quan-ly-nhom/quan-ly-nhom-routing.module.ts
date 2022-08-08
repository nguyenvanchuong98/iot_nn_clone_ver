import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuanLyNhomPage } from './quan-ly-nhom.page';

const routes: Routes = [
  {
    path: ':damTomId',
    component: QuanLyNhomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuanLyNhomPageRoutingModule {}
