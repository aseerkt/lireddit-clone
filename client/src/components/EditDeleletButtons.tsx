import { Flex, IconButton } from '@chakra-ui/react';
import { FaPen, FaTrash } from 'react-icons/fa';
import NextLink from 'next/link';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';
import { useRouter } from 'next/router';

const EditDeleletButtons: React.FC<{ postId: string; creatorId: number }> = ({
  postId,
  creatorId,
}) => {
  const { data: meData, loading: fetchingUser } = useMeQuery();

  const [deletePost, { loading }] = useDeletePostMutation({
    variables: { postId },
  });

  const router = useRouter();

  if (!fetchingUser && meData?.me?.id !== creatorId) {
    return null;
  }
  return (
    <Flex pl={4} align='center' flexDir='column'>
      <IconButton
        colorScheme='red'
        aria-label='Delete Post'
        isLoading={loading}
        onClick={async () => {
          await deletePost({
            update: (cache, { data }) => {
              if (data.deletePost) {
                cache.evict({ id: 'Post:' + postId });
                router.push('/');
              }
            },
          });
        }}
        icon={<FaTrash />}
      />
      <NextLink href='/post/edit/[id]' as={`/post/edit/${postId}`}>
        <IconButton mt={3} aria-label='Edit Post' icon={<FaPen />} />
      </NextLink>
    </Flex>
  );
};

export default EditDeleletButtons;
