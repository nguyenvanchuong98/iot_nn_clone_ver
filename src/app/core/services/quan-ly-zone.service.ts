import {Injectable} from "@angular/core";
import {
    HttpClient,
} from '@angular/common/http';
import {defaultHttpOptionsFromConfig, RequestConfig} from "../http/http-utils";
import {environment as env} from "../../../environments/environment";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import { InfoDevice } from "src/app/pages/home/quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-thiet-bi/thong-tin-thiet-bi.component";

export interface ZoneEntityPost{
    createdBy?: string,
    createdTime?: number,
    damtomId: string,
    deviceIdList: string[],
    id?: string,
    name: string,
    tenantId?: string
}
export interface ZoneEntityResponse{
    createdBy?: string,
    createdTime: number,
    damtomId?: string,
    deviceEntityList?: DeviceEntity[],
    id: string,
    name: string,
    tenantId?: string
    //index them vao tu api khac
    indexZone? : number
}
export interface DeviceEntity{
    id: string,
    createdTime: number,
    tenantId: string,
    customerId: string,
    name: string,
    label: string,
    isChecked: boolean,

    typeDevice: string;
    typeDeviceName: string;
}
export interface ZonesIndex{
    zoneIds: string[];
}
@Injectable({
    providedIn: 'root',
})
export class QuanLyZoneService{
    private _listZone = new BehaviorSubject<ZoneEntityPost[]>([]);

    get listZone() {
        return this._listZone.asObservable();
    }

    constructor(private http: HttpClient) {
    }
    
    //lay danh sach bo gateway
    public getAllGateWay(damTomId?: string, config?: RequestConfig): Observable<any>{
        return this.http.get<any>(env.backendBaseUrl + `/api/dam-tom/${damTomId}`, defaultHttpOptionsFromConfig(config));
    }
    //lay danh sach thiet bi trong bo gateway
    public getDevicesInGateway(gatewayId: string, config?: RequestConfig): Observable<any>{
        return this.http.get<any>(env.backendBaseUrl + `/api/dam-tom/device/${gatewayId}`, defaultHttpOptionsFromConfig(config));
    }
    //them zone
    public addZone(zone: ZoneEntityPost, config?: RequestConfig): Observable<ZoneEntityResponse>{
        return this.http.post<ZoneEntityResponse>
        (env.backendBaseUrl + '/api/damtom-zone', zone, defaultHttpOptionsFromConfig(config));
    }
    //danh sach zone
    public getAllZoneInDamTom(damTomId?:string, config?: RequestConfig): Observable<any>{
        return this.http.get<any>(env.backendBaseUrl + `/api/damtom-zone?damtomId=${damTomId}`,
            defaultHttpOptionsFromConfig(config));
    }
    //cap nhat zone
    public getZoneById(zoneIdInput:string):Observable<ZoneEntityResponse>{
        return this.http.get<ZoneEntityResponse>(env.backendBaseUrl+`/api/damtom-zone/${zoneIdInput}`);
    }
    //xoa zone
    public deleteZone(zoneIdInput:string){
        return this.http.delete(env.backendBaseUrl+`/api/damtom-zone/${zoneIdInput}`);
    }
    //get index of zone
    public getIndexOfZone(damTomId?: string, config?: RequestConfig): Observable<any>{
        return this.http.get<any>(env.backendBaseUrl+ `/api/damtom-zone-index?damtomId=${damTomId}`, 
            defaultHttpOptionsFromConfig(config));
    }
    //reorder zone
    public reorderZone(damTomId?: string, zonesIndex?: ZonesIndex, config?: RequestConfig): Observable<any>{
        return this.http.post(env.backendBaseUrl + `/api/damtom-zone-index?damtomId=${damTomId}`,
            zonesIndex, defaultHttpOptionsFromConfig(config));
    }

    // Update cach crud du lieu
    addZoneUpdate(zone: ZoneEntityPost) {
        return this.http.post<ZoneEntityPost>(env.backendBaseUrl + '/api/damtom-zone', zone)
        .pipe(
            switchMap((resData) => {
                return this.listZone;
            }),
            take(1),
            tap((listZone) => {
                listZone.unshift(zone);
                this._listZone.next(listZone);
            })
        )
    }
    updateZone(zoneNew: ZoneEntityPost) {
        return this.http.post<ZoneEntityPost>(env.backendBaseUrl + '/api/damtom-zone', zoneNew)
        .pipe(
            switchMap((resData) => {
                return this.listZone;
            }),
            take(1),
            tap((listZone) => {
                listZone.forEach(zone => {
                    if(zone.id === zoneNew.id) {
                        zone = zoneNew;
                    }
                })
                
                this._listZone.next(listZone);
                
            })
        )
    }
    fetchListZone(damTomId?: string) {
        return this.http.get<any>(env.backendBaseUrl + `/api/damtom-zone?damtomId=${damTomId}`)
        .pipe(
            map(listZoneData => {
                // tra ve zone da sort theo time tao moi nhat -> cu nhat 
                return listZoneData;
            }),
            tap(listZoneTranformed => {
                this._listZone.next(listZoneTranformed);
            })
        )
    }
    deleteZoneUpdate(zoneId: string) {
        return this.http.delete(env.backendBaseUrl+`/api/damtom-zone/${zoneId}`)
        .pipe(
            switchMap(() => {
                return this.listZone;
            }),
            take(1),
            tap(listZone => {
                this._listZone.next(listZone.filter(zone => zone.id !== zoneId));
            })
        )
    }   

    // get info device (name, listDeviceType, deviceType, listZone, zone)
    getDeviceType(damTomId?: string, deviceId?: string) {
        return this.http.get<any>(env.backendBaseUrl + `/api/dam-tom/thiet-bi-v2?damtomId=${damTomId}&deviceId=${deviceId}`);
    }

}