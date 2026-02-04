import { useState } from "react";
import { useCache } from "src/hooks/cache/useCache";
import Constants from "expo-constants";
import { CoreApiService } from "@/services/core/ApiService";

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;
const core = new CoreApiService();
export type FAQreturn = {
  id: string;
  question: string;
  answer: string;
  list?: string[];
  messageBeland?: string;
  subAnswer?: {
    icon: string;
    title: string;
    message: string;
    list: string[];
    messageBeland?: string;
  }[];
};
export const useFAQs = () => {
  const FAQFetch = async () => {
    // const response = await core.get(`/faqs`);
    // return response.data;
    // hardcode
    const hardCodeFAQ: FAQreturn[] = [
      {
        id: "1",
        question: "¿Qué es Beland y por qué usarla?",
        answer:
          "Beland es una plataforma de economía circular que integra tecnología, logística y rituales comunitarios para transformar el consumo cotidiano en impacto social, ambiental y económico real. \n A través de su app, el delivery circular y experiencias comunitarias recurrentes, Beland facilita el reciclaje, incentiva hábitos sostenibles y fortalece el vínculo entre personas, comunidades y recicladores de base.",
      },
      {
        id: "2",
        question: "¿Qué puedo hacer desde la app?",
        answer: "Desde la app podés:",
        list: [
          "Realizar transacciones con tus Becoins",
          "comprar productos de consumo diario",
          "coordinar el retiro de reciclables",
          "participar de rituales y actividades comunitarias",
          "organizar juntadas privadas o publicas",
          "ganar cashback y ver tu impacto",
          "encontrar los puntos activos de reciclaje",
        ],
      },
      {
        id: "3",
        question: "¿Cómo funciona el delivery circular? ",
        answer: "En una misma visita:",
        list: ["te entregamos tu pedido", "retiramos tus reciclables"],
        messageBeland: "Menos viajes, menos basura y más impacto positivo.",
      },
      {
        id: "4",
        question: "¿Qué tipo de residuos puedo entregar?",
        answer:
          "Residuos orgánicos: Restos de frutas y verduras, cáscaras, servilletas usadas y restos de jardín. \n Residuos reciclables inorgánicos: plástico, cartón, papel, latas y vidrio.Importante: limpios y secos, separados de los orgánicos.",
      },
      {
        id: "5",
        question: "¿Qué pasa con los residuos que entrego?",
        answer:
          "Son donados directamente a recicladores de base y cooperativas locales, que viven de esta actividad. Tu reciclaje genera ingresos reales y evita que los residuos terminen en rellenos sanitarios.",
      },
      {
        id: "6",
        question: "¿Cómo gano cashback usando la app? ",
        answer: "Cuando comprás y reciclás correctamente:",
        list: ["un %2 vuelve a vos", "un %2 vuelve a tu comunidad"],
        messageBeland: "Reciclás bien = ganás vos y gana tu barrio.",
      },
      {
        id: "7",
        question: "¿Dónde veo mis beneficios y mi impacto?",
        answer: "En tu perfil de la app podés ver:",
        list: [
          "tu cashback acumulado",
          "tu historial de pedidos",
          "el impacto ambiental y comunitario que generaste",
        ],
      },
      {
        id: "8",
        question: "¿Puedo usar la app si no tengo reciclables?",
        answer:
          "Sí. Podés comprar normalmente,pero no recibirías cashback \n El reciclaje suma beneficios, pero no es obligatorio para usar Beland",
      },
      {
        id: "9",
        question: "¿Cada cuánto hay entregas y retiros?",
        answer:
          "La app te muestra los días y horarios disponibles según tu zona, con frecuencias semanales ya establecidas.",
      },
      {
        id: "10",
        question: "¿Qué pasa si mis residuos no están bien separados?",
        answer:
          "Si no están limpios o correctamente clasificados, no se valida el reciclaje y no se genera cashback en esa entrega. Separar bien hace toda la diferencia.",
      },
      {
        id: "11",
        question: "¿La app me avisa cuándo pasa Beland? ",
        answer:
          "Sí. Recibís notificaciones con recordatorios de entregas, retiros y actividades comunitarias para que no te olvides.",
      },
      {
        id: "12",
        question: "¿Beland tiene costo para mí o para la comunidad?",
        answer:
          "No. El servicio se sostiene con el consumo dentro de la app. Cuanto más se usa Beland, más beneficios vuelven a los usuarios y a la comunidad.",
      },
      {
        id: "13",
        question: "¿Puedo ver el impacto que genero usando la app?",
        answer:
          "Sí. La app muestra métricas de impacto como residuos recuperados, beneficios económicos generados y aporte a recicladores y a tu comunidad.",
      },
      {
        id: "14",
        question: ".¿Qué son los rituales comunitarios de Beland?",
        answer:
          "Son experiencias recurrentes creadas por Beland para generar hábitos sostenibles, fortalecer el vínculo entre vecinos y hacer del reciclaje y el consumo consciente algo simple y disfrutable. \n A través de encuentros y dinámicas como TGIM o TGIF, Beland transforma acciones cotidianas en momentos de conexión comunitaria.",
      },
      {
        id: "15",
        question:
          ".¿Qué son las Becoins y cómo funciona el sistema de incentivos?",
        answer:
          "Las Becoins son las monedas de Beland. Existen para premiar las acciones que generan valor y facilitar el consumo dentro de la comunidad. Hay tres tipos, cada una con un rol claro:",
        subAnswer: [
          {
            icon: "",
            title: "Becoins Verdes",
            message: "Son la recompensa por hacer lo correcto.",
            list: [
              "Cómo se ganan: reciclando correctamente con Beland y aportando impacto positivo.",
              "Para qué sirven: funcionan como dinero dentro de la app. Podés usarlas para comprar productos, servicios o convertirlas en dinero real según las reglas de la plataforma.",
            ],
            messageBeland:
              "Mensaje Beland: si aportás valor, el sistema te paga.",
          },
          {
            icon: "",
            title: "Becoins Naranjas",
            message:
              "Son créditos de incentivo para el consumo dentro de la app.",
            list: [
              "Cómo se ganan: por acciones como cargar saldo, comprar en comunidad u otras contribuciones a los objetivos de la comunidad.",
              "Para qué sirven: se usan exclusivamente dentro de Beland para comprar productos o servicios. No se retiran como dinero.",
            ],
          },
          {
            icon: "",
            title: "Becoins Doradas",
            message: "Son dinero digital dentro del ecosistema Beland.",
            list: [
              "Cómo se ganan: se compran con dinero real.",
              "Para qué sirven: funcionan como dinero completo dentro de la app: compras, pagos a terceros y, en el futuro, transacciones interbancarias e internacionales sin comisiones.",
            ],
          },
        ],
      },
      {
        id: "16",
        question: "¿Qué es una Comunidad Beland?",
        answer:
          "Una Comunidad Beland es cualquier grupo de personas que decide consumir, reciclar y generar impacto en conjunto. Puede ser un grupo de amigos, una familia, un edificio, un barrio o una institución. La app organiza a la comunidad para acceder a mejores precios, incentivos compartidos y una experiencia más simple y colaborativa.",
      },
      {
        id: "17",
        question:
          "¿Cómo funcionan las compras en grupo y los pagos compartidos?",
        answer:
          "Beland permite comprar en grupo y resolver el pago de forma simple o Podés dividir el pago entre los integrantes del grupo y confirmar todo en pocos pasos, sin transferencias ni complicaciones.",
      },
    ];
    return hardCodeFAQ;
  };
  const { data, loading: isLoading } = useCache({
    key: "faqs-cache",
    duration: 6 * 60 * 60 * 1000,
    fetcher: () => FAQFetch(),
  });
  return { data, isLoading };
};
