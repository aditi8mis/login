const express = require("express");
const cors = require("cors");
require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", require("./routes/auth"));
app.use("/", require("./routes/mood"));
app.use("/", require("./routes/feedback"));


const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
