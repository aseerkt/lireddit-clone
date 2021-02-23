import { TriangleDownIcon } from '@chakra-ui/icons';
import {
  Container,
  Flex,
  Box,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Heading,
  IconButton,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { FaPen, FaReddit } from 'react-icons/fa';
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
          <Button
            textTransform='uppercase'
            size='sm'
            variant='outline'
            colorScheme='blue'
          >
            Log In
          </Button>
        </NextLink>
        <NextLink href='/register'>
          <Button textTransform='uppercase' size='sm' colorScheme='blue' ml={2}>
            Sign Up
          </Button>
        </NextLink>
      </>
    );
  } else if (data && data.me) {
    body = (
      <>
        <NextLink href='/create-post'>
          <Link px={2} py={1} title='Create Post'>
            <FaPen />
          </Link>
        </NextLink>
        <Menu>
          <MenuButton
            ml={3}
            as={Button}
            size='sm'
            borderRadius='sm'
            width={20}
            bg='white'
            variant='outline'
            fontWeight='normal'
            rightIcon={<TriangleDownIcon color='gray' boxSize={3} />}
          >
            {data.me.username}
          </MenuButton>
          <MenuList>
            <MenuItem
              onClick={async () => {
                await logout({
                  update: (cache, { data }) => {
                    cache.reset();
                  },
                });
              }}
            >
              Log Out
            </MenuItem>
          </MenuList>
        </Menu>
      </>
    );
  }
  return (
    <Box bg='white' shadow='md' position='sticky' top='0' zIndex={3} py={1}>
      <Container maxW='5xl'>
        <Flex justifyContent='space-between' alignItems='center'>
          <NextLink href='/'>
            <Link textDecoration='none' display='flex' alignItems='center'>
              <FaReddit size='2.3em' color='orange' />
              <Heading fontSize='2xl' fontWeight='semibold' ml={2}>
                lireddit
              </Heading>
            </Link>
          </NextLink>
          <Flex
            align='center'
            textTransform='uppercase'
            fontSize='sm'
            textDecoration='none'
          >
            {body}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
