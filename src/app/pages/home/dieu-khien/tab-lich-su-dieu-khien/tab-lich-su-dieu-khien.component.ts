import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AlertController, IonInfiniteScroll } from '@ionic/angular';
import * as moment from 'moment';
import { catchError, finalize, map } from 'rxjs/operators';
import { DieuKhienService } from 'src/app/core/services/dieu-khien.service';
import { LichSuDK } from 'src/app/shared/models/dieukhien.model';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import { GroupHistoryByDay } from '../dieu-khien.page';

@Component({
  selector: 'app-tab-lich-su-dieu-khien',
  templateUrl: './tab-lich-su-dieu-khien.component.html',
  styleUrls: ['./tab-lich-su-dieu-khien.component.scss'],
})
export class TabLichSuDieuKhienComponent implements OnInit, OnChanges {
  @Input() damTomId: string;
  @Input()  deviceID: string;
  @Input() fromDate: any;
  @Input() toDate: any;
  @Input() segment: number;
  @Output() countLichSu = new EventEmitter<number>();
  isLoading = true;
  infiniteLoad = false;
  isWantFilterByDevice = false;
  // 26/8 sua tam thanh true
  isWantFilterByTime = true;
  countNewHistory = 0;
  pageLink: PageLink;
  sortOrder;
  lstLichsu: GroupHistoryByDay[] = [];
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  constructor(
    private dieuKhienService: DieuKhienService,
    public alertController: AlertController,
  ) {}

  ngOnInit() {
    this.sortOrder = {
      property: 'commandTime',
      direction: Direction.DESC,
    };
    this.pageLink = new PageLink(10, 0, '', this.sortOrder);
  }
  async ngOnChanges(change: SimpleChanges){
    if (this.segment !== 3){
      return;
    }
    if (!this.datesValid()){
      return;
    }
    this.isLoading = true;
    if (!this.damTomId) {
      this.isLoading = false;
      return;
    }
    if (this.deviceID === 'all') {
      this.isWantFilterByDevice = false;
    }
    else{
      this.isWantFilterByDevice = true;
    }
    this.lstLichsu = [];
    if (this.infiniteScroll != null){
      this.infiniteScroll.disabled = false;
    }
    // set lại trang bắt đầu = 0;
    if (this.pageLink != null){
      this.pageLink.page = 0;
      this.fetchData();
    }
  }
  preLoadData() {
    if (!this.damTomId) {
      this.isLoading = false;
      return;
    }
    // Khai bao form
    this.lstLichsu = [];
    this.infiniteScroll.disabled = false;
    // this.isWantFilterByTime = false;
    // 26/8 sua tam thanh true
    this.isWantFilterByTime = true;
    // set lại trang bắt đầu = 0;
    this.pageLink.page = 0;
    this.fetchData();
  }

  // Các hàm get
  getLstLichSu(): GroupHistoryByDay[] {
    return this.lstLichsu;
  }
  // getLstRpcZone(): DeviceRpcZone[] {
  //   return this.lstRpcZone;
  // }

  // Các hàm set
  // setLstRpcZone(data) {
  //   // kiểm tra nếu dữ liệu thay đổi thì mới cập nhật
  //   if (!arrayEqual(data, this.lstRpcZone)) {
  //     this.lstRpcZone = data;
  //   }
  // }
  /* Cái set lịch sử này sẽ hơi khác vì nó trả về dạng page - So sánh phần tử đầu tiên
  Nếu data[0] khác với lstLichSu[0] (Tức là đã có lịch sử mới)
  thì mới cập nhật lại danh sách lịch sử
  Edit by ChuongNV
  */
  checkBeforeSetLstLichsu(data) {
    if (this.lstLichsu.length === 0) {
      return false;
    } else if (
      this.lstLichsu[0].dataHistory[0].commandTime === data?.commandTime
    ) {
      return true; // Dữ liệu không thay đổi
    } else {
      return false; // Dữ liệu có thay đổi
    }
  }

  getFirstPageLichSu() {
    const pageLinkOnePage = new PageLink(10, 0, '', this.sortOrder);
    return this.dieuKhienService
      .getListLichSu(this.damTomId, pageLinkOnePage, null, Date.parse(this.fromDate).toString(),
      Date.parse(this.toDate).toString())
      .toPromise();
  }
  // Get lich su
  fetchData(event?) {
    if (!this.isWantFilterByDevice && !this.isWantFilterByTime) {
      let index = 0;
      this.dieuKhienService
        .getListLichSu(this.damTomId, this.pageLink)
        .pipe(
          map((pageData: PageData<LichSuDK>) => {
            if (pageData.data.length >= 1) {
              pageData.data.forEach((e) => {
                e.isWantShow = false;
                const timeCompare = this.convertSecondtoTime(e.commandTime);
                this.lstLichsu.forEach((el) => {
                  if (el === this.lstLichsu[this.lstLichsu.length - 1]) {
                    if (el.time === timeCompare) {
                      el.dataHistory.push(e);
                    } else {
                      index += 1;
                    }
                  }
                });
                if (this.lstLichsu[index] === undefined) {
                  this.lstLichsu[index] = {
                    time: 0,
                    dataHistory: [],
                  };
                  this.lstLichsu[index].time =
                    this.convertSecondtoTime(timeCompare);
                  this.lstLichsu[index].dataHistory.push(e);
                }
                if (event !== undefined) {
                  if (event.type === 'ionInfinite') {
                    event.target.complete();
                  }
                }
                // Check Page has next
                if (pageData.hasNext === false) {
                  this.infiniteScroll.disabled = true;
                }
              });
              this.isLoading = false;
            } else {
              this.infiniteScroll.disabled = true;
              this.isLoading = false;
            }
          }),
          finalize(() => {
            this.isLoading = false;
          }),
          catchError((error) => {
            this.lstLichsu.length = 0;
            return null;
          })
        )
        .subscribe();
    } else if (this.isWantFilterByDevice && !this.isWantFilterByTime) {
      let index = 0;
      this.dieuKhienService
        .getListLichSu(this.damTomId, this.pageLink, this.deviceID)
        .pipe(
          map((pageData: PageData<LichSuDK>) => {
            if (pageData.data.length >= 1) {
              pageData.data.forEach((e) => {
                e.isWantShow = false;
                const timeCompare = this.convertSecondtoTime(e.commandTime);
                this.lstLichsu.forEach((el) => {
                  if (el === this.lstLichsu[this.lstLichsu.length - 1]) {
                    if (el.time === timeCompare) {
                      el.dataHistory.push(e);
                    } else {
                      index += 1;
                    }
                  }
                });
                if (this.lstLichsu[index] === undefined) {
                  this.lstLichsu[index] = {
                    time: 0,
                    dataHistory: [],
                  };
                  this.lstLichsu[index].time =
                    this.convertSecondtoTime(timeCompare);
                  this.lstLichsu[index].dataHistory.push(e);
                }
                if (event !== undefined) {
                  if (event.type === 'ionInfinite') {
                    event.target.complete();
                  }
                }
                // Check Page has next
                if (pageData.hasNext === false) {
                  this.infiniteScroll.disabled = true;
                }
              });
              this.isLoading = false;
            } else {
              this.infiniteScroll.disabled = true;
              this.isLoading = false;
            }
          }),
          finalize(() => {
            this.isLoading = false;
          }),
          catchError((error) => {
            this.lstLichsu.length = 0;
            return null;
          })
        )
        .subscribe();
    } else if (!this.isWantFilterByDevice && this.isWantFilterByTime) {
      let index = 0;
      if (this.datesValid()) {
        this.dieuKhienService
          .getListLichSu(
            this.damTomId,
            this.pageLink,
            null,
            Date.parse(this.fromDate).toString(),
            Date.parse(this.toDate).toString()
          )
          .pipe(
            map((pageData: PageData<LichSuDK>) => {
              if (pageData.data.length >= 1) {
                pageData.data.forEach((e) => {
                  e.isWantShow = false;
                  const timeCompare = this.convertSecondtoTime(e.commandTime);
                  this.lstLichsu.forEach((el) => {
                    if (el === this.lstLichsu[this.lstLichsu.length - 1]) {
                      if (el.time === timeCompare) {
                        el.dataHistory.push(e);
                      } else {
                        index += 1;
                      }
                    }
                  });
                  if (this.lstLichsu[index] === undefined) {
                    this.lstLichsu[index] = {
                      time: 0,
                      dataHistory: [],
                    };
                    this.lstLichsu[index].time =
                      this.convertSecondtoTime(timeCompare);
                    this.lstLichsu[index].dataHistory.push(e);
                  }
                  if (event !== undefined) {
                    if (event.type === 'ionInfinite') {
                      event.target.complete();
                    }
                  }
                  // Check Page has next
                  if (pageData.hasNext === false) {
                    this.infiniteScroll.disabled = true;
                  }
                });
                this.isLoading = false;
              } else {
                this.infiniteScroll.disabled = true;
                this.isLoading = false;
              }
            }),
            finalize(() => {
              this.isLoading = false;
            }),
            catchError((error) => {
              this.lstLichsu.length = 0;
              return null;
            })
          )
          .subscribe();
      } else {
        this.isLoading = false;
        this.infiniteScroll.disabled = true;
      }
    } else {
      let index = 0;
      if (this.datesValid()) {
        this.dieuKhienService
          .getListLichSu(
            this.damTomId,
            this.pageLink,
            this.deviceID,
            Date.parse(this.fromDate).toString(),
            Date.parse(this.toDate).toString()
          )
          .pipe(
            map((pageData: PageData<LichSuDK>) => {
              if (pageData.data.length >= 1) {
                pageData.data.forEach((e) => {
                  e.isWantShow = false;
                  const timeCompare = this.convertSecondtoTime(e.commandTime);
                  this.lstLichsu.forEach((el) => {
                    if (el === this.lstLichsu[this.lstLichsu.length - 1]) {
                      if (el.time === timeCompare) {
                        el.dataHistory.push(e);
                      } else {
                        index += 1;
                      }
                    }
                  });
                  if (this.lstLichsu[index] === undefined) {
                    this.lstLichsu[index] = {
                      time: 0,
                      dataHistory: [],
                    };
                    this.lstLichsu[index].time =
                      this.convertSecondtoTime(timeCompare);
                    this.lstLichsu[index].dataHistory.push(e);
                  }
                  if (event !== undefined) {
                    if (event.type === 'ionInfinite') {
                      event.target.complete();
                    }
                  }
                  // Check Page has next
                  if (pageData.hasNext === false) {
                    this.infiniteScroll.disabled = true;
                  }
                });
                this.isLoading = false;
              } else {
                this.infiniteScroll.disabled = true;
                this.isLoading = false;
              }
            }),
            finalize(() => {
              this.isLoading = false;
            }),
            catchError((error) => {
              this.lstLichsu.length = 0;
              return null;
            })
          )
          .subscribe();
      } else {
        this.isLoading = false;
        this.infiniteScroll.disabled = true;
      }
    }
    this.getCountLsNew();
  }
  readAll(timeInput){
    const timeConvert = timeInput - (timeInput % 86400000) - 25200000;
    // tslint:disable-next-line: max-line-length
    this.dieuKhienService.viewAllHistory(this.damTomId, timeConvert.toString(), timeInput.toString()).subscribe((res) => {
      this.getCountLsNew();
      this.lstLichsu.forEach(e => {
        e.dataHistory.forEach(el => {
          el.viewed = true;
        });
      });
    });
  }

  // Load thêm data khi kéo xuống dưới
  loadMore(e) {
    if (this.pageLink.page !== undefined) {
      this.pageLink.page++;
    }
    this.infiniteLoad = true;
    this.fetchData(e);
    // this.getCountLsNew();
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
  getCountLsNew() {
    this.dieuKhienService.getCountNewLs(this.damTomId).subscribe((res) => {
      this.countNewHistory = res;
      this.countLichSu.emit(this.countNewHistory);
    });
  }
  datesValid() {
    return Date.parse(this.toDate) > Date.parse(this.fromDate);
  }
  // 26/8/2021 by ChuongNv
  getCommandStatus(commandStatus: string): string {
    switch (commandStatus) {
      case 'NEW':
        return 'Đang chờ';
      case 'EXECUTING':
        return 'Đang thực thi';
      case 'SUCCESS':
        return 'Thành công';
      case 'TIMEOUT':
        return 'Thất bại';
      case 'NO_ACTIVE_CONNECTION':
        return 'Thất bại';
      case 'EXCEPTION':
        return 'Thất bại';
      case 'CANCEL':
        return 'Bị hủy bỏ';
      case 'CANCEL_SAME_STATUS':
        return 'Trùng trạng thái hiện tại';
      case 'CANCEL_INACTIVE_SCHEDULE':
        return 'Bị hủy bỏ';
      case 'CANCEL_INACTIVE_ALAMRPC':
        return 'Bị hủy bỏ';
      case 'CANCEL_TIME_EXPRIED':
        return 'Hết hạn';
      case 'RETRY_1':
        return 'Đang thực thi';
      case 'RETRY_2':
        return 'Đang thực thi';
      case 'RETRY_3':
        return 'Đang thực thi';
      case 'RETRY_4':
        return 'Đang thực thi';
      case 'RETRY_5':
        return 'Đang thực thi';
      default:
        return 'Không xác định';
    }
  }
  displayTypeControl(origin: number){
    switch (origin) {
      case 1:
        return 'Thủ công';
      case 2:
        return 'Nhóm điều khiển';
      case 3:
      case 6:
        return 'Tự động';
      case 4:
      case 7:
        return 'Hẹn giờ';
      case 5: 
        return 'Điều khiển rèm';
      default:
        break;
    }
  }
  convertRemAction(action: string) {
    switch (action) {
      case 'PUSH':
        return ' rải rèm';
      case 'PULL': 
        return ' thu rèm';
      case 'STOP':
        return ' dừng';
      default:
        return '';
    }
  }

  convertPercentRem(remId: string, rpcRemStatus: number, remAction: string) {
    if (remId == null || remAction == 'STOP') return '';
    return ` tới mức ${rpcRemStatus}%`;
  }
}
