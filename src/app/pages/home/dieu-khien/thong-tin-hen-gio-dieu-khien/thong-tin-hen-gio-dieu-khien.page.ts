import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ModalController,
  LoadingController,
  ToastController,
  AlertController,
  NavController,
  IonContent,
  IonRadioGroup,
} from '@ionic/angular';
import * as moment from 'moment';
import { catchError, finalize, tap } from 'rxjs/operators';
import { DeviceService } from 'src/app/core/services/device-service';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import {
  DeviceRpc,
  DeviceRpcZone,
  RpcScheduleDto,
} from 'src/app/shared/models/dieukhien.model';
import { escapedHTML } from 'src/app/shared/utils';
import { ZoneRpc } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/add-device-special/add-device-special.component';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-thong-tin-hen-gio-dieu-khien',
  templateUrl: './thong-tin-hen-gio-dieu-khien.page.html',
  styleUrls: ['./thong-tin-hen-gio-dieu-khien.page.scss'],
})
export class ThongTinHenGioDieuKhienPage implements OnInit {
  numberSelect: Array<number> = [];
  // form: FormGroup;
  damTomId;
  damTomName;
  isLoading = false;
  statusExistTen = false;
  selectRpcOption;
  listGroupRPC;
  scheduleId;
  checkCallbackOption;
  checkLoopOption;
  createForm: FormGroup;
  timeVaoLuc: any = '00:00:00';
  tenBoHenGio;
  // toggleBatTat = 0;
  cronSchedule = '';
  // checkScheduleName;
  isGoTop = false;
  @ViewChild(IonContent) gotoTop: IonContent;
  scheduleDayOfWeek = {
    t2: false,
    t3: false,
    t4: false,
    t5: false,
    t6: false,
    t7: false,
    cn: false,
  };
  customPopoverOptions: any = {
    header: 'Thiết bị',
    cssClass: 'my-custom-popover',
  };
  customPopoverOptions1: any = {
    header: 'Nhóm điều khiển',
    cssClass: 'my-custom-popover',
  };
  customPopoverOptions2: any = {
    cssClass: 'my-custom-popover',
  };
  // rpcOption: any[] = [
  //   { value: 'rpc', display: 'Thiết bị' },
  //   { value: 'groupRpc', display: 'Nhóm điều khiển' },
  // ];

  @ViewChild ('radioGroup') radioGroup: IonRadioGroup;
  optionSelected = 'rem';
  isInvalidPercent = true;
  listPercent = [25, 50, 75, 100];
  titlePullPush = 'Tỷ lệ';
  deviceZones: DeviceRpcZone[] = [];
  rpcScheduleData: RpcScheduleDto;

  isFirstTimeDoCheck = false;

  constructor(
    // tslint:disable-next-line: variable-name
    private _activatedRoute: ActivatedRoute,
    // tslint:disable-next-line: variable-name
    public _modalController: ModalController,
    // tslint:disable-next-line: variable-name
    private _fb: FormBuilder,
    private dieuKhienService: DieuKhienService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private navCtrl: NavController,
    private _deviceService: DeviceService,
  ) {
    this._activatedRoute.queryParams.subscribe((params) => {
      this.damTomId = params.damTomId;
      this.damTomName = params.damTomName;
      this.scheduleId = params.id;
    });
  }
  initFormData() {
    this.createForm = this._fb.group({
      ten: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?!\\s*$).+'),
          Validators.maxLength(255),
        ],
      ],
      // rpcOption: ['groupRpc'],
      // active: [true],
      callbackOption: [false],
      cron: [''],
      damTomId: [''],
      deviceId: [null],
      groupRpcId: [null],
      loopCount: [{ value: 1, disabled: true }],
      loopOption: [{ value: false, disabled: true }],
      loopTimeStep: [{ value: '00:00:00', disabled: true }],
      vaoluc: this.timeVaoLuc,
      rpcSettingId: [''],
      timeCallback: [{ value: '00:00:00', disabled: true }],
      valueControl: [true],

      optionControl: ['PUSH'],
      percentControl: [0,[Validators.required, Validators.maxLength(3), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    });
  }

  // Get device with zone
  getDeviceZone() {
    this._deviceService.getDeviceRpcWithZone(this.damTomId).subscribe((res) => {
      this.deviceZones = res;
    });
  }

  ngOnInit() {
    for (let i = 1; i <= 100; i++) {
      this.numberSelect.push(i);
    }
    this.initFormData();
  }

  async ionViewWillEnter() {
    this.isLoading = true;
    await this.getDeviceZone();
    await this.getAllBoDieuKhien(this.damTomId);
    await this.getdata();
    // this.dieuKhienService.getAllRpcSchedule(this.damTomId).subscribe(data => {
    //   this.checkScheduleName = data;
    //   this.isLoading=false;
    // });
  }

  validate(fieldName: string, errorName: string) {
    // tslint:disable-next-line: max-line-length
    return (
      (this.createForm.controls[fieldName].touched ||
        this.createForm.controls[fieldName].dirty) &&
      this.createForm.controls[fieldName].hasError(errorName)
    );
  }

  toggleDayOfWeek(value) {
    this.scheduleDayOfWeek[value] = !this.scheduleDayOfWeek[value];
    this.createForm.markAsTouched();
    this.createForm.markAsDirty();
  }

  // selectRPC(event: any) {
  //   this.selectRpcOption = event.detail.value;
  //   // this.createForm.value.rpcOption = event.detail.value;
  //   if (event.detail.value === 'groupRpc') {
  //     this.createForm.get('deviceId').setValue(null);
  //   }
  //   if (event.detail.value === 'rpc') {
  //     this.createForm.get('groupRpcId').setValue(null);
  //     this.createForm.patchValue({ loopCount: 1 });
  //   }
  // }

  async getAllBoDieuKhien(damTomId: string) {
    // tslint:disable-next-line: deprecation
    const data = await this.dieuKhienService
      .getAllGroupRpc(damTomId)
      .toPromise();
    if (data !== null && data !== undefined) {
      this.listGroupRPC = data;
    }
  }

  callbackOptionCheckbox() {
    this.checkCallbackOption = this.createForm.get('callbackOption').value;
    if (this.checkCallbackOption) {
      this.createForm.controls.timeCallback.enable();
      this.createForm.controls.loopOption.enable();
      if (this.checkLoopOption) {
        this.createForm.controls.loopTimeStep.enable();
        this.createForm.controls.loopCount.enable();
      }
      this.createForm.markAsTouched();
    } else {
      this.checkLoopOption = false; // ChuongNV
      this.createForm.get('loopOption').setValue(false); // ChuongNV
      this.createForm.controls.loopCount.disable();
      this.createForm.controls.timeCallback.disable();
      this.createForm.controls.loopTimeStep.disable();
      this.createForm.controls.loopOption.disable();
      this.createForm.patchValue({ loopTimeStep: '00:00:00' });
      this.createForm.patchValue({ loopCount: 1 });
      this.createForm.patchValue({ timeCallback: '00:00:00' });
      this.createForm.markAsTouched();
    }
  }

  loopOptionCheckbox() {
    this.checkLoopOption = this.createForm.get('loopOption').value;
    if (this.checkLoopOption) {
      this.createForm.controls.loopTimeStep.enable();
      this.createForm.controls.loopCount.enable();
      this.createForm.markAsTouched();
    } else {
      this.createForm.controls.loopCount.disable();
      this.createForm.patchValue({ loopTimeStep: '00:00:00' });
      this.createForm.controls.loopTimeStep.disable();
      this.createForm.patchValue({ loopCount: 1 });
      this.createForm.markAsTouched();
    }
  }

  setVaoLuc(event: any) {
    this.timeVaoLuc = event.detail.value;
    this.createForm.markAsTouched();
  }

  convertToCron() {
    let seconds;
    let minutes;
    let hour;
    if (this.timeVaoLuc === '00:00:00') {
      seconds = 0;
      minutes = 0;
      hour = 0;
    } else {
      seconds = new Date(this.timeVaoLuc).getSeconds();
      minutes = new Date(this.timeVaoLuc).getMinutes();
      hour = new Date(this.timeVaoLuc).getHours();
    }
    const day = [];
    if (this.scheduleDayOfWeek.t2) {
      day.push(1);
    }
    if (this.scheduleDayOfWeek.t3) {
      day.push(2);
    }
    if (this.scheduleDayOfWeek.t4) {
      day.push(3);
    }
    if (this.scheduleDayOfWeek.t5) {
      day.push(4);
    }
    if (this.scheduleDayOfWeek.t6) {
      day.push(5);
    }
    if (this.scheduleDayOfWeek.t7) {
      day.push(6);
    }
    if (this.scheduleDayOfWeek.cn) {
      day.push(7);
    }
    // if (day.length < 1) {
    //   const date = new Date().getDate();
    //   const month = new Date().getMonth();
    //   this.cronSchedule = `0 ${minutes} ${hour} ${date} ${month} *`;
    // }
    if (day.length > 0) {
      this.cronSchedule = `${seconds} ${minutes} ${hour} * * ${day}`;
    }
  }

  private showToast(message: string, color: string) {
    this.toastCtrl
      .create({
        message,
        color,
        duration: 2000,
      })
      .then((toastEL) => toastEL.present());
  }

  // checkTrungTen() {
  //   if (this.checkScheduleName !== null && this.checkScheduleName !== undefined) {
  //     for (const scheduleName of this.checkScheduleName) {
  //       // tslint:disable-next-line: max-line-length
  // tslint:disable-next-line: max-line-length
  //       if (scheduleName.name.toLowerCase().trim() === this.createForm.get('ten').value.toLowerCase().trim() && scheduleName.id !== this.scheduleId) {
  //         return true;
  //       }
  //     }
  //   }
  // }

  toMillis(str: string): number {
    const arr = str.split(':');
    // chỉ xử lý định dạng HH:mm:ss hoặc HH:mm
    if (arr.length < 2 || arr.length > 3) {
      return;
    }
    // tslint:disable-next-line: radix
    const hour = !!arr[0] ? parseInt(arr[0]) : 0;
    // tslint:disable-next-line: radix
    const minute = !!arr[1] ? parseInt(arr[1]) : 0;
    // tslint:disable-next-line: radix
    const second = !!arr[2] ? parseInt(arr[2]) : 0;

    return hour * 60 * 60 * 1000 + minute * 60 * 1000 + second * 1000;
  }

  saveRpcSchedule() {
    this.convertToCron();
    if (!this.createForm.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Cập nhật bộ hẹn giờ...',
      })
      .then((loadingEl) => {
        loadingEl.present();
        if (this.createForm.valid) {
          const rpcSchedule: RpcScheduleDto = {
            active: true,
            callbackOption: this.createForm.get('callbackOption').value,
            cron: this.cronSchedule,
            damTomId: this.damTomId,
            deviceId:
              this.selectRpcOption === 'groupRpc'
                ? null
                : this.createForm.get('deviceId').value,
            groupRpcId:
              this.selectRpcOption === 'rpc' || this.selectRpcOption === 'rem'
                ? null
                : this.createForm.get('groupRpcId').value,
            id: this.scheduleId,
            loopCount: this.createForm.get('loopCount').value,
            loopOption: this.createForm.get('loopOption').value,
            loopTimeStep: this.toMillis(
              this.createForm.get('loopTimeStep').value
            ),
            name: this.createForm.get('ten').value.trim(),
            rpcSettingId: this.createForm.get('rpcSettingId').value,
            timeCallback: this.toMillis(
              this.createForm.get('timeCallback').value
            ),
            valueControl:
              this.createForm.get('valueControl').value === true ? 1 : 0,
            actionRem: this.selectRpcOption === 'rem'  ? this.createForm.get('optionControl').value : null,
            percentRem: this.selectRpcOption === 'rem' ? this.createForm.get('percentControl').value : null,
          };
          // tslint:disable-next-line: deprecation
          this.dieuKhienService
            .updateRpcSchedule(this.scheduleId, rpcSchedule)
            .subscribe(
              (rs) => {
                loadingEl.dismiss();
                this.createForm.reset();
                this.createForm.markAsPristine();
                this.navCtrl.back();
              },
              (error) => {
                if (error?.error === 'Tên hẹn giờ điều khiển đã tồn tại!'){
                  this.statusExistTen = true;
                }
                loadingEl.dismiss().finally(() => {
                  this.gotoTop.scrollToTop(0);
                });
              },
              () => {
                const MESEAGE = 'Cập nhật thành công!';
                const COLOR = 'success';
                this.showToast(MESEAGE, COLOR);
              }
            );
        }
      });
  }

  getdata() {
    // tslint:disable-next-line: deprecation
    this.dieuKhienService
      .getRpcScheduleById(this.scheduleId)
      .subscribe((rs) => {
        this.rpcScheduleData = rs;

        console.log('get data schedule', this.rpcScheduleData);
        
        if (rs.groupRpcId === null && rs.actionRem == null) {
          // this.createForm.patchValue({ rpcOption: 'rpc' });
          this.selectRpcOption = 'rpc';
        } 
        if (rs.groupRpcId !== null && rs.actionRem == null) {
          // this.createForm.patchValue({ rpcOption: 'groupRpc' });
          this.selectRpcOption = 'groupRpc';
        }
        if (rs.actionRem !== null) {
          this.selectRpcOption = 'rem';
        }
        
        this.tenBoHenGio = rs.name;
        this.checkLoopOption = rs.loopOption;
        if (this.checkLoopOption) {
          this.createForm.controls.loopTimeStep.enable();
          this.createForm.controls.loopCount.enable();
        }
        this.checkCallbackOption = rs.callbackOption;
        if (this.checkCallbackOption) {
          this.createForm.controls.timeCallback.enable();
          this.createForm.controls.loopOption.enable();
        }

        this.toMillis(this.createForm.get('timeCallback').value);
        const [second, minutes, hour, days, month, week] = rs.cron.split(' ');
        const weekLoop = week.split(' ')[0];
        if (weekLoop.includes('1')) {
          this.scheduleDayOfWeek.t2 = true;
        }
        if (weekLoop.includes('2')) {
          this.scheduleDayOfWeek.t3 = true;
        }
        if (weekLoop.includes('3')) {
          this.scheduleDayOfWeek.t4 = true;
        }
        if (weekLoop.includes('4')) {
          this.scheduleDayOfWeek.t5 = true;
        }
        if (weekLoop.includes('5')) {
          this.scheduleDayOfWeek.t6 = true;
        }
        if (weekLoop.includes('6')) {
          this.scheduleDayOfWeek.t7 = true;
        }
        if (weekLoop.includes('7')) {
          this.scheduleDayOfWeek.cn = true;
        }
        // tslint:disable-next-line: max-line-length
        const vaoluc =
          this.converToNumber(second) * 1000 +
          this.converToNumber(minutes) * 60 * 1000 +
          this.converToNumber(hour) * 60 * 60 * 1000;
        this.timeVaoLuc = new Date(
          moment(new Date()).startOf('date').toDate().getTime() + vaoluc
        ).toISOString();
        this.setValue(rs);
      });
  }

  converToNumber(arr: any) {
    if (arr === '*') {
      return 0;
    } else {
      return Number(arr);
    }
  }

  setValue(rs) {
    // this.createForm.patchValue({ active: rs.active });
    this.createForm.patchValue({ callbackOption: rs.callbackOption });
    this.createForm.patchValue({ ten: rs.name });
    this.createForm.patchValue({ groupRpcId: rs.groupRpcId });
    this.createForm.patchValue({ deviceId: rs.deviceId });
    this.createForm.patchValue({ loopCount: rs.loopCount ? rs.loopCount : 1 });
    this.createForm.patchValue({ loopOption: rs.loopOption });
    this.createForm.patchValue({ vaoluc: this.timeVaoLuc });
    // tslint:disable-next-line: max-line-length
    this.createForm.patchValue({
      loopTimeStep: moment(
        moment(new Date()).startOf('date').toDate().getTime() + rs.loopTimeStep
      ).format('HH:mm:ss'),
    });
    this.createForm.patchValue({ rpcSettingId: rs.rpcSettingId });
    // tslint:disable-next-line: max-line-length
    this.createForm.patchValue({
      timeCallback: moment(
        moment(new Date()).startOf('date').toDate().getTime() + rs.timeCallback
      ).format('HH:mm:ss'),
    });
    this.createForm.patchValue({
      valueControl: rs.valueControl === 1 ? true : false,
    });
    this.createForm.get('optionControl').patchValue(rs.actionRem);
    this.createForm.get('percentControl').patchValue(rs.percentRem);
    this.isLoading = false;
  }

  onDelete() {
    this.alertController
      .create({
        // header: 'Xóa bộ điều khiển',
        message: escapedHTML(`Xóa hẹn giờ "${this.tenBoHenGio}" ?`),
        cssClass: 'my-alert-custom-class',
        buttons: [
          {
            text: 'Quay lại',
            role: 'Cancel',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              this.loadingCtrl
                .create({
                  message: 'Xóa...',
                })
                .then((loadingEl) => {
                  this.createForm.markAsPristine();
                  loadingEl.present();
                  this.dieuKhienService
                    .deleteRpcSchedule(this.scheduleId)
                    .pipe(
                      tap((rs) => {
                        this.toastCtrl
                          .create({
                            duration: 2000,
                            color: 'success',
                            position: 'bottom',
                            message: 'Xóa thành công!',
                          })
                          .then((toastCtrl) => {
                            toastCtrl.present();
                          });
                        loadingEl.dismiss();
                        this.navCtrl.back();
                      }),
                      finalize(() => {}),
                      catchError((error) => {
                        this.toastCtrl
                          .create({
                            duration: 2000,
                            position: 'bottom',
                            color: 'danger',
                            message: 'Xóa thất bại',
                          })
                          .then((toastCtrl) => {
                            toastCtrl.present();
                          });
                        return null;
                      })
                      // tslint:disable-next-line: deprecation
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

  validateSelect() {
    if (
      this.createForm.get('deviceId').value === null && this.selectRpcOption === 'rpc'
    ) {
      return true;
    }
    if (
      this.createForm.get('groupRpcId').value === null && this.selectRpcOption === 'groupRpc'
    ) {
      return true;
    }
    if (this.createForm.get('deviceId').value === null && this.selectRpcOption === 'rem') return true;
    if (this.createForm.get('percentControl').value == null && this.selectRpcOption === 'rem') return true;
  }

  validateLoop() {
    const day = [];
    if (this.scheduleDayOfWeek.t2) {
      day.push(1);
    }
    if (this.scheduleDayOfWeek.t3) {
      day.push(2);
    }
    if (this.scheduleDayOfWeek.t4) {
      day.push(3);
    }
    if (this.scheduleDayOfWeek.t5) {
      day.push(4);
    }
    if (this.scheduleDayOfWeek.t6) {
      day.push(5);
    }
    if (this.scheduleDayOfWeek.t7) {
      day.push(6);
    }
    if (this.scheduleDayOfWeek.cn) {
      day.push(7);
    }
    if (day.length < 1) {
      return true;
    } else {
      return false;
    }
  }
  doRefresh(event) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 1000);
  }
  changeNameHG(){
    this.statusExistTen = false;
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

  changePullPush(event) {
    if (event.detail.value === 'PUSH') {
      this.titlePullPush = "Tỷ lệ rải";
    } else {
      this.titlePullPush = "Tỷ lệ thu";
    }
    if (event.detail.value !== this.rpcScheduleData.actionRem) {
      this.createForm.get('deviceId').reset();
      this.createForm.get('percentControl').reset();
    } else {
      this.createForm.get('deviceId').patchValue(this.rpcScheduleData.deviceId);
      this.createForm.get('percentControl').patchValue(this.rpcScheduleData.percentRem);
    }
    this.radioGroup.value = ''; 
  }
  changePercentInput(event) {
    const elementError = document.getElementById('error');
    if (parseInt(event.detail.value, 10) <= 100 && parseInt(event.detail.value, 10) > 0) {
      elementError.classList.add('hidden');
      this.isInvalidPercent = false;
      if (event.detail.value !== '25' && event.detail.value !== '50' && event.detail.value !== '75' && event.detail.value !== '100') 
      {
        this.radioGroup.value = null;
      } 
      else {
        this.radioGroup.value = parseInt(event.detail.value, 10);
      }
    } else if (parseInt(event.detail.value, 10) > 100 ) {
      this.isInvalidPercent = true;
      elementError.classList.remove('hidden');
    } else if (parseInt(event.detail.value, 10) < 0) {
      elementError.classList.remove('hidden');
    } else {
      this.isInvalidPercent = true;
      elementError.classList.add('hidden');
    }
  }
  changeRadioPercent(event: any) {
    if (event.detail.value !== null) {
      this.createForm.get('percentControl').setValue(event.detail.value);
    }
  }
  msToTime() {
    var duration = 0;
    var deviceRem: SpecialDevice;
    deviceRem = this.getRem(this.createForm.get('deviceId').value, this.createForm.get('optionControl').value);
    if (!!this.createForm.value.percentControl && !!deviceRem) {
      duration = (deviceRem.finishTime / 100) * this.createForm.value.percentControl;
    } else {
      return '00:00:00';
    }

    // convert 00:00:00
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    let hoursStr = (hours < 10) ? '0' + hours : hours.toString();
    let minutesStr = (minutes < 10) ? '0' + minutes : minutes.toString();
    let secondsStr = (seconds < 10) ? '0' + seconds : seconds.toString();
  
    return hoursStr + ":" + minutesStr + ":" + secondsStr;
  }
  getRem(rpcId: string, actionRem: string): SpecialDevice {
    var rem: SpecialDevice;
    if (actionRem === 'PUSH') {
      this.deviceZones.forEach(zone => {
        if (!!zone.rpcRemList.find(rem => rem.rpcPushId === rpcId)) {
          rem = zone.rpcRemList.find(rem => rem.rpcPushId === rpcId);
        }
      })
    } else {
      this.deviceZones.forEach(zone => {
        if (!!zone.rpcRemList.find(rem => rem.rpcPullId === rpcId)) {
          rem = zone.rpcRemList.find(rem => rem.rpcPullId === rpcId);
        }
      })
    }    
    return rem;
  }
  selectRadioRem() {
    this.selectRpcOption = 'rem';
    this.createForm.get('optionControl').patchValue('PUSH');
  }

}
