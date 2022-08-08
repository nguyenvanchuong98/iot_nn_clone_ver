export interface DamTomRpcAlarm {
    alarmType: string;
    createRules?: {
        MAJOR: {
            condition: {
                condition: AlarmRule[];
                // --- khoảng thời gian các sự kiện xảy ra ---
                spec?: {
                    type: string;
                    unit: string;
                    value: number;
                }
            },
            // --- Lịch điều khiển ---
            schedule?: {
                type: string;
                timezone: string;
                daysOfWeek: number[];
                startsOn: number;
                endsOn: number;
            }
        }
    };
    dftAlarmRule: {
        active: boolean;
        gatewayIds: string[];
        groupRpcIds: string[];
        rpcSettingIds: string[];
    };
    fromTime?:string;
    toTime?:string;
}


export enum SuKienKieuDuLieuType {
    BAT_KY = 'BAT_KY',
    CU_THE = 'CU_THE',
}
export interface SuKienDto {
    duLieuCamBien: string;
    kieuDuLieu: SuKienKieuDuLieuType;
    camBien: string;
    tenCamBien: string;
    nguongGiaTri: number;
    toanTu: string;
    gatewayId: string;
}
export interface DieuKienTB{
    id: string; // id bo rem
    trangThai: boolean;
    labelTB: string; // Chi de hien thi tai man hinh thong tin
    deviceType: string;

    // rem
    pullPush?: string;
    percent?: number;

    // condition
    compare?: string;
}
export interface DieuKhienDto {
    valueControl?: boolean;
    callbackOption?: boolean;
    delayTime?: string;
    deviceId?: string;
    groupRpcId?: string;
    rpcId?: string;
    loopCount?: number;
    loopOption?: boolean;
    loopTimeStep?: string;
    timeCallback?: string;
    typeRpc?: string;
    id?: string;
    deviceType?: string;
    openAccordition?: boolean;

    // option rem
    percent?: number;
    timePredict?: string;
    pullPush?: string;
}

export interface RpcSettingDto {
    valueControl: number;
    callbackOption: boolean;
    delayTime?: number;
    deviceId?: string; // id pull push rpc
    loopCount?: number;
    loopOption?: boolean;
    loopTimeStep?: number;
    timeCallback?: number;
    deviceName?: string;
    id?: string;

    // option rem
    actionRem?: string;
    percentRem?: number;
    remId?: string;
    // timeRem?: number;
    typeDeviceRem?: string;
}
export interface DamTomRpcAlarmCreateDto {
    damtomId: string;
    deviceProfileAlarm: RpcAlarm
}

export interface RpcAlarm {
    id?: string;
    alarmType: string;
    createRules: {
        MAJOR: {
            condition: {
                condition: AlarmRule[];
                // --- khoảng thời gian các sự kiện xảy ra ---
                spec?: {
                    type: string;
                    unit: string;
                    value: number;
                }
            },
            // --- Lịch điều khiển ---
            schedule?: {
                type: string;
                timezone: string;
                daysOfWeek: number[];
                startsOn: number;
                endsOn: number;
            }
        }
    };
    dftAlarmRule: {
        active: true;
        // --- SuKien - Kiểu dữ liệu - Cảm biến cụ thể -> [gatewayId] 
        // --- SuKien - Kiểu dữ liệu - Cảm biến bất kỳ -> [] 
        gatewayIds: string[];
        groupRpcIds: string[];
        rpcAlarm: boolean;
        rpcSettingIds: string[];
        ruleThietBiRem: RuleRem[]
    };
}

// --- RPC ---
export interface AlarmRule {
    // --- SuKien.DuLieuCamBien ---
    key: {
        type: string;   // TIME_SERIES
        key: string;    // DO - pH - Salinity - Temperature
        valueType: string; // NUMERIC
    };
    // --- SuKien - sự kiện xảy ra đồng thời ---
    predicate: {
        type?: string; // NUMERIC || COMPLEX
        operation?: string // GREATER_OR_EQUAL || LESS_OR_EQUAL || OR
        value?: {
            defaultValue: number;
        }
        predicates?: Predicate[]
    };

}

export interface Predicate {
    type: string;   // NUMERIC
    operation: string;   // GREATER_OR_EQUAL || LESS_OR_EQUAL
    value: {
        defaultValue: number;
    };
}

export interface RuleRem {
    remId: string;
    thietBiRemId: string; // id of pull push device
    active: number;
    percentRem: number;
    actionRem: string;
    compare: string;
}
