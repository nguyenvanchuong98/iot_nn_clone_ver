import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  AlertController,
  IonContent,
  IonSlides,
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { LuatCanhBaoService } from 'src/app/core/services/luat-canh-bao.service';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { escapedHTML } from 'src/app/shared/utils';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import {
  AllDevice,
  AllDeviceNotType,
  DeviceProfileAlarmDto,
  DeviceProfileWithTime,
  LuatCBDto,
} from 'src/app/shared/models/luatcanhbao.model';
import { forkJoin, Observable } from 'rxjs';
import { deepClone } from 'src/app/core/utils';
const DAMTOM_DOES_NOT_EXIST = 'Damtom does not exist';
const ALARM_RULE_NAME_ALREADY_EXIST = 'Alarm rule name already exist';
const ALARM_RULE_DOES_NOT_EXIST = 'Alarm rule does not exist';
const ALARM_RULE_NAME_CANNOT_BE_NULL = 'Alarm rule name can not be null';
@Component({
  selector: 'app-thong-tin-luat-canh-bao',
  templateUrl: './thong-tin-luat-canh-bao.page.html',
  styleUrls: ['./thong-tin-luat-canh-bao.page.scss'],
})
export class ThongTinLuatCanhBaoPage implements OnInit {
  damTomId: string;
  alarmId: string;
  oldAlarmType: string;
  alarmDetail: DeviceProfileAlarmDto;
  editFormLCB: FormGroup;
  segment = 0;
  isLoading = false;
  statusExistTen = false;
  lstAllDvice: AllDevice;
  listAllSensorNotType: AllDeviceNotType[] = [];
  scheduleDayOfWeek = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  };
  isGoTop = false;
  @ViewChild(IonContent) gotoTop: IonContent;
  @ViewChild('slides', { static: true }) slider: IonSlides;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private giamsatService: GiamSatService,
    public alertController: AlertController,
    private luatService: LuatCanhBaoService,
    private router: Router,
    private dieuKhienService: DieuKhienService,
    public toastCtrl: ToastController
    ) { }
  async ngOnInit() {
    this.route.queryParams.subscribe((data) => {
      this.damTomId = data.damTomId;
      this.alarmId = data.alarmId;
      this.oldAlarmType = data.oldAlarmType;
    });
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    this.scheduleDayOfWeek = {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
    };
    this.initFormData(date);
    this.lstAllDvice = await this.luatService.getAllDevice(this.damTomId).toPromise();
    this.listAllSensorNotType = this.listAllSensorNotType.concat(this.lstAllDvice.Temperature)
    .concat(this.lstAllDvice.Humidity)
    .concat(this.lstAllDvice.Lux)
    .concat(this.lstAllDvice.RPC);
    this.getDetailAlarm();
  }
  ionViewWillEnter() {
    this.isLoading = true;
  }
  // Khởi tạo form mặc định
  initFormData(date) {
    this.editFormLCB = this.fb.group({
      tenLCB: ['', { validators: [Validators.required] }],
      loaiDieukien: '',
      viaSMS: [false, { validators: [Validators.required] }],
      viaNotification: [true, { validators: [Validators.required] }],
      viaEmail: [false, { validators: [Validators.required] }],
      nguongTren: [
        '',
        { validators: [Validators.pattern('^[0-9]+([.,][0-9]{0,})?$')] },
      ],
      nguongDuoi: [
        '',
        { validators: [Validators.pattern('^[0-9]+([.,][0-9]{0,})?$')] },
      ],
      // thoiGianXacNhan:this.convertSecondtoTime(0),
      thoiGianXacNhan: new Date(date).toISOString(),
      scheduleStart: ['00:00'],
      scheduleEnd: ['00:00'],
    });
  }
  // show toast
  private showToast(message: string, color: string) {
    this.toastCtrl
      .create({
        message,
        color,
        duration: 2000,
      })
      .then((toastEL) => toastEL.present());
  }

  // Get thông tin luật cảnh báo
  getDetailAlarm() {
    this.luatService
      .getDetailLuat(this.damTomId, this.alarmId)
      .subscribe((res) => {
        this.alarmDetail = res;
        let timeConfirm: number;
        if (
          this.alarmDetail.createRules.CRITICAL.condition.spec.type ===
          'DURATION'
        ) {
          if (
            this.alarmDetail.createRules.CRITICAL.condition.spec.unit ===
            'MINUTES'
          ) {
            timeConfirm =
              this.alarmDetail.createRules.CRITICAL.condition.spec.value * 60;
          }
          if (
            this.alarmDetail.createRules.CRITICAL.condition.spec.unit ===
            'SECONDS'
          ) {
            timeConfirm =
              this.alarmDetail.createRules.CRITICAL.condition.spec.value;
          }
          if (
            this.alarmDetail.createRules.CRITICAL.condition.spec.unit === 'HOURS'
          ) {
            timeConfirm =
              this.alarmDetail.createRules.CRITICAL.condition.spec.value * 3600;
          }
        }
        if (
          this.alarmDetail.createRules.CRITICAL.condition.spec.type === 'SIMPLE'
        ) {
          timeConfirm = 0;
        }
        const date = new Date();
        date.setHours(this.convertSecondToHours(timeConfirm));
        date.setMinutes(this.convertSecondToMinutes(timeConfirm));
        date.setSeconds(this.convertSecondToSeconds(timeConfirm));
        this.alarmDetail.createRules.CRITICAL.schedule.daysOfWeek.forEach(
          (el) => {
            this.scheduleDayOfWeek[el + ''] = true;
          }
        );
        // gan vao form
        this.editFormLCB.setValue({
          tenLCB: this.alarmDetail.alarmType,
          loaiDieukien: this.convertHienThiLoaiDK(
            this.alarmDetail.createRules.CRITICAL.condition.condition[0].key.key
          ),
          viaSMS: this.alarmDetail.dftAlarmRule.viaSms,
          viaNotification: this.alarmDetail.dftAlarmRule.viaNotification,
          viaEmail: this.alarmDetail.dftAlarmRule.viaEmail,
          nguongTren:
            this.alarmDetail.createRules.CRITICAL.condition.condition[0]
              .predicate.predicates.length === 2
              ? this.alarmDetail.createRules.CRITICAL.condition.condition[0]
                .predicate.predicates[0].value.defaultValue
              : this.alarmDetail.createRules.CRITICAL.condition.condition[0]
                .predicate.predicates[0].operation === 'GREATER_OR_EQUAL'
                ? this.alarmDetail.createRules.CRITICAL.condition.condition[0]
                  .predicate.predicates[0].value.defaultValue
                : '',
          nguongDuoi:
            this.alarmDetail.createRules.CRITICAL.condition.condition[0]
              .predicate.predicates.length === 2
              ? this.alarmDetail.createRules.CRITICAL.condition.condition[0]
                .predicate.predicates[1].value.defaultValue
              : this.alarmDetail.createRules.CRITICAL.condition.condition[0]
                .predicate.predicates[0].operation === 'LESS_OR_EQUAL'
                ? this.alarmDetail.createRules.CRITICAL.condition.condition[0]
                  .predicate.predicates[0].value.defaultValue
                : '',
          // thoiGianXacNhan:this.convertSecondtoTime(timeConfirm),
          thoiGianXacNhan: new Date(date).toISOString(),
          scheduleStart: this.millisToStr2(
            this.alarmDetail.createRules.CRITICAL.schedule.startsOn
          ),
          scheduleEnd: this.millisToStr2(
            this.alarmDetail.createRules.CRITICAL.schedule.endsOn
          ),
        });
      });
  }

  checkNotification() {
    if (
      this.editFormLCB.value.viaSMS === false &&
      this.editFormLCB.value.viaNotification === false &&
      this.editFormLCB.value.viaEmail === false
    ) {
      return true;
    }
  }

  // Sua luat
  onEditLuat() {
    const LUATDTO: LuatCBDto = {
      damtomId: this.damTomId,
      deviceProfileAlarm: {
        id: this.alarmDetail.id,
        alarmType: this.editFormLCB.get('tenLCB').value.trim(),
        createRules: {
          CRITICAL: {
            condition: {
              condition: null,
              spec: null,
            },
            schedule: null,
            alarmDetails: null,
          },
        },
        clearRule: {
          condition: {
            condition: null,
            spec: null,
          },
          schedule: null,
        },
        dftAlarmRule: {
          // active:true,
          active: this.alarmDetail.dftAlarmRule.active,
          gatewayIds: null,
          groupRpcIds: null,
          rpcAlarm: false,
          rpcSettingIds: null,
          viaEmail: this.editFormLCB.get('viaEmail').value,
          viaNotification: this.editFormLCB.get('viaNotification').value,
          viaSms: this.editFormLCB.get('viaSMS').value,
        },
        propagate: false,
        propagateRelationTypes: null,
      },
    };
    // Neu nhap ca hai nguong tren va duoi
    if (
      this.editFormLCB.get('nguongTren').value !== '' &&
      this.editFormLCB.get('nguongDuoi').value !== ''
    ) {
      LUATDTO.deviceProfileAlarm.createRules.CRITICAL.condition.condition = [
        {
          key: {
            type: 'TIME_SERIES',
            key: null,
          },
          valueType: 'NUMERIC',
          predicate: {
            operation: 'OR',
            predicates: [
              {
                operation: 'GREATER_OR_EQUAL',
                value: {
                  defaultValue: Number(
                    this.editFormLCB.get('nguongTren').value
                  ),
                  dynamicValue: null,
                },
                type: 'NUMERIC',
              },
              {
                operation: 'LESS_OR_EQUAL',
                value: {
                  defaultValue: Number(
                    this.editFormLCB.get('nguongDuoi').value
                  ),
                  dynamicValue: null,
                },
                type: 'NUMERIC',
              },
            ],
            type: 'COMPLEX',
          },
        },
      ];
      LUATDTO.deviceProfileAlarm.clearRule.condition.condition = [
        {
          key: {
            type: 'TIME_SERIES',
            key: null,
          },
          valueType: 'NUMERIC',
          predicate: {
            type: 'NUMERIC',
            operation: 'GREATER',
            value: {
              defaultValue: Number(this.editFormLCB.get('nguongDuoi').value),
            },
          },
        },
        {
          key: {
            type: 'TIME_SERIES',
            key: null,
          },
          valueType: 'NUMERIC',
          predicate: {
            operation: 'LESS',
            value: {
              defaultValue: Number(this.editFormLCB.get('nguongTren').value),
            },
            type: 'NUMERIC',
          },
        },
      ];
    }
    // Luat chi co nguong tren
    else if (this.editFormLCB.get('nguongTren').value !== '') {
      LUATDTO.deviceProfileAlarm.createRules.CRITICAL.condition.condition = [
        {
          key: {
            type: 'TIME_SERIES',
            key: null,
          },
          valueType: 'NUMERIC',
          predicate: {
            operation: 'OR',
            predicates: [
              {
                operation: 'GREATER_OR_EQUAL',
                value: {
                  defaultValue: Number(
                    this.editFormLCB.get('nguongTren').value
                  ),
                  dynamicValue: null,
                },
                type: 'NUMERIC',
              },
            ],
            type: 'COMPLEX',
          },
        },
      ];
      LUATDTO.deviceProfileAlarm.clearRule.condition.condition = [
        {
          key: {
            type: 'TIME_SERIES',
            key: null,
          },
          valueType: 'NUMERIC',
          predicate: {
            operation: 'LESS',
            value: {
              defaultValue: Number(this.editFormLCB.get('nguongTren').value),
            },
            type: 'NUMERIC',
          },
        },
      ];
    }
    // Truong hop chi nhap nugong duoi
    else if (this.editFormLCB.get('nguongDuoi').value !== '') {
      LUATDTO.deviceProfileAlarm.createRules.CRITICAL.condition.condition = [
        {
          key: {
            type: 'TIME_SERIES',
            key: null,
          },
          valueType: 'NUMERIC',
          predicate: {
            operation: 'OR',
            predicates: [
              {
                operation: 'LESS_OR_EQUAL',
                value: {
                  defaultValue: Number(
                    this.editFormLCB.get('nguongDuoi').value
                  ),
                  dynamicValue: null,
                },
                type: 'NUMERIC',
              },
            ],
            type: 'COMPLEX',
          },
        },
      ];
      LUATDTO.deviceProfileAlarm.clearRule.condition.condition = [
        {
          key: {
            type: 'TIME_SERIES',
            key: null,
          },
          valueType: 'NUMERIC',
          predicate: {
            type: 'NUMERIC',
            operation: 'GREATER',
            value: {
              defaultValue: Number(this.editFormLCB.get('nguongDuoi').value),
            },
          },
        },
      ];
    }

    // Truong hop co thoi gian
    const thoigianCf = this.convertTimeToSc(
      this.editFormLCB.get('thoiGianXacNhan').value
    );
    // truong hop khong thoi gian
    if (thoigianCf <= 0 || thoigianCf === undefined) {
      LUATDTO.deviceProfileAlarm.createRules.CRITICAL.condition.spec = {
        type: 'SIMPLE',
      };
      LUATDTO.deviceProfileAlarm.clearRule.condition.spec = {
        type: 'SIMPLE',
      };
    }
    if (thoigianCf > 0) {
      LUATDTO.deviceProfileAlarm.createRules.CRITICAL.condition.spec = {
        type: 'DURATION',
        unit: 'SECONDS',
        value: thoigianCf,
      };
      LUATDTO.deviceProfileAlarm.clearRule.condition.spec = {
        type: 'DURATION',
        unit: 'SECONDS',
        value: thoigianCf,
      };
    }

    // Lich canh bao theo time
    const activeDays = [];
    Object.keys(this.scheduleDayOfWeek).forEach((key) => {
      if (this.scheduleDayOfWeek[key]) {
        // tslint:disable-next-line: radix
        activeDays.push(parseInt(key));
      }
    });
    if (activeDays.length > 0) {
      LUATDTO.deviceProfileAlarm.createRules.CRITICAL.schedule = {
        type: 'SPECIFIC_TIME',
        timezone: 'Asia/Bangkok',
        daysOfWeek: activeDays,
        startsOn: this.toMillis(this.editFormLCB.get('scheduleStart').value),
        endsOn: this.toMillis(this.editFormLCB.get('scheduleEnd').value),
      };
      LUATDTO.deviceProfileAlarm.clearRule.schedule = {
        type: 'SPECIFIC_TIME',
        timezone: 'Asia/Bangkok',
        daysOfWeek: activeDays,
        startsOn: this.toMillis(this.editFormLCB.get('scheduleStart').value),
        endsOn: this.toMillis(this.editFormLCB.get('scheduleEnd').value),
      };
    }
    this.loadingCtrl.create({ message: '' }).then((loadEl) => {
      loadEl.present();

      // Gộp nhiều observable
      const requestList: Observable<any>[] = [];
      const tenLuat = LUATDTO.deviceProfileAlarm.alarmType;
      // Trường hợp có cả hai ngưỡng
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 2){
        this.lstAllDvice[this.getTbKeyByTelemetryKey(this.alarmDetail.createRules.CRITICAL.condition.condition[0]
          .key.key)].forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[1].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType = tenLuat + `_RULE_PART${index + 1}`;
          requestList.push(this.luatService.updateLuatCb(luatDToTemp, this.oldAlarmType + `_RULE_PART${index + 1}`));
        });
      }
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 1){
        this.lstAllDvice[this.getTbKeyByTelemetryKey(this.alarmDetail.createRules.CRITICAL.condition.condition[0]
          .key.key)].forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType = tenLuat + `_RULE_PART${index + 1}`;
          requestList.push(this.luatService.updateLuatCb(luatDToTemp, this.oldAlarmType + `_RULE_PART${index + 1}`));
        });
      }
      forkJoin(requestList).subscribe(() => {
          this.showToast('Cập nhật thành công', 'success');
          this.editFormLCB.markAsPristine();
          // this.navCtrl.back();
          this.router.navigate(['home/giam-sat/danh-sach-canh-bao/thiet-lap-luat-canh-bao'], {
            queryParams: { damTomGsId: this.damTomId },
          });
        },
        error => {
          if (error.status === 400 && error.error.message === DAMTOM_DOES_NOT_EXIST) {
            this.showToast('Nhà vườn không tồn tại!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_CANNOT_BE_NULL) {
            this.showToast('Tên luật cảnh báo không được bỏ trống!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_ALREADY_EXIST) {
            this.statusExistTen = true;
          } else {
            this.showToast('Lỗi không xác định!', 'danger');
          }
          loadEl.dismiss().finally(() => {
            this.gotoTop.scrollToTop(0);
          });
        },
        () => {
          loadEl.dismiss();
        }
      );
    });
  }

  // Xoa luat
  onDelete() {
    this.alertController
      .create({
        // cssClass: 'my-alert-class',
        message: escapedHTML(
          `Xóa luật cảnh báo "${this.alarmDetail.alarmType}"?`
        ),
        cssClass: 'my-alert-custom-class',
        buttons: [
          {
            text: 'Quay lại',
            role: 'cancel',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              this.luatService
                .deleteLuatCB(this.damTomId, this.alarmDetail.id)
                .subscribe(
                  (res) => {
                    this.showToast('Xóa luật cảnh báo thành công', 'success');
                    this.editFormLCB.markAsPristine();
                    this.router.navigate(['home/giam-sat/danh-sach-canh-bao/thiet-lap-luat-canh-bao'], {
                      queryParams: { damTomGsId: this.damTomId },
                    });
                  },
                  (err) => {
                    this.showToast('Lỗi không xác định', 'danger');
                  }
                );
            },
          },
        ],
      })
      .then((alertEL) => {
        alertEL.present();
      });
  }

  // Lay loai cam bien từ key
  getTbKeyByTelemetryKey(key: string) {
    const device = this.listAllSensorNotType.find(data => data.telemetryType[0] === key);
    return device.tbKey;
  }
  // chuyen thoi gian chon sang giay
  convertTimeToSc(time): number {
    let hour = new Date(time).getHours();
    const minutes = new Date(time).getMinutes();
    const second = new Date(time).getSeconds();
    if (time === 0) {
      hour = 0;
    }
    const timeResult = hour * 60 * 60 + minutes * 60 + second;
    return timeResult;
  }
  convertSecondToHours(secs) {
    return (secs - (secs % 3600)) / 3600;
  }
  convertSecondToMinutes(secs) {
    return ((secs % 3600) - ((secs % 3600) % 60)) / 60;
  }
  convertSecondToSeconds(secs) {
    return (secs % 3600) % 60;
  }
  convertHienThiLoaiDK(loaiDk: string) {
    const keySensor = this.listAllSensorNotType.find(e => {
      return e.telemetryType.indexOf(loaiDk) >= 0;
    }).tbKey;
    switch (keySensor) {
      case 'Temperature':
        return 'Nhiệt độ';
      case 'Humidity':
        return 'Độ ẩm';
      case 'Lux':
        return 'Ánh sáng';
      default:
        break;
    }
  }

  // checkSoThapPhanSauDauPhay(inputNumber) {
  //   let numberSplArr = inputNumber?.toString().trim().split(".");
  //   if (numberSplArr?.length > 1) {
  //     if (numberSplArr[1]?.length > 1) return true;
  //     else return false;
  //   } else {
  //     return false;
  //   }
  // }

  checkButtonDisable() {
    // tslint:disable-next-line: max-line-length
    if (!this.editFormLCB.dirty || this.checkKhoangDuLieu() || this.checkBatBuocHaiNguong() || this.checkDinhDang() || this.isTrenNhoHonDuoi()
      || !this.editFormLCB.get('tenLCB').valid || this.editFormLCB.get('tenLCB').value.trim().length > 255) {
      return true;
    } else if (this.statusExistTen) {
      return true;
    }
    else {
      return false;
    }
  }

  checkKhoangDuLieu() {
    if (
      this.editFormLCB.get('loaiDieukien').value === 'Độ ẩm' &&
      (this.editFormLCB.get('nguongTren').value < 0 ||
        this.editFormLCB.get('nguongTren').value > 100 ||
        this.editFormLCB.get('nguongDuoi').value < 0 ||
        this.editFormLCB.get('nguongDuoi').value > 100)
    ) {
      return true;
    } else if (
      this.editFormLCB.get('loaiDieukien').value === 'Ánh sáng' &&
      (this.editFormLCB.get('nguongTren').value < 0 ||
        this.editFormLCB.get('nguongTren').value > 100000 ||
        this.editFormLCB.get('nguongDuoi').value < 0 ||
        this.editFormLCB.get('nguongDuoi').value > 100000)
    ) {
      return true;
    } else if (
      this.editFormLCB.get('loaiDieukien').value === 'Nhiệt độ' &&
      (this.editFormLCB.get('nguongTren').value < 0 ||
        this.editFormLCB.get('nguongTren').value > 100 ||
        this.editFormLCB.get('nguongDuoi').value < 0 ||
        this.editFormLCB.get('nguongDuoi').value > 100)
    ) {
      return true;
    }
  }
  checkBatBuocHaiNguong() {
    return (
      this.editFormLCB.get('nguongTren').value.toString().trim().length === 0 &&
      this.editFormLCB.get('nguongDuoi').value.toString().trim().length === 0
    );
  }
  isTrenNhoHonDuoi() {
    if (
      this.editFormLCB.get('nguongTren')?.dirty &&
      this.editFormLCB.get('nguongTren')?.dirty && (
        Number(this.editFormLCB.get('nguongTren').value.toString().replace(',', '.')) <
        Number(this.editFormLCB.get('nguongDuoi')?.value.toString().replace(',', '.')) &&
        this.editFormLCB.get('nguongTren')?.value.toString().trim().length > 0
      )
    ) {
      return true;
    } else if (this.editFormLCB.get('nguongTren').dirty && (
      Number(this.editFormLCB.get('nguongTren')?.value.toString().replace(',', '.')) <
      Number(this.editFormLCB.get('nguongDuoi')?.value) &&
      this.editFormLCB.get('nguongTren')?.value.toString().trim().length > 0
    )) {
      return true;
    } else if (this.editFormLCB.get('nguongDuoi')?.dirty && (
      Number(this.editFormLCB.get('nguongTren')?.value) <
      Number(this.editFormLCB.get('nguongDuoi')?.value.toString().replace(',', '.')) &&
      this.editFormLCB.get('nguongTren')?.value.toString().trim().length > 0
    )) {
      return true;
    } else {
      return false;
    }
  }

  checkDinhDang() {
    if (this.editFormLCB.get('nguongDuoi').hasError('pattern') || this.editFormLCB.get('nguongTren').hasError('pattern')) {
      return true;
    }
    else {
      return false;
    }
  }
  convertNguongTren(event) {
    if (
      this.editFormLCB.get('nguongTren').dirty &&
      this.editFormLCB.get('nguongTren').value.toString().trim().length > 0
    ) {
      this.editFormLCB
        .get('nguongTren')
        .setValue(
          Number(
            this.editFormLCB.get('nguongTren').value.replace(',', '.')
          ).toFixed(1)
        );
    }
  }
  convertNguongDuoi(event) {
    if (
      this.editFormLCB.get('nguongDuoi').dirty &&
      this.editFormLCB.get('nguongDuoi').value.toString().trim().length > 0
    ) {
      this.editFormLCB
        .get('nguongDuoi')
        .setValue(
          Number(
            this.editFormLCB.get('nguongDuoi').value.replace(',', '.')
          ).toFixed(1)
        );
    }
  }

  checkValidVaoCacNgay() {
    return (
      this.scheduleDayOfWeek[1] === false &&
      this.scheduleDayOfWeek[2] === false &&
      this.scheduleDayOfWeek[3] === false &&
      this.scheduleDayOfWeek[4] === false &&
      this.scheduleDayOfWeek[5] === false &&
      this.scheduleDayOfWeek[6] === false &&
      this.scheduleDayOfWeek[7] === false
    );
  }
  toggleDayOfWeek(value) {
    this.scheduleDayOfWeek[value] = !this.scheduleDayOfWeek[value];
    this.editFormLCB.markAsDirty();
  }
  toMillis(str: string): number {
    if (!str) {
      return 0;
    }
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
  pad(num, size) {
    num = num.toString();
    while (num.length < size) { num = '0' + num; }
    return num;
  }
  millisToStr2(ms: number) {
    let seconds = ms / 1000;
    // tslint:disable-next-line: radix
    const hours = parseInt(seconds / 3600 + '');
    seconds = seconds % 3600;
    // tslint:disable-next-line: radix
    const minutes = parseInt(seconds / 60 + '');
    seconds = seconds % 60;
    return `${this.pad(hours, 2)}:${this.pad(minutes, 2)}`;
  }

  changeNameLuat(){
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
}
