import { ApolloClient, InMemoryCache } from '@apollo/client';
import { withApollo } from 'next-apollo';

const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});

export default withApollo(client);
