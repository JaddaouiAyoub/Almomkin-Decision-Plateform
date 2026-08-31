import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@almomkin.test";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@Almomkin2024";
  
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: process.env.ADMIN_NAME || "Administrateur",
      },
    });
    console.log(`Admin created with email: ${adminEmail}`);
  } else {
    console.log("Admin already exists.");
  }

  // 2. Create Experiment
  const experiment = await prisma.experiment.create({
    data: {
      name: "ALMOMKIN TEST V1",
      description: "Étude comportementale sur la prise de décision en situation d'incertitude.",
    },
  });
  console.log(`Experiment created: ${experiment.name}`);

  // 3. Create Groups
  const groupA = await prisma.experimentGroup.create({
    data: {
      experimentId: experiment.id,
      name: "Group A",
      label: "A",
      description: "Groupe avec formulation initiale.",
    },
  });
  
  const groupB = await prisma.experimentGroup.create({
    data: {
      experimentId: experiment.id,
      name: "Group B",
      label: "B",
      description: "Groupe avec formulation alternative (biais cognitif).",
    },
  });
  console.log("Groups A and B created.");

  // 4. Create Study Case
  const studyCase = await prisma.studyCase.create({
    data: {
      experimentId: experiment.id,
      title: "Cas 01 : Projet Omega",
    },
  });
  console.log("Study Case created.");

  // 5. Create Case Contents
  await prisma.caseGroupContent.create({
    data: {
      studyCaseId: studyCase.id,
      groupLabel: "A",
      content: "Vous devez prendre une décision importante concernant le Projet Omega. Vous disposez de deux informations principales, mais certaines données sont encore incertaines. Les projections montrent un retour sur investissement potentiel important, mais des risques de dépassement de budget existent.",
    },
  });
  
  await prisma.caseGroupContent.create({
    data: {
      studyCaseId: studyCase.id,
      groupLabel: "B",
      content: "Vous êtes confronté à une décision urgente concernant le Projet Omega. Bien que deux informations clés soient disponibles, l'incertitude demeure forte. Si vous ne prenez pas de décision rapide, l'organisation pourrait subir des pertes financières, malgré un potentiel de retour sur investissement.",
    },
  });
  console.log("Case contents created.");

  // 6. Create Question
  const question = await prisma.question.create({
    data: {
      studyCaseId: studyCase.id,
      text: "Quelle décision prenez-vous dans cette situation ?",
    },
  });
  console.log("Question created.");

  // 7. Create Answer Options
  const optionA = await prisma.answerOption.create({
    data: {
      questionId: question.id,
      label: "A",
      text: "Prendre immédiatement une décision avec les informations disponibles.",
      order: 1,
    },
  });
  
  const optionB = await prisma.answerOption.create({
    data: {
      questionId: question.id,
      label: "B",
      text: "Rechercher davantage d'informations avant de décider.",
      order: 2,
    },
  });
  
  const optionC = await prisma.answerOption.create({
    data: {
      questionId: question.id,
      label: "C",
      text: "Reporter la décision jusqu'à obtenir davantage de certitude.",
      order: 3,
    },
  });
  
  const optionD = await prisma.answerOption.create({
    data: {
      questionId: question.id,
      label: "D",
      text: "Demander l'avis d'une autre personne avant de décider.",
      order: 4,
    },
  });
  const options = [optionA, optionB, optionC, optionD];
  console.log("Answer options created.");

  // 8. Generate Fake Participants and Responses
  console.log("Generating fake participants and responses...");
  const participantCount = Math.floor(Math.random() * 21) + 30; // 30 to 50
  
  for (let i = 0; i < participantCount; i++) {
    const isGroupA = Math.random() > 0.5;
    const group = isGroupA ? groupA : groupB;
    
    // Create participant
    const participant = await prisma.participant.create({ data: {} });
    
    // Create session
    const session = await prisma.testSession.create({
      data: {
        participantId: participant.id,
        experimentId: experiment.id,
        groupId: group.id,
        studyCaseId: studyCase.id,
        status: "COMPLETED",
        startedAt: new Date(Date.now() - Math.random() * 1000000000), // Random past date
      },
    });
    
    const questionShownAt = new Date(session.startedAt.getTime() + Math.random() * 5000);
    const answeredAt = new Date(questionShownAt.getTime() + Math.random() * 30000 + 5000); // 5 to 35 seconds
    const decisionTimeMs = answeredAt.getTime() - questionShownAt.getTime();
    
    // Pick an answer (slightly biased depending on group for realistic data)
    let selectedOption;
    const r = Math.random();
    if (isGroupA) {
      // Group A favors B and C
      if (r < 0.2) selectedOption = optionA;
      else if (r < 0.5) selectedOption = optionB;
      else if (r < 0.8) selectedOption = optionC;
      else selectedOption = optionD;
    } else {
      // Group B favors A and D
      if (r < 0.4) selectedOption = optionA;
      else if (r < 0.6) selectedOption = optionB;
      else if (r < 0.7) selectedOption = optionC;
      else selectedOption = optionD;
    }
    
    const confidenceScore = Math.floor(Math.random() * 6) + 5; // 5 to 10
    
    await prisma.response.create({
      data: {
        sessionId: session.id,
        participantId: participant.id,
        groupId: group.id,
        studyCaseId: studyCase.id,
        questionId: question.id,
        answerOptionId: selectedOption.id,
        decisionTimeMs,
        confidenceScore,
        questionShownAt,
        answeredAt,
        clientTimeMs: decisionTimeMs - (Math.random() * 100), // Slight variation
        createdAt: answeredAt,
      },
    });
    
    await prisma.testSession.update({
      where: { id: session.id },
      data: { completedAt: new Date(answeredAt.getTime() + Math.random() * 5000) },
    });
  }
  
  console.log(`Successfully generated ${participantCount} fake participants with responses.`);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
