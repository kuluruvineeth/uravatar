import { NextApiRequest, NextApiResponse } from "next";
import db from "@/core/db";
import { authOptions } from "../../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

const hanlder = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
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
