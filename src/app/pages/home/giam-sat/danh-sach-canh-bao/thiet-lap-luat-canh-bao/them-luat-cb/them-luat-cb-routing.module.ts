import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThemLuatCbPage } from './them-luat-cb.page';

const routes: Routes = [
  {
    path: '',
    component: ThemLuatCbPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemLuatCbPageRoutingModule {}
