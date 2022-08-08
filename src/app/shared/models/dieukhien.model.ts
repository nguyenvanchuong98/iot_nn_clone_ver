import { SpecialDevice } from "src/app/pages/home/quan-tri/dam-tom/thong-tin-dam-tom/thong-tin-bo-thiet-bi/thong-tin-bo-thiet-bi.page";

export interface DeviceRpc {
  damTomId: string;
  tenThietBi: string;
  label?: string;
  deviceId: string;
  getValueMethod: string;
  setValueMethod: string;
  statusDevice?: number;
  statusTime: number;
  zoneId?: string;
}

export interface ListDeviceRpc {
  data: DeviceRpc;
  isDisable: boolean;
}

export interface GroupRpc {
  groupRpcId: string;
  damTomId: string;
  name: string;
  ghiChu: string;
  rpcSettingList: DeviceSetting[];
}

export interface DeviceSetting {
  deviceId: string;
  deviceName: string;
  valueControl: boolean;
}

export interface RpcCommandDto {
  callback: boolean;
  deviceId: string;
  deviceName: string;
  setValueMethod: string;
  timeCallback: number;
  valueControl: number;
}

/* ChuongNv */
export interface LichSuDK {
  id: string;
  deviceId: string;
  deviceName: string;
  label: string;
  valueControl: number;
  origin: number;
  originName: string;
  commandTime: number;
  viewed: boolean;
  status: string;
  groupId: string;
  groupRpcId: string;
  groupRpcName: string;
  groupRpcCommand: LichSuDK[];
  isWantShow: boolean;

  // option rem
  rpcRemAction: string; // PUSH - PULL - STOP
  rpcRemId: string;
  rpcRemStatus: number;
  zoneName: string;
}
export interface LichSuDKResponse {
  data: LichSuDK[];
}
export interface AutomaticRpc {
  damTomId: string;
  name: string;
  status: boolean;
}

export interface RpcScheduleDto {
  active: boolean;
  callbackOption: boolean;
  cron: string;
  damTomId: string;
  deviceId: string;
  groupRpcId: string;
  id: string;
  loopCount: number;
  loopOption: true;
  loopTimeStep: number;
  name: string;
  rpcSettingId: string;
  timeCallback: number;
  valueControl: number;

  // option rem
  actionRem?: string;
  percentRem?: number;
}
export interface DeviceZone {
  name: string;
  deviceEntityList: DeviceEntityList[];
}
export interface DeviceEntityList {
  id: string;
  createTime: number;
  type: string;
  name: string;
  label: string;
  deviceProfileId: string;
  isChecked?: boolean;
}

// Model thiet bi dieu khien
export interface DeviceRpcZone {
  zoneId: string;
  zoneName: string;
  rpcDeviceList: RpcDeviceListDto[];
  rpcRemList: SpecialDevice[];
}
export interface RpcDeviceListDto {
  tenThietBi: string;
  damTomId: string;
  label: string;
  deviceId: string;
  setValueMethod: string;
  statusTime: number;
  disable: boolean;
  deviceType: string;
}
