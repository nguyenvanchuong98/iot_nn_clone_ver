import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ModalController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { of } from 'rxjs';
import { catchError, delay, finalize, tap } from 'rxjs/operators';
import { ActionRem, DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { DeviceRpc } from 'src/app/shared/models/dieukhien.model';
import { DamTom } from 'src/app/shared/models/giamsat.model';
import { RpcRequest } from 'src/app/shared/models/rpc-request.model';
import { arrayEqual } from 'src/app/shared/utils';
import { NhomDieuKhienComponent } from '../nhom-dieu-khien/nhom-dieu-khien.component';
import { PickertimeComponent } from '../pickertime/pickertime.component';
import { QuanLyZoneService } from '../../../../core/services/quan-ly-zone.service';
import { Zone } from '../../giam-sat/giam-sat-update.model';
import { DieuKhienDamTom, DieuKhienDevice, ZoneDieuKhienUpdate } from '../dieu-khien-update.model';
import {
  Plugins,
  PushNotification,
  PushNotificationActionPerformed,
  Capacitor
} from '@capacitor/core';
import { DieuKhienRemComponent } from './dieu-khien-rem/dieu-khien-rem.component';
import { ThietLapDkRemComponent } from './thiet-lap-dk-rem/thiet-lap-dk-rem.component';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';
const { PushNotifications } = Plugins;

export interface ModelData {
  deviceRpc: DieuKhienDevice;
  valueControl: number;
}

export interface ZoneDieuKhien {
  zoneId: string;
  zoneName: string;
  rpcDeviceList: DeviceRpc[];
}
@Component({
  selector: 'app-dieu-khien-thu-cong',
  templateUrl: './dieu-khien-thu-cong.component.html',
  styleUrls: ['./dieu-khien-thu-cong.component.scss'],
})
export class DieuKhienThuCongComponent implements OnInit {
  @ViewChild (IonContent, {static: true}) content: IonContent;
  isGoTop = false;
  @ViewChild('nhomDk', { static: true }) nhomDkComponent: NhomDieuKhienComponent;

  @Input() damTomId: string;
  @Input() rpcId: string;
  @Output() countLichSu = new EventEmitter<number | boolean>(); // By ChuongNV
  checkLoadingRpc: string[] = [];
  listRPC: DeviceRpc[] = [];
  listZone: Zone[] = [];
  intervaldb = null;
  
  @Input() listRpcRem: SpecialDevice[] = [];
  // listZoneUpdate: ZoneDieuKhien[] = [];
  constructor(
    private dieuKhienService: DieuKhienService,
    private modalCtrl: ModalController,
    private router: Router,
    private quanLyZoneService: QuanLyZoneService,
    private toastCtrl: ToastController
  ) {}

  // NB - toi uu lai
  @Input() isLoadingFinish: boolean;
  @Input() damTomSelectedInput: DieuKhienDamTom;

  iconRpc = {
    DEFAULT: {
      iconOn: 'assets/icon-darkmode/0_Controller_active.png',
      iconOff: 'assets/icon-darkmode/0_Controller_deactive.png',
      iconMkn: 'assets/icon-darkmode/0_Controller_dis.png'
    },
    DIEUKHIEN_KHAC: {
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
      // iconOn: 'assets/icon-update/8_Rem_xanh.png',
      // iconOff: 'assets/icon-update/8_Rem_xam.png',
      // iconMkn: 'assets/icon-update/8_Rem_mkn.png'
      iconOn: 'assets/icon-darkmode/8_Rem_active.png',
      // iconOff: 'assets/icon-darkmode/8_Rem_deactive.png',
      // iconMkn: 'assets/icon-darkmode/8_Rem_dis.png'
      iconOff: 'assets/icon-darkmode/15_remdong_deactive.png',
      iconMkn: 'assets/icon-darkmode/15_remdong_dis.png'
    },
    Rèm: {
      iconThu: 'assets/icon-darkmode/8_Rem_active.png',
      iconRai: 'assets/icon-darkmode/15_remdong_active.png',
      iconThuDung: 'assets/icon-darkmode/8_Rem_deactive.png',
      iconRaiDung: 'assets/icon-darkmode/15_remdong_deactive.png',
      iconThuMkn: 'assets/icon-darkmode/8_Rem_dis.png',
      iconRaiMkn: 'assets/icon-darkmode/15_remdong_dis.png',
    },
    DEN: {
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

  ngOnInit() {
    console.log('init dk thu cong', this.damTomSelectedInput);
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges(changes: SimpleChanges) {
    if (!this.damTomId) {
      return;
    }
    this.nhomDkComponent.ionViewWillEnter(this.damTomId);
    // this.fetchData();
    // this.fetchZoneRpc();
  }

  onViewEnter(isRefresh?: boolean) {
    if (!this.damTomId) {
      return;
    }
    this.nhomDkComponent.ionViewWillEnter(this.damTomId);
    // this.fetchData();
    // this.fetchZoneRpc();
    if (!!this.rpcId && isRefresh !== true) {
      this.focusRPC(this.rpcId);
    }
  }

  focusRPC(rpcID) {
    document.getElementById(rpcID)?.scrollIntoView({
      behavior: 'smooth',
      // block: 'center',
      // inline: 'center',
    });
  }
  onViewLeave() {
    // ChuongNv - 1 dong ben duoi gan lai mang rong de khong bi cuon trang khac
    this.nhomDkComponent.ionViewWillLeave();
    this.stopInterval();
  }
  stopInterval() {
    if (!this.intervaldb) {
      return;
    }
    clearInterval(this.intervaldb);
    this.intervaldb = null;
  }

  CheckLoadingRPC(deviceId) {
    return this.checkLoadingRpc.includes(deviceId);
  }

  async onControl(valueRpc: number, deviceRpc: DieuKhienDevice, index: number) {
      const rpcRequest: RpcRequest = {
        damTomId: this.damTomId,
        deviceId: deviceRpc.deviceId,
        deviceName: deviceRpc.tenThietBi,
        setValueMethod: deviceRpc.setValueMethod,
        valueControl: valueRpc,
        callbackOption: false,
        timeCallback: 0,
        loopOption: false,
        loopCount: 0,
        loopTimeStep: 0,
      };
      const deviceId = deviceRpc.deviceId;
      const deviceName = deviceRpc.tenThietBi;
      this.checkLoadingRpc.push(deviceId);
      await this.dieuKhienService.saveManualRpcToCommandQueue(rpcRequest).toPromise()
      .catch(err => {
      });
      // this.subscribeNotify();
      // setTimeout(() => {
      deviceRpc.statusTime = moment().valueOf();
      deviceRpc.statusDevice = valueRpc;
      this.checkLoadingRpc.splice(0, 1);
      this.countLichSu.emit(false);
      // }, 2000);
      setTimeout(async () => {
        this.getCountLsNew(); // By ChuongNV
        const dataLastest = await this.dieuKhienService.getLastestStatusDevice(deviceId, deviceName).toPromise();
        // console.log('lastest', Number(dataLastest[deviceRpc.tenThietBi][0].value));
        this.damTomSelectedInput.listZoneRpc.forEach(zone => {
          zone.rpcDeviceList.forEach(rpc => {
            if (rpc.deviceId === deviceId) {
              if (valueRpc === Number(dataLastest[deviceName][0].value)) {
                rpc.statusTime = moment().valueOf();
                rpc.statusDevice = Number(dataLastest[deviceName][0].value);
              } else {
                // bat/tat that bai
                // console.log('lastest', Number(dataLastest[deviceRpc.tenThietBi][0].value), valueRpc);
              }
            }
          });
        });
      }, 5000);
  }
  async presentPrompt(deviceRpc: DieuKhienDevice, valueControl: number) {
      const modelData: ModelData = {
        deviceRpc,
        valueControl,
      };
      const modal = await this.modalCtrl.create({
        component: PickertimeComponent,
        componentProps: {
          modelData,
        },
        cssClass: 'modal-thiet-lap-dk-thu-cong',
        swipeToClose: true,
        backdropDismiss: true,
      });
      modal.onDidDismiss().then((dataReturn: any) => {
        // console.log(dataReturn.data);
        if (dataReturn.data) {
          this.checkLoadingRpc.push(dataReturn.data);
          // this.subscribeNotify();
          // setTimeout(() => {
          deviceRpc.statusTime = moment().valueOf();
          deviceRpc.statusDevice = valueControl;
          this.checkLoadingRpc.splice(0, 1);
          this.getCountLsNew(); // By ChuongNV
          // }, 2000);
          setTimeout(async () => {
            const dataLastest = await this.dieuKhienService
            .getLastestStatusDevice(deviceRpc.deviceId, deviceRpc.tenThietBi)
            .toPromise();
            this.damTomSelectedInput.listZoneRpc.forEach(zone => {
              zone.rpcDeviceList.forEach(rpc => {
                if (rpc.deviceId === deviceRpc.deviceId) {
                  // console.log('lastest', Number(dataLastest[deviceRpc.tenThietBi][0].value), rpc.statusDevice);
                  if (valueControl === Number(dataLastest[deviceRpc.tenThietBi][0].value)) {
                    rpc.statusTime = moment().valueOf();
                    rpc.statusDevice = Number(dataLastest[deviceRpc.tenThietBi][0].value);
                    this.updateLocalStorage(deviceRpc, valueControl);
                    // console.log('lastest', Number(dataLastest[deviceRpc.tenThietBi][0].value), rpc.statusDevice);
                  } else {
                    // bat/tat that bai
                    // console.log('lastest', Number(dataLastest[deviceRpc.tenThietBi][0].value), rpc.statusDevice);
                  }
                }
              });
            });
          }, 5000);
        }
      });
      return await modal.present();
  }

  async settingRem(rem: SpecialDevice) {
    const modal = await this.modalCtrl.create({
      component: ThietLapDkRemComponent,
      swipeToClose: true,
      backdropDismiss: true,
      componentProps: {
        deviceRem: rem,
      },
      cssClass: 'modal-thiet-lap-dk-thu-cong'
    });
    await modal.present();
  }

  async controlRem(rem: SpecialDevice) {
    console.log('dao chieu dk rem');
    // 0% -> rai rem den 100%
    if(rem.pauseStatus === 0) {
      const action: ActionRem = {
        id: rem.id,
        rpcRemMode: 'PUSH', // PUSH - PULL - STOP
        stopOption: 100,
      }
      this.dieuKhienService.controlRem(action).subscribe(resData => {
        this.dieuKhienService.showToast('Gửi lệnh điều khiển rèm thành công', 'success');
        console.log('PUSH');
        rem.rpcPushDevice.statusDevice = 1;
        rem.latestAction = 'PUSH';
      }, err => {
        console.log('error control rem', err);
        if (err.error.errorCode === 31) {
          this.dieuKhienService.showToast(err.error.message, 'danger');
        } else if (err.error.errorCode === 30) {
          this.dieuKhienService.showToast(err.error.message, 'danger');
        }
        else if (err.error.status === 500) {
          this.dieuKhienService.showToast('Gửi lệnh điều khiển rèm thất bại!', 'danger');
        }
      })
    }

    // 100% -> thu rem ve 0%
    if(rem.pauseStatus === 100) {
      const action: ActionRem = {
        id: rem.id,
        rpcRemMode: 'PULL', // PUSH - PULL - STOP
        stopOption: 0,
      }
      this.dieuKhienService.controlRem(action).subscribe(resData => {
        this.dieuKhienService.showToast('Gửi lệnh điều khiển rèm thành công', 'success');
        console.log('PULL');
        rem.rpcPullDevice.statusDevice = 1;
        rem.latestAction = 'PULL';
      }, err => {
        console.log('error control rem', err);
        if (err.error.errorCode === 31) {
          this.dieuKhienService.showToast(err.error.message, 'danger');
        } else if (err.error.errorCode === 30) {
          this.dieuKhienService.showToast(err.error.message, 'danger');
        }
        else if (err.error.status === 500) {
          this.dieuKhienService.showToast('Gửi lệnh điều khiển rèm thất bại!', 'danger');
        }
      })
    }
  }

  getStatusRem(rem: SpecialDevice) {
    if (rem.rpcPullDevice.statusDevice === 1 && rem.rpcPushDevice.statusDevice === 0) {
      return 'Thu'
    } else if (rem.rpcPullDevice.statusDevice === 0 && rem.rpcPushDevice.statusDevice === 1) {
      return 'Rải'
    } else if (rem.rpcPullDevice.statusDevice === -1 && rem.rpcPushDevice.statusDevice === -1) {
      return 'Mất kết nối'
    } else if ((rem.rpcPullDevice.statusDevice === 0 && rem.rpcPushDevice.statusDevice === 0)) {
      return 'Dừng'
    }
  }

  // subscribe notify
  subscribeNotify() {
    let deviceControl: DieuKhienDevice;
    PushNotifications.addListener('pushNotificationReceived',
        (notification: PushNotification) => {
          this.damTomSelectedInput.listZoneRpc.forEach(zone => {
            deviceControl = zone.rpcDeviceList.find(dv => dv.deviceId === notification.data.deviceId);
          });
          if (notification.data.statusCommand === 'SUCCESS' && deviceControl.statusDevice !== notification.data.statusDevice) {
            deviceControl.statusDevice = notification.data.statusDevice;
            setTimeout(() => {
              this.checkLoadingRpc.splice(0, 1);
            }, 200);
            this.getCountLsNew(); // By ChuongNV
            // console.log('notify control rpc: ', notification, deviceControl);
          }
      }
    );
  }
  updateLocalStorage(deviceRpc, valueRpc) {
    let rpcControl: DieuKhienDevice;
    const dataDamtoms: DieuKhienDamTom[] = JSON.parse(localStorage.getItem('dieuKhienDamtoms'));
    const damtomSelected = dataDamtoms.find(dt => dt.damTomId === this.damTomId);
    damtomSelected.listZoneRpc.forEach (zoneLocal => {
      rpcControl = zoneLocal.rpcDeviceList.find(rpcLocal => rpcLocal.deviceId === deviceRpc.deviceId);
    });

    rpcControl.statusDevice = valueRpc;
    rpcControl.statusTime = moment().valueOf();

    const data = JSON.stringify(dataDamtoms);
    localStorage.setItem('dieuKhienDamtoms', data);
  }

  // async fetchData() {
  //   let data = await this.dieuKhienService
  //     .getAllRpcDevice(this.damTomId)
  //     .toPromise();
  //   if (!data) {
  //     data = [];
  //   }

  //   // tslint:disable-next-line: prefer-for-of
  //   for (let i = 0; i < data.length; i++) {
  //     const tenThietBi = data[i].tenThietBi;
  //     const status = await this.dieuKhienService
  //       .getLastestStatusDevice(data[i].deviceId, tenThietBi)
  //       .toPromise();
  //     data[i].statusDevice =
  //       status[tenThietBi][0].ts > moment().valueOf() - 60000
  //         ? parseInt(status[tenThietBi][0].value, 10)
  //         : -1;
  //   }

  //   let zones = await this.dieuKhienService
  //     .getListRpcDeviceZone(this.damTomId)
  //     .toPromise();
  //   if (!zones) {
  //     zones = [];
  //   }

  //   // sort zone theo thu tu user sap xep
  //   const indexOfZone = await this.quanLyZoneService
  //     .getIndexOfZone(this.damTomId)
  //     .toPromise();
  //   zones = zones.map((zone) => {
  //     return {
  //       ...zone,
  //       index: indexOfZone.zoneIds.findIndex((zoneId) => {
  //         return zone.id === zoneId;
  //       }),
  //     };
  //   });
  //   zones.sort((a, b) => {
  //     return a.index - b.index;
  //   });

  //   zones.forEach((zone) => {
  //     zone.deviceEntityList.forEach((zoneDevice) => {
  //       data.forEach((device) => {
  //         if (device.deviceId !== zoneDevice.id) {
  //           return;
  //         }
  //         device.zoneId = zone.id;
  //       });
  //     });
  //   });

  //   // trungdt - kiểm tra nếu dữ liệu thay đổi thì mới cập nhật
  //   if (!arrayEqual(data, this.listRPC)) {
  //     this.listRPC = data;
  //   }
  //   if (!arrayEqual(zones, this.listZone)) {
  //     this.listZone = zones;
  //   }
  // }

  // Show toast
  private showToast(valueControl: number, deviceName: string, color: string) {
    const message = `${valueControl === 0 ? 'Tắt' : 'Bật'} ${deviceName} thất bại`;
    this.toastCtrl
      .create({
        message,
        color,
        duration: 2000,
      })
      .then((toatEL) => toatEL.present());
  }
  // not use ------------------------ //
  getListRpc(): DeviceRpc[] {
    return this.listRPC;
  }

  getListRpcNotInZone(): DeviceRpc[] {
    return this.listRPC.filter((el) => !el.zoneId);
  }

  getListRpcInZone(zoneId): DeviceRpc[] {
    return this.listRPC.filter((el) => el.zoneId === zoneId);
  }


  // ------------------------ //
  caculationTimeDevice(time: number): string {
    let timeShow: string;
    const timeDuring = moment().valueOf() - time;
    if (time === 0) {
      timeShow = 'Không xác định';
    } else {
      const timeResult = Math.round(timeDuring / (1000 * 60)); // millisecond -> quy ra phut

      if (timeResult < 60) {
        timeShow = timeResult + ' phút trước';
      }
      // < 1 ngay -> hien thi gio
      else if (timeResult < 1440) {
        timeShow = Math.round(timeResult / 60) + ' giờ trước';
      }
      // > 1 ngay -> hien thi ngay
      else if (timeResult >= 1440) {
        timeShow = Math.round(timeResult / 1440) + ' ngày trước';
      }
      // > 1 tuan -> hien thi tuan
      else if (timeResult >= 10080) {
        timeShow = Math.round(timeResult / 10080) + ' tuần trước';
      }
      // > 1 thang -> hien thi thang
      else if (timeResult >= 43200) {
        timeShow = Math.round(timeResult / 43200) + ' tháng trước';
      }
    }

    return timeShow;
  }

  goToQuanLyNhom() {
    this.router.navigate([
      '/',
      'home',
      'dieu-khien',
      'quan-ly-nhom',
      this.damTomId,
    ]);
  }

  /* Write by Chuong NV - Hàm để cập nhật số lịch sử mỗi khi control
   */
  getCountLsNew() {
    this.dieuKhienService.getCountNewLs(this.damTomId).subscribe((res) => {
      this.countLichSu.emit(res);
    });
  }

  logScrolling(event){
    if (event.detail.scrollTop === 0){
      this.isGoTop = false;
    }
    else {
      this.isGoTop = true;
    }
  }
}
