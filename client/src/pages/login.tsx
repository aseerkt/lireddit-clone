import { Box, Button, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import NextLink from 'next/link';
import InputField from '../components/InputField';
import { MeDocument, useLoginMutation } from '../generated/graphql';
import { getErrorMap } from '../utils/getErrorMap';
import { useRouter } from 'next/router';
import withApollo from '../utils/withApollo';
import FormWrapper from '../components/FormWrapper';

const Login = () => {
  const router = useRouter();
  const [login] = useLoginMutation({
    update: (cache, result) => {
      const user = result.data.login.user;
      if (user) {
        cache.writeQuery({ query: MeDocument, data: { me: user } });
      }
    },
  });

  return (
    <FormWrapper title='Log In'>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors, setSubmitting }) => {
          try {
            const res = await login({ variables: values });
            const { user, errors } = res.data.login;
            if (errors) {
              setErrors(getErrorMap(errors));
            } else if (user) {
              router.push('/');
            }
            console.log(res);
          } catch (err) {
            console.log(err);
          }
          setSubmitting(false);
        }}
      >
        {(props) => (
          <>
            <Form>
              <InputField
                name='usernameOrEmail'
                label='Username / Email'
                placeholder='Username / Email'
              />
              <InputField
                type='password'
                name='password'
                label='Password'
                placeholder='Password'
              />

              <Button
                mt={4}
                colorScheme='teal'
                isLoading={props.isSubmitting}
                type='submit'
              >
                Log In
              </Button>
            </Form>
            <Box mt={3}>
              <NextLink href='/forgot-password'>
                <Link color='blue.700'>Forgot Password</Link>
              </NextLink>
            </Box>
          </>
        )}
      </Formik>
    </FormWrapper>
  );
};

export default withApollo({ ssr: false })(Login);
