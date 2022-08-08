export interface ReportScheduleCreateOrUpdate {
    active: boolean;
    createdBy?: string;
    createdTime?: number;
    cron: string;
    damTomId: string;
    note?: string;
    reportName: string;
    scheduleName: string;
    tenantId?: string;
    users: string[];
    otherEmail?: string;
}

export interface ReportSchedule {
    active: boolean;
    createdBy?: string;
    createdTime?: number;
    cron: string;
    damTomId: string;
    id?: string;
    note?: string;
    reportName: string;
    scheduleName: string;
    tenantId?: string;
    users: ReportScheduleUser[];
    otherEmail?: string;
}

interface ReportScheduleUser{
    scheduleId: string;
    user: {
        userId: string;
        firstName: string;
        active: boolean;
        email: string;
    };
    createdBy?: string;
    createdTime?: number;
}