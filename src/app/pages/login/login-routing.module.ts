import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LoginPage} from './login.page';

const routes: Routes = [
    {
        path: '',
        component: LoginPage
    },
    {
        path: 'quen-mat-khau',
        loadChildren: () => import('./quen-mat-khau/quen-mat-khau.module').then(m => m.QuenMatKhauPageModule)
    },
    {
        path: 'kich-hoat-tk',
        loadChildren: () => import('./kich-hoat-tk/kich-hoat-tk.module').then(m => m.KichHoatTkPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LoginPageRoutingModule {
}
