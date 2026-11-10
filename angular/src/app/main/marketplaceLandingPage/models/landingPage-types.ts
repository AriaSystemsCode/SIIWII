
export type SectionType =
  | 'ASMB'
  | 'ASSB'
  | 'CSMP'
  | 'SRCTA'
  | 'PF'
  | 'SM'
  | 'MRCTA'
  | 'Menu'
  | 'IASCTA'
  | 'FBS';

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
  name?: string;
  titleAlignment?: string;
  blockTypeIsSingleOrMixed?: string;

  // New section settings
  backgroundColor?: string | null;
  textColor?: string | null;
  firstImageLarger?: boolean | null;
}

export interface SectionItem {
  type: SectionType;
  order: number;
  inputs: {
    title?: string | null;
    name?: string | null;
    images?: string[];
    titleAlignment?: string;
    backgroundColor?: string;
    textColor?: string;
    firstImageLarger?: boolean;
  };
  sectionId?: number;
  rowIds?: number[];
  blockTypeIsSingleOrMixed?: string;
}
