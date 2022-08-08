import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ZoneNhaVuonModel } from "src/app/shared/models/zone-nha-vuon.model";
import { environment as evr } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class DamTomZoneService {
  apiUrl = evr.backendBaseUrl + "/api/damtom-zone?damtomId=";
  constructor(private http: HttpClient) {}

  getAllDamTomZoneById(id: string): Observable<ZoneNhaVuonModel> {
    return this.http.get<ZoneNhaVuonModel>(`${this.apiUrl}/${id}`);
  }
}
