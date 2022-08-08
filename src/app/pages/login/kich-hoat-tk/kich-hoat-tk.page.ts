import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavController, ToastController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {CheckUserFirstLoginService} from '../../../core/http/check-user-first-login.service';
import {AuthService} from '../../../core/auth/auth.service';
import {LoginRequest} from '../../../shared/models/login.models';

@Component({
    selector: 'app-kich-hoat-tk',
    templateUrl: './kich-hoat-tk.page.html',
    styleUrls: ['./kich-hoat-tk.page.scss'],
})
export class KichHoatTkPage implements OnInit {
    formKichHoat: FormGroup;
    activeCode;
    dangGuiMa = false;
    emailParam;
    errorStatus: boolean = false;
    messageWarning: string = "";
    constructor(
        private toastCtrl: ToastController,
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private authService: AuthService,
        private checkUserActiveService: CheckUserFirstLoginService
    ) {
        this.formKichHoat = this.fb.group({
            activeCode: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(6)
                ])
            ]
        });
    }

    ngOnInit() {
        this.route.queryParams.subscribe(paramMap => {
            this.emailParam = paramMap.email;
        });
    }

    public kichHoat() {
        if(this.formKichHoat.get('activeCode').value !== ''){
            this.activeCode = this.formKichHoat.get('activeCode').value;
            this.checkUserActiveService.checkActiveCode(this.emailParam, this.activeCode)
                .subscribe(resData => {
                    if (resData === 1) {
                        this.showToastNotify('Kích hoạt thành công', 'success');
                        const loginRequest: LoginRequest = {
                            username: this.emailParam,
                            password: this.checkUserActiveService.getPassword()
                        };
                        this.authService.login(loginRequest).subscribe(loginData => {
                            // console.log('login: ', loginData);
                        });
                    } else {
                        this.messageWarning="Mã kích hoạt không đúng";
                        this.errorStatus = true;
                        // this.showToastNotify('Mã kích hoạt không đúng', 'danger');
                    }
                }, errRes => {
                    if (errRes.status === 404) {
                        this.messageWarning="Email không tồn tại!";
                        this.errorStatus = true;
                        // this.showToastNotify('Tài khoản hoặc mật khẩu không đúng!', 'danger');
                    } else if (errRes.status == 400 && errRes.error === 2){
                        this.messageWarning="Tài khoản là Sysadmin, không thể kích hoạt!"
                        this.errorStatus = true;
                    } else if (errRes.status == 400 && errRes.error === 3){
                        this.messageWarning="Tài khoản đã kích hoạt rồi!";
                        this.errorStatus = true;
                    }else if(errRes.status === 500){
                        this.messageWarning="Kích hoạt không thành công!";
                        this.errorStatus = true;
                    }
                }, () => {
                });
        }else{
            this.formKichHoat.markAsPristine();
            this.messageWarning = "Đây là trường bắt buộc!";
            this.errorStatus=true;
            return;
        }
        
    }

    public guiLaiMa() {
        this.dangGuiMa = true;
        this.sendActiveCode(this.emailParam, this.checkUserActiveService.getPassword());
        setTimeout(() => {
            this.dangGuiMa = false;
        }, 60000);
    }

    public sendActiveCode(email: string, password: string) {

        this.checkUserActiveService.sendActiveCode(email, password)
            .subscribe(resActiveCode => {
                if (resActiveCode) {
                    this.showToastNotify('Vui lòng kiểm tra email để nhận mã kích hoạt', 'success');
                    this.router.navigate(['login', 'kich-hoat-tk'], {queryParams: { email: email }});
                }else {
                    this.showToastNotify('Tài khoản chưa kích hoạt', 'danger');
                }
            }, errRes => {
                if (errRes.status === 400) {
                    this.messageWarning="Tài khoản hoặc mật khẩu rỗng!";
                    this.errorStatus=true;
                }else if (errRes.status === 404) {
                    this.messageWarning="Tài khoản không tồn tại!";
                    this.errorStatus=true;
                } else if (errRes.error === null){
                    this.messageWarning="Mật khẩu không đúng!";
                    this.errorStatus=true;
                } else if (errRes.status == 400 && errRes.error === 1){
                    this.messageWarning="Tài khoản hiện tại đang bị khóa!";
                    this.errorStatus=true;
                } else if (errRes.status == 400 && errRes.error === 2){
                    this.messageWarning="Tài khoản là Sysadmin, không thể kích hoạt!";
                    this.errorStatus=true;
                } else if (errRes.status == 400 && errRes.error === 3){
                    this.messageWarning="Tài khoản đã được kích hoạt!";
                    this.errorStatus=true;
                }else{
                    this.messageWarning="Kích hoạt không thành công!Vui lòng thử lại!";
                    this.errorStatus=true;
                }
            }, () => {
                this.showToastNotify('Vui lòng kiểm tra email để nhận mã kích hoạt', 'success');
            });
        
    }

    public clearInput() {
        this.formKichHoat.reset();
    }

    private showToastNotify(messageInfo: string, colorToast: string) {
        this.toastCtrl.create({
            message: messageInfo,
            color: colorToast,
            duration: 2000
        }).then(toastEl => toastEl.present());
    }
    public goBackHome(){
        this.router.navigateByUrl('/login');
        this.formKichHoat.reset();
    }
}
