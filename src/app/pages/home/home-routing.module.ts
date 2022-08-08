import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'giam-sat',
        loadChildren: () => import('./giam-sat/giam-sat.module').then(m => m.GiamSatPageModule),
        canActivate: [AuthGuard],
        data: {
          auth: [Authority.TENANT_ADMIN, Authority.PAGES_DAMTOM],
        },
      },
      {
        path: 'dieu-khien',
        loadChildren: () => import('./dieu-khien/dieu-khien.module').then(m => m.DieuKhienPageModule),
        canActivate: [AuthGuard],
        data: {
          auth: [Authority.TENANT_ADMIN, Authority.PAGES_DAMTOM, Authority.PAGES_DIEUKHIEN],
        },
      },
      {
        path: 'camera',
        loadChildren: () => import('./camera/camera.module').then(m => m.CameraPageModule)
      },
      // {
      //   path: 'bao-cao',
      //   loadChildren: () => import('./bao-cao/bao-cao.module').then(m => m.BaoCaoPageModule)
      // },
      {
        path: 'quan-tri',
        loadChildren: () => import('./quan-tri/quan-tri.module').then(m => m.QuanTriPageModule)
      },
      {
        path: '',
        redirectTo: '/home/giam-sat',
        pathMatch: 'full'
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule { }
