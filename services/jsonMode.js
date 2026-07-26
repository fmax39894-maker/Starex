export function jsonMode(res, images) {

    const imageList = images.map((img, index) => ({

        id: index + 1,

        original: img.original,

        filename: img.file,

        url: img.url,

        size: img.size

    }));

    return res.status(200).json({

        success: true,

        mode: "json",

        total: imageList.length,

        generatedAt: new Date().toISOString(),

        images: imageList

    });

}