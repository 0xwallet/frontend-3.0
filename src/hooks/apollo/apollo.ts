import apollo from '/@/lib/esm/apollo';
import { ApolloClient } from '@apollo/client/core';
import { me } from '/@/hooks/apollo/gqlUser';
import { useMessage } from '/@/hooks/web/useMessage';
import { userStore } from '/@/store/modules/user';

const { createErrorModal } = useMessage();
const Client = (): ApolloClient<any> => {
  return apollo.get();
};
// const apolloWSClient = apollo.getWS();

export function useApollo(params: { mode: string; gql: any; variables?: any }): Promise<any> {
  return new Promise((resolve, reject) => {
    const { mode, gql, variables } = params;
    const c = Client();
    let r: Promise<any>;
    switch (mode) {
      case 'query':
        r = c.query({ query: gql, variables, fetchPolicy: 'network-only' });
        break;
      case 'mutate':
        r = c.mutate({ mutation: gql, variables });
        break;
      default:
        reject('wrong params');
    }
    // @ts-ignore
    r.then((res) => {
      resolve(res);
    }).catch((err) => {
      if (err.message === 'Please sign in first!') {
        userStore.loginOut(true);
      }
      createErrorModal({
        title: '错误',
        content: err.message,
      });
      reject(err);
    });
  });
}

export function useApolloWS(): ApolloClient<any> {
  return apollo.getWS();
}

export function handleApolloError(err: any) {
  if (err.message === 'Please sign in first!') {
    userStore.loginOut(true);
  }
  createErrorModal({
    title: '错误',
    content: err.message,
  });
}

export function getMe(): Promise<any> {
  return new Promise((resolve) => {
    useApollo({ mode: 'query', gql: me })
      .then((res) => {
        resolve(res.data.me);
      })
      .catch((err) => {
        handleApolloError(err);
      });
  });
}
