import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TongHopPage } from './tong-hop.page';

const routes: Routes = [
  {
    path: '',
    component: TongHopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TongHopPageRoutingModule {}
