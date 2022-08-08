import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { Subject } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { RoleService } from 'src/app/core/services/role.service';
import { Role } from 'src/app/shared/models/role.model';
import { escapedHTML } from 'src/app/shared/utils';
import { ReportScheduleService } from 'src/app/core/services/report-schedule.service';
import { IonContent } from '@ionic/angular';

export interface CustomMap {
  key: string;
  value: string[];
}

export interface InitPermission {
  name: string;
  title: string;
  completed: boolean;
  nameCtr: string;
  child?: InitPermission[];
}

@Component({
  selector: 'app-thong-tin-vai-tro',
  templateUrl: './thong-tin-vai-tro.page.html',
  styleUrls: ['./thong-tin-vai-tro.page.scss'],
})
export class ThongTinVaiTroPage implements OnInit {
  constructor(
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private activedRouter: ActivatedRoute,
    private roleService: RoleService,
    private router: Router,
    private loadCtrl: LoadingController,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private reportScheduleService: ReportScheduleService
  ) {}
  @ViewChild(IonContent, { static: false })
  content: IonContent;
  isRoleNameExist = false;
  isGoTop = false;
  //
  saveStatus = true;
  // Bật tắt select phân quyền
  // toggle = [true, true, true, true, true]
  toggle = [false, false, false, false, false];
  // Check form dang load
  isLoading = false;
  // permissions nhận đc của role
  receivedPermissions: string[] = [];

  // mảng các key đc tích
  keyArr: string[] = []; // mảng các key đc tích

  // cac gia tri mac dinh :
  // key-permissions map data

  myMap: CustomMap[] = [
    {
      key: 'QL_TK',
      value: [
        'PAGES.USERS',
        'PAGES.USERS.CREATE',
        'PAGES.USERS.EDIT',
        'PAGES.USERS.DELETE',
      ],
    },
    {
      key: 'QL_VAITRO',
      value: [
        'PAGES.ROLES',
        'PAGES.ROLES.CREATE',
        'PAGES.ROLES.EDIT',
        'PAGES.ROLES.DELETE',
      ],
    },
    {
      key: 'QL_DAMTOM',
      value: [
        'PAGES.DAMTOM',
        'PAGES.DAMTOM.CREATE',
        'PAGES.DAMTOM.EDIT',
        'PAGES.DAMTOM.DELETE',
        'PAGES.QLCAMERA.CREATE',
        'PAGES.QLCAMERA.EDIT',
        'PAGES.QLCAMERA.DELETE',
        'PAGES.QLTHIETBI.CREATE',
        'PAGES.QLTHIETBI.EDIT',
        'PAGES.QLTHIETBI.DELETE',
      ],
    },
    // {key: 'QL_TT_CHUNG', value: ['PAGES.DAMTOM', 'PAGES.DAMTOM.CREATE', 'PAGES.DAMTOM.EDIT', 'PAGES.DAMTOM.DELETE']},
    { key: 'GIAM_SAT', value: ['PAGES.GIAMSAT'] },
    { key: 'DIEU_KHIEN', value: ['PAGES.DIEUKHIEN'] },
    { key: 'DL_CAM_BIEN', value: ['PAGES.DLCAMBIEN'] },
    { key: 'TL_LUATCB', value: ['PAGES.TLLUATCANHBAO'] },
    {
      key: 'QL_CAMERA',
      value: [
        'PAGES.GIAMSAT',
        'PAGES.QLCAMERA',
        'PAGES.QLCAMERA.CREATE',
        'PAGES.QLCAMERA.EDIT',
        'PAGES.QLCAMERA.DELETE',
      ],
    },
    {
      key: 'QL_THIETBI',
      value: [
        'PAGES.QLTHIETBI',
        'PAGES.QLTHIETBI.CREATE',
        'PAGES.QLTHIETBI.EDIT',
        'PAGES.QLTHIETBI.DELETE',
      ],
    },
    { key: 'BAO_CAO', value: [''] },
    { key: 'BC_TONGHOP', value: ['PAGES.BAOCAO', 'PAGES.BC_TONGHOP'] },
    { key: 'BC_DLGIAMSAT', value: ['PAGES.BAOCAO', 'PAGES.BC_DLGIAMSAT'] },
    { key: 'BC_CANHBAO', value: ['PAGES.BAOCAO', 'PAGES.BC_CANHBAO'] },
    {
      key: 'BC_KETNOI_CAMBIEN',
      value: ['PAGES.BAOCAO', 'PAGES.BC_KETNOI_CAMBIEN'],
    },
    { key: 'BC_GUITT_CB', value: ['PAGES.BAOCAO', 'PAGES.BC_GUI_TTCB'] },
    {
      key: 'DATLICH_XUATBC',
      value: [
        'PAGES.BAOCAO',
        'PAGES.REPORT.SCHEDULE',
        'PAGES.REPORT.SCHEDULE.CREATE',
        'PAGES.REPORT.SCHEDULE.EDIT',
        'PAGES.REPORT.SCHEDULE.DELETE',
      ],
    },
    { key: 'QUAN_TRI', value: [''] },
    { key: 'LS_TRUYCAP', value: ['PAGES.USERS.ACCESS.HISTORY'] },
  ];
  initPermissions: InitPermission[] = [
    {
      name: 'QUAN_TRI',
      completed: false,
      nameCtr: 'quanTri',
      title: 'Quản trị',
      child: [
        {
          name: 'QL_TK',
          completed: false,
          nameCtr: 'quanLyTaiKhoan',
          title: 'Quản lý tài khoản',
        },
        {
          name: 'QL_VAITRO',
          completed: false,
          nameCtr: 'quanLyVaiTro',
          title: 'Quản lý vai trò',
        },
        {
          name: 'QL_DAMTOM',
          completed: false,
          nameCtr: 'quanLyDamTom',
          title: 'Quản lý nhà vườn',
        },
        {
          name: 'LS_TRUYCAP',
          completed: false,
          nameCtr: 'lichSuTruyCap',
          title: 'Lịch sử truy cập',
        },
      ],
    },
    {
      name: 'GIAM_SAT',
      completed: false,
      nameCtr: 'giamSat',
      title: 'Giám sát',
      child: [
        // {name: 'GIAM_SAT', completed: false, nameCtr: 'giamSat', title: 'Xem Camera'},
        {
          name: 'QL_CAMERA',
          completed: false,
          nameCtr: 'xemCamera',
          title: 'Xem camera',
        },
        {
          name: 'TL_LUATCB',
          completed: false,
          nameCtr: 'tlLuatCanhBao',
          title: 'Thiết lập luật cảnh báo',
        },
        {
          name: 'QL_THIETBI',
          completed: false,
          nameCtr: 'quanLyThietBi',
          title: 'Quản lý thiết bị',
        },
        {
          name: 'DL_CAM_BIEN',
          completed: false,
          nameCtr: 'duLieuCamBien',
          title: 'Xem dữ liệu cảm biến',
        },
      ],
    },
    {
      name: 'DIEU_KHIEN',
      completed: false,
      nameCtr: 'dieuKhien',
      title: 'Điều khiển',
      child: [
        {
          name: 'DIEU_KHIEN',
          completed: false,
          nameCtr: 'dieuKhien',
          title: 'Điều khiển thủ công',
        },
        {
          name: 'DIEU_KHIEN_TU_DONG',
          completed: false,
          nameCtr: 'dieuKhienThuCong',
          title: 'Điều khiển tự động',
        },
        {
          name: 'HEN_GIO',
          completed: false,
          nameCtr: 'henGio',
          title: 'Hẹn giờ',
        },
        {
          name: 'LICH_SU_DIEU_KHIEN',
          completed: false,
          nameCtr: 'lsDieuKhien',
          title: 'Lịch sử điều khiển',
        },
      ],
    },

    {
      name: 'BAO_CAO',
      completed: false,
      nameCtr: 'baoCao',
      title: 'Báo cáo',
      child: [
        {
          name: 'BC_TONGHOP',
          completed: false,
          nameCtr: 'baoCaoTongHop',
          title: 'Báo cáo tổng hợp',
        },
        {
          name: 'BC_DLGIAMSAT',
          completed: false,
          nameCtr: 'baoCaoGiamSat',
          title: 'Báo cáo dữ liệu giám sát',
        },
        {
          name: 'BC_CANHBAO',
          completed: false,
          nameCtr: 'baoCaoCanhBao',
          title: 'Báo cáo cảnh báo',
        },
        {
          name: 'BC_KETNOI_CAMBIEN',
          completed: false,
          nameCtr: 'baoCaoKetNoiCamBien',
          title: 'Báo cáo kết nối cảm biến',
        },
        {
          name: 'BC_GUITT_CB',
          completed: false,
          nameCtr: 'baoCaoThongBao',
          title: 'Báo cáo thông báo',
        },
        {name: 'BC_HDTB', completed: false, nameCtr: 'baoCaoHDTB', title: 'Báo cáo hoạt động thiết bị'}, // Fake_ bổ sung label báo cáo hdtb
        {
          name: 'DATLICH_XUATBC',
          completed: false,
          nameCtr: 'datLichXuatBC',
          title: 'Đặt lịch xuất báo cáo',
        },
      ],
    },
  ];
  id: string;
  form: FormGroup;
  role: Role;
  onThongTin = true;
  // permissions để update, có đc sau khi lọc keyArr
  updatePermissions: string[] = [];

  // key name của checkbox con quản lý đầm tôm
  // damtom = [{ key: 'QL_TT_CHUNG' },
  // { key: 'GIAM_SAT' },
  // { key: 'DIEU_KHIEN' },
  // { key: 'DL_CAM_BIEN' },
  // { key: 'TL_LUATCB' },
  // { key: 'QL_CAMERA' },
  // { key: 'QL_THIETBI' }];

  // key name của checkbox con báo cáo
  // baocao = [{ key: 'BAO_CAO' },
  // { key: 'BC_TONGHOP' },
  // { key: 'BC_DLGIAMSAT' },
  // { key: 'BC_CANHBAO' },
  // { key: 'BC_KETNOI_CAMBIEN' },
  // { key: 'BC_GUITT_CB' }]
  // key name của checkbox con quản lý nhà vườn
  quantri = [
    { key: 'QUAN_TRI' },
    { key: 'QL_TK' },
    { key: 'QL_VAITRO' },
    { key: 'QL_DAMTOM' },
    { key: 'LS_TRUYCAP' },
  ];

  giamsat = [
    { key: 'GIAM_SAT' },
    // { key: 'GIAM_SAT' },
    { key: 'QL_CAMERA' },
    { key: 'TL_LUATCB' },
    { key: 'QL_THIETBI' },
    { key: 'DL_CAM_BIEN' },
  ];

  dieukhien = [{ key: 'DIEU_KHIEN' }, { key: 'DIEU_KHIEN' }];

  xembaocao = [
    { key: 'BAO_CAO' },
    { key: 'BC_TONGHOP' },
    { key: 'BC_DLGIAMSAT' },
    { key: 'BC_CANHBAO' },
    { key: 'BC_KETNOI_CAMBIEN' },
    { key: 'BC_GUITT_CB' },
    { key: 'DATLICH_XUATBC' },
  ];

  ngOnInit() {
    this.activedRouter.params.subscribe((params) => {
      // tslint:disable-next-line: no-string-literal
      const id = params['Id'];
      if (id === null || id === undefined) {
        this.router.navigate(['home', 'quan-tri', 'vai-tro']);
        return;
      }
      this.id = id;
      this.roleService
        .getRoleById(this.id)
        .pipe(
          map((data: Role) => {
            if (data === null || data === undefined) {
              this.router.navigate(['home', 'quan-tri', 'vai-tro']);
              return;
            }

            this.isLoading = true;
            this.role = data;
            this.form = this.fb.group({
              tenVaiTro: [
                data.name,
                [Validators.required, Validators.maxLength(255)],
              ],
              ghiChu: [data.note, [Validators.maxLength(4000)]],
            });

            // init permission list
            for (const p of this.role.permissions) {
              this.receivedPermissions.push(p.name);
            }
            // khởi tạo mảng các key đc tích : keyArr.
            for (const m of this.myMap) {
              if (m.value.every((v) => this.receivedPermissions.includes(v))) {
                this.keyArr.push(m.key);
              }
            }
            // thay đổi giá trị các trường completed trong initPermissions cho phù hợp với các key khởi tạo :
            for (const p of this.initPermissions) {
              if (this.keyArr.includes(p.name)) {
                p.completed = true;
              }
              if (p.child !== null && p.child !== undefined) {
                for (const c of p.child) {
                  if (this.keyArr.includes(c.name)) {
                    c.completed = true;
                  }
                }
                // check xem all child.completed == true => father.completed == true
                if (p.child.every((x) => x.completed === true)) {
                  p.completed = true;
                }
              }
            }
            // khoi tao cac truong du lieu trong FormReactive checkbox Permissions
            for (const p of this.initPermissions) {
              this.form.addControl(p.name, new FormControl(p.completed));
              if (p.child !== null && p.child !== undefined) {
                for (const c of p.child) {
                  this.form.addControl(c.name, new FormControl(c.completed));
                }
              }
            }
          }),
          finalize(() => {
            this.isLoading = false;
          }),
          catchError((error) => {
            console.log(error);
            this.router.navigate(['home', 'quan-tri', 'vai-tro']);
            this.isLoading = false;
            return null;
          })
        )
        .subscribe();
    });
  }

  // Chuyển qua lại giữa 2 segment
  onFilterUpdate(event: Event) {
    this.onThongTin = !this.onThongTin;
  }
  // Bật tắt phân quyền
  togglePhanQuyen() {
    this.onThongTin = !this.onThongTin;
  }
  arrowIcon(i) {
    this.toggle[i] = !this.toggle[i];
  }
  xoaVaiTro() {
    this.alertCtrl
      .create({
        message:
          `Xóa vai trò "` + escapedHTML(this.form.value.tenVaiTro) + `" ? `,
        cssClass: 'my-alert-custom-class',
        // message: escapedHTML(`Xóa Vai Trò "${this.form.value.tenVaiTro}" ? `),
        buttons: [
          {
            text: 'Quay lại',
            role: 'cancel',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              this.loadCtrl
                .create({
                  message: 'Xóa...',
                })
                .then((loadCtr) => {
                  loadCtr.present();

                  this.roleService
                    .deleteRoleById(this.id)
                    .pipe(
                      tap((data) => {
                        // data trả về 0 xóa thất bại
                        if (data === 0) {
                          loadCtr.dismiss();
                          this.toastController.create({
                            duration: 2000,
                            position: 'bottom',
                            color: 'danger',
                            message: 'Xóa thất bại',
                          }).then((toastCtrl) => {
                            toastCtrl.present();
                          });
                          // data trả về 1 xóa thành công
                        } else if (data === 2){
                          loadCtr.dismiss();
                          this.toastController.create({
                            duration: 2000,
                            position: 'bottom',
                            color: 'danger',
                            message: 'Vai trò đang có Tài khoản, không thể xóa!',
                          }).then((toastCtrl) => {
                            toastCtrl.present();
                          });
                        } else if (data === 1) {
                          this.toastController
                            .create({
                              duration: 2000,
                              color: 'success',
                              position: 'bottom',
                              message: 'Xóa thành công',
                            })
                            .then((toastCtrl) => {
                              toastCtrl.present();
                            });
                          loadCtr.dismiss();
                          this.form.markAsPristine();
                          this.router.navigate(['home', 'quan-tri', 'vai-tro']);
                        }
                      }),
                      finalize(() => {}),
                      catchError((error) => {
                        console.log(error);
                        return null;
                      })
                    )
                    .subscribe();
                });
            },
          },
        ],
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }

  updateVaiTro() {
    if (this.form.invalid) {
      this.alertCtrl
        .create({
          message: 'Vui lòng nhập tên vai trò',
          buttons: [
            {
              text: 'Ok',
              role: 'cancel',
            },
          ],
        })
        .then((ell) => {
          ell.present();
        });
    } else {
      this.loadCtrl
        .create({
          message: '',
        })
        .then((el) => {
          el.present();
          for (const p of this.initPermissions) {
            if (this.form.get(p.name).value) {
              this.update_Permissions(p.name);
            }
            if (p.child !== null && p.child !== undefined) {
              for (const c of p.child) {
                if (this.form.get(c.name).value) {
                  this.update_Permissions(c.name);
                }
              }
            }
          }
          this.updatePermissions = this.updatePermissions.filter(
            (value) => value !== ''
          );
          this.role.permissions = [];
          this.updatePermissions.forEach((p) => {
            this.role.permissions.push({ name: p });
          });
          this.role.name = this.form.get('tenVaiTro').value;
          this.role.note = this.form.get('ghiChu').value;
          this.save(this.role, el);
          this.updatePermissions = [];
        });
    }
  }

  save(role: Role, ell) {
    this.roleService
      .saveRole(role)
      .pipe(
        tap((data: Role) => {
          let mess = '';
          const color = 'success';
          let saveStatus = true;
          if (this.id === null || this.id === undefined) {
            // Them mới thành công
            mess = 'Thêm mới thành công';
          } else if (this.id !== null || this.id !== undefined) {
            // cập nhật thành công
            mess = 'Cập nhật thành công';
          }
          if (data.errorInfo !== null && data.errorInfo !== undefined) {
            // Save thất bại
            saveStatus = false;
            if (data.errorInfo.code === 2) {
              this.isRoleNameExist = true;
              return;
            }
          }
          // Tạo Thông báo và chuyển đến trang quản trị vai trò
          this.toastCtrl
            .create({
              message: mess,
              duration: 2000,
              color,
              position: 'bottom',
            })
            .then((el) => {
              el.present();
              if (saveStatus === true) {
                this.form.markAsPristine();
                this.router.navigate(['home', 'quan-tri', 'vai-tro']);
              }
            });
        }),
        finalize(() => {
          ell.dismiss();
        }),
        catchError((error) => {
          return null;
        })
      )
      .subscribe();
  }

  // luu cac Permissions update
  update_Permissions(name: string) {
    for (const data of this.myMap) {
      if (data.key === name) {
        this.updatePermissions = this.updatePermissions.concat(data.value);
        break;
      }
    }
  }

  validCheckBox(pName: string) {
    setTimeout(() => {
      // Chọn checkbox cha => checked all node con
      // if (pName === 'QL_DAMTOM') {
      //   this.damtom.forEach(value => {
      //     this.form.controls[value.key].setValue(this.form.get(pName).value);
      //   })
      // }
      // else if (pName === 'BAO_CAO') {
      //   this.baocao.forEach(value => {
      //     this.form.controls[value.key].setValue(this.form.get(pName).value);
      //   })
      // }
      if (pName === 'QUAN_TRI') {
        this.quantri.forEach((value) => {
          this.form.controls[value.key].setValue(this.form.get(pName).value);
        });
      } else if (pName === 'GIAM_SAT') {
        this.giamsat.forEach((value) => {
          this.form.controls[value.key].setValue(this.form.get(pName).value);
        });
      } else if (pName === 'DIEU_KHIEN') {
        this.dieukhien.forEach((value) => {
          this.form.controls[value.key].setValue(this.form.get(pName).value);
        });
      } else if (pName === 'BAO_CAO') {
        this.xembaocao.forEach((value) => {
          this.form.controls[value.key].setValue(this.form.get(pName).value);
        });
      } else {
        for (const p of this.initPermissions) {
          if (p.child !== null && p.child !== undefined) {
            // Nếu các checkbox con đều checked => checkbox cha checked
            if (
              p.child.every((x) => this.form.controls[x.name].value === true)
            ) {
              this.form.controls[p.name].setValue(true);
            }
            // Nếu các checkbox con có một node không checked => checkbox cha unchecked
            if (
              p.child.some((x) => this.form.controls[x.name].value === false)
            ) {
              this.form.controls[p.name].setValue(false);
            }
          }
        }
      }
    }, 0);
  }
  changeNameVaiTro() {
    this.isRoleNameExist = false;
  }
  scrollToTop() {
    this.content.scrollToTop(0);
  }
  logScrolling(event) {
    if (event.detail.scrollTop === 0) {
      this.isGoTop = false;
    } else {
      this.isGoTop = true;
    }
  }
}
