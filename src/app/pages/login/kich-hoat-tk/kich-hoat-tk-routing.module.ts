import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KichHoatTkPage } from './kich-hoat-tk.page';

const routes: Routes = [
  {
    path: '',
    component: KichHoatTkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KichHoatTkPageRoutingModule {}
