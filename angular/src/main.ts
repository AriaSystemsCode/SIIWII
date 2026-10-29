import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'moment-timezone';
import 'moment/min/locales.min';
import { environment } from './environments/environment';
import { hmrBootstrap } from './hmr';
import './polyfills.ts';
import { RootModule } from './root.module';
import { registerLicense } from '@syncfusion/ej2-base';

// Syncfusion license registration
registerLicense('Ngo9BigBOggjHTQxAR8/V1JAaF5cX2pCd1p/TH5YfUNzdUVEY1ZUTXxaS1ZhSXxVdkxhXH5dcHxRQ2FeVUJ9XEY=');

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
}

const providers = [
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
];

if (environment.production) {
    enableProdMode();
}

const bootstrap = () => {
    return platformBrowserDynamic(providers).bootstrapModule(RootModule);
};

/* Hot Module Replacement */
if (environment.hmr) {
    if (module['hot']) {
        hmrBootstrap(module, bootstrap);
    } else {
        console.error('HMR is not enabled for webpack-dev-server!');
    }
} else {
    bootstrap();
}