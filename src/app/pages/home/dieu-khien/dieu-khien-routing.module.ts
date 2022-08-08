import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { DieuKhienPage } from './dieu-khien.page';

const routes: Routes = [
  {
    path: '',
    component: DieuKhienPage,
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_DIEUKHIEN],
    },
  },
  {
    path: 'them-moi-bo-dieu-khien',
    loadChildren: () => import('./them-moi-bo-dieu-khien/them-moi-bo-dieu-khien.module').then(m => m.ThemMoiBoDieuKhienPageModule)
  },
  // {
  //   path: 'them-moi-dieu-khien',
  //   loadChildren: () => import('./them-moi-dieu-khien/them-moi-dieu-khien.module').then(m => m.ThemMoiDieuKhienPageModule)
  // },
  {
    path: 'thong-tin-bo-dieu-khien',
    loadChildren: () => import('./thong-tin-bo-dieu-khien/thong-tin-bo-dieu-khien.module').then(m => m.ThongTinBoDieuKhienPageModule)
  },
  {
    path: 'them-moi-dieu-khien-tu-dong',
    // tslint:disable-next-line: max-line-length
    loadChildren: () => import('./them-moi-dieu-khien-tu-dong/them-moi-dieu-khien-tu-dong.module').then( m => m.ThemMoiDieuKhienTuDongPageModule)
  },
  {
    path: 'them-moi-hen-gio-dieu-khien',
    // tslint:disable-next-line: max-line-length
    loadChildren: () => import('./them-moi-hen-gio-dieu-khien/them-moi-hen-gio-dieu-khien.module').then( m => m.ThemMoiHenGioDieuKhienPageModule)
  },
  {
    path: 'them-moi-dieu-khien-tu-dong',
    // tslint:disable-next-line: max-line-length
    loadChildren: () => import('./them-moi-dieu-khien-tu-dong/them-moi-dieu-khien-tu-dong.module').then( m => m.ThemMoiDieuKhienTuDongPageModule)
  },
  {
    path: 'thong-tin-dieu-khien-thu-cong',
    // tslint:disable-next-line: max-line-length
    // tslint:disable-next-line: max-line-length
    loadChildren: () => import('./thong-tin-dieu-khien-thu-cong/thong-tin-dieu-khien-thu-cong.module').then( m => m.ThongTinDieuKhienThuCongPageModule)
  }, {
    path: 'thong-tin-hen-gio-dieu-khien',
    // tslint:disable-next-line: max-line-length
    loadChildren: () => import('./thong-tin-hen-gio-dieu-khien/thong-tin-hen-gio-dieu-khien.module').then( m => m.ThongTinHenGioDieuKhienPageModule)
  },
  {
    path: 'thong-tin-dieu-khien-tu-dong',
    // tslint:disable-next-line: max-line-length
    loadChildren: () => import('./thong-tin-dieu-khien-tu-dong/thong-tin-dieu-khien-tu-dong.module').then( m => m.ThongTinDieuKhienTuDongPageModule)
  },
  {
    path: 'quan-ly-nhom',
    loadChildren: () => import('./quan-ly-nhom/quan-ly-nhom.module').then((m) => m.QuanLyNhomPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DieuKhienPageRoutingModule { }
