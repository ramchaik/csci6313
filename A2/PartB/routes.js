const { createAsset, updateAsset, readAsset, deleteAsset } = require("./model");

function registerRoutes(app, opts, done) {
  app.get("/asset/:id", async (request, reply) => {
    const id = request.params.id;
    try {
      const result = await readAsset(id);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  app.post("/asset", async (request, reply) => {
    const { id, value } = request.body;
    try {
      const result = await createAsset(id, value);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  app.put("/asset/:id", async (request, reply) => {
    const id = request.params.id;
    const { value } = request.body;
    try {
      const result = await updateAsset(id, value);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  app.delete("/asset/:id", async (request, reply) => {
    const id = request.params.id;
    try {
      const result = await deleteAsset(id);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  done();
}

module.exports = registerRoutes;
