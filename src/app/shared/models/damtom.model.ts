export class DamtomD {
  id: string;
  name: string;
  active: boolean;
}
export class DamtomEdit {
  id: string;
  name: string;
  active: boolean;
  note: string;
  address: string;
  staffs: string[];
}
export class DamtomCreate {
  name: string;
  active: boolean;
  note: string;
  address: string;
  staffs: string[];
}
export class Id {
  entityType: string;
  id: string;
}
export class Staff {
  id: Id;
  firstName: string;
}

// Get chi tiết bộ thiết bị gồm cả danh sách thiết bị
export class GetBothietbi {
  listDevices: ListDevicesType[];
  gateway: GatewayType;
}
export class GatewayType {
  device: DeviceType;
  active: boolean;
}
export class DeviceType {
  name: string;
  id: string;
  additionalInfo: AdditionalInfoType;
}
export class AdditionalInfoType {
  description: string;
}
export class ListDevicesType {
  displayName: string;
  deviceType: string;
  id: string;
  hidden: boolean;
}

// Thêm bộ thiết bị
export class BothietbiCreate {
  active: boolean;
  damtomId: string;
  name: string;
  note: string;
}

// Sửa bộ thiết bị
export class BothietbiEdit {
  id: string;
  active: boolean;
  damtomId: string;
  name: string;
  note: string;
}

// Thông tin đầy đủ của một đầm tôm bao gồm cả tổng số thiết bị của bộ thiết bị
export class DamtomFull {
  address: string;
  name: string;
  note: string;
  active: boolean;
  staffs: StaffsType[];
  gateways: GateType[];
  cameras: CamerasType[];
}
export class CamerasType {
  id: string;
  name: string;
  code: string; // chính là macamera
  url?: string;
  note: string;
  main: boolean; // chính là ismain
  damtomId: string;
  recordHistory: boolean;
  rtspUrl: string;
  disConnect?: boolean;
}
export class GateType {
  id: string;
  device: DeviceType;
  active: boolean;
  lengthdvice: number;
}
export class StaffType {
  id: string;
  firstName: string;
}
export class StaffsType {
  userId: string;
  firstName: string;
  userName: string;
  email: string;
  phone: string;
  authority: string;
  active: boolean;
  isChecked?: boolean;
}

// thông tin user
export class Userdt {
  isChecked: boolean;
  id: Id;
  firstName: string;
}
export class CameraErro {
  code: number;
  message: string;
}
export class CameraResponse {
  cameraBoxId: string;
  code: string;
  rtspUrl: string;
  url: string;
  recordHistory: boolean;
  errorDto: CameraErro;
}

export class CameraHistory {
  streamName: string;
  vodName: string;
  streamId: string;
  creationData: string;
  creationDate: number;
  duration: number;
  fileSize: number;
  filePath: string;
  vodId: string;
  type: string;
}

export interface CameraConfigAttribute {
  stream: any;
}
