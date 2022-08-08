import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import * as zoomPlugin from 'chartjs-plugin-zoom';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaoCaoService } from 'src/app/core/services/bao-cao.service';
import { ReportSingleData } from 'src/app/shared/models/report.model';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Direction } from 'src/app/shared/models/page/sort-order';
import { DamTomSchedule } from 'src/app/core/services/report-schedule.service';
import { IonContent } from '@ionic/angular';
import { QuantridamtomService } from '../../../../core/services/quantridamtom.service';
@Component({
  selector: 'app-canh-bao',
  templateUrl: './canh-bao.page.html',
  styleUrls: ['./canh-bao.page.scss'],
})
export class CanhBaoPage implements OnInit {


  constructor(
    private fb: FormBuilder,
    private baoCaoService: BaoCaoService,
    private quanTriDamTomService: QuantridamtomService) { }
  @ViewChild(IonContent, { static: false })
  content: IonContent;
  chartType: ChartType = 'pie';
  isGoTop = false;
  form: FormGroup;
  now = new Date().toISOString();
  fiveDayAgo = new Date();
  isDamTomLoading = false;
  chartMotDam: any[] = [];
  chartAllDam: any[] = [];
  chartLabelMotDam: Label[] = [];
  chartDataMotDam: ChartDataSets[] = [];
  tooltip = {
    textStyle: {
      width: 100,
      fontSize: 12,
      overflow: 'break',
    }
  };
  dataSingle: number[] = [];
  lineChartPlugins = [zoomPlugin];
  chartOptionsMotDam: any;
  chartOptionsAll: any;
  chartLabelAll: Label[] = [];
  chartDataAll: ChartDataSets[] = [
  ];
  data: number[] = [];

  customActionSheetOptions: any = {
    header: 'Chọn Nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };

  sortOrder = {
    property: 'createdTime',
    direction: Direction.DESC
  };

  isPageLoading = false;
  damTomList: DamTomSchedule[] = [];
  pageLink: PageLink = new PageLink(100, 0, '', this.sortOrder);

  invalidDate = false;
  maxFromTo: string = new Date().toISOString();

  selectHour = false;
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
              // this.showToast(`Có lỗi xảy ra khi tải các đầm tôm`, 'danger', 3000);
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

  ngOnInit() {
    this.fiveDayAgo.setDate(this.fiveDayAgo.getDate() - 4);
    this.form = this.fb.group({
      dateFrom: [this.fiveDayAgo.toISOString()],
      dateTo: [this.now],
      damtom: []
    });
    this.initialization();
  }
  ionViewWillEnter() {
    this.initialization();
  }
  initialization() {
    /**
     * Mặc định hiển thị dữ liệu của 5 ngày gần nhất
     *
     */
    this.isPageLoading = true;
    this.isDamTomLoading = true;


    // this.isLoading = true;

    let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
    startTs.setHours(0, 0, 0, 0);
    startTs = (Date.parse(startTs.toISOString()));
    const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
    //  let endTs : any = new Date(Date.parse(this.form.get('dateTo').value));
    //  endTs = Date.parse(endTs.toISOString());
    // this.fetchData(keysParam[0], startTs, endTs);
    this.fetchDataAllDam(startTs, endTs);

    this.fetchDamTomsData().then((value: DamTomSchedule) => {
      // this.form.get('damtom').setValue(value[0].id.id);
      this.form.get('damtom').setValue(value[0].id);
      // this.fetchDataSingle(value[0].id.id, startTs, endTs);
      this.fetchDataSingle(value[0].id, startTs, endTs);
      this.isDamTomLoading = false;
    });
  }
  validateDay() {
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
      const damTomId = this.form.get('damtom').value;
      this.fetchDataAllDam(startTs, endTs);
      this.fetchDataSingle(damTomId, startTs, endTs);
    }
  }


  damTomChange() {
    let startTs: any = new Date(Date.parse(this.form.get('dateFrom').value));
    startTs.setHours(0, 0, 0, 0);
    startTs = (Date.parse(startTs.toISOString()));
    const endTs = this.convertEndTs(Date.parse(this.form.get('dateTo').value));
    // let endTs = Date.parse(this.form.get('dateTo').value);
    const damtomId = this.form.get('damtom').value;
    this.fetchDataSingle(damtomId, startTs, endTs);
  }

  fetchDataAllDam(startTs: number, endTs: number) {
    this.chartLabelAll = [];
    this.data = [];
    this.chartDataAll = [];
    this.chartAllDam = [];
    this.baoCaoService.getTenantBcCanhBaoData(startTs, endTs).subscribe(
      (reportData: ReportSingleData[]) => {
        if (this.data.length === 0) {
          reportData.forEach(
            (reportSingleData: ReportSingleData) => {
              this.data.push(reportSingleData.value);
              this.chartLabelAll.push(reportSingleData.name);
            }
          );
        }
        this.chartDataAll = [
          {
            data: this.data
          }
        ];
        this.chartAllDam = [];
        for (let i = 0; i < this.chartDataAll[0].data.length; i++) {
          // tslint:disable-next-line: triple-equals
          if (this.chartDataAll[0].data[i] != 0) {
            this.chartAllDam.push({ value: this.chartDataAll[0].data[i], name: this.chartLabelAll[i], tooltip: this.tooltip });
          }
        }
        this.chartOptionsAll = {
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontSize: 16
          },
          title: {
            text: 'So sánh cảnh báo',
            x: 'center',
            top: 10,
            left: 45,
            textStyle: {
              fontStyle: 'normal',
              fontFamily: 'Inter var',
              fontWeight: 500,
              fontSize: 20,
              color: '#fff'
            },
          },
          tooltip: {
            trigger: 'item',
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
            formatter: '{b}:<br/>{c} ({d}%)',
            borderWidth: 0,
            confine: true
          },
          toolbox: {
            show: true,
          },
          legend: {
            x: 'center',
            bottom: 10,
            type: 'scroll',
            itemGap: 10,
            // data: this.dataLegend,
            textStyle: {
              fontSize: 14,
              color: '#fff'
            },
            pageIconColor: '#fff',
            pageTextStyle: {
              color: '#fff'
            }
          },
          series: [
            {
              name: '',
              type: 'pie',
              radius: [20, 120],
              // center: ['50%', '55%'],
              // roseType: 'radius',
              data: this.chartAllDam,
              label: {
                show: false
              },
              emphasis: {
                label: {
                  show: false
                }
              },
              // label: {
              //   color: '#fff',
              //   alignTo: 'edge',
              //   fontSize: 13,
              //   fontFamily: 'Inter var',
              //   formatter: '\n{name|{b}}',
              //   minMargin: 5,
              //   edgeDistance: 10,
              //   bleedMargin: 10,
              //   lineHeight: 18,
              //   rich: {
              //     time: {
              //       fontSize: 10,
              //       color: '#455a64'
              //     }
              //   },
              //   overflow: 'break',
              // },
              // labelLine: {
              //   length: 15,
              //   length2: 0,
              //   maxSurfaceAngle: 80
              // },
              // labelLayout(params) {
              //   const isLeft = params.labelRect.x < 300;
              //   const points = params.labelLinePoints;
              //   // Update the end point.
              //   points[2][0] = isLeft
              //     ? params.labelRect.x
              //     : params.labelRect.x + params.labelRect.width;
              //   return {
              //     labelLinePoints: points
              //   };
              // },
            }
          ]
        };
      }
    );
  }

  fetchDataSingle(damtomId: string, startTs: number, endTs: number) {
    this.chartDataMotDam = [];
    this.dataSingle = [];
    this.chartLabelMotDam = [];
    this.chartMotDam = [];
    this.baoCaoService.getDamtomBcCanhBaoData(damtomId, startTs, endTs).subscribe(
      (reportData: ReportSingleData[]) => {
        if (this.dataSingle.length === 0) {
          reportData.forEach(
            (reportSingleData: ReportSingleData) => {
              this.dataSingle.push(reportSingleData.value);
              this.chartLabelMotDam.push(reportSingleData.name);
            }
          );
        }
        this.chartDataMotDam = [
          {
            data: this.dataSingle
          }
        ];
        this.chartMotDam = [];
        for (let i = 0; i < this.chartLabelMotDam.length; i++) {
          this.chartMotDam.push({ value: this.chartDataMotDam[0].data[i], name: this.chartLabelMotDam[i], tooltip: this.tooltip });
        }
        this.chartOptionsMotDam = {
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontSize: 16,
          },
          title: {
            text: 'Thống kê cảnh báo',
            x: 'center',
            top: 10,
            left: 45,
            textStyle: {
              fontStyle: 'normal',
              fontFamily: 'Inter var',
              fontWeight: 500,
              fontSize: 20,
              color: '#fff'
            },
          },
          legend: {
            x: 'center',
            bottom: 10,
            type: 'scroll',
            itemGap: 10,
            // data: this.dataLegend,
            textStyle: {
              fontSize: 14,
              color: '#fff'
            },
            pageIconColor: '#fff',
            pageTextStyle: {
              color: '#fff'
            }
          },
          tooltip: {
            trigger: 'item',
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
            formatter: '{b}:<br/>{c} ({d}%)',
            borderWidth: 0,
            confine: true
          },
          series: [
            {
              name: '',
              type: 'pie',
              radius: [20, 120],
              // center: ['50%', '55%'],
              // roseType: 'radius',
              data: this.chartMotDam,
              label: {
                show: false
              },
              emphasis: {
                label: {
                  show: false
                }
              },
              // label: {
              //   color: '#fff',
              //   alignTo: 'edge',
              //   fontSize: 12,
              //   fontFamily: 'Inter var',
              //   formatter: '\n{name|{b}}',
              //   minMargin: 5,
              //   edgeDistance: 10,
              //   bleedMargin: 10,
              //   lineHeight: 18,
              //   rich: {
              //     time: {
              //       fontSize: 10,
              //       color: '#455a64'
              //     }
              //   },
              //   overflow: 'break',
              // },
              // labelLine: {
              //   length: 15,
              //   length2: 0,
              //   maxSurfaceAngle: 80
              // },
              // labelLayout(params) {
              //   const isLeft = params.labelRect.x < 300;
              //   const points = params.labelLinePoints;
              //   // Update the end point.
              //   points[2][0] = isLeft
              //     ? params.labelRect.x
              //     : params.labelRect.x + params.labelRect.width;
              //   return {
              //     labelLinePoints: points
              //   };
              // },
            }
          ]
        };
      },
      err => {
      },
      () => {
        this.isPageLoading = false;
      }

    );
  }


  // convert endts time
  convertEndTs(endTs: number) {
    const x = new Date(endTs);
    x.setHours(24, 0, 0, 0); // set x = thời điểm 0h ngày hôm sau

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
  scrollToTop() {
    this.content.scrollToTop(0);
  }
  logScrolling(event) {
    if (event.detail.scrollTop === 0) {
      this.isGoTop = false;
    }
    else {
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
