import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { PageData } from 'src/app/shared/models/page/page-data';
import { PageLink } from 'src/app/shared/models/page/page-link';
import { Role } from 'src/app/shared/models/role.model';
import { defaultHttpOptionsFromConfig, RequestConfig } from '../http/http-utils';



@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private http: HttpClient) { }

  public getTenantRoles(pageLink: PageLink,
    config?: RequestConfig): Observable<PageData<Role>> {
    return this.http.get<PageData<Role>>(env.backendBaseUrl + `/api/roles${pageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config));
  }


  public getAllTenantRoles(config?: RequestConfig): Observable<Role[]> {
    return this.http.get<Role[]>(env.backendBaseUrl + `/api/allRoles`,
      defaultHttpOptionsFromConfig(config));
  }

  public getRoleById(roleId: string, config?: RequestConfig): Observable<Role> {
    return this.http.get<Role>(env.backendBaseUrl + `/api/roles/${roleId}`, defaultHttpOptionsFromConfig(config));
  }

  public getRoleIdByUserId(userId: string, config?: RequestConfig):Observable<String[]>{
    return this.http.get<String[]>(env.backendBaseUrl + `/api/roles/roleid-userid/${userId}`, defaultHttpOptionsFromConfig(config));
  }

  // create or update
  public saveRole(role: Role, config?: RequestConfig): Observable<Role> {
    return this.http.post<Role>(env.backendBaseUrl + `/api/roles`, role, defaultHttpOptionsFromConfig(config));
  }


  public deleteRoleById(roleId: string, config?: RequestConfig) {
    return this.http.delete(env.backendBaseUrl + `/api/roles/${roleId}`, defaultHttpOptionsFromConfig(config));
  }

  public checkRoleExist(roleId?: string, roleName?: string, config?: RequestConfig): Observable<boolean> {
    let query;
    if (roleId !== null) {
      query = `/api/mb-roles/check-name-exist?roleId=${roleId}&name=${roleName}`
    } else {
      query = `/api/mb-roles/check-name-exist?name=${roleName}`
    }
    return this.http.get<boolean>(env.backendBaseUrl + query, defaultHttpOptionsFromConfig(config));
  }


}
