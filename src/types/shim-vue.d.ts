declare module "*.vue" {
    import { defineComponent } from 'vue';
    const Component: ReturnType<typeof defineComponent>;
    export default Component;
}

// declare module 'nkn-sdk' {
//     import nkn from 'nkn-sdk';
//     const classes: any;
//     const Wallet: any;
//     export { Wallet };
//    export default nkn;
//   }