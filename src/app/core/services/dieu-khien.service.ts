import { AutomaticRpc, DeviceRpc, GroupRpc, LichSuDK, LichSuDKResponse, RpcCommandDto, RpcScheduleDto } from './../../shared/models/dieukhien.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from 'src/environments/environment';
import { defaultHttpOptionsFromConfig, RequestConfig } from '../http/http-utils';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { DieuKhienDto, RpcSettingDto } from 'src/app/shared/models/dam-tom-rpc-alarm';
import { SpecialDevice } from 'src/app/pages/home/quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';
import { ToastController } from '@ionic/angular';

export interface ActionRem {
  id: string; // id special device
  rpcRemMode: string; // PUSH - PULL - STOP
  stopOption: number;
}
@Injectable({
  providedIn: 'root'
})
export class DieuKhienService {
  damTomIdSelected = new Subject<string>();
  // luu damtomid cho TH chua co subscribe khi moi vao app
  public damTomId: string;

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController
  ) { 
  }

  // update api get rpc theo zone da sort
  public getListZoneRpcUpdate(damTomId: string, config?: RequestConfig): Observable<any>{
    return this.http.get<any>(env.backendBaseUrl + `/api/rpc-device/zone?damTomId=${damTomId}`, defaultHttpOptionsFromConfig(config));
  }
  public getAllRpcDevice(damtomId: string, config?: RequestConfig): Observable<DeviceRpc[]> {
    const params = new HttpParams()
      .set('damTomId', damtomId);
    return this.http.get<DeviceRpc[]>(env.backendBaseUrl + `/api/rpc-device`, { params });
  }
  // get list rpc device theo zone
  public getListRpcDeviceZone(damtomId?: string, config?: RequestConfig): Observable<any[]>{
    return this.http.get<any[]>(env.backendBaseUrl + `/api/damtom-zone?damtomId=${damtomId}`, defaultHttpOptionsFromConfig(config));
  }
  public getAllGroupRpc(damtomId: string, config?: RequestConfig): Observable<GroupRpc[]> {
    const params = new HttpParams()
      .set('damTomId', damtomId);
    return this.http.get<GroupRpc[]>(env.backendBaseUrl + `/api/group-rpc`, { params });
  }

  public getGroupRpcById(damtomId: string, id: string, config?: RequestConfig): Observable<GroupRpc> {
    return this.http.get<GroupRpc>(env.backendBaseUrl + `/api/group-rpc/${damtomId}/${id}`, defaultHttpOptionsFromConfig(config));
  }

  public saveGroupRpc(damtomId: string, groupRpc: GroupRpc, config?: RequestConfig): Observable<GroupRpc> {
    return this.http.post<GroupRpc>(env.backendBaseUrl + `/api/group-rpc/${damtomId}`, groupRpc, defaultHttpOptionsFromConfig(config));
  }

  public deleteGroupRpc(groupRPCId: string, config?: RequestConfig): Observable<any> {
    return this.http.delete<any>(env.backendBaseUrl + `/api/group-rpc/${groupRPCId}`, defaultHttpOptionsFromConfig(config));
  }

  public sendOneWayRpcCommand(deviceId: string, requestBody: any, config?: RequestConfig): Observable<any> {
    return this.http.post<any>(env.backendBaseUrl + `/api/plugins/rpc/oneway/${deviceId}`,
      requestBody,
      defaultHttpOptionsFromConfig(config));
  }

  public sendTwoWayRpcCommand(deviceId: string, requestBody: any, config?: RequestConfig): Observable<any> {
    return this.http.post<any>(env.backendBaseUrl + `/api/plugins/rpc/twoway/${deviceId}`,
      requestBody,
      defaultHttpOptionsFromConfig(config));
  }
  public validateGroupRpc(query: string, config?: RequestConfig): Observable<boolean> {
    return this.http.get<boolean>(env.backendBaseUrl + `/api/group-rpc/validate?${query}`);
  }
  public getLastestStatusDevice(deviceId: string, key: string, config?: RequestConfig) {
    return this.http.get<any>(env.backendBaseUrl + `/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${key}`,
      defaultHttpOptionsFromConfig(config));
  }

  // bật tắt thiết bị
  public saveManualRpcToCommandQueue(rpcRequest: any, config?: RequestConfig) {
    return this.http.post<RpcCommandDto>(env.backendBaseUrl + `/api/rpc-queue`, rpcRequest,
      defaultHttpOptionsFromConfig(config));
  }
  /* chuongnv */
  // tslint:disable-next-line: max-line-length
  public getListLichSu(idDam: string, pageLink: PageLink, idDevice?: string, startTime?: string, endTime?: string): Observable<PageData<LichSuDK>> {
    if (idDevice){
      if (startTime && endTime)
      {
        const params = new HttpParams()
        .set('damtomId', idDam).set('deviceId', idDevice)
        .set('startTime', startTime).set('endTime', endTime);
        return this.http.get<PageData<LichSuDK>>(env.backendBaseUrl + `/api/rpc-queue${pageLink.toQuery()}`, { params });
      }
      else{
        const params = new HttpParams()
        .set('damtomId', idDam).set('deviceId', idDevice);
        return this.http.get<PageData<LichSuDK>>(env.backendBaseUrl + `/api/rpc-queue${pageLink.toQuery()}`, { params });
      }
    }
    else if (startTime && endTime){
      const params = new HttpParams()
      .set('damtomId', idDam)
      .set('startTime', startTime).set('endTime', endTime);
      return this.http.get<PageData<LichSuDK>>(env.backendBaseUrl + `/api/rpc-queue${pageLink.toQuery()}`, { params });
    }
    else{
      const params = new HttpParams()
      .set('damtomId', idDam);
      return this.http.get<PageData<LichSuDK>>(env.backendBaseUrl + `/api/rpc-queue${pageLink.toQuery()}`, { params });
    }
  }

  public getCountNewLs(damtomIdinput: string) {
    return this.http.get<number>(env.backendBaseUrl + `/api/rpc-queue/count-new-command?damtomId=${damtomIdinput}`);
  }

  public viewAllHistory(idDam: string, startTime: string, endTime: string) {
    const params = new HttpParams().set('damTomId', idDam).set('startTime', startTime).set('endTime', endTime);
    return this.http.put<any>(env.backendBaseUrl + '/api/rpc-queue/view-all', null, { params });
  }
  // DungND
  public saveRpcSchedule(rpcScheduleDto: RpcScheduleDto, config?: RequestConfig): Observable<RpcScheduleDto> {
    return this.http.post<RpcScheduleDto>(env.backendBaseUrl + `/api/rpc-schedule`, rpcScheduleDto, defaultHttpOptionsFromConfig(config));
  }

  public saveRpcSetting(body: RpcSettingDto, config?: RequestConfig): Observable<RpcSettingDto> {
    return this.http.post<RpcSettingDto>(env.backendBaseUrl + `/api/rpc-setting`, body, defaultHttpOptionsFromConfig(config));
  }

  public getRpcSettingById(id: string, config?: RequestConfig): Observable<RpcSettingDto> {
    return this.http.get<RpcSettingDto>(env.backendBaseUrl + `/api/rpc-setting/` + id, defaultHttpOptionsFromConfig(config));
  }

  public getAllRpcSchedule(damTomId: string, config?: RequestConfig): Observable<any> {
    return this.http.get<any>(env.backendBaseUrl + `/api/rpc-schedule?damTomId=${damTomId}`, defaultHttpOptionsFromConfig(config));
  }
  public getRpcScheduleByPage(damTomId: string, pageLink: PageLink): Observable<PageData<RpcScheduleDto>> {
    const params = new HttpParams().set('damTomId', damTomId);
    return this.http.get<PageData<RpcScheduleDto>>(env.backendBaseUrl + `/api/rpc-schedule/page${pageLink.toQuery()}`, { params });
  }
  public updateRpcSchedule(id: string, rpcScheduleDto: RpcScheduleDto, config?: RequestConfig): Observable<any> {
    return this.http.put<any>(env.backendBaseUrl + `/api/rpc-schedule/${id}`, rpcScheduleDto, defaultHttpOptionsFromConfig(config));
  }

  public getRpcScheduleById(id: string, config?: RequestConfig): Observable<RpcScheduleDto> {
    return this.http.get<RpcScheduleDto>(env.backendBaseUrl + `/api/rpc-schedule/${id}`, defaultHttpOptionsFromConfig(config));
  }

  public deleteRpcSchedule(id: string, config?: RequestConfig): Observable<any> {
    return this.http.delete<any>(env.backendBaseUrl + `/api/rpc-schedule/${id}`, defaultHttpOptionsFromConfig(config));
  }


  // ------- RPC REM chua phan vung-------
  getRpcCurtains(damTomId: string): Observable<SpecialDevice[]> {
    if (!!damTomId) {
      return this.http.get<SpecialDevice[]>(env.backendBaseUrl + `/api/rpc-rem/checkInZone?damTomId=${damTomId}`);
    }
  }
  getRemById(idRem: string): Observable<SpecialDevice> {
    if (!!idRem) {
      return this.http.get<SpecialDevice>(env.backendBaseUrl + `/api/rpc-rem/${idRem}`);
    }
  }
  controlRem(action: ActionRem) {
    return this.http.post<
    { 
      errorCode: number, 
      message: string, 
      status: number, 
      timestamp: 
      string
    }
    >(env.backendBaseUrl + '/api/rpc-rem/action', action);
  }

  showToast(meseage: string, colorInput: string) {
    this.toastCtrl
      .create({
        message: meseage,
        color: colorInput,
        duration: 3000,
      })
      .then((toatEL) => toatEL.present());
  }

  // get all rem trong dam tom
  getAllRem(damTomId: string): Observable<SpecialDevice[]> {
    if (!!damTomId) {
      return this.http.get<SpecialDevice[]>(env.backendBaseUrl + `/api/rpc-rem?damTomId=${damTomId}`);
    }
  }
}

