import Navbar from '../components/Navbar';
import { useGetPostsQuery } from '../generated/graphql';
import withApollo from '../utils/withApollo';

const Index = () => {
  const { data, loading } = useGetPostsQuery();
  return (
    <>
      <Navbar />
      {data &&
        data.posts &&
        data.posts.map(({ title, body, id }) => (
          <h1 key={id}>
            {title} | {body}
          </h1>
        ))}
    </>
  );
};

export default withApollo({ ssr: true })(Index);
