import apollo from '/@/lib/esm/apollo';
// import { ApolloClient } from '@apollo/client/core';
import { me } from '/@/hooks/apollo/gqlUser';
import { useMessage } from '/@/hooks/web/useMessage';
import { userStore } from '/@/store/modules/user';
import { provide } from 'vue';
const { createErrorModal } = useMessage();
const Client = (): ApolloClient<any> => {
  return apollo.get();
};
// const apolloWSClient = apollo.getWS();
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { ApolloLink, HttpLink } from '@apollo/client/core';
// 与 API 的 HTTP 连接
import { useQuery } from '@vue/apollo-composable';
export function initApollo(): ApolloClient<any> | null {
  const link = new HttpLink({
    uri: 'https://owaf.io/api',
  });

  // split based on operation type
  // REMOVE authLink FOR HTTPONLY_TOKEN
  const middlewareLink = new ApolloLink((operation, forward) => {
    if (forward === undefined) {
      return null;
    }
    const token = localStorage.getItem('token');
    operation.setContext({
      headers: {
        Authorization: token ? 'Bearer ' + token : '',
      },
    });
    return forward(operation);
  });
  // 缓存实现
  const cache = new InMemoryCache();

  // 创建 apollo 客户端
  const apolloClient = new ApolloClient({
    link: middlewareLink.concat(link),
    cache,
    connectToDevTools: true,
  });
  provide(DefaultApolloClient, apolloClient);
  return apolloClient;
}

export function useApollo(params: { mode: string; gql: any; variables?: any }): Promise<any> {
  return new Promise((resolve, reject) => {
    const { mode, gql, variables } = params;
    const c = Client();
    let r: Promise<any>;
    switch (mode) {
      case 'query':
        const { result, onError } = useQuery(
          gql,
          () => variables,
          () => ({
            fetchPolicy: 'network-only',
          })
        );
        onError((err) => {
          console.log(err);
          reject(err);
        });
        resolve(result);
        // r = c.query({ query: gql, variables, fetchPolicy: 'network-only' });
        break;
      case 'mutate':
        r = c.mutate({ mutation: gql, variables });
        break;
      default:
        reject('wrong params');
    }

    // @ts-ignore
    // r.then((res) => {
    //   resolve(res);
    // }).catch((err) => {
    //   if (err.message === 'Please sign in first!') {
    //     userStore.loginOut(true);
    //   }
    //   createErrorModal({
    //     title: '错误',
    //     content: err.message,
    //   });
    //   reject(err);
    // });
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
