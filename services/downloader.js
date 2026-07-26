import axios from "axios";
import fs from "fs-extra";
import path from "path";
import mime from "mime-types";
import { v4 as uuid } from "uuid";

const IMAGE_DIR = "public/images";

export async function downloadImages(imageUrls, req) {

    await fs.ensureDir(IMAGE_DIR);

    const results = [];

    const MAX_PARALLEL = 10;

for (let i = 0; i < imageUrls.length; i += MAX_PARALLEL) {

    const batch = imageUrls.slice(i, i + MAX_PARALLEL);

    await Promise.all(
        batch.map(async (url) => {

        imageUrls.map(async (url) => {

            try {

                const response = await axios({

                    url,
                    method: "GET",
                    responseType: "arraybuffer",
                    timeout: Number(process.env.DOWNLOAD_TIMEOUT) || 30000,
                    headers: {

                        "User-Agent":
                            "Mozilla/5.0"

                    }

                });

                let ext =
                    mime.extension(response.headers["content-type"]) ||
                    path.extname(new URL(url).pathname).replace(".", "") ||
                    "jpg";

                if (ext === "jpeg")
                    ext = "jpg";

                const filename = `${uuid()}.${ext}`;

                const filepath = path.join(IMAGE_DIR, filename);

                await fs.writeFile(filepath, response.data);

                const imageUrl =
                    `${req.protocol}://${req.get("host")}/images/${filename}`;

                results.push({

                    original: url,
                    file: filename,
                    url: imageUrl

                });

            } catch (err) {

                console.log("Download failed:", url);

            }

        })

    );

    return results;

}