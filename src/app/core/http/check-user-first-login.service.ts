import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment as env} from '../../../environments/environment';
import {Observable} from 'rxjs/internal/Observable';
import {retry} from 'rxjs/operators';
import {defaultHttpOptions} from './http-utils';

export interface ActiveInfo {
    email: string;
    activateCode: string;
}

export interface LoginInfo {
    email: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})


export class CheckUserFirstLoginService {
    private password: string;
    constructor(
        private http: HttpClient
    ) {
    }
    public setPassword(pass: string){
        this.password = pass;
    }
    public getPassword(): string{
        return this.password;
    }
    public checkUserFirstActive(emailInput: string, passwordInput: string) {
        const loginInfo: LoginInfo = {
            email: emailInput,
            password: passwordInput
        };
        const url = env.backendBaseUrl + '/public-api/users/check-active-v2';
        return this.http.post(url, loginInfo, defaultHttpOptions());
    }

    public sendActiveCode(emailInput: string, passwordInput: string) {
        const loginInfo: LoginInfo = {
            email: emailInput,
            password: passwordInput
        };
        const url = env.backendBaseUrl + '/public-api/users/activate-code-v2';
        return this.http.post(url, loginInfo, {responseType: 'text'});
    }

    public checkActiveCode(emailInput: string, activeCodeInput: string) {
        const activeInfo: ActiveInfo = {
            email: emailInput,
            activateCode: activeCodeInput,
        };
        const url = env.backendBaseUrl + '/public-api/users/activate-account-v2';
        return this.http.post(url, activeInfo, defaultHttpOptions());
    }
}
