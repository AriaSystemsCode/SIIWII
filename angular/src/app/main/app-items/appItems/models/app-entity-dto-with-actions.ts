import {  AppEntityCategoryDto, IAppEntityCategoryDto } from '@shared/service-proxies/service-proxies';

export class AppEntityDtoWithActions<T> implements IAppEntityDtoWithActions<T>  {
    removed : boolean
    entityDto : T
    constructor(data?: IAppEntityDtoWithActions<T>) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.removed = _data["removed"];
            this.entityDto = _data["entityDto"]
        }
    }

    static fromJS(data: any): AppEntityDtoWithActions<any> {
        data = typeof data === 'object' ? data : {};
        let result = new AppEntityDtoWithActions();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["removed"] = this.removed;
        data["entityDto"] = this.entityDto
        return data;
    }
}

export interface IAppEntityDtoWithActions<T> {
    removed? : boolean
    added? : boolean
    saved? : boolean
    entityDto : T
}
