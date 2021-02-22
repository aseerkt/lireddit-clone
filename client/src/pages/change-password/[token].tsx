import { Container, Box, Button, Text, useToast } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import InputField from '../../components/InputField';
import { getErrorMap } from '../../utils/getErrorMap';
import { useChangePasswordMutation } from '../../generated/graphql';
import withApollo from '../../utils/withApollo';
import FormWrapper from '../../components/FormWrapper';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  // const [tokenError, setTokenError] = useState('');
  const tost = useToast();
  return (
    <FormWrapper title='Reset Password'>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async ({ newPassword }, { setErrors, setSubmitting }) => {
          try {
            const res = await changePassword({
              variables: { newPassword, token },
            });
            const { user, errors } = res.data.changePassword;
            if (errors) {
              const errorMap = getErrorMap(errors);
              if ('token' in errorMap) {
                // setTokenError(errorMap.token);
                tost({
                  title: errorMap.token,
                  status: 'error',
                  duration: 9000,
                  isClosable: true,
                });
              }
              setErrors(errorMap);
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
            <InputField
              type='password'
              name='newPassword'
              label='New Password'
              placeholder='New Password'
            />

            <Button
              mt={4}
              textTransform='uppercase'
              isFullWidth
              colorScheme='blue'
              isLoading={props.isSubmitting}
              type='submit'
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withApollo({ ssr: false })(ChangePassword);
