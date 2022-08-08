import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DoiMatKhauPage } from './doi-mat-khau.page';
import {ConfirmOnExitGuard} from "../../../../../core/guards/confirm-on-exit.guard";

const routes: Routes = [
  {
    path: '',
    component: DoiMatKhauPage,
    canDeactivate: [ConfirmOnExitGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoiMatKhauPageRoutingModule {}
