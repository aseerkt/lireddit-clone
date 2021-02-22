import { Box, Button, Container, Text } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import InputField from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { getErrorMap } from '../utils/getErrorMap';
import { useRouter } from 'next/router';
import withNextApollo from '../utils/withApollo';
import withApollo from '../utils/withApollo';
import FormWrapper from '../components/FormWrapper';

const Register = () => {
  const router = useRouter();
  const [register] = useRegisterMutation();

  return (
    <FormWrapper title='Sign Up'>
      <Formik
        initialValues={{ username: '', email: '', password: '' }}
        onSubmit={async (values, { setErrors, setSubmitting }) => {
          try {
            const res = await register({ variables: values });
            const { user, errors } = res.data.register;
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
          <Form>
            <InputField name='email' label='Email' placeholder='Email' />
            <InputField
              name='username'
              label='Username'
              placeholder='Username'
            />
            <InputField
              type='password'
              name='password'
              label='Password'
              placeholder='Password'
            />

            <Button
              mt={4}
              textTransform='uppercase'
              isFullWidth
              colorScheme='blue'
              isLoading={props.isSubmitting}
              type='submit'
            >
              Sign Up
            </Button>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

export default withApollo({ ssr: false })(Register);
