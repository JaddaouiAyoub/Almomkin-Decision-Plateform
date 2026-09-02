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
  newInformation: string;
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
      newInformation: data.newInformation,
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
    newInformation: string;
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
      newInformation: data.newInformation,
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

function normalizeQuestionOptions(
  options: Array<{ id?: string; label?: string; text: string; order?: number }>,
  type: "SINGLE_CHOICE" | "FREE_TEXT" | "SCALE" = "SINGLE_CHOICE"
) {
  if (type === "FREE_TEXT") return [];
  if (options.length < 2) throw new Error("Une question à choix doit avoir au moins deux options.");
  const normalized = options.map((option, index) => {
    const text = option.text?.trim();
    if (!text) {
      throw new Error(`Le texte de l'option ${index + 1} ne peut pas être vide.`);
    }
    return {
      id: option.id,
      label: option.label?.trim() || String.fromCharCode(65 + index),
      text,
      order: option.order ?? index + 1,
    };
  });
  return normalized;
}

export async function createQuestion(data: {
  studyCaseId: string;
  text: string;
  order: number;
  isActive: boolean;
  type?: "SINGLE_CHOICE" | "FREE_TEXT" | "SCALE";
  stage?: "INITIAL_DECISION" | "JUSTIFICATION" | "INITIAL_CONFIDENCE" | "ALMOMKIN_ANALYSIS" | "FINAL_DECISION" | "FINAL_CONFIDENCE" | "ALMOMKIN_HELPED";
  options: { label: string; text: string; order: number }[];
}) {
  const normalizedOptions = normalizeQuestionOptions(data.options, data.type);

  await prisma.question.create({
    data: {
      studyCaseId: data.studyCaseId,
      text: data.text,
      isActive: data.isActive,
      order: data.order,
      type: data.type || "SINGLE_CHOICE",
      stage: data.stage || "INITIAL_DECISION",
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
    type?: "SINGLE_CHOICE" | "FREE_TEXT" | "SCALE";
    stage?: "INITIAL_DECISION" | "JUSTIFICATION" | "INITIAL_CONFIDENCE" | "ALMOMKIN_ANALYSIS" | "FINAL_DECISION" | "FINAL_CONFIDENCE" | "ALMOMKIN_HELPED";
    options: { id?: string; label: string; text: string; order: number }[];
  }
) {
  const normalizedOptions = normalizeQuestionOptions(data.options, data.type);

  await prisma.question.update({
    where: { id },
    data: {
      studyCaseId: data.studyCaseId,
      text: data.text,
      isActive: data.isActive,
      order: data.order,
      type: data.type,
      stage: data.stage,
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

  revalidatePath("/admin/questions");
}

export async function deleteQuestion(id: string) {
  await prisma.question.delete({
    where: { id },
  });

  revalidatePath("/admin/questions");
  revalidatePath("/admin/cases");
}
