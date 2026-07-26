import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

import extractRoute from "./routes/extract.js";
import { cleanupImages } from "./services/cleanup.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required folders
const folders = [
    "public",
    "public/images",
    "temp",
    "temp/html",
    "temp/downloads",
    "cache"
];

async function createFolders() {

    for (const folder of folders) {

        await fs.ensureDir(path.join(__dirname, folder));

    }

}

await createFolders();

// Middlewares
app.use(cors());

app.use(express.json({
    limit: "50mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

// Static Files
app.use(
    "/images",
    express.static(path.join(__dirname, "public/images"))
);

// Routes
app.use("/extract", extractRoute);

// Home
app.get("/", (req, res) => {

    res.json({

        success: true,

        name: "Professional Image Extractor API",

        version: "1.0.0",

        developer: "Topper Fix",

        modes: [
            "json",
            "direct"
        ],

        endpoint: "/extract",

        example: {
            single:
                "/extract?url=https://example.com",

            multiple:
                "/extract?url=https://site1.com,https://site2.com",

            json:
                "/extract?url=https://example.com&mode=json",

            direct:
                "/extract?url=https://example.com&mode=direct"
        }

    });

});

// Health
app.get("/health", (req, res) => {

    res.json({

        success: true,

        status: "Running",

        uptime: process.uptime(),

        memory: process.memoryUsage(),

        node: process.version,

        platform: process.platform,

        currentTime: new Date()

    });

});

// Cleanup every 10 minutes
setInterval(async () => {

    console.log("Running cleanup...");

    await cleanupImages();

}, 10 * 60 * 1000);

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

// Start Server
app.listen(PORT, () => {

    console.log("==================================");
    console.log(" Professional Image Backend");
    console.log("==================================");
    console.log(`Running on Port : ${PORT}`);
    console.log(`Server : http://localhost:${PORT}`);
    console.log(`Health : /health`);
    console.log(`Extract : /extract`);
    console.log("==================================");

});