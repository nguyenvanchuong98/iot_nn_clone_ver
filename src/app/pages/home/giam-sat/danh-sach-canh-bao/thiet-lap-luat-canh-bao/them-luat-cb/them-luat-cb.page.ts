import { DieuKhienService } from './../../../../../../core/services/dieu-khien.service';
import { LuatCanhBaoService } from './../../../../../../core/services/luat-canh-bao.service';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
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
import {
  AllDevice,
  DeviceProfileWithTime,
  LuatCBDto,
} from 'src/app/shared/models/luatcanhbao.model';
import { forkJoin, Observable } from 'rxjs';
import { deepClone } from 'src/app/core/utils';

const DAMTOM_DOES_NOT_EXIST = 'Damtom does not exist';
const ALARM_RULE_NAME_ALREADY_EXIST = 'Alarm rule name already exist';
const ALARM_RULE_NAME_CANNOT_BE_NULL = 'Alarm rule name can not be null';

@Component({
  selector: 'app-them-luat-cb',
  templateUrl: './them-luat-cb.page.html',
  styleUrls: ['./them-luat-cb.page.scss'],
})
export class ThemLuatCbPage implements OnInit {
  damTomId: string;
  formLuat: FormGroup;
  tenDamTom: string;
  segment = 0;
  isLoading = false;
  isExistNameLuat = false;
  lstLuatOfDam: DeviceProfileWithTime[] = [];
  lstAllDvice: AllDevice;
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

  ngOnInit() {
    this.route.queryParams.subscribe((data) => {
    this.damTomId = data.damtomid;
    });
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    this.initFormData(date);
    this.getAllSensorDevice();
    this.scheduleDayOfWeek = {
      1: true,
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
      7: true,
    };
  }
  initFormData(date) {
    this.formLuat = this.fb.group({
      loaiDieukien: 'Temperature',
      tenLCB: ['', { validators: [Validators.required] }],
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
      thoiGianXacNhan: new Date(date).toISOString(),
      scheduleStart: ['00:00'],
      scheduleEnd: ['23:59']
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
  // Lấy danh sách cảm biến
  getAllSensorDevice(){
    this.luatService.getAllDevice(this.damTomId).subscribe(res => {
      this.lstAllDvice = res;
    });
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
  isTrenNhoHon() {
    return (
      Number(this.formLuat.get('nguongTren').value.replace(',', '.')) <
        Number(
          this.formLuat.get('nguongDuoi').value.replace(',', '.')
        ) &&
      this.formLuat.get('nguongTren').value.toString().trim().length > 0
    );
  }
  convertNguongTren(event) {
    if (
      this.formLuat.get('nguongTren').value.toString().trim().length > 0
    ) {
      this.formLuat
        .get('nguongTren')
        .setValue(
          Number(
            this.formLuat.get('nguongTren').value.replace(',', '.')
          ).toFixed(1)
        );
    }
  }
  convertNguongDuoi(event) {
    if (
      this.formLuat.get('nguongDuoi').value.toString().trim().length > 0
    ) {
      this.formLuat
        .get('nguongDuoi')
        .setValue(
          Number(
            this.formLuat.get('nguongDuoi').value.replace(',', '.')
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
  checkValidForm(){
    if (!this.formLuat.dirty) {
      return true;
    } else if (
      this.formLuat.value.tenLCB.trim() === '' ||
      this.formLuat.value.tenLCB.trim().length > 255
    ) {
      return true;
    } else if (
      this.formLuat.get('nguongTren').value === '' &&
      this.formLuat.get('nguongDuoi').value === ''
    ) {
      return true;
    } else if (
      this.formLuat.get('nguongTren').hasError('pattern') ||
      this.formLuat.get('nguongDuoi').hasError('pattern')
    ) {
      return true;
    } else if (
      (this.formLuat.get('nguongTren').value < 0 ||
      this.formLuat.get('nguongTren').value > 100 ||
      this.formLuat.get('nguongDuoi').value < 0 ||
      this.formLuat.get('nguongDuoi').value > 100)
      && (this.formLuat.get('loaiDieukien').value === 'Temperature' ||
      this.formLuat.get('loaiDieukien').value === 'Humidity')
    ) {
      return true;
    } else if (
      (this.formLuat.get('nguongTren').value < 0 ||
      this.formLuat.get('nguongTren').value > 100000 ||
      this.formLuat.get('nguongDuoi').value < 0 ||
      this.formLuat.get('nguongDuoi').value > 100000)
      && this.formLuat.get('loaiDieukien').value === 'Lux'
    ) {
      return true;
    } else if (this.isTrenNhoHon()) {
      return true;
    } else if (this.checkValidVaoCacNgay()) {
      return true;
    } else if (this.isExistNameLuat) {
      return true;
    } else {
      return false;
    }
  }
  toggleDayOfWeek(value) {
    this.scheduleDayOfWeek[value] =
      !this.scheduleDayOfWeek[value];
    this.formLuat.markAsDirty();
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
  convertSegmentToLabel(){
    const dkSensor = this.formLuat.get('loaiDieukien').value;
    switch (dkSensor) {
      case 'Temperature':
        return ['Nhiệt độ(°C) ≥', 'hoặc nhiệt độ(°C) ≤'];
      case 'Humidity':
        return ['Độ ẩm(%) ≥', 'hoặc độ ẩm(%) ≤'];
      case 'Lux':
        return ['Ánh sáng(lux) ≥', 'hoặc ánh sáng(lux) ≤'];
      default:
        break;
    }
  }
  changeNameLuat(){
    this.isExistNameLuat = false;
  }
  segmentChanged(event) {
    this.formLuat.get('nguongTren').markAsUntouched();
    this.formLuat.get('nguongDuoi').markAsUntouched();
    this.formLuat.get('nguongTren').setValue('');
    this.formLuat.get('nguongDuoi').setValue('');
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

  // Create luat
  onCreateLuat() {
    this.loadingCtrl.create({ message: '' }).then((loadEl) => {
      loadEl.present();
      if (this.lstAllDvice[this.formLuat.get('loaiDieukien').value].length === 0){
        this.showToast('Cảm biến không tồn tại!', 'danger');
        loadEl.dismiss();
        return;
      }
      const LUATDTO: LuatCBDto = {
        damtomId: this.damTomId,
        deviceProfileAlarm: {
          alarmType: this.formLuat.get('tenLCB').value.trim(),
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
            active: true,
            gatewayIds: null,
            groupRpcIds: null,
            rpcAlarm: false,
            rpcSettingIds: null,
            viaEmail: this.formLuat.get('viaEmail').value,
            viaNotification: this.formLuat.get('viaNotification').value,
            viaSms: this.formLuat.get('viaSMS').value,
          },
          propagate: false,
          propagateRelationTypes: null,
        },
      };
      if (
        this.formLuat.get('nguongTren').value !== '' &&
        this.formLuat.get('nguongDuoi').value !== ''
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
                      this.formLuat.get('nguongTren').value
                    ),
                    dynamicValue: null,
                  },
                  type: 'NUMERIC',
                },
                {
                  operation: 'LESS_OR_EQUAL',
                  value: {
                    defaultValue: Number(
                      this.formLuat.get('nguongDuoi').value
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
                defaultValue: Number(
                  this.formLuat.get('nguongTren').value
                ),
              },
              type: 'NUMERIC',
            },
          },
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
                defaultValue: Number(
                  this.formLuat.get('nguongDuoi').value
                ),
              },
            },
          },
        ];
      }
      // Luat chi co nguong tren
      else if (this.formLuat.get('nguongTren').value !== '') {
        LUATDTO.deviceProfileAlarm.createRules.CRITICAL.condition.condition = [
          {
            key: {
              type: 'TIME_SERIES',
              key: null,
            },
            valueType: 'NUMERIC',
            predicate: {
              type: 'COMPLEX',
              operation: 'OR',
              predicates: [
                {
                  type: 'NUMERIC',
                  operation: 'GREATER_OR_EQUAL',
                  value: {
                    defaultValue: Number(
                      this.formLuat.get('nguongTren').value
                    ),
                    dynamicValue: null,
                  },
                },
              ],
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
                defaultValue: Number(
                  this.formLuat.get('nguongTren').value
                ),
              },
              type: 'NUMERIC',
            },
          },
        ];
      }
      // Truong hop chi nhap nugong duoi
      else if (this.formLuat.get('nguongDuoi').value !== '') {
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
                      this.formLuat.get('nguongDuoi').value
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
                defaultValue: Number(
                  this.formLuat.get('nguongDuoi').value
                ),
              },
            },
          },
        ];
      }

      // Truong hop co thoi gian
      const thoigianCf = this.convertTimeToSc(
        this.formLuat.get('thoiGianXacNhan').value
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
          startsOn: this.toMillis(
            this.formLuat.get('scheduleStart').value
          ),
          endsOn: this.toMillis(this.formLuat.get('scheduleEnd').value),
        };
        LUATDTO.deviceProfileAlarm.clearRule.schedule = {
          type: 'SPECIFIC_TIME',
          timezone: 'Asia/Bangkok',
          daysOfWeek: activeDays,
          startsOn: this.toMillis(
            this.formLuat.get('scheduleStart').value
          ),
          endsOn: this.toMillis(this.formLuat.get('scheduleEnd').value),
        };
      }
      // Gộp nhiều observable
      const requestList: Observable<any>[] = [];
      const tenLuat = LUATDTO.deviceProfileAlarm.alarmType;
      // Trường hợp có cả hai ngưỡng
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 2){
        this.lstAllDvice[this.formLuat.get('loaiDieukien').value].forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[1].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType =  tenLuat + `_RULE_PART${index + 1}`;
          requestList.push(this.luatService.createLuatCb(luatDToTemp));
        });
      }
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 1){
        this.lstAllDvice[this.formLuat.get('loaiDieukien').value].forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType =  tenLuat + '_RULE_PART' + (index + 1);
          requestList.push(this.luatService.createLuatCb(luatDToTemp));
        });
      }
      forkJoin(requestList).subscribe(() => {
        this.showToast(`Thêm mới thành công`, 'success');
        this.formLuat.reset();
        this.router.navigate(['home/giam-sat/danh-sach-canh-bao/thiet-lap-luat-canh-bao'], {queryParams: { damTomGsId: this.damTomId }});
        },
        error => {
          if (error.status === 400 && error.error.message === DAMTOM_DOES_NOT_EXIST) {
            this.showToast('Nhà vườn không tồn tại!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_CANNOT_BE_NULL) {
            this.showToast('Tên luật cảnh báo không được bỏ trống!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_ALREADY_EXIST) {
            this.isExistNameLuat = true;
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
}
