import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonRadioGroup, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { DieuKhienDto } from 'src/app/shared/models/dam-tom-rpc-alarm';
import { Device } from 'src/app/shared/models/device-model';
import { DeviceRpcZone, GroupRpc, RpcDeviceListDto } from 'src/app/shared/models/dieukhien.model';
import { ZoneRpc } from '../../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/add-device-special/add-device-special.component';
import { SpecialDevice } from '../../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-them-moi-rpc-modal',
  templateUrl: './them-moi-rpc-modal.component.html',
  styleUrls: ['./them-moi-rpc-modal.component.scss'],
})
export class ThemMoiRpcModalComponent implements OnInit {
  @Input() isDisableGroupRpc: boolean;
  @Input() deviceIdChoosed: string[];
  @Input() devices: DeviceRpcZone[];
  @Input() groupRpcs: GroupRpc[];
  @Input() editData: DieuKhienDto;

  form: FormGroup;
  isLoading = false;
  numberSelect: Array<number> = [];
  thietbiOrnhomtb;
  checkCallbackOption;
  checkLoopOption;
  customPopoverOptions: any = {
    header: 'Chọn thiết bị',
    cssClass: 'my-custom-popover',
  };
  customPopoverOptions1: any = {
    cssClass: 'my-custom-popover',
  };

  @ViewChild ('radioGroup') radioGroup: IonRadioGroup;
  isInvalidPercent = true;
  listPercent = [25, 50, 75, 100];
  titlePullPush = 'Tỷ lệ';
  constructor(
    // tslint:disable-next-line: variable-name
    public _modalController: ModalController,
    // tslint:disable-next-line: variable-name
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    console.log('deviceIdChoosed', this.deviceIdChoosed);
    console.log('edit data', this.editData);
    
    
    for (let i = 1; i <= 100; i++) {
      this.numberSelect.push(i);
    }
    if (!!this.editData) {
      this.checkCallbackOption = this.editData.callbackOption;
      this.checkLoopOption = this.editData.loopOption;
      this.thietbiOrnhomtb = this.editData.typeRpc;
      this.form = this._fb.group({
        typeRpc: [this.editData.typeRpc],
        groupRpcId: [this.editData.groupRpcId],
        deviceId: [this.editData.deviceType === 'REM' ? this.getIdRemFromIdPullPush(this.editData.deviceId, this.editData.pullPush) : this.editData.deviceId], // id rem
        valueControl: [!!this.editData.valueControl],
        delayTime: [
          this.editData.delayTime ? this.editData.delayTime : '00:00:00',
        ],
        callbackOption: [this.editData.callbackOption],
        timeCallback: [
          {
            value: this.editData.timeCallback
              ? this.editData.timeCallback
              : '00:00:00',
            disabled: !this.editData.callbackOption,
          },
        ],
        loopOption: [
          {
            value: this.editData.loopOption,
            disabled: !this.editData.callbackOption,
          },
        ],
        loopTimeStep: [
          {
            value: this.editData.loopTimeStep
              ? this.editData.loopTimeStep
              : '00:00:00',
            disabled: !this.editData.loopOption,
          },
        ],
        loopCount: [
          {
            value: !!this.editData.loopCount ? this.editData.loopCount : 1,
            disabled: !this.editData.loopOption,
          },
        ],
        deviceType: this.editData.deviceType,
        // option rem
        optionControl: [this.editData.pullPush],
        percentControl: [this.editData.percent, Validators.required],
      });
    } else {
      this.checkCallbackOption = false;
      this.checkLoopOption = false;
      this.thietbiOrnhomtb = 'rpc';
      // this.thietbiOrnhomtb=this.selectedDieuKhien?.length == 0 ? 'group-rpc' : 'rpc';
      this.form = this._fb.group({
        // typeRpc: [this.selectedDieuKhien?.length == 0 ? 'group-rpc' : 'rpc'],
        typeRpc: ['rpc'],
        groupRpcId: [],
        deviceId: ['', Validators.required], // id rem
        valueControl: [true],
        delayTime: ['00:00:00'],
        callbackOption: [false],
        loopCount: [{ value: 1, disabled: true }],
        loopOption: [{ value: false, disabled: true }],
        loopTimeStep: [{ value: '00:00:00', disabled: true }],
        timeCallback: [{ value: '00:00:00', disabled: true }],
        deviceType: 'DEFAULT',
        // option rem
        optionControl: ['PUSH'],
        percentControl: [100, Validators.required],
      });
    }

    this.form.get('callbackOption').valueChanges.subscribe((value) => {
      if (!!value) {
        this.form.controls.timeCallback.enable();
        this.form.controls.loopOption.enable();
        if (!!this.form.get('loopOption').value) {
          this.form.controls.loopTimeStep.enable();
          this.form.controls.loopCount.enable();
        }
      } else {
        this.form.controls.loopCount.disable();
        this.form.controls.timeCallback.disable();
        this.form.controls.loopTimeStep.disable();
        this.form.controls.loopOption.disable();
        this.form.patchValue({
          loopOption: false,
          loopTimeStep: '00:00:00',
          loopCount: 1,
          timeCallback: '00:00:00',
        });
      }
    });

    this.form.get('loopOption').valueChanges.subscribe((value) => {
      if (!!value) {
        this.form.controls.loopTimeStep.enable();
        this.form.controls.loopCount.enable();
      } else {
        this.form.controls.loopCount.disable();
        this.form.controls.loopTimeStep.disable();
        this.form.patchValue({ loopTimeStep: '00:00:00', loopCount: 1 });
      }
    });

    this.getRpcZoneCheckDisable();

  }

  getIdRemFromIdPullPush(idPullPush: string, actionRem: string): string {
    var idRem: string;
    var rem: SpecialDevice;
    this.devices.forEach(zone => {
      if (actionRem === 'PUSH') {
        rem = zone.rpcRemList.find(rem => rem.rpcPushId === idPullPush);
      } else {
        rem  = zone.rpcRemList.find(rem => rem.rpcPullId === idPullPush);
      }
      if (!!rem) {
        idRem = rem.id;
      }
    })
    return idRem;
  }

  getIdPullPushFromIdRem(idRem: string, actionRem: string): string {
    var idPullPush: string;
    var rem: SpecialDevice;
    this.devices.forEach(zone => {
      rem = zone.rpcRemList.find(rem => rem.id === idRem);
      if (!!rem) {
        if (actionRem === 'PUSH') {
          idPullPush = rem.rpcPushId;
        } else {
          idPullPush = rem.rpcPullId;
        }
      }
    })
    return idPullPush;
  }

  getRpcZoneCheckDisable() {
    this.devices.forEach((e) => {
      e.rpcDeviceList.forEach((dv) => {
        if (this.deviceIdChoosed.includes(dv.deviceId)) {
          dv.disable = true;
        } else {
          dv.disable = false;
        }
      });
      e.rpcRemList.forEach(rem => {
        if (this.deviceIdChoosed.includes(rem.rpcPushId) || this.deviceIdChoosed.includes(rem.rpcPullId)) {
          rem.disable = true;
        } else {
          rem.disable = false;
        }
      })
    });
  }
  dismissModal() {
    this._modalController.dismiss({});
  }

  onSubmit() {
    const dataRaw: DieuKhienDto = this.form.value;
    if (dataRaw.typeRpc === 'rpc'){
      dataRaw.deviceType = this.getDeviceDetail(dataRaw.deviceId).deviceType;
      dataRaw.openAccordition = this.editData ? this.editData.openAccordition : true;
    }
    if (dataRaw.typeRpc === 'rem') {
      dataRaw.deviceType = 'REM';
      // dataRaw.timePredict = this.msToTime();
      dataRaw.percent = this.form.value.percentControl;
      dataRaw.pullPush = this.form.value.optionControl;
      dataRaw.openAccordition = this.editData ? this.editData.openAccordition : true;
      dataRaw.deviceId = this.getIdPullPushFromIdRem(this.form.get('deviceId').value, this.form.get('optionControl').value);
    }
    this._modalController.dismiss({
      data: dataRaw,
    });

    console.log('dismiss rpc modal', dataRaw);
    
  }
  getDeviceDetail(tenTb: string){
    let deviceDetail: RpcDeviceListDto;
    this.devices.forEach((e) => {
      e.rpcDeviceList.forEach((el) => {
        if (el.deviceId === tenTb) {
          deviceDetail = el;
        }
      });
    });
    return deviceDetail;
  }
  isFormValid(): boolean {
    if (
      this.form.get('typeRpc').value === 'rpc' &&
      !this.form.get('deviceId').value
    ) {
      return false;
    }

    if (
      this.form.get('typeRpc').value === 'group-rpc' &&
      !this.form.get('groupRpcId').value
    ) {
      return false;
    }

    if (this.form.get('typeRpc').value === 'rem' && this.form.invalid) {
      return false;
    }
    return true;
  }

  getLoopCountOptions() {
    return this.numberSelect.map((el) => ({ value: el, display: el }));
  }

  callbackOptionCheckbox() {
    this.checkCallbackOption = this.form.get('callbackOption').value;
    if (this.checkCallbackOption) {
      this.form.controls.timeCallback.enable();
      this.form.controls.loopOption.enable();
      if (this.checkLoopOption) {
        this.form.controls.loopTimeStep.enable();
        this.form.controls.loopCount.enable();
      }
      this.form.markAsTouched();
    } else {
      this.form.controls.loopCount.disable();
      this.form.controls.timeCallback.disable();
      this.form.controls.loopTimeStep.disable();
      this.form.controls.loopOption.disable();
      this.form.patchValue({ loopTimeStep: '00:00:00' });
      this.form.patchValue({ loopCount: 1 });
      this.form.patchValue({ timeCallback: '00:00:00' });
      this.form.markAsTouched();
    }
  }
  loopOptionCheckbox() {
    this.checkLoopOption = this.form.get('loopOption').value;
    if (this.checkLoopOption) {
      this.form.controls.loopTimeStep.enable();
      this.form.controls.loopCount.enable();
      this.form.markAsTouched();
    } else {
      this.form.controls.loopCount.disable();
      this.form.patchValue({ loopTimeStep: '00:00:00' });
      this.form.controls.loopTimeStep.disable();
      this.form.patchValue({ loopCount: 1 });
      this.form.markAsTouched();
    }
  }

  changePercentInput(event) {
    const elementError = document.getElementById('error');
    if (parseInt(event.detail.value, 10) <= 100 && parseInt(event.detail.value, 10) >= 0) {
      elementError.classList.add('hidden');
      this.isInvalidPercent = false;
      if (event.detail.value !== '25' && event.detail.value !== '50' && event.detail.value !== '75' 
      && event.detail.value !== '100'  && event.detail.value !== '0') 
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
      this.form.get('percentControl').setValue(event.detail.value);
    }
  }

  msToTime() {
    var duration = 0;
    var deviceRem: SpecialDevice;
    if (this.form.value.percentControl !== null) {
      this.devices.forEach(zone => {
        if (this.form.value.optionControl === 'PUSH') {
          if (!!zone.rpcRemList.find(rem => rem.rpcPushId === this.form.value.deviceId)) {
            deviceRem = zone.rpcRemList.find(rem => rem.rpcPushId === this.form.value.deviceId);
          }
        } else {
          if (!!zone.rpcRemList.find(rem => rem.rpcPullId === this.form.value.deviceId)) {
            deviceRem = zone.rpcRemList.find(rem => rem.rpcPullId === this.form.value.deviceId);
          }
        }
      })
      if (!!deviceRem) {
        if (this.form.get('optionControl').value === 'PULL') {
          duration = (deviceRem.finishTime / 100) * (100 - this.form.value.percentControl);
        } else {
          duration = (deviceRem.finishTime / 100) * this.form.value.percentControl;
        }
      }
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
      this.form.get('percentControl').setValue(100);
    } else {
      this.titlePullPush = "Tỷ lệ thu";
      this.form.get('percentControl').setValue(0);
    }
    // this.form.get('deviceId').reset();
    // this.radioGroup.value = '';    
  }

  getZoneRem() {
    // this.damtomService.getZoneRpcRem(this.damTomId).subscribe(resData => {
    //   this.listZoneRem = resData;

    //   this.listZoneRem.forEach(zone => {
    //     zone.listIdRpc = [];
    //   });

    //   this.listZoneRem.forEach(zone => {
    //     zone.rpcDeviceList = zone.rpcDeviceList.filter(rem => rem.deviceType === 'REM');
    //     zone.rpcDeviceList.forEach(rem => {
    //       rem.isChecked = false;

    //       zone.listIdRpc.push(rem.deviceId);
    //     });
    //   });
    //   // console.log('listZoneRem', this.listZoneRem);
    // });
  }
}
