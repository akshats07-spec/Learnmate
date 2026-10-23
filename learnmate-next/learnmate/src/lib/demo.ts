import type { Question, RevisionTask } from "./types";

export const sampleText = `CELL BIOLOGY — SAMPLE CHAPTER
Page 1: Cells are the basic structural and functional units of life. The cell membrane regulates movement of substances into and out of the cell. The cytoplasm is the fluid-like region where many cellular reactions occur.
Page 2: The nucleus stores most of the cell's genetic material (DNA) and helps control cell activities. Mitochondria release usable energy through cellular respiration and are often called the powerhouse of the cell.
Page 3: Ribosomes build proteins. The endoplasmic reticulum helps make and transport proteins and lipids. The Golgi apparatus modifies, sorts, and packages proteins for delivery.
Page 4: Plant cells typically have a cellulose cell wall, chloroplasts for photosynthesis, and a large central vacuole. Animal cells do not have a cellulose cell wall or chloroplasts.
Page 5: Photosynthesis converts light energy into chemical energy stored in glucose. Cellular respiration breaks down glucose to release energy that cells can use. These processes are related but are not the same process.`;

export const demoQuestions: Question[] = [
  {id:"q1",topic:"Cell structures",prompt:"Which structure regulates what enters and leaves a cell?",options:["Nucleus","Cell membrane","Ribosome","Golgi apparatus"],correctIndex:1,explanation:"The cell membrane regulates the movement of substances into and out of the cell.",page:1},
  {id:"q2",topic:"Cell structures",prompt:"What is the main role of ribosomes?",options:["Store DNA","Release energy","Build proteins","Perform photosynthesis"],correctIndex:2,explanation:"Ribosomes are the structures that build proteins.",page:3},
  {id:"q3",topic:"Organelles",prompt:"Which organelle releases usable energy through cellular respiration?",options:["Mitochondrion","Chloroplast","Vacuole","Cell wall"],correctIndex:0,explanation:"Mitochondria release usable energy through cellular respiration.",page:2},
  {id:"q4",topic:"Plant vs animal cells",prompt:"Which structure is typically present in plant cells but not animal cells?",options:["Cell membrane","Cytoplasm","Chloroplast","Ribosome"],correctIndex:2,explanation:"Plant cells typically contain chloroplasts for photosynthesis; animal cells do not.",page:4},
  {id:"q5",topic:"Energy processes",prompt:"What does photosynthesis do?",options:["Breaks down glucose to release energy","Converts light energy into chemical energy stored in glucose","Packages proteins","Stores most cellular DNA"],correctIndex:1,explanation:"Photosynthesis converts light energy into chemical energy stored in glucose.",page:5}
];

export function buildTasks(weakTopics: string[]): RevisionTask[] {
  const topics = weakTopics.length ? weakTopics : ["Cell structures", "Energy processes"];
  return topics.slice(0,3).flatMap((topic, i) => [
    {id:`review-${i}`, title:`Review: ${topic}`, topic, detail:"Read the linked source passage, then explain the idea in your own words.", minutes:5, done:false},
    {id:`practice-${i}`, title:`Practice: ${topic}`, topic, detail:"Answer two targeted questions without looking at your notes.", minutes:4, done:false}
  ]);
}
