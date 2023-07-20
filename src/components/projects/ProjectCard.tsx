import { getRefinedStudioName } from "@/core/utils/projects";
import { ProjectWithShots } from "@/core/utils/types";
import {
  Box,
  Flex,
  VStack,
  Text,
  Badge,
  AvatarGroup,
  Avatar,
  Button,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import ProjectDeleteButton from "./ProjectDeleteButton";
import { IoIosFlash } from "react-icons/io";
import { HiArrowRight } from "react-icons/hi";
import Link from "next/link";
import FormPayment from "./FormPayment";

const ProjectCard = ({
  project,
  handleRefreshProjects,
}: {
  project: ProjectWithShots;
  handleRefreshProjects: () => void;
}) => {
  const isWaitingPayement = !project.stripePaymentId;

  const isWaitingTraining =
    project.stripePaymentId && !project.replicateModelId;

  const isReady = project.modelStatus === "succeeded";
  const isTraining =
    project.modelStatus === "processing" ||
    project.modelStatus === "pushing" ||
    project.modelStatus === "queued";

  return (
    <Box
      position="relative"
      backgroundColor="white"
      width="100%"
      pt={4}
      pb={10}
      px={5}
      borderRadius="xl"
      shadow="lg"
    >
      <VStack spacing={4} alignItems="flex-start">
        <Flex width="100%">
          <Box flex="1">
            <Text fontSize="2xl" fontWeight="semibold">
              Studio <b>{getRefinedStudioName(project)}</b>{" "}
              {isReady && (
                <Badge colorScheme="teal">{project.credits} shots left</Badge>
              )}
            </Text>
            <Text textTransform="capitalize" fontSize="sm" color="beige.500">
              {formatRelative(new Date(project.createdAt), new Date())}
            </Text>
          </Box>
          <ProjectDeleteButton
            handleRemove={() => {
              handleRefreshProjects();
            }}
            projectId={project.id}
          />
        </Flex>

        {isWaitingPayement && (
          <FormPayment
            handlePaymentSuccess={() => {
              handleRefreshProjects();
            }}
            project={project}
          />
        )}

        {isWaitingTraining && (
          <>
            <VStack overflow="hidden" width="100%" spacing={4}>
              <Box fontWeight="bold" fontSize="xl">
                Your Studio is ready to be trained!
              </Box>
              <AvatarGroup size="lg" max={10}>
                {project.imageUrls.map((url) => (
                  <Avatar key={url} src={url} />
                ))}
              </AvatarGroup>
              <Button
                variant="brand"
                rightIcon={<IoIosFlash />}
                isLoading={false}
                onClick={() => {}}
              >
                Start Training
              </Button>
            </VStack>
          </>
        )}

        {isReady && (
          <Center overflow="hidden" width="100%" marginX="auto">
            <VStack spacing={7}>
              {!project.shots ? (
                <Box fontSize="lg">
                  {`You don't have any prompt yet`}.{" "}
                  <b>Go to your studio to add one !</b>
                </Box>
              ) : (
                <AvatarGroup size="xl" max={10}>
                  {project.shots
                    .filter((shot) => Boolean(shot.outputUrl))
                    .map((shot) => (
                      <Avatar key={shot.outputUrl} src={shot.outputUrl!} />
                    ))}
                </AvatarGroup>
              )}
              <Button
                rightIcon={<HiArrowRight />}
                variant="brand"
                href=""
                as={Link}
              >
                View my Studio
              </Button>
            </VStack>
          </Center>
        )}
      </VStack>

      {isTraining && (
        <Center marginX="auto">
          <VStack spacing={7}>
            <Spinner size="xl" speed="2s" />
            <Text textAlign="center" maxW="20rem">
              The studio is creating.{" "}
              <b>the custom model based on your uploaded photos</b>. This
              operation usually takes ~20min.
            </Text>
          </VStack>
        </Center>
      )}

      {project.modelStatus === "failed" && (
        <Center marginX="auto">
          <Text my={10} color="red.600" textAlign="center">
            We are sorry but the creation of the model failed. Please contact us
            by email so we can fix it/refund you
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default ProjectCard;
