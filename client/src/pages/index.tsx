import { Stack, Center, Button, Skeleton } from '@chakra-ui/react';
import Head from 'next/head';
import React from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { Post, useGetPostsQuery } from '../generated/graphql';
import withApollo from '../utils/withApollo';

const Index = () => {
  const { data, loading, fetchMore, networkStatus } = useGetPostsQuery({
    variables: { limit: 5 },
    notifyOnNetworkStatusChange: true,
  });
  // console.log(networkStatus);
  return (
    <>
      <Head>
        <title>lireddit : awad redditors</title>
      </Head>
      <Layout>
        <Stack spacing={5}>
          {data &&
            data.getPosts &&
            data.getPosts.posts.map((post) => (
              // <Skeleton key={post.id} isLoaded={!loading}>
              // </Skeleton>
              <PostCard key={post.id} post={post as Post} />
            ))}
          {networkStatus === 3 && <Skeleton height='50px' />}
        </Stack>
        <Center my={5}>
          {networkStatus === 7 && data.getPosts.hasMore && (
            <Button
              onClick={() => {
                fetchMore({
                  variables: {
                    limit: 5,
                    cursor:
                      data.getPosts.posts[data.getPosts.posts.length - 1]
                        .createdAt,
                  },
                });
              }}
              variant='outline'
              colorScheme='black'
            >
              Load More
            </Button>
          )}
        </Center>
      </Layout>
    </>
  );
};

export default withApollo({ ssr: false })(Index);
