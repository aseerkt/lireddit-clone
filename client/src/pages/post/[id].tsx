import { Box, Flex, Heading, Link, Skeleton, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import EditDeleletButtons from '../../components/EditDeleletButtons';
import Layout from '../../components/Layout';
import VoteSection from '../../components/VoteSection';
import { useGetSinglePostQuery } from '../../generated/graphql';
import withApollo from '../../utils/withApollo';

dayjs.extend(relativeTime);

const SinglPost = () => {
  const { query } = useRouter();
  const { data, loading } = useGetSinglePostQuery({
    variables: { postId: query.id as string },
    skip: !query.id,
  });

  if (!loading && !data) {
    return (
      <Layout>
        <Skeleton height='100px' />
      </Layout>
    );
  } else if (data) {
    const {
      id,
      title,
      body,
      points,
      userVote,
      creatorId,
      createdAt,
      creator: { username },
    } = data.post;
    return (
      <Layout>
        {data.post && (
          <Flex shadow='md' bg='white' borderWidth='1px' key={id}>
            {/* Vote Section */}
            <Flex p={2} pt={5} bg='gray.200' align='center' flexDir='column'>
              <VoteSection userVote={userVote} postId={id}>
                {points}
              </VoteSection>
            </Flex>
            {/* Post Content Section */}
            <Flex justify='space-between' flex={1} p={5} pl={3}>
              <Box>
                <Text mb={2} fontSize='xs' color='gray.500'>
                  Posted by <Link>{username}</Link> {dayjs(createdAt).fromNow()}
                </Text>
                <Heading fontSize='lg' fontWeight='semibold'>
                  {title}
                </Heading>
                <Text mt={4}>{body}</Text>
              </Box>
              <EditDeleletButtons postId={id} creatorId={creatorId} />
            </Flex>
          </Flex>
        )}
      </Layout>
    );
  }
  return null;
};

export default withApollo({ ssr: false })(SinglPost);
