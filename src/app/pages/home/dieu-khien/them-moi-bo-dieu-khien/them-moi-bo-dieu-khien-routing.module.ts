import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConfirmOnExitGuard } from 'src/app/core/guards/confirm-on-exit.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { ThemMoiBoDieuKhienPage } from './them-moi-bo-dieu-khien.page';

const routes: Routes = [
  {
    path: ':damTomId',
    component: ThemMoiBoDieuKhienPage,
    canDeactivate: [ConfirmOnExitGuard],
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DIEUKHIEN],
    },
  },
  {
    path: 'them-moi-dieu-khien',
    loadChildren: () => import('../them-moi-dieu-khien/them-moi-dieu-khien.module').then(m => m.ThemMoiDieuKhienPageModule),
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
export class ThemMoiBoDieuKhienPageRoutingModule { }
