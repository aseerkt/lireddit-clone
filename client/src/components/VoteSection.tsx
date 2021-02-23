import { ApolloCache, gql } from '@apollo/client';
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { Button, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useVoteMutation, VoteMutation } from '../generated/graphql';

const updateCacheAfterVote = (
  value: 1 | -1,
  postId: string,
  cache: ApolloCache<VoteMutation>
) => {
  // Pick current points and userVote for the postId
  const fragmentData = cache.readFragment<{
    id: string;
    points: number;
    userVote: number;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        userVote
      }
    `,
  });
  const { points: prevPoints, userVote } = fragmentData;
  // Calculate point change
  let pointChange: number = 1;
  if (userVote) {
    if (userVote === value) pointChange = value === 1 ? -1 : 1;
    else pointChange = value === 1 ? 2 : -2;
  } else {
    pointChange = value;
  }
  const newPoints = prevPoints + pointChange;

  // Update cache with new points and userVote
  cache.writeFragment<{
    id: string;
    points: number;
    userVote: number;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment __ on Post {
        id
        points
        userVote
      }
    `,
    data: {
      id: postId,
      points: newPoints,
      userVote: userVote === value ? null : value,
    },
  });
};

interface VoteSectionProps {
  postId: string;
  userVote: number | null;
}

const VoteSection: React.FC<VoteSectionProps> = ({
  postId,
  userVote,
  children,
}) => {
  const [loadingState, setLoadingState] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');

  const [vote] = useVoteMutation();

  return (
    <>
      {/* UpVote */}
      <Button
        title='Upvote Post'
        aria-label='upvote post'
        colorScheme={userVote === 1 ? 'orange' : undefined}
        onClick={async () => {
          setLoadingState('upvote-loading');
          await vote({
            variables: { postId, value: 1 },
            update: (cache, { data }) => {
              if (!data.vote) return;
              updateCacheAfterVote(1, postId, cache);
            },
          });
          setLoadingState('not-loading');
        }}
        size='sm'
        isLoading={loadingState === 'upvote-loading'}
      >
        <TriangleUpIcon />
      </Button>
      <Text my={1} fontWeight='semibold'>
        {children}
      </Text>
      {/* DownVote */}
      <Button
        title='Downvote Post'
        aria-label='downvote post'
        colorScheme={userVote === -1 ? 'blue' : undefined}
        onClick={async () => {
          setLoadingState('downvote-loading');
          await vote({
            variables: { postId, value: -1 },
            update: (cache, { data }) => {
              if (!data.vote) return;
              updateCacheAfterVote(-1, postId, cache);
            },
          });
          setLoadingState('not-loading');
        }}
        isLoading={loadingState === 'downvote-loading'}
        size='sm'
      >
        <TriangleDownIcon />
      </Button>
    </>
  );
};

export default VoteSection;
