import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { LichXuatBaoCaoPage } from './lich-xuat-bao-cao.page';

const routes: Routes = [
  {
    path: '',
    component: LichXuatBaoCaoPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DATLICH_XUATBC],
    },
  },
  {
    path: 'them-moi-lich-xuat-bao-cao',
    loadChildren: () => import('./them-moi-lich-xuat-bao-cao/them-moi-lich-xuat-bao-cao.module').then(m => m.ThemMoiLichXuatBaoCaoPageModule)
  },
  {
    path: 'thong-tin-lich-xuat-bao-cao',
    loadChildren: () => import('./thong-tin-lich-xuat-bao-cao/thong-tin-lich-xuat-bao-cao.module').then(m => m.ThongTinLichXuatBaoCaoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LichXuatBaoCaoPageRoutingModule { }
