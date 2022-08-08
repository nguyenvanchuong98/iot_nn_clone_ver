import {Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input} from '@angular/core';
import {ActionSheetController, AlertController, LoadingController, Platform, ToastController} from '@ionic/angular';
import {UserService} from '../../../../core/http/user.service';
import {Store} from '@ngrx/store';
import {getCurrentAuthUser} from 'src/app/core/auth/auth.selectors';
import {AppState} from 'src/app/core/core.state';
import {AuthUser} from 'src/app/shared/models/user.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../../core/auth/auth.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {UploadService} from '../../../../core/http/upload.service';
import {AvatarUserResponse} from '../../../../shared/models/avatar-user.model';
import {log} from 'util';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import { RoleService } from '../../../../core/services/role.service';
import { IonContent } from '@ionic/angular';
import { UsersDftService } from 'src/app/core/services/users-dft.service';
import { UsersDft } from 'src/app/shared/models/users-dft.model';
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
    selector: 'app-thong-tin-ca-nhan',
    templateUrl: './thong-tin-ca-nhan.page.html',
    styleUrls: ['./thong-tin-ca-nhan.page.scss'],
})
export class ThongTinCaNhanPage implements OnInit {
    @ViewChild(IonContent, { static: false })
    content: IonContent;
    authUser: AuthUser;
    formUser: FormGroup;
    userInfo: UsersDft;
    imageFile;
    fileName;
    avatarUser: AvatarUserResponse;
    avatarBlobUrl;
    isFetching = false;
    isPhoneExist = false;
    isEmailExist = false;
    isRoleExit = false;
    closed$ = new Subject<any>();
    isUpdateUser = false;
    fontWeight = 'normal';
    isGoTop = false;

    // switch mode
    darkMode = false;

    constructor(
        private actionSheetCtrl: ActionSheetController,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        private router: Router,
        private userService: UserService,
        private usersDftService: UsersDftService,
        private authService: AuthService,
        private uploadService: UploadService,
        protected store: Store<AppState>,
        private ativatedRoute: ActivatedRoute,
        private roleService: RoleService
    ) {
    }

    ngOnInit() {
        this.createFormUser();

        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            takeUntil(this.closed$)
        ).subscribe(event => {
            // tslint:disable-next-line: no-string-literal
            if (event['urlAfterRedirects'].indexOf('/home/quan-tri/thong-tin-ca-nhan') >= 0) {
                this.authUser = getCurrentAuthUser(this.store);
                this.getUserInfor();
                this.getUserAvatar();
            }
        });
    }

    createFormUser() {
        this.formUser = new FormGroup({
            firstName: new FormControl({value: '', disabled: true}, {
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            userName: new FormControl({value: '', disabled: true}, {
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            role: new FormControl('', {
                validators: [Validators.maxLength(255)]
            }),
            phoneNumber: new FormControl('', {
                validators: [
                    Validators.required,
                    // Validators.pattern('[\\]^\\+?[0-9]{6,}$'),
                    Validators.pattern(/^\s*\+?[0-9\-]{6,45}\s*$/)
                    // Validators.maxLength(45)
                ]
            }),
            // email: new FormControl({disabled: true}),
            email: new FormControl('', {
                validators: [
                    Validators.required,
                    Validators.email,
                    Validators.maxLength(255),
                    Validators.pattern('[a-z0-9_.-]+(?:\\.[a-z0-9_.-])*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?')
                ]
            }),
        });
    }

    getUserInfor() {
        this.isFetching = true;
        this.userInfo = null;
        this.usersDftService.getUsersDft(this.authUser.userId).subscribe((user) => {
            this.formUser.get('firstName').setValue(user.firstName);
            // if (user.authority !== 'TENANT_ADMIN') {
            //     this.formUser.get('firstName').disable();
            // }
            this.formUser.get('userName').setValue(user.username);
            this.formUser.get('phoneNumber').setValue(user.phone);
            this.formUser.get('email').setValue(user.email);
            // if (user.email == `${user.phone}@gmail.com` || user.email == `${user.phone.slice(1)}@gmail.com`) {
            //     this.formUser.get('email').setValue("");
            //     this.statusEmail = false
            // }
            // else {
            //     this.statusEmail = true
            // }
            this.userInfo = user;
            if (user.hasOwnProperty('authority') && user.authority === 'TENANT_ADMIN') {
                this.formUser.get('role').setValue('Chủ Nhà Vườn');
                // this.fontWeight = "700"
            }
            else {
                this.roleService.getRoleIdByUserId(user.userId).subscribe(roles => {
                    if (roles.length === 0) {
                        this.formUser.get('role').setValue('Không có vai trò');
                    }
                    else {
                        let role = '';
                        for (let i = 0; i < roles.length; i ++) {
                            role += roles[i];
                            if (i < roles.length - 1) {
                                role += ', ';
                            }
                        }
                        this.formUser.get('role').setValue(role);
                    }
                });
            }
        }, (errorRes) => {
            console.log('error fetching data user', errorRes);
        }, () => {
            this.isFetching = false;
        });

    }

    getUserAvatar() {
        this.uploadService.getAvatar(this.authUser.userId).subscribe(resData => {
            this.fileName = resData;
            this.uploadService.getImageDownload(this.authUser.userId, this.fileName)
                .subscribe(res => {
                    this.createImageFromBlob(res);
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
            this.uploadService.uploadAvatar(formData, this.authUser.userId).subscribe((resData) => {
                this.fileName = resData;
                this.uploadService.saveAvatarUser(this.fileName, this.authUser.userId)
                    // tslint:disable-next-line: no-shadowed-variable
                    .subscribe((resData) => {
                        this.avatarUser = resData;
                        // console.log(this.avatarUser)
                        this.showToastNotify('Cập nhật avatar thành công!', 'success');
                    });
            }, errorRes => {
                console.log('errorRes', errorRes);
            }, () => {
            });
        }
    }

    async updateUser() {
        this.isUpdateUser = true;
        this.userInfo.firstName = this.formUser.get('firstName').value.trim();
        this.userInfo.phone = this.formUser.get('phoneNumber').value.trim();
        this.userInfo.email = this.formUser.get('email').value.trim();
        if (this.formUser.get('email').value.trim() !== '') {
            this.userInfo.email = this.formUser.get('email').value.trim();
          }
        else {
            if (this.formUser.get('phoneNumber').value.trim()[0] === '+') {
              this.userInfo.email = `${this.formUser.get('phoneNumber').value.slice(1).trim()}@gmail.com`;
            }
            else {
              this.userInfo.email = `${this.formUser.get('phoneNumber').value.trim()}@gmail.com`;
            }
          }
        if (this.userInfo.phone.startsWith('+84')) {
            this.userInfo.phone = this.userInfo.phone.replace('+84', '0');
        }
        const loading = await this.loadingCtrl.create({
            message: ''
        });
        this.usersDftService.editOnlyInforUser(this.userInfo).subscribe((res) => {
            // fetch lai user info
            loading.present();

            this.usersDftService.getUsersDft(this.authUser.userId).subscribe(user => {
                this.formUser.get('firstName').setValue(user.firstName);
                // if (user.authority !== 'TENANT_ADMIN') {
                //     this.formUser.get('firstName').disable();
                // }
                this.formUser.get('userName').setValue(user.username);
                this.formUser.get('phoneNumber').setValue(user.phone);
                this.formUser.get('email').setValue(user.email);

                this.userInfo = user;
            }, (errorRes) => {
                console.log('error fetching data user', errorRes);
            });
            this.router.navigateByUrl('/home/quan-tri/thong-tin-ca-nhan');
        }, errorRes => {
            console.log('err----------------', errorRes);
            if (errorRes.error === 'java.lang.String cannot be cast to org.thingsboard.server.dao.model.sql.UserEntity') {
                this.isPhoneExist = true;
            }
            loading.dismiss();
        }, () => {
            this.showToastNotify('Cập nhật thành công!', 'success');
            this.formUser.markAsPristine();
            loading.dismiss();
        });
    }
    cancelUpdate(){
        this.isPhoneExist = false;
        this.usersDftService.getUsersDft(this.authUser.userId).subscribe(user => {
            this.formUser.get('firstName').setValue(user.firstName);
            // if (user.authority !== 'TENANT_ADMIN') {
            //     this.formUser.get('firstName').disable();
            // }
            this.formUser.get('userName').setValue(user.username);
            this.formUser.get('phoneNumber').setValue(user.phone);
            this.formUser.get('email').setValue(user.email);

            this.userInfo = user;
        }, (errorRes) => {
            console.log('error fetching data user', errorRes);
        });
    }

    changeNumberPhone(event){
        this.isPhoneExist = false;
        return (/[\s0-9\+]+/.test(event.key) || event.keyCode === 8);
    }
    changeEmail(event) {
        this.isEmailExist = false;
    }
    private showToastNotify(messageInfo: string, colorToast: string) {
        this.toastCtrl.create({
            message: messageInfo,
            duration: 2000,
            color: colorToast,
        }).then(toastEl => toastEl.present());
    }

    buttonBack(){
        if (this.formUser.dirty && !this.isUpdateUser){
            this.formUser.markAsUntouched();
            return new Promise<boolean>(async (resolve) => {
                const alert = await this.alertCtrl.create({
                    header: 'Bạn chắc chắn muốn Huỷ?',
                    message: 'Tất cả dữ liệu sẽ không được lưu',
                    buttons: [
                        {
                            text: 'Huỷ bỏ',
                            role: 'cancel',
                            handler: () => {
                                resolve(false);
                            }
                        }, {
                            text: 'Xác nhận',
                            handler: () => {
                                resolve(true);
                                this.router.navigate(['/home/quan-tri/menu']);
                            }
                        }
                    ]
                });
                await alert.present();
            });
        }else{
            this.router.navigate(['/home/quan-tri/menu']);
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
            this.isGoTop = true;
        }
    }
    switchMode(event) {
        this.darkMode = !this.darkMode;
        if (this.darkMode) {
            document.body.setAttribute('color-theme', 'dark');
        } else {
            document.body.setAttribute('color-theme', 'light');
        }
    }
}
