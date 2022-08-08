import { Component, OnInit, ViewChild } from '@angular/core';
import { UserLog } from '../../../../shared/models/user-log.model';
import { LichSuTruyCapService } from '../../../../core/services/lich-su-truy-cap.service';
import { TimePageLink } from '../../../../shared/models/page/page-link';
import { map } from 'rxjs/operators';
import { PageData } from '../../../../shared/models/page/page-data';
import * as moment from 'moment';
import { IonContent, IonInfiniteScroll, IonSearchbar } from '@ionic/angular';
import { Direction } from '../../../../shared/models/page/sort-order';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-lich-su-truy-cap',
  templateUrl: './lich-su-truy-cap.page.html',
  styleUrls: ['./lich-su-truy-cap.page.scss'],
})
export class LichSuTruyCapPage implements OnInit {
  constructor(
    private lichSuTryCapService: LichSuTruyCapService,
    private fb: FormBuilder
  ) { }
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  @ViewChild(IonContent) gotoTop: IonContent;
  selectHour = false;
  isGoTop = false;
  toDate = moment().toISOString();
  fromDate = moment(new Date()).startOf('date').toDate().toISOString();
  listEntityType = [
    { value: 'selectAll', display: 'Tất cả' },
    { value: 'USER', display: 'Tài khoản' },
    { value: 'ROLE', display: 'Vai trò' },
    { value: 'DAM_TOM', display: 'Nhà vườn' },
    { value: 'DEVICE', display: 'Thiết bị' },
    { value: 'GATEWAY', display: 'Bộ thiết bị' },
    { value: 'ALARM', display: 'Cảnh báo' },
    { value: 'CAMERA', display: 'Camera' },
    { value: 'ALARM_RULE', display: 'Luật cảnh báo' },
    { value: 'GROUP_RPC', display: 'Bộ điều khiển' },
    { value: 'REPORT_SCHEDULE', display: 'Lịch xuất báo cáo' },
  ];

  form: FormGroup;

  currentDate = moment(new Date()).add(7, 'hours').toISOString();
  isLoading = false;
  timePageLink: TimePageLink;
  listUserLogs: UserLog[] = [];
  message = 'Không có dữ liệu!';
  changeType: string;
  isSelectAllEntity = true;
  sortOrder = {
    property: 'createdTime',
    direction: Direction.DESC,
  };

  keySearch = '';

  customActionSheetOptions: any = {
    header: 'Loại đối tượng',
    cssClass: 'my-custom-action-sheet',
  };

  ngOnInit() {
    this.form = this.fb.group({
      selectEntityType: ['selectAll'],
    });
  }

  ionViewWillEnter() {
    this.searchbar.value = '';
    // this.toDate = new Date().toISOString();
    // this.fromDate = moment(new Date()).startOf('date').toDate().toISOString();

    if (this.form.get('selectEntityType').value !== 'selectAll') {
      this.form = this.fb.group({
        selectEntityType: ['selectAll'],
      });
      return;
    } else {
      // enabled lai scroll de goi load more
      if (this.infiniteScroll !== undefined) {
        this.infiniteScroll.disabled = false;
      }
      this.isLoading = true;
      this.listUserLogs = [];
      this.timePageLink = new TimePageLink(
        10,
        0,
        this.keySearch,
        this.sortOrder,
        Date.parse(this.fromDate),
        Date.parse(this.toDate)
      );
      this.getUserLogs('', this.isSelectAllEntity, this.changeType);

    }
  }

  public changeEntityType(event: any) {
    this.listUserLogs = [];
    // enabled lai scroll de goi load more
    if (this.infiniteScroll !== undefined) {
      this.infiniteScroll.disabled = false;
    }
    if (event.detail.value === 'selectAll') {
      this.isSelectAllEntity = true;
      this.timePageLink = new TimePageLink(
        10,
        0,
        this.keySearch,
        this.sortOrder,
        Date.parse(this.fromDate),
        Date.parse(this.toDate)
      );
    } else {
      this.isSelectAllEntity = false;
      this.changeType = event.target.value;
      this.timePageLink = new TimePageLink(
        10,
        0,
        this.keySearch,
        this.sortOrder,
        Date.parse(this.fromDate),
        Date.parse(this.toDate)
      );
    }
    this.getUserLogs(event, this.isSelectAllEntity, this.changeType);
  }

  public getUserLogs(event, isSelectAll: boolean, entityType: string) {
    if (isSelectAll) {
      this.lichSuTryCapService
        .getUserLogsByDate(this.timePageLink)
        .pipe(
          map((pageData: PageData<UserLog>) => {
            if (pageData !== null) {
              if (pageData.data.length > 0) {
                this.listUserLogs = this.listUserLogs.concat(pageData.data);
                this.listUserLogs.forEach(data => {
                  // tslint:disable-next-line: max-line-length
                  if (data.actionData.entity?.email && data.actionData.entity?.lastName && data.actionData.entity?.email.includes(data.actionData.entity.lastName)) {
                    data.entityName = data.entityName.split('@')[0];
                  }
                });
                if (pageData.hasNext === false) {
                  this.infiniteScroll.disabled = true;
                }
              }
            }
            return pageData;
          })
        )
        .subscribe(
          (resData) => {
            if (resData.data.length === 0) {
              this.message = 'Không có dữ liệu!';
            }
          },
          (error) => {
            this.message = 'Có lỗi xảy ra!';
            this.isLoading = false;
            this.listUserLogs.length = 0;
          },
          () => {
            this.isLoading = false;
            if (event !== undefined) {
              if (event.type === 'ionInfinite') {
                event.target.complete();
              }
            }
          }
        );
    } else {
      if (this.changeType !== 'selectAll') {
        this.lichSuTryCapService
          .getUserLogsByEntityType(entityType, this.timePageLink)
          .pipe(
            map((pageData: PageData<UserLog>) => {
              if (pageData !== null) {
                if (pageData.data.length > 0) {
                  this.listUserLogs = this.listUserLogs.concat(pageData.data);
                  this.listUserLogs.forEach(data => {
                    // tslint:disable-next-line: max-line-length
                    if (data.actionData.entity?.email && data.actionData.entity?.lastName && data.actionData.entity?.email.includes(data.actionData.entity.lastName)) {
                      data.entityName = data.entityName.split('@')[0];
                    }
                  });
                  if (pageData.hasNext === false) {
                    this.infiniteScroll.disabled = true;
                  }
                }
              }
              return pageData;
            })
          )
          .subscribe(
            (resData) => {
              if (resData.data.length === 0) {
                this.message = 'Không có dữ liệu!';
              }
            },
            (error) => {
              this.message = 'Có lỗi xảy ra!';
              this.listUserLogs.length = 0;
              this.isLoading = false;
            },
            () => {
              if (event !== undefined) {
                if (event.type === 'ionInfinite') {
                  event.target.complete();
                }
              }
              this.isLoading = false;
            }
          );
      }
    }
  }
  // load more data when scroll
  public loadMore(event) {
    this.timePageLink.page++;
    this.getUserLogs(event, this.isSelectAllEntity, this.changeType);
  }
  searchUsersLog(event) {
    // Enabled scroll load more event
    this.infiniteScroll.disabled = false;
    this.keySearch = event.detail.value;

    this.timePageLink = new TimePageLink(
      10,
      0,
      this.keySearch,
      this.sortOrder,
      Date.parse(this.fromDate),
      Date.parse(this.toDate)
    );
    if (this.keySearch && this.keySearch.trim() !== '') {
      this.listUserLogs = [];
      this.timePageLink.textSearch = this.keySearch;
      this.getUserLogs(event, this.isSelectAllEntity, this.changeType);
    } else {
      this.listUserLogs = [];
      this.timePageLink.textSearch = '';
      this.getUserLogs(event, this.isSelectAllEntity, this.changeType);
    }
  }
  convertEntityType(entityType: string) {
    let result: string;
    switch (entityType) {
      case 'USER':
        result = 'Tài khoản';
        break;
      case 'ROLE':
        result = 'Vai trò';
        break;
      case 'DAM_TOM':
        result = 'Nhà vườn';
        break;
      case 'DEVICE':
        result = 'Thiết bị';
        break;
      case 'GATEWAY':
        result = 'Bộ thiết bị';
        break;
      case 'ALARM':
        result = 'Cảnh báo';
        break;
      case 'CAMERA':
        result = 'Camera';
        break;
      case 'ALARM_RULE':
        result = 'Luật cảnh báo ';
        break;
      case 'GROUP_RPC':
        result = 'Bộ điều khiển';
        break;
      case 'REPORT_SCHEDULE':
        result = 'Lịch xuất báo cáo';
        break;
      default:
        result = entityType;
    }
    return result;
  }
  convertActionType(actionType: string) {
    let result: string;
    switch (actionType) {
      case 'ADDED':
        result = 'Thêm mới';
        break;
      case 'DELETED':
        result = 'Xóa';
        break;
      case 'UPDATED':
        result = 'Cập nhật';
        break;
      case 'LOGIN':
        result = 'Đăng nhập';
        break;
      case 'LOGOUT':
        result = 'Đăng xuất';
        break;
      case 'RPC_CALL':
        result = 'Điều khiển thiết bị';
        break;
      case 'ALARM_CLEAR':
        result = 'Xử lí cảnh báo';
        break;
      default:
        result = actionType;
    }
    return result;
  }
  convertActionStatus(actionStatus: string) {
    let result: string;
    switch (actionStatus) {
      case 'SUCCESS':
        result = 'Thành công';
        break;
      case 'FAILURE':
        result = 'Thất bại';
        break;
      default:
        result = actionStatus;
    }
    return result;
  }

  // dungnd update
  sliderClick() {
    this.selectHour = !this.selectHour;
    // this.fromDate = moment(new Date()).startOf('date').toDate().toISOString();
    // this.toDate = new Date().toISOString();
  }
  datesValid() {
    return this.toDate > this.fromDate;
  }

  // bắt sự kiện chuyển ngày
  toDateChange(event: any) {
    this.toDate = moment(new Date(event)).toDate().toISOString();
    if (this.datesValid()) {
      // enabled lai scroll de goi load more
      if (this.infiniteScroll !== undefined) {
        this.infiniteScroll.disabled = false;
      }
      this.listUserLogs = [];
      this.timePageLink = new TimePageLink(
        10,
        0,
        this.keySearch,
        this.sortOrder,
        Date.parse(this.fromDate),
        Date.parse(this.toDate)
      );
      this.getUserLogs(event, this.isSelectAllEntity, this.changeType);
    }
  }
  fromDateChange(event: any) {
    this.fromDate = moment(new Date(event)).toDate().toISOString();
    if (this.datesValid()) {
      // enabled lai scroll de goi load more
      if (this.infiniteScroll !== undefined) {
        this.infiniteScroll.disabled = false;
      }
      this.listUserLogs = [];
      this.timePageLink = new TimePageLink(
        10,
        0,
        this.keySearch,
        this.sortOrder,
        Date.parse(this.fromDate),
        Date.parse(this.toDate)
      );
      this.getUserLogs(event, this.isSelectAllEntity, this.changeType);
    }
  }

  convertTiengViet(entityType: string) {
    let result: string;
    switch (entityType) {
      case 'Monday':
        result = 'Thứ hai';
        break;
      case 'Tuesday':
        result = 'Thứ ba';
        break;
      case 'Wednesday':
        result = 'Thứ tư';
        break;
      case 'Thursday':
        result = 'Thứ năm';
        break;
      case 'Friday':
        result = 'Thứ sáu';
        break;
      case 'Saturday':
        result = 'Thứ bảy';
        break;
      case 'Sunday':
        result = 'Chủ nhật';
        break;
      default:
        result = entityType;
    }
    return result;
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
  transformThu(dateInput: number) {
    const datePipe = new DatePipe('en-US');
    const result = datePipe.transform(dateInput, 'EEEE');
    return result;
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

  // chuyển sang chế độ dark mode
  switchMode() {
    const darkMode = document.body.getAttribute('color-theme');
    if (darkMode === 'dark') {
      document.body.setAttribute('color-theme', 'light');
    } else {
      document.body.setAttribute('color-theme', 'dark');
    }
  }

  // hàm refresh lại trang khi scroll top
  doRefresh(event) {
    setTimeout(() => {
      this.toDate = moment().toISOString();
      this.ionViewWillEnter();
      event.target.complete();
    }, 1000);
  }
}
