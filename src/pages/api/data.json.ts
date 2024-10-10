import type { APIRoute } from "astro";
import { Octokit } from "@octokit/rest";

export const GET: APIRoute = async (context) => {
  // Verificar si el token está cargado
  if (!import.meta.env.GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: "GITHUB_TOKEN no definido" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Inicializar Octokit con el token de acceso
  const octokit = new Octokit({
    auth: import.meta.env.GITHUB_TOKEN,
  });

  try {
    // Obtener repositorios de usuario
    const reposUsuario = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
      visibility: 'all',
      affiliation: 'owner,collaborator,organization_member',
      per_page: 100,
    });

    // Preparar la respuesta
    const respuesta = reposUsuario.map(repo => ({
      nombre: repo.name,
      url_repo: repo.html_url,
      description: repo.description || 'Sin descripción',
      visibility: repo.visibility === 'private' ? 'Privado' : 'Público',
      url_web: repo.homepage || 'No especificado',
      lenguaje: repo.language || 'No especificado',
      org: repo.owner?.login === 'havas-media' ? 'Ninguna' : repo.owner?.login,
      created_at: new Date(repo.created_at).toLocaleString('es-PE', { day: 'numeric', month: '2-digit', year: 'numeric' }),
      updated_at: new Date(repo.pushed_at).toLocaleString('es-PE', { day: 'numeric', month: '2-digit', year: 'numeric' }),
    }));

    return new Response(JSON.stringify(respuesta), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error al obtener los repositorios:", error);
    return new Response(JSON.stringify({ error: "Error al obtener los repositorios" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};