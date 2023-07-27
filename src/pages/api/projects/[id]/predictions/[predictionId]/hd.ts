import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import db from "@/core/db";
import replicateClient from "@/core/clients/replicate";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const projectId = req.query.id as string;
  const predictionId = req.query.predictionId as string;

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const project = await db.project.findFirstOrThrow({
    where: { id: projectId, userId: session.userId },
  });

  let shot = await db.shot.findFirstOrThrow({
    where: { projectId: project.id, id: predictionId },
  });

  if (req.method === "POST") {
    if (shot.hdStatus !== "NO") {
      return res.status(400).json({ message: "4K already applied" });
    }
    // const { data } = await replicateClient.post(
    //   `https://api.replicate.com/v1/predictions`,
    //   {
    //     input: {
    //       image: shot.outputUrl,
    //       upscale: 8,
    //       face_upsample: true,
    //       background_enhance: true,
    //       codeformer_fidelity: 1,
    //     },
    //     version:
    //       "de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
    //   }
    // );

    const output = await replicate.run(
      "sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      {
        input: {
          image: shot.outputUrl,
          upscale: 8,
          face_upsample: true,
          background_enhance: true,
          codeformer_fidelity: 1,
        },
      }
    );

    console.log("Data");
    console.log(output);
    shot = await db.shot.update({
      where: { id: shot.id },
      data: {
        hdStatus: "PROCESSED",
        hdPredictionId: predictionId,
        hdOuputUrl: output,
      },
    });

    return res.json({ shot });
  } else if (req.method === "GET") {
    if (shot.hdStatus !== "PENDING") {
      return res.status(400).json({ message: "4K already applied" });
    }
    console.log(shot.hdPredictionId);
    const { data: prediction } = await replicateClient.get(
      `https://api.replicate.com/v1/predictions/${shot.hdPredictionId}`
    );
    console.log("PREDICTION");
    console.log(prediction);
    if (prediction.output) {
      shot = await db.shot.update({
        where: { id: shot.id },
        data: {
          hdStatus: "PROCESSED",
          hdOuputUrl: prediction.output,
        },
      });
    }

    return res.json({ shot });
  }

  return res.status(405).json({ message: "Method not allowed" });
};

export default handler;
