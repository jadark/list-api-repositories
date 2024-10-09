// Importar las configuraciones de dotenv
import 'dotenv/config';
// Importar express
import express from 'express';
// Importar Octokit desde @octokit/rest
import { Octokit } from "@octokit/rest";
import serverless from 'serverless-http';

// Verificar si el token está cargado
if (!process.env.GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN no está definido en las variables de entorno.");
  process.exit(1);
} else {
  console.log("Token de GitHub cargado correctamente.");
}
// Inicializa Octokit con el token de acceso
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const app = express();

// Función para obtener repositorios de usuario
async function obtenerRepositoriosUsuario() {
  try {
    const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
      visibility: 'all',
      affiliation: 'owner,collaborator,organization_member',
      per_page: 100
    });
    return repos;
  } catch (error) {
    console.error("Error al obtener los repositorios del usuario:", error);
    throw error;
  }
}

// Función para obtener repositorios de una organización
async function obtenerRepositoriosOrganizacion(org) {
  try {
    const repos = await octokit.paginate(octokit.repos.listForOrg, {
      org: org,
      type: 'all',
      order: 'updated_at',
      per_page: 100
    });
    return repos;
  } catch (error) {
    console.error(`Error al obtener los repositorios de la organización ${org}:`, error);
    throw error;
  }
}

// Ruta principal que responde con JSON
app.get('/', async (req, res) => {
  try {
    // Obtener repositorios de usuario y de la organización simultáneamente
    const [reposUsuario, reposOrg] = await Promise.all([
      obtenerRepositoriosUsuario(),
      // obtenerRepositoriosOrganizacion('HV-DEV-HTML')
    ]);

    const respuesta = reposUsuario.map(repo => ({
      name: repo.name,
      url: repo.html_url,
      descripcion: repo.description,
      private: repo.private,
      language: repo.language,
      created_at: repo.created_at,
      updated_at: repo.pushed_at,
      organization: repo.owner.login === "HV-DEV-HTML" ? repo.owner.login : "",
      data: repo
    }));

    // Enviar la respuesta como JSON
    res.json(respuesta);

  } catch (error) {
    console.error("Error en la ruta principal:", error);
    res.status(500).json({ mensaje: "Ocurrió un error al obtener los repositorios." });
  }
});

export const handler = serverless(app);