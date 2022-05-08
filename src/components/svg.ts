export function createIcon(...paths: string[]) {
    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    )

    svg.setAttribute("viewBox", "0 0 1024 1024")
    svg.setAttribute("version", "1.1")
    svg.setAttribute("width", "32")
    svg.setAttribute("height", "32")

    for (let p of paths) {
        const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        )

        path.setAttribute("d", p)
        path.setAttribute("fill", "currentColor")
        svg.appendChild(path)
    }

    return svg
}

export const close = createIcon(
    "M810.666667 273.493333L750.506667 213.333333 512 451.84 273.493333 213.333333 213.333333 273.493333 451.84 512 213.333333 750.506667 273.493333 810.666667 512 572.16 750.506667 810.666667 810.666667 750.506667 572.16 512 810.666667 273.493333z"
)
export const fullscreenExit = createIcon(
    "M597.333333 597.333333h213.333334v85.333334h-128v128h-85.333334v-213.333334m-384 0h213.333334v213.333334H341.333333v-128H213.333333v-85.333334m128-384h85.333334v213.333334H213.333333V341.333333h128V213.333333m469.333334 128v85.333334h-213.333334V213.333333h85.333334v128h128z"
)
export const fullscreen = createIcon(
    "M213.333333 213.333333h213.333334v85.333334H298.666667v128H213.333333V213.333333m384 0h213.333334v213.333334h-85.333334V298.666667h-128V213.333333m128 384h85.333334v213.333334h-213.333334v-85.333334h128v-128m-298.666666 128v85.333334H213.333333v-213.333334h85.333334v128h128z"
)
export const next = createIcon(
    "M682.666667 768h85.333333V256h-85.333333M256 768l362.666667-256L256 256v512z"
)
export const pause = createIcon(
    "M597.333333 810.666667h170.666667V213.333333h-170.666667M256 810.666667h170.666667V213.333333H256v597.333334z"
)
export const play = createIcon(
    "M341.333333 219.306667v597.333333l469.333334-298.666667-469.333334-298.666666z"
)
export const settings = createIcon(
    "M512 661.333333A149.333333 149.333333 0 0 1 362.666667 512 149.333333 149.333333 0 0 1 512 362.666667a149.333333 149.333333 0 0 1 149.333333 149.333333 149.333333 149.333333 0 0 1-149.333333 149.333333m317.013333-107.946666c1.706667-13.653333 2.986667-27.306667 2.986667-41.386667 0-14.08-1.28-28.16-2.986667-42.666667l90.026667-69.546666c8.106667-6.4 10.24-17.92 5.12-27.306667l-85.333333-147.626667c-5.12-9.386667-16.64-13.226667-26.026667-9.386666l-106.24 42.666666c-22.186667-16.64-45.226667-31.146667-72.106667-41.813333l-15.786666-113.066667A21.589333 21.589333 0 0 0 597.333333 85.333333h-170.666666c-10.666667 0-19.626667 7.68-21.333334 17.92l-15.786666 113.066667c-26.88 10.666667-49.92 25.173333-72.106667 41.813333l-106.24-42.666666c-9.386667-3.84-20.906667 0-26.026667 9.386666l-85.333333 147.626667c-5.546667 9.386667-2.986667 20.906667 5.12 27.306667L194.986667 469.333333c-1.706667 14.506667-2.986667 28.586667-2.986667 42.666667 0 14.08 1.28 27.733333 2.986667 41.386667l-90.026667 70.826666c-8.106667 6.4-10.666667 17.92-5.12 27.306667l85.333333 147.626667c5.12 9.386667 16.64 12.8 26.026667 9.386666l106.24-43.093333c22.186667 17.066667 45.226667 31.573333 72.106667 42.24l15.786666 113.066667c1.706667 10.24 10.666667 17.92 21.333334 17.92h170.666666c10.666667 0 19.626667-7.68 21.333334-17.92l15.786666-113.066667c26.88-11.093333 49.92-25.173333 72.106667-42.24l106.24 43.093333c9.386667 3.413333 20.906667 0 26.026667-9.386666l85.333333-147.626667c5.12-9.386667 2.986667-20.906667-5.12-27.306667l-90.026667-70.826666z"
)
export const volumeHigh = createIcon(
    "M597.333333 137.813333v87.893334c123.306667 36.693333 213.333333 151.04 213.333334 286.293333s-90.026667 249.173333-213.333334 285.866667v88.32c170.666667-38.826667 298.666667-191.573333 298.666667-374.186667 0-182.613333-128-335.36-298.666667-374.186667M704 512c0-75.52-42.666667-140.373333-106.666667-171.946667V682.666667c64-30.293333 106.666667-95.573333 106.666667-170.666667M128 384v256h170.666667l213.333333 213.333333V170.666667L298.666667 384H128z"
)
export const volumeMedium = createIcon(
    "M213.333333 384v256h170.666667l213.333333 213.333333V170.666667L384 384m405.333333 128c0-75.52-42.666667-140.373333-106.666666-171.946667V682.666667c64-30.293333 106.666667-95.573333 106.666666-170.666667z"
)
export const volumeLow = createIcon(
    "M298.666667 384v256h170.666666l213.333334 213.333333V170.666667l-213.333334 213.333333H298.666667z" 
)
export const volumeOff = createIcon(
    "M512 170.666667L422.826667 259.84 512 349.013333M182.186667 128L128 182.186667 329.813333 384H128v256h170.666667l213.333333 213.333333v-287.146666l181.333333 181.76c-28.586667 21.76-60.586667 39.68-96 49.92v88.32c58.88-13.653333 112.213333-40.533333 157.013334-77.226667L841.813333 896 896 841.813333l-384-384M810.666667 512c0 40.106667-8.533333 77.653333-23.04 112.64l64.426666 64.426667A380.416 380.416 0 0 0 896 512c0-182.613333-128-335.36-298.666667-374.186667v87.893334c123.306667 36.693333 213.333333 151.04 213.333334 286.293333m-106.666667 0c0-75.52-42.666667-140.373333-106.666667-171.946667v94.293334l104.533334 104.533333c2.133333-8.533333 2.133333-17.92 2.133333-26.88z"
)