import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { environment as evr } from 'src/environments/environment';
// tslint:disable-next-line: max-line-length
import {BothietbiCreate, BothietbiEdit, CameraConfigAttribute, CameraHistory, CameraResponse, CamerasType, DamtomCreate, DamtomD, DamtomFull, GetBothietbi, Userdt } from '../../shared/models/damtom.model';
import { defaultHttpOptionsFromConfig, RequestConfig } from '../http/http-utils';
import {EditDeviceDto} from '../../pages/home/quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-thiet-bi/thong-tin-thiet-bi.component';
import { rpcRemDto, ZoneRpc } from 'src/app/pages/home/quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/add-device-special/add-device-special.component';
import { SpecialDevice } from 'src/app/pages/home/quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page';
import { UsersDft } from 'src/app/shared/models/users-dft.model';

@Injectable({
  providedIn: 'root'
})
export class QuantridamtomService {
  apiUrl = evr.backendBaseUrl + '/api/dam-tom';
  urlCamera = evr.backendBaseUrl + '/api/cameras';
  urlCameraMobi = evr.backendBaseUrl + '/api/cameras-mb?damtomId=';
  constructor(private http: HttpClient) { }
  getListDamtom(): Observable<DamtomD[]>
  {
    return this.http.get<DamtomD[]>(this.apiUrl + '/mobi');
  }
  // lấy ra tất cả attribute
  getDamtomByIdAll(id: string): Observable<DamtomFull>
  {
    return this.http.get<DamtomFull>(`${this.apiUrl}/${id}`);
  }
  // Xóa đầm tôm
  deleteDamtom(id: string): Observable<{}>
  {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Lấy ra danh sách user thuộc tenant
  getListUser(pageLink: PageLink, config?: RequestConfig): Observable<PageData<UsersDft>> {
    // tslint:disable-next-line: max-line-length
    return this.http.get<PageData<UsersDft>>(evr.backendBaseUrl + `/api/users/page${pageLink.toQuery()}`, defaultHttpOptionsFromConfig(config));
  }
  // Create đầm
  postDamtom(dtinput: DamtomCreate)
  {
    return this.http.post(this.apiUrl, dtinput);
  }

  // Create Bộ thiết bị
  postBothietbi(btbinput: BothietbiCreate)
  {
    return this.http.post(this.apiUrl + '/device', btbinput);
  }

  // Get detail bộ thiết bị
  getBoTbbyId(id: string): Observable<GetBothietbi>
  {
    const URL_API = this.apiUrl + '/device';
    return this.http.get<GetBothietbi>(`${URL_API}/${id}`);
  }

  // Sửa bộ thiết bị
  putBothietbi(btbinput: BothietbiEdit)
  {
    return this.http.post(this.apiUrl + '/device/edit', btbinput);
  }
  // Xóa bộ thiết bị
  deleteBothietbi(id: string, damtomIdInput: string)
  {
    const URL_DELETE = this.apiUrl + '/device';
    const param = new HttpParams().set('damTomId', damtomIdInput);
    return this.http.delete(`${URL_DELETE}/${id}`, {params: param});
  }
  // Doi ten thiet bi ChuongNV-7/6/2021
  putTenThietBi(idTB: string, labelTB: string){
    return this.http.put<{label: string}>(`${this.apiUrl}/device/${idTB}/change-label`, {label: labelTB});
  }
  // Lấy thông tin chi tiết của một camera
  getCambyId(idinput: string): Observable<CamerasType>
  {
    return this.http.get<CamerasType>(`${this.urlCamera}/${idinput}`);
  }
  // Xóa camera
  deleteCamera(idinput: string)
  {
    return this.http.delete(`${this.urlCamera}/${idinput}`);
  }
  // Them hoac sua camera
  postCamera(camerainput: CamerasType): Observable<CameraResponse>
  {
    return this.http.post<CameraResponse>(this.urlCamera, camerainput);
  }

  // Lấy danh sách camera theo id đầm tôm
  getListCam(iddamtom: string): Observable<CamerasType[]>
  {
    return this.http.get<CamerasType[]>(`${this.urlCameraMobi}${iddamtom}`);
  }
  // Lay mang camera tra ve dang page
  getArrCam(idDamtom: string): Observable<PageData<CamerasType>>
  {
    return this.http.get<PageData<CamerasType>>(`${this.urlCamera}?damtomId=${idDamtom}&sortProperty=createdTime&sortOrder=desc`);
  }

  // xoa thiet bi
  deleteDevice(deviceId: string){
    return this.http.delete(evr.backendBaseUrl + `/api/dam-tom/thiet-bi/${deviceId}`);
  }
  // get thong tin thiet bi
  getInfoDevice(deviceId: string): Observable<any>{
    return this.http.get<any>(evr.backendBaseUrl + `/api/dam-tom/thiet-bi/${deviceId}`);
  }
  // cap nhat thong tin thiet bi
  updateInfoDevice(editDeviceDto: EditDeviceDto){
    return this.http.put(evr.backendBaseUrl + '/api/dam-tom/thiet-bi', editDeviceDto);
  }
  // lay thong tin thiet bi or bo thiet bi
  getInfoDeviceOrGateway(entityId?: string, isGateway?: boolean): Observable<any>{
    return this.http.get<any>(evr.backendBaseUrl + `/api/dam-tom/thiet-bi/info/${entityId}?isGateway=${isGateway}`);
  }
  // update info gw, device
  public saveInforDeviceOrGw(entityId: string, entityInfor: any, config?: RequestConfig): Observable<any> {
    // tslint:disable-next-line: max-line-length
    return this.http.post(evr.backendBaseUrl + `/api/plugins/telemetry/${entityId}/SERVER_SCOPE`, entityInfor, defaultHttpOptionsFromConfig(config));
  }
  public getAllTenantActiveDamtom(): Observable<any> {
    return this.http.get<any>(evr.backendBaseUrl + `/api/dam-tom/get-all/active`);
  }

  // update api cap nhat thong tin thiet bi
  updateInfoDeviceV2(editDeviceDto: EditDeviceDto, damTomId: string, config?: RequestConfig){
    return this.http.put(evr.backendBaseUrl + `/api/dam-tom/thiet-bi-v2?damTomId=${damTomId}`, editDeviceDto,
    defaultHttpOptionsFromConfig(config));
  }

  // update api get rpc theo zone da sort
  public getListRem(damTomId: string, config?: RequestConfig): Observable<any>{
    return this.http.get<any>(evr.backendBaseUrl + `/api/dam-tom/all-device?damTomId=${damTomId}`, defaultHttpOptionsFromConfig(config));
  }

  // get rem
  getListDeviceSpecial(damTomId: string, gatewayId: string): Observable<SpecialDevice[]> {
    return this.http.get<SpecialDevice[]>(evr.backendBaseUrl + `/api/rpc-rem?damTomId=${damTomId}&gatewayId=${gatewayId}`);
  }

  // save or update
  saveDeviceRem(remDto: rpcRemDto, config?: RequestConfig) {
    return this.http.post(evr.backendBaseUrl + '/api/rpc-rem', remDto, defaultHttpOptionsFromConfig(config));
  }

  // get zone rpc
  getZoneRpc(damTomId: string, config?: RequestConfig): Observable<ZoneRpc[]> {
    return this.http.get<ZoneRpc[]>(evr.backendBaseUrl + `/api/rpc-device/zone?damTomId=${damTomId}`, defaultHttpOptionsFromConfig(config));
  }

  getZoneRpcRem(damTomId: string, remId?: string): Observable<ZoneRpc[]>  {
    if (!!remId) {
      return this.http.get<ZoneRpc[]>(evr.backendBaseUrl + `/api/rpc-rem/valid-for-setting?damTomId=${damTomId}&rpcRemId=${remId}`);
    } else {
      return this.http.get<ZoneRpc[]>(evr.backendBaseUrl + `/api/rpc-rem/valid-for-setting?damTomId=${damTomId}`);
    }
  }

  // delete special device
  deleteSpecialDevice(deviceId: string) {
    return this.http.delete(evr.backendBaseUrl + `/api/rpc-rem/${deviceId}`);
  }

  // get special device by id
  getSpecialDvById(id: string): Observable<SpecialDevice> {
    return this.http.get<SpecialDevice>(evr.backendBaseUrl + `/api/rpc-rem/${id}`);
  }

  // Cap nhat theo doi thiet bi
  public followDevice(status: boolean, idDv: string){
    return this.http.put(evr.backendBaseUrl + `/api/dam-tom/thiet-bi/hidden/${idDv}?hidden=${status}`, null);
  }

  // Cam mới
  public getListCameraHistory(offset: number, size: number, streamId: string, config?: RequestConfig): Observable<CameraHistory[]> {
    return this.http.get<CameraHistory[]>(evr.backendBaseUrl + `/api/LiveApp/rest/v2/vods/list/${offset}/${size}?streamId=${streamId}&sortBy=date&orderBy=desc`,
      defaultHttpOptionsFromConfig(config));
  }

  public getCameraAttributeConfig(boxCameraId: string, streamId: string, rtspUrl: string, config?: RequestConfig): Observable<any> {
    return this.http.get<any>(evr.backendBaseUrl + `/api/camera-live/config/attribute?streamId=${streamId}&boxCameraId=${boxCameraId}&rtspUrl=${rtspUrl}`,
      defaultHttpOptionsFromConfig(config));
  }

  public saveSharedAttribute(cameraDeviceId: string,
                             cameraConfigAttribute: CameraConfigAttribute,
                             config?: RequestConfig): Observable<any> {
    return this.http.post<any>(evr.backendBaseUrl + `/api/plugins/telemetry/${cameraDeviceId}/SHARED_SCOPE`,
      cameraConfigAttribute,
      defaultHttpOptionsFromConfig(config));
  }

  public sendPTZCommand(boxCameraId: string, commandPTZ: any, config?: RequestConfig): Observable<any> {
    return this.http.post<any>(evr.backendBaseUrl + `/api/camera-live/ptz/${boxCameraId}`, commandPTZ,
      defaultHttpOptionsFromConfig(config));
  }

  public getUrlServer(): Observable<string>{
    return this.http.get(evr.backendBaseUrl + `/api/sys-admin/settings/camera-server-url`,  {responseType: 'text'});
  }
  public getStatusStream(streamId: string){
    return this.http.get(evr.backendBaseUrl + `/api/camera-live/status/${streamId}`);
  }
}
