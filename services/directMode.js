import path from "path";

export function directMode(res, images) {

    if (!images || images.length === 0) {

        return res.status(404).json({
            success: false,
            error: "No images found"
        });

    }

    const selected = images.length >= 2 ? images[1] : images[0];

    const filePath = path.resolve("public/images", selected.file);

    return res.download(filePath, selected.file);

}