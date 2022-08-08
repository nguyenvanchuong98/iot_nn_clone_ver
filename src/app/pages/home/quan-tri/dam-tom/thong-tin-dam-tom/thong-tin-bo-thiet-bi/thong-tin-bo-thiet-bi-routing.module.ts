import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConfirmOnExitGuard } from 'src/app/core/guards/confirm-on-exit.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { ThongTinBoThietBiPage } from './thong-tin-bo-thiet-bi.page';

const routes: Routes = [
  {
    path: '',
    component: ThongTinBoThietBiPage,
    canDeactivate: [ConfirmOnExitGuard],
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_QLTHIETBI_EDIT],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThongTinBoThietBiPageRoutingModule { }
