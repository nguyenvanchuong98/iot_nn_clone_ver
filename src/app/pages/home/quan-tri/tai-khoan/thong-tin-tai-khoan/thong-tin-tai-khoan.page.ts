import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, AlertController, LoadingController, IonContent } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { AppState } from 'src/app/core/core.state';
import { UploadService } from 'src/app/core/http/upload.service';
import { RoleService } from 'src/app/core/services/role.service';
import { UsersDftService } from 'src/app/core/services/users-dft.service';
import { AvatarUserResponse } from 'src/app/shared/models/avatar-user.model';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import { Role } from 'src/app/shared/models/role.model';
import { UsersDft, AdditionalInfo } from 'src/app/shared/models/users-dft.model';
import { escapedHTML } from 'src/app/shared/utils';



/**
 * set checked các vai trò của user cho select box
 * @f2 role of user
 * @f1 all role default
 * @returns true for checked và false cho unchecked
 */
const compareWith = (f1, f2) => {
  if (Array.isArray(f2)) {
    if (!f1 || !f1.id) {
      return false;
    }
    return f2.find(val => val && val.id === f1.id);
  }
  return f1 && f2 ? f1.id === f2.id : f1 === f2;
};


const INTERNAL_001 = 'Fail while processing in thingsboard.';
const OK_002 = 'Save user successful in thingsboard.';
const BAD_002 = 'Email đã tồn tại trong hệ thống';
const BAD_003 = 'Số điện thoại đã tồn tại trong hệ thống';
const BAD_004 = 'Fail while save user from thingsboard.';
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
  selector: 'app-thong-tin-tai-khoan',
  templateUrl: './thong-tin-tai-khoan.page.html',
  styleUrls: ['./thong-tin-tai-khoan.page.scss'],
})
export class ThongTinTaiKhoanPage implements OnInit {
  isUserNameExist = false;
  isPhoneNumberExist = false;
  isLoading = false;
  id;
  isEmailExist = false;
  form: FormGroup;
  // Avatar
  avatarUser: AvatarUserResponse;
  avatarBlobUrl;
  imageFile;
  fileName;
  constructor(private roleService: RoleService,
              private activedRouter: ActivatedRoute,
              private usersDftService: UsersDftService,
              private toastCtrl: ToastController,
              private router: Router,
              private alertCtrl: AlertController,
              private loadCtrl: LoadingController,
              private fb: FormBuilder,
              private uploadService: UploadService,
              protected store: Store<AppState>) { }



  // compareFuntion
  cmpFunction = compareWith;

  // Role Selected
  selectedRole: Role[] = [];

  roleName: string;
  listNhaVuon = [];
  // List role of user defalt
  roles: Role[] = [];

  pageLink: PageLink;

  // Sorf order cho Roles
  sortOrder;

  // tăng pageSize khi page.hasNext
  jump = 100;
  savedUser: UsersDft;
  usersDft: UsersDft = new class implements UsersDft {
    // tslint:disable-next-line:new-parens
    createdTime: number;
    email: string;
    active: boolean;
    firstName: string;
    label: string;
    name: string;
    password: string;
    roleEntity: Role[];
    roleId: string[];
    // Bổ sung
    username: string;
    emailLogin: string;
    phone: string;
    authority?: string;
    accountType: string;
    note: string;
  };
  @ViewChild(IonContent) gotoTop: IonContent;
  isGoTop = false;

  ngOnInit() {
    this.activedRouter.params.subscribe(params => {
      const id = params.Id;

      if (id === null || id === undefined) {
        this.router.navigate(['home', 'quan-tri', 'tai-khoan']);
        return;
      }
      this.id = id;
      this.isLoading = true;
      this.usersDftService.getUsersDft(this.id).subscribe(
        user => {
          // if (`${user.phone}@gmail.com` === user.email || user.email === `${user.phone.slice(1)}@gmail.com`) {
          //   this.statusEmail = false;
          //   this.valueEmail = '' ;
          // }
          if (user.userId === null || user.userId === undefined) {
            this.router.navigate(['home', 'quan-tri', 'tai-khoan']);
            return;
          }
          this.usersDft = user;
          // tslint:disable-next-line: no-shadowed-variable
          this.usersDftService.getNhaVuonForUser(this.usersDft.userId).subscribe(user => {
            this.listNhaVuon = user;
          });
          // Get avatar
          this.getUserAvatar();
          this.selectedRole = this.usersDft.roleEntity;
          this.fetchRolesData();
          // //Khởi tạo form và validate
          this.form = this.fb.group({
            name: [this.usersDft.firstName,
            [Validators.required, Validators.required, Validators.maxLength(255)]],
            username: [this.usersDft.username,
              [Validators.required, Validators.required, Validators.maxLength(45)]],
            phoneNumber: [this.usersDft.phone,
            [Validators.required, Validators.maxLength(45), Validators.pattern(/^\s*\+?[0-9\-]{7,45}\s*$/)]],
            email: [this.usersDft.email,
            [Validators.maxLength(320), Validators.pattern(/^\s*[a-zA-Z0-9._-]{1,64}@[a-zA-Z0-9-.]{1,255}\s*$/)]],
            note: [this.usersDft.note, [Validators.maxLength(4000)]],
            role: [this.usersDft.roleId],
            active: [this.usersDft.active]

          });
          this.isLoading = false;
        }
      );
    });
  }

  // Lấy role data cho select box

  fetchRolesData() {
    this.sortOrder = {
      property: 'name',
      direction: Direction.ASC
    };
    this.pageLink = new PageLink(this.jump, 0, '', this.sortOrder);
    this.roleService
      .getTenantRoles(this.pageLink).pipe(
        map(
          (pageData: PageData<Role>) => {
            if (pageData !== null) {

              if (pageData.data.length > 0) {
                // Load all dữ liệu
                // Khi page.hasNext => tăng size of page lên(defalut 100) =>: fetchRolesData();
                if (pageData.hasNext === true) {
                  this.pageLink.pageSize = this.pageLink.pageSize + this.jump;
                  this.fetchRolesData();
                }
                else {// => lấy dữ liệu đổ vào roles
                  this.roles = [];
                  this.roleName = '';
                  this.roles = this.roles.concat(pageData.data);
                  this.selectedRole.forEach(v => {
                    this.roleName += v.name;
                  });
                }
              }
            }
          }
        ))
      .subscribe();
  }
  // cập nhật user
  async saveUser() {
    let mess = '';
    if (this.form.invalid) {
      mess = 'Vui lòng xác nhận các trường dữ liệu bắt buộc';
      this.form.controls.name.markAsTouched();
      this.form.markAsTouched();
    }
    if (mess !== '') {
      this.alertCtrl.create({
        message: mess,
        buttons: [{
          text: 'OK',
          role: 'cancel'
        }]
      }).then(alCtr => {
        alCtr.present();
      });
    }
    else {
      this.loadCtrl.create({
        message: ''
      }).then(el => {
        el.present();
        const role: string[] = [];
        const value = this.form.getRawValue();
        if (value.role !== undefined && value.role !== null) {
          value.role.forEach((element: Role) => {
            role.push(element.id);
          });
        }
        this.usersDft.firstName = value.name?.trim();
        this.usersDft.phone = value.phoneNumber?.trim();
        this.usersDft.roleId = role;
        if (value.email?.trim() !== '') {
          this.usersDft.email = value.email?.trim();
        }
        else {
          if (value.phoneNumber?.trim()[0] === '+') {
            this.usersDft.email = `${value.phoneNumber.slice(1)?.trim()}@gmail.com`;
          }
          else {
            this.usersDft.email = `${value.phoneNumber?.trim()}@gmail.com`;
          }
        }
        if (value.username?.trim() !== ''){
          this.usersDft.username = value.username?.trim();
        }
        this.usersDft.note = value.note?.trim();
        this.usersDft.active = value.active;
        if (this.usersDft.phone.startsWith('+84')) {
          this.usersDft.phone = this.usersDft.phone.replace('+84', '0');
        }
        this.usersDftService.editUsers(this.usersDft).subscribe(
          rp => {
            this.showInfoToast('Cập nhật thành công', 'success', 2000);
            this.form.markAsPristine();
            this.router.navigate(['home', 'quan-tri', 'tai-khoan']);
            el.dismiss();
          },
          err => {
            this.checkResponse(err.error);
            el.dismiss();
          }
        );
      });
    }
  }

  checkResponse(response: any) {
    let message = '';
    let color = '';
    if (response === INTERNAL_001) {
      message = 'Hệ thống hiện tại đang bị lỗi, thử lại sau ít phút';
      color = 'danger';
    } else if (response === BAD_002) {
      this.isEmailExist = true;
      this.form.controls.email.setErrors({ incorrect: true });
      return;
    } else if (response === BAD_003) {
      this.form.controls.phoneNumber.setErrors({ incorrect: true });
      this.isPhoneNumberExist = true;
      return;
    } else {
      message = response;
      message = 'Lỗi không xác định';
      color = 'danger';
    }

    this.showInfoToast(message, color, 2000);
  }

  showInfoToast(message: string, color: string, time: number) {
    this.toastCtrl.create({
      message,
      color,
      duration: time
    }).then(toastCtr => {
      toastCtr.present();

    });
  }

  xoaTaiKhoan() {
    this.alertCtrl.create({
      message: escapedHTML(`Xóa tài khoản " ${this.usersDft.firstName} " ?`),
      cssClass: 'my-alert-custom-class',
      buttons: [{
        text: 'Quay lại',
        role: 'cancel'
      },
      {
        text: 'Xác nhận',
        handler: () => {
          this.deleteUser();
        }
      }]
    }).then(el => {
      el.present();
    });
  }


  deleteUser() {
    this.loadCtrl.create({
      message: 'Xóa...'
    }).then(el => {
      el.present();
      this.usersDftService.deleteUsersDft(this.usersDft.userId).subscribe(
        () => {
          el.dismiss();
          this.form.markAsPristine();
          this.showInfoToast('Xóa thành công!', 'success', 2000);
          this.router.navigate(['home', 'quan-tri', 'tai-khoan']);
        },
        err => {
          el.dismiss();
          if(err.error === 'Không thể xóa tài khoản đang kích hoạt!'){
            this.showInfoToast('Tài khoản đang kích hoạt, không được xóa!', 'danger', 2000);
          } else {
            this.showInfoToast('Xóa thất bại!', 'danger', 2000);
          }
        }
      );
    });
  }


  /**
   * viettd
   * reset place holder chọn vai trò mỗi khi bỏ tích hết vai trò
   */
  clickVaiTro() {
    this.roleName = '';
  }
  changeNumberPhone(event){
    this.isPhoneNumberExist = false;
    // return (/[\s0-9\+]+/.test(event.key) || event.keyCode == 8)
  }
  buttonBack(){
    this.router.navigate(['home', 'quan-tri', 'tai-khoan']);
  }
  handleToggle() {
    this.usersDftService.activeUser(this.usersDft.userId, this.form.getRawValue().active);
  }
  goTop() {
    this.gotoTop.scrollToTop(0);
  }
  logScrolling(event) {
    if (event.detail.scrollTop === 0) {
      this.isGoTop = false;
    } else {
      this.isGoTop = true;
    }
  }

  // Code phan avatar
  getUserAvatar() {
    this.uploadService.getAvatar(this.id).subscribe(resData => {
        this.fileName = resData;
        this.uploadService.getImageDownload(this.id, this.fileName)
            // tslint:disable-next-line: no-shadowed-variable
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
            return;
        }
    } else {
        this.imageFile = imageData;
    }
    // upload and save avatar to server
    if (this.imageFile) {
        const formData = new FormData();
        formData.append('file', this.imageFile);
        this.uploadService.uploadAvatar(formData, this.id).subscribe((resData) => {
            this.fileName = resData;
            this.uploadService.saveAvatarUser(this.fileName, this.id)
                // tslint:disable-next-line: no-shadowed-variable
                .subscribe((resData) => {
                    this.avatarUser = resData;
                    // console.log(this.avatarUser)
                    this.showToastNotify('Cập nhật avatar thành công!', 'success');
                });
        }, errorRes => {
            console.log('errorRes', errorRes);
        }, () => {
            console.log('upload avatar complete');
        });
    }
  }
  private showToastNotify(messOuput: string, colors: string) {
    this.toastCtrl.create({
        message: messOuput,
        duration: 3000,
        color: colors,
    }).then(toastEl => toastEl.present());
  }
}


