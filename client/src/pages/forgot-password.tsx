import { Alert, AlertIcon, Button, useToast } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import router from 'next/dist/next-server/lib/router/router';
import React, { useState } from 'react';
import FormWrapper from '../components/FormWrapper';
import InputField from '../components/InputField';
import { useForgotPasswordMutation } from '../generated/graphql';
import { getErrorMap } from '../utils/getErrorMap';
import withApollo from '../utils/withApollo';

const ForgotPassword = () => {
  const [forgotPassword] = useForgotPasswordMutation();
  const [confirmMsg, setConfirmMsg] = useState('');
  const toast = useToast();
  return (
    <FormWrapper title='Forgot Password'>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values, { setErrors, setSubmitting }) => {
          try {
            const res = await forgotPassword({
              variables: values,
            });
            if (res.data.forgotPassword) {
              toast({
                title: 'Check your email',
                description: 'Recovery link is sent to your email',
                status: 'info',
                duration: 7000,
                isClosable: true,
              });
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
              type='email'
              name='email'
              label='Email'
              placeholder='Email of existing your account'
            />
            <Alert hidden={!confirmMsg} status='success'>
              <AlertIcon />
              {confirmMsg}
            </Alert>
            <Button
              mt={4}
              colorScheme='teal'
              isLoading={props.isSubmitting}
              type='submit'
            >
              Request Recovery Email
            </Button>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
