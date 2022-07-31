const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const { authMiddleware } = require("./utils/auth");

async function startApolloServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    // csrfPrevention: true,
    // cache: "bounded",
    // plugins: [
    //   ApolloServerPluginDrainHttpServer({ httpServer }),
    //   ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    // ],
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 3001;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); 

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/public")));
  }

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/public/index.html"));
  });

  db.once("open", () => {
    app.listen(PORT, () =>
      console.log(`🌍 Now listening on localhost:${PORT}`)
    );
    console.log(
      `GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}
startApolloServer()
  .then((val) => console.log(val))
  .catch((err) => console.log(err));
