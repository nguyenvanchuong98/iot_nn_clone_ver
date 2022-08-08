import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConfirmOnExitGuard } from 'src/app/core/guards/confirm-on-exit.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { ThongTinLuatCanhBaoPage } from './thong-tin-luat-canh-bao.page';

const routes: Routes = [
  {
    path: '',
    component: ThongTinLuatCanhBaoPage,
    canDeactivate: [ConfirmOnExitGuard],
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_TLLUATCANHBAO],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThongTinLuatCanhBaoPageRoutingModule { }
