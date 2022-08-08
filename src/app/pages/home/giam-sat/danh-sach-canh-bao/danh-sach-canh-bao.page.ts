import {DamTom} from './../../../../shared/models/giamsat.model';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IonInfiniteScroll, LoadingController, IonContent, AlertController } from '@ionic/angular';
import * as moment from 'moment';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import { AlarmHistory } from 'src/app/shared/models/giamsat.model';
import { TimePageLink } from 'src/app/shared/models/page/page-link';
import { ActivatedRoute } from '@angular/router';

export interface GroupAlarmByDay{
  time: number;
  alarmChuaClear?: AlarmHistory[];
  alarmDaXuLy: AlarmHistory[];
  alarmChuaXyLy: AlarmHistory[];
  toggleAccordion?: boolean;
}

export interface DayAlarmV4 {
  time: number; // miliseconds
  listAlarm: AlarmHistory[];
  toggleAccordion?: boolean;
  startTimeOfDay?: string;
  endTimeOfDay?: string;
  timePageLink?: TimePageLink;
  isNoData?: boolean;
}
@Component({
  selector: 'app-danh-sach-canh-bao',
  templateUrl: './danh-sach-canh-bao.page.html',
  styleUrls: ['./danh-sach-canh-bao.page.scss'],
})
export class DanhSachCanhBaoPage implements OnInit {

  constructor(
    private giamsatService: GiamSatService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
  ) {
  }
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild (IonContent, {static: true}) content: IonContent;
  isGoTop = false;

  infiniteLoad = false;
  currentDate = moment(new Date()).add(7, 'hours').toISOString();
  // Lấy đến ngày mặc định là ngày hiện tại
  toDate = moment().toISOString();
  // Lấy giá trị từ ngày mặc định là 0h ngày hiện tại
  // fromDate = moment(new Date('2021-01-01')).startOf('date').toDate().toISOString();
  fromDate = moment().subtract(6, 'days').hours(0).seconds(0).milliseconds(0).toISOString();
  isLoading = false;
  message: string;
  checkErr = false;
  selectHour = false;
  timePageLink: TimePageLink;
  damTomId: string;
  dsDamTom: DamTom[];
  checkall = true;
  listAlarmByDay: GroupAlarmByDay[] = [];
  intervalUpdateTime = null;
  isFilterDate = false;

  customActionSheetOptions: any = {
    header: 'Chọn nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };
  // update api v4
  startTime = moment().startOf('date').toISOString();
  endTime = moment(this.startTime).add(1, 'days').subtract(1, 'minute').toISOString();
  daysAlarmV4: DayAlarmV4[] = [];

  groupAlarmDayCurrent: GroupAlarmByDay[] = [
    {
      time: moment().valueOf(),
      alarmChuaClear: [],
      alarmDaXuLy: [],
      alarmChuaXyLy: [],
      toggleAccordion: true
    }
  ]; // include alarm vp, alarm co clear time = now
  alarmsClearTrueByDay: GroupAlarmByDay[] = [];
  timePageLinkClearTrue: TimePageLink;

  countAllAlarm = 0;
  isFilterAlarmVp = false;

  isFilterTime = false;
  messNodata;

  ngOnInit() {
    this.getDanhSachDamTom();
    this.route.queryParams
      // tslint:disable-next-line: deprecation
      .subscribe((data) => {
        this.damTomId = data.damtomid;
        if (data.checkall === 'true') {
          this.checkall = true;
        }
      });


    for (let i = 0; i <= 6 ; i ++) {
      const dayAlarm: DayAlarmV4 = {
        time: moment(this.startTime).valueOf(),
        listAlarm: [],
        toggleAccordion: true,
        startTimeOfDay: this.startTime,
        endTimeOfDay: moment(this.startTime).add(1, 'days').subtract(1, 'minute').toISOString()
      };
      dayAlarm.timePageLink = new TimePageLink(
        10,
        0,
        '',
        null,
        Date.parse(dayAlarm.startTimeOfDay),
        Date.parse(dayAlarm.endTimeOfDay)
      );
      this.daysAlarmV4.push(dayAlarm);
      this.startTime = moment(this.startTime).subtract(1, 'days').toISOString();
    }
    this.daysAlarmV4.forEach (dayAlarm => {
      this.getAlarmsUpdateV4('', dayAlarm.timePageLink, dayAlarm);
    });
    this.updateCurrentTime();
    this.getAllAlarm();
  }
  // Lay tat ca canh bao
  getAllAlarm() {
    this.giamsatService.CountAlarmByDamTom().subscribe((data) => {
      if (this.countAllAlarm !== data){
        this.countAllAlarm = data;
      }
    });
  }
  // Lay canh bao theo dam
  getAlarmById(damTomId: string) {
    this.giamsatService.CountAlarmByDamTom(damTomId).subscribe((data) => {
      this.countAllAlarm = data;
    });
  }
  async ionViewWillEnter() {
    // this.fromDate = moment().subtract(6, 'days').startOf('date').toISOString();
    this.messNodata = document.getElementById('noData');
    this.datesValid();
    if (this.checkall === true) {
      {
        // this.listAlarmCheck = [];
        // this.listAlarmByDay = [];
        // this.dsDuLieuCamBien = [];
        // this.infiniteScroll.disabled = false;
        // this.timePageLink = new TimePageLink(
        //   10,
        //   0,
        //   '',
        //   null,
        //   Date.parse(this.fromDate),
        //   Date.parse(this.toDate)
        // );
      }
    }
    this.checkErr = false;
    this.getDanhSachDamTom();
    // this.infiniteScroll.disabled = false;
    if (this.damTomId !== null && this.damTomId !== undefined && this.checkall === false) {
      this.isLoading = true;
      // this.getSortAlarmsDayByIdDamTomV3();
    }

    await this.getAlarmsVp();

    this.timePageLinkClearTrue = new TimePageLink(
      10,
      0,
      '',
      null,
    );
    this.getAlarmsClearTrue();
  }
  updateCurrentTime(){
    this.stopUpdateTime();

    this.intervalUpdateTime = setInterval(() => {
      this.currentDate = moment(new Date()).add(7, 'hours').add(1, 'second').toISOString();
      if (!this.isFilterDate){
        this.toDate = moment().add(1, 'second').toISOString();
      }
    }, 1000);
  }
  stopUpdateTime(){
    if (!this.intervalUpdateTime){
      return;
    }
    clearInterval(this.intervalUpdateTime);
    this.intervalUpdateTime = null;
  }
  ionViewWillLeave(){
    this.stopUpdateTime();
  }
  getDanhSachDamTom() {
    // tslint:disable-next-line: deprecation
    this.giamsatService.getDanhSachDamTom().subscribe((data) => {
      if (data === null || data === undefined) {
        this.isLoading = false;
      }
      if (data !== null && data !== undefined) {
        this.dsDamTom = data;
      }
    });
  }
  async getAlarmsUpdateV4(damTomId?: string, timePageLink?: TimePageLink, dayAlarm?: DayAlarmV4, infinite?: IonInfiniteScroll) {
    if (!!damTomId) {
      const pageData = await this.giamsatService.getDanhSachCanhBaoV4(timePageLink, damTomId).toPromise();
      let alarmSame;
      if (pageData.data.length > 0) {
        dayAlarm.isNoData = false;
        if (dayAlarm.listAlarm.length > 0) {
          // check xem record page sau co trung page truoc ko
          dayAlarm.listAlarm.forEach (alarm => {
            alarmSame = pageData.data.find(newAlarm => newAlarm.id === alarm.id);
          });
          if (alarmSame !== undefined) {
            pageData.data.splice(pageData.data.indexOf(alarmSame), 1);
          }
          dayAlarm.listAlarm = dayAlarm.listAlarm.concat(pageData.data);
        } else {
          dayAlarm.listAlarm = pageData.data;
        }
        if (infinite) {
          infinite.complete();
        }
      }
      if (pageData.totalPages === 0) {
        // dayAlarm.toggleAccordion = false;
        dayAlarm.isNoData = true;
      }
      if (pageData.hasNext === false) {
        if (infinite) {
          infinite.disabled = true;
        }
      }
      // console.log('ds canh bao v4 - dam tom id', pageData);
    } else {
      const pageData = await this.giamsatService.getDanhSachCanhBaoV4(timePageLink).toPromise();
      let alarmSame;
      if (pageData.data.length > 0) {
        dayAlarm.isNoData = false;
        if (dayAlarm.listAlarm.length > 0) {
          // check xem record page sau co trung page truoc ko
          dayAlarm.listAlarm.forEach (alarm => {
            alarmSame = pageData.data.find(newAlarm => newAlarm.id === alarm.id);
          });
          if (alarmSame !== undefined) {
            pageData.data.splice(pageData.data.indexOf(alarmSame), 1);
          }
          dayAlarm.listAlarm = dayAlarm.listAlarm.concat(pageData.data);
        } else {
          dayAlarm.listAlarm = pageData.data;
        }
        if (infinite) {
          infinite.complete();
        }
      }
      if (pageData.totalPages === 0) {
        // dayAlarm.toggleAccordion = false;
        dayAlarm.isNoData = true;
      }
      if (pageData.hasNext === false) {
        if (infinite) {
          infinite.disabled = true;
        }
      }
      // console.log('ds canh bao v4 - all', pageData);
    }
  }

  // update api l5
  // ds canh bao alarm dang vi pham trong ngay hien tai
  async getAlarmsVp(damtomId?: string, startTime?: number, endTime?: number) {
    const timePageLink: TimePageLink = new TimePageLink(
      9999,
      0,
      '',
      null,
      0,
      0
    );
    if (!!startTime && !!endTime) {
      timePageLink.startTime = startTime;
      timePageLink.endTime = endTime;
    } else {
      const startOfDay = moment().startOf('date').valueOf();
      const endDay = moment(startOfDay).add(1, 'days').subtract(1, 'minute').valueOf();
      timePageLink.startTime = startOfDay;
      timePageLink.endTime = endDay;
    }
    if (!!damtomId) {
      const pageData = await this.giamsatService.getAlarmsClearFalse(timePageLink, damtomId).toPromise();
      if (pageData.data.length > 0) {
        this.messNodata.classList.add('hidden-mess');

        this.groupAlarmDayCurrent[0].alarmChuaClear = this.groupAlarmDayCurrent[0].alarmChuaClear.concat(pageData.data);
        this.groupAlarmDayCurrent[0].alarmChuaClear.sort((a, b) => {
          // sep theo time tao moi nhat -> cu nhat
          if (a.thoiGian > b.thoiGian) { return -1; }
          if (a.thoiGian < b.thoiGian) { return 1; }
        });
      }
    } else {
      const pageData = await this.giamsatService.getAlarmsClearFalse(timePageLink, null).toPromise();
      if (pageData.data.length > 0) {
        this.messNodata.classList.add('hidden-mess');

        this.groupAlarmDayCurrent[0].alarmChuaClear = this.groupAlarmDayCurrent[0].alarmChuaClear.concat(pageData.data);
        this.groupAlarmDayCurrent[0].alarmChuaClear.sort((a, b) => {
          // sep theo time tao moi nhat -> cu nhat
          if (a.thoiGian > b.thoiGian) { return -1; }
          if (a.thoiGian < b.thoiGian) { return 1; }
        });
      }
    }
    console.log('326', this.groupAlarmDayCurrent);
  }

  async getAlarmsClearTrue(damTomId?: string, event?: any) {
    let index = 0;
    if (!!damTomId) {
      const pageData = await this.giamsatService.getAlarmsClearTrue(this.timePageLinkClearTrue, damTomId).toPromise();
      if (pageData.data.length > 0) {
        this.messNodata.classList.add('hidden-mess');

        pageData.data.forEach((alarm) => {
          const timeCompare = this.convertSecondtoTime(alarm.clearTime);
          this.alarmsClearTrueByDay.forEach(alarmDay => {
            // neu la phan tu cuoi cung trong mang list alarm day
            if (alarmDay === this.alarmsClearTrueByDay[this.alarmsClearTrueByDay.length - 1]){
              // neu thoi gian
              if (alarmDay.time === timeCompare){
                // alarm da clear chua xu ly
                if (alarm.clear && !alarm.ack){
                  alarmDay.alarmChuaXyLy.push(alarm);
                }
                // alarm user da xu ly
                if (alarm.ack){
                  alarmDay.alarmDaXuLy.push(alarm);
                }
              } else{
                index += 1;
              }
            }
          });
          // neu chua co du lieu trong mang alarm by day
          // thi push du lieu tu api tra ve vao
          if (this.alarmsClearTrueByDay[index] == null){
            this.alarmsClearTrueByDay[index] = {
              time: 0,
              alarmDaXuLy: [],
              alarmChuaXyLy: [],
              toggleAccordion: true
            };
            this.alarmsClearTrueByDay[index].time = this.convertSecondtoTime(timeCompare);
            // alarm da clear chua xu ly
            if (alarm.clear && !alarm.ack){
              this.alarmsClearTrueByDay[index].alarmChuaXyLy.push(alarm);
            }
            // alarm user da xu ly
            if (alarm.ack){
              this.alarmsClearTrueByDay[index].alarmDaXuLy.push(alarm);
            }
          }
        });
        // TH alarm clear time = ngay hien tai
        if (moment(this.alarmsClearTrueByDay[0].time).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')) {
          this.alarmsClearTrueByDay[0].alarmChuaXyLy.forEach(alarm => {
            this.groupAlarmDayCurrent[0].alarmChuaXyLy.push(alarm);
          });
          this.alarmsClearTrueByDay[0].alarmDaXuLy.forEach(alarm => {
            this.groupAlarmDayCurrent[0].alarmDaXuLy.push(alarm);
          });
          this.alarmsClearTrueByDay.splice(0, 1);
        }
        if (event !== undefined) {
          if (event?.type === 'ionInfinite') {
            event.target.complete();
          }
        }
        if (pageData.hasNext === false) {
          this.infiniteScroll.disabled = true;
        }
      } else {
        this.infiniteScroll.disabled = true;
        this.messNodata.classList.remove('hidden-mess');
      }
      console.log('435', pageData, this.alarmsClearTrueByDay);
    } else {
      const pageData = await this.giamsatService.getAlarmsClearTrue(this.timePageLinkClearTrue, null).toPromise();
      if (pageData.data.length > 0) {
        this.messNodata.classList.add('hidden-mess');

        pageData.data.forEach((alarm) => {
          const timeCompare = this.convertSecondtoTime(alarm.clearTime);
          this.alarmsClearTrueByDay.forEach(alarmDay => {
            // neu la phan tu cuoi cung trong mang list alarm day
            if (alarmDay === this.alarmsClearTrueByDay[this.alarmsClearTrueByDay.length - 1]){
              // neu thoi gian
              if (alarmDay.time === timeCompare){
                // alarm da clear chua xu ly
                if (alarm.clear && !alarm.ack){
                  alarmDay.alarmChuaXyLy.push(alarm);
                }
                // alarm user da xu ly
                if (alarm.ack){
                  alarmDay.alarmDaXuLy.push(alarm);
                }
              } else{
                index += 1;
              }
            }
          });
          // neu chua co du lieu trong mang alarm by day
          // thi push du lieu tu api tra ve vao
          if (this.alarmsClearTrueByDay[index] == null){
            this.alarmsClearTrueByDay[index] = {
              time: 0,
              alarmDaXuLy: [],
              alarmChuaXyLy: [],
              toggleAccordion: true
            };
            this.alarmsClearTrueByDay[index].time = this.convertSecondtoTime(timeCompare);
  
            // alarm da clear chua xu ly
            if (alarm.clear && !alarm.ack){
              this.alarmsClearTrueByDay[index].alarmChuaXyLy.push(alarm);
            }
            // alarm user da xu ly
            if (alarm.ack){
              this.alarmsClearTrueByDay[index].alarmDaXuLy.push(alarm);
            }
          }
        });
        // TH alarm clear time = ngay hien tai
        if (moment(this.alarmsClearTrueByDay[0].time).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')) {
          this.alarmsClearTrueByDay[0].alarmChuaXyLy.forEach(alarm => {
            this.groupAlarmDayCurrent[0].alarmChuaXyLy.push(alarm);
          });
          this.alarmsClearTrueByDay[0].alarmDaXuLy.forEach(alarm => {
            this.groupAlarmDayCurrent[0].alarmDaXuLy.push(alarm);
          });
          this.alarmsClearTrueByDay.splice(0, 1);
        }
        if (event !== undefined) {
          if (event?.type === 'ionInfinite') {
            event.target.complete();
          }
        }
        if (pageData.hasNext === false) {
          this.infiniteScroll.disabled = true;
        }
      } else {
        this.infiniteScroll.disabled = true;
        this.messNodata.classList.remove('hidden-mess');
      }
      console.log('435', pageData, this.alarmsClearTrueByDay);
    }
  }
  // Load thêm data khi kéo xuống dưới
  loadMore(event: any) {
    this.timePageLinkClearTrue.page ++;
    setTimeout(() => {
      if (this.checkall) {
        // this.getAlarmsUpdateV4('', day.timePageLink, day, infinite);
        this.getAlarmsClearTrue('', event);
      } else {
      // this.getAlarmsUpdateV4(this.damTomId, day.timePageLink, day, infinite);
        this.getAlarmsClearTrue(this.damTomId, event);
      }
    }, 500);
  }

  // bắt sự kiện thay đổi đầm tôm
  changeDamTom(event: any) {
    if (this.datesValid()) {
      this.infiniteScroll.disabled = false;

      if (event === 'all') {
        this.getAllAlarm();
        this.checkall = true;

        // this.daysAlarmV4.forEach (dayAlarm => {
        //   dayAlarm.listAlarm = [];
        //   dayAlarm.timePageLink.page = 0;
        //   this.getAlarmsUpdateV4('', dayAlarm.timePageLink, dayAlarm);
        // });
        this.alarmsClearTrueByDay = [];
        this.timePageLinkClearTrue.page = 0;
        this.groupAlarmDayCurrent[0].alarmChuaClear = [];
        this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
        this.groupAlarmDayCurrent[0].alarmDaXuLy = [];

        this.getAlarmsClearTrue();
        this.getAlarmsVp();

      } else {
        this.checkall = false;
        this.damTomId = event;
        this.getAlarmById(this.damTomId);

        // this.daysAlarmV4.forEach (dayAlarm => {
        //   dayAlarm.listAlarm = [];
        //   dayAlarm.timePageLink.page = 0;
        //   this.getAlarmsUpdateV4(event, dayAlarm.timePageLink, dayAlarm);
        // });

        this.alarmsClearTrueByDay = [];
        this.timePageLinkClearTrue.page = 0;
        this.groupAlarmDayCurrent[0].alarmChuaClear = [];
        this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
        this.groupAlarmDayCurrent[0].alarmDaXuLy = [];

        this.getAlarmsClearTrue(this.damTomId, null);
        this.getAlarmsVp(this.damTomId);
      }
    }
  }

  onFilter() {
    this.isFilterTime = !this.isFilterTime;
    if (!this.isFilterTime) {
      this.infiniteScroll.disabled = false;
      if (this.checkall) {
        this.alarmsClearTrueByDay = [];
        this.timePageLinkClearTrue.page = 0;
        this.timePageLinkClearTrue.startTime = null;
        this.timePageLinkClearTrue.endTime = null;
        this.groupAlarmDayCurrent[0].alarmChuaClear = [];
        this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
        this.groupAlarmDayCurrent[0].alarmDaXuLy = [];

        this.getAlarmsVp();
        this.getAlarmsClearTrue();
      } else {
        this.alarmsClearTrueByDay = [];
        this.timePageLinkClearTrue.page = 0;
        this.timePageLinkClearTrue.startTime = null;
        this.timePageLinkClearTrue.endTime = null;
        this.groupAlarmDayCurrent[0].alarmChuaClear = [];
        this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
        this.groupAlarmDayCurrent[0].alarmDaXuLy = [];

        this.getAlarmsVp(this.damTomId);
        this.getAlarmsClearTrue(this.damTomId, null);
      }
    }
  }
  filterDate(){
    this.isFilterDate = true;
  }
  // bắt sự kiện chuyển ngày
  async startDateChange(event: any) {
    this.fromDate = moment(new Date(event)).toDate().toISOString();
    this.isFilterDate = true;

    if (this.datesValid()) {
      // neu trong cung ngay hien tai
      if (moment(this.fromDate).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')) {
        // update api l5
        // loc alarm clear false
        this.infiniteScroll.disabled = true;
        this.alarmsClearTrueByDay = [];
        // this.groupAlarmDayCurrent[0].alarmChuaClear = [];
        // this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
        // this.groupAlarmDayCurrent[0].alarmDaXuLy = [];

        // if (this.checkall) {
        //   await this.getAlarmsVp('', moment(this.fromDate).valueOf(), moment(this.toDate).valueOf());
        //   await this.getAlarmsClearTrue();
        //   this.alarmsClearTrueByDay = [];
        // } else {
        //   await this.getAlarmsVp(this.damTomId, moment(this.fromDate).valueOf(), moment(this.toDate).valueOf());
        //   await this.getAlarmsClearTrue(this.damTomId);
        //   this.alarmsClearTrueByDay = [];
        // }
      }
      // trong cung ngay khac ngay hien tai
      else if (moment(this.fromDate).format('DD/MM/YYYY') === moment(this.toDate).format('DD/MM/YYYY')) {
        // reset ngay hien tai ve []
        this.groupAlarmDayCurrent[0].alarmChuaClear = [];
        this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
        this.groupAlarmDayCurrent[0].alarmDaXuLy = [];

        // truyen lai page va time lay du lieu alarm clear true
        this.timePageLinkClearTrue.page = 0;
        this.timePageLinkClearTrue.startTime = moment(this.fromDate).valueOf();
        this.timePageLinkClearTrue.endTime = moment(this.toDate).valueOf();
        this.alarmsClearTrueByDay = [];
        if (this.checkall) {
          this.getAlarmsClearTrue();
        } else {
          this.getAlarmsClearTrue(this.damTomId);
        }
      }
      // 1 khoang thoi gian
      else if (moment(this.fromDate).format('DD/MM/YYYY') !== moment(this.toDate).format('DD/MM/YYYY')){
        this.infiniteScroll.disabled = false;
        // update api l5
        // end date # now -> ko lay alarm now
        if (moment(this.toDate).format('DD/MM/YYYY') !== moment().format('DD/MM/YYYY')) {
          this.groupAlarmDayCurrent[0].alarmChuaClear = [];
          this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
          this.groupAlarmDayCurrent[0].alarmDaXuLy = [];
        }
        // co ngay hien tai
        else if (moment(this.toDate).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')){
          this.groupAlarmDayCurrent[0].alarmChuaClear = [];
          this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
          this.groupAlarmDayCurrent[0].alarmDaXuLy = [];
          this.getAlarmsVp();
        }
        this.timePageLinkClearTrue.page = 0;
        this.timePageLinkClearTrue.startTime = moment(this.fromDate).valueOf();
        this.timePageLinkClearTrue.endTime = moment(this.toDate).valueOf();
        this.alarmsClearTrueByDay = [];
        if (this.checkall) {
          this.getAlarmsClearTrue();
        } else {
          this.getAlarmsClearTrue(this.damTomId);
        }
      }
    }
  }
  async endDateChange(event: any) {
    this.isFilterDate = true;
    this.toDate = moment(new Date(event)).toDate().toISOString();

    if (this.datesValid()) {
      // neu trong cung ngay hien tai
      if (moment (this.fromDate).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')) {
        // update api l5
        // loc alarm clear false
        this.infiniteScroll.disabled = true;
        this.alarmsClearTrueByDay = [];
        // this.groupAlarmDayCurrent[0].alarmChuaClear = [];
        // this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
        // this.groupAlarmDayCurrent[0].alarmDaXuLy = [];

        // if (this.checkall) {
        //   await this.getAlarmsVp('', moment(this.fromDate).valueOf(), moment(this.toDate).valueOf());
        //   await this.getAlarmsClearTrue();
        //   this.alarmsClearTrueByDay = [];
        // } else {
        //   await this.getAlarmsVp(this.damTomId, moment(this.fromDate).valueOf(), moment(this.toDate).valueOf());
        //   await this.getAlarmsClearTrue(this.damTomId);
        //   this.alarmsClearTrueByDay = [];
        // }
      }
      // trong cung ngay khac ngay hien tai
      else if (moment(this.fromDate).format('DD/MM/YYYY') === moment(this.toDate).format('DD/MM/YYYY')) {
        // reset ngay hien tai ve []
        this.groupAlarmDayCurrent[0].alarmChuaClear = [];
        this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
        this.groupAlarmDayCurrent[0].alarmDaXuLy = [];

        // truyen lai page va time lay du lieu alarm clear true
        this.timePageLinkClearTrue.page = 0;
        this.timePageLinkClearTrue.startTime = moment(this.fromDate).valueOf();
        this.timePageLinkClearTrue.endTime = moment(this.toDate).valueOf();
        this.alarmsClearTrueByDay = [];
        if (this.checkall) {
          this.getAlarmsClearTrue();
        } else {
          this.getAlarmsClearTrue(this.damTomId);
        }
      }
      // 1 khoang thoi gian
      else if (moment(this.fromDate).format('DD/MM/YYYY') !== moment(this.toDate).format('DD/MM/YYYY')){
        this.infiniteScroll.disabled = false;
        // update api l5
        // end date # now -> ko lay alarm now
        if (moment(this.toDate).format('DD/MM/YYYY') !== moment().format('DD/MM/YYYY')) {
          this.groupAlarmDayCurrent[0].alarmChuaClear = [];
          this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
          this.groupAlarmDayCurrent[0].alarmDaXuLy = [];
        }
        // co ngay hien tai
        else if (moment(this.toDate).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')){
          this.groupAlarmDayCurrent[0].alarmChuaClear = [];
          this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
          this.groupAlarmDayCurrent[0].alarmDaXuLy = [];
          this.getAlarmsVp();
        }
        this.timePageLinkClearTrue.page = 0;
        this.timePageLinkClearTrue.startTime = moment(this.fromDate).valueOf();
        this.timePageLinkClearTrue.endTime = moment(this.toDate).valueOf();
        this.alarmsClearTrueByDay = [];
        if (this.checkall) {
          this.getAlarmsClearTrue();
        } else {
          this.getAlarmsClearTrue(this.damTomId);
        }
      }
    }
  }
  checkKeyAlarm(alarmKeys: string[], telemetryField: string) {
    if (alarmKeys === null || alarmKeys === undefined) {
      return false;
    }
    return alarmKeys.includes(telemetryField);
  }

  doRefresh(event) {
    setTimeout(() => {
      // this.ionViewWillEnter();
      if (!this.isFilterTime) {
        // update api l5
        this.groupAlarmDayCurrent[0].alarmChuaClear = [];
        this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
        this.groupAlarmDayCurrent[0].alarmDaXuLy = [];
        this.alarmsClearTrueByDay = [];
        this.timePageLinkClearTrue.page = 0;
        if (this.checkall) {
          this.getAlarmsVp();
          this.getAlarmsClearTrue('', event);
        } else {
          this.getAlarmsVp(this.damTomId);
          this.getAlarmsClearTrue(this.damTomId, event);
        }
        event.target.complete();
      } else {
        event.target.complete();
      }
    }, 1000);
  }

  datesValid() {
    return this.toDate > this.fromDate;
  }

  sliderClick() {
    this.selectHour = !this.selectHour;
    if (!this.isFilterDate){
      this.fromDate = moment().subtract(6, 'days').startOf('date').toISOString();
    }
  }
  xuLyAllCb() {
    this.alertController.create({
      header: 'Xử lý toàn bộ cảnh báo?',
      message: 'Toàn bộ cảnh báo sẽ được đánh dấu là đã xử lý.',
      buttons: [
        {
          text: 'Quay lại',
          role: 'Cancel'
        },
        {
          text: 'Xác nhận',
          handler: async () => {
            this.loadingCtrl.create({message: ''})
            .then(loadEl => {
              loadEl.present();
              this.giamsatService.clearAllCanhBao(this.damTomId).subscribe(() => {
                this.groupAlarmDayCurrent[0].alarmChuaClear = [];
                this.groupAlarmDayCurrent[0].alarmChuaXyLy = [];
                this.groupAlarmDayCurrent[0].alarmDaXuLy = [];
                this.alarmsClearTrueByDay = [];
                this.timePageLinkClearTrue.page = 0;
                if (this.checkall) {
                  this.getAlarmsVp();
                  this.getAlarmsClearTrue('', null);
                } else {
                  this.getAlarmsVp(this.damTomId);
                  this.getAlarmsClearTrue(this.damTomId, null);
                }
                loadEl.dismiss();
              }, error => {
                console.log('error xu ly canh bao', error);
                setTimeout(() => {
                  loadEl.dismiss();
                }, 500);
              });
            });
          }
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  userAckAlarm(alarm: AlarmHistory, time: number){
    if (alarm.clear) {
      this.loadingCtrl.create({ message: 'Xử lý cảnh báo...'})
      .then(loadEl => {
        loadEl.present();
        this.giamsatService.clearCanhBao(alarm.id).subscribe(() => {
          setTimeout(() => {
            alarm.ack = true;
            // xu ly alarm cac ngay khac ngay hien tai
            this.alarmsClearTrueByDay.forEach(day => {
              if (alarm.clearTime === time) {
                const alarmDelete = day.alarmChuaXyLy.indexOf(alarm);
                day.alarmChuaXyLy.splice(alarmDelete, 1);
                day.alarmDaXuLy.push(alarm);
              }
            });
            // xu ly alarm trong ngay hien tai
            if (this.groupAlarmDayCurrent[0].time === time) {
              const delAlarm = this.groupAlarmDayCurrent[0].alarmChuaXyLy.indexOf(alarm);
              this.groupAlarmDayCurrent[0].alarmChuaXyLy.splice(delAlarm, 1);
              this.groupAlarmDayCurrent[0].alarmDaXuLy.push(alarm);
            }
            loadEl.dismiss();
          }, 500);
        }, err => {
          setTimeout(() => {
            loadEl.dismiss();
          }, 500);
        });
  
      });
    } else {
      return;
    }
  }

  async ackByUser(alarm: AlarmHistory, time: number) {
    // const promise = new Promise((res, rej) => {
    //   this.loadingCtrl
    //       .create({
    //         message: 'Xử lý cảnh báo...',
    //       })
    //       .then((loadingEl) => {
    //         loadingEl.present();
    //         // tslint:disable-next-line: deprecation
    //         this.giamsatService.clearCanhBao(listAC.id).subscribe(() => {
    //           loadingEl.dismiss();
    //         }, err => {
    //           loadingEl.dismiss();
    //         });
    //       });
    // });
    // await promise.then(() => {
    //   this.dsDuLieuCamBien = [];
    //   this.listAlarmCheck = [];
    //   this.listAlarmByDay = [];
    // });
  }

  convertSecondtoTime(secs) {
    const day = moment(new Date(secs))
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0)
        .valueOf();
    return day;
  }
  convertWeekDay(timeMs: number): string{
    let day: string;
    const date = new Date(timeMs);
    switch (date.getDay()) {
      case 0:
        return day = 'Chủ nhật';
        break;
      case 1:
        return day = 'Thứ 2';
        break;
      case 2:
        return day = 'Thứ 3';
        break;
      case 3:
        return day = 'Thứ 4';
        break;
      case 4:
        return day = 'Thứ 5';
        break;
      case 5:
        return day = 'Thứ 6';
        break;
      case 6:
        return day = 'Thứ 7';
        break;
      default:
        return day = moment(timeMs).format('DD/MM/YYYY');
    }
    return day;
  }
  convertDateToWord(timeMs: number): string{
    if (moment().format('DD/MM/YYYY') === moment(timeMs).format('DD/MM/YYYY')){
      return 'Hôm nay';
    }else if (moment().subtract(1, 'days').format('DD/MM/YYYY') === moment(timeMs).format('DD/MM/YYYY')){
      return 'Hôm qua';
    }else{
      return moment(timeMs).format('DD/MM/YYYY');
    }
  }

  toggleAccordion(time: number) {
    if (time === this.groupAlarmDayCurrent[0]?.time){
      this.groupAlarmDayCurrent[0].toggleAccordion = !this.groupAlarmDayCurrent[0].toggleAccordion;
      return;
    }
    this.alarmsClearTrueByDay.forEach(alarmDay => {
      if (alarmDay.time === time) {
        alarmDay.toggleAccordion = !alarmDay.toggleAccordion;
      }
    });
  }

  // show filter time
  async filterAlarmVp(ev) {
    this.isFilterAlarmVp = !this.isFilterAlarmVp;
    if (this.isFilterAlarmVp) {
      this.daysAlarmV4 .forEach(day => {
        day.listAlarm = day.listAlarm.filter(alarm => alarm.clear === false);
      });
      this.daysAlarmV4 = this.daysAlarmV4.filter(day => day.listAlarm.length > 0);
      // console.log(this.daysAlarmV4);
    } else {
      this.startTime = moment().startOf('date').toISOString();
      this.daysAlarmV4 = [];
      for (let i = 0; i <= 6 ; i ++) {
        const dayAlarm: DayAlarmV4 = {
          time: moment(this.startTime).valueOf(),
          listAlarm: [],
          toggleAccordion: true,
          startTimeOfDay: this.startTime,
          endTimeOfDay: moment(this.startTime).add(1, 'days').subtract(1, 'minute').toISOString()
        };
        dayAlarm.timePageLink = new TimePageLink(
          10,
          0,
          '',
          null,
          Date.parse(dayAlarm.startTimeOfDay),
          Date.parse(dayAlarm.endTimeOfDay)
        );
        this.daysAlarmV4.push(dayAlarm);
        this.startTime = moment(this.startTime).subtract(1, 'days').toISOString();
      }
      if (this.checkall) {
        this.daysAlarmV4.forEach(dayAlarm => {
          this.getAlarmsUpdateV4('', dayAlarm.timePageLink, dayAlarm);
        });
        // console.log('all', this.daysAlarmV4);
      } else {
        this.daysAlarmV4.forEach(dayAlarm => {
          this.getAlarmsUpdateV4(this.damTomId, dayAlarm.timePageLink, dayAlarm);
        });
        // console.log('dam tom', this.damTomId, this.daysAlarmV4);
      }
    }
  }

  // btn scroll top
  goTop(){
    this.content.scrollToTop(0);
  }
  logScrolling(event){
    if (event.detail.scrollTop === 0){
      this.isGoTop = false;
    }
    else {
      this.isGoTop = true;
    }
  }
}
