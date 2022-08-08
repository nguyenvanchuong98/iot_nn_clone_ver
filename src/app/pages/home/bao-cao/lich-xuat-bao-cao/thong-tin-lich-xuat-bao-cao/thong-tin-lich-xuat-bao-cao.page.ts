import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { Store } from '@ngrx/store';
import { getCurrentAuthUser } from 'src/app/core/auth/auth.selectors';
import { AppState } from 'src/app/core/core.state';
import { UserService } from 'src/app/core/http/user.service';
import {
  DamTomSchedule,
  ReportNameMap,
  ReportScheduleService,
} from 'src/app/core/services/report-schedule.service';

import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import {
  ReportSchedule,
  ReportScheduleCreateOrUpdate,
} from 'src/app/shared/models/report-schedule.model';
import { UsersDft } from 'src/app/shared/models/users-dft.model';
import { escapedHTML } from 'src/app/shared/utils';

const ALL_DAM_TOM_UUID = '5323da80-8205-47ac-9c9e-b4abf6958fbf';

export enum Repeater {
  Daily,
  Weekly,
  Monthly,
}
@Component({
  selector: 'app-thong-tin-lich-xuat-bao-cao',
  templateUrl: './thong-tin-lich-xuat-bao-cao.page.html',
  styleUrls: ['./thong-tin-lich-xuat-bao-cao.page.scss'],
})
export class ThongTinLichXuatBaoCaoPage implements OnInit {
  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private loadCtrl: LoadingController,
    private reportScheduleService: ReportScheduleService,
    private toastCtl: ToastController,
    private fb: FormBuilder,
    protected store: Store<AppState>,
    private userService: UserService,
    private activeRoute: ActivatedRoute
  ) {}
  isPageLoading = false;
  isUserLoading = false;
  callControlTimeRp = 0;
  form: FormGroup;
  scheduleName = '';
  /**
   * e : every
   * cron schedule       ' * * * * * *'
   * cron format  'e:seccons e:minutes e:day e:month e:dayofWeek '
   *
   */
  minutes = '0';
  hour = '22';
  day = '*';
  month = '*';
  dayWeek = '*';
  cronSchedule = '';
  // Check repeat on week or on month
  isReceviedDay = true;
  repeater = Repeater;
  date = Repeater.Daily;
  action = '';
  isGoTop = false;
  isExistName = false;
  @ViewChild(IonContent) gotoTop: IonContent;

  DayInWeek = [
    { key: '1', value: 'Thứ 2' },
    { key: '2', value: 'Thứ 3' },
    { key: '3', value: 'Thứ 4' },
    { key: '4', value: 'Thứ 5' },
    { key: '5', value: 'Thứ 6' },
    { key: '6', value: 'Thứ 7' },
    { key: '0', value: 'Chủ nhật' },
  ];

  scheduleDayOfWeek = {
    t2: false,
    t3: false,
    t4: false,
    t5: false,
    t6: false,
    t7: false,
    cn: false,
  };

  DayInWeekNewUI = [
    { key: 1, value: 't2' },
    { key: 2, value: 't3' },
    { key: 3, value: 't4' },
    { key: 4, value: 't5' },
    { key: 5, value: 't6' },
    { key: 6, value: 't7' },
    { key: 0, value: 'cn' },
  ];

  tennantUser = null;
  authUser = getCurrentAuthUser(this.store);
  // 0 - Sun      Sunday
  // 1 - Mon      Monday
  // 2 - Tue      Tuesday
  // 3 - Wed      Wednesday
  // 4 - Thu      Thursday
  // 5 - Fri      Friday
  // 6 - Sat      Saturday

  listReportEnableDamTomSelect = [
    'SYNTHESIS_REPORT',
    'WARNING_REPORT',
    'SENSOR_CONNECTION_REPORT',
    'MONITORING_DATA_REPORT'
  ];
  // 30 Day of month
  dayInMonth = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
  ];

  // new report schedule
  newReportSchedule: ReportScheduleCreateOrUpdate = null;
  hourBc;
  userReceivedReport: UsersDft[] = [];
  userReceivedReportId: string[] = [];
  //
  sortOrder;
  pageLink: PageLink;

  id: string;
  // List staff
  staffOfDamTom: UsersDft[] = [];
  AllStaff: UsersDft[] = [];
  isDay = false;
  createdTime?: number;

  /**
   * map report name constant
   */
  reportNameMap = ReportNameMap;

  // damTomList : DamTomSchedule[] = [];
  damTomList: DamTomSchedule[] = [];

  damtomSelected: DamTomSchedule;

  userSelectedText;
  userSelected = true;
  // invalidScheduleName = false;

  // isExistReportName = false;

  userSortOrder = {
    property: 'createdTime',
    direction: Direction.DESC,
  };
  userPageLink = new PageLink(100, 0, '', this.userSortOrder);

  toggleDayOfWeek(value) {
    let temp;
    this.form.markAsDirty();
    temp = this.scheduleDayOfWeek[value];
    this.scheduleDayOfWeek.t2 = false;
    this.scheduleDayOfWeek.t3 = false;
    this.scheduleDayOfWeek.t4 = false;
    this.scheduleDayOfWeek.t5 = false;
    this.scheduleDayOfWeek.t6 = false;
    this.scheduleDayOfWeek.t7 = false;
    this.scheduleDayOfWeek.cn = false;
    this.scheduleDayOfWeek[value] = temp;
    this.scheduleDayOfWeek[value] = !this.scheduleDayOfWeek[value];
    this.form.controls.receivedDate.patchValue(
      this.convertDayInWeekToCronDay(value)
    );
    this.validateLoop();
  }

  convertDayInWeekToCronDay(day: string) {
    const keyMap = this.DayInWeekNewUI.find((d) => d.value === day);
    return keyMap.key;
  }

  convertCronDayToDayInWeek(day: number) {
    const keyMap = this.DayInWeekNewUI.find((d) => d.key === day);
    return keyMap.value;
  }

  validateLoop() {
    let day = [];
    if (this.scheduleDayOfWeek.t2) {
      day = [];
      day.push(1);
    }
    if (this.scheduleDayOfWeek.t3) {
      day = [];
      day.push(2);
    }
    if (this.scheduleDayOfWeek.t4) {
      day = [];
      day.push(3);
    }
    if (this.scheduleDayOfWeek.t5) {
      day = [];
      day.push(4);
    }
    if (this.scheduleDayOfWeek.t6) {
      day = [];
      day.push(5);
    }
    if (this.scheduleDayOfWeek.t7) {
      day = [];
      day.push(6);
    }
    if (this.scheduleDayOfWeek.cn) {
      day = [];
      day.push(7);
    }
    if (day.length < 1) {
      return true;
    } else {
      return false;
    }
  }

  ngOnInit() {
    this.fetchUserTenant(this.authUser.userId);
    this.fetchDataAllUser();
    // this.fetchDamTomsData()
    this.isPageLoading = true;
    this.isUserLoading = true;
    this.activeRoute.params.subscribe((params) => {
      this.id = params.Id;
      if (!!this.id) {
        this.reportScheduleService.getReportSchedule(this.id).subscribe(
          async (reportSchedule: ReportSchedule) => {
            reportSchedule.users.forEach((user) =>
              this.userReceivedReportId.push(user.user.userId)
            );
            this.newReportSchedule = {
              active: true,
              cron: '',
              damTomId: '',
              reportName: '',
              otherEmail: '',
              scheduleName: '',
              users: [],
              note: '',
            };
            this.scheduleName = reportSchedule.scheduleName;
            /**
             * Convert Cron to Date,Hour,Minutes,Month
             */
            this.createdTime = reportSchedule.createdTime;

            let inputDay = '';
            // tslint:disable-next-line: one-variable-per-declaration
            let inputHour = '',
              inputMinutes = '';
            let repeat = '';
            const [second, minutes, hour, days, month, week] =
              reportSchedule.cron.split(' ');
            this.minutes = minutes;
            this.hour = hour;
            this.day = days;
            this.month = month;
            this.dayWeek = week;
            this.minutes = minutes;
            this.hour = hour;
            this.day = days;

            inputHour = hour;
            inputMinutes = minutes;
            if (days === '*' && month === '*' && week === '*') {
              repeat = 'day';
              this.isDay = true;
            } else if (month === '*' && week === '*' && days !== '*') {
              repeat = 'month';
              inputDay = `2021-08-${days}T00:00:00`;
              this.isReceviedDay = false;
            } else if (month === '*' && days === '*' && week !== '*') {
              repeat = 'week';
              inputDay = week;
              this.isReceviedDay = true;
            }

            this.sortOrder = {
              property: 'createdTime',
              direction: Direction.DESC,
            };
            this.pageLink = new PageLink(100, 0, '', this.sortOrder);

            const rpName = this.reportNameMap.find((entry) => {
              if (entry.key === reportSchedule.reportName) {
                return entry;
              }
            });
            const startHour = new Date();
            startHour.setMilliseconds(0);
            // tslint:disable-next-line: radix
            // tslint:disable-next-line: radix
            startHour.setHours(parseInt(inputHour));
            // tslint:disable-next-line: radix
            startHour.setMinutes(parseInt(inputMinutes));
            this.hourBc = `2021-07-01T${inputHour}:${inputMinutes}:00`;
            this.form = this.fb.group({
              reportScheduleName: [
                '',
                [Validators.required, Validators.maxLength(255)],
              ],
              reportName: ['', [Validators.required]],
              damtom: ['', [Validators.required]],
              reportRecipients: ['', [Validators.required]],
              repeat: [repeat],
              receivedDate: ['', [Validators.required]],
              // receivedhour: [startHour.toISOString(), [Validators.required]],
              receivedhour: ['2021-07-01T00:00:00', [Validators.required]],
              emailRecipients: [
                '',
                [
                  Validators.pattern(
                    /^([\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,})((,)+([\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,}))*$/
                  ),
                ],
              ],
              content: [''],
              active: [''],
            });
            if (
              !this.listReportEnableDamTomSelect.includes(
                reportSchedule.reportName
              ) &&
              reportSchedule.reportName !== ''
            ) {
              this.isUserLoading = true;
              this.fetchDataAllUser().finally(() => {
                const usersId = [];
                reportSchedule.users.forEach((user) =>
                  usersId.push(user.user.userId)
                );
                const staffOfDamTom = [...this.staffOfDamTom];
                staffOfDamTom.push(this.tennantUser);
                this.userReceivedReportId = [
                  ...new Set(this.userReceivedReportId),
                ];
                this.userReceivedReportId.forEach((userId) => {
                  // tslint:disable-next-line: prefer-for-of
                  for (let i = 0; i < staffOfDamTom.length; i++) {
                    if (
                      staffOfDamTom[i].userId === userId
                    ) {
                      this.userReceivedReport.push(staffOfDamTom[i]);
                      break;
                    }
                  }
                  // staffOfDamTom.forEach(staff=>{
                  //   if(userId == staff.id.id || userId == staff.id){
                  //     this.userReceivedReport.push(staff);
                  //   }
                  // })
                });
                this.form = this.fb.group({
                  reportScheduleName: [
                    reportSchedule.scheduleName,
                    [Validators.required, Validators.maxLength(255)],
                  ],
                  reportName: [rpName.key, [Validators.required]],
                  damtom: [
                    { value: reportSchedule.damTomId, disabled: true },
                    [Validators.required],
                  ],
                  reportRecipients: [usersId, [Validators.required]],
                  repeat: [repeat],
                  receivedDate: [inputDay, [Validators.required]],
                  receivedhour: [this.hourBc, [Validators.required]],
                  // receivedhour: [startHour.toISOString(), [Validators.required]],
                  emailRecipients: [
                    reportSchedule.otherEmail,
                    [
                      Validators.pattern(
                        /^([\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,})((,)+([\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,}))*$/
                      ),
                    ],
                  ],
                  content: [reportSchedule.note],
                  active: [reportSchedule.active],
                });

                this.form.get('damtom').setValue('');
                this.form.controls.damtom.disable();
                // this.isPageLoading = false;
                // this.isUserLoading = false;
                if (repeat === 'week') {
                  this.scheduleDayOfWeek[
                    // tslint:disable-next-line: radix
                    this.convertCronDayToDayInWeek(parseInt(inputDay))
                  ] = true;
                }

                this.controlTimeRp(inputDay);
                this.bindingTextFirst(usersId);
              });
              this.form.controls.damtom.disable();
            } else {
              this.fetchDamTomsData().then((damtom) => {
                const staffOfDamTom = [...this.staffOfDamTom];
                staffOfDamTom.push(this.tennantUser);
                this.userReceivedReportId = [
                  ...new Set(this.userReceivedReportId),
                ];
                this.userReceivedReportId.forEach((userId) => {
                  // tslint:disable-next-line: prefer-for-of
                  for (let i = 0; i < staffOfDamTom.length; i++) {
                    if (
                      staffOfDamTom[i].userId === userId
                    ) {
                      this.userReceivedReport.push(staffOfDamTom[i]);
                      break;
                    }
                  }
                  // staffOfDamTom.forEach(staff=>{
                  //   if(userId == staff.id.id || userId == staff.id){
                  //     this.userReceivedReport.push(staff);
                  //   }
                  // })
                });
                // Khởi tạo form và validate
                this.isUserLoading = true;
                this.getreportRecipients(reportSchedule.damTomId).finally(
                  () => {
                    const usersId = [];
                    // usersId = reportSchedule.users;
                    reportSchedule.users.forEach((user) =>
                      usersId.push(user.user.userId)
                    );
                    this.form = this.fb.group({
                      reportScheduleName: [
                        reportSchedule.scheduleName,
                        [Validators.required, Validators.maxLength(255)],
                      ],
                      reportName: [rpName.key, [Validators.required]],
                      damtom: [reportSchedule.damTomId, [Validators.required]],
                      reportRecipients: [usersId, [Validators.required]],
                      repeat: [repeat],
                      receivedDate: [inputDay, [Validators.required]],
                      receivedhour: [this.hourBc, [Validators.required]],
                      // receivedhour: [startHour.toISOString(), [Validators.required]],
                      emailRecipients: [
                        reportSchedule.otherEmail,
                        [
                          Validators.pattern(
                            /^([\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,})((,)+([\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,}))*$/
                          ),
                        ],
                      ],
                      content: [reportSchedule.note],
                      active: [reportSchedule.active],
                    });

                    if (repeat === 'week') {
                      this.scheduleDayOfWeek[
                        // tslint:disable-next-line: radix
                        this.convertCronDayToDayInWeek(parseInt(inputDay))
                      ] = true;
                    }

                    this.form.controls.damtom.enable();
                    // this.form.controls['reportRecipients'].patchValue()
                    // this.isPageLoading = false;
                    // this.isUserLoading = false;
                    this.controlTimeRp(inputDay);
                    this.bindingTextFirst(usersId);
                  }
                );
              });
            }
          },
          (err) => {},
          () => {
            // this.isPageLoading = false;
            // this.isUserLoading = false;
          }
        );
      } else {
        this.router.navigate(['home', 'bao-cao', 'lich-xuat-bao-cao']);
      }
    });
  }

  convertUserSelect(damTomUser) {
    if (damTomUser.length <= 1) {
      // damTomUser.forEach(user=>{
      //   this.userSelectedText +=  user.firstName + " ";
      //  })
      this.userSelectedText += '  ' + damTomUser[0].firstName;
      this.userSelected = true;
    } else {
      // damTomUser.forEach(user=>{
      //   this.userSelectedText +=  user.firstName + ` và  ${damTomUser.length} người khác` ;
      //   break;
      //  })
      this.userSelectedText += `  ${damTomUser[0].firstName} và ${
        damTomUser.length - 1
      } người khác`;
      // let userIds = [];
      //  damTomUser.forEach(user=>{

      // })
      this.userSelected = true;
    }
  }

  bindingText(event) {
    this.userSelected = false;
    const staffOfDamTom = [...this.staffOfDamTom];
    staffOfDamTom.push(this.tennantUser);
    const damTomUser = [];
    if (typeof event.detail.value === 'object') {
      event.detail.value.forEach((userId) => {
        staffOfDamTom.forEach((staff) => {
          if (userId === staff.userId) {
            damTomUser.push(staff);
          }
        });
      });
    }
    this.userSelectedText = '';
    if (event.detail.value.length < 1) {
      this.userSelectedText = 'Chọn tài khoản';
      return;
    }
    if (event.detail.value.length <= 1) {
      this.userSelectedText += '  ' + damTomUser[0].firstName;
      this.userSelected = true;
    } else {
      this.userSelectedText += `  ${damTomUser[0].firstName} và ${
        damTomUser.length - 1
      } người khác`;
      this.userSelected = true;
    }
  }

  bindingTextFirst(userId) {
    this.userSelected = true;
    const staffOfDamTom = [...this.AllStaff];
    staffOfDamTom.push(this.tennantUser);

    const damTomUser = [];
    // tslint:disable-next-line: no-shadowed-variable
    userId.forEach((userId) => {
      staffOfDamTom.forEach((staff) => {
        if (userId === staff.userId) {
          damTomUser.push(staff);
        }
      });
    });
    this.userSelectedText = '';
    if (damTomUser.length <= 1) {
      // this.userSelectedText +=  "  "+damTomUser[0].firstName;
      this.userSelected = true;
    } else {
      // this.userSelectedText += `  ${damTomUser[0].firstName} và ${damTomUser.length - 1} người khác` ;
      this.userSelected = true;
    }
    // this.userSelectedText += `  ${damTomUser[0].firstName} và ${damTomUser.length} người khác` ;
  }

  alert() {
    // this.alertCtrl.create({
    //       message: 'click',
    //       buttons: [
    //         {
    //           text: 'Ok',
    //           role : 'cancel'
    //         }
    //       ]
    //     }).then(alCtrl => {
    //       alCtrl.present();
    //     })

    const userIds = this.form.get('reportRecipients').value;
    // if(!this.listReportEnableDamTomSelect.includes(this.form.get("reportName").value)) {
    //   userIds.pop();
    //   this.form.get('reportRecipients').patchValue([]);
    //   this.form.get('reportRecipients').patchValue(userIds);
    //   return;
    // }
    userIds.shift();

    this.form.get('reportRecipients').patchValue([]);
    this.form.get('reportRecipients').patchValue(userIds);
  }

  deleteUserReceivedReport = (userId: UsersDft) => {
    this.action = 'del';
    this.form.markAsDirty();
    this.userReceivedReport = [];
    this.userReceivedReportId = this.form.get('reportRecipients').value;
    this.userReceivedReportId = this.userReceivedReportId.filter((id) => {
      return userId.userId !== id;
    });
    const staffOfDamTom = [...this.staffOfDamTom];
    staffOfDamTom.push(this.tennantUser);
    this.userReceivedReportId = [...new Set(this.userReceivedReportId)];
    // tslint:disable-next-line: no-shadowed-variable
    this.userReceivedReportId.forEach((userId) => {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < staffOfDamTom.length; i++) {
        if (staffOfDamTom[i].userId === userId) {
          this.userReceivedReport.push(staffOfDamTom[i]);
          break;
        }
      }
      // staffOfDamTom.forEach(staff=>{
      //   if(userId == staff.id.id || userId == staff.id){
      //     this.userReceivedReport.push(staff);
      //   }
      // })
    });
    this.form.get('reportRecipients').patchValue(this.userReceivedReportId);
  }
  changeUserReceivedReport = (e) => {
    if (this.action === 'del') {
      this.action = '';
      return;
    }
    this.userReceivedReport = [];
    this.userReceivedReportId = [...e.detail.value];
    const staffOfDamTom = [...this.staffOfDamTom];
    staffOfDamTom.push(this.tennantUser);
    this.userReceivedReportId = [...new Set(this.userReceivedReportId)];
    this.userReceivedReportId.forEach((userId) => {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < staffOfDamTom.length; i++) {
        if (staffOfDamTom[i].userId === userId) {
          this.userReceivedReport.push(staffOfDamTom[i]);
          break;
        }
      }
      // staffOfDamTom.forEach(staff=>{
      //   if(userId == staff.id.id || userId == staff.id){
      //     this.userReceivedReport.push(staff);
      //   }
      // })
    });
  }

  fetchUserTenant(tenantId) {
    this.isUserLoading = true;
    this.userService.getUser(tenantId).subscribe(
      (user) => {
        this.tennantUser = user;
      },
      (errorRes) => {
      },
      () => {}
    );
  }

  fetchDamTomsData(): Promise<DamTomSchedule[]> {
    return new Promise((reslove, reject) => {
      this.reportScheduleService.getListDamTom(this.pageLink).subscribe(
        (pageData: PageData<DamTomSchedule>) => {
          if (pageData.hasNext) {
            this.pageLink.pageSize += 100;
            this.fetchDamTomsData();
          } else {
            this.damTomList = this.getListDamTomActive(pageData);
            this.isPageLoading = false;
            reslove(pageData.data);
          }
        },
        (err) => {
          this.showToast(`Có lỗi xảy ra khi tải các nhà vườn`, 'danger', 3000);
          reject(err);
          this.isPageLoading = false;
        }
      );
    });
  }

  resetValueOfWeek() {
    this.scheduleDayOfWeek.t2 = false;
    this.scheduleDayOfWeek.t3 = false;
    this.scheduleDayOfWeek.t4 = false;
    this.scheduleDayOfWeek.t5 = false;
    this.scheduleDayOfWeek.t6 = false;
    this.scheduleDayOfWeek.t7 = false;
    this.scheduleDayOfWeek.cn = true;
  }

  controlTimeRp(inputDay: string) {
    this.callControlTimeRp += 1;
    if (this.form.get('repeat').value === 'day') {
      this.form.controls.receivedDate.patchValue(null);
      this.form.controls.receivedDate.disable();
      this.form.controls.receivedDate.setErrors(null);
      //  this.form.controls['receivedDate'].markAsPristine();
      this.resetValueOfWeek();
      this.isDay = true;
      this.date = this.repeater.Daily;
    } else {
      this.form.controls.receivedDate.enable();
      this.isDay = false;
    }
    if (this.form.get('repeat').value === 'month') {
      this.isReceviedDay = false;
      if (this.callControlTimeRp > 1) {
        this.form.get('receivedDate').setValue('2021-08-01T00:00:00');
        this.form.get('receivedhour').setValue('2021-08-01T00:00:00');
      }
      this.date = this.repeater.Monthly;
      this.resetValueOfWeek();
    } else if (this.form.get('repeat').value === 'week') {
      this.isReceviedDay = true;
      this.date = this.repeater.Weekly;
      if (!!inputDay) {
        this.scheduleDayOfWeek[
          // tslint:disable-next-line: radix
          this.convertCronDayToDayInWeek(parseInt(inputDay))
        ] = true;
      }
      if (this.callControlTimeRp > 1) {
        this.form.get('receivedhour').setValue('2021-08-01T00:00:00');
        this.form.get('receivedDate').setValue('0');
      }
    }
  }
  deleteLichXuatBaoCao() {
    this.alertCtrl
      .create({
        message: escapedHTML(`Xóa lịch báo cáo "${this.scheduleName}"  ?`),
        cssClass: 'my-alert-custom-class',
        buttons: [
          {
            text: 'Quay lại',
            role: 'cancel',
          },
          {
            text: 'Xác nhận',
            handler: () => {
              this.showLoadCtrl('Xóa...', this.deleleReportSchedule(this.id));
              // this.router.navigate(['/', 'bao-cao', 'dat-lich-xuat-bao-cao']);
            },
          },
        ],
      })
      .then((alertEL) => {
        alertEL.present();
      });
  }

  updatereportExportName() {
    // reportScheduleName: [reportSchedule.scheduleName, [Validators.required]],
    // reportName: [rpName.key, [Validators.required]],
    // damtom: [reportSchedule.damTomId, [Validators.required]],
    // reportRecipients: [usersId, [Validators.required]],
    // repeat: [repeat],
    // receivedDate: [inputDay, [Validators.required]],
    // receivedhour: [`${inputHour}:${inputMinutes}`, [Validators.required]],
    // content: [reportSchedule.note],
    // active: [reportSchedule.active]
    // return;
    if (this.form.invalid) {
      this.alertCtrl
        .create({
          message: 'Chưa nhập đủ các trường dữ liệu bắt buộc',
          buttons: [
            {
              text: 'Ok',
              role: 'cancel',
            },
          ],
        })
        .then((alert) => {
          alert.present();
        });
    } else {
      const loadingAlert = this.loadCtrl.create({
        message: 'Cập nhật xuất báo cáo...',
      });
      loadingAlert.then((loadAlt) => {
        loadAlt.present();
      });
      const value = this.form.getRawValue();
      // DatePicker Format 1994-12-15T13:47:20.789+05:00
      // this.hour = value.receivedhour.split(':')[0];
      // this.minutes = value.receivedhour.split(':')[1];
      this.hour = value.receivedhour.split(':')[0].split('T')[1];
      this.minutes = value.receivedhour.split(':')[1].split(':')[0];

      if (value.repeat === 'day') {
        this.dayWeek = '*';
        this.month = '*';
        this.day = '*';
      } else if (value.repeat === 'month') {
        this.dayWeek = '*';
        this.month = '*';
        // this.day = value.receivedDate;
        this.day = value.receivedDate.split('T')[0].split('-')[2];
        // if(this.day.startsWith('0')) this.day = this.day.replace('0','');
      } else if (value.repeat === 'week') {
        this.dayWeek = value.receivedDate;
        this.month = '*';
        this.day = '*';
      }

      // Set value for new reportSchedule
      // if(value.damtom !== undefined){
      //   if(value.damtom.id !== undefined){
      //     if(value.damtom.id.id !== undefined){
      //        this.newReportSchedule.damTomId = value.damtom.id.id ;
      //     }
      //   }
      // }
      // else{
      //   this.newReportSchedule.damTomId= ALL_DAM_TOM_UUID;
      // }
      // this.newReportSchedule.damTomId === "" ? this.newReportSchedule.damTomId=ALL_DAM_TOM_UUID : 0;
      if (value.damtom === '' || value.damtom === undefined) {
        this.newReportSchedule.damTomId = ALL_DAM_TOM_UUID;
      } else {
        this.newReportSchedule.damTomId = value.damtom;
      }

      this.newReportSchedule.createdTime = this.createdTime;
      this.newReportSchedule.damTomId === ''
        ? (this.newReportSchedule.damTomId = ALL_DAM_TOM_UUID)
        // tslint:disable-next-line: no-unused-expression
        : 0;

      value.content !== null
        ? (this.newReportSchedule.note = value.content.trim())
        // tslint:disable-next-line: no-unused-expression
        : 0;
      this.newReportSchedule.reportName = value.reportName;
      this.newReportSchedule.scheduleName = value.reportScheduleName.trim();
      this.newReportSchedule.otherEmail = value.emailRecipients.trim();
      if (this.newReportSchedule.damTomId !== ALL_DAM_TOM_UUID) {
        if (!!value.reportRecipients) {
          this.newReportSchedule.users = [];
          this.newReportSchedule.users = value.reportRecipients;
        }
      } else {
        if (!!value.reportRecipients) {
          this.newReportSchedule.users = [];
          this.newReportSchedule.users = value.reportRecipients;
          // value.reportRecipients.forEach(recipient => {
          //   console.log(recipient);

          //   this.newReportSchedule.users.push(recipient.id.id);
          // });
        }
      }
      // if(this.minutes.startsWith('0')) this.minutes = this.minutes.replace('0','');
      // if(this.hour.startsWith('0')) this.hour = this.hour.replace('0','');
      this.cronSchedule = `0 ${this.minutes} ${this.hour} ${this.day} ${this.month} ${this.dayWeek}`;
      this.newReportSchedule.cron = this.cronSchedule;

      // return;
      // Update schedule
      this.updateReportSchedule(this.newReportSchedule, this.id)
        .then((data) => {

          this.showToast('Cập nhật thành công', 'success', 3000);
          this.form.markAsPristine();
          this.router.navigate([
            'home',
            'quan-tri',
            'bao-cao',
            'lich-xuat-bao-cao',
          ]);
        })
        .catch((err) => {
          if (err.error.message === 'Report schedule name existed!'){
            this.isExistName = true;
          }
          else {
            this.showToast('Có lỗi xảy ra vui lòng thử lại sau', 'danger', 3000);
          }
        })
        .finally(() => {
          // dismis load
          loadingAlert.then((loadAlt) => {
            loadAlt.dismiss().finally(() => {
              this.goTop();
            });
          });
        });
    }
  }
  updateReportSchedule(
    reportSchedule: ReportScheduleCreateOrUpdate,
    id: string
  ) {
    return new Promise((resolve, rejects) => {
      this.reportScheduleService
        .updateReportSchedule(id, reportSchedule)
        .subscribe(
          (rpSchedule) => resolve(rpSchedule),
          (err) => rejects(err)
        );
    });
  }

  showToast(message: string, color: string, time: number) {
    this.toastCtl
      .create({
        message,
        color,
        duration: time,
      })
      .then((toastCtrl) => {
        toastCtrl.present();
      });
  }

  validateUserSelect() {
    // if (this.form.controls['damtom'].value === '' || this.form.controls['damtom'].value === null) {
    //   this.alertCtrl.create({
    //     message: 'Chưa chọn đầm tôm',
    //     buttons: [
    //       {
    //         text: 'Ok',
    //         role: 'cancel'
    //       }
    //     ]
    //   }).then(alCtrl => {
    //     alCtrl.present();
    //   })
    // }
  }

  ionSelectDamTomChange() {
    this.isUserLoading = true;
    if (this.form.dirty) {
      this.form.controls.reportRecipients.patchValue('');
    }

    if (this.form.controls.damtom.value === undefined) {
      this.showToast('Chưa có nhà vườn nào!', 'warning', 3000);
      this.isUserLoading = false;
    } else {
      this.staffOfDamTom = [];
      const damtomSelected = this.form.controls.damtom.value;
      this.reportScheduleService.getDamTom(damtomSelected).subscribe(
        (damtom) => {
          if (!!damtom && !!damtom.staffs) {
            damtom.staffs.forEach((staffs) => {
              if (
                this.AllStaff.find((user) => user.userId === staffs.userId)
              ) {
                this.staffOfDamTom.push(staffs);
              }
            });
          }
          this.isUserLoading = false;
        },
        (err) => {
          this.isUserLoading = false;
          // this.showToast("Lỗi khi tải nhân viên của đầm tôm", "danger", 3000);
        },
        () => {
          this.form.get('reportRecipients').markAsPristine();
        }
      );
    }
  }

  deleleReportSchedule(UUID: string) {
    return new Promise((resolve, reject) => {
      this.reportScheduleService.deleteReportSchedule(UUID).subscribe(
        (response) => {
          resolve(response);
          this.showToast('Xóa thành công', 'success', 3000);
        },
        (err) => {
          reject(err);
          this.showToast('Xóa thất bại', 'danger', 3000);
        }
      );
    });
  }

  showLoadCtrl(message: string, fun: Promise<any>) {
    this.loadCtrl
      .create({
        message,
      })
      .then((loadCtrl) => {
        loadCtrl.present();
        fun
          .then((data) => {
            this.form.markAsPristine();
            this.router.navigate([
              'home',
              'quan-tri',
              'bao-cao',
              'lich-xuat-bao-cao',
            ]);
          })
          .catch(() => {})
          .finally(() => {
            loadCtrl.dismiss();
          });
      });
  }

  getreportRecipients(damTomId: string) {
    this.isUserLoading = true;
    return new Promise((reslove, reject) => {
      this.reportScheduleService.getDamTom(damTomId).subscribe(
        (damtom) => {
          this.staffOfDamTom = [];
          if (!!damtom && !!damtom.staffs) {
            damtom.staffs.forEach((staffs) => {
              this.staffOfDamTom = this.AllStaff.filter(
                (user) => user.userId === staffs.userId
              );
              // if(this.AllStaff.find(user=>user.id.id===staffs.staff.id)){
              //   this.staffOfDamTom.push(user);
              // }
            });
          }
          // this.staffOfDamTom.push(this.tennantUser);
          reslove(this.staffOfDamTom);
          this.isUserLoading = false;
        },
        (err) => {
          this.isPageLoading = false;
          this.isUserLoading = false;
          reject(err);
          this.showToast('Lỗi khi tải nhân viên của nhà vườn', 'danger', 3000);
        }
      );
    });
  }

  getListDamTomActive(pageData) {
    const listDamTom = [];
    pageData.data.forEach((damtom) => {
      if (damtom.active) {
        listDamTom.push(damtom);
      }
    });
    return listDamTom;
  }
  // nameScheduleChange(value) {
  //   this.isExistReportName = false;
  //   this.invalidScheduleName = false;
  //   const scheduleName = value.detail.value.trim();
  //   if (scheduleName === '') {
  //     this.form.controls.reportScheduleName.setErrors({ incorrect: true });
  //     this.invalidScheduleName = true;
  //     return;
  //   }
  //   this.invalidScheduleName = false;
  //   if (!this.form.controls.reportScheduleName.invalid) {
  //     this.form.controls.reportScheduleName.setErrors(null);
  //     console.log(this.invalidScheduleName);
  //     this.checkNameExit(this.id, scheduleName);
  //   }
  // }
  // checkNameExit(scheduleId, scheduleName) {
  //   this.reportScheduleService
  //     .isScheduleNameExist(scheduleId, scheduleName)
  //     .subscribe((isExist) => {
  //       if (isExist === true) {
  //         this.isExistReportName = true;
  //         this.form.controls.reportScheduleName.setErrors({
  //           incorrect: true,
  //         });
  //         this.invalidScheduleName = true;
  //       } else {
  //         this.isExistReportName = false;
  //         if (!this.form.controls.reportScheduleName.invalid) {
  //           this.form.controls.reportScheduleName.setErrors(null);
  //         }
  //       }
  //       console.log(this.isExistReportName);
  //     });
  // }
  fetchDataAllUser() {
    this.isUserLoading = true;
    // this.staffOfDamTom = [];
    return new Promise((resolve, reject) => {
      this.reportScheduleService.getAllUsersDft(this.userPageLink).subscribe(
        (pageData: PageData<UsersDft>) => {
          if (pageData.hasNext) {
            this.pageLink.pageSize += 100;
            this.fetchDamTomsData();
          } else {
            this.staffOfDamTom = pageData.data.filter(
              (user) => user.active === true
            );
            // this.staffOfDamTom.push(this.tennantUser);
            this.AllStaff = this.staffOfDamTom;
            resolve(this.AllStaff);
          }
        },
        (err) => {
          reject(err);
        },
        () => {
          this.isPageLoading = false;
          this.isUserLoading = false;
        }
      );
    });
  }

  reportTypeChange(value) {
    const reportKey = value.detail.value;
    if (
      !this.listReportEnableDamTomSelect.includes(reportKey) &&
      reportKey !== ''
    ) {
      this.form.get('damtom').setValue('');
      this.form.controls.damtom.disable();

      this.form.get('damtom').markAsPristine();
      this.form.get('reportRecipients').markAsPristine();
      this.isUserLoading = true;
      this.fetchDataAllUser();
      return;
    }
    this.fetchDamTomsData();
    this.form.controls.damtom.enable();
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
  changeNameLich(){
    this.isExistName = false;
  }
}
