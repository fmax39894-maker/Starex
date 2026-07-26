import fs from "fs-extra";
import path from "path";

const IMAGE_DIR = "public/images";

// Delete files older than 30 minutes
const MAX_FILE_AGE = 30 * 60 * 1000;

export async function cleanupImages() {

    try {

        await fs.ensureDir(IMAGE_DIR);

        const files = await fs.readdir(IMAGE_DIR);

        const now = Date.now();

        let deleted = 0;

        for (const file of files) {

            const filePath = path.join(IMAGE_DIR, file);

            try {

                const stat = await fs.stat(filePath);

                const age = now - stat.mtimeMs;

                if (age > MAX_FILE_AGE) {

                    await fs.remove(filePath);

                    deleted++;

                }

            } catch (err) {

                console.log("Cleanup skipped:", file);

            }

        }

        console.log(`Cleanup complete. Deleted ${deleted} file(s).`);

    } catch (err) {

        console.log("Cleanup Error:", err.message);

    }

}