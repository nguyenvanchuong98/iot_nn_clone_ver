import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonRadioGroup, ModalController } from '@ionic/angular';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { DieuKienTB } from 'src/app/shared/models/dam-tom-rpc-alarm';
import {
  DeviceEntityList,
  DeviceRpcZone,
  DeviceZone,
  RpcDeviceListDto,
} from 'src/app/shared/models/dieukhien.model';
import { Device } from 'src/app/shared/models/giamsat.model';
import { ZoneRpc } from '../../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/add-device-special/add-device-special.component';
import { SpecialDevice } from '../../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-them-moi-dieu-kien-thiet-bi-modal',
  templateUrl: './them-moi-dieu-kien-thiet-bi-modal.component.html',
  styleUrls: ['./them-moi-dieu-kien-thiet-bi-modal.component.scss'],
})
export class ThemMoiDieuKienThietBiModalComponent implements OnInit {
  thietbiId: string;
  @Input() devices: DeviceRpcZone[];
  @Input() editData: DieuKienTB;
  @Input() deviceIdChoosed: string[]; // name of rpc pull
  formDKTB: FormGroup;
  customPopoverOptions: any = {
    header: 'Chọn thiết bị',
    cssClass: 'my-custom-popover',
  };

  customSelectCondition: any = {
    header: 'Chọn điều kiện',
    cssClass: 'my-custom-popover',
  };
  @ViewChild ('radioGroup') radioGroup: IonRadioGroup;
  optionSelected = 'another';
  isInvalidPercent = true;
  listPercent = [25, 50, 75, 100];
  titlePullPush = 'Tỷ lệ';

  listCondition = [
    {key: 'GREAT', sign: '>'},
    {key: 'LESS', sign: '<'},
    {key: 'EQUAL', sign: '='},
  ];

  invalidCondition = false;

  constructor(
    // tslint:disable-next-line: variable-name
    private _modalController: ModalController,
    private fb: FormBuilder,
    private damtomService: QuantridamtomService,
  ) {}
  
  ngOnInit() {
    this.getRpcZoneCheckDisable();
    
    if (!!this.editData) {
      this.formDKTB = this.fb.group({
        toggleOnOff: [this.editData.trangThai],
        optionControl: [this.editData.pullPush ],
        percentControl: [this.editData.percent , Validators.required],
        nameRpcPull: [this.editData.id, Validators.required],
        condition: [this.editData.compare , Validators.required],
      });

      this.optionSelected = this.editData?.deviceType !== 'REM' ? 'another' : 'rem'; 
      if (this.editData.deviceType !== 'REM') {
        this.thietbiId = this.editData.id;
      }
    } else {
      this.formDKTB = this.fb.group({
        toggleOnOff: [true],
        optionControl: ['PULL'],
        percentControl: [null, Validators.required],
        nameRpcPull: [null, Validators.required],
        condition: ['GREAT',Validators.required]
      });
    }
    // this.thietbiId=this.editData?this.editData.id:this.devices[0].rpcDeviceList[0].tenThietBi;
  }

  dismissModal() {
    this._modalController.dismiss();
  }

  getIdPullFromNamePull(namePull: string): string {
    var rem: SpecialDevice;
    var idPull: string
    this.devices.forEach(zone => {
      var rem = zone.rpcRemList.find(rem => rem.rpcPullDevice.tenThietBi === namePull);
      if (!!rem) {
        idPull = rem.rpcPullId;
      }
    })
    return idPull;
  }
  getRpcZoneCheckDisable() {
    this.devices.forEach((e) => {
      e.rpcDeviceList.forEach((dv) => {
        if (this.deviceIdChoosed.includes(dv.tenThietBi)) {
          dv.disable = true;
        } else {
          dv.disable = false;
        }
      });
      e.rpcRemList.forEach(rem => {
        if (this.deviceIdChoosed.includes(rem.rpcPullDevice.tenThietBi)) {
          rem.disable = true;
        } else {
          rem.disable = false;
        }
      })
    });

  }
  getDeviceDetail(tenTb: string){
    let deviceDetail: RpcDeviceListDto;
    this.devices.forEach((e) => {
      e.rpcDeviceList.forEach((el) => {
        if (el.tenThietBi === tenTb) {
          deviceDetail = el;
        }
      });
    });
    return deviceDetail;
  }
  getLabelOrNameTB(tenTb: string) {
    let label = tenTb;
    this.devices.forEach((e) => {
      e.rpcDeviceList.forEach((el) => {
        if (el.tenThietBi === tenTb) {
          label = el.label ? el.label : el.tenThietBi;
        }
      });
    });
    return label;
  }

  // truyen vao name pull rpc va tra ve ten rem
  getLabelRem(namePull: string): string {
    var nameRem: string = '';
    this.devices.forEach(zone => {
      var rem = zone.rpcRemList.find(rem => rem.rpcPullDevice.tenThietBi === namePull);
      if (!!rem) {
        nameRem = rem.name;
      }
    });
    return nameRem;
  }

  // truyen vao id rem -> return id pull rpc
  getIdPullRpc(idRem: string): string {
    let idPull: string;
    var rem: SpecialDevice;
    this.devices.forEach(zone => {
      rem = zone.rpcRemList.find(rem => rem.id === idRem);
      if (!!rem) {
        idPull = rem.rpcPullId;
      }
    })

    return idPull;
  }

  // truyen vao id pull -> return id rem 
  getIdRemFromIdPull(idPull: string): string {
    let idRem: string;
    this.devices.forEach(zone => {
      idRem = zone.rpcRemList.find(rem => rem.rpcPullId == idPull).id;
    });
    return idRem;
  }
 
  segmentChanged(event) {
    console.log('change segment condition', event.detail.value);
    this.checkInvalidConditionDevice();
  }

  onSubmit() {
    var dktbData: DieuKienTB;
    if (this.optionSelected === 'another') {
      dktbData = {
        id: this.thietbiId,
        trangThai: this.formDKTB.get('toggleOnOff').value,
        labelTB: this.thietbiId,
        deviceType: this.getDeviceDetail(this.thietbiId).deviceType
      };
    } else {
      dktbData = {
        id: this.formDKTB.value.nameRpcPull,
        trangThai: true,
        labelTB: this.formDKTB.value.nameRpcPull,
        deviceType: 'REM',
        pullPush: this.formDKTB.value.optionControl,
        percent: this.formDKTB.value.percentControl,
        compare: this.formDKTB.value.condition,
      }
    }
    
    this._modalController.dismiss({
      data: dktbData,
    });

    console.log('dismiss data', dktbData);
    
  }
  changePercentInput(event) {
    if (event.detail.value == '') {
      this.formDKTB.get('percentControl').setValidators([Validators.required]);
    }
    this.checkInvalidConditionDevice();
    
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
  checkInvalidConditionDevice() {
    console.log('check condition', this.formDKTB.get('condition').value, this.formDKTB.get('percentControl').value);
    if (this.formDKTB.get('condition').value === 'GREAT' && this.formDKTB.get('percentControl').value === 100) {
      this.formDKTB.setErrors({'invalid': true});
      this.invalidCondition = true;
    }
    else if (this.formDKTB.get('condition').value === 'LESS' && this.formDKTB.get('percentControl').value === 0) {
      this.formDKTB.setErrors({'invalid': true});
      this.invalidCondition = true;

    }
    else {
      this.invalidCondition = false;
    }
  }
  changeRadioPercent(event: any) {
    if (event.detail.value !== null) {
      this.formDKTB.get('percentControl').setValue(event.detail.value);
    }
  }

  msToTime(duration) {
    // tinh time xu ly rai-thu    
    // if (this.deviceRem.oldStatus === 0) {
    //   duration = this.deviceRem.finishTime * (this.formSetting.value.percentControl / 100);
    // }
    if (!!this.formDKTB.value.percentControl) {
      // duration = (this.deviceRem.finishTime / 100) * Math.abs(this.deviceRem.pauseStatus - this.formSetting.value.percentControl);
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
    } else {
      this.titlePullPush = "Tỷ lệ thu";
    }
    this.formDKTB.get('percentControl').setValue('');
    this.radioGroup.value = '';    

    this.formDKTB.get('percentControl').reset();
    this.formDKTB.get('nameRpcPull').reset();
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
