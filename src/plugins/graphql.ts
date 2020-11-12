// import storage from 'store'
import type { App } from 'vue';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloLink, Operation, NextLink, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { initInstance } from '@/hooks/api/graphql';
import { useMessage } from '@/hooks/web/useMessage';
const { notification } = useMessage();
const WS_HOST = process.env.VUE_APP_WS_HOST || '';
const GQL_HOST = process.env.VUE_APP_GQL_HOST || '';

const wsLink = new WebSocketLink({
  uri: WS_HOST,
  options: {
    reconnect: true,
    connectionParams: () => ({
      authorization: localStorage.getItem('accelerator-token'),
    }),
  },
});

const middlewareLink = new ApolloLink((operation: Operation, forward: NextLink) => {
  // const token = storage.get('Access-Token')
  //   operation.setContext({
  //     headers: {
  //       'api-token': token || null, // 如果不需要添加header头，这步可以忽略
  //     }
  //   })
  return forward(operation);
});

const errorLink = onError(({ response }) => {
  const errors = response?.errors;
  errors &&
    notification.error({ message: '服务器错误', description: errors[0].message, duration: 3 });
});

const apolloClient = new ApolloClient<NormalizedCacheObject>({
  link: split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    errorLink.concat(middlewareLink).concat(
      createHttpLink({
        uri: GQL_HOST, //请求路径
      }),
    ),
  ), // 如果不添加请求头直接放路径
  cache: new InMemoryCache(),
});

function install(): void {
  initInstance({ apollo: apolloClient });
}

export default { install };
