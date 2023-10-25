import { PagedResultDto } from './PagedResultDto';
import { SelectionMode } from "./SelectionMode";

export class SelectionModalInputs<T = any> {
  showEdit: boolean;
  showAdd: boolean;
  showDelete: boolean;
  results: PagedResultDto<T>;
  selections: any ;
  mode: SelectionMode;
  labelField: string;
  valueField: string;
  title: string;
}
