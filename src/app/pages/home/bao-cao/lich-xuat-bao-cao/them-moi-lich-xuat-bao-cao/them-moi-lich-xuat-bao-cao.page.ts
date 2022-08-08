import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonContent, LoadingController, ToastController } from '@ionic/angular';
import { ReportNameMap, ReportScheduleService } from 'src/app/core/services/report-schedule.service';
import { DamTom } from 'src/app/core/services/report-schedule.service';
import { UsersDft } from 'src/app/shared/models/users-dft.model';
import { ReportScheduleCreateOrUpdate } from 'src/app/shared/models/report-schedule.model';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import { PageData } from 'src/app/shared/models/page/page-data';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/core/core.state';
import { getCurrentAuthUser } from 'src/app/core/auth/auth.selectors';
import { UserService } from 'src/app/core/http/user.service';

const ALL_DAM_TOM_UUID  = '5323da80-8205-47ac-9c9e-b4abf6958fbf';
export enum Repeater {
  Daily,
  Weekly,
  Monthly
}
@Component({
  selector: 'app-them-moi-lich-xuat-bao-cao',
  templateUrl: './them-moi-lich-xuat-bao-cao.page.html',
  styleUrls: ['./them-moi-lich-xuat-bao-cao.page.scss'],
})
export class ThemMoiLichXuatBaoCaoPage implements OnInit {
  constructor(private alertCtrl: AlertController,
              private router: Router,
              private loadCtrl: LoadingController,
              private reportScheduleService: ReportScheduleService,
              private toastCtl: ToastController,
              protected store: Store<AppState>,
              private fb: FormBuilder,
              private userService: UserService) { }
  damTomUser = [];
  // addEmailRecipients = []
  isPageLoading = false;
  isUserLoading = false;
  // isDaily = true;
  // isWeekly = true;
  // isMonthLy = true;
  repeater = Repeater;
  date  = Repeater.Daily;
  scheduleDayOfWeek = {
    t2: false,
    t3: false,
    t4: false,
    t5: false,
    t6: false,
    t7: false,
    cn: true,
  };

  form: FormGroup;

  /**
   * e : every
   * cron schedule       '* * * * * *'
   * cron format  'e:seccons e:minutes e:hour e:day e:month e:dayofWeek '
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

  DayInWeek = [
    { key: 1, value: 'Thứ 2' },
    { key: 2, value: 'Thứ 3' },
    { key: 3, value: 'Thứ 4' },
    { key: 4, value: 'Thứ 5' },
    { key: 5, value: 'Thứ 6' },
    { key: 6, value: 'Thứ 7' },
    { key: 0, value: 'Chủ nhật' }
  ];

  DayInWeekNewUI = [
    { key: 1, value: 't2' },
    { key: 2, value: 't3' },
    { key: 3, value: 't4' },
    { key: 4, value: 't5' },
    { key: 5, value: 't6' },
    { key: 6, value: 't7' },
    { key: 0, value: 'cn' }
  ];


  tennantUser = null ;
  authUser = getCurrentAuthUser(this.store);
  // 0 - Sun      Sunday
  // 1 - Mon      Monday
  // 2 - Tue      Tuesday
  // 3 - Wed      Wednesday
  // 4 - Thu      Thursday
  // 5 - Fri      Friday
  // 6 - Sat      Saturday
  // 7 - Sun      Sunday


  listReportEnableDamTomSelect = ['SYNTHESIS_REPORT', 'WARNING_REPORT', 'SENSOR_CONNECTION_REPORT', 'MONITORING_DATA_REPORT'];

  // 30 Day of month
  dayInMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

  // new report schedule
  newReportSchedule: ReportScheduleCreateOrUpdate = null;

  //
  sortOrder;
  pageLink: PageLink;

  /**
   * map report name
   */
  reportNameMap = ReportNameMap;

  // List user
  staffOfDamTom: UsersDft[] = [];
  AllStaff: UsersDft[] = [];
  // tslint:disable-next-line: ban-types
  object: Object;
  // damTomList : DamtomD[] = [];
  damTomList: DamTom[] = [];
  userReceivedReport: UsersDft[] = [];
  userReceivedReportId: string[] = [];
  action = '';

  userSortOrder = {
    property: 'createdTime',
    direction: Direction.DESC
  };
  userPageLink = new PageLink(100, 0, '', this.userSortOrder);
  userSelectedText = 'Chọn tài khoản';
  userSelected = false;
  isGoTop = false;
  isExistName = false;
  @ViewChild(IonContent) gotoTop: IonContent;
  convertDayInWeekToCronDay(day: string){
   const keyMap = this.DayInWeekNewUI.find(d => d.value === day);
   return keyMap.key;
  }

  toggleDayOfWeek(value) {
    let temp;
    temp = this.scheduleDayOfWeek[value] ;
    this.scheduleDayOfWeek.t2 = false;
    this.scheduleDayOfWeek.t3 = false;
    this.scheduleDayOfWeek.t4 = false;
    this.scheduleDayOfWeek.t5 = false;
    this.scheduleDayOfWeek.t6 = false;
    this.scheduleDayOfWeek.t7 = false;
    this.scheduleDayOfWeek.cn = false;
    this.scheduleDayOfWeek[value]  = temp;
    this.scheduleDayOfWeek[value] = !this.scheduleDayOfWeek[value];
    this.form.controls.receivedDate.patchValue(this.convertDayInWeekToCronDay(value));
    this.validateLoop();
  }

  resetValueOfWeek(){
    this.scheduleDayOfWeek.t2 = false;
    this.scheduleDayOfWeek.t3 = false;
    this.scheduleDayOfWeek.t4 = false;
    this.scheduleDayOfWeek.t5 = false;
    this.scheduleDayOfWeek.t6 = false;
    this.scheduleDayOfWeek.t7 = false;
    this.scheduleDayOfWeek.cn = true;
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
    }
    else {
      return false;
    }
  }

  ngOnInit() {
    this.fetchDataAllUser();
    for (const key of this.reportNameMap.keys()){
    }

    this.isPageLoading = true;
    this.newReportSchedule = { active: true, cron: '', damTomId: '', reportName: '', scheduleName: '', users: [], note: '' };

    this.sortOrder = {
      property: 'createdTime',
      direction: Direction.DESC
    };

    this.pageLink = new PageLink(100, 0, '', this.sortOrder);
    this.fetchDamTomsData();
    const hour = new Date();
    hour.setHours(0);
    hour.setMinutes(0);
    hour.setSeconds(0);
    // Khởi tạo form và validate
    this.form = this.fb.group({
      reportScheduleName: ['', [Validators.required, Validators.maxLength(255)]],
      reportName: ['', [Validators.required]],
      damtom: ['', [Validators.required]],
      reportRecipients: ['', [Validators.required]],
      repeat: ['day'],
      receivedDate: ['2021-07-01T00:00:00.736Z', [Validators.required]],
      // receivedDate: ["2021-07-01T04:33:11.736Z",[Validators.required]],
      // receivedhour: [hour.toISOString(), [Validators.required]],
      receivedhour: ['2021-07-01T00:00:00', [Validators.required]],
      emailRecipients: ['', [Validators.pattern(/^([\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,})((,)+([\sA-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z\s]{2,}))*$/)]],
      content: [],
      active: [true]
    });
    this.form.controls.receivedDate.disable();
    this.fetchUserTenant(this.authUser.userId);
  }

  fetchUserTenant(tenantId){
    this.userService.getUser(tenantId).subscribe(user => {
      this.tennantUser = user;
  }, (errorRes) => {
  }, () => {
      this.isUserLoading = false;
  });
  }

  fetchDamTomsData() {
    // tslint:disable-next-line: no-unused-expression
    this.pageLink;
    this.reportScheduleService.getListDamTom(this.pageLink)
      .subscribe((pageData: PageData<any>) => {
        if (pageData.hasNext) {
          this.pageLink.pageSize += 100;
          this.fetchDamTomsData();
        } else {
          this.damTomList = this.getListDamTomActive(pageData);
          this.isPageLoading = false;
        }
      },
        err => {
          this.showToast(`Có lỗi xảy ra khi tải các nhà vườn`, 'danger', 3000);
          this.isPageLoading = false;
        }
      );
  }
  controlTimeRp() {
    if (this.form.get('repeat').value === 'day') {
      this.form.controls.receivedDate.patchValue('');
      this.form.controls.receivedDate.disable();
      this.date = this.repeater.Daily;
      this.resetValueOfWeek();
    } else {
      this.form.controls.receivedDate.enable();

    }
    if (this.form.get('repeat').value === 'month') {
      this.isReceviedDay = false;
      this.form.get('receivedDate').setValue('2021-07-01T04:33:11.736Z');
      this.date = this.repeater.Monthly;
      this.resetValueOfWeek();
      // this.form.controls['reportScheduleName'].setErrors({'require':true});
    }
    else if (this.form.get('repeat').value === 'week') {
      this.isReceviedDay = true;
      this.date = this.repeater.Weekly;
      this.form.get('receivedDate').setValue('0');
      // this.form.controls['reportScheduleName'].setErrors({'require':true});
    }
  }

  addreportScheduleName() {
    const value = this.form.getRawValue();
    if (this.form.invalid) {
      this.alertCtrl.create({
        message: 'Chưa nhập đủ các trường dữ liệu bắt buộc',
        buttons: [{
          text: 'Ok',
          role: 'cancel'
        }]
      }).then(alert => {
        alert.present();
      });
    }
    else {
      const loadingAlert = this.loadCtrl.create({
        message: '',
      });
      loadingAlert.then(loadAlt => {
        loadAlt.present();
      });

      // tslint:disable-next-line: no-shadowed-variable
      const value = this.form.getRawValue();

      // DatePicker Format 1994-12-15T13:47:20.789+05:00
      this.hour = value.receivedhour.split(':')[0].split('T')[1];
      this.minutes = value.receivedhour.split(':')[1].split(':')[0];
      if (value.repeat === 'day') {
        this.dayWeek = '*';
        this.month = '*';
        this.day = '*';
      }
      else if (value.repeat === 'month') {
        this.dayWeek = '*';
        this.month = '*';
        // if value = month  value.receivedDate = 1 -> 30
        this.day = value.receivedDate.split('T')[0].split('-')[2];
        // if(this.day.startsWith('0')) this.day = this.day.replace('0','');
      }
      else if (value.repeat === 'week') {
        // if value = month  value.receivedDate = 1 -> 7
        this.dayWeek = value.receivedDate;
        this.month = '*';
        this.day = '*';
      }
      this.newReportSchedule.active = value.active;
      if (value.damtom !== undefined){
        if (value.damtom.id !== undefined){
          if (value.damtom.id.id !== undefined){
             this.newReportSchedule.damTomId = value.damtom.id.id ;
          }
        }
      }
      else{
        this.newReportSchedule.damTomId = ALL_DAM_TOM_UUID;
      }
      // tslint:disable-next-line: no-unused-expression
      this.newReportSchedule.damTomId === '' ? this.newReportSchedule.damTomId = ALL_DAM_TOM_UUID : 0;
      // tslint:disable-next-line: no-unused-expression
      value.content !== null ? this.newReportSchedule.note = value.content.trim() : 0;
      this.newReportSchedule.reportName = value.reportName;
      this.newReportSchedule.scheduleName = value.reportScheduleName.trim();
      if (this.newReportSchedule.damTomId !== ALL_DAM_TOM_UUID){
        if (!!value.reportRecipients) {
          this.newReportSchedule.users = [];
          this.newReportSchedule.users = value.reportRecipients;
          // this.newReportSchedule.users = this.damTomUser
        }
      }
      else{
        if (!!value.reportRecipients) {

          this.newReportSchedule.users = [];
          this.newReportSchedule.users = value.reportRecipients;
          // this.newReportSchedule.users = this.damTomUser
          // value.reportRecipients.forEach(recipient => {
          //   console.log(recipient);

          //   this.newReportSchedule.users.push(recipient.id.id);
          // });
        }
      }
      // if(this.minutes.startsWith('0')) this.minutes = this.minutes.replace('0','');
      // if(this.hour.startsWith('0')) this.hour = this.hour.replace('0','');
      // if (this.day != undefined) {
      //   if (this.day.length == 1) {
      //     this.day = `0${this.day}`
      //   }
      // }
      this.cronSchedule = `0 ${this.minutes} ${this.hour} ${this.day} ${this.month} ${this.dayWeek}`;
      this.newReportSchedule.cron = this.cronSchedule;
      this.newReportSchedule.otherEmail = this.form.get('emailRecipients').value;
      // return;
      // this.newReportSchedule.users.push("8c6ef0a0-e131-11eb-b12b-1186f4ee5835");
      this.AddReportSchedule(this.newReportSchedule)
        .then(data => {
          this.showToast('Thêm mới thành công', 'success', 3000);
          this.form.markAsPristine();
          this.router.navigate(['home', 'quan-tri', 'bao-cao', 'lich-xuat-bao-cao']);
        }
        ).catch(err => {
          if (err.error.message === 'Report schedule name existed!'){
            this.isExistName = true;
          }
          else {
            this.showToast('Có lỗi xảy ra vui lòng thử lại sau', 'danger', 3000);
          }
        })
        .finally(() => {
          // dismis load
          loadingAlert.then(loadAlt => {
            loadAlt.dismiss().finally(() => {
              this.goTop();
            });
          });
        });
    }
  }

  reportTypeChange(value){

    const reportKey =  value.detail.value;
    if (!this.listReportEnableDamTomSelect.includes(reportKey) && reportKey !== '') {
      this.form.controls.damtom.disable();
      this.form.get('damtom').setValue('');
      this.form.get('damtom').markAsPristine();
      this.isUserLoading = true;
      this.fetchDataAllUser();
      return;
    }
    this.form.controls.damtom.enable();

  }
   fetchDataAllUser(){
    this.staffOfDamTom = [];
    this.reportScheduleService.getAllUsersDft(this.userPageLink).subscribe((pageData: PageData<UsersDft>) => {
      if (pageData.hasNext) {
        this.pageLink.pageSize += 100;
        this.fetchDamTomsData();
      } else {
        this.staffOfDamTom = (pageData.data).filter(user => user.active === true);
        this.AllStaff = this.staffOfDamTom;
        // tslint:disable-next-line: no-unused-expression
        this.AllStaff;
      }
    }, err => {},
    () => {
      this.isPageLoading = false;
      this.isUserLoading = false; }
    );
   }

  ionSelectDamTomChange() {
    this.form.get('reportRecipients').patchValue([]);
    this.isUserLoading = true;
    // this.form.controls['reportRecipients'].patchValue('');
    if (this.form.controls.damtom.value === undefined) {
      this.showToast('Chưa có nhà vườn nào!', 'warning', 3000);
      this.isUserLoading = false;
    } else {
      // if(!this.listReportEnableDamTomSelect.includes(this.form.get("reportName").value)) return;
      this.staffOfDamTom = [];
      const damtomSelected = this.form.controls.damtom.value;
      if (damtomSelected === undefined) { return; }
      this.reportScheduleService.getDamTom(damtomSelected.id.id)
        .subscribe(damtom => {
          if (!!damtom && !!damtom.staffs) {
            damtom.staffs.forEach(staffs => {
              if (this.AllStaff.find(user => user.userId === staffs.userId)){
                this.staffOfDamTom.push(staffs);
              }
            });
          }
          this.isUserLoading = false;
        },
          err => {
            this.isUserLoading = false;
            this.showToast('Lỗi khi tải nhân viên của nhà vườn', 'danger', 3000);
          });
    }
  }

  validateUserSelect() {
    // if (this.form.controls['damtom'].value === '' || this.form.controls['damtom'].value === null) {
    //   this.alertCtrl.create({
    //     message: 'Chưa chọn đầm tôm',
    //     buttons: [
    //       {
    //         text: 'Ok',
    //         role : 'cancel'
    //       }
    //     ]
    //   }).then(alCtrl => {
    //     alCtrl.present();
    //   })
    // }
  }
  bindingText(event){
    this.userSelected = false;
    const staffOfDamTom = [...this.staffOfDamTom];
    staffOfDamTom.push(this.tennantUser);
    this.damTomUser = [] ;
    event.detail.value.forEach(userId => {
      staffOfDamTom.forEach(staff => {
        if (userId === staff.userId){
          this.damTomUser.push(staff);
        }
      });
    });
    this.userSelectedText = '';
    if (event.detail.value.length < 1) {
      this.userSelectedText = 'Chọn tài khoản';
      return;
    }
    if (event.detail.value.length <= 1){
      // this.damTomUser.forEach(user=>{
      //   this.userSelectedText +=  user.firstName + " ";
      //  })
      this.userSelectedText +=  '  ' + this.damTomUser[0].firstName;
      this.userSelected = true;
    }
    else{
      // this.damTomUser.forEach(user=>{
      //   this.userSelectedText +=  user.firstName + ` và  ${this.damTomUser.length} người khác` ;
      //   break;
      //  })
      this.userSelectedText += `  ${this.damTomUser[0].firstName} và ${this.damTomUser.length - 1} người khác` ;
      // let userIds = [];
      //  this.damTomUser.forEach(user=>{

      // })
      this.userSelected = true;
    }
    // if(this.userSelectedText===""){
    //   this.userSelected = true;
    // }
    // else{
    //   this.userSelected = false;
    // }

  }
  alert(){
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
    this.userReceivedReportId = this.userReceivedReportId.filter(id => {
      return userId.userId !== id;
    });
    const staffOfDamTom = [...this.staffOfDamTom];
    staffOfDamTom.push(this.tennantUser);
    this.userReceivedReportId = [...new Set(this.userReceivedReportId)];
    // tslint:disable-next-line: no-shadowed-variable
    this.userReceivedReportId.forEach(userId => {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < staffOfDamTom.length; i ++) {
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
  changeUserReceivedReport = e => {
    if (this.action === 'del') {
      this.action = '';
      return;
    }
    this.userReceivedReport = [];
    this.userReceivedReportId = [...e.detail.value];
    this.userReceivedReportId = [...new Set(this.userReceivedReportId)];

    const staffOfDamTom = [...this.staffOfDamTom];
    staffOfDamTom.push(this.tennantUser);
    this.userReceivedReportId.forEach(userId => {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < staffOfDamTom.length; i ++) {
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
  AddReportSchedule(reportSchedule: ReportScheduleCreateOrUpdate) {
    return new Promise((resolve, rejects) => {
      this.reportScheduleService.createReportSchedule(reportSchedule)
        .subscribe(rpSchedule => resolve(rpSchedule), err => rejects(err));
    });
  }

  showToast(message: string, color: string, time: number) {
    this.toastCtl.create({
      message,
      color,
      duration: time
    }).then(toastCtrl => {
      toastCtrl.present();
    });
  }
  getListDamTomActive(pageData) {
    const listDamTom = [];
    pageData.data.forEach(damtom => {
      if (damtom.active) {
        listDamTom.push(damtom);
      }
    });
    return listDamTom;
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
