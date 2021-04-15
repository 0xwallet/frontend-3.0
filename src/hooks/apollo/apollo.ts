import { useMessage } from '/@/hooks/web/useMessage';
import { userStore } from '/@/store/modules/user';
import { provide } from 'vue';

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloClients } from '@vue/apollo-composable';
import { ApolloLink, HttpLink } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';

// import { getMainDefinition } from '@apollo/client/utilities';
// // @ts-ignore
import { Socket as PhoenixSocket } from 'phoenix';
import { fileStore } from '/@/store/modules/netFile';

// 与 API 的 HTTP 连接
const { createErrorModal } = useMessage();
let Client: ApolloClient<any>;
let WsChannel: any = null;
export function initApollo(): ApolloClient<any> | null {
  const httpLink = new HttpLink({
    uri: 'https://owaf.io/api',
  });

  useWs();

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
  const error = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) => {
        switch (message) {
          case 'Please sign in first!':
            userStore.logout(true);
            break;
          case 'file hash not found':
            break;
          default:
            createErrorModal({ content: message });
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
        }
      });

    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  // 缓存实现
  const cache = new InMemoryCache();

  // 创建 apollo 客户端

  const apolloClient = new ApolloClient({
    // @ts-ignore
    link: ApolloLink.from([middlewareLink, error, httpLink]),
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
      reject(err);
    });
  });
}

export function useWs(): any {
  if (WsChannel) return WsChannel;
  const phoenix_socket = new PhoenixSocket('wss://owaf.io/socket', {
    params: () => {
      return { Authorization: 'Bearer ' + localStorage.getItem('token') };
    },
  });
  const user_id = localStorage.getItem('uid');
  if (!user_id) return;
  phoenix_socket.connect();

  // Now that you are connected, you can join channels with a topic:
  // let user_id = localStorage.getItem('uid');

  WsChannel = phoenix_socket.channel(`drive:user_${user_id}`, {});
  console.log('ws就绪');
  // event when file uploaded
  WsChannel.on('file_uploaded', (file) => {
    console.log('file uploaded:', file);
    // fileStore.setRefetch();
  });
  // join channel
  WsChannel.join()
    .receive('ok', (resp) => {
      console.log('Joined successfully', resp);
    })
    .receive('error', (resp) => {
      console.log('Unable to join', resp);
    });
}

export function handleApolloError(err: any) {
  if (err.message === 'Please sign in first!') {
    userStore.logout(true);
  }
  createErrorModal({
    title: '错误',
    content: err.message,
  });
}
