// FRONTEND ONLY

import { ApolloClient } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';
import * as AbsintheSocket from '@absinthe/socket';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import { Socket as PhoenixSocket } from 'phoenix/assets/js/phoenix';

let apolloWSClient;

function getWS() {
  return apolloWSClient;
}

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
  getWS,
  initWS,
};

export default apollo;
