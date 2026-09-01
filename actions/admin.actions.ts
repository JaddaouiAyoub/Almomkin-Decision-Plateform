"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================================
// EXPERIMENT GROUPS
// ============================================================

export async function updateGroup(
  id: string,
  data: {
    name: string;
    description: string | null;
    isActive: boolean;
  }
) {
  await prisma.experimentGroup.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/groups");
  revalidatePath("/admin");
}

// ============================================================
// STUDY CASES
// ============================================================

export async function createStudyCase(data: {
  title: string;
  isActive: boolean;
  order: number;
  contentA: string;
  contentB: string;
}) {
  // Find the active experiment (or any experiment to link to)
  const experiment = await prisma.experiment.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!experiment) {
    throw new Error("Aucune expérience active trouvée pour lier ce cas.");
  }

  await prisma.studyCase.create({
    data: {
      experimentId: experiment.id,
      title: data.title,
      isActive: data.isActive,
      order: data.order,
      groupContents: {
        create: [
          { groupLabel: "A", content: data.contentA },
          { groupLabel: "B", content: data.contentB },
        ],
      },
    },
  });

  revalidatePath("/admin/cases");
}

export async function updateStudyCase(
  id: string,
  data: {
    title: string;
    isActive: boolean;
    order: number;
    contentA: string;
    contentB: string;
  }
) {
  // Update the main case details
  await prisma.studyCase.update({
    where: { id },
    data: {
      title: data.title,
      isActive: data.isActive,
      order: data.order,
    },
  });

  // Update or upsert Group A Content
  await prisma.caseGroupContent.upsert({
    where: {
      studyCaseId_groupLabel: {
        studyCaseId: id,
        groupLabel: "A",
      },
    },
    update: { content: data.contentA },
    create: {
      studyCaseId: id,
      groupLabel: "A",
      content: data.contentA,
    },
  });

  // Update or upsert Group B Content
  await prisma.caseGroupContent.upsert({
    where: {
      studyCaseId_groupLabel: {
        studyCaseId: id,
        groupLabel: "B",
      },
    },
    update: { content: data.contentB },
    create: {
      studyCaseId: id,
      groupLabel: "B",
      content: data.contentB,
    },
  });

  revalidatePath("/admin/cases");
}

export async function deleteStudyCase(id: string) {
  await prisma.studyCase.delete({
    where: { id },
  });

  revalidatePath("/admin/cases");
  revalidatePath("/admin/questions");
  revalidatePath("/admin/results");
}

// ============================================================
// QUESTIONS & ANSWERS
// ============================================================

const REQUIRED_OPTION_LABELS = ["A", "B", "C", "D"] as const;

function normalizeQuestionOptions(
  options: Array<{ id?: string; label?: string; text: string; order?: number }>
) {
  const normalized = REQUIRED_OPTION_LABELS.map((label, index) => {
    const matchingOption = options.find(
      (opt) => (opt.label ?? "").toUpperCase() === label
    );

    if (!matchingOption) {
      throw new Error(`Une option de réponse est manquante pour le libellé ${label}.`);
    }

    const text = matchingOption.text?.trim();
    if (!text) {
      throw new Error(`Le texte de l'option ${label} ne peut pas être vide.`);
    }

    return {
      id: matchingOption.id,
      label,
      text,
      order: matchingOption.order ?? index + 1,
    };
  });

  return normalized;
}

export async function createQuestion(data: {
  studyCaseId: string;
  text: string;
  order: number;
  isActive: boolean;
  options: { label: string; text: string; order: number }[];
}) {
  const normalizedOptions = normalizeQuestionOptions(data.options);

  await prisma.question.create({
    data: {
      studyCaseId: data.studyCaseId,
      text: data.text,
      isActive: data.isActive,
      order: data.order,
      options: {
        create: normalizedOptions.map((opt) => ({
          label: opt.label,
          text: opt.text,
          order: opt.order,
        })),
      },
    },
  });

  revalidatePath("/admin/questions");
  revalidatePath("/admin/cases");
}

export async function updateQuestion(
  id: string,
  data: {
    studyCaseId: string;
    text: string;
    order: number;
    isActive: boolean;
    options: { id?: string; label: string; text: string; order: number }[];
  }
) {
  const normalizedOptions = normalizeQuestionOptions(data.options);

  await prisma.question.update({
    where: { id },
    data: {
      studyCaseId: data.studyCaseId,
      text: data.text,
      isActive: data.isActive,
      order: data.order,
    },
  });

  const existingOptions = await prisma.answerOption.findMany({
    where: { questionId: id },
    orderBy: { order: "asc" },
  });

  const existingByLabel = new Map(
    existingOptions.map((opt) => [opt.label.toUpperCase(), opt])
  );

  for (const opt of normalizedOptions) {
    const existing = existingByLabel.get(opt.label.toUpperCase());

    if (existing) {
      await prisma.answerOption.update({
        where: { id: existing.id },
        data: {
          text: opt.text,
          order: opt.order,
        },
      });
    } else {
      await prisma.answerOption.create({
        data: {
          questionId: id,
          label: opt.label,
          text: opt.text,
          order: opt.order,
        },
      });
    }
  }

  const requiredLabels = new Set(REQUIRED_OPTION_LABELS);
  for (const existing of existingOptions) {
    if (!requiredLabels.has(existing.label.toUpperCase() as "A" | "B" | "C" | "D")) {
      continue;
    }
  }

  revalidatePath("/admin/questions");
}

export async function deleteQuestion(id: string) {
  await prisma.question.delete({
    where: { id },
  });

  revalidatePath("/admin/questions");
  revalidatePath("/admin/cases");
}
