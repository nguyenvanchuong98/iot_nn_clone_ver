import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KetNoiCamBienPage } from './ket-noi-cam-bien.page';

const routes: Routes = [
  {
    path: '',
    component: KetNoiCamBienPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KetNoiCamBienPageRoutingModule {}
