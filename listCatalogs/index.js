
const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.COSMOS_CONN_STRING);
const container = () => client
  .database(process.env.COSMOS_DB)
  .container(process.env.COSMOS_CONTAINER);

module.exports = async function (context, req) {
  try {
    const query = "SELECT * FROM c ORDER BY c.title";
    const { resources } = await container().items.query(query).fetchAll();
    context.res = { status: 200, body: JSON.stringify(resources) };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: "Erro ao listar" };
  }
};
