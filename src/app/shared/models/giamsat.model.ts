import { BaseData } from './base-data';
import { ChartDataId } from './id/chart-data-id';

export interface Chart extends BaseData<ChartDataId> {
  chartDataId: ChartDataId;
  keys: string;
  useStrictDataTypes: boolean;
}

export interface DamTom {
  active: boolean;
  address: string;
  asset: Asset;
  cameras: any;
  createdBy: string;
  createdTime: any;
  deviceProfile: any;
  gateways: Gateways[];
  id: string;
  images: any;
  name: string;
  note: string;
  searchText: string;
  staffs: any;
  tenantId: string;
}

export interface Gateways {
  active: boolean;
  createdBy: string;
  createdTime: any;
  damtomId: string;
  device: Device;
  id: string;
  tenantId: string;
}

export interface Device {
  additionalInfo: any;
  createdTime: any;
  customerId: string;
  deviceData: any;
  deviceProfileId: string;
  id: string;
  label: string;
  name: string;
  searchText: string;
  searchTextSource: string;
  tenantId: string;
  type: string;
  uuid: string;
}
export interface Asset {
  additionalInfo: string;
  createdTime: any;
  customerId: string;
  id: string;
  label: string;
  name: string;
  searchText: string;
  searchTextSource: string;
  tenantId: string;
  type: string;
  uuid: string;
}

export interface Keys {
  ts?: string;
  value?: string;
}


export interface AlarmDto {
  alarmId: string;
  profile_Data: string;
  damtomId: string;
  name: string;
  note: string;
  viaSms: boolean;
  viaEmail: boolean;
  viaNotification: boolean;
  thucHienDieuKhien: string;
}

// tslint:disable-next-line: class-name
export interface profile_Data {
  alarms: [];
  configuration: [];
  provisionConfiguration: [];
  transportConfiguration: [];
}

// tslint:disable-next-line: class-name
export interface configuration {
  type: 'DEFAULT';
}

export class AppOperatorAndOr {
  static AND = 1;
  static OR = 2;
}

export interface ToanTu {
  id: string;
  displayName: string;
}

export interface Telemetry {
  id: string;
  displayName: string;
}

export class AppKeyFilterPredicateOperation {
  static EQUAL = 'EQUAL';
  static NOT_EQUAL = 'NOT_EQUAL';
  static GREATER = 'GREATER';
  static LESS = 'LESS';
  static GREATER_OR_EQUAL = 'GREATER_OR_EQUAL';
  static LESS_OR_EQUAL = 'LESS_OR_EQUAL';
  static STARTS_WITH = 'STARTS_WITH';
  static ENDS_WITH = 'ENDS_WITH';
  static CONTAINS = 'CONTAINS';
  static NOT_CONTAINS = 'NOT_CONTAINS';
}

export interface DataAlarm {
  alarm: [IAlarm];
  configuration: { type: 'DEFAULT' };
  provisionConfiguration: { type: 'DISABLED', provisionDeviceSecret: null };
  transportConfiguration: { type: 'DEFAULT' };
}

export interface IAlarm {
  id: string;
  alarmType: string;
  createRules: {
    CRITICAL: IServerity;
  };
  clearRule: null;
  propagate: false;
}

export interface IServerity {
  schedule: null;
  condition: ICondition;
  alarmDetails: null;
}

export interface ICondition {
  spec: ISpec;
  condition: [];
}

export interface ISpec {
  type: 'SIMPLE';
}

export interface IKeyFilter {
  key: IEntityKey;
  predicate: IKeyFilterPredicate;
  valueType: 'NUMERIC';
}

export interface IEntityKey {
  key: string; // input text, tên của telemetry
  type: 'TIME_SERIES';
}

export interface IKeyFilterPredicate {
  type: string;
  value?: IValue;
  predicates?: [];
  operation: string;
}

export interface IValue {
  userValue: null;
  defaultValue: number;
  dynamicValue: null;
}

export interface Ipredicates {
  type: 'NUMERIC'; // lấy theo kiểu của KeyFilter.valueType
  value: IValue;
  operation: string;
  ignoreCase?: boolean;
}

export class Telemetry {
  static TEMPERATURE = 'Temperature';
  static DO = 'DO';
  static ORP = 'ORP';
  static PH = 'pH';
  static SALINITY = 'Salinity';
}

export interface BoDuLieuCamBien {
  khoangThoiGian: string;
  gatewayId: string;
  tenGateway: string;
  data?: any;
}

export interface AlarmHistory {
  thoiGian: number;
  id: string;
  alarmId: string;
  nguongVp: string;
  deviceId: string;
  deviceName: string;
  damTomId: string;
  tenDamTom: string;
  tenCanhBao: string;
  gatewayId: string;
  gatewayName: string;
  clear: boolean;
  clearTime: number;
  ack: boolean;
  ackTime: number;
  zoneId: string;
  zoneName: string;
  data?: any;
  alarmKeys: any;
  alarmGateway: boolean;
}

// export interface AlarmCheck {
//   id: string;
//   thoiGian: string;
//   tencanhbao: string;
//   tenDamTom: string;
//   checkclear: boolean;
// }

// export interface CheckList {
//   id: string;
//   thoiGian: string;
//   tencanhbao: string;
//   tenDamTom: string;
//   checkclear: boolean;
// }
export interface AlarmDeleteDto {
  alarmId: string;
  profile_Data: string;
}
