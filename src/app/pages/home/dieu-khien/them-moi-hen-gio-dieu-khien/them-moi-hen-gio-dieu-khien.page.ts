import { DeviceRpcZone, RpcScheduleDto } from './../../../../shared/models/dieukhien.model';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ModalController,
  LoadingController,
  ToastController,
  NavController,
  IonContent,
  IonRadioGroup,
} from '@ionic/angular';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { ZoneRpc } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/add-device-special/add-device-special.component';
import { DeviceService } from 'src/app/core/services/device-service';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-them-moi-hen-gio-dieu-khien',
  templateUrl: './them-moi-hen-gio-dieu-khien.page.html',
  styleUrls: ['./them-moi-hen-gio-dieu-khien.page.scss'],
})
export class ThemMoiHenGioDieuKhienPage implements OnInit {
  // @Input() devices: Device[];
  // @Input() groupRpcs: GroupRpc[];

  // form: FormGroup;
  numberSelect: Array<number> = [];
  damTomId;
  damTomName;
  isLoading = false;
  statusExistTen = false;
  selectRpcOption;
  listGroupRPC;
  checkCallbackOption;
  checkLoopOption;
  createForm: FormGroup;
  timeVaoLuc = '00:00:00';
  // toggleBatTat = 0;
  cronSchedule = '';
  // checkScheduleName;
  isGoTop = false;
  @ViewChild(IonContent) gotoTop: IonContent;
  scheduleDayOfWeek = {
    t2: true,
    t3: true,
    t4: true,
    t5: true,
    t6: true,
    t7: true,
    cn: true,
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
  //   { value: 'groupRpc', display: 'Nhóm điều khiển' },
  //   { value: 'rpc', display: 'Thiết bị' },
  // ];

  @ViewChild ('radioGroup') radioGroup: IonRadioGroup;
  isInvalidPercent = true;
  listPercent = [25, 50, 75, 100];
  titlePullPush = 'Tỷ lệ';
  deviceZones: DeviceRpcZone[] = [];

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
    private navCtrl: NavController,
    private _deviceService: DeviceService,
  ) {
    this._activatedRoute.queryParams.subscribe((params) => {
      this.damTomId = params.damTomId;
      this.damTomName = params.damTomName;
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
      vaoluc: ['00:00:00'],
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

  async ngOnInit() {
    for (let i = 1; i <= 100; i++) {
      this.numberSelect.push(i);
    }
    this.selectRpcOption = 'rpc';
    this.initFormData();
  }
  async ionViewWillEnter() {
    this.isLoading = true;
    await this.getDeviceZone();
    // this.selectRpcOption = this.rpcOption[0].value;
    await this.getAllBoDieuKhien(this.damTomId);
    this.isLoading = false;
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
    }
  }

  loopOptionCheckbox() {
    this.checkLoopOption = this.createForm.get('loopOption').value;
    if (this.checkLoopOption) {
      this.createForm.controls.loopTimeStep.enable();
      this.createForm.controls.loopCount.enable();
    } else {
      this.createForm.controls.loopCount.disable();
      // this.createForm.controls.loopCount.reset();
      this.createForm.patchValue({ loopTimeStep: '00:00:00' });
      this.createForm.controls.loopTimeStep.disable();
      this.createForm.patchValue({ loopCount: 1 });
    }
  }

  setVaoLuc(event: any) {
    this.timeVaoLuc = event.detail.value;
    this.createForm.markAsDirty();
  }

  convertToCron() {
    let seconds;
    let minutes;
    let hour;
    if (this.timeVaoLuc === '00:00:00') {
      seconds = 0;
      minutes = 0;
      hour = 0;
    }
    // else {
    //   seconds =  new Date(this.timeVaoLuc).getSeconds();
    //   minutes = new Date(this.timeVaoLuc).getMinutes();
    //   hour = new Date(this.timeVaoLuc).getHours();
    // }
    else {
      [hour, minutes, seconds] = this.timeVaoLuc.split(':');
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

  private showToast(message: string, color: string) {
    this.toastCtrl
      .create({
        message,
        color,
        duration: 2000,
      })
      .then((toastEL) => toastEL.present());
  }
  // convertTimeToTs(time): number {
  //   let hour = new Date(time).getHours();
  //   let minutes = new Date(time).getMinutes();
  //   let second = new Date(time).getSeconds();
  //   if (time === 0) {
  //     hour = 0;
  //     minutes = 0;
  //     second = 0;
  //   }
  //   const timeResult = hour * 60 * 60 * 1000 + minutes * 60 * 1000 + second * 1000;
  //   return timeResult;
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
        message: 'Thêm mới bộ hẹn giờ...',
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
            id: null,
            loopCount: this.createForm.get('loopCount').value,
            loopOption: this.createForm.get('loopOption').value,
            // loopTimeStep: this.convertTimeToTs(this.createForm.get('loopTimeStep').value),
            loopTimeStep: this.toMillis(
              this.createForm.get('loopTimeStep').value
            ),
            name: this.createForm.get('ten').value.trim(),
            rpcSettingId: null,
            // timeCallback: this.convertTimeToTs(this.createForm.get('timeCallback').value),
            timeCallback: this.toMillis(
              this.createForm.get('timeCallback').value
            ),
            valueControl:
              this.createForm.get('valueControl').value === true ? 1 : 0,
            actionRem: this.selectRpcOption === 'rem'  ? this.createForm.get('optionControl').value : null,
            percentRem: this.selectRpcOption === 'rem' ? this.createForm.get('percentControl').value : null,
          };
          // tslint:disable-next-line: deprecation
          this.dieuKhienService.saveRpcSchedule(rpcSchedule).subscribe(
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
              const MESEAGE = 'Thêm mới thành công!';
              const COLOR = 'success';
              this.showToast(MESEAGE, COLOR);
            }
          );
        }
      });
  }

  getLoopCountOptions() {
    return this.numberSelect.map((el) => ({ value: el, display: el }));
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
    this.createForm.get('percentControl').setValue('');
    this.createForm.get('deviceId').reset();
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
      console.log('invalid');
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
  changeOption(selectRpcOption: string) {
    this.selectRpcOption = selectRpcOption;
    this.createForm.get('deviceId').reset();
  }
}
