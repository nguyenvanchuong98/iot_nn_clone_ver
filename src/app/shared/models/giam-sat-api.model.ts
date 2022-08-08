export enum DeviceType {
    SENSOR = 'SENSOR',
    RPC = 'RPC',
}

export enum TelemetryType {
    TEMPERATURE = 'Temperature',
    HUMIDITY = 'Humidity',
    LUX = 'Lux',
}

export interface GiamSatDamTom {
    active: boolean;
    address: string;
    cameras: any;
    createdBy: string;
    createdTime: any;
    gateways: GiamSatGateway[];
    id: string;
    images: any;
    name: string;
    note: string;
    searchText: string;
    staffs: any;
    tenantId: string;
    countAlarms: number;
}

export interface GiamSatGateway {
    active: boolean;
    createdBy: string;
    createdTime: any;
    damtomId: string;
    listDevices: GiamSatDevice[];
    id: string;
    tenantId: string;
}

export interface GiamSatDevice {

    gatewayId: string;
    deviceId: string;
    deviceName: string;
    deviceLabel: string;
    type?: DeviceType;
    telemetryType?: TelemetryType;
    setValueMethod?: string;
    rpcStatus?: number;
    statusTime?: number;
    damTomId?: string;
    zoneId?: string;
    latestSensorData?: {
        ts: number;
        alarm: boolean;
        value: number;
    },
    order?: number;  // frontedn tự generate
    createdTime: number;
}
