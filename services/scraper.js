import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeImages(pageUrl) {

    const response = await axios.get(pageUrl, {
        timeout: 30000,
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36"
        }
    });

    const $ = cheerio.load(response.data);

    const images = new Set();

    function addImage(src) {

        if (!src) return;

        try {

            src = new URL(src, pageUrl).href;

            if (
                src.startsWith("http") &&
                !src.startsWith("data:")
            ) {

                images.add(src);

            }

        } catch {}

    }

    // img src
    $("img").each((i, el) => {

        addImage($(el).attr("src"));

    });

    // srcset
    $("img").each((i, el) => {

        const srcset = $(el).attr("srcset");

        if (!srcset) return;

        srcset.split(",").forEach(item => {

            addImage(item.trim().split(" ")[0]);

        });

    });

    // lazy loading
    [
        "data-src",
        "data-original",
        "data-lazy",
        "data-lazy-src",
        "data-image",
        "data-thumb",
        "data-url"
    ].forEach(attr => {

        $(`[${attr}]`).each((i, el) => {

            addImage($(el).attr(attr));

        });

    });

    // Open Graph
    addImage($('meta[property="og:image"]').attr("content"));

    // Twitter Card
    addImage($('meta[name="twitter:image"]').attr("content"));

    // Link rel=image_src
    addImage($('link[rel="image_src"]').attr("href"));

    // CSS background images
    $("[style]").each((i, el) => {

        const style = $(el).attr("style");

        const match = style?.match(/url\((.*?)\)/);

        if (match) {

            addImage(match[1].replace(/['"]/g, ""));

        }

    });

    return [...images];

}