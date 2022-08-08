import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { LuatCanhBaoService } from 'src/app/core/services/luat-canh-bao.service';
import { AllDevice } from 'src/app/shared/models/luatcanhbao.model';
import { DamTom } from 'src/app/core/services/report-schedule.service';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import * as moment from 'moment';

@Component({
  selector: 'app-du-lieu-giam-sat',
  templateUrl: './du-lieu-giam-sat.page.html',
  styleUrls: ['./du-lieu-giam-sat.page.scss'],
})
export class DuLieuGiamSatPage implements OnInit {

  constructor(
    private luatService: LuatCanhBaoService,
    private giamsatService: GiamSatService,
  ) { }
  customActionSheetOptions: any = {
    header: 'Chọn nhà vườn',
    cssClass: 'my-custom-action-sheet',
  };
  @ViewChild(IonContent) gotoTop: IonContent;
  isGoTop = false;
  isLoadingTemp = false;
  isLoadingPH = false;
  isLoadingORP = false;
  isLoadingDO = false;
  isLoadingsalinity = false;
  fiveDayAgo2 = new Date().getTime() - 172800000;
  startTs = new Date(this.fiveDayAgo2).toISOString();
  now = new Date().toISOString();
  endTs = new Date().toISOString();
  Tempdatasets: any[] = [];
  TempChartLabels: any[] = [];
  luxDataset: any[] = [];
  luxChartLabels: any[] = [];
  humidityDatasets: any[] = [];
  humidityChartLabels: any[] = [];
  maxFromTo: string = new Date().toISOString();
  lstAllDvice: AllDevice;
  dsDamTom: DamTom[];
  damTomIdSelected;
  intervalTime: number;
  isLoading = false;
  luxChartOption: any;
  humChartOption: any;
  tempChartOption: any;
  dataMark: any[];
  async ngOnInit() {
    /**
     * Mặc định hiển thị dữ liệu của 3 ngày gần nhất
     *
     */
    this.tempChartOption = {
      textStyle: {
        fontStyle: 'normal',
        fontFamily: 'Inter var',
        fontSize: 16
      },
      grid: {
        left: '3%',
        right: '4%',
        containLabel: true,
      },
      title: {
        text: 'Dữ liệu các cảm biến nhiệt độ',
        left: 10,
        top: 10,
        textStyle: {
          fontStyle: 'normal',
          fontFamily: 'Inter var',
          fontWeight: 500,
          fontSize: 20,
          color: '#fff'
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0b0e10',
        textStyle: {
          fontSize: 10,
          color: 'rgba(255, 255, 255, 1)',
          fontWeight: 'bold'
        },
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
        borderWidth: 0,
        confine: true
      },
      xAxis: {
        type: 'time',
        silent: false,
        splitLine: {
          show: true,
          lineStyle: {
            color: '#314147'
          }
        },
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff',
          interval: 0,
          rotate: 45,
        },
        axisTick: {
          show: true,
          length: 3,
          interval: 2,
          inside: true,
          alignWithLabel: true,
        },
      },
      yAxis: {
        // min: 0,
        // max: 1000,
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#314147'
          }
        },
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
      },
      legend: {
        x: 'center',
        bottom: 40,
        type: 'scroll',
        itemGap: 10,
        data: [],
        textStyle: {
          fontSize: 12,
          color: '#fff'
        },
        pageIconColor: '#fff',
        pageTextStyle: {
          color: '#fff'
        }
      },
      dataZoom: [
        {
          minSpan: 10,
          type: 'inside',
        },
      ],
      series: []
    };
    this.humChartOption = {
      textStyle: {
        fontStyle: 'normal',
        fontFamily: 'Inter var',
        fontSize: 16
      },
      grid: {
        left: '3%',
        right: '4%',
        containLabel: true,
      },
      title: {
        text: 'Dữ liệu các cảm biến độ ẩm',
        left: 10,
        top: 10,
        textStyle: {
          fontStyle: 'normal',
          fontFamily: 'Inter var',
          fontWeight: 500,
          fontSize: 20,
          color: '#fff'
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0b0e10',
        textStyle: {
          fontSize: 10,
          color: 'rgba(255, 255, 255, 1)',
          fontWeight: 'bold'
        },
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
        borderWidth: 0,
        confine: true
      },
      xAxis: {
        type: 'time',
        silent: false,
        splitLine: {
          show: true,
          lineStyle: {
            color: '#314147'
          }
        },
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff',
          interval: 0,
          rotate: 45,
        },
        axisTick: {
          show: true,
          length: 3,
          interval: 2,
          inside: true,
          alignWithLabel: true,
        },
      },
      yAxis: {
        // min: 0,
        // max: 1000,
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#314147'
          }
        },
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
      },
      legend: {
        x: 'center',
        bottom: 40,
        type: 'scroll',
        itemGap: 10,
        data: [],
        textStyle: {
          fontSize: 12,
          color: '#fff'
        },
        pageIconColor: '#fff',
        pageTextStyle: {
          color: '#fff'
        }
      },
      dataZoom: [
        {
          minSpan: 10,
          type: 'inside',
        },
      ],
      series: []
    };
    this.luxChartOption = {
      textStyle: {
        fontStyle: 'normal',
        fontFamily: 'Inter var',
        fontSize: 16
      },
      grid: {
        left: '3%',
        right: '4%',
        containLabel: true,
      },
      title: {
        text: 'Dữ liệu các cảm biến ánh sáng',
        left: 10,
        top: 10,
        textStyle: {
          fontStyle: 'normal',
          fontFamily: 'Inter var',
          fontWeight: 500,
          fontSize: 20,
          color: '#fff'
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0b0e10',
        textStyle: {
          fontSize: 10,
          color: 'rgba(255, 255, 255, 1)',
          fontWeight: 'bold'
        },
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
        borderWidth: 0,
        confine: true
      },
      xAxis: {
        type: 'time',
        silent: false,
        splitLine: {
          show: true,
          lineStyle: {
            color: '#314147'
          }
        },
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff',
          interval: 0,
          rotate: 45,
        },
        axisTick: {
          show: true,
          length: 3,
          interval: 2,
          inside: true,
          alignWithLabel: true,
        },
      },
      yAxis: {
        // min: 0,
        // max: 1000,
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#314147'
          }
        },
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
      },
      legend: {
        x: 'center',
        bottom: 40,
        type: 'scroll',
        itemGap: 10,
        data: [],
        textStyle: {
          fontSize: 12,
          color: '#fff'
        },
        pageIconColor: '#fff',
        pageTextStyle: {
          color: '#fff'
        }
      },
      dataZoom: [
        {
          minSpan: 10,
          type: 'inside',
        },
      ],
      series: []
    };
    this.dsDamTom = await this.giamsatService.getDanhSachDamTom().toPromise();
    this.damTomIdSelected = this.dsDamTom[0]?.id;
    const now = new Date();
    now.setDate(now.getDate() - 2);
    now.setHours(0, 0, 0, 0);
    this.startTs = now.toISOString();
    const timeToQuery =  moment(this.endTs).valueOf() - moment(this.startTs).valueOf();
    this.intervalTime = this.caculateIntervalTime(timeToQuery);
    this.getDataChart();
  }
  checkValidDate(){
    return moment(this.endTs).valueOf() > moment(this.startTs).valueOf();
  }

  async getDataTsSensor(interval: number, deviceId, deviceType, startTs: number, endTs: number) {
    const orderBy = 'DESC';
    // api tra ve object theo telemetry type - chua mang object ts value
    const dataSensor = await this.giamsatService.getDataSensorAvg(
      deviceId,
      deviceType,
      startTs.toString(),
      endTs.toString(),
      interval,
      orderBy,
      ).toPromise();
    return dataSensor[deviceType];
  }
  changeDamTom(event) {
    this.getDataChart();
  }
  fromDateChange(event) {
    if (this.endTs > event){
      const timeToQuery =  moment(this.endTs).valueOf() - moment(event).valueOf();
      this.intervalTime = this.caculateIntervalTime(timeToQuery);
      this.getDataChart();
    }
  }
  toDateChange(event) {
    if (event > this.startTs){
      const timeToQuery =  moment(event).valueOf() - moment(this.startTs).valueOf();
      this.intervalTime = this.caculateIntervalTime(timeToQuery);
      this.getDataChart();
    }
  }
  async getDataChart() {
    this.lstAllDvice = await this.luatService.getAllDevice(this.damTomIdSelected).toPromise();
    // this.fetchData(this.damTomIdSelected, Date.parse(this.startTs).toString(), Date.parse(this.endTs).toString());
    if (this.lstAllDvice.Temperature.length > 0) {
      const seriesDTo: any = [];
      const legendDto: string[] = [];
      this.lstAllDvice.Temperature.forEach(async (dv, i)  => {
        const dataSeries = {
          data: [],
          name: dv.label ? dv.label : dv.name,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
          },
          showSymbol: false
        };
        // tslint:disable-next-line: max-line-length
        await this.getDataTsSensor(this.intervalTime, dv.id, dv.telemetryType[0], moment(this.startTs).valueOf(), moment(this.endTs).valueOf())
        .then(async res => {
          legendDto.push(dv.label ? dv.label : dv.name);
          if (!!res) {
            res.forEach((e, index) => {
              if (e.value == null){
                dataSeries.data.push([e.ts, e.value]);
              }
              else {
                dataSeries.data.push([e.ts, Math.round(e.value)]);
              }
            });
          }
          if (dataSeries.data.length > 0) {
            dataSeries.data[dataSeries.data?.length - 1][0] = dataSeries.data[dataSeries.data?.length - 1][0] > moment().valueOf()
            ? moment().valueOf()
            : dataSeries.data[dataSeries.data?.length - 1][0];
            seriesDTo.push({ ...dataSeries });
          }
          if (legendDto.length === this.lstAllDvice.Temperature.length) {
            this.setDataChar('Temperature', legendDto, seriesDTo);
            this.isLoading = false;
          }
        });
      });
    }
    if (this.lstAllDvice.Temperature.length === 0){
      this.setDataChar('Temperature', [], []);
    }
    if (this.lstAllDvice.Humidity.length > 0) {
      const seriesDTo: any = [];
      const legendDto: string[] = [];
      this.lstAllDvice.Humidity.forEach(async (dv, i)  => {
        const dataSeries = {
          data: [],
          name: dv.label ? dv.label : dv.name,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
          },
          showSymbol: false
        };
        // tslint:disable-next-line: max-line-length
        await this.getDataTsSensor(this.intervalTime, dv.id, dv.telemetryType[0], moment(this.startTs).valueOf(), moment(this.endTs).valueOf())
        .then(async res => {
          legendDto.push(dv.label ? dv.label : dv.name);
          if (!!res) {
            res.forEach((e, index) => {
              if (e.value == null){
                dataSeries.data.push([e.ts, e.value]);
              }
              else {
                dataSeries.data.push([e.ts, Math.round(e.value)]);
              }
            });
          }
          if (dataSeries.data.length > 0) {
            dataSeries.data[dataSeries.data?.length - 1][0] = dataSeries.data[dataSeries.data?.length - 1][0] > moment().valueOf()
            ? moment().valueOf()
            : dataSeries.data[dataSeries.data?.length - 1][0];
            seriesDTo.push({ ...dataSeries });
          }
          if (legendDto.length === this.lstAllDvice.Humidity.length) {
            this.setDataChar('Humidity', legendDto, seriesDTo);
            this.isLoading = false;
          }
        });
      });
    }
    if (this.lstAllDvice.Humidity.length === 0){
      this.setDataChar('Humidity', [], []);
    }
    if (this.lstAllDvice.Lux.length > 0) {
      const seriesDTo: any = [];
      const legendDto: string[] = [];
      this.lstAllDvice.Lux.forEach(async (dv, i)  => {
        const dataSeries = {
          data: [],
          name: dv.label ? dv.label : dv.name,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
          },
          showSymbol: false
        };
        // tslint:disable-next-line: max-line-length
        await this.getDataTsSensor(this.intervalTime, dv.id, dv.telemetryType[0], moment(this.startTs).valueOf(), moment(this.endTs).valueOf())
        .then(async res => {
          legendDto.push(dv.label ? dv.label : dv.name);
          if (!!res) {
            res.forEach((e, index) => {
              if (e.value == null){
                dataSeries.data.push([e.ts, e.value]);
              }
              else {
                dataSeries.data.push([e.ts, Math.round(e.value)]);
              }
            });
          }
          if (dataSeries.data.length > 0) {
            dataSeries.data[dataSeries.data?.length - 1][0] = dataSeries.data[dataSeries.data?.length - 1][0] > moment().valueOf()
            ? moment().valueOf()
            : dataSeries.data[dataSeries.data?.length - 1][0];
            seriesDTo.push({ ...dataSeries });
          }
          if (legendDto.length === this.lstAllDvice.Lux.length) {
            this.setDataChar('Lux', legendDto, seriesDTo);
            this.isLoading = false;
          }
        });
      });
    }
    if (this.lstAllDvice.Lux.length === 0){
      this.setDataChar('Lux', [], []);
    }
  }
  setDataChar(key, legendSet, dataset) {
    switch (key) {
      case 'Humidity':
        this.humidityDatasets = [...dataset];
        this.isLoadingsalinity = false;
        this.humChartOption = {
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontSize: 16
          },
          grid: {
            left: '3%',
            right: '4%',
            containLabel: true,
          },
          title: {
            text: 'Dữ liệu các cảm biến độ ẩm',
            left: 10,
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
            x: 'center',
            bottom: 40,
            type: 'scroll',
            itemGap: 10,
            data: legendSet,
            textStyle: {
              fontSize: 12,
              color: '#fff'
            },
            pageIconColor: '#fff',
            pageTextStyle: {
              color: '#fff'
            }
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#0b0e10',
            textStyle: {
              fontSize: 10,
              color: 'rgba(255, 255, 255, 1)',
              fontWeight: 'bold'
            },
            // position: ['15%', '40%'],
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
            borderWidth: 0,
            confine: true
          },
          xAxis: {
            type: 'time',
            silent: false,
            splitLine: {
              show: true,
              lineStyle: {
                color: '#314147'
              }
            },
            axisLabel: {
              fontSize: 10,
              fontFamily: 'Inter var',
              color: '#fff',
              interval: 0,
              rotate: 45,
              // formatter: '{dd}/{MM}/{yyyy}'
            },
            axisTick: {
              show: true,
              length: 3,
              interval: 2,
              inside: true,
              alignWithLabel: true,
            },
          },
          yAxis: {
            // min: 0,
            // max: 1000,
            axisLabel: {
              fontSize: 10,
              fontFamily: 'Inter var',
              color: '#fff'
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#314147'
              }
            },
            axisLine: {
              show: true
            },
            axisTick: {
              show: true
            },
          },
          dataZoom: [
            {
              minSpan: 10,
              type: 'inside',
            },
          ],
          series: this.humidityDatasets
        };
        break;
      case 'Lux':
        this.luxDataset = [...dataset];
        this.isLoadingPH = false;
        this.luxChartOption = {
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontSize: 16,
          },
          grid: {
            left: '3%',
            right: '4%',
            // bottom: '3%',
            containLabel: true,
          },
          title: {
            text: 'Dữ liệu các cảm biến ánh sáng',
            left: 10,
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
            x: 'center',
            bottom: 40,
            type: 'scroll',
            itemGap: 10,
            data: legendSet,
            textStyle: {
              fontSize: 12,
              color: '#fff'
            },
            pageIconColor: '#fff',
            pageTextStyle: {
              color: '#fff'
            }
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#0b0e10',
            textStyle: {
              fontSize: 10,
              color: 'rgba(255, 255, 255, 1)',
              fontWeight: 'bold'
            },
            // position: ['15%', '40%'],
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
            borderWidth: 0,
            confine: true
          },
          xAxis: {
            type: 'time',
            silent: false,
            splitLine: {
              show: true,
              lineStyle: {
                color: '#314147'
              }
            },
            axisLabel: {
              fontSize: 10,
              fontFamily: 'Inter var',
              color: '#fff',
              interval: 0,
              rotate: 45,
              // formatter: '{dd}/{MM}/{yyyy}'
            },
            axisTick: {
              show: true,
              length: 3,
              interval: 2,
              inside: true,
              alignWithLabel: true,
            },
          },
          yAxis: {
            // min: 0,
            // max: 1000,
            axisLabel: {
              fontSize: 10,
              fontFamily: 'Inter var',
              color: '#fff'
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#314147'
              }
            },
            axisLine: {
              show: true
            },
            axisTick: {
              show: true
            },
          },
          dataZoom: [
            {
              minSpan: 10,
              type: 'inside',
            },
          ],
          series: this.luxDataset
        };
        break;
      case 'Temperature':
        this.Tempdatasets = [...dataset];
        this.isLoadingTemp = false;
        this.tempChartOption = {
          textStyle: {
            fontStyle: 'normal',
            fontFamily: 'Inter var',
            fontSize: 16
          },
          grid: {
            left: '3%',
            right: '4%',
            // bottom: '3%',
            containLabel: true,
          },
          title: {
            text: 'Dữ liệu các cảm biến nhiệt độ',
            left: 10,
            top: 10,
            textStyle: {
              fontStyle: 'normal',
              fontFamily: 'Inter var',
              fontWeight: 500,
              fontSize: 20,
              color: '#fff'
            },
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#0b0e10',
            textStyle: {
              fontSize: 10,
              color: 'rgba(255, 255, 255, 1)',
              fontWeight: 'bold'
            },
            // position: ['15%', '40%'],
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
            borderWidth: 0,
            confine: true
          },
          xAxis: {
            type: 'time',
            silent: false,
            splitLine: {
              show: true,
              lineStyle: {
                color: '#314147'
              }
            },
            axisLabel: {
              fontSize: 10,
              fontFamily: 'Inter var',
              color: '#fff',
              interval: 0,
              rotate: 45,
              // formatter: '{dd}/{MM}/{yyyy}'
            },
            axisTick: {
              show: true,
              length: 3,
              interval: 2,
              inside: true,
              alignWithLabel: true,
            },
          },
          yAxis: {
            // min: 0,
            // max: 1000,
            axisLabel: {
              fontSize: 10,
              fontFamily: 'Inter var',
              color: '#fff'
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#314147'
              }
            },
            axisLine: {
              show: true
            },
            axisTick: {
              show: true
            },
          },
          legend: {
            x: 'center',
            bottom: 40,
            type: 'scroll',
            itemGap: 10,
            data: legendSet,
            textStyle: {
              fontSize: 12,
              color: '#fff'
            },
            pageIconColor: '#fff',
            pageTextStyle: {
              color: '#fff'
            }
          },
          dataZoom: [
            {
              minSpan: 10,
              type: 'inside',
            },
          ],
          series: this.Tempdatasets,
        };
        break;
    }
  }

  setLoading() {
    this.isLoadingTemp = true;
    this.isLoadingPH = true;
    this.isLoadingORP = true;
    this.isLoadingDO = true;
    this.isLoadingsalinity = true;
  }
  caculateIntervalTime(timeToQuery): number {
    // time < 7 days
    if (timeToQuery <= 7 * 24 * 60 * 60 * 1000) {
      return 30 * 60 * 1000; // 30min
    }
    // 7 days < time < 14 days
    if (timeToQuery > 7 * 24 * 60 * 60 * 1000 && timeToQuery <= 14 * 24 * 60 * 60 * 1000) {
      return 2 * 40 * 60 * 1000; // 80 min
    }
    // 14days < time < 21 days
    if (timeToQuery > 14 * 24 * 60 * 60 * 1000 && timeToQuery <= 21 * 24 * 60 * 60 * 1000) {
      return 3 * 40 * 60 * 1000; // 2h
    }
    // 21days<time < 31 days
    if (timeToQuery > 21 * 24 * 60 * 60 * 1000 && timeToQuery <= 31 * 24 * 60 * 60 * 1000) {
      return 3 * 60 * 60 * 1000; // 3h
    }
    // 31days<time < 6month
    if (timeToQuery > 31 * 24 * 60 * 60 * 1000 && timeToQuery <= 183 * 24 * 60 * 60 * 1000) {
      return 12 * 60 * 60 * 1000; // 12h
    }
    // 6month<time < 12month
    if (timeToQuery > 183 * 24 * 60 * 60 * 1000 && timeToQuery <= 365 * 24 * 60 * 60 * 1000) {
      return 24 * 60 * 60 * 1000; // 24h
    }
    // time > 1year
    if (timeToQuery > 365 * 24 * 60 * 60 * 1000) {
      return 30 * 24 * 60 * 60 * 1000;
    }
  }
  convertEndTs(endTs: number) {
    const x = new Date(endTs);
    x.setHours(23, 59, 59, 59); // set x = thời điểm cuối của ngày

    return x.getTime() > Date.now() ? Date.now() : x.getTime();
  }

  doRefresh(event) {
    setTimeout(() => {
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
}

