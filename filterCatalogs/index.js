
const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.COSMOS_CONN_STRING);
const container = () => client
  .database(process.env.COSMOS_DB)
  .container(process.env.COSMOS_CONTAINER);

module.exports = async function (context, req) {
  try {
    const genre = (req.query && req.query.genre) || null;
    const title = (req.query && req.query.title) || null;

    let query = "SELECT * FROM c";
    const params = [];

    if (genre || title) {
      query += " WHERE";
      if (genre) {
        query += " c.genre = @g";
        params.push({ name: "@g", value: genre });
      }
      if (title) {
        query += params.length ? " AND" : "";
        query += " CONTAINS(LOWER(c.title), LOWER(@t))";
        params.push({ name: "@t", value: title });
      }
    }
    query += " ORDER BY c.title";

    const { resources } = await container().items.query({ query, parameters: params }).fetchAll();
    context.res = { status: 200, body: JSON.stringify(resources) };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: "Erro ao filtrar" };
  }
};
