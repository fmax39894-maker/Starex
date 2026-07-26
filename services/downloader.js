import axios from "axios";
import fs from "fs-extra";
import path from "path";
import mime from "mime-types";
import { v4 as uuid } from "uuid";

const IMAGE_DIR = "public/images";
const MAX_PARALLEL = 15;
const TIMEOUT = Number(process.env.DOWNLOAD_TIMEOUT) || 30000;

async function downloadSingle(url, req) {

    let response;

    // Retry up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {

        try {

            response = await axios({
                url,
                method: "GET",
                responseType: "arraybuffer",
                timeout: TIMEOUT,
                maxRedirects: 5,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
                    "Accept":
                        "image/*,*/*;q=0.8"
                }
            });

            break;

        } catch (err) {

            console.log(`Retry ${attempt}: ${url}`);

            if (attempt === 3) {

                console.log("Failed:", url);

                return null;

            }

        }

    }

    let ext =
        mime.extension(response.headers["content-type"]) ||
        path.extname(new URL(url).pathname).replace(".", "") ||
        "jpg";

    if (!ext) ext = "jpg";
    if (ext === "jpeg") ext = "jpg";

    const filename = `${uuid()}.${ext}`;
    const filepath = path.join(IMAGE_DIR, filename);

    await fs.writeFile(filepath, response.data);

    console.log("Downloaded:", filename);

    return {
        original: url,
        file: filename,
        url: `${req.protocol}://${req.get("host")}/images/${filename}`,
        size: response.data.length
    };

}

export async function downloadImages(imageUrls, req) {

    await fs.ensureDir(IMAGE_DIR);

    const results = [];

    for (let i = 0; i < imageUrls.length; i += MAX_PARALLEL) {

        const batch = imageUrls.slice(i, i + MAX_PARALLEL);

        const downloaded = await Promise.all(

            batch.map(url => downloadSingle(url, req))

        );

        results.push(

            ...downloaded.filter(Boolean)

        );

    }

    return results;

}