import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DuLieuGiamSatPage } from './du-lieu-giam-sat.page';

const routes: Routes = [
  {
    path: '',
    component: DuLieuGiamSatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DuLieuGiamSatPageRoutingModule {}
