import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debug } from 'src/app/core/meta-reducers/debug.reducer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupRPCService } from 'src/app/core/services/nhom-dieu-khien.service';
import {
  AlertController,
  IonRadioGroup,
  ModalController,
  NavController,
} from '@ionic/angular';
import { DeviceSetting } from 'src/app/shared/models/DeviceSetting.model';
import {
  DeviceRpcZone,
  RpcDeviceListDto,
} from 'src/app/shared/models/dieukhien.model';
import { DeviceService } from 'src/app/core/services/device-service';
import { ZoneRpc } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/add-device-special/add-device-special.component';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-them-moi-dieu-khien',
  templateUrl: './them-moi-dieu-khien.page.html',
  styleUrls: ['./them-moi-dieu-khien.page.scss'],
})
export class ThemMoiDieuKhienPage implements OnInit {
  @ViewChild ('radioGroup') radioGroup: IonRadioGroup;
  @Input() damTomId: string;
  @Input() deviceIds: any[];
  // damTomId:string;
  state: string;
  isDeviceLoading = false;
  numberSelect: Array<number> = [];
  infoDieuKhien: string;
  themMoiDKForm: FormGroup;
  checkLoopOption: boolean;
  checkThucHienTrong: boolean;
  isEnabledText: boolean;
  isEnabledTitle: boolean;
  // devices = [];
  deviceSetting: DeviceSetting;
  deviceZones: DeviceRpcZone[] = [];
  flagChange = 'false';
  customPopoverOptions: any = {
    header: 'Chọn thiết bị',
    cssClass: 'my-custom-popover',
  };
  customPopoverOptions1: any = {
    cssClass: 'my-custom-popover',
  };

  customActionSheetOptions: any = {
    header: 'Chọn thiết bị',
    cssClass: 'custom-action-sheet-special-device',
  };

  optionSelected = 'another';

  isInvalidPercent = true;
  listPercent = [25, 50, 75, 100];

  titlePullPush = 'Tỷ lệ rải';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private nhomDieuKhiem: GroupRPCService,
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private deviceService: DeviceService,
    private damtomService: QuantridamtomService,
  ) {}
  buildThemMoiDkForm(date) {
    this.themMoiDKForm = this.fb.group({
      idDevice: [, Validators.required],
      toggleOnOff: [true],
      timeAfterActivated: [
        { value: new Date(date).toISOString(), disabled: false },
      ],
      checkBoxDoIn: [false],
      timeDoIn: [{ value: new Date(date).toISOString(), disabled: true }],
      loopOption: [{ value: false, disabled: true }],
      timeLoopAfter: [{ value: new Date(date).toISOString(), disabled: true }],
      loopCount: [
        { value: 1, disabled: true },
        [Validators.min(1), Validators.max(20), Validators.required],
      ],
      optionControl: ['PUSH'],
      percentControl: [100, [Validators.required, Validators.maxLength(3), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      timeControl: [],
    });
  }
  ngOnInit() {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    this.isDeviceLoading = true;
    this.getDeviceZone();
    // this.fetchDeviceData(this.damTomId);
    // this.activeRoute.params.subscribe(
    //   params=>{
    //     console.log(this.damTomId);
    //     // this.damTomId = params['Id'];
    //     // this.state = params['State'];
    //     if ( this.damTomId === null ||  this.damTomId === undefined) {
    //     //  this.router.navigate(['home', 'quan-tri', 'tai-khoan']);
    //      return;
    //    }

    //   }
    // );
    for (let i = 1; i <= 100; i++) {
      this.numberSelect.push(i);
    }
    // this.route.queryParams.subscribe(data =>{
    //   this.infoDieuKhien = data.infoDieuKhien
    // })
    this.buildThemMoiDkForm(date);
  }

  onSubmit() {
    const value = this.themMoiDKForm.getRawValue();
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
        this.deviceSetting.nameRem = this.getNameRemFromIdPullPush(this.themMoiDKForm.get('idDevice').value);
        this.deviceSetting.deviceId = this.themMoiDKForm.get('idDevice').value;
        this.deviceSetting.deviceName = this.getNamePullPushFromId(this.themMoiDKForm.get('idDevice').value, true);
        this.deviceSetting.label = this.getNamePullPushFromId(this.themMoiDKForm.get('idDevice').value, false);
        this.deviceSetting.deviceType = 'REM';
        this.deviceSetting.actionRem = this.themMoiDKForm.get('optionControl').value;
        this.deviceSetting.percentRem = this.themMoiDKForm.get('percentControl').value;
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

    
    // this.navCtrl.back();
    // this.navCtrl.pop();
    // this.navCtrl.navigateForward()
    // this.router.navigate(['/home/dieu-khien/them-moi-bo-dieu-khien'])
  }
  // Get device with zone
  getDeviceZone() {
    this.deviceService.getDeviceRpcWithZone(this.damTomId).subscribe(
      (res) => {
        res.forEach((zone) => {
          zone.rpcDeviceList.forEach((rpc) => {
            if (this.deviceIds.includes(rpc.deviceId)) {
              rpc.disable = true;
            }
          });
          // disable bo rem da chon khoi list rem select
          if (zone.rpcRemList.length > 0) {
            zone.rpcRemList.forEach(rem => {
              if (this.deviceIds.includes(rem.rpcPushId) || this.deviceIds.includes(rem.rpcPullId)) {
                rem.disable = true;
              } else {
                rem.disable = false;
              }
            })
            
          }
          
        });
        this.deviceZones = res;
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
      if (this.themMoiDKForm.get('optionControl').value === 'PUSH') {
        var rem = zone.rpcRemList.find(rem => rem.rpcPushId === idPullPush);
        if (!!rem) {
          if (isGetName) {
            name = rem.rpcPushDevice.tenThietBi;
          } else {
            name = !!rem.rpcPushDevice.label ? rem.rpcPushDevice.label : rem.rpcPushDevice.tenThietBi;
          }
        }
      } else {
        var rem = zone.rpcRemList.find(rem => rem.rpcPullId === idPullPush);
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
      if (this.themMoiDKForm.get('optionControl').value === 'PUSH') {
        var rem = zone.rpcRemList.find(rem => rem.rpcPushId === idPullPush);
        if (!!rem) {
          nameRem = rem.name;
        }
      } else {
        var rem = zone.rpcRemList.find(rem => rem.rpcPullId === idPullPush);
        if (!!rem) {
          nameRem = rem.name;
        }
      }
    })
    return nameRem;
  }
  checkBoxOption1() {
    this.checkThucHienTrong = this.themMoiDKForm.get('checkBoxDoIn').value;
    if (this.checkThucHienTrong) {
      this.themMoiDKForm.controls.timeDoIn.enable();
      this.themMoiDKForm.controls.loopOption.enable();
      this.checkLoopOption = this.themMoiDKForm.get('loopOption').value;
      this.isEnabledTitle = true;
      if (this.checkLoopOption) {
        this.themMoiDKForm.controls.timeLoopAfter.enable();
        this.themMoiDKForm.controls.loopCount.enable();
        this.isEnabledText = true;
      } else {
        this.themMoiDKForm.controls.timeLoopAfter.disable();
        this.themMoiDKForm.controls.loopCount.disable();
      }
    } else {
      this.themMoiDKForm.get('loopOption').setValue(false);
      this.isEnabledText = false;
      this.isEnabledTitle = false;
      this.themMoiDKForm.controls.timeDoIn.disable();
      this.themMoiDKForm.controls.loopOption.disable();
      this.themMoiDKForm.controls.timeLoopAfter.disable();
      this.themMoiDKForm.controls.loopCount.disable();
    }
  }
  checkBoxOption2() {
    this.checkLoopOption = this.themMoiDKForm.get('loopOption').value;
    if (this.checkLoopOption) {
      this.isEnabledText = true;
      this.themMoiDKForm.controls.timeLoopAfter.enable();
      this.themMoiDKForm.controls.loopCount.enable();
    } else {
      this.isEnabledText = false;
      this.themMoiDKForm.controls.timeLoopAfter.disable();
      this.themMoiDKForm.controls.loopCount.disable();
    }
  }
  buttonBack() {
    //   this.router.navigateByUrl('/home/dieu-khien/them-moi-bo-dieu-khien');
    // // debug;
    // if(this.infoDieuKhien == "false"){
    //   this.router.navigateByUrl('/home/dieu-khien/them-moi-bo-dieu-khien');

    // }else {
    //   this.router.navigateByUrl('/home/dieu-khien/thong-tin-bo-dieu-khien');

    // }this.modalCtrl.dismiss(null);
    // this.navCtrl.pop();
    // this.navCtrl.navigateBack([]);

    if (this.themMoiDKForm.dirty) {
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
                this.modalCtrl.dismiss(null);
              },
            },
          ],
        });
        await alert.present();
      });
    } else {
      this.modalCtrl.dismiss(null);
    }
  }

  changePercentInput(event) {
    const elementError = document.getElementById('error');
    if (parseInt(event.detail.value, 10) <= 100 && parseInt(event.detail.value, 10) >= 0) {
      elementError.classList.add('hidden');
      this.isInvalidPercent = false;
      if (event.detail.value !== '25' && event.detail.value !== '50' && event.detail.value !== '75' 
      && event.detail.value !== '100' && event.detail.value !== '0') 
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
      this.themMoiDKForm.get('percentControl').setValue(event.detail.value);
    }
  }

  msToTime() {
    // tinh time xu ly rai-thu    
    // if (this.deviceRem.oldStatus === 0) {
    //   duration = this.deviceRem.finishTime * (this.formSetting.value.percentControl / 100);
    // }
    var duration = 0;
    if (!!this.themMoiDKForm.value.percentControl && !!this.themMoiDKForm.get('idDevice').value) {
      duration = (this.themMoiDKForm.get('idDevice').value.finishTime / 100) * this.themMoiDKForm.value.percentControl;
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

  changePullPush(event) {
    if (event.detail.value === 'PUSH') {
      this.titlePullPush = "Tỷ lệ rải";
      this.themMoiDKForm.get('percentControl').setValue(100);
    } else {
      this.titlePullPush = "Tỷ lệ thu";
      this.themMoiDKForm.get('percentControl').setValue(0);
    }
    // this.radioGroup.value = '';    
  }

  // public fetchDeviceData(damTomId:string){
  //   return new Promise(
  //     (reslove,reject)=>{
  //       this.nhomDieuKhiem.getAllThietBi(damTomId).subscribe(
  //         devices=>{
  //           devices.forEach(device=>{
  //             if(this.deviceIds.includes(device.deviceId)){
  //               device.disabled = true;
  //             }
  //             else{
  //               device.disabled = false;
  //             }
  //           });
  //           // this.devices = devices;
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
}
