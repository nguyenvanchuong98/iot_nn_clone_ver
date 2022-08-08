import { AdditionalInfoType } from './damtom.model';

export class Device {
    additionalInfo: AdditionalInfoType;
    createdTime: number;
    customerId: string;
    deviceData: {
        configuration: {
            type: string;
        },
        transportConfiguration: {
            type: string;
        }
    };
    deviceProfileId: string;
    id: string;
    label: string;
    name: string;
    searchText: string;
    searchTextSource: string;
    tenantId: string;
    type: string;
    uuid: string;
    telemetry: string[];
    gatewayId: string;
    gatewayName: string;
    displayName: string;
}
