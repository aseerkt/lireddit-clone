import { Button, CircularProgress } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import FormWrapper from '../../../components/FormWrapper';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import {
  useGetSinglePostQuery,
  useMeQuery,
  useUpdatePostMutation,
} from '../../../generated/graphql';
import { useIsAuth } from '../../../utils/useIsAuth';
import withApollo from '../../../utils/withApollo';
import createPost from '../../create-post';

const EditPost = () => {
  useIsAuth();
  const router = useRouter();
  const { data: meData, loading: fetchingUser } = useMeQuery();

  const { data, loading } = useGetSinglePostQuery({
    variables: { postId: router.query.id as string },
    skip: typeof router.query.id !== 'string',
  });

  const [editPost] = useUpdatePostMutation();

  if (loading) {
    return <CircularProgress />;
  } else if (!data || !data.post) {
    return (
      <Layout>
        <p>Post not found</p>
      </Layout>
    );
  } else if (!fetchingUser && data.post.creatorId !== meData.me.id) {
    router.push('/');
  }
  return (
    <FormWrapper title='Edit Post'>
      <Formik
        initialValues={{ title: data.post.title, body: data.post.body }}
        onSubmit={async (values, {}) => {
          try {
            const res = await editPost({
              variables: { ...values, postId: data.post.id },
              update: (cache, { data: resultData }) => {
                if (resultData.updatePost) {
                  // cache.evict({ id: 'Post:' + data.post.id });
                  // cache.gc();
                  router.back();
                }
              },
            });
            console.log(res);
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
              Update Post
            </Button>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

export default withApollo({ ssr: false })(EditPost);
