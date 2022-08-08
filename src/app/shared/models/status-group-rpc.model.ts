export class StatusGroupRpcModel {
    groupRpcId: string;
    timeEndLoading: number;
    loading: boolean
}
export class GroupRpc {
    groupRpcId: string;
    damTomId: string;
    name: string;
    rpcSettingList: DeviceSetting[];
}

export class DeviceSetting {
    deviceId: string;
    deviceName: string;
    valueControl: boolean;
    delayTime: number;
    callbackOption: boolean;
    timeCallback: number;
    loopOption: boolean;
    loopCount: number;
    loopTimeStep: number;
    commandId: number;
    groupRpcId: string;
}