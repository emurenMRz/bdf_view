import { useEffect, useRef } from 'react';
import './FontList.css';
import { BDFBasicData, BDFProperties, BDFCharData } from './bdf/bdf-file';

type FontCellProp = {
	width: number;
	height: number;
	bitmap: string;
}

function FontCell(props: FontCellProp) {
	const ref = useRef(null);
	const width = props.width;
	const height = props.height;
	const bitmap = props.bitmap;

	useEffect(() => {
		const canvas = ref.current;
		if (canvas === null) return;

		const ctx = (canvas as HTMLCanvasElement).getContext("2d");
		if (!ctx) return;

		const img = ctx.getImageData(0, 0, width, height);
		const dst = new Uint32Array(img.data.buffer);
		const pitch = ((width + 7) & ~0x7) >> 2;
		const on = 0xffffffff;
		const off = 0xff000000;
		const hex2dec = (str: string, index: number) => "0123456789ABCDEF".indexOf(str[index].toUpperCase());
		let index = 0;
		let offset = 0;
		for (let y = 0; y < height; ++y) {
			let x = 0;
			for (; x < (width & ~0x3); x += 4) {
				const block = hex2dec(bitmap, (x >> 2) + index);
				const blockOffset = offset + x;
				dst[blockOffset + 0] = (block & 0x8) ? on : off;
				dst[blockOffset + 1] = (block & 0x4) ? on : off;
				dst[blockOffset + 2] = (block & 0x2) ? on : off;
				dst[blockOffset + 3] = (block & 0x1) ? on : off;
			}
			const block = hex2dec(bitmap, (x >> 2) + index);
			const blockOffset = offset + x;
			switch (width & 0x3) {
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
			index += pitch;
			offset += width;
		}
		ctx.putImageData(img, 0, 0);
	}, [width, height, bitmap]);

	return (
		<canvas ref={ref} width={width} height={height} />
	);
}


type FontListProp = {
	basicData: BDFBasicData;
	properties: BDFProperties;
	charData: BDFCharData[];
}

export function FontList(props: FontListProp) {
	return (
		<div className="Font-list">
			{props.charData.map((v: BDFCharData, index: number) => {
				const width = v.bbx?.[0];
				const height = v.bbx?.[1];
				if (width === undefined || height === undefined) return <div></div>;
				return <FontCell key={index} width={width} height={height} bitmap={v.bitmap} />
			})}
		</div>
	);
}
