import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment as env} from '../../../environments/environment';
import {Observable} from 'rxjs/internal/Observable';
import {AvatarUserResponse} from '../../shared/models/avatar-user.model';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    constructor(
        private http: HttpClient
    ) { }

    public uploadAvatar(formData: FormData, userId: string){
        const url = env.backendBaseUrl + `/api/image/file/upload/${userId}`;
        return this.http.post(url, formData, {responseType: 'text'});
    }
    public getImageDownload(userId: string, fileName: string): Observable<Blob>{
        const url = env.backendBaseUrl + `/api/image/${userId}/download/${fileName}`;
        return this.http.get<Blob>(url, {responseType: 'blob' as 'json'});
    }

    public saveAvatarUser(fileName: string, id: string): Observable<AvatarUserResponse>{
        const url = env.backendBaseUrl + `/api/users/avatar/${id}`;
        // tslint:disable-next-line: object-literal-key-quotes
        return this.http.post<AvatarUserResponse>(url, {'fileName': fileName});
    }

    public getAvatar(userId: string){
        const url = env.backendBaseUrl + `/api/users/${userId}/avatar`;
        return this.http.get(url, {responseType: 'text'});
    }


}
