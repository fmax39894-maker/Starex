import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

import extractRoute from "./routes/extract.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create required folders
const folders = [
    "public",
    "public/images",
    "temp",
    "temp/html",
    "temp/downloads",
    "cache"
];

for (const folder of folders) {
    await fs.ensureDir(path.join(__dirname, folder));
}

// Middlewares
app.use(cors());

app.use(express.json({
    limit: "50mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

// Static images
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routes
app.use("/extract", extractRoute);

// Home
app.get("/", (req, res) => {

    res.json({

        success: true,

        name: "Professional Image Extractor API",

        version: "1.0.0",

        modes: [
            "json",
            "direct"
        ],

        endpoint: "/extract"

    });

});

// Health Check
app.get("/health", (req, res) => {

    res.json({

        success: true,

        status: "Running",

        uptime: process.uptime(),

        memory: process.memoryUsage(),

        time: new Date()

    });

});

// 404
app.use((req, res) => {

    res.status(404).json({

        success: false,

        error: "Endpoint not found"

    });

});

// Error Handler
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        error: err.message || "Internal Server Error"

    });

});

app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log(" Image Extractor Backend Started ");
    console.log("=================================");
    console.log(`Port : ${PORT}`);
    console.log(`Mode : Production`);
    console.log("");

});