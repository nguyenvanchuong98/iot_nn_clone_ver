import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AlertController, LoadingController, NavController, ToastController} from '@ionic/angular';
import {AuthService} from 'src/app/core/auth/auth.service';
import {CheckUserFirstLoginService} from '../../core/http/check-user-first-login.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
    formDangNhap: FormGroup;
    showPassword = false;
    passwordToggleIcon = 'eye-off';
    inputUsernameStatus: string ='valid';
    formIsInvalid;
    passwordEmpty;
    accountEmpty;
    messageWarning: string = "";
    errorUsernamePassword = false;
    // loading;
    taiKhoan;
    preAccount: string = ""
    constructor(
        private router: Router,
        private navCtrl: NavController,
        private loadingCtrl: LoadingController,
        private authService: AuthService,
        private checkUserActiveService: CheckUserFirstLoginService,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private fb: FormBuilder
    ) {
        this.formDangNhap = fb.group({
            tk: [
                this.authService.getPrevAccount(),
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(320),
                    // Validators.pattern(
                    //     /^[\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,}$/
                    // )
                ])
            ],
            mk: ['', [Validators.required,
                Validators.minLength(6),
                Validators.maxLength(255),
                Validators.pattern('^[^\\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$')]],
            luuDangNhap: [false]
        });
    }

    ngOnInit() {
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
        if (this.passwordToggleIcon === 'eye-off') {
            this.passwordToggleIcon = 'eye';
        } else {
            this.passwordToggleIcon = 'eye-off';
        }
    }

    async DangNhap() {
        // remove data giamSatDamtoms
        localStorage.removeItem('giamSatDamtoms');
        // remove data dieuKhienDamToms
        localStorage.removeItem('dieuKhienDamtoms');
        localStorage.removeItem('idDamNow');

        // console.log(this.formDangNhap.get('tk').value)
        // console.log(this.formDangNhap.get('mk').value.length)
        // this.loading = await this.loadingCtrl.create({
        //     message: 'Đăng nhập...'
        // });
        // this.loading.present();
        if(this.formDangNhap.get('tk').valid && this.formDangNhap.get('mk').valid){
            // this.loading = await this.loadingCtrl.create({
            //     message: 'Đăng nhập...'
            // });
            // this.loading.present();
        }
        
        if (this.formDangNhap.get('tk').value == null) {
            this.accountEmpty = true;
            // this.loading.dismiss();
            //this.passwordEmpty = false;
            // console.log('null')
        } else if (this.formDangNhap.get('mk').value.length == 0) {
            this.passwordEmpty = true;
            // this.loading.dismiss();
            // this.accountEmpty = false;
        } 
        else {
            const taiKhoan = this.formDangNhap.value.tk.toLowerCase().trim();
            const matKhau = this.formDangNhap.get('mk').value;
            // console.log("tk = ", typeof taiKhoan, "\nmk = ", typeof matKhau)
            this.login(taiKhoan, matKhau);
        }

        // this.taiKhoan = this.formDangNhap.value.tk.toLowerCase().trim();
        // console.log(typeof this.formDangNhap.value.tk)
        // const matKhau = this.formDangNhap.get('mk').value;
        // this.login(this.taiKhoan, matKhau);
    }

    // authenticate(username: string, password: string) {
    //     if(username.length > 0 && password.length > 0){
    //         this.checkUserActiveService.checkUserFirstActive(username, password)
    //             .subscribe(resData => {
    //                 this.errorUsernamePassword = false;
    //                 console.log('check first login: ', resData);
    //                 if (resData) {
    //                     this.login(username, password);
    //                 } else {
    //                     // this.loading.dismiss();
    //                     this.showAlertKichHoat(username, password);
    //                     this.checkUserActiveService.setPassword(password);
    //                 }
    //             }, errRes => {
    //                 console.log(errRes);
    //                 if (errRes.status === 404){
    //                     // this.loading.dismiss();
    //                     this.messageWarning = "Tài khoản hoặc mật khẩu không đúng!";
    //                     this.errorUsernamePassword = true;
    //                     // this.showToastNotify('Tài khoản hoặc mật khẩu không đúng!', 'danger');
    //                 }else if (errRes.error === null){
    //                     // this.loading.dismiss();
    //                     this.messageWarning = "Tài khoản hoặc mật khẩu không đúng!";
    //                     this.errorUsernamePassword = true;
    //                     // this.showToastNotify('Tài khoản hoặc mật khẩu không đúng!', 'danger');
    //                 }else if (errRes.error === 1){
    //                     // this.loading.dismiss();
    //                     this.errorUsernamePassword = true;
    //                     this.messageWarning = "Tài khoản hiện tại đang bị khóa!";
    //                     // this.showToastNotify('Tài khoản hiện tại đang bị khóa!', 'danger');
    //                 }else if(errRes.status === 500){
    //                     // this.loading.dismiss();
    //                     this.errorUsernamePassword = true;
    //                     this.messageWarning = "Lỗi Server! Đăng nhập không thành công!1";
    //                     // this.showToastNotify('Lỗi Server! Đăng nhập không thành công!', 'danger');
    //                 }else{
    //                     // this.loading.dismiss();
    //                     this.errorUsernamePassword = true;
    //                     this.messageWarning = "";
    //                 }
    //             }, () => {
    //                 // this.loading.dismiss();
    //                 console.log('complete check login');
    //             });
    //     }
    // }

    async login(username: string, password: string) {
        const rememberLoggin = this.formDangNhap.get('luuDangNhap').value;
        this.authService.setPrevAccount(username)
        
        // trungdt - Lưu đăng nhập
        this.authService.setAutoLogin(rememberLoggin);

        this.authService.login({username, password}).subscribe(
            (resData) => {
                // this.loading.dismiss();
                // console.log('resData login service', resData);
            }, errRes => {
                // this.loading.dismiss();
                this.errorUsernamePassword = true
                this.messageWarning = "Tài khoản hoặc mật khẩu không đúng";
                // console.log(errRes.error.message);
                console.log(errRes.error);
                const messResponse = errRes.error.message;
                let message;
                if (messResponse === 'Tài khoản đăng nhập hoặc mật khẩu không đúng') {
                    // this.loading.dismiss();
                    // message = 'Tên tài khoản hoặc mật khẩu không đúng';
                    this.messageWarning = "Tài khoản hoặc mật khẩu không đúng";
                    // this.errorUsernamePassword = true;
                } else if (messResponse === 'Tài khoản chưa kích hoạt') {
                    // this.loading.dismiss();
                    // message = 'Tài khoản hiện tại đang bị khoá';
                    this.messageWarning = "Tài khoản hiện tại đang bị khoá";
                    // this.errorUsernamePassword = true;
                }else if(errRes.status === 500){
                    // this.loading.dismiss();
                    this.messageWarning = "Lỗi Server! Đăng nhập không thành công!";
                    // this.errorUsernamePassword = true;
                }
                else {
                    // this.loading.dismiss();
                    this.messageWarning = "Có lỗi xảy ra! Đăng nhập không thành công!";
                }
                // this.showToastNotify(message, 'danger');
            }, () => {
                // this.loading.dismiss();
                setTimeout(() => {
                    this.formDangNhap.reset();
                }, 2000);
            }
        );
    }

    private showToastNotify(messageInfo: string, colorToast: string) {
        this.toastCtrl.create({
            message: messageInfo,
            duration: 2000,
            color: colorToast,
        }).then(toastEl => toastEl.present());
    }

    // private showAlertKichHoat(username: string, password: string) {
    //     this.alertCtrl.create({
    //         header: 'Kích hoạt tài tài khoản',
    //         message: 'Vui lòng kích hoạt để đăng nhập!',
    //         cssClass: 'custom-class',
    //         buttons: [
    //             {
    //                 text: 'Huỷ bỏ',
    //                 role: 'cancel',
    //                 cssClass: 'cancelButton',
    //                 handler: () => {
    //                     console.log('huy bo');
    //                 }
    //             },
    //             {
    //                 text: 'Kích hoạt',
    //                 handler: () => {
    //                     this.sendActiveCode(username, password);
    //                 }
    //             }
    //         ]
    //     }).then(alertEl => alertEl.present());
    // }

    // public sendActiveCode(email: string, password: string) {
    //     this.checkUserActiveService.sendActiveCode(email, password)
    //         .subscribe(resActiveCode => {
    //             console.log('resActiveCode: ', resActiveCode);
    //             if (resActiveCode) {
    //                 this.showToastNotify('Vui lòng kiểm tra email để nhận mã kích hoạt', 'success');
    //                 this.router.navigate(['login', 'kich-hoat-tk'], {queryParams: { email: email }});
    //             }else {
    //                 this.showToastNotify('Tài khoản chưa kích hoạt', 'danger');
    //             }
    //         }, errRes => {
    //             if (errRes.status === 404) {
    //                 this.showToastNotify('Tài khoản hoặc mật khẩu không đúng!', 'danger');
    //             } else if (errRes.error === 0){
    //                 this.showToastNotify('Tài khoản hoặc mật khẩu không đúng!', 'danger');
    //             } else if (errRes.error === 1){
    //                 this.showToastNotify('Tài khoản hiện tại đang bị khóa!', 'danger');
    //             } else if (errRes.error === 2){
    //                 this.showToastNotify('Tài khoản là Sysadmin, không thể kích hoạt!', 'danger');
    //                 console.log(errRes)
    //             } else if (errRes.error === 3){
    //                 this.showToastNotify('Tài khoản đã được kích hoạt!', 'danger');
    //             }else if (errRes.status === 400){
    //                 this.showToastNotify('Kích hoạt không thành công!', 'danger');
    //             }else if(errRes.status === 500){
    //                 this.showToastNotify('Kích hoạt không thành công!!', 'danger');
    //             }
    //         }, () => {
    //             this.showToastNotify('Vui lòng kiểm tra email để nhận mã kích hoạt', 'success');
    //         });
    // }

    public clearInput() {
        this.formDangNhap.get('tk').reset();
        this.changeAccount()
    }
    
    public getColorForIcon(){
        if(this.formDangNhap.get('tk').valid){
            this.inputUsernameStatus = 'valid';
            return '#34C759';
        }else if (this.formDangNhap.get('tk').dirty || this.formDangNhap.get('tk').invalid){
            this.inputUsernameStatus = 'invalid';
            return '#D91F2C';
        }
    }
    public changePassword(){
        this.passwordEmpty = false;
        this.errorUsernamePassword = false;
    }
    public changeAccount(){
        if(this.formDangNhap.get('tk').value == null) {
            this.accountEmpty = true;
        }
        else {
            this.accountEmpty = false;
        }
    }
    public luuDangNhapCheckBox(){
        this.authService.getAutoLogin();
    }
}
