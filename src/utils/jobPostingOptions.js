export const professionalTypeOptions = [
  { value: 0, label: "Profesor" },
  { value: 1, label: "Instructor" },
  { value: 2, label: "Preparador físico" },
  { value: 3, label: "Director técnico" },
  { value: 4, label: "Guardavidas" },
  { value: 5, label: "Video analista" },
  { value: 6, label: "Otro" },
];

export const disciplineOptions = [
  { value: 0, label: "Aikido" },
  { value: 1, label: "Ajedrez" },
  { value: 2, label: "Aquagym" },
  { value: 3, label: "Artes marciales mixtas" },
  { value: 4, label: "Atletismo" },
  { value: 5, label: "Bádminton" },
  { value: 6, label: "Básquetbol" },
  { value: 7, label: "Beach volley" },
  { value: 8, label: "Béisbol" },
  { value: 9, label: "Bochas" },
  { value: 10, label: "Boxeo" },
  { value: 11, label: "BMX" },
  { value: 12, label: "Calistenia" },
  { value: 13, label: "Cheerleading" },
  { value: 14, label: "Ciclismo" },
  { value: 15, label: "Crossfit" },
  { value: 16, label: "Danza" },
  { value: 17, label: "Equitación" },
  { value: 18, label: "Esgrima" },
  { value: 19, label: "Fisicoculturismo" },
  { value: 20, label: "Frontón" },
  { value: 21, label: "Fútbol" },
  { value: 22, label: "Fútbol playa" },
  { value: 23, label: "Fútbol sala" },
  { value: 24, label: "Gimnasia acrobática" },
  { value: 25, label: "Gimnasia artística" },
  { value: 26, label: "Gimnasia rítmica" },
  { value: 27, label: "Golf" },
  { value: 28, label: "Handball" },
  { value: 29, label: "Hockey sobre césped" },
  { value: 30, label: "Hockey sobre patines" },
  { value: 31, label: "Jiu jitsu" },
  { value: 32, label: "Judo" },
  { value: 33, label: "Karate" },
  { value: 34, label: "Kayak" },
  { value: 35, label: "Kickboxing" },
  { value: 36, label: "Kitesurf" },
  { value: 37, label: "Kung fu" },
  { value: 38, label: "Muay thai" },
  { value: 39, label: "Musculación" },
  { value: 40, label: "Natación" },
  { value: 41, label: "Natación artística" },
  { value: 42, label: "Pádel" },
  { value: 43, label: "Patín artístico" },
  { value: 44, label: "Patín carrera" },
  { value: 45, label: "Patinaje sobre hielo" },
  { value: 46, label: "Pelota paleta" },
  { value: 47, label: "Pilates" },
  { value: 48, label: "Polo" },
  { value: 49, label: "Powerlifting" },
  { value: 50, label: "Remo" },
  { value: 51, label: "Rugby" },
  { value: 52, label: "Running" },
  { value: 53, label: "Skateboarding" },
  { value: 54, label: "Softbol" },
  { value: 55, label: "Spinning" },
  { value: 56, label: "Squash" },
  { value: 57, label: "Stretching" },
  { value: 58, label: "Surf" },
  { value: 59, label: "Taekwondo" },
  { value: 60, label: "Tenis" },
  { value: 61, label: "Tenis de mesa" },
  { value: 62, label: "Tiro con arco" },
  { value: 63, label: "Tiro deportivo" },
  { value: 64, label: "Triatlón" },
  { value: 65, label: "Ultimate frisbee" },
  { value: 66, label: "Vela" },
  { value: 67, label: "Voleibol" },
  { value: 68, label: "Waterpolo" },
  { value: 69, label: "Windsurf" },
  { value: 70, label: "Yoga" },
  { value: 71, label: "Zumba" },
  { value: 72, label: "Otro" },
];

export const urgentFilterOptions = [
  { value: "", label: "Todas" },
  { value: "true", label: "Solo urgentes" },
  { value: "false", label: "No urgentes" },
];

export function getEnumLabel(options, value) {
  if (value === null || value === undefined || value === "") {
    return "No especificado";
  }

  return (
    options.find((option) => Number(option.value) === Number(value))?.label ||
    "No especificado"
  );
}

export function getJobValue(job, camelCaseName, pascalCaseName) {
  return job?.[camelCaseName] ?? job?.[pascalCaseName];
}

export function isJobUrgent(job) {
  return Boolean(getJobValue(job, "isUrgent", "IsUrgent"));
}

export function sortUrgentJobsFirst(jobs) {
  return [...jobs].sort(
    (a, b) => Number(isJobUrgent(b)) - Number(isJobUrgent(a)),
  );
}
