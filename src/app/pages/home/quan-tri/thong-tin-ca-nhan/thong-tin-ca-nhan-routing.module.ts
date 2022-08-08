import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThongTinCaNhanPage } from './thong-tin-ca-nhan.page';
import {AuthGuard} from "../../../../core/guards/auth.guard";
import {ConfirmOnExitGuard} from "../../../../core/guards/confirm-on-exit.guard";

const routes: Routes = [
  {
    path: '',
    component: ThongTinCaNhanPage,
    // canDeactivate: [ConfirmOnExitGuard],
    // canActivate: [AuthGuard],
  },
  {
    path: 'doi-mat-khau',
    loadChildren: () => import('./doi-mat-khau/doi-mat-khau.module').then( m => m.DoiMatKhauPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThongTinCaNhanPageRoutingModule {}
