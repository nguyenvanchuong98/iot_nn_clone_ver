import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { SettingDeviceSpecial } from './settingDeviceSpecial.model';

export interface rpcRemDto {
  damtomId: string,
  gatewayId: string,
  finishTime: number,
  id?: string,
  name: string,
  rpcPullId: string,
  rpcPushId: string
  pauseStatus?: number,
}

export interface ZoneRpc {
  rpcDeviceList: {
    createdTime: number;
    damTomId: string;
    deviceId: string,
    deviceType: string,
    label: string,
    setValueMethod: string,
    statusDevice: number;
    statusTime: number;
    tenThietBi: string,
    isChecked?: boolean
  }[],
  listIdRpc?: string[],
  zoneId: string,
  zoneName: string,
  zoneChecked?: boolean,
}
@Component({
  selector: 'app-add-device-special',
  templateUrl: './add-device-special.component.html',
  styleUrls: ['./add-device-special.component.scss'],
})
export class AddDeviceSpecialComponent implements OnInit {
  settingDeviceSpecial: SettingDeviceSpecial = new SettingDeviceSpecial();
  @Input() damTomId: string;
  @Input() gatewayId: string;
  intervalTimeProcess = null;

  isStartTime: boolean = false;
  isStopTime: boolean = false;

  formCreateRem: FormGroup;
  deviceRaiRem: {
    createdTime: number;
    damTomId: string;
    deviceId: string,
    deviceType: string,
    label: string,
    setValueMethod: string,
    statusDevice: number;
    statusTime: number;
    tenThietBi: string,
    isChecked?: boolean
  };
  deviceThuRem: {
    createdTime: number;
    damTomId: string;
    deviceId: string,
    deviceType: string,
    label: string,
    setValueMethod: string,
    statusDevice: number;
    statusTime: number;
    tenThietBi: string,
    isChecked?: boolean
  };
  customActionSheetOptions: any = {
    header: 'Chọn thiết bị',
    cssClass: 'custom-action-sheet-special-device',
  };
  listZoneRem: ZoneRpc[] = [];

  maxTime;

  minuteValues: number[] = [];

  pauseStatus = '0';

  constructor(
    private modalCtrl: ModalController,
    private damtomService: QuantridamtomService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.maxTime = 30 * 60 * 1000;
    
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    // limit 30 minute
    for(var i = 0; i<=30; i++) {
      this.minuteValues.push(i);
    }
    
    this.formCreateRem = this.fb.group({
      nameSpecialDevice: ['', Validators.required],
      totalTime: [{value: new Date(date).toISOString(), disabled: false}, Validators.required]
    })
    this.getZoneRem();
  }
  getZoneRem() {
    this.damtomService.getZoneRpcRem(this.damTomId).subscribe(resData => {
      this.listZoneRem = resData;
      this.listZoneRem.forEach(zone => {
        zone.rpcDeviceList = zone.rpcDeviceList.filter(rem => {return rem.deviceType === 'REM'})
        zone.rpcDeviceList.forEach(rem => {
          rem.isChecked = false;
        })
      })
    })
  }
  huy() {
    this.modalCtrl.dismiss();
  }
  onSubmit() {
    const remDto: rpcRemDto = {
      damtomId: this.damTomId,
      gatewayId: this.gatewayId,
      finishTime: this.timeToMs(this.formCreateRem.get('totalTime').value),
      name: this.formCreateRem.get('nameSpecialDevice').value,
      rpcPullId: this.deviceThuRem.deviceId, // thu rem
      rpcPushId: this.deviceRaiRem.deviceId, // rai rem
      pauseStatus: Number(this.pauseStatus),
    };
    if (this.formCreateRem.get('nameSpecialDevice').value.length > 0
        && this.deviceRaiRem !== undefined && this.deviceThuRem !== undefined) {
      this.damtomService.saveDeviceRem(remDto).subscribe(resData => {
        this.modalCtrl.dismiss({
          specialDevice: remDto,
        });
        this.showToast('Thêm mới thiết bị đặc biệt thành công!', 'success');
      }, error => {
        console.log('error add special device', error);
        if (error.error.errorCode == 2) {
          this.showToast(error.error.message, 'danger');
        } else {
          this.showToast('Có lỗi xảy ra!', 'danger');
        }
      });
    } else {
      return;
    }
  }
  // Show toast
  private showToast(meseage: string, color: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color: color,
        duration: 2000,
      })
      .then((toatEL) => toatEL.present());
  }
  async addRaiRem(event: any) {
    console.log(event);    
    this.listZoneRem.forEach(zone => {
      zone.rpcDeviceList.forEach(rem => {
        rem.isChecked = false;
      })
    })
    this.deviceRaiRem = event;
    // find rem trong zone
    this.listZoneRem.forEach(zone => {
      const remSelected = zone.rpcDeviceList.find(device => device.deviceId === event.deviceId);
      if (!!remSelected) {
        remSelected.isChecked = !remSelected.isChecked;
      }
      // console.log(remSelected);
    });
    // find zone selected
    this.listZoneRem.forEach(zone => {
      zone.zoneChecked = zone.rpcDeviceList.includes(this.deviceRaiRem);
      // console.log('zone checked',zone.zoneChecked);
    })
    
  }

  async addThuRem(event: any) {
    this.deviceThuRem = event;
  }

  stopUpdateTime() {
    if (!this.intervalTimeProcess) {
      return;
    }
    clearInterval(this.intervalTimeProcess);
    this.intervalTimeProcess = null;
  }

  convertTime(time: number) {
    return moment(time).toISOString();
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
  // convert time to milliseconds
  timeToMs(dateTime: string): number {
    var date = new Date(dateTime);
    var minute = date.getMinutes();
    var seconds = date.getSeconds();

    var miliseconds = minute * 60 * 1000 + seconds * 1000;

    return miliseconds;
  } 

  changeTime() {
    console.log(this.formCreateRem.get('totalTime').value);
    var date = new Date(this.formCreateRem.get('totalTime').value);
    var minute = date.getMinutes();
    var second = date.getSeconds();

    console.log('minute', minute, 'second', second);
  }

  // startTime() {
  //   this.isStartTime = true;
  //   this.intervalTimeProcess = setInterval(() => {
  //     this.settingDeviceSpecial.timeProcess = Number(this.settingDeviceSpecial.timeProcess) + 1000;
  //     this.settingDeviceSpecial.totalTime = this.settingDeviceSpecial.timeProcess;
  //   }, 1000);
  // }

  // stopTime() {
  //   this.isStartTime = false;
  //   this.isStopTime = true;
  //   this.stopUpdateTime();
  // }

  // resetTime() {
  //   this.isStartTime = true;
  //   this.isStopTime = false;
  //   this.stopUpdateTime();

  //   this.settingDeviceSpecial.timeProcess = 0;
  //   this.settingDeviceSpecial.totalTime = this.settingDeviceSpecial.timeProcess;

  //   this.intervalTimeProcess = setInterval(() => {
  //     this.settingDeviceSpecial.timeProcess = Number(this.settingDeviceSpecial.timeProcess) + 1000;
  //     this.settingDeviceSpecial.totalTime = this.settingDeviceSpecial.timeProcess;
  //   }, 1000);
  // }

  // continueTime() {
  //   this.isStartTime = true;
  //   this.isStopTime = false;

  //   this.intervalTimeProcess = setInterval(() => {
  //     this.settingDeviceSpecial.timeProcess = Number(this.settingDeviceSpecial.timeProcess) + 1000;
  //     this.settingDeviceSpecial.totalTime = this.settingDeviceSpecial.timeProcess;
  //   }, 1000);
  // }

}
