import { prisma } from "@/lib/prisma";
import type { GroupLabel } from "@/types";

/**
 * Assigns a random group to a participant for a given experiment.
 * This is ALWAYS done server-side — never exposed to the client.
 */
export async function assignGroup(experimentId: string): Promise<{
  groupId: string;
  groupLabel: GroupLabel;
  groupName: string;
}> {
  // Get all active groups for this experiment
  const groups = await prisma.experimentGroup.findMany({
    where: {
      experimentId,
      isActive: true,
    },
    orderBy: { label: "asc" },
  });

  if (groups.length === 0) {
    throw new Error("No active groups found for this experiment");
  }

  // Truly random server-side assignment
  const randomIndex = Math.floor(Math.random() * groups.length);
  const assignedGroup = groups[randomIndex];

  return {
    groupId: assignedGroup.id,
    groupLabel: assignedGroup.label as GroupLabel,
    groupName: assignedGroup.name,
  };
}
