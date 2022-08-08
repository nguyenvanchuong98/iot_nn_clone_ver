import { DamTom } from 'src/app/core/services/report-schedule.service';
import {
  ActionSheetController,
  AlertController,
  IonContent,
  IonSlides,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import {
  DeviceRpc,
  DeviceRpcZone,
  GroupRpc,
  LichSuDK,
} from './../../../shared/models/dieukhien.model';
import { DieuKhienService } from './../../../core/services/dieu-khien.service';
import { Component, OnInit, Pipe, ViewChild } from '@angular/core';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import { interval, of, Subject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { PickertimeComponent } from './pickertime/pickertime.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DieuKhienThuCongComponent } from './dieu-khien-thu-cong/dieu-khien-thu-cong.component';
import { TabLichSuDieuKhienComponent } from './tab-lich-su-dieu-khien/tab-lich-su-dieu-khien.component';
import { arrayEqual } from 'src/app/shared/utils';
import { DeviceService } from 'src/app/core/services/device-service';
import { DieuKhienServiceUpdate } from './dieu-khien-update.service';
import { catchError, map, tap } from 'rxjs/operators';
import { DieuKhienDamTom, DieuKhienDevice, ZoneDieuKhienUpdate } from './dieu-khien-update.model';
import { SpecialDevice } from '../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';
import _ from 'lodash';

export interface GroupHistoryByDay {
  time: number;
  dataHistory: LichSuDK[];
}
export interface ModelData {
  deviceRpc: DeviceRpc;
  valueControl: number;
}
@Component({
  selector: 'app-dieu-khien',
  templateUrl: './dieu-khien.page.html',
  styleUrls: ['./dieu-khien.page.scss'],
})
export class DieuKhienPage implements OnInit {
  /* end */
  constructor(
    private giamsatService: GiamSatService,
    private dieuKhienService: DieuKhienService,
    private toastCtrl: ToastController,
    public alertController: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private dieuKhienServiceUpdate: DieuKhienServiceUpdate
  ) {}
  @ViewChild('slides', { static: true }) slider: IonSlides;
  @ViewChild('tabThuCong', { static: true })
  tabThuCong: DieuKhienThuCongComponent;
  @ViewChild('tabLichSu', { static: true })
  tabLichSu: TabLichSuDieuKhienComponent;
  @ViewChild(IonContent) gotoTop: IonContent;
  isGoTop = false;
  segment = 0;
  check = 0;
  rpcId;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  checkLoadingRpc: string[] = [];
  checkLoadingGrpc: any[] = [];
  damTomId: string;
  // interval = null;
  isLoading = true;
  createForm: FormGroup;
  listDeviceRpcInZone: DeviceRpc[] = [];
  listDeviceRpcNotInZone: DeviceRpc[] = [];
  loadingSpinnerInCard;
  // ChuongNV
  countNewHistory = 0;
  deviceID = 'all';
  lstRpcZone: DeviceRpcZone[] = [];
  currentDate = moment(new Date()).add(7, 'hours').toISOString();
  // Lấy đến ngày mặc định là ngày hiện tại
  toDate = moment().seconds(0).milliseconds(0).toISOString();
  dateFrom = (new Date()).getDate() - 6;
  // Lấy giá trị từ ngày mặc định là 0h ngày hiện tại
  fromDate = moment(new Date().setDate(this.dateFrom)).startOf('date').toDate().toISOString();
  intervaldb = null;
  customActionSheetOptions: any = {
    header: 'Chọn nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };
  customPopoverOptions: any = {
    header: 'Chọn thiết bị',
    cssClass: 'my-custom-popover',
  };
  // NB - toi uu dk thu cong
  loadedDataDamtoms: DieuKhienDamTom[] = [];
  isLoadingDataFinish = false;
  damTomSelected: DieuKhienDamTom;
  intervalDkThuCong = null;
  isChangeDam = false;
  damTomIdSubscription: Subscription;
  isInit = false;

  intervalRem = null;

  listRpcRem: SpecialDevice[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe((data) => {
      this.rpcId = data?.rpcID;
      if (!!data.tab) {
        this.segment = Number(data.tab);
      }
    });
    this.createForm = this.fb.group({
      loaiDieuKhien: 0,
    });
    this.segment = 0;
    // NB - toi uu lai
    this.isInit = true; // Nghĩa là đã hàm get danh sách đầm tôm đã đc chạy và không chạy lại trong viewWill nữa
    this.updateRpcs();
    // get tu storage ra
    this.getDataDamtomsFromLocalStorage();

    if (this.damTomIdSubscription === undefined) {
      if (this.dieuKhienService.damTomId !== this.damTomId && !!this.dieuKhienService.damTomId) {
        this.damTomId = this.dieuKhienService.damTomId;
        this.damTomSelected = this.loadedDataDamtoms.find(dt => dt.damTomId === this.damTomId);
      }
    }
    // subscribe de nhan dam tom id selected ben gs
    this.damTomIdSubscription = this.dieuKhienService.damTomIdSelected.subscribe (resData => {
      if (resData !== this.damTomId) {
        this.damTomId = resData;
        if (this.damTomSelected.damTomId !== this.damTomId) {
          this.damTomSelected = this.loadedDataDamtoms.find(dt => dt.damTomId === this.damTomId);
        }
      }
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  // ionViewDidLeave() {
  //   if (this.damTomIdSubscription) {
  //     this.damTomIdSubscription.unsubscribe();
  //   }
  // }
  setDataDamtomsToLocalStorage(dieuKhienDamtoms: DieuKhienDamTom[]){
    dieuKhienDamtoms.sort((dt1, dt2) => {
      // sep theo time tao moi nhat -> cu nhat
      return dt2.createdTime - dt1.createdTime;
    });
    const data = JSON.stringify(dieuKhienDamtoms);
    localStorage.setItem('dieuKhienDamtoms', data);
    setTimeout(() => {
      this.isLoadingDataFinish = true;
    }, 2000);
  }
  getDataDamtomsFromLocalStorage(){
    const dataDamtoms: DieuKhienDamTom[] = JSON.parse(localStorage.getItem('dieuKhienDamtoms'));
    if (dataDamtoms !== null) {
      this.loadedDataDamtoms = dataDamtoms;

      this.loadedDataDamtoms.forEach(damtom => {
        damtom.listZoneRpc.forEach(zoneRpc => {
          zoneRpc.rpcDeviceList.forEach(deviceRpc => {
            this.getLastestStatusRpc(deviceRpc);
          });
          
          const listRpc1 = zoneRpc.rpcDeviceList.sort((a, b) =>  a.label?.localeCompare(b.label, 'vi'));
          zoneRpc.rpcDeviceList = listRpc1;

          const listRpc2 = zoneRpc.rpcDeviceList.sort((a, b) =>  a.tenThietBi?.localeCompare(b.tenThietBi, 'vi'));
          zoneRpc.rpcDeviceList = listRpc2;
        });
      });


      if (this.damTomId === undefined) {
        this.damTomId = this.loadedDataDamtoms[0]?.damTomId;
        this.damTomSelected = this.loadedDataDamtoms[0];
      } else {
        if (this.damTomSelected.damTomId !== this.damTomId) {
          this.damTomSelected = this.loadedDataDamtoms.find(dt => dt.damTomId === this.damTomId);
        }
      }
      this.isLoadingDataFinish = true;
    }
  }

  // update realtime page dk thu cong
  startIntervalDkThuCong() {
    this.stopIntervalDkThuCong();

    this.intervalDkThuCong = setInterval(() => {
      this.updateRpcs();
    }, 20000);
  }
  async updateRpcs() {
    const damTomsNew = await this.dieuKhienServiceUpdate.fetchDieuKhienDamToms().toPromise();
    damTomsNew.sort((dt1, dt2) => {
      // sep theo time tao moi nhat -> cu nhat
      if (dt1.createdTime > dt2.createdTime) { return -1; }
      if (dt1.createdTime < dt2.createdTime) { return 1; }
    });
    // luu local
    this.setDataDamtomsToLocalStorage(damTomsNew);
    // update data damtom
    if (damTomsNew.length !== this.loadedDataDamtoms.length) {
      this.loadedDataDamtoms = damTomsNew;
      this.damTomSelected = damTomsNew[0];
    } else {
      damTomsNew.forEach (damtomNew => {
        this.loadedDataDamtoms.forEach (damtomOld => {
          if (damtomOld.damTomId === damtomNew.damTomId) {
            // update name damtom
            damtomOld.damTomName = damtomNew.damTomName;
            // update list zone rpc
            if (damtomOld.listZoneRpc.length !== damtomNew.listZoneRpc.length) {
              damtomOld.listZoneRpc = damtomNew.listZoneRpc;
            } else {
              damtomNew.listZoneRpc.forEach (zoneNew => {
                damtomOld.listZoneRpc.forEach (zoneOld => {
                  if (zoneOld.zoneId === zoneNew.zoneId && zoneOld.zoneId !== null && zoneNew.zoneId !== null) {
                    // update name zone
                    zoneOld.zoneName = zoneNew.zoneName;

                    if (zoneNew.rpcDeviceList.length !== zoneOld.rpcDeviceList.length) {
                      zoneOld.rpcDeviceList = zoneNew.rpcDeviceList;
                      zoneOld.rpcRemList = zoneNew.rpcRemList;
                    } else {
                      // update status-time,status-device, name, label, type
                      zoneOld.rpcDeviceList.forEach (rpcOld => {
                        const rpcNew = zoneNew.rpcDeviceList.find(rpc => rpc.deviceId === rpcOld.deviceId);
                        rpcOld.label = rpcNew.label;
                        rpcOld.tenThietBi = rpcNew.tenThietBi;
                        rpcOld.statusTime = rpcNew.statusTime;
                        rpcOld.deviceType = rpcNew.deviceType;
                      });
                      // update rem
                      zoneOld.rpcRemList.forEach (remOld => {
                        const remNew = zoneNew.rpcRemList.find(rem => rem.id === remOld.id);
                        remOld.name = remNew.name;
                        remOld.rpcPushDevice = remNew.rpcPushDevice;
                        remOld.rpcPullDevice = remNew.rpcPullDevice;
                        remOld.rpcPushId = remNew.rpcPushId;
                        remOld.rpcPullId = remNew.rpcPullId;
                        remOld.finishTime = remNew.finishTime;
                        remOld.latestAction = remNew.latestAction;
                        remOld.latestTimeAction = remNew.latestTimeAction;
                        remOld.oldStatus = remNew.oldStatus;
                        remOld.pauseStatus = remNew.pauseStatus;
                      });
                    }
                  }
                  // chua co phan vung => update rpcNormal and rpcRem
                  if (zoneOld.zoneName.toLowerCase() === 'chưa có phân vùng' && zoneOld.zoneId === null 
                  && zoneNew.zoneName.toLowerCase() === 'chưa có phân vùng' && zoneNew.zoneId === null) {
                    zoneOld.rpcDeviceList = zoneNew.rpcDeviceList;
                  }

                  // phan vung rem
                  if (zoneOld.zoneName.toLowerCase() === 'danh sách rèm' && zoneOld.zoneId === null 
                  && zoneNew.zoneName.toLowerCase() === 'danh sách rèm' && zoneNew.zoneId === null) {
                    zoneOld.rpcRemList = zoneNew.rpcRemList;
                  }
                  
                });
              });
            }
          }
        });
      });
    }
    // update lastest status of rpc cua dam duoc chon
    this.damTomSelected?.listZoneRpc.forEach(zone => {
      // sort device 
      // zone.rpcDeviceList.sort((a, b) => { // sep theo time tao moi nhat -> cu nhat
      //   if (a.createdTime > b.createdTime) { return -1; }
      //   if (a.createdTime < b.createdTime) { return 1; }
      // });
      const listRpc1 = zone.rpcDeviceList.sort((a, b) =>  a.label?.localeCompare(b.label, 'vi'));
      zone.rpcDeviceList = listRpc1;

      const listRpc2 = zone.rpcDeviceList.sort((a, b) =>  a.tenThietBi?.localeCompare(b.tenThietBi, 'vi'));
      zone.rpcDeviceList = listRpc2;
      
      zone.rpcDeviceList.forEach(deviceRpc => {
        this.getLastestStatusRpc(deviceRpc);
      });
    });

    // list rpc rem
    this.getRpcRem();
  }
  // ------ RPC REM -------
  getRpcRem() {
    this.dieuKhienService.getRpcCurtains(this.damTomSelected.damTomId).subscribe(resData => {
      this.listRpcRem = resData;
      this.listRpcRem.sort((rem1, rem2) => {
        // sep theo time tao moi nhat -> cu nhat
        if (rem1.createdTime > rem2.createdTime) { return -1; }
        if (rem1.createdTime < rem2.createdTime) { return 1; }
      })
    });
  }

  startIntervalStatusRem() {
    this.stopIntervalRem();
    this.intervalRem = setInterval(() => {
    console.log('startIntervalStatusRem dk thu cong', this.intervalRem);

      this.listRpcRem.forEach(rem => {
        this.getStatusRemById(rem);
      });

      this.damTomSelected.listZoneRpc.forEach(zone => {
        zone.rpcRemList.forEach(rem => {
          this.getStatusRemById(rem);
        });
      })
    }, 2500);
  }
  stopIntervalRem() {
    console.log('stop intervel rem man dk thu cong');
    if (!this.intervalRem) {
      return;
    }
    clearInterval(this.intervalRem);
    this.intervalRem = null;
  }

  getStatusRemById(rem: SpecialDevice) {
    this.dieuKhienService.getRemById(rem.id).pipe(
      tap(data => {
        data.pauseStatus = Number(this.caculateStatusRem(data).toFixed(0));
        if (data.pauseStatus > 99) {
          data.pauseStatus = 100;
        } else if (data.pauseStatus < 1) {
          data.pauseStatus = 0;
        }
        rem.pauseStatus = data.pauseStatus;
        rem.rpcPullDevice = data.rpcPullDevice;
        rem.rpcPushDevice = data.rpcPushDevice;
        rem.latestAction = data.latestAction;
        rem.latestTimeAction = data.latestTimeAction;
      }),
      catchError(err => {
        return of({});
      })
    ).subscribe();
  }
  
  caculateStatusRem(rpcRem: any): number {
    const timeFinishPredict =
      (rpcRem.finishTime / 100) * Math.abs(rpcRem.oldStatus - rpcRem.pauseStatus)
      + rpcRem.latestTimeAction;
    const currentTime = moment().valueOf();
    const hasStartedTime = currentTime - rpcRem.latestTimeAction;
    const finishedTime = timeFinishPredict - rpcRem.latestTimeAction;
    if (rpcRem.latestAction === 'STOP'
      || (rpcRem.rpcPushDevice.statusDevice === 0 && rpcRem.rpcPullDevice.statusDevice === 0)
      || (rpcRem.rpcPushDevice.statusDevice !== 0
        && rpcRem.rpcPushDevice.statusDevice !== 1
        && rpcRem.rpcPullDevice.statusDevice !== 1
        && rpcRem.rpcPullDevice.statusDevice !== 0)) {
      return rpcRem.pauseStatus;
    } else if (rpcRem.latestAction === 'PUSH' && (rpcRem.rpcPushDevice.statusDevice !== 0)) {
      return rpcRem.oldStatus + (hasStartedTime / finishedTime)
        * 100
        * Math.abs(rpcRem.oldStatus - rpcRem.pauseStatus) / 100;
    } else if (rpcRem.latestAction === 'PULL' && (rpcRem.rpcPullDevice.statusDevice !== 0)) {
      return rpcRem.oldStatus - (hasStartedTime / finishedTime)
        * 100
        * Math.abs(rpcRem.oldStatus - rpcRem.pauseStatus) / 100;
    }
    return 0;
  }

  refreshDamTomSelected() {
    // update zone
    this.dieuKhienServiceUpdate.fetchDieuKhienDamTomById(this.damTomId).subscribe(listZoneNew => {
      this.damTomSelected.listZoneRpc = listZoneNew;
    });
    // update lastest status of rpc cua dam duoc chon
    this.damTomSelected.listZoneRpc.forEach(zone => {
      zone.rpcDeviceList.forEach(deviceRpc => {
        this.getLastestStatusRpc(deviceRpc);
      });
    });

    // update ds rem
    this.getRpcRem();

    this.listRpcRem.forEach(rem => {
      this.getStatusRemById(rem);
    });

    this.damTomSelected.listZoneRpc.forEach(zone => {
      console.log('zone damtomSelected',zone);
      
      zone.rpcRemList.forEach(rem => {
        this.getStatusRemById(rem);
      });
    })

    // update nhom dk
    this.tabThuCong.onViewEnter(true);
  }

  async getLastestStatusRpc(rpc: DieuKhienDevice) {
    const dataStatus = await this.dieuKhienService.getLastestStatusDevice(rpc.deviceId, rpc.tenThietBi).toPromise();

    if (dataStatus[rpc.tenThietBi][0].ts > moment().valueOf() - 120000) {
      rpc.statusDevice = parseInt(dataStatus[rpc.tenThietBi][0].value, 10);
    }
    else { rpc.statusDevice = -1; }
  }

  stopIntervalDkThuCong() {
    if (!this.intervalDkThuCong) {
      return;
    }
    clearInterval(this.intervalDkThuCong);
    this.intervalDkThuCong = null;
  }

  setDamTomId(id: string) {
    if (id == null) {
      return;
    }
    // this.tabLichSu.getCountLsNew();
    if (this.damTomId != null){
      this.dieuKhienService.getCountNewLs(id).subscribe((res) => {
        this.countNewHistory = res;
      });
    }
    if (this.segment === 3) {
      this.getDeviceZone();
    }
    if (this.isChangeDam){
      this.router.navigate(['.'], {
        relativeTo: this.route
      });
    }
  }

  changedamtom(event: any) {
    this.isChangeDam = true;
    // change dam tom cho page dk thu cong
    this.damTomSelected = this.loadedDataDamtoms.find(dt => dt.damTomId === event);
    // NB - get lastest status rpc cua damtomSelected
    this.damTomSelected.listZoneRpc.forEach(zone => {
      const listRpc1 = zone.rpcDeviceList.sort((a, b) =>  a.label?.localeCompare(b.label, 'vi'));
      zone.rpcDeviceList = listRpc1;

      const listRpc2 = zone.rpcDeviceList.sort((a, b) =>  a.tenThietBi?.localeCompare(b.tenThietBi, 'vi'));
      zone.rpcDeviceList = listRpc2;
      
      zone.rpcDeviceList.forEach(dvRpc => {
        this.getLastestStatusRpc(dvRpc);
      });
    });

    this.deviceID = 'all';
    this.setDamTomId(event);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    // NB - fix
    this.dieuKhienService.damTomIdSelected.next(event);
    this.dieuKhienService.damTomId = this.damTomId;

    this.getRpcRem();
  }

  ionViewWillEnter() {
    this.isChangeDam = false;
    // this.createForm.get('loaiDieuKhien').setValue(0);
    this.ngUnsubscribe = new Subject<void>();
    this.isLoading = true;
    if (this.damTomId != null){
      this.dieuKhienService.getCountNewLs(this.damTomId).subscribe((res) => {
        this.countNewHistory = res;
      });
    }
    if (this.segment === 3) {
      this.tabLichSu?.preLoadData();
    }
    // NB - toi uu dk thu cong
    if (!this.isInit){
      this.updateRpcs();
    }
    // update realtime dk thu cong
    this.startIntervalDkThuCong();
    // this.getDataDamtomsFromLocalStorage();

    // update status rem
    this.startIntervalStatusRem();
  }
  ionViewDidEnter() {
    this.tabThuCong.onViewEnter();
  }
  ionViewWillLeave() {
    // Set lại bằng false để từ lần thứ hai có thể gọi hàm get ds đầm tôm trong viewWillEnter
    this.isInit = false;
    // clearInterval(this.interval);
    this.check = 0;
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
    // this.nhomDkComponent.ionViewWillLeave();
    this.tabThuCong.onViewLeave();

    // stop interval dk thu cong
    this.stopIntervalDkThuCong();

    // stop interval rem
    this.stopIntervalRem();
  }

  async segmentChanged(event: any) {
    this.segment = event.detail.value;
    await this.slider.slideTo(event.detail.value);
  }
  public async slideChanged() {
    // clearInterval(this.interval);
    // this.interval = null;
    this.router.navigate(['.'], {
      relativeTo: this.route
    });
    this.goTop();
    this.segment = await this.slider.getActiveIndex();
    this.focusSegment(this.segment + 1);
    this.createForm.get('loaiDieuKhien').setValue(this.segment);
    if (this.segment === 0) {
      // this.nhomDkComponent.ionViewWillEnter(this.damTomId);
      this.tabThuCong.onViewEnter();
    }
    if (this.segment !== 0){
      this.tabThuCong.onViewLeave();
      this.stopIntervalDkThuCong();
    } else {
      this.startIntervalDkThuCong();
    }
    if (this.segment === 3) {
      this.currentDate = moment(new Date()).add(7, 'hours').toISOString();
      this.toDate = moment().toISOString();
      this.fromDate = moment(new Date().setDate(this.dateFrom)).startOf('date').toDate().toISOString();
      this.getDeviceZone();
      // this.startInterval(); Dung refresh roi nen khong can nua
    }
    if (this.segment !== 3){
      this.tabLichSu.lstLichsu = [];
      this.dieuKhienService.getCountNewLs(this.damTomId).subscribe((res) => {
        this.countNewHistory = res;
      });
      // this.stopInterval(); Dung refresh roi nen khong can nua
    }
  }

  focusSegment(segmentId) {
    document.getElementById('seg-' + segmentId).scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }

  getcountNewHistory(ev) {
    if (ev === false){
      this.countNewHistory++;
    }
    else{
      this.countNewHistory = ev;
    }
  }

   // ChuongNV - 28/8/2021
  getDeviceZone() {
    this.deviceService.getDeviceRpcWithZone(this.damTomId).subscribe((res) => {
      this.setLstRpcZone(res);
      this.isLoading = false;
    });
  }
  setLstRpcZone(data) {
    // kiểm tra nếu dữ liệu thay đổi thì mới cập nhật
    if (!arrayEqual(data, this.lstRpcZone)) {
      this.lstRpcZone = data;
    }
  }
  getLstRpcZone(): DeviceRpcZone[] {
    return this.lstRpcZone;
  }
  datesValid() {
    return Date.parse(this.toDate) > Date.parse(this.fromDate);
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
  segmentButtonClicked(event) {
    event.target.scrollIntoView({
      behavior: 'smooth', //  smooth value triggers smooth scroll.
      inline: 'center'
    });
  }
  doRefresh(event){
    setTimeout(() => {
      if (this.segment === 3) {
        this.currentDate = moment(new Date()).add(7, 'hours').toISOString();
        this.toDate = moment().toISOString();
        this.dieuKhienService.getCountNewLs(this.damTomId).subscribe((res) => {
          this.countNewHistory = res;
        });
      }
      if (this.segment === 0) {
        this.refreshDamTomSelected();
      }
      event.target.complete();
    }, 2000);
  }
}
