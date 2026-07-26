import axios from "axios";
import fs from "fs-extra";
import path from "path";
import mime from "mime-types";
import { v4 as uuid } from "uuid";

const IMAGE_DIR = "public/images";
const MAX_PARALLEL = 200;

export async function downloadImages(imageUrls, req) {

    await fs.ensureDir(IMAGE_DIR);

    const results = [];

    for (let i = 0; i < imageUrls.length; i += MAX_PARALLEL) {

        const batch = imageUrls.slice(i, i + MAX_PARALLEL);

        await Promise.all(

            batch.map(async (url) => {

                try {

                    const response = await axios({

                        url,
                        method: "GET",
                        responseType: "arraybuffer",
                        timeout: Number(process.env.DOWNLOAD_TIMEOUT) || 30000,
                        maxRedirects: 5,

                        headers: {
                            "User-Agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
                            "Accept": "image/*,*/*;q=0.8"
                        }

                    });

                    let ext =
                        mime.extension(response.headers["content-type"]) ||
                        path.extname(new URL(url).pathname).replace(".", "") ||
                        "jpg";

                    if (!ext)
                        ext = "jpg";

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
                        url: imageUrl,
                        size: response.data.length

                    });

                } catch (err) {

                    console.log("Download failed:", url);

                }

            })

        );

    }

    return results;

}