import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConfirmOnExitGuard } from 'src/app/core/guards/confirm-on-exit.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { ThongTinDamTomPage } from './thong-tin-dam-tom.page';

const routes: Routes = [
  {
    path: ':id',
    component: ThongTinDamTomPage,
    canDeactivate: [ConfirmOnExitGuard],
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DAMTOM_EDIT],
    },
  },
  {
    path: ':id/them-moi-camera',
    loadChildren: () => import('./them-moi-camera/them-moi-camera.module').then(m => m.ThemMoiCameraPageModule),

  },
  {
    path: ':id/thong-tin-camera/:cameraId',
    loadChildren: () => import('./thong-tin-camera/thong-tin-camera.module').then(m => m.ThongTinCameraPageModule),
  },
  {
    path: ':id/them-moi-bo-thiet-bi',
    loadChildren: () => import('./them-moi-bo-thiet-bi/them-moi-bo-thiet-bi.module').then(m => m.ThemMoiBoThietBiPageModule),
  },
  {
    path: ':id/thong-tin-bo-thiet-bi/:boThietBiId',
    loadChildren: () => import('./thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.module').then(m => m.ThongTinBoThietBiPageModule),
  },
  {
    path: ':id/them-moi-quan-ly',
    loadChildren: () => import('./them-moi-quan-ly/them-moi-quan-ly.module').then(m => m.ThemMoiQuanLyPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThongTinDamTomPageRoutingModule { }
