import { Component, Input, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import * as moment from 'moment';
import { DataSet, DeviceSensor, ZoneOnlySensor } from '../du-lieu-cam-bien.page';
import { BaseChartDirective, Color } from 'ng2-charts';
import * as zoomPlugin from 'chartjs-plugin-zoom';
import { GiamSatService } from 'src/app/core/services/giam-sat.service';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LimitTypeUnknownComponent } from '../limit-type-unknown/limit-type-unknown.component';
import { LimitSalModalComponent } from '../limit-sal-modal/limit-sal-modal.component';
import { LimitDoModalComponent } from '../limit-do-modal/limit-do-modal.component';
import { LimitTempModalComponent } from '../limit-temp-modal/limit-temp-modal.component';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  selector: 'app-bieu-do-sensor',
  templateUrl: './bieu-do-sensor.component.html',
  styleUrls: ['./bieu-do-sensor.component.scss'],
})
export class BieuDoSensorComponent implements OnInit {
  @Input() zone: ZoneOnlySensor ;
  @Input() deviceSensor: DeviceSensor;
  currentDate = moment(new Date()).add(7, 'hours').toISOString();

  intervalUpdateTime = null;
  intervalUpdateToDate = null;
  interval = null;
  intervalUpdateTelemetry = null;
  intervaldb = null;

  chartColors: Color[] = [
    {
      borderColor: '#237BD3'
    }
  ];
  lineChartPlugins = [zoomPlugin];
  @ViewChild(NgxEchartsDirective) charts: NgxEchartsDirective;

  constructor(
    private route: ActivatedRoute,
    private giamsatService: GiamSatService,
    public modalController: ModalController,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
  ) { }

  ngOnInit() {
  }

  // tslint:disable-next-line: use-lifecycle-interface
  async ngOnChanges(changes?: SimpleChanges) {
    console.log('bieu do change', this.deviceSensor, this.deviceSensor.chartOption);
  }
  initEChartOptions(device: DeviceSensor) {
    device.echartDatasets = [];
    const dataSet: DataSet = {
      data: [],
      name: !!device.label ? device.label : device.name,
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 2,
      },
      showSymbol: false,
    };
    device.chartOption = {
      lineStyle: {
        width: 2
      },
      textStyle: {
        fontStyle: 'normal',
        fontFamily: 'Inter var',
        fontSize: 16
      },
      grid: {
        left: '5%',
        right: '4%',
        // bottom: '3%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0b0e10',
        textStyle: {
          fontSize: 10,
          color: "rgba(255, 255, 255, 1)",
          fontWeight: "bold"
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
            color: "#314147"
          }
        },
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff',
          interval: 0,
          rotate: 45,
          // formatter: '{dd}/{MM} {HH}:{mm}'
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
            color: "#314147"
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
        show: false,
      },
      dataZoom: [
        {
          minSpan: 10,
          type: 'inside',
        },
      ],
      series: [],
    };


    device.dataSensorCache.forEach((dataTs, index) => {
      if (dataTs.value !== null) {
        // push data for echarts
        const ts = dataTs.ts;
        const value = Number(parseFloat(dataTs.value).toFixed(1));
        const chartdata = [ts, value];
        dataSet.data.push(chartdata);
      } else {
        dataSet.data.push([dataTs.ts, dataTs.value]);
      }
    });
    // push data for echarts
    device.echartDatasets.push(dataSet);

    if (device.isSelectDuringTime) {
        device.chartOption.xAxis = {
          type: 'time',
          silent: false,
          splitLine: {
            show: true,
            lineStyle: {
              color: "#314147"
            }
          },
          axisLabel: {
            fontSize: 10,
            fontFamily: 'Inter var',
            color: '#fff',
            interval: 0,
            rotate: 45,
            formatter: '{dd}/{MM} {HH}:{mm}'
          },
          axisTick: {
            show: true,
            length: 3,
            interval: 2,
            inside: true,
            alignWithLabel: true,
          },
        }
        device.chartOption.series = device.echartDatasets;
      } else {
        device.chartOption.series = device.echartDatasets;
      }

    // check xem bieu do co null tat khong
    if (device.dataSensorCache.find(dataTs => dataTs.value !== null) == undefined) {
      device.chartOption.yAxis = {
        min: 0,
        max: 100,
        axisLabel: {
          fontSize: 10,
          fontFamily: 'Inter var',
          color: '#fff'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#314147"
          }
        },
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
      }
    }
  }
  
  async fromDateChange(event?: any) {
    if (moment(this.deviceSensor.fromDate).valueOf() !== moment(event).valueOf()) {
      // convert ms -> string
      this.deviceSensor.fromDate = new Date(moment(event).valueOf()).toISOString();
      this.deviceSensor.isFilter = true;
      // this.stopInterval();
    }

    this.checkSelectDuringTime();

    if (this.datesValid()) {
      clearInterval(this.interval);
      this.fetchDataSensorDevice(this.deviceSensor);
      // this.getOneDeviceDataAvg(device);
    }
  }

  async toDateChange(event?: any) {
    if (moment(this.deviceSensor.toDate).valueOf() !== moment(event).valueOf()) {
      this.deviceSensor.toDate = new Date(moment(event).valueOf()).toISOString();
      this.deviceSensor.isFilter = true;
      this.stopInterval();
    }

    this.checkSelectDuringTime();

    if (this.datesValid()) {
      clearInterval(this.interval);
      // fetch lai data
      this.fetchDataSensorDevice(this.deviceSensor);
      this.updateTelemetry(this.deviceSensor);
      // this.getOneDeviceDataAvg(device);
    }
  }

  backToYesterday() {
    this.stopInterval();

    this.deviceSensor.isFilter = true;
    this.deviceSensor.fromDate = moment(this.deviceSensor.fromDate).subtract(1, 'day').toISOString();
    this.deviceSensor.toDate = moment(this.deviceSensor.fromDate).add(1, 'day').subtract(1, 'minute').toISOString();

    this.fetchDataSensorDevice(this.deviceSensor);
    this.updateTelemetry(this.deviceSensor);
    // this.getOneDeviceDataAvg(device);
  }
  goToTomorrow() {
    if (moment().valueOf() > moment(this.deviceSensor.fromDate).valueOf()) {

      this.deviceSensor.fromDate = moment(this.deviceSensor.fromDate).add(1, 'day').toISOString();
      this.deviceSensor.toDate = moment(this.deviceSensor.fromDate).add(1, 'day').subtract(1, 'minute').toISOString();

      if (moment().format('DD-MM-YYYY') === moment(this.deviceSensor.fromDate).format('DD-MM-YYYY')) {
        // neu la ngay hien tai thi goi lai fetchdata tu 0h -> thoi diem hien tai
        this.stopUpdateTelemetry();
        // gan lai bien cho ion-datetime hien thi
        this.deviceSensor.toDate = moment().toISOString();

        // lay lai du lieu
        this.fetchDataSensorDevice(this.deviceSensor);
        // this.getOneDeviceDataAvg(device);
        // goi interval 1phut put 1 diem
        this.startInterval(this.deviceSensor);
        this.deviceSensor.isFilter = false;
      } else {
        // neu khong phai ngay hien tai thi stop interval
        this.stopInterval();
        this.deviceSensor.isFilter = true;
        this.fetchDataSensorDevice(this.deviceSensor);
        this.updateTelemetry(this.deviceSensor);
        // this.getOneDeviceDataAvg(device);
      }
    }
  }

  stopInterval() {
    if (!this.intervaldb) {
      return;
    }
    clearInterval(this.intervaldb);

    this.intervaldb = null;
  }

  
  setSliderChart(min?: number, max?: number, device?: DeviceSensor) {
    this.getMinSlider(min, device);
    this.getMaxSlider(max, device);

    this.initOptionChart(device, device.sliderLower, device.sliderUpper);
  }
  getMinSlider(min, device: DeviceSensor) {
    const startNumber = 0;
    const endNumber = 2;

    if (min < 10 && min >= 0) {
      device.sliderLower = 0;
    } else {
      const str = min.toString();
      const firstNumber = str.slice(startNumber, endNumber);
      device.sliderLower = Math.floor(firstNumber / 10) * 10 * (10 ** (str.length - endNumber));
    }
    device.lowerReset = device.sliderLower;
  }
  getMaxSlider(max, device: DeviceSensor) {
    max += 1;
    const startNumber = 0;
    const endNumber = 2;

    if (max < 10 && max >= 0) {
      device.sliderUpper = 10;
    } else {
      const str = max.toString();
      const firstNumber = str.slice(startNumber, endNumber);
      device.sliderUpper = Math.ceil(firstNumber / 10) * 10 * (10 ** (str.length - endNumber));
    }
    device.upperReset = device.sliderUpper;
  }
  initOptionChart(device: DeviceSensor, min: number, max: number) {
    device.deviceChartOptions = {
      elements: {
        point: {
          radius: 0
        }
      },
      responsive: true,
      defaultColor: '#333',
      legend: {
        display: false,
        position: 'bottom',
        labels: {
          fontColor: '#333'
        }
      },
      scales: {
        scaleLabel: {
          fontColor: '#333',
        },
        ticks: {
          fontColor: '#333',
          minor: {
            fontColor: '#333'
          }
        },
        xAxes: [{
          distribution: 'series',
          ticks: {
            fontColor: 'white'
          }
        }],
        yAxes: [
          {
            type: 'linear',
            display: true,
            scaleLabel: {
              display: true,
            },
            ticks: {
              fontColor: 'white',
              min,
              max,
              autoSkip: true,
              maxRotation: 0,
              major: {
                enabled: true
              },
            }

          },
        ],
      },
      tooltips: {
        mode: 'nearest',
        intersect: false,
        titleAlign: 'center',
        callbacks: {
        }
      },
      hover: {
        mode: 'nearest',
        intersect: false,
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
            speed: 10,
            threshold: 10,
          },
          zoom: {
            enabled: true,
            drag: false,
            mode: 'x',
          },
        },
      },
    };
    device.chartOption = {
      lineStyle: {
        width: 2
      },
      textStyle: {
        fontStyle: 'normal',
        fontFamily: 'Inter var',
        fontSize: 16
      },
      grid: {
        left: '5%',
        right: '4%',
        // bottom: '3%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0b0e10',
        textStyle: {
          fontSize: 10,
          color: 'rgba(255, 255, 255, 1)',
          fontWeight: 'bold'
        },
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
        borderWidth: 0,
        confine: true
      },
      xAxis: {
        type: 'time',
        min: moment().subtract(1,'hours').valueOf(),
        max: moment().valueOf(),
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
          rotate: 45
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
        min: 0,
        max: 10,
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
        show: false
      },
      dataZoom: [
        {
          minSpan: 10,
          type: 'inside',
        },
      ],
      series: device.echartDatasets,
    }
  }
  updateEchartOptions() {
    this.deviceSensor.echartDatasets = [];
    const dataSet: DataSet = {
      data: [],
      name: !!this.deviceSensor.label ? this.deviceSensor.label : this.deviceSensor.name,
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 2,
      },
      showSymbol: false,
    };
    this.deviceSensor.dataSensorCache.forEach(dataTs => {
      // push data for echarts
      const ts = dataTs.ts;
      const value = Number(parseFloat(dataTs.value).toFixed(2));
      const chartdata = [ts, value];
      dataSet.data.push(chartdata);
    });
    // push dataset cho echart
    this.deviceSensor.echartDatasets.push(dataSet);
    // this.deviceSensor.chartOption = {
    //   lineStyle: {
    //     width: 2
    //   },
    //   textStyle: {
    //     fontStyle: 'normal',
    //     fontFamily: 'Inter var',
    //     fontSize: 16
    //   },
    //   grid: {
    //     left: '5%',
    //     right: '4%',
    //     // bottom: '3%',
    //     containLabel: true,
    //   },
    //   tooltip: {
    //     trigger: 'axis',
    //     backgroundColor: '#0b0e10',
    //     textStyle: {
    //       fontSize: 10,
    //       color: 'rgba(255, 255, 255, 1)',
    //       fontWeight: 'bold'
    //     },
    //     // position: ['15%', '40%'],
    //     alwaysShowContent: false,
    //     displayMode: 'single',
    //     z: 60,
    //     triggerOn: 'mousemove|click',
    //     axisPointer: {
    //       type: 'line',
    //       axis: 'auto',
    //       label: {
    //         show: false
    //       }
    //     },
    //     borderWidth: 0,
    //     confine: true
    //   },
    //   xAxis: {
    //     type: 'time',
    //     silent: false,
    //     splitLine: {
    //       show: true,
    //       lineStyle: {
    //         color: '#314147'
    //       }
    //     },
    //     axisLabel: {
    //       fontSize: 12,
    //       fontFamily: 'Inter var',
    //       color: '#fff',
    //       interval: 0,
    //       rotate: 45
    //     },
    //     axisTick: {
    //       show: true,
    //       length: 3,
    //       interval: 2,
    //       inside: true,
    //       alignWithLabel: true,
    //     },
    //   },
    //   yAxis: {
    //     // min: 0,
    //     // max: 1000,
    //     axisLabel: {
    //       fontSize: 14,
    //       fontFamily: 'Inter var',
    //       color: '#fff'
    //     },
    //     splitLine: {
    //       show: true,
    //       lineStyle: {
    //         color: '#314147'
    //       }
    //     },
    //     axisLine: {
    //       show: true
    //     },
    //     axisTick: {
    //       show: true
    //     },
    //   },
    //   legend: {
    //     show: false
    //   },
    //   dataZoom: [
    //     {
    //       minSpan: 10,
    //       type: 'inside',
    //     },
    //   ],
    //   series: this.deviceSensor.echartDatasets
    // };

    this.deviceSensor.updateChartOption = {
      series: this.deviceSensor.echartDatasets
    };


    console.log('updateEchartOptions', this.deviceSensor.updateChartOption);
    console.log('chartOptions', this.deviceSensor.chartOption);
  }
  async fetchDataSensorDevice(device?: DeviceSensor) {
    const timeToQuery = new Date(device.toDate).getTime() - new Date(device.fromDate).getTime();
    const intervalTime = this.caculateIntervalTime(timeToQuery);

    // tslint:disable-next-line: max-line-length
    await this.getDataTsSensor(intervalTime, device.id, device.telemetryType, moment(device.fromDate).valueOf(), moment(device.toDate).valueOf())
    .then(async data => {
      device.listDataValue = [];

      if (!!data) {
        // console.log('co co data');
        // data tra ve mang object DataTimeseries
        device.dataSensorCache = [];
        device.dataSensorCache = data;
        device.dataSensorCache.forEach(dataTs => {
          if (dataTs.value !== null) {
            if (device.tbKey.includes('Lux')) {
              dataTs.value = Math.round(dataTs.value);
            } else {
              dataTs.value = parseFloat(dataTs.value).toFixed(1);
            }
          }
        });

        // fix time diem cuoi = time hien tai
        if (moment().valueOf() === moment(device.fromDate).valueOf()) {
          device.dataSensorCache[device.dataSensorCache.length - 1].ts
          = device.dataSensorCache[device.dataSensorCache.length - 1].ts
          !== moment().valueOf() ? moment().valueOf()
          : device.dataSensorCache[device.dataSensorCache.length - 1].ts;
        }

        setTimeout(() => {
          this.initEChartOptions(this.deviceSensor);
        }, 100);

        data.forEach(dataTs => {
          if (device.tbKey.includes('Lux')) {
            device.listDataValue.push(Math.round(dataTs.value));
          } else {
            device.listDataValue.push(parseFloat(dataTs.value).toFixed(1));
          }
        });
      } else {
        // console.log('khong co data');
        return;
      }
    });
  }

  // get data sensor device
  async getDataTsSensor(interval: number, deviceId, deviceType, startTs: number, endTs: number) {
    const entityType = 'DEVICE';
    const limit = 0;
    const agg = 'AVG';
    const orderBy = 'DESC';

    // api tra ve object theo telemetry type - chua mang object ts value
    const dataSensor = await this.giamsatService.getDataSensorDevice(
      entityType,
      deviceId,
      interval,
      limit,
      agg,
      orderBy,
      deviceType,
      startTs.toString(),
      endTs.toString()).toPromise();

    // api tra ve gia tri null
    const dataSensorAvg = await this.giamsatService.getDataSensorAvg(
      deviceId,
      deviceType,
      startTs.toString(),
      endTs.toString(),
      interval,
      orderBy
    ).toPromise();

    // console.log(dataSensor);
    return dataSensorAvg[deviceType];
  }

  // tính toán interval theo khoảng giá trị của filter
  caculateIntervalTime(timeToQuery): number {
    // time < 12h
    // if(timeToQuery < 12*60*60*1000)
    // {
    //   return 60*1000;
    // }
    // time < 24 hour
    if (timeToQuery <= 24 * 60 * 60 * 1000) {
      return 5 * 60 * 1000; // 5 phut
    }
    // 24 hour < time < 7 days
    if (timeToQuery > 24 * 60 * 60 * 1000 && timeToQuery <= 7 * 24 * 60 * 60 * 1000) {
      return 40 * 60 * 1000; // 40min
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

  checkSelectDuringTime() {
    if (moment(this.deviceSensor.fromDate).format('DD/MM/YYYY') === moment(this.deviceSensor.toDate).format('DD/MM/YYYY')) {
      this.deviceSensor.isSelectDuringTime = false;
    } else {
      this.deviceSensor.isSelectDuringTime = true;
    }
  }

  filterTime() {
    this.deviceSensor.isFilter = true;
  }

  datesValid() {
    return this.deviceSensor?.toDate > this.deviceSensor?.fromDate;
  }

  async presentTempPrompt(min, max) {
    const modal = await this.modalController.create({
      component: LimitTempModalComponent,
      cssClass: 'my-custom-modal-css',
      swipeToClose: true,
      backdropDismiss: true,
      componentProps: {
        minReset: min,
        maxReset: max,
        lower: this.deviceSensor.sliderLower,
        upper: this.deviceSensor.sliderUpper,
      },
    });
    await modal.present();
    const rs = await modal.onWillDismiss();
    if (!rs?.data) { return; }
    if (!!rs.data.data) {
      this.deviceSensor.sliderLower = rs.data.data.lower;
      this.deviceSensor.sliderUpper = rs.data.data.upper;
      this.deviceSensor.changeSlider = rs.data.changeSlider;
    } else if (rs.data?.data === 'reset') {
      this.deviceSensor.sliderLower = null;
      this.deviceSensor.sliderUpper = null;
    } else if (rs.data === undefined) { return; }

    this.updateDeviceLimit(this.deviceSensor, this.deviceSensor.sliderLower, this.deviceSensor.sliderUpper);

  }

  async presentHumidityPrompt(min, max) {
    const modal = await this.modalController.create({
      component: LimitDoModalComponent,
      cssClass: 'my-custom-modal-css',
      swipeToClose: true,
      backdropDismiss: true,
      componentProps: {
        minReset: min,
        maxReset: max,
        lower: this.deviceSensor.sliderLower,
        upper: this.deviceSensor.sliderUpper,
      },
    });
    await modal.present();
    const rs = await modal.onWillDismiss();
    if (!rs?.data) { return; }
    if (!!rs.data.data) {
      this.deviceSensor.sliderLower = rs.data.data.lower;
      this.deviceSensor.sliderUpper = rs.data.data.upper;
      this.deviceSensor.changeSlider = rs.data.changeSlider;
    } else if (rs.data?.data === 'reset') {
      this.deviceSensor.sliderLower = null;
      this.deviceSensor.sliderUpper = null;
    } else if (rs.data === undefined) { return; }

    this.updateDeviceLimit(this.deviceSensor, this.deviceSensor.sliderLower, this.deviceSensor.sliderUpper);

  }

  async presentLuxPrompt(min, max) {
    const modal = await this.modalController.create({
      component: LimitSalModalComponent,
      cssClass: 'my-custom-modal-css',
      swipeToClose: true,
      backdropDismiss: true,
      componentProps: {
        minReset: min,
        maxReset: max,
        lower: this.deviceSensor.sliderLower,
        upper: this.deviceSensor.sliderUpper,
      },
    });
    await modal.present();
    const rs = await modal.onWillDismiss();
    if (!rs?.data) { return; }
    if (!!rs.data.data) {
      this.deviceSensor.sliderLower = rs.data.data.lower;
      this.deviceSensor.sliderUpper = rs.data.data.upper;
      this.deviceSensor.changeSlider = rs.data.changeSlider;
    } else if (rs.data?.data === 'reset') {
      this.deviceSensor.sliderLower = null;
      this.deviceSensor.sliderUpper = null;
    } else if (rs.data === undefined) { return; }

    this.updateDeviceLimit(this.deviceSensor, this.deviceSensor.sliderLower, this.deviceSensor.sliderUpper);
  }

  async presentUnknowPrompt(min, max) {
    const modal = await this.modalController.create({
      component: LimitTypeUnknownComponent,
      cssClass: 'my-custom-modal-css',
      swipeToClose: true,
      backdropDismiss: true,
      componentProps: {
        minReset: min,
        maxReset: max,
        lower: this.deviceSensor.sliderLower,
        upper: this.deviceSensor.sliderUpper,
      },
    });
    await modal.present();
    const rs = await modal.onWillDismiss();
    if (!rs?.data) { return; }
    if (!!rs.data.data) {
      this.deviceSensor.sliderLower = rs.data.data.lower;
      this.deviceSensor.sliderUpper = rs.data.data.upper;
      this.deviceSensor.changeSlider = rs.data.changeSlider;
    } else if (rs.data?.data === 'reset') {
      this.deviceSensor.sliderLower = null;
      this.deviceSensor.sliderUpper = null;
    } else if (rs.data === undefined) { return; }

    this.updateDeviceLimit(this.deviceSensor, this.deviceSensor.sliderLower, this.deviceSensor.sliderUpper);

  }

  updateDeviceLimit(device: DeviceSensor, minInput, maxInput) {
    device.deviceChartOptions = {
      responsive: true,
      defaultColor: '#333',
      elements: {
        point: {
          radius: 0
        }
      },
      legend: {
        display: false,
        position: 'bottom',
      },
      scales: {
        scaleLabel: {
          fontColor: '#333',
        },
        ticks: {
          fontColor: '#333',
          minor: {
            fontColor: '#333'
          }
        },
        xAxes: [{
          distribution: 'series',
          ticks: {
            fontColor: 'white'
          }
        }],
        yAxes: [
          {
            type: 'linear',
            ticks: {
              fontColor: 'white',
              min: minInput,
              max: maxInput,
              autoSkip: true,
              maxRotation: 0,
              maxTicksLimit: 8,
              major: {
                enabled: true
              },
            },
            display: true,
            scaleLabel: {
              display: true,
            },
          },
        ],
      },
      tooltips: {
        mode: 'nearest',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: false,
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
            speed: 10,
            threshold: 10,
          },
          zoom: {
            enabled: true,
            drag: false,
            mode: 'x',
          },
        },
      },
    };
    device.updateChartOption = {
      yAxis: {
        min: minInput,
        max: maxInput
      },
    }
  }

  converTime(time: number) {
    return moment(time).format('HH:mm DD/MM');
  }

  // goi interval va update time cho ngay hien tai
  // ngay cua qua khu thi stop interval
  startInterval(device: DeviceSensor) {
    this.stopInterval();
    const intervalDefalt = 300000; // 5phut
    this.intervaldb = setInterval(() => {
      const startTs = moment(device.tsLastChart).add(2, 'minute').add(30, 'second').valueOf();
      const endTs = moment(device.tsLastChart).add(7, 'minute').add(30, 'second').valueOf();
      // this.fetchDataSensorListDevice(intervalDefalt, startTs, endTs);
      // this.getListDeviceSensorAvgUpdate(fromTime.toString(), toTime.toString(), intervalDefalt);
    }, 300000);
  }

  // update lastest telemetry moi phut
  updateTelemetry(device: DeviceSensor) {
    this.stopUpdateTelemetry();

    this.intervalUpdateTelemetry = setInterval(() => {
      const startTs = moment(device.tsLastChart).add(2, 'minute').add(30, 'second').valueOf();
      const endTs = moment(device.tsLastChart).add(7, 'minute').add(30, 'second').valueOf();

      this.getLastestTelemetrySensor(startTs, endTs);
    }, 300000);
  }

  // get du lieu telemetry trung binh moi nhat cua sensor
  getLastestTelemetrySensor(startTs: number, endTs: number) {
    const interval = 300000;
    this.getDataTsSensor(interval, this.deviceSensor.id, this.deviceSensor.telemetryType, startTs, endTs).then(data => {
      // console.log('1051',data, moment(startTs).format('HH:mm:ss'), moment(endTs).format('HH:mm:ss'));

      if (!!data) {
        // data tra ve mang object DataTimeseries
        data.forEach(dataTs => {
          if (this.deviceSensor.tbKey.includes('Lux')) {
            this.deviceSensor.telemetryData = {
              value: Math.round(dataTs.value),
              ts: moment(dataTs.ts).valueOf() !== moment().valueOf() ? moment().valueOf() : dataTs.ts,
              alarm: this.checkValueWarning(this.deviceSensor, dataTs.value, dataTs.ts),
            };
          } else {
            this.deviceSensor.telemetryData = {
              value: Number(parseFloat(dataTs.value.toString()).toFixed(1)),
              ts: moment(dataTs.ts).valueOf() !== moment().valueOf() ? moment().valueOf() : dataTs.ts,
              alarm: this.checkValueWarning(this.deviceSensor, dataTs.value, dataTs.ts),
            };
          }
        });
      } else {
        // device mat ket noi
        this.deviceSensor.telemetryData = {
          value: null,
          ts: null,
          alarm: false,
        };
      }
    });
  }

  checkValueWarning(device: DeviceSensor, value: number, ts?: number): boolean {
    if (value !== null) {
      this.giamsatService.checkTelemetryRule(device.id, device.telemetryType[0], value, ts)
      .subscribe(res => {
        device.telemetryData.alarm = res;
      });
      return device.telemetryData.alarm;
    }
  }

  stopUpdateTelemetry() {
    if (!this.intervalUpdateTelemetry) {
      return;
    }
    clearInterval(this.intervalUpdateTelemetry);
    this.intervalUpdateTelemetry = null;
  }

  checkMaxCurrentTime() {
    return moment().format('DD-MM-YYYY') === moment(this.deviceSensor.fromDate).format('DD-MM-YYYY');
  }

  // doi ten bieu do
  async editNameChart(device: DeviceSensor) {
    const alert = await this.alertController.create({
      header: 'Đổi tên biểu đồ',
      backdropDismiss: true,
      inputs: [
        {
          name: 'nameChart',
          type: 'text',
          placeholder: 'Tên biểu đồ',
          value: device.nameChart
        }
      ],
      buttons: [
        {
          text: 'Huỷ bỏ',
          role: 'Cancel',
          handler: (value) => {
          }
        },
        {
          text: 'Xác nhận',
          handler: (value) => {
            if (device.nameChart !== value.nameChart) {
              this.updateNameChart(device, value.nameChart);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  public async updateNameChart(device: DeviceSensor, chartName: string) {
    const loading = await this.loadingCtrl.create({ message: '' });
    this.giamsatService.updateNameChart(chartName, device.id, device.telemetryType[0]).subscribe(res => {
      loading.present();
      setTimeout(() => {
        loading.dismiss();
        this.showToast('Đổi tên thành công!', 'success');
        device.nameChart = res.chartName;
      }, 1000);
    }, err => {
      this.showToast('Đổi tên thất bại!', 'danger');
      loading.dismiss();
    });
  }

  // Show toast
  private showToast(meseage: string, color: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color,
        duration: 2000,
      })
      .then((toatEL) => toatEL.present());
  }
}
