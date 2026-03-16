// **
// @params: string UTC
// @return string: Jueves 25 de Julio de 2025, a las 8:25hs
// **
export const DateToParagraphAndHour = (dateString: string): string => {
  const date = new Date(dateString);

  // Configuramos el formateador en español
  const formatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  // Extraemos las partes para construir la frase exacta que pides
  const getValue = (type: string) => parts.find((p) => p.type === type)?.value;

  const weekday = getValue("weekday"); // "jueves"
  const day = getValue("day");
  const month = getValue("month");
  const year = getValue("year");
  const hour = getValue("hour");
  const minute = getValue("minute");

  // Capitalizamos el día de la semana y el mes (opcional, según tu gusto)
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return `${capitalize(weekday!)} ${day} de ${capitalize(month!)} del ${year}, a las ${hour}:${minute} hs`;
};

// **
// @params: string UTC
// @return string: Hoy | Ayer | Hace 7 Dias | 12-Abr
// **
export const DateToTextClose = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffTime = startOfToday.getTime() - startOfDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
};
