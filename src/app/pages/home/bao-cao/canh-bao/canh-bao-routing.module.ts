import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CanhBaoPage } from './canh-bao.page';

const routes: Routes = [
  {
    path: '',
    component: CanhBaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CanhBaoPageRoutingModule {}
