import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { DamTomPage } from './dam-tom.page';

const routes: Routes = [
  {
    path: '',
    component: DamTomPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DAMTOM],
    },
  },
  {
    path: 'them-moi-dam-tom',
    loadChildren: () => import('./them-moi-dam-tom/them-moi-dam-tom.module').then(m => m.ThemMoiDamTomPageModule),
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DAMTOM_CREATE],
    },
  },
  {
    path: 'thong-tin-dam-tom',
    loadChildren: () => import('./thong-tin-dam-tom/thong-tin-dam-tom.module').then(m => m.ThongTinDamTomPageModule),
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DAMTOM_EDIT],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DamTomPageRoutingModule { }
