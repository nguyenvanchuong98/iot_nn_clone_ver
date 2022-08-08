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
  selector: 'app-them-moi-luat-canh-bao',
  templateUrl: './them-moi-luat-canh-bao.page.html',
  styleUrls: ['./them-moi-luat-canh-bao.page.scss'],
})
export class ThemMoiLuatCanhBaoPage implements OnInit {
  damTomId: string;
  createForm: FormGroup;
  formTemperature: FormGroup;
  formHumidity: FormGroup;
  formLux: FormGroup;
  // formTemperature:FormGroup;
  tenDamTom: string;
  segment = 0;
  isLoading = false;
  isExistNameLuatND = false;
  isExistNameLuatDA = false;
  isExistNameLuatAS = false;
  lstLuatOfDam: DeviceProfileWithTime[] = [];
  lstAllDvice: AllDevice;
  scheduleDayOfWeekTemperature = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  };
  scheduleDayOfWeekHumidity = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  };
  scheduleDayOfWeekLux = {
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
  // Khởi tạo form mặc định
  initFormData(date) {
    this.createForm = this.fb.group({
      loaiDieukien: 0,
    });
    this.formTemperature = this.fb.group({
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
      scheduleEnd: ['23:59'],
    });
    this.formHumidity = this.fb.group({
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
      scheduleEnd: ['23:59'],
    });
    this.formLux = this.fb.group({
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
      scheduleEnd: ['23:59'],
    });
  }

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
    ) {}
  ngOnInit() {
    this.route.queryParams.subscribe((data) => {
      this.damTomId = data.damtomid;
    });
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    this.initFormData(date);
    this.getTenDamTom();
    this.getAllSensorDevice();
    this.getLuatCanhBaoByDamTomID(this.damTomId);
    this.scheduleDayOfWeekTemperature = {
      1: true,
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
      7: true,
    };
    this.scheduleDayOfWeekHumidity = {
      1: true,
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
      7: true,
    };
    this.scheduleDayOfWeekLux = {
      1: true,
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
      7: true,
    };
  }
  ionViewWillEnter() {
    this.isLoading = true;
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
  // Lấy thông tin đầm tôm
  getTenDamTom() {
    this.giamsatService.getDamtomById(this.damTomId).subscribe(
      (res) => {
        this.tenDamTom = res.name;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  // Lấy danh sách cảm biến
  getAllSensorDevice(){
    this.luatService.getAllDevice(this.damTomId).subscribe(res => {
      this.lstAllDvice = res;
    });
  }

  doRefresh(event) {
    setTimeout(() => {
      this.ngOnInit();
      event.target.complete();
    }, 1000);
  }

  async segmentChanged(event: any) {
    this.slider.slideTo(event.detail.value);
    // this.createForm.markAsPristine();
  }

  async slideChanged() {
    this.segment = await this.slider.getActiveIndex();
    this.createForm.get('loaiDieukien').setValue(this.segment);
    // this.createForm.markAsPristine();
  }
  // Create luat nhiet do
  onCreateLuatNhietDo() {
    this.loadingCtrl.create({ message: '' }).then((loadEl) => {
      loadEl.present();
      if (this.lstAllDvice.Temperature.length === 0){
        this.showToast('Cảm biến không tồn tại!', 'danger');
        loadEl.dismiss();
        return;
      }
      const LUATDTO: LuatCBDto = {
        damtomId: this.damTomId,
        deviceProfileAlarm: {
          alarmType: this.formTemperature.get('tenLCB').value.trim(),
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
            viaEmail: this.formTemperature.get('viaEmail').value,
            viaNotification: this.formTemperature.get('viaNotification').value,
            viaSms: this.formTemperature.get('viaSMS').value,
          },
          propagate: false,
          propagateRelationTypes: null,
        },
      };
      if (
        this.formTemperature.get('nguongTren').value !== '' &&
        this.formTemperature.get('nguongDuoi').value !== ''
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
                      this.formTemperature.get('nguongTren').value
                    ),
                    dynamicValue: null,
                  },
                  type: 'NUMERIC',
                },
                {
                  operation: 'LESS_OR_EQUAL',
                  value: {
                    defaultValue: Number(
                      this.formTemperature.get('nguongDuoi').value
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
                  this.formTemperature.get('nguongTren').value
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
                  this.formTemperature.get('nguongDuoi').value
                ),
              },
            },
          },
        ];
      }
      // Luat chi co nguong tren
      else if (this.formTemperature.get('nguongTren').value !== '') {
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
                      this.formTemperature.get('nguongTren').value
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
                  this.formTemperature.get('nguongTren').value
                ),
              },
              type: 'NUMERIC',
            },
          },
        ];
      }
      // Truong hop chi nhap nugong duoi
      else if (this.formTemperature.get('nguongDuoi').value !== '') {
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
                      this.formTemperature.get('nguongDuoi').value
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
                  this.formTemperature.get('nguongDuoi').value
                ),
              },
            },
          },
        ];
      }

      // Truong hop co thoi gian
      const thoigianCf = this.convertTimeToSc(
        this.formTemperature.get('thoiGianXacNhan').value
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
      Object.keys(this.scheduleDayOfWeekTemperature).forEach((key) => {
        if (this.scheduleDayOfWeekTemperature[key]) {
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
            this.formTemperature.get('scheduleStart').value
          ),
          endsOn: this.toMillis(this.formTemperature.get('scheduleEnd').value),
        };
        LUATDTO.deviceProfileAlarm.clearRule.schedule = {
          type: 'SPECIFIC_TIME',
          timezone: 'Asia/Bangkok',
          daysOfWeek: activeDays,
          startsOn: this.toMillis(
            this.formTemperature.get('scheduleStart').value
          ),
          endsOn: this.toMillis(this.formTemperature.get('scheduleEnd').value),
        };
      }
      // Gộp nhiều observable
      const requestList: Observable<any>[] = [];
      const tenLuat = LUATDTO.deviceProfileAlarm.alarmType;
      // Trường hợp có cả hai ngưỡng
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 2){
        this.lstAllDvice.Temperature.forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[1].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType =  tenLuat + `_RULE_PART${index + 1}`;
          requestList.push(this.luatService.createLuatCb(luatDToTemp));
        });
      }
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 1){
        this.lstAllDvice.Temperature.forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType =  tenLuat + '_RULE_PART' + (index + 1);
          requestList.push(this.luatService.createLuatCb(luatDToTemp));
        });
      }
      forkJoin(requestList).subscribe(() => {
        this.showToast(`Thêm mới thành công`, 'success');
        this.createForm.reset();
        this.formHumidity.reset();
        this.formLux.reset();
        this.formTemperature.reset();
        this.router.navigate(['home/giam-sat/danh-sach-canh-bao/thiet-lap-luat-canh-bao'], {queryParams: { damTomGsId: this.damTomId }});
        },
        error => {
          if (error.status === 400 && error.error.message === DAMTOM_DOES_NOT_EXIST) {
            this.showToast('Nhà vườn không tồn tại!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_CANNOT_BE_NULL) {
            this.showToast('Tên luật cảnh báo không được bỏ trống!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_ALREADY_EXIST) {
            this.isExistNameLuatND = true;
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
  // Create luat do am
  onCreateLuatDoAm() {
    this.loadingCtrl.create({ message: '' }).then((loadEl) => {
      loadEl.present();
      if (this.lstAllDvice.Humidity.length === 0){
        this.showToast('Cảm biến không có trong hệ thống', 'danger');
        loadEl.dismiss();
        return;
      }
      const LUATDTO: LuatCBDto = {
        damtomId: this.damTomId,
        deviceProfileAlarm: {
          alarmType: this.formHumidity.get('tenLCB').value.trim(),
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
            viaEmail: this.formHumidity.get('viaEmail').value,
            viaNotification: this.formHumidity.get('viaNotification').value,
            viaSms: this.formHumidity.get('viaSMS').value,
          },
          propagate: false,
          propagateRelationTypes: null,
        },
      };
      // Neu nhap ca hai nguong tren va duoi
      if (
        this.formHumidity.get('nguongTren').value !== '' &&
        this.formHumidity.get('nguongDuoi').value !== ''
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
                      this.formHumidity.get('nguongTren').value
                    ),
                    dynamicValue: null,
                  },
                  type: 'NUMERIC',
                },
                {
                  operation: 'LESS_OR_EQUAL',
                  value: {
                    defaultValue: Number(
                      this.formHumidity.get('nguongDuoi').value
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
                defaultValue: Number(this.formHumidity.get('nguongTren').value),
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
                defaultValue: Number(this.formHumidity.get('nguongDuoi').value),
              },
            },
          },
        ];
      }
      // Luat chi co nguong tren
      else if (this.formHumidity.get('nguongTren').value !== '') {
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
                      this.formHumidity.get('nguongTren').value
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
                defaultValue: Number(this.formHumidity.get('nguongTren').value),
              },
              type: 'NUMERIC',
            },
          },
        ];
      }
      // Truong hop chi nhap nugong duoi
      else if (this.formHumidity.get('nguongDuoi').value !== '') {
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
                      this.formHumidity.get('nguongDuoi').value
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
                defaultValue: Number(this.formHumidity.get('nguongDuoi').value),
              },
            },
          },
        ];
      }

      // Truong hop co thoi gian
      const thoigianCf = this.convertTimeToSc(
        this.formHumidity.get('thoiGianXacNhan').value
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
      Object.keys(this.scheduleDayOfWeekHumidity).forEach((key) => {
        if (this.scheduleDayOfWeekHumidity[key]) {
          // tslint:disable-next-line: radix
          activeDays.push(parseInt(key));
        }
      });
      if (activeDays.length > 0) {
        LUATDTO.deviceProfileAlarm.createRules.CRITICAL.schedule = {
          type: 'SPECIFIC_TIME',
          timezone: 'Asia/Bangkok',
          daysOfWeek: activeDays,
          startsOn: this.toMillis(this.formHumidity.get('scheduleStart').value),
          endsOn: this.toMillis(this.formHumidity.get('scheduleEnd').value),
        };
        LUATDTO.deviceProfileAlarm.clearRule.schedule = {
          type: 'SPECIFIC_TIME',
          timezone: 'Asia/Bangkok',
          daysOfWeek: activeDays,
          startsOn: this.toMillis(this.formHumidity.get('scheduleStart').value),
          endsOn: this.toMillis(this.formHumidity.get('scheduleEnd').value),
        };
      }
      // Gộp nhiều observable
      const requestList: Observable<any>[] = [];
      const tenLuat = LUATDTO.deviceProfileAlarm.alarmType;
      // Trường hợp có cả hai ngưỡng
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 2){
        this.lstAllDvice.Humidity.forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[1].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType = tenLuat + `_RULE_PART${index + 1}`;
          requestList.push(this.luatService.createLuatCb(luatDToTemp));
        });
      }
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 1){
        this.lstAllDvice.Humidity.forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType = tenLuat + `_RULE_PART${index + 1}`;
          requestList.push(this.luatService.createLuatCb(luatDToTemp));
        });
      }
      forkJoin(requestList).subscribe(() => {
        this.showToast(`Thêm mới thành công`, 'success');
        this.createForm.reset();
        this.formHumidity.reset();
        this.formLux.reset();
        this.formTemperature.reset();
        this.router.navigate(['home/giam-sat/danh-sach-canh-bao/thiet-lap-luat-canh-bao'], {queryParams: { damTomGsId: this.damTomId }});
        },
        error => {
          if (error.status === 400 && error.error.message === DAMTOM_DOES_NOT_EXIST) {
            this.showToast('Nhà vườn không tồn tại!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_CANNOT_BE_NULL) {
            this.showToast('Tên luật cảnh báo không được bỏ trống!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_ALREADY_EXIST) {
            this.isExistNameLuatDA = true;
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
  // Create luat anh sang
  onCreateLuatAnhSang() {
    this.loadingCtrl.create({ message: '' }).then((loadEl) => {
      loadEl.present();
      if (this.lstAllDvice.Lux.length === 0){
        this.showToast('Cảm biến không tồn tại!', 'danger');
        loadEl.dismiss();
        return;
      }
      const LUATDTO: LuatCBDto = {
        damtomId: this.damTomId,
        deviceProfileAlarm: {
          alarmType: this.formLux.get('tenLCB').value.trim(),
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
            viaEmail: this.formLux.get('viaEmail').value,
            viaNotification: this.formLux.get('viaNotification').value,
            viaSms: this.formLux.get('viaSMS').value,
          },
          propagate: false,
          propagateRelationTypes: null,
        },
      };
      // Neu nhap ca hai nguong tren va duoi
      if (
        this.formLux.get('nguongTren').value !== '' &&
        this.formLux.get('nguongDuoi').value !== ''
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
                    defaultValue: Number(this.formLux.get('nguongTren').value),
                    dynamicValue: null,
                  },
                  type: 'NUMERIC',
                },
                {
                  operation: 'LESS_OR_EQUAL',
                  value: {
                    defaultValue: Number(this.formLux.get('nguongDuoi').value),
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
                defaultValue: Number(this.formLux.get('nguongTren').value),
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
                defaultValue: Number(this.formLux.get('nguongDuoi').value),
              },
            },
          },
        ];
      }
      // Luat chi co nguong tren
      else if (this.formLux.get('nguongTren').value !== '') {
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
                    defaultValue: Number(this.formLux.get('nguongTren').value),
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
                defaultValue: Number(this.formLux.get('nguongTren').value),
              },
              type: 'NUMERIC',
            },
          },
        ];
      }
      // Truong hop chi nhap nugong duoi
      else if (this.formLux.get('nguongDuoi').value !== '') {
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
                    defaultValue: Number(this.formLux.get('nguongDuoi').value),
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
                defaultValue: Number(this.formLux.get('nguongDuoi').value),
              },
            },
          },
        ];
      }
      // Truong hop co thoi gian
      const thoigianCf = this.convertTimeToSc(
        this.formLux.get('thoiGianXacNhan').value
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
      Object.keys(this.scheduleDayOfWeekLux).forEach((key) => {
        if (this.scheduleDayOfWeekLux[key]) {
          // tslint:disable-next-line: radix
          activeDays.push(parseInt(key));
        }
      });
      if (activeDays.length > 0) {
        LUATDTO.deviceProfileAlarm.createRules.CRITICAL.schedule = {
          type: 'SPECIFIC_TIME',
          timezone: 'Asia/Bangkok',
          daysOfWeek: activeDays,
          startsOn: this.toMillis(this.formLux.get('scheduleStart').value),
          endsOn: this.toMillis(this.formLux.get('scheduleEnd').value),
        };
        LUATDTO.deviceProfileAlarm.clearRule.schedule = {
          type: 'SPECIFIC_TIME',
          timezone: 'Asia/Bangkok',
          daysOfWeek: activeDays,
          startsOn: this.toMillis(this.formLux.get('scheduleStart').value),
          endsOn: this.toMillis(this.formLux.get('scheduleEnd').value),
        };
      }
      // Gộp nhiều observable
      const requestList: Observable<any>[] = [];
      const tenLuat = LUATDTO.deviceProfileAlarm.alarmType;
      // Trường hợp có cả hai ngưỡng
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 2){
        this.lstAllDvice.Lux.forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[1].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType = tenLuat + `_RULE_PART${index + 1}`;
          requestList.push(this.luatService.createLuatCb(luatDToTemp));
        });
      }
      if (LUATDTO.deviceProfileAlarm.clearRule.condition.condition.length === 1){
        this.lstAllDvice.Lux.forEach((sens, index) => {
          const luatDToTemp = deepClone(LUATDTO);
          luatDToTemp.deviceProfileAlarm.createRules.CRITICAL.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.clearRule.condition.condition[0].key.key = sens.telemetryType[0];
          luatDToTemp.deviceProfileAlarm.alarmType = tenLuat + `_RULE_PART${index + 1}`;
          requestList.push(this.luatService.createLuatCb(luatDToTemp));
        });
      }
      forkJoin(requestList).subscribe(() => {
        this.showToast(`Thêm mới thành công`, 'success');
        this.createForm.reset();
        this.formHumidity.reset();
        this.formLux.reset();
        this.formTemperature.reset();
        this.router.navigate(['home/giam-sat/danh-sach-canh-bao/thiet-lap-luat-canh-bao'], {queryParams: { damTomGsId: this.damTomId }});
        },
        error => {
          if (error.status === 400 && error.error.message === DAMTOM_DOES_NOT_EXIST) {
            this.showToast('Nhà vườn không tồn tại!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_CANNOT_BE_NULL) {
            this.showToast('Tên luật cảnh báo không được bỏ trống!', 'danger');
          } else if (error.status === 400 && error.error.message === ALARM_RULE_NAME_ALREADY_EXIST) {
            this.isExistNameLuatAS = true;
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

  checkNutTemperature() {
    if (!this.formTemperature.dirty) {
      return true;
    } else if (
      this.formTemperature.value.tenLCB.trim() === '' ||
      this.formTemperature.value.tenLCB.trim().length > 255
    ) {
      return true;
    } else if (
      this.formTemperature.get('nguongTren').value === '' &&
      this.formTemperature.get('nguongDuoi').value === ''
    ) {
      return true;
    } else if (
      this.formTemperature.get('nguongTren').hasError('pattern') ||
      this.formTemperature.get('nguongDuoi').hasError('pattern')
    ) {
      return true;
    } else if (
      this.formTemperature.get('nguongTren').value < 0 ||
      this.formTemperature.get('nguongTren').value > 100 ||
      this.formTemperature.get('nguongDuoi').value < 0 ||
      this.formTemperature.get('nguongDuoi').value > 100
    ) {
      return true;
    } else if (this.isTrenNhoHonTemperature()) {
      return true;
    } else if (this.checkValidVaoCacNgayTemperature()) {
      return true;
    } else if (this.isExistNameLuatND) {
      return true;
    } else {
      return false;
    }
  }
  checkNutHumidity() {
    if (!this.formHumidity.dirty) {
      return true;
    } else if (
      this.formHumidity.value.tenLCB.trim() === '' ||
      this.formHumidity.value.tenLCB.trim().length > 255
    ) {
      return true;
    } else if (
      this.formHumidity.get('nguongTren').value === '' &&
      this.formHumidity.get('nguongDuoi').value === ''
    ) {
      return true;
    } else if (
      this.formHumidity.get('nguongTren').hasError('pattern') ||
      this.formHumidity.get('nguongDuoi').hasError('pattern')
    ) {
      return true;
    } else if (
      this.formHumidity.get('nguongTren').value < 0 ||
      this.formHumidity.get('nguongTren').value > 100 ||
      this.formHumidity.get('nguongDuoi').value < 0 ||
      this.formHumidity.get('nguongDuoi').value > 100
    ) {
      return true;
    } else if (this.isTrenNhoHonHumidity()) {
      return true;
    } else if (this.checkValidVaoCacNgayHumidity()) {
      return true;
    } else if (this.isExistNameLuatDA) {
      return true;
    } else {
      return false;
    }
  }
  checkNutLux() {
    if (!this.formLux.dirty) {
      return true;
    } else if (
      this.formLux.value.tenLCB.trim() === '' ||
      this.formLux.value.tenLCB.trim().length > 255
    ) {
      return true;
    } else if (
      this.formLux.get('nguongTren').hasError('pattern') ||
      this.formLux.get('nguongDuoi').hasError('pattern')
    ) {
      return true;
    } else if (
      this.formLux.get('nguongTren').value === '' &&
      this.formLux.get('nguongDuoi').value === ''
    ) {
      return true;
    } else if (
      this.formLux.get('nguongTren').value < 0 ||
      this.formLux.get('nguongTren').value > 100000 ||
      this.formLux.get('nguongDuoi').value < 0 ||
      this.formLux.get('nguongDuoi').value > 100000
    ) {
      return true;
    } else if (this.isTrenNhoHonLux()) {
      return true;
    } else if (this.checkValidVaoCacNgayLux()) {
      return true;
    } else if (this.isExistNameLuatAS) {
      return true;
    }
    else {
      return false;
    }
  }

  checkNutCreate() {
    if (
      this.checkNutTemperature() &&
      this.checkNutHumidity() &&
      this.checkNutLux()
    ) {
      return true;
    }
    else { return false; }
  }

  isTrenNhoHonTemperature() {
    return (
      Number(this.formTemperature.get('nguongTren').value.replace(',', '.')) <
        Number(
          this.formTemperature.get('nguongDuoi').value.replace(',', '.')
        ) &&
      this.formTemperature.get('nguongTren').value.toString().trim().length > 0
    );
  }
  isTrenNhoHonHumidity() {
    return (
      Number(this.formHumidity.get('nguongTren').value.replace(',', '.')) <
        Number(this.formHumidity.get('nguongDuoi').value.replace(',', '.')) &&
      this.formHumidity.get('nguongTren').value.toString().trim().length > 0
    );
  }
  isTrenNhoHonLux() {
    return (
      Number(this.formLux.get('nguongTren').value.replace(',', '.')) <
        Number(this.formLux.get('nguongDuoi').value.replace(',', '.')) &&
      this.formLux.get('nguongTren').value.toString().trim().length > 0
    );
  }
  // Lấy danh sách luật cảnh báo
  getLuatCanhBaoByDamTomID(id: string) {
    this.luatService.getListLuatbyIdDam(id).subscribe(
      (data) => {
        this.lstLuatOfDam = data;
      },
      (err) => {
      }
    );
  }

  convertNguongTrenTemperature(event) {
    if (
      this.formTemperature.get('nguongTren').value.toString().trim().length > 0
    ) {
      this.formTemperature
        .get('nguongTren')
        .setValue(
          Number(
            this.formTemperature.get('nguongTren').value.replace(',', '.')
          ).toFixed(1)
        );
    }
  }
  convertNguongDuoiTemperature(event) {
    if (
      this.formTemperature.get('nguongDuoi').value.toString().trim().length > 0
    ) {
      this.formTemperature
        .get('nguongDuoi')
        .setValue(
          Number(
            this.formTemperature.get('nguongDuoi').value.replace(',', '.')
          ).toFixed(1)
        );
    }
  }
  convertNguongTrenHumidity(event) {
    if (
      this.formHumidity.get('nguongTren').value.toString().trim().length > 0
    ) {
      this.formHumidity
        .get('nguongTren')
        .setValue(
          Number(
            this.formHumidity.get('nguongTren').value.replace(',', '.')
          ).toFixed(1)
        );
    }
  }
  convertNguongDuoiHumidity(event) {
    if (
      this.formHumidity.get('nguongDuoi').value.toString().trim().length > 0
    ) {
      this.formHumidity
        .get('nguongDuoi')
        .setValue(
          Number(
            this.formHumidity.get('nguongDuoi').value.replace(',', '.')
          ).toFixed(1)
        );
    }
  }
  convertNguongTrenLux(event) {
    if (this.formLux.get('nguongTren').value.toString().trim().length > 0) {
      this.formLux
        .get('nguongTren')
        .setValue(
          Number(
            this.formLux.get('nguongTren').value.replace(',', '.')
          ).toFixed(1)
        );
    }
  }
  convertNguongDuoiLux(event) {
    if (this.formLux.get('nguongDuoi').value.toString().trim().length > 0) {
      this.formLux
        .get('nguongDuoi')
        .setValue(
          Number(
            this.formLux.get('nguongDuoi').value.replace(',', '.')
          ).toFixed(1)
        );
    }
  }
  /* 17/8/2021 by chuongnv
   */
  //  Temperature
  // checkValidTimeTemperature(){
  //   return this.toMillis(this.formTemperature.get('scheduleStart').value) > this.toMillis(this.formTemperature.get('scheduleEnd').value);
  // }
  checkValidVaoCacNgayTemperature() {
    return (
      this.scheduleDayOfWeekTemperature[1] === false &&
      this.scheduleDayOfWeekTemperature[2] === false &&
      this.scheduleDayOfWeekTemperature[3] === false &&
      this.scheduleDayOfWeekTemperature[4] === false &&
      this.scheduleDayOfWeekTemperature[5] === false &&
      this.scheduleDayOfWeekTemperature[6] === false &&
      this.scheduleDayOfWeekTemperature[7] === false
    );
  }
  toggleDayOfWeekTemperature(value) {
    this.scheduleDayOfWeekTemperature[value] =
      !this.scheduleDayOfWeekTemperature[value];
    this.formTemperature.markAsDirty();
  }
  // Humidity
  // checkValidTimeHumidity(){
  //   return this.toMillis(this.formHumidity.get('scheduleStart').value) > this.toMillis(this.formHumidity.get('scheduleEnd').value);
  // }
  checkValidVaoCacNgayHumidity() {
    return (
      this.scheduleDayOfWeekHumidity[1] === false &&
      this.scheduleDayOfWeekHumidity[2] === false &&
      this.scheduleDayOfWeekHumidity[3] === false &&
      this.scheduleDayOfWeekHumidity[4] === false &&
      this.scheduleDayOfWeekHumidity[5] === false &&
      this.scheduleDayOfWeekHumidity[6] === false &&
      this.scheduleDayOfWeekHumidity[7] === false
    );
  }
  toggleDayOfWeekHumidity(value) {
    this.scheduleDayOfWeekHumidity[value] =
      !this.scheduleDayOfWeekHumidity[value];
    this.formHumidity.markAsDirty();
  }
  // Lux
  // checkValidTimeLux(){
  //   return this.toMillis(this.formLux.get('scheduleStart').value) > this.toMillis(this.formLux.get('scheduleEnd').value);
  // }
  checkValidVaoCacNgayLux() {
    return (
      this.scheduleDayOfWeekLux[1] === false &&
      this.scheduleDayOfWeekLux[2] === false &&
      this.scheduleDayOfWeekLux[3] === false &&
      this.scheduleDayOfWeekLux[4] === false &&
      this.scheduleDayOfWeekLux[5] === false &&
      this.scheduleDayOfWeekLux[6] === false &&
      this.scheduleDayOfWeekLux[7] === false
    );
  }
  toggleDayOfWeekLux(value) {
    this.scheduleDayOfWeekLux[value] = !this.scheduleDayOfWeekLux[value];
    this.formLux.markAsDirty();
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

  changeNameLuatAS(){
    this.isExistNameLuatAS = false;
  }
  changeNameLuatDoAm(){
    this.isExistNameLuatDA = false;
  }
  changeNameLuatNhietDo(){
    this.isExistNameLuatND = false;
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
