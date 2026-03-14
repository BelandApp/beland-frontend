export const formatTransactionDate = (dateString: string): string => {
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

  return `${capitalize(weekday!)} ${day} de ${capitalize(month!)} del ${year} a las ${hour}:${minute} hs`;
};
