import { createPreviewMedia } from "@/core/utils/upload";
import {
  Box,
  Center,
  Highlight,
  VStack,
  useToast,
  Text,
  List,
  Image,
  Flex,
  Icon,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import AvatarsPlaceholder from "../home/AvatarsPlaceholder";
import { CheckedListItem } from "../home/Pricing";
import { IoIosClose } from "react-icons/io";
import { MdCloud } from "react-icons/md";

type TUploadState = "not_uploaded" | "uploading" | "uploaded";

export type FilePreview = (File | Blob) & { preview: string };

const MAX_FILES = 25;

const Uploader = ({}) => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploadState, setUploadState] = useState<TUploadState>("not_uploaded");
  const [urls, setUrls] = useState<string[]>([]);

  const toast = useToast();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
    maxSize: 10000000, // 10mb
    onDropRejected: (events) => {
      setErrorMessages([]);
      const messages: { [key: string]: string } = {};

      events.forEach((event) => {
        event.errors.forEach((error) => {
          messages[error.code] = error.message;
        });
      });

      setErrorMessages(Object.keys(messages).map((id) => messages[id]));
    },
    onDrop: (acceptedFiles) => {
      if (files.length + acceptedFiles.length > MAX_FILES) {
        toast({
          title: `You can't upload more than ${MAX_FILES} images`,
          duration: 3000,
          isClosable: true,
          position: "top-right",
          status: "error",
        });
      } else {
        setErrorMessages([]);
        setFiles([
          ...files,
          ...acceptedFiles.map((file) => createPreviewMedia(file)),
        ]);
      }
    },
  });

  return (
    <Box>
      {uploadState === "not_uploaded" && (
        <Center
          _hover={{
            bg: "whiteAlpha.800",
          }}
          transition="all 0.2s"
          backgroundColor="whiteAlpha.500"
          cursor="pointer"
          borderRadius="xl"
          border="1px dashed gray"
          p={10}
          flexDirection="column"
          {...getRootProps({ className: "dropzone" })}
        >
          <input {...getInputProps()} />
          <Box mb={4} position="relative">
            <AvatarsPlaceholder character="sacha" />
          </Box>
          <VStack textAlign="center" spacing={1}>
            <Box fontWeight="bold" fontSize="2xl">
              Drag and drop or click to upload
            </Box>
            <Box fontWeight="bold" fontSize="lg">
              <Highlight
                query="10-20 pictures"
                styles={{ bg: "brand.500", px: 1 }}
              >
                Upload 10-20 pictures of you
              </Highlight>
            </Box>
            <Box maxWidth="container.sm">
              <Text mt={4}>
                To get the best results, we suggest uploading 3 full body or
                entire object photos, 5 medium shots of the chest and up, and 10
                close-up photos and:
              </Text>
            </Box>
            <Box>
              <List mt={4} textAlign="left">
                <CheckedListItem>
                  Mix it up - Change body pose, background, and lighting in each
                  photo
                </CheckedListItem>
                <CheckedListItem>
                  Capture a range of expressions
                </CheckedListItem>
                <CheckedListItem>
                  Show the subjects eyes looking in different directions
                </CheckedListItem>
              </List>
            </Box>
          </VStack>
        </Center>
      )}

      <Flex pt={3} flexWrap="wrap">
        {files.map((file, index) => (
          <Box
            m={3}
            width="7rem"
            height="7rem"
            position="relative"
            key={file.name}
          >
            <Center top={-2} right={-2} position="absolute">
              {uploadState !== "uploading" && !urls[index] && (
                <Icon
                  cursor="pointer"
                  onClick={() => {
                    setFiles(files.filter((_, i) => i !== index));
                  }}
                  borderRadius="full"
                  backgroundColor="brand.500"
                  as={IoIosClose}
                  fontSize="2rem"
                />
              )}
            </Center>
            <Image
              objectFit="cover"
              borderRadius="xl"
              border="4px solid white"
              shadow="xl"
              alt={file.name}
              width="7rem"
              height="7rem"
              src={file.preview}
              onLoad={() => {
                URL.revokeObjectURL(file.preview);
              }}
            />
          </Box>
        ))}
      </Flex>

      {files.length > 0 && uploadState !== "uploaded" && (
        <Box mb={10} textAlign="center">
          <Button
            isLoading={uploadState === "uploading"}
            rightIcon={<MdCloud />}
            size="lg"
            onClick={() => {}}
            variant="brand"
          >
            {files.length < 5
              ? "Upload (min 5 photos)"
              : `Upload ${files.length} photo${files.length > 1 && "s"}`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Uploader;
