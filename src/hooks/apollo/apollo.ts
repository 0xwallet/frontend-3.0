import { useMessage } from '/@/hooks/web/useMessage';
import { provide } from 'vue';

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloClients } from '@vue/apollo-composable';
import { ApolloLink, HttpLink } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';

// import { getMainDefinition } from '@apollo/client/utilities';
// // @ts-ignore
import router from '/@/router';
import { PageEnum } from '/@/enums/pageEnum';

// 与 API 的 HTTP 连接
const { createErrorModal } = useMessage();
let Client: ApolloClient<any>;

export function initApollo(): ApolloClient<any> | null {
  if (Client) return Client;
  const httpLink = new HttpLink({
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
  const error = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) => {
        switch (message) {
          case 'Please sign in first!':
            router.push(PageEnum.BASE_LOGIN);
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
    if (!Client) initApollo();
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
