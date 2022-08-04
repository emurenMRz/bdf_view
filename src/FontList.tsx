import { useEffect, useRef } from 'react';
import './FontList.css';
import { BoundingBox, BDFBasicData, BDFProperties, BDFCharData } from './bdf/bdf-file';

function makeCanvas(bitmap: string, glyphBBX: BoundingBox, fontBBX: BoundingBox) {
	const fontWidth = fontBBX.width;
	const fontHeight = fontBBX.height;

	const canvas = document.createElement("canvas");
	if (canvas === null) throw new Error("failed build canvas");
	canvas.width = fontWidth;
	canvas.height = fontHeight;

	const ctx = (canvas as HTMLCanvasElement).getContext("2d");
	if (!ctx) throw new Error("unsupport 2d context");

	const glyphWidth = glyphBBX.width;
	const glyphHeight = glyphBBX.height;
	const left = -(fontBBX.left - glyphBBX.left);
	const top = (fontHeight + fontBBX.bottom) - (glyphHeight + glyphBBX.bottom);

	const img = ctx.getImageData(left, top, glyphWidth, glyphHeight);
	const dst = new Uint32Array(img.data.buffer);
	const pitch = ((glyphWidth + 7) & ~0x7) >> 2;
	const on = 0xffffffff;
	const off = 0;
	const hex2dec = (str: string, index: number) => "0123456789ABCDEF".indexOf(str[index].toUpperCase());
	let index = 0;
	let offset = 0;
	for (let y = 0; y < glyphHeight; ++y) {
		let x = 0;
		for (; x < (glyphWidth & ~0x3); x += 4) {
			const block = hex2dec(bitmap, (x >> 2) + index);
			const blockOffset = offset + x;
			dst[blockOffset + 0] = (block & 0x8) ? on : off;
			dst[blockOffset + 1] = (block & 0x4) ? on : off;
			dst[blockOffset + 2] = (block & 0x2) ? on : off;
			dst[blockOffset + 3] = (block & 0x1) ? on : off;
		}
		const remainder = glyphWidth & 0x3;
		if (remainder > 0) {
			const block = hex2dec(bitmap, (x >> 2) + index);
			const blockOffset = offset + x;
			switch (remainder) {
				case 1:
					dst[blockOffset + 0] = (block & 0x8) ? on : off;
					break;
				case 2:
					dst[blockOffset + 0] = (block & 0x8) ? on : off;
					dst[blockOffset + 1] = (block & 0x4) ? on : off;
					break;
				case 3:
					dst[blockOffset + 0] = (block & 0x8) ? on : off;
					dst[blockOffset + 1] = (block & 0x4) ? on : off;
					dst[blockOffset + 2] = (block & 0x2) ? on : off;
					break;
			}
		}
		index += pitch;
		offset += glyphWidth;
	}
	ctx.putImageData(img, left, top);

	return canvas;
}

type FontListProp = {
	basicData: BDFBasicData;
	properties: BDFProperties;
	charData: BDFCharData[];
}

export function FontList(props: FontListProp) {
	const ref = useRef(null);
	const fontBBX = props.basicData.fontBoundingBox;
	const charData = props.charData;

	useEffect(() => {
		const e = ref.current;
		if (e === null) return;
		const parent = e as HTMLDivElement;
		parent.textContent = "";

		if (charData.length === 0) return;

		let index = 0;
		const f = () => {
			const elems: HTMLCanvasElement[] = [];
			for (let i = 0; ; ++i) {
				if (i >= 256 || index + i >= charData.length) {
					index += i;
					break;
				}
				const glyphs = charData[index + i];
				const glyphBBX = glyphs.bbx !== undefined ? glyphs.bbx : fontBBX;
				elems.push(makeCanvas(glyphs.bitmap, glyphBBX, fontBBX));
			}
			for (const e of elems)
				parent.appendChild(e);

			if (index < charData.length)
				setTimeout(f, 1);
		};
		f();
	}, [charData, fontBBX]);

	return <div ref={ref} className="Font-list" style={{ gridTemplateColumns: `repeat(auto-fit, ${fontBBX.width}px)` }}></div>;
}
