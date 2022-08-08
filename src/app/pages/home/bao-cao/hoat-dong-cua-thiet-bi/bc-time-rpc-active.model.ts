export interface ReportTimeRpcActive {
    chartOption?: any;
}
export interface Zone {
    nameZone: string;
    idZone: string;
    listDevice: DeviceRpc[];
}
export interface DeviceRpc {
    deviceName: string;
    deviceId: string;
    timeActive: number;
}