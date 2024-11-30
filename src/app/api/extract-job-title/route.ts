import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { rateLimit } from "@/lib/rate-limit";

// Configuración del límite de tasa
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  tokensPerInterval: 25, // 25 solicitudes por minuto
  uniqueTokenPerInterval: 500,
});

// Rotación de User Agents
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
];

// Función para obtener un User Agent aleatorio
const getRandomUserAgent = () =>
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Utilidad para limpiar texto
const cleanText = (text: string): string =>
  text.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim();

// Selectores para la extracción
const SELECTORS = {
  title: [
    "h1.job-title",
    "h1.top-card-layout__title",
    "h1.topcard__title",
    "h1.decorated-job-posting__title",
  ],
  company: [
    ".company-name",
    ".topcard__org-name-link",
    ".top-card-layout__company",
    ".decorated-job-posting__company-name",
  ],
  location: [
    ".topcard__flavor--bullet",
    ".top-card-layout__first-subline span:last-child",
    ".decorated-job-posting__metadata",
  ],
  description: [
    ".description__text",
    ".show-more-less-html__markup",
    ".decorated-job-posting__details",
  ],
  requirements: [".job-requirements", ".decorated-job-posting__skills"],
  jobType: [".job-type", ".decorated-job-posting__job-type"],
};

// Interfaz para los datos del trabajo
interface JobData {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string | null;
  jobType: string | null;
  url: string;
  extractedAt: string;
}

// Función para extraer texto con múltiples selectores
const extractText = ($: cheerio.CheerioAPI, selectors: string[]): string => {
  for (const selector of selectors) {
    const text = cleanText($(selector).text());
    if (text) return text;
  }
  return "";
};

// Cache en memoria con tipo genérico
class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private readonly TTL: number;

  constructor(ttlMinutes = 60) {
    this.TTL = ttlMinutes * 60 * 1000; // Convertir minutos a ms
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
}

const cache = new MemoryCache<JobData | null>(60); // Cache con tipo específico

// Función principal de scraping
async function scrapeLinkedIn(url: string): Promise<JobData> {
  const cachedData = cache.get(url);
  if (cachedData) return cachedData;

  const response = await axios.get(url, {
    headers: {
      "User-Agent": getRandomUserAgent(),
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    },
    timeout: 20000,
    maxRedirects: 5,
  });

  const html = response.data;
  const $ = cheerio.load(html);

  const jobData: JobData = {
    title: extractText($, SELECTORS.title),
    company: extractText($, SELECTORS.company),
    location: extractText($, SELECTORS.location),
    description: extractText($, SELECTORS.description),
    requirements: extractText($, SELECTORS.requirements) || null,
    jobType: extractText($, SELECTORS.jobType) || null,
    url,
    extractedAt: new Date().toISOString(),
  };

  cache.set(url, jobData);
  return jobData;
}

// Endpoint principal
export async function GET(req: Request) {
  try {
    await limiter.check(1, "LINKEDIN_SCRAPER_KEY");

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL no proporcionada" },
        { status: 400 }
      );
    }

    const linkedInJobRegex = /linkedin\.com\/(?:jobs\/view|job\/.*)/i;
    if (!linkedInJobRegex.test(url)) {
      return NextResponse.json(
        { error: "La URL debe ser de una oferta de trabajo de LinkedIn válida" },
        { status: 400 }
      );
    }

    const jobData = await scrapeLinkedIn(url);
    return NextResponse.json(jobData);
  } catch (error: unknown) {
    console.error("Error al extraer datos de LinkedIn:", error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { error: "La solicitud tardó demasiado tiempo" },
          { status: 408 }
        );
      }
      if (error.response?.status === 403) {
        return NextResponse.json(
          { error: "Acceso denegado por LinkedIn" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Error al acceder a la página de LinkedIn" },
        { status: error.response?.status || 500 }
      );
    } else if (error instanceof Error) {
      return NextResponse.json(
        { error: "Error al procesar la solicitud", details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "Error desconocido al procesar la solicitud" },
        { status: 500 }
      );
    }
  }
}
