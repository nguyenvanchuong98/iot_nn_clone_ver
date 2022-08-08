import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConfirmOnExitGuard } from 'src/app/core/guards/confirm-on-exit.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { ThemMoiLichXuatBaoCaoPage } from './them-moi-lich-xuat-bao-cao.page';

const routes: Routes = [
  {
    path: '',
    component: ThemMoiLichXuatBaoCaoPage,
    canDeactivate: [ConfirmOnExitGuard],
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DATLICH_XUATBC_CREATE],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemMoiLichXuatBaoCaoPageRoutingModule { }
