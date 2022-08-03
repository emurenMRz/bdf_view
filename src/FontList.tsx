import { useState, useEffect, useRef } from 'react';
import './FontList.css';
import { BoundingBox, BDFBasicData, BDFProperties, BDFCharData } from './bdf/bdf-file';

type FontCellProp = {
	bitmap: string;
	glyphBBX: BoundingBox;
	fontBBX: BoundingBox;
}

function FontCell(props: FontCellProp) {
	const ref = useRef(null);
	const fontWidth = props.fontBBX.width;
	const fontHeight = props.fontBBX.height;

	useEffect(() => {
		new Promise((resolve, reject) => {
			const canvas = ref.current;
			if (canvas === null) return;

			const ctx = (canvas as HTMLCanvasElement).getContext("2d");
			if (!ctx) return;

			const bitmap = props.bitmap;
			const glyphWidth = props.glyphBBX.width;
			const glyphHeight = props.glyphBBX.height;
			const left = -(props.fontBBX.left - props.glyphBBX.left);
			const top = (fontHeight + props.fontBBX.bottom) - (glyphHeight + props.glyphBBX.bottom);

			const img = ctx.getImageData(left, top, glyphWidth, glyphHeight);
			const dst = new Uint32Array(img.data.buffer);
			const pitch = ((glyphWidth + 7) & ~0x7) >> 2;
			const on = 0xffffffff;
			const off = 0xff000000;
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
		});
	}, [props.bitmap, props.glyphBBX, props.fontBBX, fontHeight]);

	return (
		<canvas ref={ref} width={fontWidth} height={fontHeight} />
	);
}

type FontListProp = {
	basicData: BDFBasicData;
	properties: BDFProperties;
	charData: BDFCharData[];
}

export function FontList(props: FontListProp) {
	const [style, setStyle] = useState({ gridTemplateColumns: "repeat(auto-fit, 16px)" } as React.CSSProperties);
	const ref = useRef(null);

	const fontBBX = props.basicData.fontBoundingBox;
	const fontWidth = fontBBX.width;
	const charData = props.charData;

	useEffect(() => {
		const fontList = ref.current;
		if (!fontList) return;
		setStyle({ gridTemplateColumns: `repeat(auto-fit, ${fontWidth}px)` });
	}, [fontBBX, fontWidth, charData]);

	if (charData.length === 0)
		return <div className="Font-list" style={style}></div>;

	return (
		<div ref={ref} className="Font-list" style={style}>
			{charData.map((v: BDFCharData, index: number) => {
				const glyphBBX = v.bbx !== undefined ? v.bbx : fontBBX;
				return <FontCell key={index} bitmap={v.bitmap} glyphBBX={glyphBBX} fontBBX={fontBBX} />;
			})}
		</div>
	);
}
