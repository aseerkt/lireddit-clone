import Layout from '../components/Layout';
import { useGetPostsQuery } from '../generated/graphql';
import withApollo from '../utils/withApollo';

const Index = () => {
  const { data, loading } = useGetPostsQuery();
  return (
    <Layout>
      {data &&
        data.posts &&
        data.posts.map(({ title, body, id }) => (
          <h1 key={id}>
            {title} | {body}
          </h1>
        ))}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
