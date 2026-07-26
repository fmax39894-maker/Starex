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
                error: "Missing url parameter"

            });

        }

        // Split comma separated URLs
        const urls = input
            .split(",")
            .map(url => url.trim())
            .filter(Boolean);

        // Validate
        const validUrls = validateUrls(urls);

        if (validUrls.length === 0) {

            return res.status(400).json({

                success: false,
                error: "No valid URLs"

            });

        }

        console.log(`Processing ${validUrls.length} website(s)...`);

        // Scrape all sites in parallel
        const scrapeResults = await Promise.allSettled(

            validUrls.map(url => scrapeImages(url))

        );

        let allImages = [];

        for (const result of scrapeResults) {

            if (result.status === "fulfilled") {

                allImages.push(...result.value);

            } else {

                console.log("Scrape Error:", result.reason);

            }

        }

        // Remove duplicates
        allImages = [...new Set(allImages)];

        // Keep only image URLs
        allImages = allImages.filter(url =>

            /\.(jpg|jpeg|png|gif|bmp|webp|svg|avif)(\?|#|$)/i.test(url)

        );

        if (allImages.length === 0) {

            return res.status(404).json({

                success: false,
                error: "No images found"

            });

        }

        console.log(`Found ${allImages.length} image(s)`);

        // Download images
        const downloadedImages = await downloadImages(allImages, req);

        if (downloadedImages.length === 0) {

            return res.status(500).json({

                success: false,
                error: "Unable to download images"

            });

        }

        // JSON Mode
        if (mode === "json") {

            return jsonMode(res, downloadedImages);

        }

        // Direct Mode
        if (mode === "direct") {

            return directMode(res, downloadedImages);

        }

        // Invalid mode
        return res.status(400).json({

            success: false,
            error: "Mode must be 'json' or 'direct'"

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            error: err.message || "Internal Server Error"

        });

    }

});

export default router;