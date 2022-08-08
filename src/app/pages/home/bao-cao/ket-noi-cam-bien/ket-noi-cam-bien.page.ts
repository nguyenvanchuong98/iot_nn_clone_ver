import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaoCaoService } from 'src/app/core/services/bao-cao.service';
import { ReportSingleData } from 'src/app/shared/models/report.model';
import { DamTomSchedule, ReportScheduleService } from 'src/app/core/services/report-schedule.service';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import { IonContent } from '@ionic/angular';
import { QuantridamtomService } from '../../../../core/services/quantridamtom.service';

@Component({
  selector: 'app-ket-noi-cam-bien',
  templateUrl: './ket-noi-cam-bien.page.html',
  styleUrls: ['./ket-noi-cam-bien.page.scss'],
})
export class KetNoiCamBienPage implements OnInit {

  constructor(
    private fb: FormBuilder,
    private baoCaoService: BaoCaoService,
    private reportScheduleService: ReportScheduleService,
    private quanTriDamTomService: QuantridamtomService
  ) { }
  @ViewChild(IonContent) gotoTop: IonContent;
  isGoTop = false;
  chartOption;
  form: FormGroup;
  now = new Date().toISOString();
  isLoading = true;
  fiveDayAgo = new Date();
  hasData = false;
  isDataEqual0 = true;
  // Data
  data = { data: [], type: 'bar', name: '', barMaxWidth: 40, barGap: '100%' };
  chartData: any[] = [];
  chartLabels: any[] = [''];
  tableSource;
  invalidDate = false;
  maxFromTo: string = new Date().toISOString();
  sortOrder = {
    property: 'createdTime',
    direction: Direction.DESC
  };
  isDamTomLoading = false;
  isPageLoading;
  damTomList: DamTomSchedule[] = [];
  pageLink: PageLink = new PageLink(100, 0, '', this.sortOrder);
  selectHour = false;
  customActionSheetOptions: any = {
    header: 'Chọn Nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };
  initlabel = ['Số lần mất kết nối'];
  async validateDay() {
    const dateF = new Date(this.form.get('dateTo').value);
    dateF.setDate(dateF.getDate() /*- 1*/);

    const dateFrom = this.form.get('dateFrom').value;
    const dateTo = this.form.get('dateTo').value;
    this.maxFromTo = dateF.toISOString();
    if (dateTo < dateFrom) {
      // tslint:disable-next-line: triple-equals
      if (dateTo.split('T')[0] != dateFrom.split('T')[0]) {
        this.invalidDate = true;
        return;
      }

    }
    this.invalidDate = false;
    let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
    startTs.setHours(0, 0, 0, 0);
    startTs = (Date.parse(startTs.toISOString()));
    const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
    // let endTs = Date.parse(this.form.get('dateTo').value);
    if (!isNaN(startTs) && !isNaN(endTs)) {
      // tslint:disable-next-line: triple-equals
      const damTomId = this.form.get('damtom').value == 1 ? null : this.form.get('damtom').value;
      await this.getChartBcKetNoi(damTomId, startTs, endTs);
      this.chartOption = {
        textStyle: {
          fontStyle: 'normal',
          fontFamily: 'Inter var',
          fontSize: 16
        },
        grid: {
          left: '5%',
          right: '5%',
          containLabel: true,
        },
        title: {
          text: 'Số lần cảm biến mất kết nối',
          left: 40,
          top: 10,
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontWeight: 500,
            fontSize: 20,
            color: '#fff'
          },
        },
        legend: {
          textStyle: {
            fontSize: 12,
            color: '#fff'
          },
          x: 'center',
          bottom: 10,
          type: 'scroll',
          itemGap: 10,
          padding: 5,
          itemWidth: 25,
          itemHeight: 14,
          align: 'auto',
          orient: 'horizontal',
          left: 'center',
          zlevel: 0,
          z: 4,
          data: ''
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#0b0e10',
          // position: ['15%', '20%'],
          alwaysShowContent: false,
          displayMode: 'single',
          z: 60,
          triggerOn: 'mousemove|click',
          axisPointer: {
            type: 'line',
            axis: 'auto',
            label: {
              show: false
            }
          },
          textStyle: {
            fontSize: 10,
            color: 'rgba(255, 255, 255, 1)',
            fontWeight: 'bold'
          },
          borderWidth: 0,
          confine: true
        },
        xAxis: {
          data: this.initlabel,
          show: false,
          type: 'category',
          nameRotate: 45,
          axisTick: {
            show: true,
            length: 3,
            interval: 0,
            inside: false,
            alignWithLabel: true,
          },
          axisLabel: {
            interval: 0,
            show: true,
            inside: false,
            fontSize: 14,
            fontFamily: 'Inter var',
            color: '#fff'
          },
          minorTick: {
            splitNumber: 5
          },
          boundaryGap: true,
          silent: false,
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          axisLabel: {
            fontSize: 14,
            fontFamily: 'Inter var',
            color: '#fff'
          },
        },
        series: this.chartData,
      };
      this.getTableBcKetNoi(damTomId, startTs, endTs);
    }
  }
  fetchDamTomsData() {
    return new Promise(
      (reslove, reject) => {
        this.quanTriDamTomService.getAllTenantActiveDamtom()
          .subscribe((res) => {
            this.damTomList = this.getListDamTomActive(res);
            this.isPageLoading = false;
            reslove(this.damTomList);
          },
            err => {
              this.isPageLoading = false;
              reject(err);
            }
          );
      }
      // (reslove, reject) => {
      //   this.reportScheduleService.getListDamTom(this.pageLink)
      //     .subscribe((pageData: PageData<any>) => {
      //       if (pageData.hasNext) {
      //         this.pageLink.pageSize += 100;
      //         this.fetchDamTomsData();
      //       } else {
      //         this.damTomList = this.getListDamTomActive(pageData);
      //         this.isPageLoading = false;
      //         reslove(this.damTomList);
      //       }
      //     },
      //       err => {
      //         // this.showToast(`Có lỗi xảy ra khi tải các đầm tôm`, 'danger', 3000);
      //         console.log(err);
      //         this.isPageLoading = false;
      //         reject(err);
      //       }
      //     );
      // }
    );
  }
  async damTomChange() {
    let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
    startTs.setHours(0, 0, 0, 0);
    startTs = (Date.parse(startTs.toISOString()));
    const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
    // let endTs = Date.parse(this.form.get('dateTo').value);
    // tslint:disable-next-line: triple-equals
    const damtomId = this.form.get('damtom').value == 1 ? null : this.form.get('damtom').value;
    if (this.form.get('dateTo').value < this.form.get('dateFrom').value) {
      this.invalidDate = true;
      return;
    }
    this.invalidDate = false;
    await this.getChartBcKetNoi(damtomId, startTs, endTs);
    this.chartOption = {
      textStyle: {
        fontStyle: 'normal',
        fontFamily: 'Inter var',
        fontSize: 16
      },
      grid: {
        left: '5%',
        right: '5%',
        containLabel: true,
      },
      title: {
        text: 'Số lần cảm biến mất kết nối',
        left: 40,
        top: 10,
        textStyle: {
          fontStyle: 'normal',
          fontFamily: 'Inter var',
          fontWeight: 500,
          fontSize: 20,
          color: '#fff'
        },
      },
      legend: {
        textStyle: {
          fontSize: 12,
          color: '#fff'
        },
        x: 'center',
        bottom: 10,
        type: 'scroll',
        itemGap: 10,
        padding: 5,
        itemWidth: 25,
        itemHeight: 14,
        align: 'auto',
        orient: 'horizontal',
        left: 'center',
        zlevel: 0,
        z: 4,
        data: ''
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0b0e10',
        // position: ['15%', '20%'],
        alwaysShowContent: false,
        displayMode: 'single',
        z: 60,
        triggerOn: 'mousemove|click',
        axisPointer: {
          type: 'line',
          axis: 'auto',
          label: {
            show: false
          }
        },
        textStyle: {
          fontSize: 10,
          color: 'rgba(255, 255, 255, 1)',
          fontWeight: 'bold'
        },
        borderWidth: 0,
        confine: true
      },
      xAxis: {
        data: this.initlabel,
        show: false,
        type: 'category',
        nameRotate: 45,
        axisTick: {
          show: true,
          length: 3,
          interval: 0,
          inside: false,
          alignWithLabel: true,
        },
        axisLabel: {
          interval: 0,
          show: true,
          inside: false,
          fontSize: 14,
          fontFamily: 'Inter var',
          color: '#fff'
        },
        minorTick: {
          splitNumber: 5
        },
        boundaryGap: true,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        axisLabel: {
          fontSize: 14,
          fontFamily: 'Inter var',
          color: '#fff'
        },
      },
      series: this.chartData,
    };
    this.getTableBcKetNoi(damtomId, startTs, endTs);

  }
  ngOnInit() {

    this.isDamTomLoading = true;
    this.fiveDayAgo.setDate(this.fiveDayAgo.getDate() - 4);
    this.form = this.fb.group({
      dateFrom: [this.fiveDayAgo.toISOString()],
      dateTo: [this.now],
      damtom: [1]
    });

    this.fetchDamTomsData().then(() => {
      this.isDamTomLoading = false;
      this.form.get('damtom').setValue(1);
    });
    let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
    startTs.setHours(0, 0, 0, 0);
    startTs = (Date.parse(startTs.toISOString()));
    const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
    this.getChartBcKetNoi(null, startTs, endTs);
    this.getTableBcKetNoi(null, startTs, endTs);
  }
  async ionViewWillEnter() {
    this.isDamTomLoading = true;
    this.fetchDamTomsData().then(() => {
      this.isDamTomLoading = false;
      this.form.get('damtom').setValue(1);
    });
    let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
    startTs.setHours(0, 0, 0, 0);
    startTs = (Date.parse(startTs.toISOString()));
    const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
    await this.getChartBcKetNoi(null, startTs, endTs);
    this.chartOption = {
      textStyle: {
        fontStyle: 'normal',
        fontFamily: 'Inter var',
        fontSize: 16
      },
      grid: {
        left: '5%',
        right: '5%',
        containLabel: true,
      },
      title: {
        text: 'Số lần cảm biến mất kết nối',
        left: 40,
        top: 10,
        textStyle: {
          fontStyle: 'normal',
          fontFamily: 'Inter var',
          fontWeight: 500,
          fontSize: 20,
          color: '#fff'
        },
      },
      legend: {
        textStyle: {
          fontSize: 12,
          color: '#fff'
        },
        x: 'center',
        bottom: 10,
        type: 'scroll',
        itemGap: 10,
        padding: 5,
        itemWidth: 25,
        itemHeight: 14,
        align: 'auto',
        orient: 'horizontal',
        left: 'center',
        zlevel: 0,
        z: 4,
        data: ''
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0b0e10',
        // position: ['15%', '20%'],
        alwaysShowContent: false,
        displayMode: 'single',
        z: 60,
        triggerOn: 'mousemove|click',
        axisPointer: {
          type: 'line',
          axis: 'auto',
          label: {
            show: false
          }
        },
        textStyle: {
          fontSize: 10,
          color: 'rgba(255, 255, 255, 1)',
          fontWeight: 'bold'
        },
        borderWidth: 0,
        confine: true
      },
      xAxis: {
        data: this.initlabel,
        show: false,
        type: 'category',
        nameRotate: 45,
        axisTick: {
          show: true,
          length: 3,
          interval: 0,
          inside: false,
          alignWithLabel: true,
        },
        axisLabel: {
          interval: 0,
          show: true,
          inside: false,
          fontSize: 14,
          fontFamily: 'Inter var',
          color: '#fff'
        },
        minorTick: {
          splitNumber: 5
        },
        boundaryGap: true,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        axisLabel: {
          fontSize: 14,
          fontFamily: 'Inter var',
          color: '#fff'
        },
      },
      series: this.chartData,
    };
    this.getTableBcKetNoi(null, startTs, endTs);
  }
  async getChartBcKetNoi(damtomId: string, startTs: number, endTs: number) {
    this.isDataEqual0 = true;
    this.isLoading = true;
    const value = await this.baoCaoService.getChartBcKetNoi(damtomId, startTs, endTs).toPromise();
    if (value) {
      this.hasData = true;
      this.chartData = [];

      const chartLabal = [];
      value.forEach(data => {

        this.data = {
          data: [data.value],
          type: 'bar',
          name: data.name,
          barMaxWidth: 40,
          barGap: '100%'
        };
        this.chartData.push({ ...this.data });
        chartLabal.push(data.name);
      });
      // this.initlabel.forEach(label => {
      //   if (!chartLabal.includes(label)) {
      //     this.data = {
      //       data: [0],
      //       type: 'bar',
      //       name: label,
      //     };
      //     this.chartData.push({ ...this.data });
      //   }
      // });

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.chartData.length; i++) {
        if (this.chartData[i].data[0] !== 0) {
          this.isDataEqual0 = false;
          return;
        }
      }
      this.isLoading = false;
    }
  }
  getTableBcKetNoi(damtomId, startTs, endTs) {
    this.tableSource = [];
    this.baoCaoService.getTableBcKetNoi(damtomId, startTs, endTs).subscribe(
      value => {
        this.tableSource = value;
      }
    );
  }

  getListDamTomActive(pageData) {
    const listDamTom = [];
    // pageData.data.forEach(damtom => {
    pageData.forEach(damtom => {
      if (damtom.active) {
        listDamTom.push(damtom);
      }
    });
    return listDamTom;
  }

  // convert endts time
  convertEndTs(endTs: number) {
    const x = new Date(endTs);
    x.setHours(23, 59, 59, 59); // set x = thời điểm cuối của ngày

    return x.getTime() > Date.now() ? Date.now() : x.getTime();
  }
  sliderClick() {
    this.selectHour = !this.selectHour;
    // this.fromDate = moment(new Date()).startOf('date').toDate().toISOString();
  }

  doRefresh(event) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 1000);
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
}
