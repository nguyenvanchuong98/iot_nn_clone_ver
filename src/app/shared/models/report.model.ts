export interface ReportMultiData {
    name: string;
    series: SeriesData[];
}

export interface ReportSingleData {
    name: string;
    value: number;
}

export interface SeriesData {
    name: string;
    value: number;
}

export interface DataHDTBTable {
    label: string;
    timeOn: number;
    device_type: string;
}
export interface DataHDTB {
    label: string[];
    timeOn: number[];
}

export interface NotifyReport {
    name: string;
    series: ReportSingleData[];
}