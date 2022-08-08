import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThongBaoPage } from './thong-bao.page';

const routes: Routes = [
  {
    path: '',
    component: ThongBaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThongBaoPageRoutingModule {}
