
const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.COSMOS_CONN_STRING);
const container = () => client
  .database(process.env.COSMOS_DB)
  .container(process.env.COSMOS_CONTAINER);

module.exports = async function (context, req) {
  try {
    const body = req.body || {};
    // Exemplo mínimo de schema
    // { id, title, genre, year, rating, coverUrl }
    if (!body.id || !body.title || !body.genre) {
      context.res = { status: 400, body: "Campos obrigatórios: id, title, genre" };
      return;
    }

    const { resource } = await container().items.create(body);
    context.res = { status: 201, body: JSON.stringify(resource) };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: "Erro ao salvar catálogo" };
  }
};
