import { UtilsService } from 'abp-ng2-module';
import { AppConsts } from '@shared/AppConsts';

export class SignalRHelper {
    static initSignalR(callback: () => void): void {

        let encryptedAuthToken = new UtilsService().getCookieValue(AppConsts.authorization.encrptedAuthTokenName);

        abp.signalr = {
            autoConnect: false, // _zone.runOutsideAngular in ChatSignalrService
            // autoReconnect: true,
            connect: undefined,
            hubs: undefined,
            qs: AppConsts.authorization.encrptedAuthTokenName + '=' + encodeURIComponent(encryptedAuthToken),
            remoteServiceBaseUrl: AppConsts.remoteServiceBaseUrl,
            attachmentBaseUrl: AppConsts.attachmentBaseUrl,
            startConnection: undefined,
            url: '/signalr'
        } as any;

        let script = document.createElement('script');
        script.onload = () => {
            callback();
        };

        script.src = AppConsts.appBaseUrl + '/assets/abp/abp.signalr-client.js';
        document.head.appendChild(script);
    }
}
