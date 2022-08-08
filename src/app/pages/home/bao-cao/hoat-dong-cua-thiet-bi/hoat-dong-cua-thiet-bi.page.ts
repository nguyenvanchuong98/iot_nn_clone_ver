import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import * as moment from 'moment';
import { BaoCaoService } from 'src/app/core/services/bao-cao.service';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import { DamTom } from 'src/app/shared/models/giamsat.model';
import { DataHDTBTable } from 'src/app/shared/models/report.model';
import { ReportTimeRpcActive } from './bc-time-rpc-active.model';

@Component({
  selector: 'app-hoat-dong-cua-thiet-bi',
  templateUrl: './hoat-dong-cua-thiet-bi.page.html',
  styleUrls: ['./hoat-dong-cua-thiet-bi.page.scss'],
})
export class HoatDongCuaThietBiPage implements OnInit {
  isGoTop = false;
  @ViewChild (IonContent, {static: true}) content: IonContent;
  customActionSheetOptions: any = {
    header: 'Chọn nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };
  currentDate = moment(new Date()).add(7, 'hours').toISOString();
  // startTs = (new Date()).setDate((new Date()).getDate() - 4).toString();
  now = new Date();
  startTs;
  endTs = new Date().toISOString();
  dsDamTom: DamTom[];
  damTomIdSelected: string;
  chartOption: any;
  dataChartTB: any[] = [];
  dataTableHDTB: DataHDTBTable[] = [];
  constructor(
    private giamsatService: GiamSatService,
    private baoCaoService: BaoCaoService,
  ) { }

  ngOnInit() {
    this.now.setDate(this.now.getDate() - 4);
    this.now.setHours(0, 0, 0, 0);
    this.startTs = this.now.toISOString();
    this.getDanhSachDamTom();
  }
  ionViewWillEnter() {
  }
  doRefresh(event){
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }
  getDanhSachDamTom() {
    // tslint:disable-next-line: deprecation
    this.giamsatService.getDanhSachDamTom().subscribe((data) => {
      if (!!data) {
        this.dsDamTom = data;
        this.damTomIdSelected = this.dsDamTom[0].id;
        this.fetchData(this.damTomIdSelected, Date.parse(this.startTs).toString(), Date.parse(this.endTs).toString());
      }
    });
  }
  changeDamTom(event) {
    this.damTomIdSelected = event;
    this.fetchData(this.damTomIdSelected, Date.parse(this.startTs).toString(), Date.parse(this.endTs).toString());
  }
  startDateChange(event) {
    this.startTs = event;
    this.fetchData(this.damTomIdSelected, Date.parse(this.startTs).toString(), Date.parse(this.endTs).toString());
  }
  endDateChange(event) {
    this.endTs = event;
    this.fetchData(this.damTomIdSelected, Date.parse(this.startTs).toString(), Date.parse(this.endTs).toString());
  }
  filterDate() {

  }
  // isStartTsGreaterEndTs() {
  //   return this.modelReport.endTs > this.modelReport.startTs;
  // }

  fetchData(damtomId: string, startTs: string, endTs: string){
    this.dataTableHDTB = [];
    this.baoCaoService.getHDTBReport(damtomId, startTs, endTs).subscribe(res => {
      if (res){
        this.dataChartTB = [];
        res.label.forEach((e, index) => {
          this.dataChartTB.push({
            value: res.timeOn[index],
            name: e
          });
        });
        this.chartOption =
        {
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontSize: 16
          },
          title: {
            text: 'Thống kê hoạt động của thiết bị',
            x: 'center',
            top: 10,
            left: 10,
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
            formatter: '{b}:<br/>{c} ({d}%)',
            position: ['10%', '15%'],
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
              data: this.dataChartTB,
              label: {
                show: false
              },
              emphasis: {
                label: {
                  show: false
                }
              },
            }
          ]
        };
      }
    }, () => {
      this.chartOption = {
        textStyle: {
          fontStyle: 'normal',
          fontFamily: 'Inter var',
          fontSize: 16,
        },
        title: {
          text: 'Thống kê hoạt động của thiết bị',
          x: 'center',
          top: 10,
          left: 10,
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontWeight: 500,
            fontSize: 16,
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
          show: true,
          trigger: 'item',
          formatter: '{b}:<br/>{c} ({d}%)',
          // triggerOn: 'mousemove|click',
          position: ['10%', '15%'],
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['60%', '80%'],
            // center: ['50%', '55%'],
            // roseType: 'radius',
            data: null,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          }
        ]
      };
    });
    this.baoCaoService.getHDTBReportTable(damtomId, startTs, endTs).subscribe(res => {
      if (res.length > 0) {
        this.dataTableHDTB = res;
      }
    });
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
