export class DeviceSetting {
  deviceId: string;
  deviceName: string;
  label: string; // label of device rpc
  valueControl: number;
  delayTime: number;
  callbackOption: boolean;
  timeCallback: number;
  loopOption: boolean;
  loopCount: number;
  loopTimeStep: number;
  commandId: number;
  groupRpcId: string;
  deviceType: string;
  openAccordition?: boolean;

  // them option cho thiet lap rem
  percentRem?: number;
  actionRem?: string;
  nameRem?: string;

  finishTimRem?: number;
}
