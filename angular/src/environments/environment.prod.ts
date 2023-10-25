// "Production" enabled environment

export const environment = {
    appVersion:require("../../package.json").version,
    production: true,
    hmr: false,
    appConfig: 'appconfig.production.json'
};
