const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes")
const userRoutes = require("./routes/userRoutes")


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/files", fileRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});
