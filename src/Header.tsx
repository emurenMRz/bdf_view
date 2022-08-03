import { BDFBasicData, BDFProperties } from './bdf/bdf-file';

export type HeaderProp = {
	version: string | undefined;
	basicData: BDFBasicData;
	properties: BDFProperties;
}

export function Header(props: HeaderProp) {
	return (
		<div className='BDFHeader'>
			<div className='Version'>BDF Version: {props.version}</div>

			<table className='Basic-data'>
				<tr><td>FONT</td><td>{props.basicData.font}</td></tr>
				<tr><td>SIZE</td><td>{props.basicData.size?.join()}</td></tr>
				<tr><td>FONTBOUNDINGBOX</td><td>{Object.values(props.basicData.fontBoundingBox).join()}</td></tr>
				<tr><td>CHARS</td><td>{props.basicData.chars}</td></tr>
			</table>

			<table className='Properties'>
				<tr><td>FONTNAME_REGISTRY</td><td>{props.properties.fontnameRegistry}</td></tr>
				<tr><td>FOUNDRY</td><td>{props.properties.foundry}</td></tr>
				<tr><td>FAMILY</td><td>{props.properties.family}</td></tr>
				<tr><td>WEIGHT_NAME</td><td>{props.properties.weightName}</td></tr>
				<tr><td>SLANT</td><td>{props.properties.slant}</td></tr>
				<tr><td>SETWIDTH_NAME</td><td>{props.properties.setwidthName}</td></tr>
				<tr><td>ADD_STYLE_NAME</td><td>{props.properties.addStyleName}</td></tr>
				<tr><td>PIXEL_SIZE</td><td>{props.properties.pixelSize}</td></tr>
				<tr><td>POINT_SIZE</td><td>{props.properties.pointSize}</td></tr>
				<tr><td>RESOLUTION_X</td><td>{props.properties.resolutionX}</td></tr>
				<tr><td>RESOLUTION_Y</td><td>{props.properties.resolutionY}</td></tr>
				<tr><td>SPACING</td><td>{props.properties.spacing}</td></tr>
				<tr><td>AVERAGE_WIDTH</td><td>{props.properties.averageWidth}</td></tr>
				<tr><td>CHARSET_REGISTRY</td><td>{props.properties.charsetRegistry}</td></tr>
				<tr><td>CHARSET_ENCODING</td><td>{props.properties.charsetEncoding}</td></tr>
				<tr><td>DEFAULT_CHAR</td><td>{props.properties.defaultChar}</td></tr>
				<tr><td>FONT_DESCENT</td><td>{props.properties.fontDescent}</td></tr>
				<tr><td>FONT_ASCENT</td><td>{props.properties.fontAscent}</td></tr>
				<tr><td>COPYRIGHT</td><td>{props.properties.copyright}</td></tr>
			</table>
		</div>
	);
}
