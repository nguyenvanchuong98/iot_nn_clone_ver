import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { DanhSachCanhBaoPage } from './danh-sach-canh-bao.page';

const routes: Routes = [
  {
    path: '',
    component: DanhSachCanhBaoPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_GIAMSAT],
    },
  },
  {
    path: 'thiet-lap-luat-canh-bao',
    loadChildren: () => import('./thiet-lap-luat-canh-bao/thiet-lap-luat-canh-bao.module').then(m => m.ThietLapLuatCanhBaoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DanhSachCanhBaoPageRoutingModule { }
