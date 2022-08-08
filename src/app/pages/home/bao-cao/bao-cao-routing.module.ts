import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Authority } from 'src/app/shared/models/authority.enum';

import { BaoCaoPage } from './bao-cao.page';

const routes: Routes = [
  {
    path: '',
    component: BaoCaoPage
  },
  {
    path: 'du-lieu-giam-sat',
    loadChildren: () => import('./du-lieu-giam-sat/du-lieu-giam-sat.module').then(m => m.DuLieuGiamSatPageModule),
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_BC_DLGIAMSAT],
    },
  },
  {
    path: 'canh-bao',
    loadChildren: () => import('./canh-bao/canh-bao.module').then(m => m.CanhBaoPageModule),
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_BC_CANHBAO],
    },
  },
  {
    path: 'ket-noi-cam-bien',
    loadChildren: () => import('./ket-noi-cam-bien/ket-noi-cam-bien.module').then(m => m.KetNoiCamBienPageModule),
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_BC_KETNOI_CAMBIEN],
    },
  },
  {
    path: 'thong-bao',
    loadChildren: () => import('./thong-bao/thong-bao.module').then(m => m.ThongBaoPageModule),
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_BC_GUI_TTCB],
    },
  },
  {
    path: 'tong-hop',
    loadChildren: () => import('./tong-hop/tong-hop.module').then(m => m.TongHopPageModule),
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_BC_TONGHOP],
    },
  },
  {
    path: 'lich-xuat-bao-cao',
    loadChildren: () => import('./lich-xuat-bao-cao/lich-xuat-bao-cao.module').then(m => m.LichXuatBaoCaoPageModule)
  },
  {
    path: 'hoat-dong-cua-thiet-bi',
    loadChildren: () => import('./hoat-dong-cua-thiet-bi/hoat-dong-cua-thiet-bi.module').then( m => m.HoatDongCuaThietBiPageModule),
    canActivate: [AuthGuard],
    data: {
      auth: [Authority.TENANT_ADMIN, Authority.PAGES_BAOCAO],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaoCaoPageRoutingModule { }
