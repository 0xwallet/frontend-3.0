import Vditor from 'vditor';
export interface MarkDownActionType {
  getVditor: () => Vditor;
  value: string;
}
