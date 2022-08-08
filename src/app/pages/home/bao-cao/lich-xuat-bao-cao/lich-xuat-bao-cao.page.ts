
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { ReportNameMap, ReportScheduleService } from 'src/app/core/services/report-schedule.service';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction, SortOrder } from 'src/app/shared/models/page/sort-order';
import { ReportSchedule } from 'src/app/shared/models/report-schedule.model';

@Component({
  selector: 'app-lich-xuat-bao-cao',
  templateUrl: './lich-xuat-bao-cao.page.html',
  styleUrls: ['./lich-xuat-bao-cao.page.scss'],
})
export class LichXuatBaoCaoPage implements OnInit {

  // Event của infinite scroll để kiểm soát trạng thái load
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;


  message = 'Không có dữ liệu';
  isLoading = false;
  constructor(private reportSheduleService: ReportScheduleService,
              private router: Router) { }

  pageLink: PageLink;
  sortOrder: SortOrder;

  /**
   * viettd
   * constant report name
   */
  reportNameMap = ReportNameMap;

  reportScheduleList: ReportSchedule[] = [];
  isGoTop = false;
  @ViewChild(IonContent) gotoTop: IonContent;
  ngOnInit() {
  }

  ionViewWillEnter() {
    this.infiniteScroll.disabled = false;
    this.isLoading = true;
    this.reportScheduleList = [];
    // sap xep theo thu tu thoi gian tao
    this.sortOrder = {
      property: 'createdTime',
      direction: Direction.DESC
    };
    this.pageLink = new PageLink(10, 0, '', this.sortOrder);
    this.initData();
  }

  initData() {
    this.fetchData();
  }

  fetchData(event?) {
    this.reportSheduleService.getListReportSchedule(this.pageLink).subscribe(
      (pageData: PageData<ReportSchedule>) => {
        if (!!pageData) {
          this.reportScheduleList = this.reportScheduleList.concat(pageData.data);
          if (!!event) {
            if (event.type === 'ionInfinite') {
              event.target.complete();
            }
          }
          if (!pageData.hasNext) {
            this.infiniteScroll.disabled = true;
          }
        }
        else {
          this.message = 'Chưa có vai trò nào !';
        }
        this.isLoading = false;
      },
      err => {
        this.message = 'Có lỗi xảy ra !';
        this.isLoading = false;
      }
    );
  }


  /**
   * @author viettd
   * convert cron to repeat name ,
   * ex : '00 16 * * *' day
   * ex : '00 15 15 * *' month
   * ex : '00 * * * 6' week
   * cron
   * repeat name
   */
  convertCronToRepeatName(cron: string) {
    const [second, minutes, hour, day, month, week] = cron.split(' ');
    let repeat;
    if (day === '*' && month === '*' && week === '*') {
      repeat = 'Ngày';
    }
    else if (month === '*' && week === '*' && day !== '*') {
      repeat = 'Tháng';
    }
    else if (month === '*' && day === '*' && week !== '*') {
      repeat = 'Tuần';
    }
    return repeat;

  }

  /**
   * @author viettd
   * get value tu reportNameMap
   *  key
   * @returns object entries
   */
  getTenBaoCao(key: string) {
    return this.reportNameMap.find(entries =>
      entries.key === key
    );
  }

  loadMore(e) {
    this.pageLink.page++;
    this.fetchData(e);
  }

  toggleClick(event: any, reportSchedule: any){
    this.reportSheduleService.activeLichXuatBaoCao(reportSchedule.id, event.detail.checked).subscribe(res => {
    });
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
