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

    // img src
    $("img").each((i, el) => {

        const src = $(el).attr("src");

        if (src) {

            try {
                images.add(new URL(src, pageUrl).href);
            } catch {}

        }

    });

    // data-src
    $("[data-src]").each((i, el) => {

        const src = $(el).attr("data-src");

        if (src) {

            try {
                images.add(new URL(src, pageUrl).href);
            } catch {}

        }

    });

    // data-original
    $("[data-original]").each((i, el) => {

        const src = $(el).attr("data-original");

        if (src) {

            try {
                images.add(new URL(src, pageUrl).href);
            } catch {}

        }

    });

    // Open Graph image
    const og = $('meta[property="og:image"]').attr("content");

    if (og) {

        try {
            images.add(new URL(og, pageUrl).href);
        } catch {}

    }

    return [...images];

}