import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GiamSatDamTom, GiamSatDevice, Zone } from '../giam-sat-update.model';

@Component({
  selector: 'app-giam-sat-zone',
  templateUrl: './giam-sat-zone.component.html',
  styleUrls: ['./giam-sat-zone.component.scss'],
})
export class GiamSatZoneComponent implements OnInit {
  @Input() zoneSensor: Zone;
  @Input() damTom: GiamSatDamTom;
  telemetryIcons = {
    // Temperature: {
    //   nomal: 'assets/icon-darkmode/1_Nhietdo_active.png',
    //   disconnected: 'assets/icon-darkmode/1_Nhietdo_dis.png',
    //   alarm: 'assets/icon-darkmode/1_Nhietdo_vp.png',
    //   unit: '°C'
    // },
    // Humidity: {
    //   nomal: 'assets/icon-darkmode/3_Doam_active.png',
    //   disconnected: 'assets/icon-darkmode/3_Doam_dis.png',
    //   alarm: 'assets/icon-darkmode/3_Doam_vp.png',
    //   unit: '%'
    // },
    // Lux: {
    //   nomal: 'assets/icon-darkmode/2_Anhsang_active.png',
    //   disconnected: 'assets/icon-darkmode/2_Anhsang_dis.png',
    //   alarm: 'assets/icon-darkmode/2_Anhsang_vp.png',
    //   unit: 'lux'
    // },
    CAMBIEN_NHIETDO: {
      safeTy: 'assets/icon-darkmode/1_Nhietdo_xanh_la.png',
      nguongDuoi: 'assets/icon-darkmode/1_Nhietdo_active.png',
      disconnected: 'assets/icon-darkmode/1_Nhietdo_dis.png',
      alarm: 'assets/icon-darkmode/1_Nhietdo_vp.png',
      unit: '°C'
    },
    CAMBIEN_DOAM: {
      safeTy: 'assets/icon-darkmode/3_Doam_xanh_la.png',
      nguongDuoi: 'assets/icon-darkmode/3_Doam_active.png',
      disconnected: 'assets/icon-darkmode/3_Doam_dis.png',
      alarm: 'assets/icon-darkmode/3_Doam_vp.png',
      unit: '%'
    },
    CAMBIEN_ANHSANG: {
      safeTy: 'assets/icon-darkmode/2_Anhsang_xanh_la.png',
      nguongDuoi: 'assets/icon-darkmode/2_Anhsang_active.png',
      disconnected: 'assets/icon-darkmode/2_Anhsang_dis.png',
      alarm: 'assets/icon-darkmode/2_Anhsang_vp.png',
      unit: 'lux'
    },
    Unknown: {
      safeTy: 'assets/icon-darkmode/11_Sensor_xanh_la.png',
      nguongDuoi: 'assets/icon-darkmode/11_Sensor_active.png',
      disconnected: 'assets/icon-darkmode/11_Sensor_dis.png',
      alarm: 'assets/icon-darkmode/11_Sensor_vang.png',
      unit: ''
    },
    DEFAULT: {
      safeTy: 'assets/icon-darkmode/11_Sensor_xanh_la.png',
      nguongDuoi: 'assets/icon-darkmode/11_Sensor_active.png',
      disconnected: 'assets/icon-darkmode/11_Sensor_dis.png',
      alarm: 'assets/icon-darkmode/11_Sensor_vang.png',
      unit: ''
    },
    CAMBIEN_KHAC: {
      safeTy: 'assets/icon-darkmode/11_Sensor_xanh_la.png',
      nguongDuoi: 'assets/icon-darkmode/11_Sensor_active.png',
      disconnected: 'assets/icon-darkmode/11_Sensor_dis.png',
      alarm: 'assets/icon-darkmode/11_Sensor_vang.png',
      unit: ''
    }
  };

  accordionExpanded = true;
  constructor(
    private router: Router,
  ) { }

  ngOnInit() {

  }
  ngOnChanges() {
  }
  duLieuCamBien(sensorDevice: GiamSatDevice) {
    this.router.navigate(['/home/giam-sat/du-lieu-cam-bien'],
    {queryParams: {
      damtomid: this.damTom.id,
      segment: sensorDevice.telemetryType,
      zoneId: this.zoneSensor.id !== null ? this.zoneSensor.id : 'null',
      deviceId: sensorDevice.id
    }});
  }
  toggleAccordion() {
    this.accordionExpanded = !this.accordionExpanded;
  }

}
