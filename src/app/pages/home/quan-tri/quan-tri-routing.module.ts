import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuanTriPage } from './quan-tri.page';

const routes: Routes = [
  {
    path: '',
    component: QuanTriPage,
    children: [
      {
        path: 'menu',
        loadChildren: () =>
          import('./menu/quan-tri-menu.module').then(
            (m) => m.QuanTriMenuPageModule
          ),
      },
      {
        path: '',
        redirectTo: '/home/quan-tri/menu',
        pathMatch: 'full',
      },
    ]
  },
  {
    path: 'thong-tin-ca-nhan',
    loadChildren: () =>
      import('./thong-tin-ca-nhan/thong-tin-ca-nhan.module').then(
        (m) => m.ThongTinCaNhanPageModule
      ),
  },
  {
    path: 'tai-khoan',
    loadChildren: () =>
      import('./tai-khoan/tai-khoan.module').then((m) => m.TaiKhoanPageModule),
  },
  {
    path: 'vai-tro',
    loadChildren: () =>
      import('./vai-tro/vai-tro.module').then((m) => m.VaiTroPageModule),
  },
  {
    path: 'dam-tom',
    loadChildren: () =>
      import('./dam-tom/dam-tom.module').then((m) => m.DamTomPageModule),
  },
  {
    path: 'lich-su-truy-cap',
    loadChildren: () =>
      import('./lich-su-truy-cap/lich-su-truy-cap.module').then(
        (m) => m.LichSuTruyCapPageModule
      ),
  },
  {
    path: 'bao-cao',
    loadChildren: () =>
      import('../bao-cao/bao-cao.module').then((m) => m.BaoCaoPageModule),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuanTriPageRoutingModule {}
