import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonRadioGroup, ModalController } from '@ionic/angular';
import { GroupRPCService } from 'src/app/core/services/nhom-dieu-khien.service';
import { DeviceSetting } from 'src/app/shared/models/DeviceSetting.model';
import { DeviceRpcZone } from 'src/app/shared/models/dieukhien.model';
import { DeviceService } from 'src/app/core/services/device-service';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-thong-tin-dieu-khien-thu-cong',
  templateUrl: './thong-tin-dieu-khien-thu-cong.page.html',
  styleUrls: ['./thong-tin-dieu-khien-thu-cong.page.scss'],
})
export class ThongTinDieuKhienThuCongPage implements OnInit {
  @Input() deviceSetting: DeviceSetting;
  @Input() deviceIds: any[];
  @Input() damtomId: string;

  numberSelect: Array<number> = [];
  editDKForm: FormGroup;
  checkLoopOption = true;
  checkThucHienTrong = true;
  isDeviceLoading: boolean;
  // devices = [];
  deviceZones: DeviceRpcZone[] = [];
  flagChange = 'false';
  isEnabledText: boolean;
  isEnabledTitle: boolean;
  customPopoverOptions: any = {
    header: 'Chọn thiết bị *',
    cssClass: 'my-custom-popover',
  };
  customPopoverOptions1: any = {
    cssClass: 'my-custom-popover',
  };

  customActionSheetOptions: any = {
    header: 'Chọn thiết bị',
    cssClass: 'custom-action-sheet-special-device',
  };
  @ViewChild ('radioGroup') radioGroup: IonRadioGroup;
  optionSelected = 'rem';
  isInvalidPercent = true;
  listPercent = [25, 50, 75, 100];
  titlePullPush = 'Tỷ lệ';
  timePredictRem = '00:00:00';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalCtrl: ModalController,
    private nhomDieuKhiem: GroupRPCService,
    private alertCtrl: AlertController,
    private deviceService: DeviceService
  ) {}
  buildEditDkForm() {
    this.editDKForm = this.fb.group({
      idDevice: [1, Validators.required],
      toggleOnOff: [true],
      timeAfterActivated: [{ value: 0, disabled: false }],
      checkBoxDoIn: [false],
      timeDoIn: [{ value: 0, disabled: true }],
      loopOption: [{ value: false, disabled: true }],
      timeLoopAfter: [{ value: 0, disabled: true }],
      loopCount: [
        { value: 1, disabled: true },
        [Validators.min(1), Validators.max(20), Validators.required],
      ],
      optionControl: ['PUSH'],
      percentControl: [0,[Validators.required, Validators.maxLength(3), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      timeControl: [],
    });
  }
  ngOnInit() {
    this.checkThucHienTrong = this.deviceSetting.callbackOption;
    this.checkLoopOption = this.deviceSetting.loopOption;
    if (this.checkThucHienTrong) {
      this.isEnabledTitle = true;
    }
    if (this.checkLoopOption) {
      this.isEnabledText = true;
    }
    this.buildEditDkForm();
    // this.fetchDeviceData(this.damtomId).then((data:DeviceSetting)=>{

    //   this.editDKForm.get('idDevice').patchValue(this.deviceSetting.deviceId);
    //   console.log(this.editDKForm.getRawValue());

    // });
    const timeAfterActivated = new Date();
    timeAfterActivated.setHours(0);
    timeAfterActivated.setMinutes(0);
    timeAfterActivated.setSeconds(0);
    timeAfterActivated.setMilliseconds(this.deviceSetting.delayTime);

    const timeLoopAfter = new Date();
    timeLoopAfter.setHours(0);
    timeLoopAfter.setMinutes(0);
    timeLoopAfter.setSeconds(0);
    timeLoopAfter.setMilliseconds(this.deviceSetting.loopTimeStep);

    const timeDoIn = new Date();
    timeDoIn.setHours(0);
    timeDoIn.setMinutes(0);
    timeDoIn.setSeconds(0);
    timeDoIn.setMilliseconds(this.deviceSetting.timeCallback);

    this.editDKForm
      .get('toggleOnOff')
      .patchValue(this.deviceSetting.valueControl);
    this.editDKForm
      .get('checkBoxDoIn')
      .patchValue(this.deviceSetting.callbackOption);
    if (this.deviceSetting.callbackOption) {
      this.editDKForm.get('timeDoIn').enable();
      this.editDKForm.get('loopOption').enable();
      this.isEnabledTitle = true;
    }
    this.editDKForm.get('timeDoIn').patchValue(timeDoIn.toISOString());
    this.editDKForm.get('loopOption').patchValue(this.deviceSetting.loopOption);
    if (this.deviceSetting.loopOption) {
      this.editDKForm.get('timeLoopAfter').enable();
      this.editDKForm.get('loopCount').enable();
      this.isEnabledText = true;
    }
    this.editDKForm
      .get('timeLoopAfter')
      .patchValue(timeLoopAfter.toISOString());
    this.editDKForm
      .get('loopCount')
      .patchValue(
        this.deviceSetting.loopCount ? this.deviceSetting.loopCount : 1
      );
    this.editDKForm
      .get('timeAfterActivated')
      .patchValue(timeAfterActivated.toISOString());

    for (let i = 1; i <= 100; i++) {
      this.numberSelect.push(i);
    }

    // device rem
    if (this.deviceSetting.deviceType === 'REM') {
      this.optionSelected = 'rem';
      this.editDKForm.get('optionControl').patchValue(this.deviceSetting.actionRem == 'PUSH' ? 'PUSH' : 'PULL');
      this.editDKForm.get('percentControl').patchValue(this.deviceSetting.percentRem);
      this.titlePullPush = this.deviceSetting.actionRem == 'PUSH' ? 'Tỷ lệ rải' : 'Tỷ lệ thu'
    } else {
      this.optionSelected = 'another';
    }

    this.getDeviceZone();

  }
  onSubmit() {
    const value = this.editDKForm.getRawValue();
    this.deviceSetting = new DeviceSetting();
    // this.devices.forEach(device=>{
    //   if(device.deviceId===value.idDevice){
    //     this.deviceSetting.deviceName = device.tenThietBi;
    //     this.deviceSetting.deviceId = device.deviceId;
    //     this.deviceSetting.label = device.label;
    //   }
    // })
    if (this.optionSelected == 'another') {
      this.deviceZones.forEach((zone) => {
        const zoneRpc = zone.rpcDeviceList.find((e) => {
          return e.deviceId === value.idDevice;
        });
        if (zoneRpc !== undefined) {
          this.deviceSetting.deviceName = zoneRpc.tenThietBi;
          this.deviceSetting.deviceId = zoneRpc.deviceId;
          this.deviceSetting.label = zoneRpc.label;
          this.deviceSetting.deviceType = zoneRpc.deviceType;
          this.deviceSetting.openAccordition = true;
        }
      });
      const tempDate = new Date(value.timeAfterActivated);
      tempDate.setHours(0);
      tempDate.setMinutes(0);
      tempDate.setSeconds(0);
  
      value.toggleOnOff
        ? (this.deviceSetting.valueControl = 1)
        : (this.deviceSetting.valueControl = 0);
      this.deviceSetting.delayTime =
        new Date(value.timeAfterActivated).getTime() - tempDate.getTime();
      this.deviceSetting.callbackOption = value.checkBoxDoIn;
      this.deviceSetting.timeCallback = value.checkBoxDoIn
        ? new Date(value.timeDoIn).getTime() - tempDate.getTime()
        : 0;
      this.deviceSetting.loopOption = value.checkBoxDoIn
        ? value.loopOption
        : false;
      this.deviceSetting.loopCount = value.loopOption ? value.loopCount : 1;
      this.deviceSetting.loopTimeStep = value.loopOption
        ? new Date(value.timeLoopAfter).getTime() - tempDate.getTime()
        : 0;
    } else {
      this.deviceSetting.nameRem = this.getNameRemFromIdPullPush(this.editDKForm.get('idDevice').value);
      this.deviceSetting.deviceId = this.editDKForm.get('idDevice').value;
      this.deviceSetting.deviceName = this.getNamePullPushFromId(this.editDKForm.get('idDevice').value, true);
      this.deviceSetting.label = this.getNamePullPushFromId(this.editDKForm.get('idDevice').value, false);
      this.deviceSetting.deviceType = 'REM';
      this.deviceSetting.actionRem = this.editDKForm.get('optionControl').value;
      this.deviceSetting.percentRem = this.editDKForm.get('percentControl').value;
      this.deviceSetting.valueControl = 1;

      this.deviceSetting.callbackOption = true;
      this.deviceSetting.commandId = 0;
      this.deviceSetting.delayTime = 0;
      this.deviceSetting.loopCount = 0;
      this.deviceSetting.loopOption = false;
      this.deviceSetting.loopTimeStep = 0;
      this.deviceSetting.timeCallback = 0;
    }

    this.flagChange = 'true';
    
    this.modalCtrl.dismiss(this.deviceSetting, this.flagChange);
  }
  // Get device with zone
  getDeviceZone() {
    this.deviceService.getDeviceRpcWithZone(this.damtomId).subscribe(
      (res) => {
        res.forEach((e) => {
          // another device list
          e.rpcDeviceList.forEach((el) => {
            if (this.deviceIds.includes(el.deviceId)) {
              el.disable = true;
            }
          });
          if (this.optionSelected === 'rem') {
            // rem list
            e.rpcRemList.forEach((rem) => {
              if(this.deviceIds.includes(rem.rpcPushId) || this.deviceIds.includes(rem.rpcPullId)) {
                rem.disable = true;
              } else {
                rem.disable = false;
              }
            })
          }
          
        });
        this.deviceZones = res;
        this.editDKForm
          .get('idDevice')
          .patchValue(this.deviceSetting.deviceId);
      },
      (err) => {},
      () => {
        this.isDeviceLoading = false;
      }
    );
  }
  getNamePullPushFromId(idPullPush: string, isGetName?: boolean): string {
    var name: string;
    var rem: SpecialDevice;
    this.deviceZones.forEach(zone => {
      if (this.editDKForm.get('optionControl').value === 'PUSH') {
        rem = zone.rpcRemList.find(rem => rem.rpcPushId === idPullPush);
        if (!!rem) {
          if (isGetName) {
            name = rem.rpcPushDevice.tenThietBi;
          } else {
            name = !!rem.rpcPushDevice.label ? rem.rpcPushDevice.label : rem.rpcPushDevice.tenThietBi;
          }
        }
      } else if (this.editDKForm.get('optionControl').value === 'PULL') {
        rem = zone.rpcRemList.find(rem => rem.rpcPullId === idPullPush);
        if (!!rem) {
          if (isGetName) {
            name = rem.rpcPullDevice.tenThietBi;
          } else {
            name = !!rem.rpcPullDevice.label ? rem.rpcPullDevice.label : rem.rpcPullDevice.tenThietBi;
          }
        }
      }
    })
    return name;
  }
  getNameRemFromIdPullPush(idPullPush: string): string {
    var nameRem: string;
    var rem: SpecialDevice;
    this.deviceZones.forEach(zone => {
      if (this.editDKForm.get('optionControl').value === 'PUSH') {
        rem = zone.rpcRemList.find(rem => rem.rpcPushId === idPullPush);
        if (!!rem) {
          nameRem = rem.name;
        }
      } else if (this.editDKForm.get('optionControl').value === 'PULL') {
        rem = zone.rpcRemList.find(rem => rem.rpcPullId === idPullPush);
        if (!!rem) {
          nameRem = rem.name;
        }
      }
    })
    
    return nameRem;
  }
  checkBoxOption1() {
    this.checkThucHienTrong = this.editDKForm.get('checkBoxDoIn').value;
    if (this.checkThucHienTrong) {
      this.editDKForm.controls.timeDoIn.enable();
      this.editDKForm.controls.loopOption.enable();
      this.checkLoopOption = this.editDKForm.get('loopOption').value;
      this.isEnabledTitle = true;
      if (this.checkLoopOption) {
        this.editDKForm.controls.timeLoopAfter.enable();
        this.editDKForm.controls.loopCount.enable();
        this.isEnabledText = true;
      } else {
        this.editDKForm.controls.timeLoopAfter.disable();
        this.editDKForm.controls.loopCount.disable();
      }
    } else {
      this.editDKForm.get('loopOption').setValue(false);
      this.isEnabledText = false;
      this.isEnabledTitle = false;
      this.editDKForm.controls.timeDoIn.disable();
      this.editDKForm.controls.loopOption.disable();
      this.editDKForm.controls.timeLoopAfter.disable();
      this.editDKForm.controls.loopCount.disable();
    }
  }
  checkBoxOption2() {
    this.checkLoopOption = this.editDKForm.get('loopOption').value;
    if (this.checkLoopOption) {
      this.isEnabledText = true;
      this.editDKForm.controls.timeLoopAfter.enable();
      this.editDKForm.controls.loopCount.enable();
    } else {
      this.isEnabledText = false;
      this.editDKForm.controls.timeLoopAfter.disable();
      this.editDKForm.controls.loopCount.disable();
    }
  }
  // dieu huong lai them moi nhom dk hoac thong tin nhom dk
  buttonBack() {
    if (this.editDKForm.dirty) {
      return new Promise<boolean>(async (resolve) => {
        const alert = await this.alertCtrl.create({
          header: 'Bạn chắc chắn muốn Huỷ?',
          message: 'Tất cả dữ liệu sẽ không được lưu',
          buttons: [
            {
              text: 'Huỷ bỏ',
              role: 'cancel',
              handler: () => {
                resolve(false);
              },
            },
            {
              text: 'Xác nhận',
              handler: () => {
                resolve(true);
                this.flagChange = 'false';
                this.modalCtrl.dismiss(this.deviceSetting, this.flagChange);
              },
            },
          ],
        });
        await alert.present();
      });
    } else {
      this.flagChange = 'false';
      this.modalCtrl.dismiss(this.deviceSetting, this.flagChange);
    }
  }

  changePullPush(event) {
    var rem: SpecialDevice;
     
    if (event.detail.value === 'PUSH') {
      this.deviceZones.forEach(zone => {
        rem = zone.rpcRemList.find(rem => rem.rpcPullId === this.editDKForm.get('idDevice').value);
      })   

      this.titlePullPush = "Tỷ lệ rải";
      this.editDKForm.get('percentControl').setValue(100);
      if (!!rem) {
        this.editDKForm.get('idDevice').setValue(rem.rpcPushId);
      }
    } else {
      this.deviceZones.forEach(zone => {
        rem = zone.rpcRemList.find(rem => rem.rpcPushId === this.editDKForm.get('idDevice').value);
      })   

      this.titlePullPush = "Tỷ lệ thu";
      this.editDKForm.get('percentControl').setValue(0);
      if (!!rem) {
        this.editDKForm.get('idDevice').setValue(rem.rpcPullId);
      }
    }
    // this.radioGroup.value = '';    
  }
  changePercentInput(event) {
    const elementError = document.getElementById('error');
    if (parseInt(event.detail.value, 10) <= 100 && parseInt(event.detail.value, 10) >= 0) {
      elementError.classList.add('hidden');
      this.isInvalidPercent = false;

      this.editDKForm.markAsDirty();

      if (event.detail.value !== '25' && event.detail.value !== '50' && 
      event.detail.value !== '75' && event.detail.value !== '100' && event.detail.value !== '0') 
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
      this.editDKForm.get('percentControl').setValue(event.detail.value);
    }
  }
  msToTime(finishTime: number) {
    var duration = 0; 
    if (!!this.editDKForm.get('percentControl').value) {
      duration = (finishTime / 100) * this.editDKForm.get('percentControl').value;
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
  // public fetchDeviceData(damTomId:string){
  //   return new Promise(
  //     (reslove,reject)=>{
  //       this.nhomDieuKhiem.getAllThietBi(damTomId).subscribe(
  //         devices=>{
  //           devices.forEach(device=>{
  //             if(this.deviceIds.includes(device.deviceId)){
  //               device.disabled = true;
  //               if(device.deviceId == this.deviceSetting.deviceId) device.disabled = false;
  //             }
  //             else{
  //               device.disabled = false;
  //             }
  //           });
  //           this.devices = devices;
  //           console.log(this.devices);
  //           reslove(devices);
  //         },
  //         err=>{
  //           reject(err);
  //         },
  //         ()=>{
  //           this.isDeviceLoading = false;
  //         }
  //       )
  //     }
  //   )
  // }

  initPageData() {}
}
