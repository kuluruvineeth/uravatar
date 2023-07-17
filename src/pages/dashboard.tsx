import Uploader from "@/components/dashboard/Uploader";
import PageContainer from "@/components/layout/PageContainer";
import { Box, Heading } from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { useQuery } from "react-query";
import axios from "axios";

export default function Dashboard() {
  return (
    <PageContainer>
      <Box>
        <Heading as="h2" mb={4} fontWeight="semibold" fontSize="2xl">
          Create a new studio
        </Heading>
        <Uploader handleOnAdd={() => {}} />
      </Box>
    </PageContainer>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
      props: {},
    };
  }

  return { props: {} };
}
