import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import FormWrapper from '../components/FormWrapper';
import InputField from '../components/InputField';
import { useCreatePostMutation } from '../generated/graphql';
import { useIsAuth } from '../utils/useIsAuth';
import withApollo from '../utils/withApollo';

const CreatePost = () => {
  useIsAuth();
  const [createPost] = useCreatePostMutation();
  const router = useRouter();
  return (
    <FormWrapper title='Create Post'>
      <Formik
        initialValues={{ title: '', body: '' }}
        onSubmit={async (values, {}) => {
          try {
            const res = await createPost({ variables: values });
            console.log(res);
            if (res.data.createPost) {
              router.push('/');
            }
          } catch (err) {
            console.log(err);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='title'
              label='Title'
              placeholder='Title of post'
            />
            <InputField
              textarea
              name='body'
              label='Body'
              placeholder='Body of post'
            />
            <Button
              mt={4}
              textTransform='uppercase'
              isFullWidth
              colorScheme='blue'
              isLoading={isSubmitting}
              type='submit'
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

export default withApollo({ ssr: false })(CreatePost);
