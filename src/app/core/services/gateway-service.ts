import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GetGatewayResponse } from "src/app/shared/models/gateway-model";
import { environment as env } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class GatewayService {

    constructor(private http: HttpClient) { }

    getGatewayById(id: string): Observable<GetGatewayResponse> {
        return this.http.get<GetGatewayResponse>(`${env.backendBaseUrl + '/api/dam-tom/device'}/${id}`);
    }
}