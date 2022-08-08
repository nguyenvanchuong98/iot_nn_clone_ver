import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { defaultHttpOptionsFromConfig, RequestConfig } from '../http/http-utils';
import { UsersDft } from 'src/app/shared/models/users-dft.model';



@Injectable({
  providedIn: 'root'
})
export class UsersDftService {
  httpClient: any;

  constructor(private http: HttpClient) { }

  public getAllUsersDft(pageLink: PageLink, config?: RequestConfig): Observable<PageData<UsersDft>> {
    // tslint:disable-next-line: max-line-length
    return this.http.get<PageData<UsersDft>>(env.backendBaseUrl + `/api/users/page${pageLink.toQuery()}`, defaultHttpOptionsFromConfig(config));
  }

  public createUser(newUsersDft: UsersDft, config?: RequestConfig): Observable<UsersDft> {
    return this.http.post<UsersDft>(env.backendBaseUrl + `/api/users`, newUsersDft, defaultHttpOptionsFromConfig(config));
  }
  // Sửa thông tin cá nhân, không sửa được username
  public editOnlyInforUser(newUsersDft: UsersDft): Observable<UsersDft> {
    return this.http.put<UsersDft>(env.backendBaseUrl + `/api/users/edit-info/${newUsersDft.userId}`, newUsersDft);
  }
  // Sửa user bao gồm cả user name
  public editUsers(newUsersDft: UsersDft): Observable<UsersDft> {
    return this.http.put<UsersDft>(env.backendBaseUrl + `/api/users/${newUsersDft.userId}`, newUsersDft);
  }
  public getUsersDft(usersId: string, config?: RequestConfig): Observable<UsersDft> {
    return this.http.get<UsersDft>(env.backendBaseUrl + `/api/users/${usersId}`, defaultHttpOptionsFromConfig(config));
  }
  public deleteUsersDft(usersId: string, config?: RequestConfig): Observable<UsersDft> {
    return this.http.delete<UsersDft>(env.backendBaseUrl + `/api/users/${usersId}`, defaultHttpOptionsFromConfig(config));
  }
  public getNhaVuonForUser(userId: string, config?: RequestConfig) {
    return this.http.get<any>(env.backendBaseUrl + `/api/users/${userId}/list-nha-vuon`, defaultHttpOptionsFromConfig(config));
  }
  public activeUser(userdId: string, isActive: boolean, config?: RequestConfig): Observable<UsersDft>{
    return this.http.put<UsersDft>(env.backendBaseUrl + `/api/active-user/${userdId}/${isActive}`, defaultHttpOptionsFromConfig(config));
  }
}
