import type { ApolloClient } from 'apollo-client';
import {NormalizedCacheObject} from 'apollo-cache-inmemory';
import initApi from '@/graphql';
type Graphql = { apollo: ApolloClient<NormalizedCacheObject> };
let instance: Graphql;
export function initInstance (input: Graphql): void {
  if (!instance) {
    instance = input;
  }
}

export function useApollo () {
  return initApi(instance.apollo);
}