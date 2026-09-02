import { PrismaClient, QuestionStage, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedQuestion = {
  stage: QuestionStage;
  type: QuestionType;
  text: string;
  options?: string[];
};

type SeedCase = {
  title: string;
  situation: string;
  newInformation: string;
  questions: SeedQuestion[];
};

const choice = (stage: QuestionStage, text: string, options: string[]): SeedQuestion => ({ stage, type: QuestionType.SINGLE_CHOICE, text, options });
const scale = (stage: QuestionStage, text: string): SeedQuestion => ({ stage, type: QuestionType.SCALE, text, options: ["1", "2", "3", "4", "5"] });
const freeText = (stage: QuestionStage, text: string): SeedQuestion => ({ stage, type: QuestionType.FREE_TEXT, text });

const cases: SeedCase[] = [
  {
    title: "Cas 1 - Achat d'une machine",
    situation: "Une machine coûte 20 000 €.\nElle devrait permettre d'augmenter la production.",
    newInformation: "La machine peut augmenter la production de 20 %, mais son entretien annuel coûte 3 000 €.",
    questions: [
      choice(QuestionStage.INITIAL_DECISION, "Achetez-vous la machine ?", ["Oui", "Non", "Je ne sais pas"]),
      freeText(QuestionStage.JUSTIFICATION, "Pourquoi ?"),
      scale(QuestionStage.INITIAL_CONFIDENCE, "Quel est votre niveau de confiance dans cette décision ?"),
      freeText(QuestionStage.ALMOMKIN_ANALYSIS, "Quelles informations vous manquent avant de décider ?"),
      choice(QuestionStage.FINAL_DECISION, "Votre décision change-t-elle ?", ["Oui", "Partiellement", "Non"]),
      scale(QuestionStage.FINAL_CONFIDENCE, "Quel est votre nouveau niveau de confiance ?"),
      choice(QuestionStage.ALMOMKIN_HELPED, "ALMOMKIN vous a-t-il aidé ?", ["Oui", "Partiellement", "Non"]),
    ],
  },
  {
    title: "Cas 2 - Recrutement",
    situation: "Deux candidats sont disponibles.\nCandidat A : 10 ans d'expérience.\nCandidat B : 5 ans d'expérience, mais salaire moins élevé.",
    newInformation: "Le candidat A a beaucoup plus d'expérience, mais le candidat B a déjà réalisé exactement le même type de projet que celui que vous allez lancer.",
    questions: [
      choice(QuestionStage.INITIAL_DECISION, "Qui choisissez-vous ?", ["A", "B", "Je ne sais pas"]),
      freeText(QuestionStage.JUSTIFICATION, "Pourquoi ?"),
      scale(QuestionStage.INITIAL_CONFIDENCE, "Quel est votre niveau de confiance dans cette décision ?"),
      freeText(QuestionStage.ALMOMKIN_ANALYSIS, "Quelle information est la plus importante avant de choisir ?"),
      choice(QuestionStage.FINAL_DECISION, "Votre décision change-t-elle ?", ["Oui", "Partiellement", "Non"]),
      scale(QuestionStage.FINAL_CONFIDENCE, "Quel est votre nouveau niveau de confiance ?"),
      choice(QuestionStage.ALMOMKIN_HELPED, "ALMOMKIN vous a-t-il aidé ?", ["Oui", "Partiellement", "Non"]),
    ],
  },
  {
    title: "Cas 3 - Lancement d'un produit",
    situation: "Vous avez terminé un nouveau produit.\nVous pouvez :\nA. Le lancer immédiatement.\nB. Faire un test auprès de 20 utilisateurs.",
    newInformation: "Le test de 20 utilisateurs coûte seulement 200 € et prend deux jours.",
    questions: [
      choice(QuestionStage.INITIAL_DECISION, "Quelle option choisissez-vous ?", ["A", "B"]),
      freeText(QuestionStage.JUSTIFICATION, "Pourquoi ?"),
      scale(QuestionStage.INITIAL_CONFIDENCE, "Quel est votre niveau de confiance dans cette décision ?"),
      freeText(QuestionStage.ALMOMKIN_ANALYSIS, "Quel est le principal risque de votre choix ?"),
      choice(QuestionStage.FINAL_DECISION, "Votre décision change-t-elle ?", ["Oui", "Partiellement", "Non"]),
      scale(QuestionStage.FINAL_CONFIDENCE, "Quel est votre nouveau niveau de confiance ?"),
      choice(QuestionStage.ALMOMKIN_HELPED, "ALMOMKIN vous a-t-il aidé ?", ["Oui", "Partiellement", "Non"]),
    ],
  },
  {
    title: "Cas 4 - Information contradictoire",
    situation: "Vous recevez une information importante provenant d'une personne que vous considérez comme fiable.",
    newInformation: "Une deuxième source fiable donne une information différente.",
    questions: [
      choice(QuestionStage.INITIAL_DECISION, "Agissez-vous immédiatement sur cette information ?", ["Oui", "Non", "Je vérifie d'abord"]),
      freeText(QuestionStage.JUSTIFICATION, "Pourquoi ?"),
      scale(QuestionStage.INITIAL_CONFIDENCE, "Quel est votre niveau de confiance dans cette décision ?"),
      freeText(QuestionStage.ALMOMKIN_ANALYSIS, "Quelle vérification serait nécessaire avant d'agir ?"),
      choice(QuestionStage.FINAL_DECISION, "Que faites-vous ?", ["Je garde la première information.", "Je garde la deuxième.", "Je vérifie davantage avant de décider."]),
      scale(QuestionStage.FINAL_CONFIDENCE, "Quel est votre nouveau niveau de confiance ?"),
      choice(QuestionStage.ALMOMKIN_HELPED, "ALMOMKIN vous a-t-il aidé ?", ["Oui", "Partiellement", "Non"]),
    ],
  },
  {
    title: "Cas 5 - Décision réversible",
    situation: "Vous hésitez entre deux solutions.\nLa solution A est plus rapide.\nLa solution B demande plus de temps mais peut être meilleure à long terme.",
    newInformation: "Vous pouvez tester la solution A pendant une semaine sans engagement définitif.",
    questions: [
      choice(QuestionStage.INITIAL_DECISION, "Quelle solution choisissez-vous ?", ["A", "B", "Je ne sais pas"]),
      freeText(QuestionStage.JUSTIFICATION, "Pourquoi ?"),
      scale(QuestionStage.INITIAL_CONFIDENCE, "Quel est votre niveau de confiance dans cette décision ?"),
      choice(QuestionStage.ALMOMKIN_ANALYSIS, "Est-il possible de tester la solution A avant de prendre un engagement définitif ?", ["Oui", "Non", "Je ne sais pas"]),
      choice(QuestionStage.FINAL_DECISION, "Votre décision change-t-elle ?", ["Oui", "Partiellement", "Non"]),
      scale(QuestionStage.FINAL_CONFIDENCE, "Quel est votre nouveau niveau de confiance ?"),
      choice(QuestionStage.ALMOMKIN_HELPED, "ALMOMKIN vous a-t-il aidé ?", ["Oui", "Partiellement", "Non"]),
    ],
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@almomkin.test";
  const password = process.env.ADMIN_PASSWORD || "Admin@Almomkin2024";
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (!existingAdmin) await prisma.admin.create({ data: { email, passwordHash: await bcrypt.hash(password, 10), name: process.env.ADMIN_NAME || "Administrateur" } });

  let experiment = await prisma.experiment.findFirst({ where: { name: "ALMOMKIN TEST V2" } });
  if (!experiment) {
    experiment = await prisma.experiment.create({ data: { name: "ALMOMKIN TEST V2", description: "Étude de la résistance et de l'amélioration du raisonnement avec la méthode ALMOMKIN.", isActive: true } });
  }
  for (const label of ["A", "B"]) {
    await prisma.experimentGroup.upsert({ where: { experimentId_label: { experimentId: experiment.id, label } }, update: {}, create: { experimentId: experiment.id, label, name: `Groupe ${label}`, description: label === "A" ? "Formulation initiale" : "Formulation alternative" } });
  }

  for (const [index, seed] of cases.entries()) {
    const studyCase = await prisma.studyCase.upsert({
      where: { id: `almomkin-v2-case-${index + 1}` },
      update: { title: seed.title, order: index + 1, isActive: true, newInformation: seed.newInformation },
      create: { id: `almomkin-v2-case-${index + 1}`, experimentId: experiment.id, title: seed.title, order: index + 1, newInformation: seed.newInformation },
    });
    for (const groupLabel of ["A", "B"]) {
      await prisma.caseGroupContent.upsert({ where: { studyCaseId_groupLabel: { studyCaseId: studyCase.id, groupLabel } }, update: { content: seed.situation }, create: { studyCaseId: studyCase.id, groupLabel, content: seed.situation } });
    }
    for (const [questionIndex, questionSeed] of seed.questions.entries()) {
      const question = await prisma.question.upsert({
        where: { id: `almomkin-v2-case-${index + 1}-question-${questionIndex + 1}` },
        update: { text: questionSeed.text, type: questionSeed.type, stage: questionSeed.stage, order: questionIndex + 1, isActive: true },
        create: { id: `almomkin-v2-case-${index + 1}-question-${questionIndex + 1}`, studyCaseId: studyCase.id, text: questionSeed.text, type: questionSeed.type, stage: questionSeed.stage, order: questionIndex + 1 },
      });
      for (const [optionIndex, optionText] of (questionSeed.options || []).entries()) {
        await prisma.answerOption.upsert({ where: { id: `${question.id}-option-${optionIndex + 1}` }, update: { label: questionSeed.type === QuestionType.SCALE ? optionText : String.fromCharCode(65 + optionIndex), text: optionText, order: optionIndex + 1 }, create: { id: `${question.id}-option-${optionIndex + 1}`, questionId: question.id, label: questionSeed.type === QuestionType.SCALE ? optionText : String.fromCharCode(65 + optionIndex), text: optionText, order: optionIndex + 1 } });
      }
    }
  }
  console.log("ALMOMKIN V2 seeded: 5 cases, staged questions and dynamic options.");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
