import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { withApollo } from 'next-apollo';
import { onError } from '@apollo/client/link/error';
import Router from 'next/router';
import { PaginatedPostResponse } from '../generated/graphql';

const httpLink = new HttpLink({
  uri: 'http://localhost:5000/graphql',
  credentials: 'include',
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      if (message === 'Not Authenticated') {
        Router.replace('/login');
      }
    });

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getPosts: {
            keyArgs: false,
            merge(
              existing: PaginatedPostResponse,
              incoming: PaginatedPostResponse
            ) {
              return {
                ...incoming,
                posts: [...(existing?.posts || []), ...incoming.posts],
              };
            },
          },
        },
      },
    },
  }),
});

export default withApollo(client);
