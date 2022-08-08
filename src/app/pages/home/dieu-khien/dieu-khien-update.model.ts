import { SpecialDevice } from "../quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page";

//tra ve tat ca cac dam tom dang active
export interface DieuKhienDamTom {
    damTomId: string;
    damTomName: string;
    active: boolean;
    listZoneRpc: ZoneDieuKhienUpdate[]; //zone chua rpc va zone chua co nhom
    createdTime: any;
}

export interface ZoneDieuKhienUpdate {
    zoneId: string;
    zoneName: string;
    rpcDeviceList: DieuKhienDevice[];
    rpcRemList: SpecialDevice[];
}
export interface DieuKhienDevice {
    deviceId: string;
    deviceType: string;
    damTomId? : string;
    zoneId?: string;
    tenThietBi: string;
    label: string;
    setValueMethod?: string;
    getValueMethod?: string;
    statusTime?: number;
    statusDevice?:number;
    createdTime: number;
}
//model tra ve khi bat/tat rpc
export interface RpcCommandDto {
    callback: boolean;
    deviceId: string;
    deviceName: string;
    setValueMethod: string;
    timeCallback: number;
    valueControl: number;
}