import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  LoadingController,
  ToastController,
} from '@ionic/angular';
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
import {
  AdditionalInfo,
  UsersDft,
} from 'src/app/shared/models/users-dft.model';

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
  return new Blob(byteArrays, { type: contentType });
}
@Component({
  selector: 'app-them-moi-tai-khoan',
  templateUrl: './them-moi-tai-khoan.page.html',
  styleUrls: ['./them-moi-tai-khoan.page.scss'],
})
export class ThemMoiTaiKhoanPage implements OnInit {
  form: FormGroup;
  isEmailExist = false;
  isPhoneNumberExist = false;
  isGoTop = false;
  // Avatar
  avatarBlobUrl;
  imageFile;
  fileName;
  constructor(
    private roleService: RoleService,
    private usersDftService: UsersDftService,
    private toastCtrl: ToastController,
    private router: Router,
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    private fb: FormBuilder,
    private uploadService: UploadService,
    protected store: Store<AppState>
  ) {}

  showPassword = false;
  passwordToggleIcon = 'ph-eye-closed';

  showConfirmPassword = false;
  confirmPasswordToggleIcon = 'ph-eye-closed';

  // List role of user
  roles: Role[] = [];

  pageLink: PageLink;

  // Sorf order cho Roles
  sortOrder;

  // tăng pageSize khi page.hasNext
  jump = 100;

  savedUser: UsersDft;
  // tslint:disable-next-line: new-parens
  usersDft: UsersDft = new (class implements UsersDft {
    // tslint:disable-next-line: new-parens
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
  })();
  @ViewChild(IonContent) gotoTop: IonContent;

  ngOnInit() {
    this.sortOrder = {
      property: 'name',
      direction: Direction.ASC,
    };
    this.pageLink = new PageLink(this.jump, 0, '', this.sortOrder);
    // Khởi tạo form và validate
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.maxLength(255)]],
        phoneNumber: [
          '',
          [
            Validators.required,
            Validators.maxLength(45),
            Validators.pattern(/^\s*\+?[0-9\-]{7,45}\s*$/),
          ],
        ],
        email: [
          '',
          [
            Validators.maxLength(320),
            Validators.pattern(
              /^\s*[a-zA-Z0-9._-]{1,64}@[a-zA-Z0-9-.]{1,255}\s*$/
            ),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.maxLength(255),
            Validators.pattern(
              /^[^\\sáàảãạăắằẵặâấầẫậđéèẻẽẹêếềễệíìỉĩịóòỏõọốồôộỗơợờớỡúùủũụưứừữựýỳỹỵ ]{6,}$/
            ),
          ],
        ],
        confirmPassword: [
          '',
          [
            Validators.required,
            Validators.maxLength(255),
            Validators.pattern(
              /^[^\\sáàảãạăắằẵặâấầẫậđéèẻẽẹêếềễệíìỉĩịóòỏõọốồôộỗơợờớỡúùủũụưứừữựýỳỹỵ ]{6,}$/
            ),
          ],
        ],
        note: ['', [Validators.maxLength(4000)]],
        role: [],
        active: [true],
      },
      {
        validator: this.checkPasswords('password', 'confirmPassword'),
      }
    );
    this.fetchRolesData();
  }

  // Lấy role data cho select box
  fetchRolesData() {
    this.roleService
      .getTenantRoles(this.pageLink)
      .pipe(
        map((pageData: PageData<Role>) => {
          if (pageData !== null) {
            if (pageData.data.length > 0) {
              // Load all dữ liệu
              // Khi page.hasNext => tăng size of page lên(defalut 100) =>: fetchRolesData();
              if (pageData.hasNext === true) {
                this.pageLink.pageSize = this.pageLink.pageSize + this.jump;
                this.fetchRolesData();
              } else {
                // => lấy dữ liệu đổ vào roles
                this.roles = this.roles.concat(pageData.data);
              }
            }
          }
        })
      )
      .subscribe();
  }

  // thêm mới user
  async addUser() {
    // Flag kiem tra form valid && luu tru message
    let mess = '';
    if (this.form.invalid) {
      mess = 'Vui lòng xác nhận các trường dữ liệu bắt buộc';
      this.form.controls.name.markAsTouched();
      this.form.markAsTouched();
    } else if (!this.checkPasswords('password', 'confirmPassword')) {
      mess = 'Mật khẩu và xác nhận mật khẩu phải giống nhau';
    }
    if (mess !== '') {
      this.alertCtrl
        .create({
          message: mess,
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
            },
          ],
        })
        .then((alCtr) => {
          alCtr.present();
        });
    }
    this.loadCtrl
      .create({
        message: '',
      })
      .then((el) => {
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
        if (value.email?.trim() !== '') {
          this.usersDft.email = value.email?.trim();
        } else {
          if (value.phoneNumber.trim()[0] === '+') {
            this.usersDft.email = `${value.phoneNumber
              .slice(1)
              ?.trim()}@gmail.com`;
          } else {
            this.usersDft.email = `${value.phoneNumber?.trim()}@gmail.com`;
          }
        }
        this.usersDft.password = value.password;
        this.usersDft.roleId = role;
        this.usersDft.note = value.note?.trim();
        this.usersDft.active = value.active;
        if (this.usersDft.phone.startsWith('+84')) {
          this.usersDft.phone = this.usersDft.phone.replace('+84', '0');
        }
        this.usersDftService.createUser(this.usersDft).subscribe(
          (rp) => {
            this.showInfoToast('Thêm mới thành công', 'success', 2000);
            this.form.markAsPristine();
            this.router.navigate(['home', 'quan-tri', 'tai-khoan']);
            el.dismiss();
          },
          (error) => {
            this.checkResponse(error?.error);
            el.dismiss();
          }
        );
      });
  }
  // So sánh password của password và Confirm password
  checkPasswords(password: string, rePassword: string) {
    return (group: FormGroup) => {
      // tslint:disable-next-line:one-variable-per-declaration
      const passwordInput = group.controls[password],
        passwordConfirmationInput = group.controls[rePassword];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    };
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
    this.toastCtrl
      .create({
        message,
        color,
        duration: time,
      })
      .then((toastCtr) => {
        toastCtr.present();
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    if (this.passwordToggleIcon === 'ph-eye-closed') {
      this.passwordToggleIcon = 'ph-eye';
    } else {
      this.passwordToggleIcon = 'ph-eye-closed';
    }
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
    if (this.confirmPasswordToggleIcon === 'ph-eye-closed') {
      this.confirmPasswordToggleIcon = 'ph-eye';
    } else {
      this.confirmPasswordToggleIcon = 'ph-eye-closed';
    }
  }

  buttonBack() {
    this.router.navigate(['/home/quan-tri/tai-khoan']);
  }
  emailChange() {
    this.isEmailExist = false;
  }
  phoneNumberChange() {
    this.isPhoneNumberExist = false;
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
  onAvatarPicked(imageData: string | File) {
    if (typeof imageData === 'string') {
      try {
        this.imageFile = base64toBlob(
          imageData.replace('data:image/jpeg;base64,', ''),
          'image/jpeg/png'
        );
      } catch (error) {
        return;
      }
    } else {
      this.imageFile = imageData;
    }
  }
  private showToastNotify(messOuput: string, colors: string) {
    this.toastCtrl
      .create({
        message: messOuput,
        duration: 3000,
        color: colors,
      })
      .then((toastEl) => toastEl.present());
  }
}
