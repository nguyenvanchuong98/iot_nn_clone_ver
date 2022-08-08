export interface RpcRequest {
    damTomId: string;
    deviceId: string;
    deviceName: string;
    setValueMethod: string;
    valueControl: number;
    callbackOption: boolean;
    timeCallback: number;
    loopOption: boolean;
    loopCount: number;
    loopTimeStep: number;
}