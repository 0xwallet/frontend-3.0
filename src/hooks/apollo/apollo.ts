import { me } from '/@/hooks/apollo/gqlUser';
import { useMessage } from '/@/hooks/web/useMessage';
import { userStore } from '/@/store/modules/user';
import { provide } from 'vue';

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloClients } from '@vue/apollo-composable';
import { ApolloLink, HttpLink } from '@apollo/client/core';

// @ts-ignore
// import { Socket as PhoenixSocket } from 'phoenix/assets/js/phoenix';
// @ts-ignore
// import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
// @ts-ignore
// import * as AbsintheSocket from '@absinthe/socket';
// import { getMainDefinition } from '@apollo/client/utilities';
// 与 API 的 HTTP 连接
const { createErrorModal } = useMessage();
let Client: ApolloClient<any>;

export function initApollo(): ApolloClient<any> | null {
  const httpLink = new HttpLink({
    uri: 'https://owaf.io/api',
  });
  // const wsLink = createAbsintheSocketLink(
  //   AbsintheSocket.create(
  //     new PhoenixSocket('wss://owaf.io/socket', {
  //       params: () => {
  //         return { Authorization: 'Bearer ' + localStorage.getItem('token') };
  //       },
  //     })
  //   )
  // );
  // const link = split(
  //   // 根据操作类型拆分
  //   ({ query }) => {
  //     const definition = getMainDefinition(query);
  //     return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  //   },
  //   wsLink,
  //   httpLink
  // );
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
    link: middlewareLink.concat(httpLink),
    cache,
    connectToDevTools: true,
  });
  provide(ApolloClients, {
    default: apolloClient,
  });
  Client = apolloClient;
  return apolloClient;
}

export function useApollo(params: { mode: string; gql: any; variables?: any }): Promise<any> {
  return new Promise((resolve, reject) => {
    const { mode, gql, variables } = params;
    let r: Promise<any>;
    switch (mode) {
      case 'query':
        r = Client.query({ query: gql, variables, fetchPolicy: 'network-only' });
        break;
      case 'mutate':
        r = Client.mutate({ mutation: gql, variables });
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
