import { Flex, Box, Heading, Text, Link } from '@chakra-ui/react';
import React, { useState } from 'react';
import NextLink from 'next/link';
import { Post } from '../generated/graphql';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import VoteSection from './VoteSection';
import EditDeleletButtons from './EditDeleletButtons';

dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    id,
    title,
    body,
    points,
    userVote,
    creatorId,
    createdAt,
    creator: { username },
  } = post;

  const textSnippet = body.slice(0, 150);

  const [showMore, setShowMore] = useState(false);
  return (
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
            <NextLink href={`/post/${id}`}>{title}</NextLink>
          </Heading>
          <Text mt={4}>
            {showMore || textSnippet.length === body.length ? (
              body
            ) : (
              <>
                <span>{textSnippet}</span>
                <NextLink href={`/post/${id}`}>
                  <Link color='gray.500' fontSize='sm' ml={1}>
                    show more...
                  </Link>
                </NextLink>
              </>
            )}
          </Text>
        </Box>
        <EditDeleletButtons postId={id} creatorId={creatorId} />
      </Flex>
    </Flex>
  );
};

export default PostCard;
