import {Injectable} from "@angular/core";
import {environment as env} from '../../../environments/environment';
import {HttpClient} from "@angular/common/http";
import {PageLink, TimePageLink} from "../../shared/models/page/page-link";
import {Observable} from "rxjs/internal/Observable";
import {PageData} from "../../shared/models/page/page-data";
import {UserLog} from "../../shared/models/user-log.model";
import {defaultHttpOptions, defaultHttpOptionsFromConfig, RequestConfig} from "../http/http-utils";

@Injectable({
    providedIn: 'root'
})

export class LichSuTruyCapService{
    constructor(private http: HttpClient) {
    }
    
    public getAllUserLogs(pageLink: PageLink, config?: RequestConfig): Observable<PageData<UserLog>> {
        const url = env.backendBaseUrl + `/api/users/logs${pageLink.toQuery()}`
        return this.http.get<PageData<UserLog>>(url, defaultHttpOptionsFromConfig(config));
    }
    public getUserLogsByDate(timePageLink: TimePageLink): Observable<PageData<UserLog>>{
        const url = env.backendBaseUrl + `/api/users/logs${timePageLink.toQuery()}`
        return this.http.get<PageData<UserLog>>(url);
        
    }
    public getUserLogsByEntityType(
        entityType: string,
        timePageLink: TimePageLink,
    ): Observable<PageData<UserLog>>{
        const url = env.backendBaseUrl + `/api/users/logs${timePageLink.toQuery()}&entityType=${entityType}`;
        return this.http.get<PageData<UserLog>>(url);
    }
}