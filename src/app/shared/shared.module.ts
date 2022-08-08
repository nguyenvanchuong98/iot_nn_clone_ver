import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CapNhapNhomComponent } from './components/cap-nhap-nhom/cap-nhap-nhom.component';
import { DftIonSelectComponent } from './components/dft-ion-select/dft-ion-select.component';
import { FooterInforComponent } from './components/footer-infor/footer-infor.component';
import { ThemMoiNhomComponent } from './components/them-moi-nhom/them-moi-nhom.component';
import { UploadAvatarComponent } from './components/upload-avatar/upload-avatar.component';
import { MinValueDirective } from './directives/minimum.directive';
import { TrimDirective } from './directives/trim.directive';

@NgModule({
    imports: [
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        CommonModule
    ],
    declarations: [
        TrimDirective,
        MinValueDirective,
        DftIonSelectComponent,
        FooterInforComponent,
        CapNhapNhomComponent,
        ThemMoiNhomComponent,
        UploadAvatarComponent
    ],
    exports: [
        TrimDirective,
        MinValueDirective,
        DftIonSelectComponent,
        FooterInforComponent,
        UploadAvatarComponent
    ]
})
export class SharedModule {}
