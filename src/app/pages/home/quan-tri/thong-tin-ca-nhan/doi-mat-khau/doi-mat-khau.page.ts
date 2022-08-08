import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../../../core/auth/auth.service";
import {AlertController, ToastController} from "@ionic/angular";
import {Router, NavigationEnd} from "@angular/router";
import { AvatarUserResponse } from 'src/app/shared/models/avatar-user.model';
import {getCurrentAuthUser} from 'src/app/core/auth/auth.selectors';
import {AppState} from 'src/app/core/core.state';
import { UploadService } from 'src/app/core/http/upload.service';
import {AuthUser} from 'src/app/shared/models/user.model';
import {filter, takeUntil} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {Subject} from 'rxjs';
import { IonContent } from '@ionic/angular';

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, {type: contentType});
}
@Component({
    selector: 'app-doi-mat-khau',
    templateUrl: './doi-mat-khau.page.html',
    styleUrls: ['./doi-mat-khau.page.scss'],
})
export class DoiMatKhauPage implements OnInit {
    @ViewChild(IonContent, { static: false }) content: IonContent;
    formChangePass: FormGroup;
    messOuput;
    colorNotify = '';
    isPassMatch: boolean;
    isGoTop = false;

    showOldPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;
    oldPassToggleIcon = 'eye-off-outline';
    newPassToggleIcon = 'eye-off-outline';
    confirmPassToggleIcon = 'eye-off-outline';
    avatarUser: AvatarUserResponse;
    avatarBlobUrl;
    imageFile;
    fileName;
    authUser: AuthUser;
    closed$ = new Subject<any>();
    constructor(
        private authService: AuthService,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private router: Router,
        private fb: FormBuilder,
        private uploadService: UploadService,
        protected store: Store<AppState>,
    ) {
    }

    ngOnInit() {
        this.formChangePass = this.fb.group({
            oldPass: ['',
                [Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(255),
                    Validators.pattern('^[^\\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$')]
            ],
            newPass: ['',
                [Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(255),
                    Validators.pattern('^[^\\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$')]
            ],
            confirmPass: ['',
                [Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(255),
                    Validators.pattern('^[^\\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$')]
            ]
        }, {
            validators: this.checkMatchPass('newPass', 'confirmPass')
        })
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            takeUntil(this.closed$)
        ).subscribe(event => {
            if (event['urlAfterRedirects'].indexOf('/home/quan-tri/thong-tin-ca-nhan') >= 0) {
                this.authUser = getCurrentAuthUser(this.store);
                this.getUserAvatar();
            }
        });
    }

    checkMatchPass(controlName: string, matchingControlName: string) {
        return (formGroup: FormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];

            if (matchingControl.errors && !matchingControl.errors.notMatch) {
                // return if another validator has already found an error on the matchingControl
                return;
            }

            // set error on matchingControl if validation not match
            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({notMatch: true});
            } else {
                matchingControl.setErrors(null);
            }
        }
    }

    showOldPass() {
        this.showOldPassword = !this.showOldPassword;
        if (this.oldPassToggleIcon == 'eye-off-outline') {
            this.oldPassToggleIcon = 'eye-outline';
        } else {
            this.oldPassToggleIcon = 'eye-off-outline';
        }
    }

    showNewPass() {
        this.showNewPassword = !this.showNewPassword;
        if (this.newPassToggleIcon == 'eye-off-outline') {
            this.newPassToggleIcon = 'eye-outline';
        } else {
            this.newPassToggleIcon = 'eye-off-outline';
        }
    }

    showConfirmPass() {
        this.showConfirmPassword = !this.showConfirmPassword;
        if (this.confirmPassToggleIcon == 'eye-off-outline') {
            this.confirmPassToggleIcon = 'eye-outline';
        } else {
            this.confirmPassToggleIcon = 'eye-off-outline';
        }
    }

    changePass() {
        let currPass = this.formChangePass.get('oldPass').value;
        let newPass = this.formChangePass.get('newPass').value;

        this.authService.changePassword(currPass, newPass).subscribe(
            (resData) => {
                //to do
            }, errorMes => {
                const messResponse = errorMes.error.message;
                if (messResponse === "Current password doesn't match!") {
                    this.messOuput = 'Mật khẩu hiện tại không đúng!';
                    this.colorNotify = 'danger';
                }else if(errorMes.status === 400){
                    this.messOuput = 'Mật khẩu mới phải khác mật khẩu cũ!';
                    this.colorNotify = 'danger';
                }
                this.showToastNotify(this.messOuput);
            }, () => {
                this.formChangePass.markAsPristine();
                this.messOuput = "Đổi mật khẩu thành công!"
                this.colorNotify = 'success';
                this.showToastNotify(this.messOuput);
                this.formChangePass.reset();
                this.router.navigateByUrl('/home/quan-tri/thong-tin-ca-nhan');
            });

    }

    private showToastNotify(messOuput: string) {
        this.toastCtrl.create({
            message: messOuput,
            duration: 3000,
            color: this.colorNotify,
        }).then(toastEl => toastEl.present());
    }

    getUserAvatar() {
        this.uploadService.getAvatar(this.authUser.userId).subscribe(resData => {
            this.fileName = resData;
            this.uploadService.getImageDownload(this.authUser.userId, this.fileName)
                .subscribe(resData => {
                    this.createImageFromBlob(resData);
                }, errorRes => {
                    console.log('error when download avatar', errorRes);
                }, () => {
                    // console.log('GET observable is now completed');
                });
        });
    }

    createImageFromBlob(avatar: Blob) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            this.avatarBlobUrl = reader.result;
            // console.log('avatarUrl: ',this.avatarBlobUrl);
        }, false);

        if (avatar) {
            const avatarUrl = reader.readAsDataURL(avatar);
        }
    }

    onAvatarPicked(imageData: string | File) {
        if (typeof imageData === 'string') {
            try {
                this.imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64,', ''),
                    'image/jpeg/png');
            } catch (error) {
                console.log('error upload avatar: ', error);
                return;
            }
        } else {
            this.imageFile = imageData;
        }
        // upload and save avatar to server
        if (this.imageFile) {
            const formData = new FormData();
            formData.append('file', this.imageFile);
            this.uploadService.uploadAvatar(formData,this.authUser.userId).subscribe((resData) => {
                this.fileName = resData;
                this.uploadService.saveAvatarUser(this.fileName, this.authUser.userId)
                    // tslint:disable-next-line: no-shadowed-variable
                    .subscribe((resData) => {
                        this.avatarUser = resData;
                        this.colorNotify = 'success'
                        // console.log(this.avatarUser)
                        this.showToastNotify('Cập nhật avatar thành công!');
                    });
            }, errorRes => {
                console.log('errorRes', errorRes);
            }, () => {
            });
        }
    }
    scrollToTop() {
        this.content.scrollToTop(0);
    }
    logScrolling(event){
        if (event.detail.scrollTop === 0){
          this.isGoTop = false;
        }
        else {
          this.isGoTop = true
        }
      }
}
