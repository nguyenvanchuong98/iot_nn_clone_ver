import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { ThietLapLuatCanhBaoPage } from './thiet-lap-luat-canh-bao.page';

const routes: Routes = [
  {
    path: '',
    component: ThietLapLuatCanhBaoPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_TLLUATCANHBAO],
    },
  },
  {
    path: 'them-moi-luat-canh-bao',
    loadChildren: () => import('./them-moi-luat-canh-bao/them-moi-luat-canh-bao.module').then(m => m.ThemMoiLuatCanhBaoPageModule)
  },
  {
    path: 'thong-tin-luat-canh-bao',
    loadChildren: () => import('./thong-tin-luat-canh-bao/thong-tin-luat-canh-bao.module').then(m => m.ThongTinLuatCanhBaoPageModule)
  },  {
    path: 'them-luat-cb',
    loadChildren: () => import('./them-luat-cb/them-luat-cb.module').then( m => m.ThemLuatCbPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThietLapLuatCanhBaoPageRoutingModule { }
