import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import db from "@/core/db";

const hanlder = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  const projectId = req.query.id as string;

  const { take, skip } = req.query;

  if (session?.user) {
    const project = await db.project.findFirstOrThrow({
      where: {
        id: projectId,
        userId: session.userId,
        modelStatus: "succeeded",
      },
      include: {
        _count: {
          select: { shots: true },
        },
        shots: {
          orderBy: { createdAt: "desc" },
          take: Number(take) || 10,
          skip: Number(skip) || 0,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ shots: project.shots, shotsCount: project._count.shots });
  }

  return res.status(401).json({ message: "Not Authenticated" });
};

export default hanlder;
