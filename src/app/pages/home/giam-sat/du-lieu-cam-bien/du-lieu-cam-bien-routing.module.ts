import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { DuLieuCamBienPage } from './du-lieu-cam-bien.page';

const routes: Routes = [
  {
    path: '',
    component: DuLieuCamBienPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DLCAMBIEN],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DuLieuCamBienPageRoutingModule { }
