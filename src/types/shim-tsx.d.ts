import { VNode } from 'vue';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    type Element = VNode
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
