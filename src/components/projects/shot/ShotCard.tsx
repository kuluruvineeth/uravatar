import {
  Box,
  useClipboard,
  AspectRatio,
  Center,
  VStack,
  Icon,
  Spinner,
  Flex,
  Tooltip,
  IconButton,
  Text,
  HStack,
  Button,
} from "@chakra-ui/react";
import { Shot } from "@prisma/client";
import { memo, useState } from "react";
import { ratio } from "react-advanced-cropper";
import { TbFaceIdError } from "react-icons/tb";
import ShotImage from "./ShotImage";
import { MdOutlineModelTraining } from "react-icons/md";
import Link from "next/link";
import { HiDownload } from "react-icons/hi";
import { Ri4KFill } from "react-icons/ri";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { formatRelative } from "date-fns";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { useRouter } from "next/router";

const getHdLabel = (shot: Shot, isHd: boolean) => {
  if (shot.hdStatus === "NO") {
    return "Generate in 4K";
  }

  if (shot.status === "PENDING") {
    return "4K in progress";
  }

  if (shot.hdStatus === "PROCESSED" && isHd) {
    return "Show standard resolution";
  }

  return "Show 4K";
};

const ShotCard = ({
  shot: initialShot,
  handleSeed,
}: {
  shot: Shot;
  handleSeed: (shot: Shot) => void;
}) => {
  const { onCopy, hasCopied } = useClipboard(initialShot.prompt);
  const { query } = useRouter();
  const [shot, setShot] = useState(initialShot);
  const [isHd, setIsHd] = useState(Boolean(shot.hdOuputUrl));

  const { mutate: bookmark, isLoading } = useMutation(
    `update-shot-${initialShot.id}`,
    (bookmarked: boolean) =>
      axios.patch<{ shot: Shot }>(
        `/api/projects/${query.id}/predictions/${initialShot.id}`,
        {
          bookmarked,
        }
      ),
    {
      onSuccess: (response) => {
        setShot(response.data.shot);
      },
    }
  );

  useQuery(
    `shot-${initialShot.id}`,
    () =>
      axios
        .get<{ shot: Shot }>(
          `/api/projects/${query.id}/predictions/${initialShot.id}`
        )
        .then((res) => res.data),
    {
      refetchInterval: (data) => (data?.shot.outputUrl ? false : 5000),
      refetchOnWindowFocus: false,
      enabled: !initialShot.outputUrl && initialShot.status !== "failed",
      initialData: { shot: initialShot },
      onSuccess: (response) => {
        setShot(response.shot);
      },
    }
  );

  return (
    <Box
      overflow="hidden"
      backgroundColor="white"
      borderRadius="lg"
      width="100%"
      position="relative"
    >
      {shot.outputUrl ? (
        <ShotImage isHd={isHd} shot={shot} />
      ) : (
        <Box>
          <AspectRatio ratio={1}>
            {shot.status === "failed" ? (
              <Center backgroundColor="beige.50" width="100%">
                <VStack>
                  <Icon fontSize="3xl" as={TbFaceIdError} />
                  <Box fontSize="sm" color="blackAlpha.700">
                    Shot generation failed
                  </Box>
                </VStack>
              </Center>
            ) : (
              <Center backgroundColor="gray.100" width="100%">
                <Spinner size="xl" speed="2s" color="gray.400" />
              </Center>
            )}
          </AspectRatio>
        </Box>
      )}
      <Flex position="relative" p={3} flexDirection="column">
        <Flex alignItems="center" justifyContent="flex-end">
          <Box>
            {shot.seed && shot.outputUrl && (
              <Tooltip hasArrow label="Re-use style">
                <IconButton
                  size="sm"
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: "smooth",
                    });
                  }}
                  variant="ghost"
                  aria-label="Download"
                  fontSize="md"
                  icon={<MdOutlineModelTraining />}
                />
              </Tooltip>
            )}
            {shot.outputUrl && (
              <>
                <IconButton
                  size="sm"
                  as={Link}
                  href={isHd ? shot.hdOuputUrl! : shot.outputUrl!}
                  target="_blank"
                  variant="ghost"
                  aria-label="Download"
                  fontSize="md"
                  icon={<HiDownload />}
                />
                <Tooltip hasArrow label={getHdLabel(shot, isHd)}>
                  <IconButton
                    icon={<Ri4KFill />}
                    color={isHd ? "red.400" : "gray.600"}
                    isLoading={shot.hdStatus === "PENDING"}
                    onClick={() => {
                      if (shot.hdStatus === "NO") {
                      } else if (
                        shot.hdStatus === "PROCESSED" &&
                        shot.hdOuputUrl
                      ) {
                        setIsHd(!isHd);
                      }
                    }}
                    size="sm"
                    variant="ghost"
                    aria-label="Make 4K"
                    fontSize="lg"
                  />
                </Tooltip>
              </>
            )}
            <Tooltip
              hasArrow
              label={`${shot.bookmarked ? "Remove" : "Add"} to your gallery`}
            >
              <IconButton
                isLoading={false}
                size="sm"
                variant="ghost"
                aria-label="Bookmark"
                fontSize="md"
                icon={shot.bookmarked ? <BsHeartFill /> : <BsHeart />}
                onClick={() => {}}
                pointerEvents={undefined}
                color={shot.bookmarked ? "red" : "inherit"}
              />
            </Tooltip>
          </Box>
        </Flex>
        <Text
          mt={2}
          cursor="text"
          noOfLines={2}
          fontSize="sm"
          fontWeight="semibold"
        >
          {shot.prompt}
        </Text>

        <HStack justifyContent="space-between" mt={4}>
          <Text color="beige.400" fontSize="xs">
            {formatRelative(new Date(shot.createdAt), new Date())}
          </Text>
          <Button
            rightIcon={hasCopied ? <IoMdCheckmarkCircleOutline /> : undefined}
            colorScheme="beige"
            size="xs"
            variant="link"
            onClick={onCopy}
          >
            {hasCopied ? "Copied" : "Copy Prompt"}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default memo(ShotCard);
