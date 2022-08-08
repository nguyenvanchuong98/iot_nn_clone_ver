import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThemMoiQuanLyPage } from './them-moi-quan-ly.page';

const routes: Routes = [
  {
    path: '',
    component: ThemMoiQuanLyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemMoiQuanLyPageRoutingModule {}
