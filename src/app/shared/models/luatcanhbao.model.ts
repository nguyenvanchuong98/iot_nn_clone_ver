export interface LuatCBDto {
  damtomId: string;
  deviceProfileAlarm: DeviceProfileAlarmDto;
}
/* DeviceProfileAlarmDto */
export interface DeviceProfileAlarmDto {
  id?: string;
  alarmType: string;
  createRules: CreateRulesDto;
  clearRule: CriticalDto;
  dftAlarmRule: DftAlarmRuleDto;
  propagate: boolean;
  propagateRelationTypes: string;
}
export interface CreateRulesDto {
  CRITICAL: CriticalDto;
}

// Critical
export interface CriticalDto {
  condition: ConditionParent;
  schedule?: {
    type: string;
    timezone: string;
    daysOfWeek: number[];
    startsOn: number;
    endsOn: number;
  };
  alarmDetails?: string;
}
export interface ConditionParent {
  condition: ConditionChild[];
  spec: SpecDto;
}
export interface ConditionChild {
  key: KeyCondiDto;
  valueType: string;
  predicate: PredicateDto;
}
export interface PredicateDto {
  operation: string;
  type: string;
  predicates?: PredicateChildDto[];
  value?: ValueCondiDto;
}
export interface PredicateChildDto {
  operation: string;
  value: ValueCondiDto;
  type: string;
}
export interface ValueCondiDto {
  defaultValue: number;
  dynamicValue?: number;
}
export interface KeyCondiDto {
  type: string;
  key: string;
}
export interface SpecDto {
  type: string;
  unit?: string;
  value?: number;
}
// dftAlrarmRule
export interface DftAlarmRuleDto {
  active: boolean;
  gatewayIds: string;
  groupRpcIds: string;
  rpcAlarm: boolean;
  rpcSettingIds: string;
  viaEmail: boolean;
  viaNotification: boolean;
  viaSms: boolean;
}

// Danh sach luat canh bao nhom theo id dam tom
export interface LuatCBGroupbyIdDam {
  damtomId: string;
  luatCb: DeviceProfileWithTime[];
}
export interface DeviceProfileWithTime {
  id?: string;
  alarmType: string;
  createRules: CreateRulesDto;
  dftAlarmRule: DftAlarmRulWithTime;
  propagate: boolean;
  propagateRelationTypes: string;
  fromTime?: string;
  toTime?: string;
}
export interface DftAlarmRulWithTime {
  active: boolean;
  createdTime: number;
  gatewayIds: string;
  groupRpcIds: string;
  rpcAlarm: boolean;
  rpcSettingIds: string;
  viaEmail: boolean;
  viaNotification: boolean;
  viaSms: boolean;
}
export interface AllDevice {
  Temperature: {
    id: string;
    name: string;
    label: string;
    gatewayId: string;
    deviceType: string;
    deviceTypeName: string;
    tbKey: string;
    telemetryType: string[];
  }[];
  RPC: {
    id: string;
    name: string;
    label: string;
    gatewayId: string;
    deviceType: string;
    deviceTypeName: string;
    tbKey: string;
    telemetryType: string[];
  }[];
  Humidity: {
    id: string;
    name: string;
    label: string;
    gatewayId: string;
    deviceType: string;
    deviceTypeName: string;
    tbKey: string;
    telemetryType: string[];
  }[];
  Unknow: {
    id: string;
    name: string;
    label: string;
    gatewayId: string;
    deviceType: string;
    deviceTypeName: string;
    tbKey: string;
    telemetryType: string[];
  }[];
  Lux: {
    id: string;
    name: string;
    label: string;
    gatewayId: string;
    deviceType: string;
    deviceTypeName: string;
    tbKey: string;
    telemetryType: string[];
  }[];
}
export interface AllDeviceNotType{
  id: string;
  name: string;
  label: string;
  gatewayId: string;
  deviceType: string;
  deviceTypeName: string;
  tbKey: string;
  telemetryType: string[];
}
