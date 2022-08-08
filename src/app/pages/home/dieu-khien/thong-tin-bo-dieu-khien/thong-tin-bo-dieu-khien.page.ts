import { GroupRpcValidators } from './../group-rpc-validators';
import { DieuKhienService } from './../../../../core/services/dieu-khien.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { ListDeviceRpc } from 'src/app/shared/models/dieukhien.model';
import { ThemMoiDieuKhienPage } from '../them-moi-dieu-khien/them-moi-dieu-khien.page';
import { ThongTinDieuKhienThuCongPage } from '../thong-tin-dieu-khien-thu-cong/thong-tin-dieu-khien-thu-cong.page';
import { GroupRPCService } from 'src/app/core/services/nhom-dieu-khien.service';
import { GroupRpc } from 'src/app/shared/models/group-rpc.model';
import { DeviceSetting } from 'src/app/shared/models/DeviceSetting.model';
import { escapedHTML } from '../../../../shared/utils';
import { StatusGroupRpcModel } from '../../../../shared/models/status-group-rpc.model';
import { AllDevice, AllDeviceNotType } from 'src/app/shared/models/luatcanhbao.model';
import { LuatCanhBaoService } from 'src/app/core/services/luat-canh-bao.service';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { DeviceService } from 'src/app/core/services/device-service';

@Component({
  selector: 'app-thong-tin-bo-dieu-khien',
  templateUrl: './thong-tin-bo-dieu-khien.page.html',
  styleUrls: ['./thong-tin-bo-dieu-khien.page.scss'],
})
export class ThongTinBoDieuKhienPage implements OnInit {
  damTomId: string;
  rpcId: string;
  isLoading = true;
  tenDamTom: string;
  rpcG: GroupRpc;
  deviName: string;
  form: FormGroup;
  groupRPC: GroupRpc;
  deviceSettingList: DeviceSetting[] = [];
  statusGroupRpc: string;
  isExitGCName = false;
  showLstDieuKhien = true;
  lstAllDvice: AllDevice;
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
    private nhomDieuKhien: GroupRPCService,
    private luatService: LuatCanhBaoService,
    private deviceService: DeviceService,
  ) {}

  ngOnInit() {
    this.activeRoute.params.subscribe(async (params) => {
      // tslint:disable-next-line: no-string-literal
      this.damTomId = params['damTomId'];
      // tslint:disable-next-line: no-string-literal
      this.rpcId = params['rpcId'];
      // tslint:disable-next-line: no-string-literal
      this.tenDamTom = params['damTomName'];
      // tslint:disable-next-line: no-string-literal
      this.statusGroupRpc = params['status'];
      if (this.damTomId === null || this.damTomId === undefined) {
        this.router.navigateByUrl('/home/dieu-khien');
        return;
      }
      this.lstAllDvice = await this.luatService.getAllDevice(this.damTomId).toPromise();
      this.nhomDieuKhien.getRpcById(this.rpcId).subscribe((rpc) => {
        
        this.form = this.fb.group({
          tenBoDieuKhien: [
            rpc.name,
            [Validators.required, Validators.maxLength(255)],
          ],
        });
        // this.form.controls['tentenBoDieuKhien'].patchValue(rpc.name);
        this.deviceSettingList = rpc.rpcSettingList;
        
        this.deviceSettingList.forEach(e => {
          e.deviceType = this.getDetailDeviceById(e.deviceId).deviceType;
        });
        this.rpcG = rpc;
      });

      await this.getAllSpecialDevice();
    });
  }
  ionViewWillEnter() {
  }
  ionViewWillLeave() {
  }
  getDetailDeviceById(id: string){
    return this.lstAllDvice.RPC.find(se =>
      se.id === id
    );
  }

  // get list rem de lay finish time
  // getListZoneRem() {
  //   this.deviceService.getDeviceRpcWithZone(this.damTomId).subscribe(resData => {
  //     resData.forEach((zone) => {
  //       zone.rpcRemList.forEach((rem => {
  //         this.deviceSettingList.forEach((rpc) => {
  //           if (rem.rpcPushId == rpc.deviceId || rem.rpcPullId == rpc.deviceId) {
  //             rpc.finishTimRem = rem.finishTime
  //           }
  //         })
  //       })) 
  //     })
  //   })
  // }

  // get all bo rem
  getAllSpecialDevice() {
    this.dieuKhienService.getAllRem(this.damTomId)?.subscribe(resData => {
      this.deviceSettingList.forEach(rpcSetting => {
        var rem: SpecialDevice;
        if (rpcSetting.actionRem === 'PULL') {
          rem = resData.find(rem => rem.rpcPullId === rpcSetting.deviceId);
          rpcSetting.nameRem = rem.name;
        } else if (rpcSetting.actionRem === 'PUSH'){
          rem = resData.find(rem => rem.rpcPushId === rpcSetting.deviceId);
          rpcSetting.nameRem = rem.name;
        }
      })
    });
  }

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
      this.groupRPC = this.rpcG;
      this.groupRPC.damTomId = this.damTomId;
      this.groupRPC.groupRpcId = this.rpcG.groupRpcId;
      this.groupRPC.name = this.form.get('tenBoDieuKhien').value.trim();
      this.groupRPC.rpcSettingList = this.deviceSettingList;

      console.log('deviceSettingList', this.deviceSettingList);
      
      // this.form.markAsPristine();

      console.log('update nhom dk', this.groupRPC);
      
      this.nhomDieuKhien.saveGroupRpc(this.groupRPC).subscribe(
        (groupRpc) => {
          this.toastCtrl
            .create({
              message: 'Cập nhật thành công',
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
          // if(err.status === 417){
          //     this.toastCtrl.create({
          //         message: "Tên nhóm điều khiển đã tồn tại",
          //         duration: 2000,
          //         color: 'danger',
          //     }).then(toastEl => toastEl.present());
          // }
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
      const isExistDeviceSetting = this.deviceSettingList.some(
        // tslint:disable-next-line: no-shadowed-variable
        (data) => data.deviceId === dataReturn.data?.deviceId
      );
      if (isExistDeviceSetting) {
        this.toastNotify('Thiết bị điều khiển đã tồn tại', 'success');
        return;
      }
      this.deviceSettingList.unshift(dataReturn.data);

      this.form.markAsDirty();
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
  }
  buttonBack() {
    this.router.navigate(['/home/dieu-khien'], {
      queryParams: { damTomId: this.damTomId },
    });
  }
  deleteGroupRpc() {
    this.alertController
      .create({
        message:
          'Xoá nhóm điều khiển ' +
          '"' +
          escapedHTML(this.rpcG.name.toString()) +
          '" ?</b>',
        cssClass: 'my-alert-custom-class',
        buttons: [
          {
            text: 'Quay lại',
            role: 'cancel',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              if (this.statusGroupRpc === 'true') {
                this.toastNotify(
                  'Nhóm điều khiển đang khởi động. Không thể xóa!',
                  'danger'
                );
                return;
              } else {
                this.nhomDieuKhien
                  .deleteGroupRpc(this.damTomId, this.rpcId)
                  .subscribe(
                    (dataResponse) => {
                      this.toastNotify('Xóa thành công', 'success');
                      this.form.markAsPristine();
                      this.router.navigate(['/home/dieu-khien'], {
                        queryParams: { damTomId: this.damTomId },
                      });
                    },
                    (error) => {
                      console.log(error);
                      if (error.error === 'Không thể xóa nhóm thiết bị đang được sử dụng!') {
                        this.toastNotify('Nhóm điều khiển đang sử dụng. Không được xóa!', 'danger');
                      } else {
                        this.toastNotify('Có lỗi xảy ra, Xóa thất bại!', 'danger');
                      }
                    }
                  );
              }
            },
          },
        ],
      })
      .then((alCtr) => {
        alCtr.present();
      });
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
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
  }
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
      if (dataReturn.role === 'true') {
        this.form.markAsDirty();
      }
      this.deviceSettingList.forEach((deviceSetting, index) => {
        if (deviceSetting.deviceId === deviceSelect.deviceId) {
          if (deviceSetting.deviceType === 'REM') {
            deviceSetting.percentRem = dataReturn.data.percentRem;
            deviceSetting.actionRem = dataReturn.data.actionRem;
            deviceSetting.nameRem = dataReturn.data.nameRem;
            deviceSetting.deviceId = dataReturn.data.deviceId;
            deviceSetting.deviceName = dataReturn.data.deviceName;
            deviceSetting.label = dataReturn.data.label;
            deviceSetting.deviceType = dataReturn.data.deviceType;
          } else {
            deviceSetting.delayTime = dataReturn.data.delayTime;
            deviceSetting.deviceType  = dataReturn.data.deviceType;
            deviceSetting.deviceName = dataReturn.data.deviceName;
            deviceSetting.deviceId = dataReturn.data.deviceId;
            deviceSetting.label = dataReturn.data.label;
            deviceSetting.loopCount = dataReturn.data.loopCount;
            deviceSetting.loopOption = dataReturn.data.loopOption;
            deviceSetting.loopTimeStep = dataReturn.data.loopTimeStep;
            deviceSetting.openAccordition = dataReturn.data.openAccordition;
            deviceSetting.timeCallback = dataReturn.data.timeCallback;
            deviceSetting.callbackOption = dataReturn.data.callbackOption;
            deviceSetting.valueControl = dataReturn.data.valueControl;
          }
        }
      });
      
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
  }
  deleteDieuKhien(deviceId: string) {
    this.form.markAsDirty();

    if (deviceId !== null) {
      this.deviceSettingList.forEach((deviceSetting, index) => {
        if (deviceSetting.deviceId === deviceId) {
          this.deviceSettingList.splice(index, 1);
        }
      });
    }
  }

  convertLongToDate(MILISECONDS: number) {
    const time = new Date(MILISECONDS).toISOString().substr(11, 8).toString();
    // console.log(time);

    time.split(':');
    let hour = time.split(':')[0];
    let minutes = time.split(':')[1];
    let seconds = time.split(':')[2];
    // if(hour !== "00" && minutes !== "00" && seconds !== "00"){
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

  changeGCName() {
    this.isExitGCName = false;
  }
  msToTime(finishTime: number, percentControl: number) {
    // tinh time xu ly rai-thu    
    // if (this.deviceRem.oldStatus === 0) {
    //   duration = this.deviceRem.finishTime * (this.formSetting.value.percentControl / 100);
    // }
    var duration = 0;
    
    duration = (finishTime / 100) * percentControl;

    // convert 00:00:00
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    let hoursStr = (hours < 10) ? '0' + hours : hours.toString();
    let minutesStr = (minutes < 10) ? '0' + minutes : minutes.toString();
    let secondsStr = (seconds < 10) ? '0' + seconds : seconds.toString();
  
    return hoursStr + ":" + minutesStr + ":" + secondsStr;
  }
}
