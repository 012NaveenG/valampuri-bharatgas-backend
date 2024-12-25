import { app } from "./app.js";
const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello World!");
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
