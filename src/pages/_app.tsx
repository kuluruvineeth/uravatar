import type { AppProps } from "next/app";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import theme from "@/styles/theme";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <ChakraProvider theme={theme}>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <Flex flexDirection="column" minH="100vh">
            <Header />
            <Component {...pageProps} />
            <Footer />
          </Flex>
        </QueryClientProvider>
      </SessionProvider>
    </ChakraProvider>
  );
}
