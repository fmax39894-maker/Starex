import fs from "fs-extra";
import path from "path";

const IMAGE_DIR = "public/images";

// Delete files older than 30 minutes
const MAX_AGE = 30 * 60 * 1000;

export async function cleanupImages() {

    try {

        await fs.ensureDir(IMAGE_DIR);

        const files = await fs.readdir(IMAGE_DIR);

        const now = Date.now();

        for (const file of files) {

            const filepath = path.join(IMAGE_DIR, file);

            const stat = await fs.stat(filepath);

            if (now - stat.mtimeMs > MAX_AGE) {

                await fs.remove(filepath);

                console.log("Deleted:", file);

            }

        }

    } catch (err) {

        console.log("Cleanup Error:", err.message);

    }

}