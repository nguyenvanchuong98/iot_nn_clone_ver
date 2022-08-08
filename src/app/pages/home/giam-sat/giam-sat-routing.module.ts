import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { GiamSatPage } from './giam-sat.page';

const routes: Routes = [
  {
    path: '',
    component: GiamSatPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_GIAMSAT],
    },
  },
  {
    path: 'danh-sach-canh-bao',
    loadChildren: () => import('./danh-sach-canh-bao/danh-sach-canh-bao.module').then(m => m.DanhSachCanhBaoPageModule)
  },
  {
    path: 'du-lieu-cam-bien',
    loadChildren: () => import('./du-lieu-cam-bien/du-lieu-cam-bien.module').then(m => m.DuLieuCamBienPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GiamSatPageRoutingModule { }
