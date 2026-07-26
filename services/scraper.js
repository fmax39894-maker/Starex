import axios from "axios";
import * as cheerio from "cheerio";

const USER_AGENT =
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0 Safari/537.36";

export async function scrapeImages(pageUrl) {

    const response = await axios.get(pageUrl, {

        timeout: 30000,

        maxRedirects: 5,

        headers: {
            "User-Agent": USER_AGENT
        }

    });

    const $ = cheerio.load(response.data);

    const images = new Set();

    function add(src) {

        if (!src) return;

        src = src.trim();

        if (src.startsWith("data:"))
            return;

        try {

            const absolute = new URL(src, pageUrl).href;

            images.add(absolute);

        }

        catch {}

    }

    // img src
    $("img").each((i, el) => {

        add($(el).attr("src"));

    });

    // srcset
    $("img").each((i, el) => {

        const srcset = $(el).attr("srcset");

        if (!srcset) return;

        srcset.split(",")

            .forEach(item => {

                add(item.trim().split(" ")[0]);

            });

    });

    // Lazy loading attributes
    const attrs = [

        "data-src",
        "data-original",
        "data-lazy",
        "data-lazy-src",
        "data-image",
        "data-thumb",
        "data-url"

    ];

    attrs.forEach(attr => {

        $(`[${attr}]`).each((i, el) => {

            add($(el).attr(attr));

        });

    });

    // Open Graph
    add($('meta[property="og:image"]').attr("content"));

    // Twitter Card
    add($('meta[name="twitter:image"]').attr("content"));

    // Image Source
    add($('link[rel="image_src"]').attr("href"));

    // CSS background images
    $("[style]").each((i, el) => {

        const style = $(el).attr("style");

        if (!style) return;

        const match = style.match(/url\((.*?)\)/);

        if (match) {

            add(match[1].replace(/['"]/g, ""));

        }

    });

    // Picture source
    $("source").each((i, el) => {

        add($(el).attr("srcset"));

    });

    // Meta itemprop image
    add($('meta[itemprop="image"]').attr("content"));

    // Link preload image
    $('link[as="image"]').each((i, el) => {

        add($(el).attr("href"));

    });

    return [...images];

}