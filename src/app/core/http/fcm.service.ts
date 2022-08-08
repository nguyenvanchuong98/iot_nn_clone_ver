import { Injectable } from '@angular/core';
import {
    Plugins,
    PushNotification,
    PushNotificationToken,
    PushNotificationActionPerformed,
    Capacitor
} from '@capacitor/core';
import { Router } from '@angular/router';
import {environment as env} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
const { PushNotifications } = Plugins;

@Injectable({
    providedIn: 'root'
})
export class FcmService {
    tokenDevice: string;
    constructor(
        private router: Router,
        private http: HttpClient
    ) { }

    initPush() {
        if (Capacitor.platform !== 'web') {
            this.registerPush();
        }
    }

    private registerPush() {
        PushNotifications.requestPermission().then( result => {
            if (result.granted) {
                // Register with Apple / Google to receive push via APNS/FCM
                PushNotifications.register();
            } else {
                // Show some error
                console.log('error register');
            }
        });
        // On succcess, we should be able to receive notifications
        PushNotifications.addListener('registration',
            (token: PushNotificationToken) => {
                this.tokenDevice = token.value;
                const url = env.backendBaseUrl + '/api/notify-token';
                return this.http.post(url, {notifyToken: this.tokenDevice})
                    .subscribe(notifyRes => {
                    }, (errorRes => {
                        if (errorRes.status === 500){
                        }
                    }), () => {
                    });
            }
        );

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError',
            (error: any) => {
            }
        );
        PushNotifications.addListener(
            'pushNotificationReceived',
            async (notification: PushNotification) => {
            }
        );

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed',
            (notification: PushNotificationActionPerformed) => {
                const data = notification.notification.data;
                if (!!data.nongNghiepId) {
                    this.router.navigate(['home', 'giam-sat', 'danh-sach-canh-bao'], {queryParams: {damtomid: data.nongNghiepId}});
                } else if (!!data.damTomId && !!data.deviceId) {
                    this.router.navigate(['home', 'dieu-khien'], {queryParams: {damTomId: data.damTomId, tab: 3}});
                }
                // console.log('Push action data : ' + JSON.stringify(notification.notification.data));
            }
        );
    }

}
