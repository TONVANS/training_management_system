// lib/data/participants.ts

import { ParticipantData, TrainingHistory } from "@/types/participant";

// ສ້າງ Mock Data
export function generateParticipants(): ParticipantData[] {
  const participants: ParticipantData[] = [];
  const names = [
    "ທ່ານ ສົມສັກ ວົງສາ",
    "ທ່ານ ນາງ ມະນີ ສີປະເສີດ",
    "ທ່ານ ບຸນມີ ແກ້ວມະນີ",
    "ທ່ານ ນາງ ວັນດີ ພູມມະນີ",
    "ທ່ານ ສົມຊາຍ ລາວົງ",
    "ທ່ານ ນາງ ແສງດາວ ພົມມະນີ",
    "ທ່ານ ບຸນຊ່ວຍ ສີວິໄລ",
    "ທ່ານ ນາງ ໃຈດີ ວົງສະຫວ່າງ",
    "ທ່ານ ສີສະຫວາດ ຈັນທະລາ",
    "ທ່ານ ນາງ ສຸກໃຈ ພູມມະນີ",
  ];
  const positions = [
    "Senior Developer",
    "HR Manager",
    "Marketing Lead",
    "Finance Officer",
    "IT Support",
  ];
  const departments = [
    "IT Department",
    "Human Resources",
    "Marketing",
    "Finance",
    "Operations",
  ];

  const trainingTitles = [
    "Modern React Patterns & Best Practices",
    "TypeScript Advanced Workshop",
    "Leadership Development Program",
    "Digital Marketing Fundamentals",
    "Financial Analysis & Reporting",
    "Agile Project Management",
    "Cybersecurity Awareness",
    "Effective Communication Skills",
    "Data Analytics with Python",
    "Customer Service Excellence",
  ];

  for (let i = 0; i < 35; i++) {
    const history = generateTrainingHistory(i, trainingTitles);
    const passedCount = history.filter((h) => h.status === "Passed").length;
    const totalHours = history.reduce((sum, h) => sum + (h.duration || 0), 0);
    const scores = history.filter((h) => h.score).map((h) => h.score!);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    participants.push({
      id: `P${String(i + 1).padStart(3, "0")}`,
      name: names[i % names.length] + (i >= 10 ? ` (${i + 1})` : ""),
      position: positions[i % positions.length],
      department: departments[i % departments.length],
      email: `user${i + 1}@company.la`,
      phone: `020 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
      completedCount: passedCount,
      totalHours: totalHours,
      averageScore: averageScore,
      joinDate: `01/${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/2024`,
      history: history,
    });
  }
  return participants;
}

function generateTrainingHistory(
  seed: number,
  titles: string[],
): TrainingHistory[] {
  const history: TrainingHistory[] = [];
  const count = Math.floor((seed * 9973) % 8) + 3; // 3-10 ລາຍການ
  const statuses: ("Passed" | "Attended" | "In Progress" | "Failed")[] = [
    "Passed",
    "Attended",
    "In Progress",
    "Failed",
  ];
  const instructors = [
    "ອ. ວິໄລ ພົມມະສອນ",
    "ອ. ບຸນທັນ ສີວິໄລ",
    "ດຣ. ສົມສີ ແກ້ວມະນີ",
    "ອ. ນາງ ຄຳພອນ",
  ];
  const categories = ["Technical", "Soft Skills", "Management", "Compliance"];

  for (let i = 0; i < count; i++) {
    const monthsAgo = i * 2 + Math.floor(Math.random() * 2);
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const score =
      status === "Passed" || status === "Failed"
        ? Math.floor(Math.random() * 30) + (status === "Passed" ? 70 : 40)
        : undefined;

    history.push({
      id: `${seed}-${i}`,
      title: titles[i % titles.length],
      date: date.toLocaleDateString("en-GB"),
      instructor: instructors[Math.floor(Math.random() * instructors.length)],
      status: status,
      score: score,
      duration: Math.floor(Math.random() * 16) + 4, // 4-20 ຊົ່ວໂມງ
      category: categories[Math.floor(Math.random() * categories.length)],
    });
  }

  return history.sort((a, b) => {
    const dateA = new Date(a.date.split("/").reverse().join("-"));
    const dateB = new Date(b.date.split("/").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
  });
}

// Utility Functions
export function getParticipantById(id: string): ParticipantData | undefined {
  const participants = generateParticipants();
  return participants.find((p) => p.id === id);
}

export function getAllParticipants(): ParticipantData[] {
  return generateParticipants();
}
