export function jsonMode(res, images) {

    return res.json({

        success: true,

        mode: "json",

        total: images.length,

        images

    });

}