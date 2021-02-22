import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { AppProps } from 'next/dist/next-server/lib/router/router';
import Head from 'next/head';

import theme from '../theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Head>
        <link
          rel='icon'
          href='https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png'
        />
      </Head>
      <ColorModeProvider
        options={{
          useSystemColorMode: true,
        }}
      >
        <Component {...pageProps} />
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default MyApp;
