export enum DeviceType {
    SENSOR = 'SENSOR',
    RPC = 'RPC',
    UNKNOWN = 'UNKNOWN'
}
export enum TelemetryType {
    TEMPERATURE = 'Temperature',
    HUMIDITY = 'Humidity',
    LUX = 'Lux',
}

export interface GiamSatDamTom {
    id: string;
    tenantId: string;
    name: string;
    address: string;
    note: string;
    searchText?: string;
    images?: any;
    active: boolean;
    cameras: Camera[];
    staffs: any;
    listZones: Zone[];
    countAlarms: number;
    createdBy: string;
    createdTime: any;

    listRpcActive?: GiamSatDevice[];
    listZoneSensor?: Zone[];
}
export interface Camera {
    code: string;
    createdBy?: string;
    name: string;
    createdTime: string;
    damtomId?: string;
    id: string;
    main: boolean;
    url: string;
    note?: string;
    tenantId?: string;
}
export interface Zone {
    id: string;
    tenantId?: string;
    damtomId?: string;
    name: string;
    listDevices: GiamSatDevice[];
    createdBy?: string;
    createdTime?: number;
}
export interface GiamSatDevice {
    id: string;
    zoneId?: string;
    dftDeviceType?: string;
    name: string;
    label: string;
    type?: DeviceType;
    telemetryType?: TelemetryType;
    telemetryKey?: string; // truyen vao query data cho bieu do
    setValueMethod?: string;
    rpcStatus?: number;
    statusTime?: number;
    lastestSensorData?:
    {
        ts: number;
        alarm: boolean;
        value: number;
        nguongViPham: string;
    },
    createdTime: number;
    order?: number | string; // sort theo nhiet do - do am - anh sang
}