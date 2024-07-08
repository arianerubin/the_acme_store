const {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require("./db");
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res
      .status(201)
      .send(await createFavorite(req.params.id, req.body.product_id));
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:id/favorites/:favoriteId", async (req, res, next) => {
  try {
    await destroyFavorite(req.params.favoriteId, req.params.id);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [moe, lucy, larry, ethyl, dancing, singing, plateSpinning, juggling] =
    await Promise.all([
      createUser({ username: "moe", password: "moe_pw" }),
      createUser({ username: "lucy", password: "lucy_pw" }),
      createUser({ username: "larry", password: "larry_pw" }),
      createUser({ username: "ethyl", password: "ethyl_pw" }),
      createProduct({ name: "dancing" }),
      createProduct({ name: "singing" }),
      createProduct({ name: "plate spinning" }),
      createProduct({ name: "juggling" }),
    ]);

  console.log(await fetchUsers());
  console.log(await fetchProducts());

  const userFavorite = await Promise.all([
    createFavorite(moe.id, plateSpinning.id),
    createFavorite(moe.id, dancing.id),
    createFavorite(ethyl.id, singing.id),
    createFavorite(ethyl.id, juggling.id),
  ]);
  console.log(await fetchFavorites(moe.id));
  await destroyFavorite(userFavorite[0].id, moe.id);

  console.log(await fetchFavorites(moe.id));

  console.log(`curl localhost:3000/api/users/${ethyl.id}/createFavorite`);

  console.log(
    `curl -X POST localhost:3000/api/users/${ethyl.id}/createFavorite -d '{"skill_id": "${dancing.id}"}' -H 'Content-Type:application/json'`
  );
  console.log(
    `curl -X DELETE localhost:3000/api/users/${ethyl.id}/createFavorite/${userFavorite[3].id}`
  );

  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
