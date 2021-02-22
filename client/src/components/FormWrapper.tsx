import { Container, Box, Heading, Icon, Link, Center } from '@chakra-ui/react';
import { FaReddit } from 'react-icons/fa';
import React from 'react';
import NextLink from 'next/link';

interface FormWrapperProps {
  title: string;
}

const FormWrapper: React.FC<FormWrapperProps> = ({ title, children }) => {
  return (
    <Container maxW='sm'>
      <Box
        mt={8}
        border='1px'
        p={5}
        bg='white'
        borderRadius='md'
        borderColor='gray.300'
      >
        <Center mb={1}>
          <NextLink href='/'>
            <Link textAlign='center'>
              <FaReddit size='3em' color='orange' />
            </Link>
          </NextLink>
        </Center>
        <Center mb={5}>
          <Heading fontSize='2xl' fontWeight='bold'>
            {title}
          </Heading>
        </Center>
        {children}
      </Box>
    </Container>
  );
};

export default FormWrapper;
