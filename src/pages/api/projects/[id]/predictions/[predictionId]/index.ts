import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import db from "@/core/db";
import replicateClient from "@/core/clients/replicate";
import { getPlaiceholder } from "plaiceholder";
import { extractSeedFromLogs } from "@/core/utils/predictions";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const projectId = req.query.id as string;
  const predictionId = req.query.predictionId as string;
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  const project = await db.project.findFirstOrThrow({
    where: { id: projectId, userId: session.userId },
  });

  let shot = await db.shot.findFirstOrThrow({
    where: { projectId: project.id, id: predictionId },
  });

  if (req.method === "GET") {
    const { data: prediction } = await replicateClient.get(
      `https://api.replicate.com/v1/predictions/${shot.replicateId}`
    );

    const outputUrl = prediction.output?.[0];
    // console.log("OutputUrl");
    // console.log(outputUrl);
    let blurhash = null;

    if (outputUrl) {
      //   console.log("failed here");
      const { base64 } = await getPlaiceholder(outputUrl, { size: 16 });
      blurhash = base64;
    }

    const seedNumber = extractSeedFromLogs(prediction.logs);
    // console.log("seed Number");
    // console.log(seedNumber);
    shot = await db.shot.update({
      where: { id: shot.id },
      data: {
        status: prediction.status,
        outputUrl: outputUrl || null,
        blurhash,
        seed: seedNumber || null,
      },
    });

    return res.json({ shot });
  } else if (req.method === "PATCH") {
    const { bookmarked } = req.body;

    shot = await db.shot.update({
      where: { id: shot.id },
      data: {
        bookmarked: bookmarked || false,
      },
    });
    return res.json({ shot });
  }

  return res.status(405).json({ message: "Method not allowed" });
};

export default handler;
