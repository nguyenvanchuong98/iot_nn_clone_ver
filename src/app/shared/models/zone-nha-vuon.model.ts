export interface ZoneNhaVuonModel{
    id: string;
    tenantId: string;
    damtomId:string;
    name: string;
    deviceEntityList: SensorDevice[];
    createdBy: string;
    createdTime: number;
}
export interface SensorDevice{
    id: string;
    createdTime: number;
    tenantId: string;
    customerId: string;
    type: string;
    name: string;
    label: string;
    searchText: string;
    additionalInfo: string;
    deviceProfileId: string;
    deviceData: {},
    searchTextSource: string;
    uuid: string;
}