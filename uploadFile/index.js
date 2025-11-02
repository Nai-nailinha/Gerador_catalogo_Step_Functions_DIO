
const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    const conn = process.env.STORAGE_CONN_STRING;
    const containerName = process.env.STORAGE_CONTAINER || "uploads";

    if (!req.body || !req.body.fileBase64 || !req.body.filename) {
      context.res = { status: 400, body: "Envie { filename, fileBase64 }" };
      return;
    }

    const { filename, fileBase64 } = req.body;
    const buffer = Buffer.from(fileBase64, "base64");

    const blobService = BlobServiceClient.fromConnectionString(conn);
    const container = blobService.getContainerClient(containerName);
    await container.createIfNotExists();

    const blockBlob = container.getBlockBlobClient(filename);
    await blockBlob.uploadData(buffer);

    context.res = { status: 201, body: JSON.stringify({ ok: true, url: blockBlob.url }) };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: "Erro no upload" };
  }
};
