import Uploader from "@/components/dashboard/Uploader";
import PageContainer from "@/components/layout/PageContainer";
import { Box, Center, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { useQuery } from "react-query";
import axios from "axios";
import { ProjectWithShots } from "@/core/utils/types";
import ProjectCard from "@/components/projects/ProjectCard";

export default function Dashboard() {
  const {
    data: projects,
    refetch: refetchProjects,
    isLoading,
  } = useQuery(`projects`, () =>
    axios
      .get<ProjectWithShots[]>("/api/projects")
      .then((response) => response.data)
  );
  return (
    <PageContainer>
      <Box>
        <Heading as="h2" mb={4} fontWeight="semibold" fontSize="2xl">
          Create a new studio
        </Heading>
        <Uploader handleOnAdd={() => {}} />
      </Box>

      <Box mt={10}>
        <Heading as="h2" mb={4} fontWeight="semibold" fontSize="2xl">
          My Studios
        </Heading>

        {isLoading && (
          <Center width="100%" textAlign="center">
            <Spinner mr={3} size="sm" speed="1s" />
            <Text>Loading Studios</Text>
          </Center>
        )}

        {!isLoading && projects?.length === 0 && (
          <Center
            p={10}
            borderRadius="xl"
            backgroundColor="white"
            width="100%"
            color="blackAlpha.700"
            textAlign="center"
          >
            <Text backgroundColor="white">No Studio available yet</Text>
          </Center>
        )}

        <VStack spacing={10} width="100%">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              handleRefreshProjects={() => {
                refetchProjects();
              }}
            />
          ))}
        </VStack>
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
