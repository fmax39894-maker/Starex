import express from "express";

import { validateUrls } from "../utils/validator.js";
import { scrapeImages } from "../services/scraper.js";
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
            .map(u => u.trim())
            .filter(Boolean);

        const validUrls = validateUrls(urls);

        if (validUrls.length === 0) {

            return res.status(400).json({

                success: false,
                error: "No valid URLs found"

            });

        }

        let allImages = [];

        for (const website of validUrls) {

            try {

                const images = await scrapeImages(website);

                allImages.push(...images);

            } catch (e) {

                console.log("Skipped:", website);

            }

        }

        allImages = [...new Set(allImages)];

        if (mode === "direct") {

            return directMode(res, allImages);

        }

        return jsonMode(res, allImages);

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            error: err.message

        });

    }

});

export default router;