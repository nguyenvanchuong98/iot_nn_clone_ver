import {Component, OnInit} from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/auth/auth.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-quen-mat-khau',
    templateUrl: './quen-mat-khau.page.html',
    styleUrls: ['./quen-mat-khau.page.scss'],
})
export class QuenMatKhauPage implements OnInit {
    formResetPass: FormGroup;
    messOutput;
    colorNotify;
    errorAccount: boolean;
    messageWarning = "";
    constructor(
        private authService: AuthService,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.formResetPass = this.fb.group({
            sdtOrEmail: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(320),
                    // Validators.pattern(
                    //     /^[\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,}$/
                    // )
                ])
            ]
        });
    }

    ngOnInit() {
    }
    
    async confirmResetPass() {
        // if((this.formResetPass.get('sdtOrEmail').value.trim().length == 0 && this.formResetPass.pristine)){
        if(this.formResetPass.get('sdtOrEmail').value == null || this.formResetPass.get('sdtOrEmail').value.trim().length == 0){
            this.errorAccount = true;
            this.messageWarning="Đây là trường bắt buộc!";
            return;
        }
        // else if(this.formResetPass.invalid ){
        //     return;
        // }
        else{
            this.authService.sendResetPasswordLink(this.formResetPass.get('sdtOrEmail').value.toLowerCase().trim())
                .subscribe((resData) => {
                    // console.log('resData form forget password', resData);
                }, errRes => {
                    console.log('error', errRes);
                    const statusError = errRes.error.status;
                    if (statusError === 400) {
                        this.errorAccount = true;
                        this.messageWarning="Nhập SĐT hoặc Email của bạn!"
                    } else if (errRes.error === '1'){
                        this.errorAccount = true;
                        this.messageWarning="SĐT hoặc Email của bạn không đúng!"
                    }
                     else if (errRes.error === '2'){
                        this.errorAccount = true;
                        this.messageWarning="Tài khoản Sysadmin, không thể reset mật khẩu!"
                    } else {
                        this.errorAccount = true;
                        this.messageWarning="Reset mật khẩu không thành công!"
                    }
                }, () => {
                    this.showToastNotify("Vui lòng kiểm tra SĐT hoặc Email để nhận lại mật khẩu mới!");
                });
        }
        
    }

    showToastNotify(messageInfo: string) {
        this.toastCtrl.create({
            color: "success",
            duration: 2000,
            message: messageInfo,
        }).then(toastEl => {
            toastEl.present();
        });
        this.router.navigateByUrl('/login');
    }
    
    showAlertSuccess(){
        this.alertCtrl.create({
            header: 'Kiểm tra hộp thư',
            message: 'Vui lòng kiểm tra Email để nhận lại mật khẩu mới!',
            buttons: [{
                text: 'Xong',
                handler: ()=>{
                    this.router.navigateByUrl('/login');
                }
            }]
        }).then(alertCtrl=>{
            alertCtrl.present();
        })
    }

    public clearInput() {
        this.formResetPass.reset();
    }
    goBackHome(){
        this.router.navigateByUrl('/login');
    }
}
