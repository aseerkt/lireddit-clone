import { Container, Flex, Box, Link, Button } from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  MeDocument,
  useLogoutMutation,
  useMeQuery,
} from '../generated/graphql';
import { isServer } from '../utils/isServer';

const Navbar = () => {
  const [logout, { loading }] = useLogoutMutation({
    update: (cache, result) => {
      if (result.data.logout) {
        cache.writeQuery({ query: MeDocument, data: { me: null } });
      }
    },
  });

  const { data, loading: fetching } = useMeQuery({
    skip: isServer(), // skip the query if we are on the server
  });
  let body = null;

  if (fetching) {
  } else if (data && !data.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Link px={2} py={1}>
            Login
          </Link>
        </NextLink>
        <NextLink href='/signup'>
          <Link px={2} py={1} ml={2}>
            Sign Up
          </Link>
        </NextLink>
      </>
    );
  } else if (data && data.me) {
    body = (
      <>
        <Link px={2} py={1}>
          {data.me.username}
        </Link>
        <NextLink href='/create-post'>
          <Button size='xs' px={2} ml={2}>
            Create Post
          </Button>
        </NextLink>
        <Button
          size='xs'
          onClick={() => {
            logout();
          }}
          isLoading={loading}
          px={2}
          ml={2}
        >
          Logout
        </Button>
      </>
    );
  }
  return (
    <Box bg='tomato' position='sticky' top='0' py={3}>
      <Container maxW='6xl'>
        <Flex justifyContent='space-between' alignItems='center'>
          <Link href='#'>LiReddit</Link>
          <Box textTransform='uppercase' fontSize='sm' textDecoration='none'>
            {body}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
