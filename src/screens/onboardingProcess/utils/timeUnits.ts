import { TimeSlot } from "../types/onboarding.types";

export const DAYS = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

export const SCHEDULE: { label: string; hours: string; timeSlot: TimeSlot }[] =
  [
    { label: "Por la mañana", hours: "6:00 - 11:000 am", timeSlot: "morning" },
    { label: "Por la noche", hours: "5:00 - 11:00 pm", timeSlot: "night" },
  ];
