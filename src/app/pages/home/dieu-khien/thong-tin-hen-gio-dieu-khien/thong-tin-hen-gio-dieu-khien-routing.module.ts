import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConfirmOnExitGuard } from 'src/app/core/guards/confirm-on-exit.guard';

import { ThongTinHenGioDieuKhienPage } from './thong-tin-hen-gio-dieu-khien.page';

const routes: Routes = [
  {
    path: '',
    component: ThongTinHenGioDieuKhienPage,
    canDeactivate: [ConfirmOnExitGuard],
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThongTinHenGioDieuKhienPageRoutingModule {}
