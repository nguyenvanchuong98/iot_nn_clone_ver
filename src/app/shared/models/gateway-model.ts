import { Device } from "./device-model";

export class GetGatewayResponse {
    credentialsId: string;
    listDevices: Device[];
    gateway: Gateway;
}

export class Gateway {
    active: boolean;
    createdBy: string;
    createdTime: number;
    damtomId: string;
    device: Device;
    id: string;
    tenantId: string;
}