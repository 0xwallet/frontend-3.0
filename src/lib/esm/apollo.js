// FRONTEND ONLY

import { ApolloClient, HttpLink, ApolloLink, split } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';
import { getMainDefinition } from '@apollo/client/utilities';
import * as AbsintheSocket from '@absinthe/socket';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import { Socket as PhoenixSocket } from 'phoenix/assets/js/phoenix';

let apolloClient;
let apolloWSClient;
function get() {
  return apolloClient;
}
function getWS() {
  return apolloWSClient;
}

const init = (options) => {
  try {
    const { apiUrl } = options;
    //  must have at least httpLink
    // HTTP connetion to the API
    if (!apiUrl) return;
    const link = new HttpLink({
      // You should use an absolute URL here
      // credentials: 'include', // UNCOMMENT FOR HTTPONLY_TOKEN
      uri: apiUrl,
    });

    // split based on operation type
    // REMOVE authLink FOR HTTPONLY_TOKEN
    // @ts-ignore
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
    const cache = new InMemoryCache(); // Cache implementation
    apolloClient = new ApolloClient({
      link: middlewareLink.concat(link), // REMOVE authLink FOR HTTPONLY_TOKEN
      cache,
      connectToDevTools: true,
      // fetchOptions: { credentials: 'include' }, // Does Not Work
      // request: (operation) => {
      //   if (token) {
      //     operation.setContext({ headers: { authorization: `Bearer ${token}` } });
      //   }
      // },
      onError: ({ graphQLErrors, networkError }) => {
        if (networkError) console.log('networkError', networkError);
        if (graphQLErrors) {
          for (const err of graphQLErrors) {
            if (err.name === 'AuthenticationError') {
              // store.commit('setAuthError', err)
              // store.dispatch('signoutUser')
            }
            console.dir('graphQLErrors', err);
          }
        }
      },
    });
  } catch (e) {
    console.log(e);
  }
  return apolloClient;
}; // end init

const initWS = (option) => {
  try {
    const { url } = option;

    if (apolloWSClient) return apolloWSClient;
    const link = createAbsintheSocketLink(
      AbsintheSocket.create(
        new PhoenixSocket(url, {
          params: () => {
            return { Authorization: 'Bearer ' + localStorage.getItem('token') };
          },
        })
      )
    );
    const cache = new InMemoryCache();
    apolloWSClient = new ApolloClient({
      link: link,
      cache,
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });
  } catch (e) {
    console.log(e);
  }
  return apolloWSClient;
};

const apollo = {
  get,
  init,
  getWS,
  initWS,
};

export default apollo;
