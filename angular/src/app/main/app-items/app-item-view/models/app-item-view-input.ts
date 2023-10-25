import { AppItemForViewDto } from "@shared/service-proxies/service-proxies";

export interface AppItemViewInput {
    header: string;
    marketPlace: boolean;
    appItemForViewDto: AppItemForViewDto;
    publish: boolean;
}
