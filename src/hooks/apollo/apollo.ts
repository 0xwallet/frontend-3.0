import apollo from '/@/lib/esm/apollo';
import { ApolloClient } from '@apollo/client/core';
import { me } from '/@/hooks/apollo/gqlUser';
import { useMessage } from '/@/hooks/web/useMessage';
import { userStore } from '/@/store/modules/user';
const { createErrorModal } = useMessage();
// const Client = apollo.get();
// const apolloWSClient = apollo.getWS();

export function useApollo(): ApolloClient<any> {
  return apollo.get();
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
    useApollo()
      .query({ query: me, fetchPolicy: 'network-only' })
      .then((res) => {
        resolve(res.data.me);
      })
      .catch((err) => {
        handleApolloError(err);
      });
  });
}
