import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { ZoneRpc, rpcRemDto } from '../add-device-special/add-device-special.component';
import { SettingDeviceSpecial } from '../add-device-special/settingDeviceSpecial.model';
import { SpecialDevice } from '../thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-info-device-special',
  templateUrl: './info-device-special.component.html',
  styleUrls: ['./info-device-special.component.scss'],
})
export class InfoDeviceSpecialComponent implements OnInit {
  settingDeviceSpecial: SettingDeviceSpecial = new SettingDeviceSpecial();

  @Input() damTomId: string;
  @Input() gatewayId: string
  @Input() specialDv: SpecialDevice;
  // tslint:disable-next-line: align
  @Input() idRpcPull: string;
  @Input() idRpcPush: string;
  intervalTimeProcess = null;

  isResetTime = true;
  isStopTime = false;
  isContinue = false;

  formEditRem: FormGroup;
  deviceRaiRem: {
    deviceId?: string,
    deviceType?: string,
    label?: string,
    tenThietBi?: string,
    isChecked?: boolean
  } = {};
  deviceThuRem: {
    deviceId?: string,
    deviceType?: string,
    label?: string,
    tenThietBi?: string,
    isChecked?: boolean
  } = {};
  customActionSheetOptions: any = {
    header: 'Chọn thiết bị',
    cssClass: 'custom-action-sheet-special-device',
  };
  listZoneRem: ZoneRpc[] = [];
  maxTime;
  minuteValues: number[] = [];

  constructor(
    private modalCtrl: ModalController,
    private damtomService: QuantridamtomService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.maxTime = 30 * 60 * 1000;

    this.maxTime = 30 * 60 * 1000;
    
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    // limit 30 minute
    for(var i = 0; i<=30; i++) {
      this.minuteValues.push(i);
    }

    // console.log('ngOnInit',  this.idRpcPull, this.idRpcPush);
    this.formEditRem = this.fb.group({
      nameSpecialDevice: ['', Validators.required],
      totalTime: [{value: new Date(date).toISOString(), disabled: false}, Validators.required]
    });
    this.getZoneRem();
    this.getInfoSpecialDevice();
  }

  getZoneRem() {
    this.damtomService.getZoneRpcRem(this.damTomId, this.specialDv.id).subscribe(resData => {
      this.listZoneRem = resData;      

      this.listZoneRem.forEach(zone => {
        zone.listIdRpc = [];
      });

      this.listZoneRem.forEach(zone => {
        zone.rpcDeviceList = zone.rpcDeviceList.filter(rem => rem.deviceType === 'REM');
        zone.rpcDeviceList.forEach(rem => {
          rem.isChecked = false;

          zone.listIdRpc.push(rem.deviceId);
        });
      });
      // console.log('listZoneRem', this.listZoneRem);
    });
  }
  getInfoSpecialDevice() {
    // this.damtomService.getSpecialDvById(this.specialDv.id).subscribe(resData => {
    //   // console.log(resData, this.specialDv);
    // });

    this.deviceRaiRem.deviceId = this.idRpcPush;
    this.deviceThuRem.deviceId = this.idRpcPull;

    this.deviceRaiRem.tenThietBi = this.specialDv.rpcPushDevice.tenThietBi;
    this.deviceThuRem.tenThietBi = this.specialDv.rpcPullDevice.tenThietBi;
    this.deviceRaiRem.label  = this.specialDv.rpcPushDevice.label;
    this.deviceThuRem.label  = this.specialDv.rpcPullDevice.label;

    this.formEditRem.get('nameSpecialDevice').setValue(this.specialDv.name);

    var date = new Date(this.specialDv.finishTime);
    date.setHours(0);
    this.formEditRem.get('totalTime').setValue(date.toString());
  }
  huy() {
    this.modalCtrl.dismiss();
  }
  onSubmit() {
    const remDto: rpcRemDto = {
      id: this.specialDv.id,
      damtomId: this.damTomId,
      gatewayId: this.gatewayId,
      finishTime: this.timeToMs(this.formEditRem.get('totalTime').value),
      name: this.formEditRem.get('nameSpecialDevice').value,
      rpcPullId: this.deviceThuRem.deviceId, // thu rem
      rpcPushId: this.deviceRaiRem.deviceId // rai rem
    };
    
    if (this.formEditRem.get('nameSpecialDevice').value.length > 0
        && this.deviceRaiRem !== undefined && this.deviceThuRem !== undefined) {
      this.damtomService.saveDeviceRem(remDto).subscribe(resData => {
        this.modalCtrl.dismiss({
          specialDevice: remDto,
        });
        this.showToast('Cập nhật thiết bị đặc biệt thành công!', 'success');
      }, error => {
        console.log('error add special device', error);
        this.showToast('Có lỗi xảy ra!', 'danger');
      });
    } else {
      return;
    }
  }
  // convert time to milliseconds
  timeToMs(dateTime: string): number {
    var date = new Date(dateTime);
    var minute = date.getMinutes();
    var seconds = date.getSeconds();

    var miliseconds = minute * 60 * 1000 + seconds * 1000;

    return miliseconds;
  } 
  // Show toast
  private showToast(meseage: string, inputColor: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color: inputColor,
        duration: 2000,
      })
      .then((toatEL) => toatEL.present());
  }
  async addRaiRem(event: any) {
    this.listZoneRem.forEach(zone => {
      zone.rpcDeviceList.forEach(rem => {
        rem.isChecked = false;
      });
    });

    this.deviceRaiRem.deviceId = event;
    // find rem trong zone
    this.listZoneRem.forEach(zone => {
      const remSelected = zone.rpcDeviceList.find(device => device.deviceId === event);
      if (!!remSelected) {
        remSelected.isChecked = !remSelected.isChecked;
      }
      console.log('event rai rem', remSelected);

    });
    // find zone selected
    this.listZoneRem.forEach(zone => {
      zone.zoneChecked = zone.listIdRpc.includes(this.deviceRaiRem.deviceId);
    });
  }

  async addThuRem(event: any) {
    this.deviceThuRem = event;
  }

  resetSlider() {
    this.settingDeviceSpecial.totalTime = 0;
  }

  msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    let hoursStr = (hours < 10) ? '0' + hours : hours.toString();
    let minutesStr = (minutes < 10) ? '0' + minutes : minutes.toString();
    let secondsStr = (seconds < 10) ? '0' + seconds : seconds.toString();
  
    return hoursStr + ":" + minutesStr + ":" + secondsStr;
  }

    //  stopTime() {
    //   this.isStopTime = false;
    //   this.isResetTime = true;
    //   this.isContinue = true;
    //   this.stopUpdateTime();
    // }
  
    // resetTime() {
    //   this.isResetTime = false;
    //   this.isContinue = false;
    //   this.isStopTime = true;
    //   this.stopUpdateTime();
  
    //   this.settingDeviceSpecial.timeProcess = 0;
    //   this.settingDeviceSpecial.totalTime = this.settingDeviceSpecial.timeProcess;
  
    //   this.intervalTimeProcess = setInterval(() => {
    //     this.settingDeviceSpecial.timeProcess = Number(this.settingDeviceSpecial.timeProcess) + 1000;
    //     this.settingDeviceSpecial.totalTime = this.settingDeviceSpecial.timeProcess;
    //   }, 1000);
    // }
  
    // continueTime() {
    //   this.isStopTime = true;
    //   this.isResetTime = false;
    //   this.isContinue = false;
  
    //   this.intervalTimeProcess = setInterval(() => {
    //     this.settingDeviceSpecial.timeProcess = Number(this.settingDeviceSpecial.timeProcess) + 1000;
    //     this.settingDeviceSpecial.totalTime = this.settingDeviceSpecial.timeProcess;
    //   }, 1000);
    // }
  
    // stopUpdateTime() {
    //   if (!this.intervalTimeProcess) {
    //     return;
    //   }
    //   clearInterval(this.intervalTimeProcess);
    //   this.intervalTimeProcess = null;
    // }
}
