export class BDFBasicData {
	font: string | undefined;
	size: [number, number, number] | undefined;
	fontBoundingBox: [number, number, number, number] | undefined;
	chars: number | undefined;
}

export class BDFProperties {
	fontnameRegistry: string | undefined;
	foundry: string | undefined;
	family: string | undefined;
	weightName: string | undefined;
	slant: string | undefined;
	setwidthName: string | undefined;
	addStyleName: string | undefined;
	pixelSize: number | undefined;
	pointSize: number | undefined;
	resolutionX: number | undefined;
	resolutionY: number | undefined;
	spacing: string | undefined;
	averageWidth: number | undefined;
	charsetRegistry: string | undefined;
	charsetEncoding: string | undefined;
	defaultChar: number | undefined;
	fontDescent: number | undefined;
	fontAscent: number | undefined;
	copyright: string | undefined;
}

export class BDFCharData {
	name: string;
	encoding: number = 0;
	swidth: [number, number] = [0, 0];
	dwidth: [number, number] = [0, 0];
	bbx: [number, number, number, number] | undefined;
	bitmap: string = "";

	constructor(name: string) {
		this.name = name;
	}
}

export class BDFFile {
	version: string | undefined;
	basicData: BDFBasicData = new BDFBasicData();
	properties: BDFProperties = new BDFProperties();
	charData: BDFCharData[] = [];
}
