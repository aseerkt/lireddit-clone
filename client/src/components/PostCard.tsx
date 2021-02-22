import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { Flex, Button, Box, Heading, Text, Link } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Post } from '../generated/graphql';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { id, title, body, points } = post;

  const textSnippet = body.slice(0, 150);

  const [showMore, setShowMore] = useState(false);
  return (
    <Flex shadow='md' bg='white' borderWidth='1px' key={id}>
      <Flex p={3} bg='gray.200' align='center' flexDir='column'>
        <Button size='sm'>
          <TriangleUpIcon />
        </Button>
        <Text my={1} fontWeight='semibold'>
          {points}
        </Text>
        <Button size='sm'>
          <TriangleDownIcon />
        </Button>
      </Flex>
      <Box p={5} pl={3}>
        <Heading fontSize='xl'>{title}</Heading>
        <Text mt={4}>
          {showMore || textSnippet.length === body.length ? (
            body
          ) : (
            <>
              <span>{textSnippet}</span>
              <Link
                color='gray.500'
                fontSize='sm'
                ml={1}
                onClick={() => setShowMore(true)}
              >
                show more...
              </Link>
            </>
          )}
        </Text>
      </Box>
    </Flex>
  );
};

export default PostCard;
