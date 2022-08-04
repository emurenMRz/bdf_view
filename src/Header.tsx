import { BDFBasicData, BDFProperties } from './bdf/bdf-file';
import './Header.css';

const propNames: { [key: string]: string } = {
	fontnameRegistry: "FONTNAME_REGISTRY",
	foundry: "FOUNDRY",
	family: "FAMILY",
	weightName: "WEIGHT_NAME",
	slant: "SLANT",
	setwidthName: "SETWIDTH_NAME",
	addStyleName: "ADD_STYLE_NAME",
	pixelSize: "PIXEL_SIZE",
	pointSize: "POINT_SIZE",
	resolutionX: "RESOLUTION_X",
	resolutionY: "RESOLUTION_Y",
	spacing: "SPACING",
	averageWidth: "AVERAGE_WIDTH",
	charsetRegistry: "CHARSET_REGISTRY",
	charsetEncoding: "CHARSET_ENCODING",
	defaultChar: "DEFAULT_CHAR",
	fontDescent: "FONT_DESCENT",
	fontAscent: "FONT_ASCENT",
	copyright: "COPYRIGHT",
};

type HeaderProp = {
	version: string | undefined;
	basicData: BDFBasicData;
	properties: BDFProperties;
}

export function Header(props: HeaderProp) {
	return (
		<div className='BDFHeader'>
			<div className='Version'>BDF Version: {props.version}</div>

			<dl className='Basic-data'>
				<dt>FONT</dt><dd>{props.basicData.font}</dd>
				<dt>SIZE</dt><dd>{props.basicData.size?.join()}</dd>
				<dt>FONTBOUNDINGBOX</dt><dd>{Object.values(props.basicData.fontBoundingBox).join()}</dd>
				<dt>CHARS</dt><dd>{props.basicData.chars}</dd>
			</dl>

			<div className="Propertie-header">Properties</div>

			<table className='Properties'>
				{Object.entries(props.properties).map((prop, index) => {
					const value = prop[1];
					if (value !== undefined)
						return <tr key={index}><td>{propNames[prop[0]]}</td><td>{value}</td></tr>;
					return null;
				})}
			</table>
		</div>
	);
}
