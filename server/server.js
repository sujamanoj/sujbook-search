const express = require("express");
const path = require("path");
const db = require("./config/connection");
// import ApolloServer
const { ApolloServer } = require("apollo-server-express");
// import our typeDefs and resolvers
const { typeDefs, resolvers } = require("./schemas");

const { authMiddleware } = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});



app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client"));
});


function startserver(){
  await server.start()
  // integrate apollo server with express app as middleware
server.applyMiddleware({ app });

db.once("open", () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  // log where we can go to test our GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
});
}
startserver()
