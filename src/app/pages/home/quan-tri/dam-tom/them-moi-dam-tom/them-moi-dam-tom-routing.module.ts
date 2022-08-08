import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConfirmOnExitGuard } from 'src/app/core/guards/confirm-on-exit.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { ThemMoiDamTomPage } from './them-moi-dam-tom.page';

const routes: Routes = [
  {
    path: '',
    component: ThemMoiDamTomPage,
    canDeactivate: [ConfirmOnExitGuard],
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DAMTOM_CREATE],
    },
  },
  {
    path: 'them-moi-camera',
    loadChildren: () => import('../thong-tin-dam-tom/them-moi-camera/them-moi-camera.module').then(m => m.ThemMoiCameraPageModule)
  },
  {
    path: 'thong-tin-camera',
    loadChildren: () => import('../thong-tin-dam-tom/thong-tin-camera/thong-tin-camera.module').then(m => m.ThongTinCameraPageModule)
  },
  {
    path: 'them-moi-bo-thiet-bi',
    loadChildren: () => import('../thong-tin-dam-tom/them-moi-bo-thiet-bi/them-moi-bo-thiet-bi.module').then(m => m.ThemMoiBoThietBiPageModule)
  },
  {
    path: 'thong-tin-bo-thiet-bi',
    loadChildren: () => import('../thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.module').then(m => m.ThongTinBoThietBiPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemMoiDamTomPageRoutingModule { }
