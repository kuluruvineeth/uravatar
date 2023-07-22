import { Box, useDisclosure } from "@chakra-ui/react";
import { Shot } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { Controlled as ControlledZoom } from "react-medium-image-zoom";

const ShotImage = ({ shot, isHd = false }: { shot: Shot; isHd?: Boolean }) => {
  const { push, query } = useRouter();
  const { onOpen, onClose, isOpen: isZoomed } = useDisclosure();

  return (
    <Box width="100%" backgroundColor="gray.100" overflow="hidden">
      {/* <ControlledZoom
        isZoomed={isZoomed}
        onZoomChange={(shouldZoom) => {
          push(
            {
              query: {
                id: query.id,
                ...(shouldZoom && { zoomId: shot.id }),
              },
            },
            undefined,
            {
              shallow: true,
            }
          );

          shouldZoom ? onOpen() : onClose();
        }}
      >
        
      </ControlledZoom> */}
      <Image
        placeholder="blur"
        blurDataURL={shot.blurhash || "placeholder"}
        alt={shot.prompt}
        src={isHd ? shot.hdOuputUrl! : shot.outputUrl!}
        width={512}
        height={512}
        unoptimized
      />
    </Box>
  );
};

export default ShotImage;
