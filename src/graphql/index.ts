import type {ApolloClient} from 'apollo-client';
import {NormalizedCacheObject} from 'apollo-cache-inmemory';
import user from './modules/user';

export default (apollo: ApolloClient<NormalizedCacheObject>) => ({
    user: user(apollo)
});