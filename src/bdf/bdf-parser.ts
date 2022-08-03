import { BDFFile, BDFCharData, BDFProperties } from "./bdf-file";

function PropertiesParser(properties: BDFProperties, lines: string[], startLine: number, endLine: number): number {
	for (let l = startLine; l <= endLine; ++l) {
		if (lines[l] === "ENDPROPERTIES")
			break;

		const line = lines[l].match(/^([A-Z_]+?) (.+)$/);
		if (line === null) throw new TypeError(`PropertiesParser: unsupport item: ${lines[l]}`);

		switch (line[1]) {
			case "FONTNAME_REGISTRY": properties.fontnameRegistry = line[2].trim(); break;
			case "FOUNDRY": properties.foundry = line[2].trim(); break;
			case "FAMILY": properties.family = line[2].trim(); break;
			case "WEIGHT_NAME": properties.weightName = line[2].trim(); break;
			case "SLANT": properties.slant = line[2].trim(); break;
			case "SETWIDTH_NAME": properties.setwidthName = line[2].trim(); break;
			case "ADD_STYLE_NAME": properties.addStyleName = line[2].trim(); break;
			case "PIXEL_SIZE": properties.pixelSize = Number(line[2]); break;
			case "POINT_SIZE": properties.pointSize = Number(line[2]); break;
			case "RESOLUTION_X": properties.resolutionX = Number(line[2]); break;
			case "RESOLUTION_Y": properties.resolutionY = Number(line[2]); break;
			case "SPACING": properties.spacing = line[2].trim(); break;
			case "AVERAGE_WIDTH": properties.averageWidth = Number(line[2]); break;
			case "CHARSET_REGISTRY": properties.charsetRegistry = line[2].trim(); break;
			case "CHARSET_ENCODING": properties.charsetEncoding = line[2].trim(); break;
			case "DEFAULT_CHAR": properties.defaultChar = Number(line[2]); break;
			case "FONT_DESCENT": properties.fontDescent = Number(line[2]); break;
			case "FONT_ASCENT": properties.fontAscent = Number(line[2]); break;
			case "COPYRIGHT": properties.copyright = line[2].trim(); break;
		}
	}
	return endLine;
}

function CharParser(char: BDFCharData, lines: string[], startLine: number): number {
	let endLine = startLine;
	for (let l = startLine; ; ++l) {
		if (lines[l] === "ENDCHAR") {
			endLine = l;
			break;
		} else if (lines[l] === "BITMAP") {
			let width = 0;
			let height = 0;
			if (char.bbx !== undefined) {
				width = char.bbx[0];
				height = char.bbx[1];
			}
			let bitmap = '';
			for (let i = 1; i <= height; ++i)
				bitmap += lines[l + i];
			if (bitmap.length !== (((width + 7) & ~0x7) >> 2) * height)
				throw new TypeError("CharParser: bitmap data broken.");
			char.bitmap = bitmap;
			l += height;
			continue;
		}

		const line = lines[l].match(/^([A-Z_]+?) (.+)$/);
		if (line === null) throw new TypeError(`CharParser: unsupport item: ${lines[l]}`);

		switch (line[1]) {
			case "ENCODING": char.encoding = Number(line[2]); break;
			case "SWIDTH": {
				const n = line[2].split(" ").map(v => Number(v));
				if (n.length === 2)
					char.swidth = [n[0], n[1]];
			} break;
			case "DWIDTH": {
				const n = line[2].split(" ").map(v => Number(v));
				if (n.length === 2)
					char.dwidth = [n[0], n[1]];
			} break;
			case "BBX": {
				const n = line[2].split(" ").map(v => Number(v));
				if (n.length === 4)
					char.bbx = [n[0], n[1], n[2], n[3]];
			} break;
		}
	}
	return endLine;
}

export default function BDFParser(lines: string[]): BDFFile {
	const bdfFile = new BDFFile();

	const m = lines[0].match(/^STARTFONT (.+)$/);
	if (m !== null)
		bdfFile.version = m[1];

	if (lines.at(-1) === "ENDFONT")
		throw new TypeError("BDFParser: unsupport format.");

	for (let l = 1; l < lines.length - 1; ++l) {
		const line = lines[l].match(/^([A-Z_]+?) (.+)$/);
		if (line === null) break;

		switch (line[1]) {
			case "FONT": bdfFile.basicData.font = line[2].trim(); break;
			case "SIZE": {
				const n = line[2].split(" ").map(v => Number(v));
				if (n.length === 3)
					bdfFile.basicData.size = [n[0], n[1], n[2]];
			} break;
			case "FONTBOUNDINGBOX": {
				const n = line[2].split(" ").map(v => Number(v));
				if (n.length === 3)
					bdfFile.basicData.fontBoundingBox = [n[0], n[1], n[2], n[4]];
			} break;
			case "CHARS": bdfFile.basicData.chars = Number(line[2]); break;
			case "STARTPROPERTIES": {
				const propLines = Number(line[2]);
				l = PropertiesParser(bdfFile.properties, lines, l + 1, l + 1 + propLines);
			} break;
			case "STARTCHAR": {
				const font = new BDFCharData(line[2].trim());
				l = CharParser(font, lines, l + 1);
				bdfFile.charData.push(font);
			} break;
		}

	}

	return bdfFile;
}
