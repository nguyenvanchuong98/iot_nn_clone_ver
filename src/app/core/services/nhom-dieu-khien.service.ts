import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DamTom } from 'src/app/shared/models/giamsat.model';
import { GroupRpc } from 'src/app/shared/models/group-rpc.model';
import { ReportMultiData, ReportSingleData } from 'src/app/shared/models/report.model';
import { environment as env } from 'src/environments/environment';
import { RequestConfig, defaultHttpOptionsFromConfig } from '../http/http-utils';
import { DamTomSchedule } from './report-schedule.service';

const API_LINK = `${env.backendBaseUrl}`;
const GROUP_RPC = '/api/group-rpc/';
const SETTING_RPC = '/api/rpc-setting';
const DEVICE_RPC = '/api/rpc-device';
@Injectable({
  providedIn: 'root'
})
export class GroupRPCService {

  constructor(
    private http: HttpClient
  ) { }

  
  public getAllBoDieuKhien(damtomId:string){
    return this.http.get<any>(`${API_LINK}${GROUP_RPC}?damTomId=${damtomId}`);
  }

  public getAllThietBi(damtomId:string){
    
    return this.http.get<any>(`${API_LINK}${DEVICE_RPC}?damTomId=${damtomId}`)
  }

  // public saveRPCSetting(){
  //   return this.http.post()
  // }
  public saveGroupRpc(groupRpc: GroupRpc, config?: RequestConfig): Observable<GroupRpc> {
    return this.http.post<GroupRpc>(`${API_LINK}${GROUP_RPC}`, groupRpc, defaultHttpOptionsFromConfig(config));
  }

  
  public getRpcById(rpcId:string,config? : RequestConfig): Observable<GroupRpc>{
    return this.http.get<GroupRpc>(`${API_LINK}${GROUP_RPC}${rpcId}`, defaultHttpOptionsFromConfig(config));
  }

  // public getAllTenantDamtom(config?: RequestConfig): Observable<DamTom[]> {
  //   return this.http.get<DamTom[]>(`${API_LINK}/api/dam-tom/mobi`, defaultHttpOptionsFromConfig(config));
  // }

  
  /**
   *  Báo cáo tổng hợp 
   *
   */
  public getDamtomCanhBaoData(damtomId: string, startTs: number, endTs: number): Observable<ReportSingleData[]> {
    let query;
    if (damtomId === 'ALL') {
      query = `?startTs=${startTs}&endTs=${endTs}`;
    } else {
      query = `?damtomId=${damtomId}&startTs=${startTs}&endTs=${endTs}`;
    }
    return this.http.get<ReportSingleData[]>(`${API_LINK}/api/bc-tonghop/canh-bao${query}`);
  }

  public getAllTenantDamtom(config?: RequestConfig): Observable<DamTom[]> {
    return this.http.get<DamTom[]>(`${API_LINK}/api/dam-tom/mobi`, defaultHttpOptionsFromConfig(config));
  }


  public getDamtomKeyDlcambienData(damtomId: string, key: string, startTs: number, endTs: number): Observable<ReportMultiData[]> {
    let query; 
    if (damtomId === 'ALL') {
      query = `?key=${key}&startTs=${startTs}&endTs=${endTs}`;
    } else{
      query = `?damtomId=${damtomId}&key=${key}&startTs=${startTs}&endTs=${endTs}`;
    }
    return this.http.get<ReportMultiData[]>(`${API_LINK}/api/bc-tonghop/dl-cambien${query}`);
  }
  
  //khoi dong - huy khoi dong nhom dieu khien
  //start nhom dk
  public startGroupRpc(groupRpcId: string, config?: RequestConfig){
    return this.http.post<any>(`${API_LINK}/api/group-rpc/start/${groupRpcId}`, defaultHttpOptionsFromConfig(config));
  }
  //stop nhom dk
  public stopGroupRpc(groupRpcId: string, config?: RequestConfig){
    return this.http.post<any>(`${API_LINK}/api/group-rpc/stop/${groupRpcId}`, defaultHttpOptionsFromConfig(config));
  }
  //status nhom dk
  public getStatusGroupRpc(groupRpcId: string, config?: RequestConfig){
    return this.http.get<any>(`${API_LINK}/api/group-rpc/status/${groupRpcId}`, defaultHttpOptionsFromConfig(config));
  }
  deleteGroupRpc(damtomId:string,groupRpcId: string){
    const params=new HttpParams().set('damTomId',damtomId);
    return this.http.delete(`${API_LINK}/api/group-rpc/${groupRpcId}`,{params});
  }
}
