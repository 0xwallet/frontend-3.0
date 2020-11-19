import apollo from '/@/lib/esm/apollo';
import { ApolloClient } from '@apollo/client/core';

// const apolloClient = apollo.get();
// const apolloWSClient = apollo.getWS();

export function useApollo(): ApolloClient<any> {
  return apollo.get();
}

export function useApolloWS(): ApolloClient<any> {
  return apollo.getWS();
}
