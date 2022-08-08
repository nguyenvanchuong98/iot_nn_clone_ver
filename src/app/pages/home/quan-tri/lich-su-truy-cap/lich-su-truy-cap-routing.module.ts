import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { LichSuTruyCapPage } from './lich-su-truy-cap.page';

const routes: Routes = [
  {
    path: '',
    component: LichSuTruyCapPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_USERS_ACCESS_HISTORY],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LichSuTruyCapPageRoutingModule { }
