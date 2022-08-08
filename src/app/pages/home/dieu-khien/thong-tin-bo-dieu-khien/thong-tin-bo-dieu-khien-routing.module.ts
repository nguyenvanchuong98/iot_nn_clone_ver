import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConfirmOnExitGuard } from 'src/app/core/guards/confirm-on-exit.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { ThongTinBoDieuKhienPage } from './thong-tin-bo-dieu-khien.page';

const routes: Routes = [
  {
    path: ':damTomId/:rpcId/:status',
    component: ThongTinBoDieuKhienPage,
    canDeactivate: [ConfirmOnExitGuard],
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DIEUKHIEN],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThongTinBoDieuKhienPageRoutingModule { }
