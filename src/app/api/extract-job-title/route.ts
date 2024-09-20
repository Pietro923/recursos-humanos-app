// app/api/extract-job-title/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio"; // Para analizar HTML

export async function GET(req: Request) {
  try {
    // Obtener los parámetros de la URL
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL no proporcionada" }, { status: 400 });
    }

    // Hacer una solicitud HTTP para obtener la página de LinkedIn
    const response = await axios.get(url);
    const html = response.data;

    // Usar cheerio para extraer el título del HTML
    const $ = cheerio.load(html);
    const jobTitle = $("title").text(); // Generalmente el título de la página está en la etiqueta <title>

    return NextResponse.json({ title: jobTitle });
  } catch (error) {
    console.error("Error al extraer el título:", error);
    return NextResponse.json({ error: "No se pudo extraer el título" }, { status: 500 });
  }
}