import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import { DeviceSetting } from 'src/app/shared/models/DeviceSetting.model';
import { ListDeviceRpc } from 'src/app/shared/models/dieukhien.model';
import { ThemMoiDieuKhienPage } from '../them-moi-dieu-khien/them-moi-dieu-khien.page';

import { DieuKhienService } from './../../../../core/services/dieu-khien.service';
import { GroupRpcValidators } from './../group-rpc-validators';
import * as moment from 'moment';
import { ThongTinDieuKhienThuCongPage } from '../thong-tin-dieu-khien-thu-cong/thong-tin-dieu-khien-thu-cong.page';
import { GroupRPCService } from 'src/app/core/services/nhom-dieu-khien.service';
import { GroupRpc } from 'src/app/shared/models/group-rpc.model';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-them-moi-bo-dieu-khien',
  templateUrl: './them-moi-bo-dieu-khien.page.html',
  styleUrls: ['./them-moi-bo-dieu-khien.page.scss'],
})
export class ThemMoiBoDieuKhienPage implements OnInit, OnDestroy {
  damTomId: string;
  damTomName: string;
  isLoading = true;
  tenDamTom: string;
  listRPC: ListDeviceRpc[] = [];
  deviName: string;
  form: FormGroup;
  groupRPC: GroupRpc;
  listGroupRPC: GroupRpc[] = [];
  deviceSettingList: DeviceSetting[] = [];
  isExitGCName = false;
  flagThemMoiDk;
  showLstDieuKhien = true;
  iconRpc = {
    DEFAULT: {
      iconOn: 'assets/icon-darkmode/0_Controller_active.png',
      iconOff: 'assets/icon-darkmode/0_Controller_deactive.png',
      iconMkn: 'assets/icon-darkmode/0_Controller_dis.png'
    },
    QUAT_HUT: {
      // iconOn: 'assets/icon-update/4_Quathut_xanh.png',
      // iconOff: 'assets/icon-update/4_Quathut_xam.png',
      // iconMkn: 'assets/icon-update/4_Quathut_mkn.png'
      iconOn: 'assets/icon-darkmode/4_Maychieu_acitve.png',
      iconOff: 'assets/icon-darkmode/4_Maychieu_deactive.png',
      iconMkn: 'assets/icon-darkmode/4_Maychieu_dis.png'
    },
    QUAT_GIO: {
      // iconOn: 'assets/icon-update/5_Quat_xanh.png',
      // iconOff: 'assets/icon-update/5_Quat_xam.png',
      // iconMkn: 'assets/icon-update/5_Quat_disconnected.png'
      iconOn: 'assets/icon-darkmode/5_Quat_active.png',
      iconOff: 'assets/icon-darkmode/5_Quat_deacitve.png',
      iconMkn: 'assets/icon-darkmode/5_Quat_dis.png'
    },
    DIEU_HOA: {
      // iconOn: 'assets/icon-update/7_Dieuhoa_xanh.png',
      // iconOff: 'assets/icon-update/7_Dieuhoa_xam.png',
      // iconMkn: 'assets/icon-update/7_Dieuhoa_mkn.png'
      iconOn: 'assets/icon-darkmode/7_Dieuhoa_active.png',
      iconOff: 'assets/icon-darkmode/7_Dieuhoa_deactive.png',
      iconMkn: 'assets/icon-darkmode/7_Dieuhoa_dis.png'
    },
    REM: {
      // iconOn: 'assets/icon-darkmode/8_Rem_active.png',
      iconOff: 'assets/icon-darkmode/15_remdong_deactive.png',
      iconMkn: 'assets/icon-darkmode/15_remdong_dis.png',
      iconRai: 'assets/icon-darkmode/15_remdong_active.png',
      iconThu: 'assets/icon-darkmode/8_Rem_deactive.png',
    },
    DEN: {
      // iconOn: 'assets/icon-update/6_Den_xanh.png',
      // iconOff: 'assets/icon-update/6_Den_xam.png',
      // iconMkn: 'assets/icon-update/6_Den_mkn.png'
      iconOn: 'assets/icon-darkmode/6_Den_active.png',
      iconOff: 'assets/icon-darkmode/6_Den_deactive.png',
      iconMkn: 'assets/icon-darkmode/6_Den_dis.png'
    },
    MAY_BOM: {
      // iconOn: 'assets/icon-update/10_Maybom_xanh.png',
      // iconOff: 'assets/icon-update/10_Maybom_xam.png',
      // iconMkn: 'assets/icon-update/10_Maybom_mkn.png'
      iconOn: 'assets/icon-darkmode/10_Maybom_active.png',
      iconOff: 'assets/icon-darkmode/10_Maybom_deactive.png',
      iconMkn: 'assets/icon-darkmode/10_Maybom_dis.png'
    },
  };

  // timePredictRem = '00:00:00';

  constructor(
    private activeRoute: ActivatedRoute,
    private giamsatService: GiamSatService,
    private fb: FormBuilder,
    private dieuKhienService: DieuKhienService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private toastCtrl: ToastController,
    public alertController: AlertController,
    private groupRpcValidators: GroupRpcValidators,
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    private nhomDieuKhien: GroupRPCService
  ) {}

  ngOnInit() {
    this.activeRoute.params.subscribe((params) => {
      // tslint:disable-next-line: no-string-literal
      this.damTomId = params['damTomId'];
      // tslint:disable-next-line: no-string-literal
      this.damTomName = params['damTomName'];
      if (this.damTomId === null || this.damTomId === undefined) {
        this.router.navigate(['home', 'quan-tri', 'tai-khoan']);
        return;
      }
      this.form = this.fb.group({
        tenBoDieuKhien: ['', [Validators.required, Validators.maxLength(255)]],
      });
    });
    this.nhomDieuKhien
      .getAllBoDieuKhien(this.damTomId)
      .subscribe((boDieuKhienList) => {
        this.listGroupRPC = boDieuKhienList;
      });
  }

  //   checkNameBoDk() {
  //     if (this.listGroupRPC.find((rpc) => rpc.name === this.form.get('tenBoDieuKhien').value.trim()) != undefined){
  //         this.isExitGCName = true;
  //     }
  //     //trung ten
  //     else this.isExitGCName = false;
  // }
  ionViewWillEnter() {
    this.deviceSettingList = [];
    this.flagThemMoiDk = 'false';
  }
  ionViewWillLeave() {}
  // show toast
  private showToast(message: string, color: string) {
    this.toastCtrl
      .create({
        message,
        color,
        duration: 2000,
      })
      .then((toastEL) => toastEL.present());
  }

  onSubmit(): void {
    this.loadingCtrl.create({ message: '' }).then((loadEl) => {
      loadEl.present();
      this.groupRPC = new GroupRpc();
      this.groupRPC.damTomId = this.damTomId;
      this.groupRPC.groupRpcId = null;
      this.groupRPC.name = this.form.get('tenBoDieuKhien').value.trim();
      this.groupRPC.rpcSettingList = this.deviceSettingList;

      this.nhomDieuKhien.saveGroupRpc(this.groupRPC).subscribe(
        (groupRpc) => {
          this.toastCtrl
            .create({
              message: 'Thêm mới thành công!',
              duration: 2000,
              color: 'success',
            })
            .then((toastEl) => toastEl.present());
          this.form.markAsPristine();
          this.router.navigate(['/home/dieu-khien'], {
            queryParams: { damTomId: this.damTomId },
          });
          loadEl.dismiss();
        },
        (err) => {
          if (err.status === 417) {
            this.isExitGCName = true;
          }
          loadEl.dismiss();
        }
      );
    });
  }
  doRefresh(event) {
    setTimeout(() => {
      this.ngOnInit();
      event.target.complete();
    }, 1000);
  }
  async themMoiDk() {
    const deviceIds = [];
    this.deviceSettingList.forEach((deviceSetting) => {
      deviceIds.push(deviceSetting.deviceId);
    });

    const modal = await this.modalCtrl.create({
      component: ThemMoiDieuKhienPage,
      cssClass: '',
      componentProps: {
        deviceIds,
        damTomId: this.damTomId,
      },
      swipeToClose: true,
    });
    modal.onDidDismiss().then((dataReturn: any) => {

      if (!dataReturn?.data) { return; }
      this.flagThemMoiDk = dataReturn.role;

      const isExistDeviceSetting = this.deviceSettingList.some(
        (data) => data.deviceId === dataReturn.data.device?.deviceId
      );
      // this.timePredictRem = dataReturn.data.timePredictRem;
      if (isExistDeviceSetting) {
        this.toastNotify('Thiết bị điều khiển đã tồn tại', 'success');
        return;
      }
      this.deviceSettingList.unshift(dataReturn.data);
    });
    await modal.present();
  }

  // buttonBack() {
  //   if (this.form.dirty || this.flagThemMoiDk === "true") {
  //     return new Promise<boolean>(async (resolve) => {
  //       const alert = await this.alertController.create({
  //         header: "Bạn chắc chắn muốn Huỷ?",
  //         message: "Tất cả dữ liệu sẽ không được lưu",
  //         buttons: [
  //           {
  //             text: "Huỷ bỏ",
  //             role: "cancel",
  //             handler: () => {
  //               resolve(false);
  //             },
  //           },
  //           {
  //             text: "Xác nhận",
  //             handler: () => {
  //               resolve(true);
  //               this.router.navigate(["/home/dieu-khien"], {
  //                 queryParams: { damTomId: this.damTomId },
  //               });
  //             },
  //           },
  //         ],
  //       });
  //       await alert.present();
  //     });
  //   } else {
  //     this.router.navigate(["/home/dieu-khien"], {
  //       queryParams: { damTomId: this.damTomId },
  //     });
  //   }
  // }
  ngOnDestroy() {}
  async openThongTinDk(deviceSelect: DeviceSetting) {
    const deviceIds = [];

    this.deviceSettingList.forEach((deviceSetting) => {
      deviceIds.push(deviceSetting.deviceId);
    });
    const modal = await this.modalCtrl.create({
      component: ThongTinDieuKhienThuCongPage,
      cssClass: '',
      componentProps: {
        deviceIds,
        deviceSetting: deviceSelect,
        damtomId: this.damTomId,
      },
      swipeToClose: true,
    });
    modal.onDidDismiss().then((dataReturn: any) => {
      if (!dataReturn?.data) { return; }
      this.deviceSettingList.forEach((deviceSetting, index) => {
        if (deviceSetting.deviceId === deviceSelect.deviceId) {
          this.deviceSettingList[index] = dataReturn.data;
        }
      });
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
  }

  deleteDieuKhien(deviceId?: string) {
    if (deviceId !== null) {
      this.deviceSettingList.forEach((deviceSetting, index) => {
        if (deviceSetting.deviceId === deviceId) {
          this.deviceSettingList.splice(index, 1);
        }
      });
    }
  }
  onChangeTrangThaiDK(dkhien: DeviceSetting){
    if (dkhien.valueControl === 0) {
      dkhien.valueControl = 1;
    } else {
      dkhien.valueControl = 0;
    }
    this.form.markAsDirty();
  }
  toggleAccordionList(dieuKhienInput: DeviceSetting){
    dieuKhienInput.openAccordition = !dieuKhienInput.openAccordition;
  }
  convertLongToDate(MILISECONDS: number) {
    const time = new Date(MILISECONDS).toISOString().substr(11, 8).toString();
    // console.log(time);

    time.split(':');
    let hour = time.split(':')[0];
    let minutes = time.split(':')[1];
    let seconds = time.split(':')[2];
    // if (hour !== "00" && minutes !== "00" && seconds !== "00") {
    //   return time;
    // }
    if (hour === '00' && minutes === '00' && seconds === '00') {
      return '0 giây';
    }
    if (hour === '00') {
      hour = '';
    } else {
      hour = hour + ' giờ';
    }
    if (minutes === '00') {
      minutes = '';
    } else {
      minutes = ' ' + minutes + ' phút';
    }
    if (seconds === '00') {
      seconds = '';
    } else {
      seconds = ' ' + seconds + ' giây';
    }

    // return  new Date(MILISECONDS).toISOString().substr(11, 8);
    return hour + minutes + seconds;
  }

  toastNotify(message, colorStatus) {
    this.toastCtrl
      .create({
        message,
        duration: 2000,
        color: colorStatus,
      })
      .then((toastEl) => toastEl.present());
  }

  GCChange() {
    this.isExitGCName = false;
  }
}
