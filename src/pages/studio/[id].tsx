import PageContainer from "@/components/layout/PageContainer";
import ProjectProvider from "@/contexts/project-context";
import { IStudioPageProps } from "@/core/utils/types";
import { Box, Button } from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";
import db from "@/core/db";
import { SHOTS_PER_PAGE } from "@/contexts/project-context";
import replicateClient from "@/core/clients/replicate";
import superjson from "superjson";
import PromptPanel from "@/components/projects/PromptPanel";
import ShotsList from "@/components/projects/shot/ShotsList";

const StudioPage = ({ project, hasImageInputAvailable }: IStudioPageProps) => (
  <ProjectProvider project={project}>
    <PageContainer>
      <Box mb={4}>
        <Button
          color="beige.500"
          leftIcon={<HiArrowLeft />}
          variant="link"
          href="/dashboard"
          as={Link}
        >
          Back to Dashboard
        </Button>
      </Box>
      <PromptPanel hasImageInputAvailable={hasImageInputAvailable} />
      <ShotsList />
    </PageContainer>
  </ProjectProvider>
);

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession({ req: context.req });
  const projectId = context.query.id as string;

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }

  const project = await db.project.findFirstOrThrow({
    where: { id: projectId, userId: session.userId, modelStatus: "succeeded" },
    include: {
      _count: {
        select: { shots: true },
      },
      shots: {
        orderBy: { createdAt: "desc" },
        take: SHOTS_PER_PAGE,
        skip: 0,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!project) {
    return {
      notFound: true,
    };
  }

  const { data: model } = await replicateClient.get(
    `https://api.replicate.com/v1/models/${process.env.REPLICATE_USERNAME}/${project.id}/versions/${project.modelVersionId}`
  );

  const hasImageInputAvailable = Boolean(
    model.openapi_schema?.components?.schemas?.Input?.properties?.image?.title
  );

  const { json: serializedProject } = superjson.serialize(project);

  return {
    props: {
      project: serializedProject,
      hasImageInputAvailable,
    },
  };
}

export default StudioPage;
