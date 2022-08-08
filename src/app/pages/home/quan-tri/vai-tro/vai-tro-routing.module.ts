import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { VaiTroPage } from './vai-tro.page';

const routes: Routes = [
  {
    path: '',
    component: VaiTroPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_ROLES],
    },
  },
  {
    path: 'them-moi-vai-tro',
    loadChildren: () => import('./them-moi-vai-tro/them-moi-vai-tro.module').then(m => m.ThemMoiVaiTroPageModule)
  },
  {
    path: 'thong-tin-vai-tro',
    loadChildren: () => import('./thong-tin-vai-tro/thong-tin-vai-tro.module').then(m => m.ThongTinVaiTroPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VaiTroPageRoutingModule { }
