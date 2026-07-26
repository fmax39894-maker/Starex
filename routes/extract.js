import express from "express";

import { validateUrls } from "../utils/validator.js";
import { scrapeImages } from "../services/scraper.js";
import { downloadImages } from "../services/downloader.js";
import { jsonMode } from "../services/jsonMode.js";
import { directMode } from "../services/directMode.js";

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const input = req.query.url;
        const mode = (req.query.mode || "json").toLowerCase();

        if (!input) {

            return res.status(400).json({
                success: false,
                error: "Missing 'url' parameter"
            });

        }

        const urls = input
            .split(",")
            .map(url => url.trim())
            .filter(Boolean);

        const validUrls = validateUrls(urls);

        if (validUrls.length === 0) {

            return res.status(400).json({
                success: false,
                error: "No valid URLs found"
            });

        }

        const scrapeResults = await Promise.allSettled(

    validUrls.map(url => scrapeImages(url))

);

let allImages = [];

for (const result of scrapeResults) {

    if (result.status === "fulfilled") {

        allImages.push(...result.value);

    } else {

        console.log("Scrape failed:", result.reason?.message);

    }

}

        // Remove duplicates
        allImages = [...new Set(allImages)];

        if (allImages.length === 0) {

            return res.status(404).json({
                success: false,
                error: "No images found."
            });

        }

        // Download all images
        const downloadedImages = await downloadImages(allImages, req);

        if (mode === "direct") {

            return directMode(res, downloadedImages);

        }

        return jsonMode(res, downloadedImages);

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            error: err.message || "Internal Server Error"

        });

    }

});

export default router;