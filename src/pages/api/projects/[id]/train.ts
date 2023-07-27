import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import db from "@/core/db";
import { getRefinedInstanceClass } from "@/core/utils/predictions";
import replicateClient from "@/core/clients/replicate";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const projectId = req.query.id as string;
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  let project = await db.project.findFirstOrThrow({
    where: {
      id: projectId,
      userId: session.userId,
      modelStatus: "not_created",
      NOT: { stripePaymentId: null },
    },
  });

  const instanceClass = getRefinedInstanceClass(project.instanceClass);

  const responseReplicate = await replicateClient.post(
    "/v1/trainings",
    {
      input: {
        instance_prompt: `a photo of a ${process.env.NEXT_PUBLIC_REPLICATE_INSTANCE_TOKEN} ${instanceClass}`,
        class_prompt: `a photo of ${instanceClass}`,
        instance_data: `https://${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com/${project.id}.zip`,
        max_train_steps: Number(process.env.REPLICATE_MAX_TRAIN_STEPS),
        num_class_images: 200,
        learning_rate: 1e-6,
      },
      model: `${process.env.REPLICATE_USERNAME}/${project.id}`,
      webhook_completed: `${process.env.NEXTAUTH_URL}/api/weebhooks/completed`,
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const replicateModelId = responseReplicate.data.id as string;

  project = await db.project.update({
    where: { id: project.id },
    data: { replicateModelId: replicateModelId, modelStatus: "processing" },
  });

  return res.json({ project });
};

export default handler;
