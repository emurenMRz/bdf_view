import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BDFFile } from './bdf/bdf-file';
import "./Export.css";

type ExportProp = {
	inFileName: string;
	bdfFile: BDFFile;
}

export function Expoert(props: ExportProp) {
	const bdf = props.bdfFile;
	const chars = bdf.basicData.chars;
	const defaultColumns = 128;
	const fontWidth = bdf.basicData.fontBoundingBox.width;
	const fontHeight = bdf.basicData.fontBoundingBox.height;
	const calcRow = useCallback((columns: number) => Math.ceil(chars / columns), [chars]);

	const number = useRef(null);
	const range = useRef(null);
	const [disableExportPNG, setDisableExportPNG] = useState(true);
	const [glyphColumns, setGlyphColumns] = useState(defaultColumns);
	const [glyphRows, setGlyphRows] = useState(calcRow(defaultColumns));
	const [imageWidth, setImageWidth] = useState(defaultColumns * fontWidth);
	const [imageHeight, setImageHeight] = useState(calcRow(defaultColumns) * fontHeight);

	useEffect(() => {
		const f = () => {
			const fontList = document.querySelector(".Font-list");
			if (fontList === null) return;
			if (fontList.children.length !== chars)
				setTimeout(f, 100);
			else
				setDisableExportPNG(false);
		}
		f();
	}, [chars]);

	useEffect(() => {
		setDisableExportPNG(true);
		setGlyphColumns(defaultColumns);
		setGlyphRows(calcRow(defaultColumns));
		setImageWidth(defaultColumns * fontWidth);
		setImageHeight(calcRow(defaultColumns) * fontHeight);
	}, [calcRow, fontWidth, fontHeight]);

	const handleChangeCore = (e: React.ChangeEvent<HTMLInputElement>, pairRef: React.MutableRefObject<HTMLInputElement | null>) => {
		if (e === undefined) return;
		const columns = e.currentTarget.valueAsNumber;
		const rows = calcRow(columns);
		setGlyphColumns(columns);
		setGlyphRows(rows);
		setImageWidth(columns * fontWidth);
		setImageHeight(rows * fontHeight);
		if (pairRef.current !== null)
			((pairRef.current) as HTMLInputElement).value = '' + columns;
	}
	const handleChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => handleChangeCore(e, range);
	const handleChangeRange = (e: React.ChangeEvent<HTMLInputElement>) => handleChangeCore(e, number);

	const handleExportPNG = () => {
		const fontList = document.querySelector(".Font-list");
		if (fontList === null) return;
		if (fontList.children.length !== chars) return;

		const png = document.createElement("canvas");
		png.width = imageWidth;
		png.height = imageHeight;
		const ctx = png.getContext("2d");
		if (ctx === null) return;

		for (let i = 0; i < fontList.children.length; ++i) {
			const x = (i % glyphColumns) * fontWidth;
			const y = (i / glyphColumns | 0) * fontHeight;
			ctx.drawImage(fontList.children[i] as HTMLCanvasElement, x, y);
		}

		png.toBlob(blob => {
			if (blob === null) return;
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			document.body.appendChild(a);
			a.download = `${props.inFileName}.png`;
			a.href = url;
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		});
	}

	const handleExportJSON = (e: React.MouseEvent<HTMLButtonElement>) => {
		const indexes: { [key: number]: [number, number] } = {};
		bdf.charData.forEach((v, i) => indexes[v.encoding] = [(i % glyphColumns) * fontWidth, (i / glyphColumns | 0) * fontHeight]);

		let charset = bdf.properties.charsetRegistry;
		if (charset !== undefined && bdf.properties.charsetEncoding !== undefined)
			charset += `-${bdf.properties.charsetEncoding}`;

		const blob = new Blob([JSON.stringify({ width: fontWidth, height: fontHeight, charset, indexes })], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		document.body.appendChild(a);
		a.download = `${props.inFileName}.json`;
		a.href = url;
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	return (
		<div className="Export">
			<div className="Settings-header">Export settings:</div>
			<label>
				Glyph columns: <input ref={number} type="number" min="1" max={chars} defaultValue={defaultColumns} onChange={handleChangeNumber} />
				<input ref={range} className="Slider" type="range" name="columns" min="1" max={chars} defaultValue={defaultColumns} onChange={handleChangeRange} />
			</label>
			<label>Glyph rows: {glyphRows}</label>
			<label>Image width: {imageWidth} px</label>
			<label>Image height: {imageHeight} px</label>
			<button className="Button" onClick={handleExportPNG} disabled={disableExportPNG} >Export PNG</button>
			<button className="Button" onClick={handleExportJSON} >Export Index table</button>
		</div>
	);
}