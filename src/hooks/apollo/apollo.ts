import apollo from '/@/lib/esm/apollo';
import { ApolloClient } from '@apollo/client/core';
import { me } from '/@/hooks/apollo/gqlUser';

// const apolloClient = apollo.get();
// const apolloWSClient = apollo.getWS();

export function useApollo(): ApolloClient<any> {
  return apollo.get();
}

export function useApolloWS(): ApolloClient<any> {
  return apollo.getWS();
}

export function getMe(): Promise<any> {
  return new Promise((resolve) => {
    useApollo()
      .query({ query: me })
      .then((res) => {
        resolve(res.data.me);
      });
  });
}
