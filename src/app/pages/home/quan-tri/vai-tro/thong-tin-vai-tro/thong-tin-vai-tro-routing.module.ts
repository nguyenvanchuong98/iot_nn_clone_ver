import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConfirmOnExitGuard } from 'src/app/core/guards/confirm-on-exit.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { ThongTinVaiTroPage } from './thong-tin-vai-tro.page';

const routes: Routes = [
  {
    path: ':Id',
    component: ThongTinVaiTroPage,
    canDeactivate: [ConfirmOnExitGuard],
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_ROLES_EDIT],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThongTinVaiTroPageRoutingModule { }
