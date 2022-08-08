import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { TaiKhoanPage } from './tai-khoan.page';

const routes: Routes = [
  {
    path: '',
    component: TaiKhoanPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_USERS],
    },
  },
  {
    path: 'them-moi-tai-khoan',
    loadChildren: () => import('./them-moi-tai-khoan/them-moi-tai-khoan.module').then(m => m.ThemMoiTaiKhoanPageModule)
  },
  {
    path: 'thong-tin-tai-khoan',
    loadChildren: () => import('./thong-tin-tai-khoan/thong-tin-tai-khoan.module').then(m => m.ThongTinTaiKhoanPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaiKhoanPageRoutingModule { }
