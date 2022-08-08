import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuanTriMenuPage } from './quan-tri-menu.page';

const routes: Routes = [
  {
    path: '',
    component: QuanTriMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuanTriMenuPageRoutingModule {}
