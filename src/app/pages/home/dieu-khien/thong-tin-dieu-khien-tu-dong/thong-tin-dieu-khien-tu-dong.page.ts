import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonContent, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { tap } from 'rxjs/operators';
import { GatewayService } from 'src/app/core/services/gateway-service';
import { QuantridamtomService } from 'src/app/core/services/quantridamtom.service';
import { DeviceService } from 'src/app/core/services/device-service';
import { AlarmRule, DamTomRpcAlarmCreateDto, DieuKhienDto, DieuKienTB, RpcAlarm, RpcSettingDto, RuleRem, SuKienDto, SuKienKieuDuLieuType } from 'src/app/shared/models/dam-tom-rpc-alarm';
import { DamtomFull } from 'src/app/shared/models/damtom.model';
import { ThemMoiSuKienModalComponent } from '../them-moi-dieu-khien-tu-dong/them-moi-su-kien-modal/them-moi-su-kien-modal.component';
import { Device } from 'src/app/shared/models/device-model';
import { GetGatewayResponse } from 'src/app/shared/models/gateway-model';
import { ThemMoiRpcModalComponent } from '../them-moi-dieu-khien-tu-dong/them-moi-rpc-modal/them-moi-rpc-modal.component';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { DeviceRpcZone, DeviceZone, GroupRpc } from 'src/app/shared/models/dieukhien.model';
import { DamTomRpcAlarmService } from 'src/app/core/services/dam-tom-rpc-alarm.service';
import { escapedHTML } from 'src/app/shared/utils';
import { ThemMoiDieuKienThietBiModalComponent } from '../them-moi-dieu-khien-tu-dong/them-moi-dieu-kien-thiet-bi-modal/them-moi-dieu-kien-thiet-bi-modal.component';
import { AllDevice, AllDeviceNotType } from 'src/app/shared/models/luatcanhbao.model';
import { LuatCanhBaoService } from 'src/app/core/services/luat-canh-bao.service';
import { SpecialDevice } from '../../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';

@Component({
  selector: 'app-thong-tin-dieu-khien-tu-dong',
  templateUrl: './thong-tin-dieu-khien-tu-dong.page.html',
  styleUrls: ['./thong-tin-dieu-khien-tu-dong.page.scss'],
})
export class ThongTinDieuKhienTuDongPage implements OnInit {

  alarmType: string;
  damTomId: string;
  isLoading: boolean;
  alarm: RpcAlarm;
  dieuKienTB: DieuKienTB[] = [];
  damTom: DamtomFull = null;
  damTomName: string = null;
  isExistName: boolean;
  isGroupRpcControl: boolean;
  // xayRaDongThoi: boolean = true;
  suKien: SuKienDto[] = [];
  dieuKhien: DieuKhienDto[] = [];
  lstDeviceIDChoosed: string[] = [];
  lstDeviceDKTBChoosed: string[] = [];
  isDisableGroupRpc = false;
  isGoTop = false;
  lstAllDvice: AllDevice;
  lstAllDeviceNotType: AllDeviceNotType[] = [];
  @ViewChild(IonContent) gotoTop: IonContent;
  scheduleDayOfWeek = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  };
  showTimeOption = false;
  showLstDKTB = true;
  showLstDKMT = true;
  showLstDieuKhien = true;
  form: FormGroup;
  groupRpcs: GroupRpc[] = [];
  deviceZones: DeviceRpcZone[] = [];
  telemetry = [
    {
      key: 'Lux',
      // display: 'Ánh sáng (lux)',
      display: 'Ánh sáng',
      icon: 'assets/icon/luminosity.svg',
      dram: 'lux'
    },
    { key: 'Humidity', display: 'Độ ẩm', icon: 'assets/icon/humidity.svg', dram: '%' },
    {
      key: 'Temperature',
      display: 'Nhiệt độ',
      icon: 'assets/icon/temperature.svg',
      dram: '°C'
    },
  ];
  telemetryIcon = {
    Lux: {
      icon: 'assets/icon-darkmode/2_Anhsang_active.png'
    },
    Humidity: {
      icon: 'assets/icon-darkmode/3_Doam_active.png'
    },
    Temperature: {
      icon: 'assets/icon-darkmode/1_Nhietdo_active.png'
    }
  };
  iconRpc = {
    DEFAULT: {
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
      iconMkn: 'assets/icon-darkmode/15_remdong_dis.png',
      iconRai: 'assets/icon-darkmode/15_remdong_active.png',
      iconThu: 'assets/icon-darkmode/8_Rem_deactive.png',
    },
    DEN: {
      // iconOn: 'assets/icon-update/6_Den_xanh.png',
      // iconOff: 'assets/icon-update/6_Den_xam.png',
      // iconMkn: 'assets/icon-update/6_Den_mkn.png'
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
  constructor(
    // tslint:disable-next-line: variable-name
    private _activatedRoute: ActivatedRoute,
    // tslint:disable-next-line: variable-name
    // tslint:disable-next-line: variable-name
    private _modalController: ModalController,
    // tslint:disable-next-line: variable-name
    private _gatewayService: GatewayService,
    // tslint:disable-next-line: variable-name
    private _deviceService: DeviceService,
    // tslint:disable-next-line: variable-name
    private _damTomService: QuantridamtomService,
    // tslint:disable-next-line: variable-name
    private _dieuKhienService: DieuKhienService,
    // tslint:disable-next-line: variable-name
    private _loadingController: LoadingController,
    // tslint:disable-next-line: variable-name
    private _damTomRpcAlarmService: DamTomRpcAlarmService,
    // tslint:disable-next-line: variable-name
    private _toastCtl: ToastController,
    // tslint:disable-next-line: variable-name
    public _alertController: AlertController,
    // tslint:disable-next-line: variable-name
    private _navCtrl: NavController,
    // tslint:disable-next-line: variable-name
    private _fb: FormBuilder,
    private luatService: LuatCanhBaoService,
  ) { }

  ngOnInit() {
    this._activatedRoute.queryParams.subscribe(params => {
      this.isGroupRpcControl = false;
      // init lại data
      this.dieuKhien = [];
      this.suKien = [];
      this.dieuKienTB = [];
      this.isLoading = false;
      // this.xayRaDongThoi = true;
      this.scheduleDayOfWeek = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
      };
      this.groupRpcs = [];

      this.form = this._fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        duration: ['00:00:00'],
        scheduleStart: ['00:00'],
        scheduleEnd: ['00:00'],
        active: [true]
      });
      this.isExistName = false;
      this.damTomId = params.damTomId;
      this.alarmType = params.alarmType;
      this.fetchingData();
    });
  }

  async processingDelete() {
    // hiển thị loading
    const loading = await this._loadingController.create({ message: 'Đang xóa...' });
    loading.present();
    this.form.markAsPristine();

    try {
      const response = await this._damTomRpcAlarmService.deleteAlarm(this.damTomId, this.alarm.id).toPromise();
      const toast = await this._toastCtl.create({
        duration: 2000,
        color: 'success',
        position: 'bottom',
        message: 'Xóa thành công'
      });
      toast.present();
      this._navCtrl.back();
    } catch (error) {
      const toast = await this._toastCtl.create({
        duration: 2000,
        position: 'bottom',
        color: 'warning',
        message: 'Xóa thất bại!'
      });
      toast.present();
    }
    loading.dismiss();
  }

  onDeleteBtnClick() {
    this._alertController.create({
      message: escapedHTML(`Xóa kịch bản " ${this.alarm.alarmType}" ? `),
      cssClass: 'my-alert-custom-class',
      buttons: [
        {
          text: 'Quay lại',
          role: 'Cancel'
        },
        {
          text: 'Xác nhận',
          handler: () => {
            if (this.alarm.dftAlarmRule.active){
              this._toastCtl.create({
                duration: 2000,
                color: 'danger',
                position: 'bottom',
                message: 'Kịch bản điều khiển đang thực hiện điều khiển, không được xóa!'
              }).then(loadEl => {
                loadEl.present();
              });
            }
            else{
              this.processingDelete();
            }
          }
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  pad(num, size) {
    num = num.toString();
    while (num.length < size) { num = '0' + num; }
    return num;
  }

  millisToStr(ms: number) {
    let seconds = ms / 1000;
    // tslint:disable-next-line: radix
    const hours = parseInt((seconds / 3600) + '');
    seconds = seconds % 3600;
    // tslint:disable-next-line: radix
    const minutes = parseInt((seconds / 60) + '');
    seconds = seconds % 60;
    return `${this.pad(hours, 2)}:${this.pad(minutes, 2)}:${this.pad(seconds, 2)}`;
  }

  millisToStr2(ms: number) {
    let seconds = ms / 1000;
    // tslint:disable-next-line: radix
    const hours = parseInt((seconds / 3600) + '');
    seconds = seconds % 3600;
    // tslint:disable-next-line: radix
    const minutes = parseInt((seconds / 60) + '');
    seconds = seconds % 60;
    return `${this.pad(hours, 2)}:${this.pad(minutes, 2)}`;
  }

  getDeviceByGatewayId(telemetry) {
    let dvReturn: AllDeviceNotType;
    this.lstAllDeviceNotType.forEach((el) => {
      if (el.telemetryType.includes(telemetry)){
        dvReturn = el;
      }
    });
    return dvReturn;
  }
  getDetailDeviceRpc(key: string){
    let lstRpcDvices: AllDeviceNotType [] = [];
    lstRpcDvices = lstRpcDvices.concat(this.lstAllDvice.RPC);
    return lstRpcDvices.find(se => {
      return se.telemetryType.indexOf(key) >= 0;
    });
  }
  getDetailDeviceById(id: string){
    let lstRpcDvices: AllDeviceNotType [] = [];
    lstRpcDvices = lstRpcDvices.concat(this.lstAllDvice.RPC);
    return lstRpcDvices.find(se =>
      se.id === id
    );
  }
  
  // lấy dữ liệu hiện tại của trang và đưa vào form
  async initData() {
    try {
      this.deviceZones = await this.getDeviceZone();

      this.alarm = await this._damTomRpcAlarmService.getById(this.damTomId, this.alarmType).toPromise();
      
      this.form.get('name').patchValue(this.alarm.alarmType);
      this.form.get('active').patchValue(this.alarm.dftAlarmRule.active);

      // danh sách sự kiện
      this.alarm.createRules.MAJOR.condition.condition.forEach((el, i) => {
        
        // nếu el.key.key ko nằm trong danh sách telemetry => đây là luật Điều kiện bổ sung
        // if (this.telemetry.filter((el2) => el2.key === el.key?.key).length === 0)
        if (this.getDetailDeviceRpc(el.key?.key)) {
          this.dieuKienTB.push({
            id: el.key?.key,
            trangThai: el.predicate?.value?.defaultValue === 1,
            labelTB: el.key?.key,
            deviceType: this.getDetailDeviceRpc(el.key?.key).deviceType
          });
          this.lstDeviceDKTBChoosed.push(el.key?.key);
          return;
        }

        if (el.predicate.type === 'NUMERIC') {
          // xảy ra đồng thời
          this.suKien.push({
            duLieuCamBien: this.getTypeSensor(el.key.key),
            kieuDuLieu: this.alarm.dftAlarmRule.gatewayIds.length > 0 ? SuKienKieuDuLieuType.CU_THE : SuKienKieuDuLieuType.BAT_KY,
            camBien: this.getDeviceByGatewayId(el.key.key)?.id,
            // tslint:disable-next-line: max-line-length
            tenCamBien: this.getDeviceByGatewayId(el.key.key)?.label ? this.getDeviceByGatewayId(el.key.key)?.label : this.getDeviceByGatewayId(el.key.key)?.name,
            nguongGiaTri: el.predicate.value.defaultValue,
            toanTu: el.predicate.operation,
            gatewayId: this.alarm.dftAlarmRule.gatewayIds[i],
          });

          return;
        }
        // xảy ra một trong
        el.predicate.predicates.forEach((el2, j) => {
          this.suKien.push({
            duLieuCamBien: this.getTypeSensor(el.key.key),
            kieuDuLieu: this.alarm.dftAlarmRule.gatewayIds.length > 0 ? SuKienKieuDuLieuType.CU_THE : SuKienKieuDuLieuType.BAT_KY,
            camBien: this.getDeviceByGatewayId(el.key.key)?.id,
            // tslint:disable-next-line: max-line-length
            tenCamBien: this.getDeviceByGatewayId(el.key.key)?.label ? this.getDeviceByGatewayId(el.key.key)?.label : this.getDeviceByGatewayId(el.key.key)?.name,
            nguongGiaTri: el2.value.defaultValue,
            toanTu: el2.operation,
            gatewayId: this.alarm.dftAlarmRule.gatewayIds[j],
          });
        });
      });
      
      // khoảng thời gian các sự kiện xảy ra
      if (this.alarm.createRules.MAJOR.condition.spec) {
        this.form.get('duration').patchValue(this.millisToStr(this.alarm.createRules.MAJOR.condition.spec.value * 1000));
      }

      // lịch điều khiển
      if (this.alarm.createRules.MAJOR.schedule) {
        this.form.get('scheduleStart').patchValue(this.millisToStr2(this.alarm.createRules.MAJOR.schedule.startsOn));
        this.form.get('scheduleEnd').patchValue(this.millisToStr2(this.alarm.createRules.MAJOR.schedule.endsOn));

        this.alarm.createRules.MAJOR.schedule.daysOfWeek.forEach((el) => {
          this.scheduleDayOfWeek[el + ''] = true;
        });
      }
      this.isDisableGroupRpc = true;
      // ChuongNV - Neu dieu khien la group-rpc thi gan this.isGroupRpcControl=true;
      if (this.alarm.dftAlarmRule.groupRpcIds.length > 0){
        this.isGroupRpcControl = true;
        this.isDisableGroupRpc = false;
      }
      // danh sách thực hiện nhóm điều khiển
      this.alarm.dftAlarmRule.groupRpcIds.forEach((el) => {
        this.dieuKhien.push({
          typeRpc: 'group-rpc',
          groupRpcId: el
        });
      });

      // danh sách thực hiện thiết bị điều khiển
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.alarm.dftAlarmRule.rpcSettingIds.length; i++) {
        try {
          const rpcSetting = await this._dieuKhienService.getRpcSettingById(this.alarm.dftAlarmRule.rpcSettingIds[i]).toPromise();
          // setting thiet bi khac
          if (rpcSetting.actionRem == null) {
            this.dieuKhien.push({
              typeRpc: 'rpc',
              valueControl: rpcSetting.valueControl === 1 ? true : false,
              callbackOption: rpcSetting.callbackOption,
              delayTime: this.millisToStr(rpcSetting.delayTime),
              deviceId: rpcSetting.deviceId,
              loopCount: rpcSetting.loopCount,
              loopOption: rpcSetting.loopOption,
              loopTimeStep: this.millisToStr(rpcSetting.loopTimeStep),
              timeCallback: this.millisToStr(rpcSetting.timeCallback),
              id: rpcSetting.id,
              rpcId: rpcSetting.id,
              deviceType: this.getDetailDeviceById(rpcSetting.deviceId).deviceType
            });
          } 
          // setting thiet bi rem
          if (!!rpcSetting.actionRem) {
            this.dieuKhien.push({
              typeRpc: 'rem',
              valueControl: rpcSetting.valueControl === 1 ? true : false,
              deviceId: rpcSetting.deviceId, // id pull push
              id: rpcSetting.id,
              rpcId: rpcSetting.id,
              deviceType: this.getDetailDeviceById(rpcSetting.deviceId).deviceType,
              pullPush: rpcSetting.actionRem,
              percent: rpcSetting.percentRem,
              // timePredict: this.msToTime(this.getRem(rpcSetting.deviceId, rpcSetting.actionRem).finishTime, rpcSetting.percentRem),
            });
          }
          
          this.lstDeviceIDChoosed.push(rpcSetting.deviceId);
        } catch (error) {
        }
      }

        // dieu kien thiet bi rem
        this.alarm.dftAlarmRule.ruleThietBiRem.forEach(rule => {
          this.dieuKienTB.forEach(dktb => {
            if (dktb.id === this.getDeviceNameDeLuu(rule.thietBiRemId)) {
              dktb.pullPush = rule.actionRem;
              dktb.percent = rule.percentRem;
              dktb.compare = rule.compare;
            }
          });
        })
        
    } catch (error) {
    }
  }

  async fetchingData() {
    this.isLoading = true;

    // trungdt - lấy dữ liệu đầm tôm
    try {
      this.damTom = await this._damTomService.getDamtomByIdAll(this.damTomId).toPromise();
      this.damTomName = this.damTom?.name;
    } catch (error) {
    }

    // trungdt - lấy danh sách nhóm điều khiển của đầm
    try {
      this.groupRpcs = await this._dieuKhienService.getAllGroupRpc(this.damTomId).toPromise();
    } catch (error) {
    }
    this.lstAllDvice = await this.luatService.getAllDevice(this.damTomId).toPromise();
    this.lstAllDeviceNotType = this.lstAllDeviceNotType.concat(this.lstAllDvice.Temperature)
    .concat(this.lstAllDvice.Humidity)
    .concat(this.lstAllDvice.Lux)
    .concat(this.lstAllDvice.RPC);
    await this.initData();
    this.isLoading = false;
  }

  // Get device with zone
  // Get device with zone
  getDeviceZone(){
    return this._deviceService.getDeviceRpcWithZone(this.damTomId).toPromise();
  }
  async presentModalThemMoiSuKien() {
    if (!this.damTom) { return; }
    const modal = await this._modalController.create({
      component: ThemMoiSuKienModalComponent,
      cssClass: 'them-moi-su-kien-modal',
      componentProps: {
        devices: this.lstAllDvice
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (!data.data) { return; }

    this.suKien.push(data.data);
    this.form.markAsDirty();
  }

  // them moi dieu kien thiet bi
  async presentModalThemMoiDKTB(){
    if (!this.damTom) { return; }
    const modal = await this._modalController.create({
      component: ThemMoiDieuKienThietBiModalComponent,
      cssClass: 'them-moi-su-kien-modal',
      componentProps: {
        deviceIdChoosed: this.lstDeviceDKTBChoosed,
        devices: this.deviceZones
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (!data?.data) { return; }
    this.dieuKienTB.push(data.data);
    this.lstDeviceDKTBChoosed.push(data.data.id);
    this.form.markAsDirty();
  }

  async presentModalThemMoiRpc() {
    if (!this.damTom) { return; }
    const modal = await this._modalController.create({
      component: ThemMoiRpcModalComponent,
      cssClass: 'them-moi-su-kien-modal',
      componentProps: {
        deviceIdChoosed: this.lstDeviceIDChoosed,
        isDisableGroupRpc: this.isDisableGroupRpc,
        devices: this.deviceZones,
        groupRpcs: this.groupRpcs,
        selectedDieuKhien: this.dieuKhien
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (!data.data) { return; }

    // ChuongNV - Check neu chon dieu khien bo thiet bi thi hidden nut them moi
    if (data.data.typeRpc === 'group-rpc'){
      this.dieuKhien = [];
      this.dieuKhien.push(data.data);
      this.isGroupRpcControl = true;
      this.isDisableGroupRpc = false;
    }
    else{
      this.isGroupRpcControl = false;
      this.dieuKhien.push(data.data);
      this.isDisableGroupRpc = true;
      this.lstDeviceIDChoosed.push(data.data.deviceId);
    }
    this.form.markAsDirty();
  }

  deleteSuKien(index) {
    this.suKien.splice(index, 1);
    this.form.markAsDirty();
  }

  editSuKien(index) {
    this.presentModalEditSuKien(index);
  }

  deleteDKTB(dktbElement, index) {
    this.dieuKienTB.splice(index, 1);
    this.form.markAsDirty();
    this.lstDeviceDKTBChoosed.forEach((rpcDv, i) => {
      if (rpcDv === dktbElement.id) {
        this.lstDeviceDKTBChoosed.splice(i, 1);
      }
    });
  }
  onChangeTrangThai(dktb){
    dktb.trangThai = !dktb.trangThai;
    this.form.markAsDirty();
  }
  onChangeTrangThaiDK(dkhien: DieuKhienDto){
    dkhien.valueControl = !dkhien.valueControl;
    dkhien.rpcId = null;
    this.form.markAsDirty();
  }

  editDKTB(index) {
    this.presentModalEditDKTB(index);
  }
  toggleAccordionList(dieuKhienInput: DieuKhienDto){
    dieuKhienInput.openAccordition = !dieuKhienInput.openAccordition;
  }
  async presentModalEditSuKien(index) {
    if (!this.damTom) { return; }
    const modal = await this._modalController.create({
      component: ThemMoiSuKienModalComponent,
      cssClass: 'them-moi-su-kien-modal',
      componentProps: {
        devices: this.lstAllDvice,
        editData: this.suKien[index]
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (!data.data) { return; }

    this.suKien[index] = data.data;
    this.form.markAsDirty();
  }

  async presentModalEditDKTB(index) {
    if (!this.damTom) { return; }
    const modal = await this._modalController.create({
      component: ThemMoiDieuKienThietBiModalComponent,
      cssClass: 'them-moi-su-kien-modal',
      componentProps: {
        deviceIdChoosed: this.lstDeviceDKTBChoosed,
        devices: this.deviceZones,
        editData: this.dieuKienTB[index]
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (!data?.data) { return; }
    this.dieuKienTB[index] = data.data;
    this.lstDeviceDKTBChoosed = [];
    this.dieuKienTB.forEach(e => {
      this.lstDeviceDKTBChoosed.push(e.id);
    });
    this.form.markAsDirty();
  }

  deleteRpc(dkElement: DieuKhienDto, index) {
    this.dieuKhien.splice(index, 1);
    // Neu xoa het dieu khien thi gan lai la false de cho phep chon nhom dieu khien
    if (this.dieuKhien.length === 0){
      this.isDisableGroupRpc = false;
      this.isGroupRpcControl = false;
    }
    this.lstDeviceIDChoosed.forEach((rpcDv, i) => {
      if (rpcDv === dkElement.deviceId) {
        this.lstDeviceIDChoosed.splice(i, 1);
      }
    });
    this.form.markAsDirty();
  }

  editRpc(index) {
    this.presentModalEditRpc(index);
  }

  async presentModalEditRpc(index) {
    if (!this.damTom) { return; }
    const modal = await this._modalController.create({
      component: ThemMoiRpcModalComponent,
      cssClass: 'them-moi-su-kien-modal',
      componentProps: {
        isDisableGroupRpc: this.dieuKhien.length > 1 ? true : false,
        deviceIdChoosed: this.lstDeviceIDChoosed,
        devices: this.deviceZones,
        groupRpcs: this.groupRpcs,
        selectedDieuKhien: this.dieuKhien,
        editData: this.dieuKhien[index]
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (!data.data) { return; }

    // ChuongNV
    if (data.data.typeRpc === 'group-rpc'){
      this.dieuKhien = [];
      this.dieuKhien.push(data.data);
      this.isGroupRpcControl = true;
    }
    else{
      this.isGroupRpcControl = false;
      this.dieuKhien[index] = data.data;
      this.lstDeviceIDChoosed = [];
      this.dieuKhien.forEach(e => {
        this.lstDeviceIDChoosed.push(e.deviceId);
      });
    }
    this.form.markAsDirty();
  }

  toggleDayOfWeek(value) {
    this.scheduleDayOfWeek[value] = !this.scheduleDayOfWeek[value];
    this.form.markAsDirty();
  }

  validate(fieldName: string, errorName: string) {
    // tslint:disable-next-line: max-line-length
    return (this.form.controls[fieldName].touched || this.form.controls[fieldName].dirty) && this.form.controls[fieldName].hasError(errorName);
  }

  isFormValid(): boolean {
    // tslint:disable-next-line: max-line-length
    return !!this.form && this.form.valid && this.dieuKhien.length > 0 && (this.suKien.length > 0 || this.dieuKienTB.length > 0) && !this.checkValidVaoCacNgay() && !this.checkValidTime();
  }
  getTypeSensor(tenSensor: string): string{
    const sensorFind = this.lstAllDeviceNotType.find(e => {
      return e.telemetryType.indexOf(tenSensor) >= 0;
    });
    return sensorFind.tbKey;
  }
  getSuKienDisplay(suKien: SuKienDto) {
    let telemetryName;
    this.telemetry.forEach((el) => {
      if (el.key === suKien.duLieuCamBien) {
        telemetryName = el;
      }
    });
    return `${
      (suKien.kieuDuLieu === SuKienKieuDuLieuType.CU_THE
        ? suKien.tenCamBien
        : 'Cảm biến bất kỳ')
    } ${suKien.toanTu === 'LESS_OR_EQUAL' ? '≤' : '≥'} ${suKien.nguongGiaTri} ${telemetryName.dram}`;
  }

  // getRpcDevice(): Device[] {
  //   return this.devices
  //     .filter((el) => {
  //       let match = false;
  //       el.telemetry.forEach((key) => {
  //         this.telemetry.forEach((telemetry) => {
  //           if (telemetry.key === key) { match = true };
  //         })
  //       })
  //       return !match;
  //     })
  //     .sort(function (a, b) {
  //       if (a.label < b.label) { return -1; }
  //       if (a.label > b.label) { return 1; }
  //       return 0;
  //     });
  // }
  getRemNameFromIdPullPush(idPullPush: string, actionRem: string): string {
    var nameRem: string;
    var rem: SpecialDevice;
    this.deviceZones.forEach(zone => {
      if (actionRem === 'PUSH') {
        rem  = zone.rpcRemList.find(rem => rem.rpcPushId === idPullPush);
      } else {
        rem  = zone.rpcRemList.find(rem => rem.rpcPullId === idPullPush);
      }
      if (!!rem) {
        nameRem = rem.name;
      }
    })
    return nameRem;
  }
  getDeviceName(deviceId) {
    const device = this.lstAllDvice.RPC.find((el) => {
      return el.id === deviceId;
    });
    return device.label ? device.label : device.name;
  }
  getDeviceNameDeLuu(deviceId){
    const device = this.lstAllDvice.RPC.find((el) => {
      return el.id === deviceId;
    });
    return device.name;
  }
  getGroupRpcName(id) {
    return this.groupRpcs.find((el) => {
      return el.groupRpcId === id;
    })?.name;
  }

  getDieuKhienDisplay(obj: DieuKhienDto) {
    if (obj.deviceType !== 'REM') {
      return `${
        this.isGroupRpcControl ? '' : obj.valueControl ? 'Bật' : 'Tắt'
      } ${
        obj.typeRpc === 'rpc'
          ? this.getDeviceName(obj.deviceId)
          : this.getGroupRpcName(obj.groupRpcId)
      }`;
    } else {
      return this.getRemNameFromIdPullPush(obj.deviceId, obj.pullPush);
    }
  }

  getIdPullPushFromIdRem(idRem: string, controlRem: string): string {
    var idPullOrPush: string;
    var rem: SpecialDevice;
    this.deviceZones.forEach(zone => {
      rem = zone.rpcRemList.find(rem => rem.id === idRem);

      if (controlRem === 'PUSH') {
        if (!!rem) {
          idPullOrPush = rem.rpcPushId
        }
      } else {
        if (!!rem) {
          idPullOrPush = rem.rpcPullId
        }
      }
    })
    console.log('get id pull push', idPullOrPush);
    return idPullOrPush;
  }
  getPullPushNameFromId(idPullPush: string, controlRem: string): string {
    var nameDv: string;
    var rem: SpecialDevice;
    this.deviceZones.forEach(zone => {
      if (controlRem === 'PUSH') {
        rem = zone.rpcRemList.find(rem => rem.rpcPushId === idPullPush);
        if (!!rem) {
          nameDv = rem.rpcPushDevice.tenThietBi
        }
      } else {
        rem = zone.rpcRemList.find(rem => rem.rpcPullId === idPullPush);
        if (!!rem) {
          nameDv = rem.rpcPullDevice.tenThietBi
        }
      }
    })
    console.log('get name pull push', nameDv);
    return nameDv;
  }

  toMillis(str: string): number {
    if (!str) { return 0; }
    const arr = str.split(':');
    // chỉ xử lý định dạng HH:mm:ss hoặc HH:mm
    if (arr.length < 2 || arr.length > 3) { return; }
    // tslint:disable-next-line: radix
    const hour = !!arr[0] ? parseInt(arr[0]) : 0;
    // tslint:disable-next-line: radix
    const minute = !!arr[1] ? parseInt(arr[1]) : 0;
    // tslint:disable-next-line: radix
    const second = !!arr[2] ? parseInt(arr[2]) : 0;

    return hour * 60 * 60 * 1000 + minute * 60 * 1000 + second * 1000;
  }

  async submit() {
    // hiển thị loading
    const loading = await this._loadingController.create({ message: '' });
    loading.present();

    // rule rem
    var ruleRem: RuleRem [] = [];

    // object alarm cần lưu
    const rpcAlarm: DamTomRpcAlarmCreateDto = {
      damtomId: this.damTomId,
      deviceProfileAlarm: {
        id: this.alarm.id,
        alarmType: this.form.get('name').value.trim(),
        createRules: {
          MAJOR: {
            condition: {
              condition: []
            },
          }
        },
        dftAlarmRule: {
          active: this.form.get('active').value,
          gatewayIds: [],
          groupRpcIds: [],
          rpcAlarm: true,
          rpcSettingIds: [],
          ruleThietBiRem: ruleRem,
        }
      }
    };

    // clear lại mảng rpc để cập nhật
    rpcAlarm.deviceProfileAlarm.dftAlarmRule.groupRpcIds = [];
    rpcAlarm.deviceProfileAlarm.dftAlarmRule.rpcSettingIds = [];
    // duyệt danh sách điều khiển đã tạo
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.dieuKhien.length; i++) {
      if (this.dieuKhien[i].typeRpc === 'group-rpc') {
        // lưu id group rpc vào rpcAlarm.deviceProfileAlarm.dftAlarmRule.groupRpcIds với nhóm điều khiển
        rpcAlarm.deviceProfileAlarm.dftAlarmRule.groupRpcIds.push(this.dieuKhien[i].groupRpcId);
        continue;
      }

      // rpc setting cũ thì lưu lại luôn không gọi api create
      if (!!this.dieuKhien[i].rpcId) {
        rpcAlarm.deviceProfileAlarm.dftAlarmRule.rpcSettingIds.push(this.dieuKhien[i].rpcId);
        continue;
      }

      // gọi api tạo mới với điều khiển thiết bị với dữ liệu mới
      var rpcSetting: RpcSettingDto;
      if (this.dieuKhien[i].deviceType !== 'REM') {
        // tao dieu khien voi thiet bi khac
        rpcSetting = {
          valueControl: this.dieuKhien[i].valueControl ? 1 : 0,
          callbackOption: this.dieuKhien[i].callbackOption,
          loopOption: this.dieuKhien[i].loopOption ? true : false,
          deviceId: this.dieuKhien[i].deviceId,
          delayTime: this.toMillis(this.dieuKhien[i].delayTime),
          deviceName: this.getDeviceNameDeLuu(this.dieuKhien[i].deviceId)
        };
        if (!!rpcSetting.callbackOption) {
          rpcSetting.timeCallback = this.toMillis(this.dieuKhien[i].timeCallback);
        }
        if (!!rpcSetting.loopOption) {
          rpcSetting.loopCount = this.dieuKhien[i].loopCount;
          rpcSetting.loopTimeStep = this.toMillis(this.dieuKhien[i].loopTimeStep);
        }
      } else {
        // tao dieu khien voi thiet bi rem
        rpcSetting = {
          valueControl: 1,
          callbackOption: true,
          deviceId: this.dieuKhien[i].deviceId,
          deviceName: this.getPullPushNameFromId(this.dieuKhien[i].deviceId, this.dieuKhien[i].pullPush),
          percentRem: this.dieuKhien[i].percent,
          actionRem: this.dieuKhien[i].pullPush,
          remId: this.getRem(this.dieuKhien[i].deviceId,this.dieuKhien[i].pullPush).id,
          // timeRem: this.getRem(this.dieuKhien[i].deviceId,this.dieuKhien[i].pullPush).finishTime,
          typeDeviceRem: this.dieuKhien[i].pullPush,
        };
      }
      
      try {
        const response: RpcSettingDto = await this._dieuKhienService
        .saveRpcSetting(rpcSetting)
        .toPromise();
        // push lại id rpc setting để lưu vào alarm
        rpcAlarm.deviceProfileAlarm.dftAlarmRule.rpcSettingIds.push(response.id);
      } catch (error) {
        this._loadingController.dismiss();
        return;
      }
    }

    // duyệt mảng sự kiện, lưu vào rpcAlarm
    // xảy ra đồng thời
    this.suKien.forEach((el, i) => {
      const obj: AlarmRule = {
        key: {
          type: 'TIME_SERIES',
          key: this.lstAllDvice[el.duLieuCamBien][0].telemetryType[0],
          valueType: 'NUMERIC',
        },
        predicate: {
          type: 'NUMERIC',
          operation: el.toanTu,
          value: {
            defaultValue: el.nguongGiaTri
          }
        }
      };

      if (el.kieuDuLieu === SuKienKieuDuLieuType.CU_THE) {
        // tslint:disable-next-line: max-line-length
        obj.key.key = this.lstAllDvice[el.duLieuCamBien]?.find(dvs => dvs.id === el.camBien).telemetryType[0];
        rpcAlarm.deviceProfileAlarm.dftAlarmRule.gatewayIds.push(el.gatewayId);
      }
      rpcAlarm.deviceProfileAlarm.createRules.MAJOR.condition.condition.push(obj);
    });
    // xảy ra một trong các sự kiện
    // if (!this.xayRaDongThoi && this.suKien.length > 0) {
    //   const obj: AlarmRule = {
    //     key: {
    //       type: 'TIME_SERIES',
    //       key: '',
    //       valueType: 'NUMERIC',
    //     },
    //     predicate: {
    //       type: 'COMPLEX',
    //       operation: 'OR',
    //       predicates: []
    //     }
    //   };
    //   this.suKien.forEach((el, i) => {
    //     obj.key.key = el.duLieuCamBien;
    //     obj.predicate.predicates.push({
    //       type: 'NUMERIC',
    //       operation: el.toanTu,
    //       value: { defaultValue: el.nguongGiaTri }
    //     })
    //     if (el.kieuDuLieu === SuKienKieuDuLieuType.CU_THE) {
    //       rpcAlarm.deviceProfileAlarm.dftAlarmRule.gatewayIds.push(el.gatewayId);
    //     }
    //   });
    //   rpcAlarm.deviceProfileAlarm.createRules.MAJOR.condition.condition.push(obj);
    // }

    // khoảng thời gian các sự kiện xảy ra
    if (this.form.get('duration').value !== '00:00:00') {
      rpcAlarm.deviceProfileAlarm.createRules.MAJOR.condition.spec = {
        type: 'DURATION',
        unit: 'SECONDS',
        value: this.toMillis(this.form.get('duration').value) / 1000
      };
    }

    // lịch điều khiển
    const activeDays = [];
    Object.keys(this.scheduleDayOfWeek).forEach(key => {
      // tslint:disable-next-line: radix
      if (this.scheduleDayOfWeek[key]) { activeDays.push(parseInt(key)); }
    });
    if (activeDays.length > 0) {
      rpcAlarm.deviceProfileAlarm.createRules.MAJOR.schedule = {
        type: 'SPECIFIC_TIME',
        timezone: 'Asia/Bangkok',
        daysOfWeek: activeDays,
        startsOn: this.toMillis(this.form.get('scheduleStart').value),
        endsOn: this.toMillis(this.form.get('scheduleEnd').value),
      };
    }

    // điều kiện bổ sung
    this.dieuKienTB.forEach((el) => {
      if (!el.id) { return; }

      const obj: AlarmRule = {
        key: {
          type: 'TIME_SERIES',
          key: el.id,
          valueType: 'NUMERIC',
        },
        predicate: {
          type: 'NUMERIC',
          operation: 'EQUAL',
          value: {
            defaultValue: !!el.trangThai ? 1 : 0
          }
        }
      };

      rpcAlarm.deviceProfileAlarm.createRules.MAJOR.condition.condition.push(obj);

      // rule list rem
      if (el.deviceType === 'REM') {
        ruleRem.push({
          remId: this.getRemByNameRpc(el.id , 'PULL').id,
          thietBiRemId: this.getIdPullFromNamePull(el.id), 
          actionRem: el.pullPush,
          active: 1,
          percentRem: el.percent,
          compare: el.compare,
        })
      }
    });

    try {
      const response = await this._damTomRpcAlarmService.saveAlarm(rpcAlarm).toPromise();
      // lưu thành công, quay trở lại màn hình danh sách

      this._toastCtl.create({
        message: 'Cập nhật thành công!',
        duration: 2000,
        color: 'success',
      }).then(toastCtrl => {
        toastCtrl.present();
      });

      this.form.reset();
      this.form.markAsPristine();
      this._navCtrl.back();

    } catch (error) {
      this.isExistName = error.error === 'Tên điều khiển tự động đã tồn tại!' ? true : false;
      // this._toastCtl.create({
      //   message: error.error === 'Tên điều khiển tự động đã tồn tại!' ? 'Tên kịch bản đã tồn tại!' : 'Lỗi không xác định!',
      //   color: 'danger',
      //   duration: 5000
      // }).then(toastCtrl => {
      //   toastCtrl.present();
      // });
    }

    this._loadingController.dismiss().finally(() => {
      this.gotoTop.scrollToTop(0);
    });
  }

  getIdRem(rpcId: string, actionRem: string) {
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

  getIdRemByIdPull(idPull: string): string {
    var idRem: string;
    var rem: SpecialDevice;
    this.deviceZones.forEach(zone => {
      rem = zone.rpcRemList.find(rem => rem.rpcPullId === idPull);
      if (!!rem) {
        idRem = rem.id;
      }
    })
    return idRem;
  }

  getRemByNameRpc(nameRpc: string, actionRem: string): SpecialDevice {
    var rem: SpecialDevice;
    if (actionRem === 'PUSH') {
      this.deviceZones.forEach(zone => {
        if (!!zone.rpcRemList.find(rem => rem.rpcPushDevice.tenThietBi === nameRpc)) {
          rem = zone.rpcRemList.find(rem => rem.rpcPushDevice.tenThietBi === nameRpc);
        }
      })
    } else {
      this.deviceZones.forEach(zone => {
        if (!!zone.rpcRemList.find(rem => rem.rpcPullDevice.tenThietBi === nameRpc)) {
          rem = zone.rpcRemList.find(rem => rem.rpcPullDevice.tenThietBi === nameRpc);
        }
      })
    }
    console.log('rem', rem);
    
    return rem;
  }

  getIdPullFromNamePull(namePull: string): string {
    var rem: SpecialDevice;
    var idPull: string;
    this.deviceZones.forEach(zone => {
      rem = zone.rpcRemList.find(rem => rem.rpcPullDevice.tenThietBi === namePull);
      if (!!rem) {
        idPull = rem.rpcPullId;
      }
    });
    return idPull;
  }

  getIdFromNameRem(nameRpc: string, actionRem: string): string {
    var idRpc: string;
    var rem: SpecialDevice;
    if (actionRem === 'PUSH') {
      this.deviceZones.forEach(zone => {
        if (!!zone.rpcRemList.find(rem => rem.rpcPushDevice.tenThietBi === nameRpc)) {
          rem = zone.rpcRemList.find(rem => rem.rpcPushDevice.tenThietBi === nameRpc);
          idRpc = rem.rpcPushDevice.deviceId;
        }
      })
    } else {
      this.deviceZones.forEach(zone => {
        if (!!zone.rpcRemList.find(rem => rem.rpcPullDevice.tenThietBi === nameRpc)) {
          rem = zone.rpcRemList.find(rem => rem.rpcPullDevice.tenThietBi === nameRpc);
          idRpc = rem.rpcPullDevice.deviceId;
        }
      })
    }
    return idRpc;
  }

  daChonNhomDieuKhien(): boolean {
    let result = false;
    this.dieuKhien.forEach((el) => {
      if (!!el.groupRpcId) { result = true; }
    });
    return result;
  }
  // getTenDevicebyId(dvIDInput:string){
  //   let name;
  //   this.deviceZones.forEach(e=>{
  //     if(e.deviceEntityList.find(el=>{return el.id==dvIDInput})!==undefined){
  //       name=e.deviceEntityList.find(el=>{return el.id==dvIDInput}).name;
  //     }
  //   })
  //   return name;
  // }
  checkValidTime(){
    return this.toMillis(this.form.get('scheduleStart').value) > this.toMillis(this.form.get('scheduleEnd').value);
  }
  checkValidVaoCacNgay(){
    // tslint:disable-next-line: triple-equals
    // tslint:disable-next-line: max-line-length
    return this.scheduleDayOfWeek[1] === false && this.scheduleDayOfWeek[2] === false && this.scheduleDayOfWeek[3] === false && this.scheduleDayOfWeek[4] === false && this.scheduleDayOfWeek[5] === false && this.scheduleDayOfWeek[6] === false && this.scheduleDayOfWeek[7] === false;
  }
  convertLongToDate(time: string){
    time.split(':');
    let hour = time.split(':')[0];
    let minutes = time.split(':')[1];
    let seconds = time.split(':')[2];
    // if(hour !== "00" && minutes !== "00" && seconds !== "00"){
    //   return time;
    // }
    if (hour === '00' && minutes === '00' && seconds === '00'){
      return '0 giây';
    }
    if (hour === '00'){
      hour = '';
    }
    else{
      hour = hour + ' giờ';
    }
    if (minutes === '00'){
      minutes = '';
    }
    else{
      minutes = ' ' + minutes + ' phút';
    }
    if (seconds === '00'){
      seconds = '';
    }
    else{
      seconds =  ' ' + seconds + ' giây';
    }
    return hour + minutes + seconds;
  }
  getLabelOrNameTB(tenTb: string){
    let label = tenTb;
    this.lstAllDeviceNotType.forEach(e => {
      if (e.telemetryType[0] === tenTb){
        label = !!e.label ? e.label : e.name;
      }
    });
    return label;
  }
  getNameRemFromNamePull(namePull: string): string {
    var nameRem: string;
    var rem: SpecialDevice;
    this.deviceZones.forEach(zone => {
      rem = zone.rpcRemList.find(rem => rem.rpcPullDevice.tenThietBi === namePull);
      if (!!rem) {
        nameRem = rem.name;
      }
    });
    return nameRem;
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
  msToTime(timeFinish: number, percent: number) {
    var duration = 0;

    duration = (timeFinish / 100) * percent;

    // convert 00:00:00
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    let hoursStr = (hours < 10) ? '0' + hours : hours.toString();
    let minutesStr = (minutes < 10) ? '0' + minutes : minutes.toString();
    let secondsStr = (seconds < 10) ? '0' + seconds : seconds.toString();
  
    return hoursStr + ":" + minutesStr + ":" + secondsStr;
  }

  checkConditionShowIconRem(dktb: DieuKienTB): string {
    if ((dktb.compare === 'GREAT' &&  dktb.percent === 0) || 
    (dktb.compare === 'GREAT' &&  (dktb.percent <= 100 && dktb.percent > 0))) {
      return 'rai';
    }
    if (dktb.compare === 'LESS' && (dktb.percent <= 100 && dktb.percent > 0)) {
      return 'rai';
    }
    if (dktb.compare === 'EQUAL' && (dktb.percent <= 100 && dktb.percent > 0)) {
      return 'rai';
    }
    if (dktb.compare === 'EQUAL' && dktb.percent === 0) {
      return 'thu';
    }
  }
  convertSignCompare(key: string) {
    switch (key) {
      case 'GREAT':
        return '>';
      case 'LESS':
        return '<';
      case 'EQUAL':
        return '=';
      default:
        return 'Điều kiện không hợp lệ';
    }
  }
}
