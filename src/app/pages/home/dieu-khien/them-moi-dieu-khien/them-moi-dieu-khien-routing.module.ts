import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThemMoiDieuKhienPage } from './them-moi-dieu-khien.page';

const routes: Routes = [
  {
    path: ':Id/:State',
    component: ThemMoiDieuKhienPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemMoiDieuKhienPageRoutingModule {}
