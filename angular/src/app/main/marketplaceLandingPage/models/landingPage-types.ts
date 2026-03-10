
export type SectionType =
  'ASMB' | 'ASSB' | 'CSMP'
 | 'SRCTA' |'PF' |'SM'
   | 'MRCTA' 

export interface SectionConfig {
  type: SectionType;
  order: number;
  inputs?: any;
}


export interface ApiRow {
  id: number;
  type: number;
  title?: string | null;
  image?: string | null;
  code?: string | null;
  description?: string | null;
  order?: number | null;
  linkPageUrl?: string | null;
  externalUrl?: string | null;
  name?:string
  titleAlignment:string
  blockTypeIsSingleOrMixed:string
}

export interface SectionItem {
  type: SectionType;
  order: number;
  inputs: any;
  sectionId?: number;   // ← add this
  rowIds?: number[];    // ← optional: all row ids in the group

}
