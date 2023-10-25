export class PagedResultDto<T = any> {
  items: T[];
  totalCount: number;
}
