import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  defaultHttpOptionsFromConfig,
  RequestConfig,
} from '../http/http-utils';
import { environment as env } from 'src/environments/environment';
import { PageLink, TimePageLink } from 'src/app/shared/models/page/page-link';
import { PageData } from 'src/app/shared/models/page/page-data';
import { AlarmHistory, BoDuLieuCamBien } from 'src/app/shared/models/giamsat.model';
import { DamtomFull } from 'src/app/shared/models/damtom.model';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Zone } from 'src/app/pages/home/giam-sat/giam-sat-update.model';

@Injectable({
  providedIn: 'root',
})
export class GiamSatService {
  constructor(
    private http: HttpClient,
    private localStorage: LocalStorageService
  ) { }
  // Lấy danh sách đầm tôm
  public getDanhSachDamTom(): Observable<any> {
    return this.http.get<any>(env.backendBaseUrl + `/api/dam-tom/active/mobi`);
  }
  // Lấy dữ liệu cho chart
  public getDashBoardData(
    entityType: string,
    entityId: string,
    keys: string,
    useStrictDataTypes: boolean,
    config?: RequestConfig
  ): Observable<any> {
    const params = new HttpParams()
      .set('keys', keys)
      .set('useStrictDataTypes', useStrictDataTypes.toString());
    return this.http.get<any>(
      env.backendBaseUrl +
      `/api/plugins/telemetry/${entityType}/${entityId}/values/timeseries`,
      { params }
    );
  }
  // Lấy dữ liệu cảm biến từ đầu ngày
  public getDuLieuCamBienCu(
    entityType: string,
    entityId: string,
    interval: number,
    limit: number,
    orderBy: string,
    keys: string,
    startTs: string,
    endTs: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('interval', interval.toString())
      .set('limit', limit.toString())
      .set('agg', 'AVG')
      .set('orderBy', orderBy)
      .set('keys', keys)
      .set('useStrictDataTypes', 'false')
      .set('startTs', startTs)
      .set('endTs', endTs);
    return this.http.get<any>(
      env.backendBaseUrl +
      `/api/plugins/telemetry/${entityType}/${entityId}/values/timeseries`,
      { params }
    );
  }

  public getDuLieuCamBienById(
    damTomId: string,
    startTime: string,
    endTime: string,
    pageLink: PageLink,
    config?: RequestConfig): Observable<PageData<BoDuLieuCamBien>> {
    const params = new HttpParams()
      .set('damTomId', damTomId)
      .set('startTime', startTime)
      .set('endTime', endTime);
    return this.http.get<PageData<BoDuLieuCamBien>>(env.backendBaseUrl + `/api/du-lieu-cb${pageLink.toQuery()}`, { params });
  }

  public getDanhSachCanhBaoById(
    damTomId: string,
    timePageLink: TimePageLink,
    config?: RequestConfig
  ): Observable<PageData<AlarmHistory>> {
    return this.http.get<PageData<AlarmHistory>>(env.backendBaseUrl + `/api/alarm-history${timePageLink.toQuery()}&damtomId=${damTomId}`,
      defaultHttpOptionsFromConfig(config));
  }
  public getDanhSachCanhBaoByIdV2(
    damTomId: string,
    timePageLink: TimePageLink,
    config?: RequestConfig
  ): Observable<PageData<AlarmHistory>> {
    return this.http.get<PageData<AlarmHistory>>(env.backendBaseUrl + `/api/mobile/alarm-history-v2${timePageLink.toQuery()}&damtomId=${damTomId}`,
      defaultHttpOptionsFromConfig(config));
  }
  public getAllDanhSachCanhBao(
    timePageLink: TimePageLink,
    config?: RequestConfig
  ): Observable<PageData<AlarmHistory>> {
    return this.http.get<PageData<AlarmHistory>>(env.backendBaseUrl + `/api/mobile/alarm-history${timePageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getAllDanhSachCanhBaoV2(
    timePageLink: TimePageLink,
    config?: RequestConfig
  ): Observable<PageData<AlarmHistory>> {
    return this.http.get<PageData<AlarmHistory>>(env.backendBaseUrl + `/api/mobile/alarm-history-v2${timePageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config));
  }

  // update get ds canh
  public getAllDanhSachCanhBaoV3(startTime: number, endTime: number, damtomId?: string,): Observable<AlarmHistory[]> {
    if(!!damtomId){
      const params = new HttpParams()
          .set('damtomId', damtomId)
          .set('startTime', startTime.toString())
          .set('endTime', endTime.toString());
      return this.http.get<AlarmHistory[]>(env.backendBaseUrl + '/api/mobile/alarm-history', {params});
    }else{
      const params = new HttpParams()
          .set('startTime', startTime.toString())
          .set('endTime', endTime.toString());
      return this.http.get<AlarmHistory[]>(env.backendBaseUrl + '/api/mobile/alarm-history', {params});
    }
  }

  // update get ds canh v4
  public getDanhSachCanhBaoV4(
    timePageLink?: TimePageLink,
    damtomId?: string,
    config?: RequestConfig): Observable<PageData<AlarmHistory>> {
    if (!!damtomId){
      return this.http.get<PageData<AlarmHistory>>
      (env.backendBaseUrl + `/api/mobile/alarm-history-v2${timePageLink.toQuery()}&damtomId=${damtomId}`,
      defaultHttpOptionsFromConfig(config));
    }else{
      return this.http.get<PageData<AlarmHistory>>
      (env.backendBaseUrl + `/api/mobile/alarm-history-v2${timePageLink.toQuery()}`, defaultHttpOptionsFromConfig(config));
    }
  }

  // update ds canh bao l5
  // get ds canh bao clear false
  public getAlarmsClearFalse(timePageLink?: TimePageLink, damtomId?:string, config?: RequestConfig): Observable<PageData<AlarmHistory>> {
    if (!!damtomId) {
      return this.http.get<PageData<AlarmHistory>>
      (env.backendBaseUrl + `/api/mobile/alarm-clear-false${timePageLink.toQuery()}&damtomId=${damtomId}`,
      defaultHttpOptionsFromConfig(config));
    } else {
      return this.http.get<PageData<AlarmHistory>>
      (env.backendBaseUrl + `/api/mobile/alarm-clear-false${timePageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config));
    }
  }

  // gget ds canh bao clear true 
  public getAlarmsClearTrue(timePageLink?: TimePageLink, damtomId?:string, config?: RequestConfig): Observable<PageData<AlarmHistory>> {
    if (!!damtomId) {
      return this.http.get<PageData<AlarmHistory>>
      (env.backendBaseUrl + `/api/mobile/alarm-clear-true${timePageLink.toQuery()}&damtomId=${damtomId}`,
      defaultHttpOptionsFromConfig(config));
    } else {
      return this.http.get<PageData<AlarmHistory>>
      (env.backendBaseUrl + `/api/mobile/alarm-clear-true${timePageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config));
    }
  }

  // get ds canh bao clear true
  public clearCanhBao(
    snapShotId: string,
    config?: RequestConfig
  ): Observable<AlarmHistory> {
    return this.http.put<AlarmHistory>(env.backendBaseUrl + `/api/alarm-history/${snapShotId}`, defaultHttpOptionsFromConfig(config));
  }
  //  clear all canh bao
  public clearAllCanhBao(
    nvuonId: string,
    config?: RequestConfig
  ) {
    if (nvuonId === 'all'){
      return this.http.put(env.backendBaseUrl + `/api/alarm-history/ack-all`, defaultHttpOptionsFromConfig(config));
    }
    else{
      return this.http.put(env.backendBaseUrl + `/api/alarm-history/ack-all?damTomId=${nvuonId}`, defaultHttpOptionsFromConfig(config));
    }
  }
  public getListAlarm(damTomId: string): Observable<AlarmHistory> {
    return this.http.get<AlarmHistory>(env.backendBaseUrl + `/api/active-alarm/${damTomId}`);
  }

  public getDamTomGateWay(gatewayId: string, config?: RequestConfig): Observable<any> {
    return this.http.get<any>(env.backendBaseUrl + `/api/dam-tom/device/${gatewayId}`, defaultHttpOptionsFromConfig(config));
  }


  public getLastestTelemetry(entityId: string, config?: RequestConfig): Observable<any> {
    return this.http.get<any>(env.backendBaseUrl + `/api/telemetry/${entityId}/lastest/timeseries`, defaultHttpOptionsFromConfig(config));
  }

  public CountAlarmByDamTom(damTomId?: string, config?: RequestConfig): Observable<number> {
    if (!!damTomId) {
      return this.http.get<number>(env.backendBaseUrl + `/api/active-alarm/count?damTomId=${damTomId}`, defaultHttpOptionsFromConfig(config));
    }
    return this.http.get<number>(env.backendBaseUrl + `/api/active-alarm/count`, defaultHttpOptionsFromConfig(config));
  }
  // Get đầm tôm by Id
  getDamtomById(id: string): Observable<DamtomFull> {
    const apiUrlDamtom = env.backendBaseUrl + '/api/dam-tom';
    return this.http.get<DamtomFull>(`${apiUrlDamtom}/${id}`);
  }
  //get list sensor device theo zone
  public getListSensorDeviceZone(damtomId?: string, config?: RequestConfig): Observable<any[]> {
    return this.http.get<any[]>(env.backendBaseUrl + `/api/damtom-zone?damtomId=${damtomId}`, defaultHttpOptionsFromConfig(config));
  }

  public getCachingDamTomZones(damTomId): Zone[] {
    return this.localStorage.getItem(`${damTomId}-zones`);
  }

  public cacheDamTomZones(damTomId, zones: Zone[]) {
    this.localStorage.setItem(`${damTomId}-zones`, zones);
  }
  
  //get one zone
  public getZone(zoneId: string, config?: RequestConfig): Observable<any>{
    return this.http.get<any>(env.backendBaseUrl + `/api/damtom-zone/${zoneId}`, defaultHttpOptionsFromConfig(config))
  }
  //get zone have only sensor device in dam tom
  public getZoneOnlySensorDevice(damtomId?: string, config?: RequestConfig): Observable<any[]>{
    return this.http.get<any[]>(env.backendBaseUrl + `/api/damtom-zone/${damtomId}/sensorDevices2`,defaultHttpOptionsFromConfig(config))
  }
  //get du lieu cam bien api telemetry-controller/getTimeseries: api thingsboard
  public getDataSensorDevice(
      entityType?:string,
      entityId?:string,
      interval?:number,
      limit?:number,
      agg?:string,
      orderBy?:string,
      keys?:string,
      startTs?:string,
      endTs?:string): Observable<any>{
    const params = new HttpParams()
        .set('interval',interval.toString())
        .set('limit',interval.toString())
        .set('agg', agg)
        .set('orderBy',orderBy)
        .set('keys',keys)
        .set('useStrictDataTypes', 'false')
        .set('startTs',startTs)
        .set('endTs',endTs);
    return this.http.get<any>(env.backendBaseUrl + `/api/plugins/telemetry/${entityType}/${entityId}/values/timeseries`, {params})
  }
  
  //get avg du lieu cam bien: api a Binh
  public getDataSensorAvg(
      deviceId?:string,
      key?:string,
      startTs?:string,
      endTs?:string,
      interval?:number,
      orderBy?:string): Observable<any>{
    const params = new HttpParams()
        .set('key',key)
        .set('startTs',startTs)
        .set('endTs',endTs)
        .set('interval', interval.toString())
        .set('orderBy', orderBy);
    return this.http.get<any>(env.backendBaseUrl + `/api/telemetry/${deviceId}/values/timeseries`, {params})
  }
  //get du lieu cam bien api update
  public getDataSensorLastest(deviceId?: string, deviceType?:string) : Observable<any>{
    return this.http.get<any>(env.backendBaseUrl + `/api/telemetry/${deviceId}/lastest/timeseries?keys=${deviceType}`);
  }
  
  //api tong hop model giam sat
  public getAllDataDamTom(damTomId: string,  config?: RequestConfig): Observable<any>{
    return this.http.get<any>(env.backendBaseUrl + `/api/gs-damtom/${damTomId}`, defaultHttpOptionsFromConfig(config));
  }
  //get min max 
  public getMinMax(deviceId: string, key:string, startTs: string, endTs: string): Observable<any>{
    const params = new HttpParams()
        .set('key', key)
        .set('startTs', startTs)
        .set('endTs', endTs)
    return this.http.get<any>(env.backendBaseUrl + `/api/telemetry/${deviceId}/min-max/timeseries`, {params});
  }
  
  //check vi pham luat canh bao
  public checkTelemetryRule(deviceId: string, telemetryType: string, value: number, ts: number): Observable<any>{
    if (!!value) {
      const params = new HttpParams()
      .set('value', value.toString())
      .set('ts', ts.toString())
      return this.http.get<any>(env.backendBaseUrl + `/api/telemetry/${deviceId}/${telemetryType}/valid`, {params});
    }
  }

  //doi ten bieu do
  public getNameChart(deviceId: string, telemetryType: string): Observable<any>{
    const params = new HttpParams()
    .set('deviceId', deviceId)
    .set('telemetry', telemetryType)
    return this.http.get<any>(env.backendBaseUrl + '/api/chart-config', {params});
  }

  public updateNameChart(chartName: string, deviceId: string, telemetryType: string): Observable<any>{
    const chartConfigDto = {
      chartName: chartName,
      deviceId: deviceId,
      telemetry: telemetryType,
    }
    return this.http.post<any>(env.backendBaseUrl + '/api/chart-config', chartConfigDto);
  }
}

