const blockTypes = (widthCount: number) => {
	return [
		/*J*/
		[
			(p: number) => {
				return [p - widthCount, p, p + widthCount, p + widthCount - 1];
			},
			(p: number) => {
				p = (p - 2) % widthCount === 0 ? p + 1 : p;
				return [p - 2, p - 1, p, p + widthCount];
			},
			(p: number) => {
				return [p - widthCount, p - widthCount - 1, p - 1, p + widthCount - 1];
			},
			(p: number) => {
				p = (p - 2) % widthCount === 0 ? p + 1 : p;
				return [p - widthCount - 2, p - 2, p - 1, p];
			},
		],
		/*Z*/
		[
			(p: number) => {
				p = (p - 1) % widthCount === 0 ? p + 1 : p;
				return [p - 1, p, p + widthCount, p + widthCount + 1];
			},
			(p: number) => {
				return [p, p + 1, p - widthCount + 1, p + widthCount];
			},
		],
		/*S*/
		[
			(p: number) => {
				p = (p - 2) % widthCount === 0 ? p + 1 : p;
				return [p, p - 1, p + widthCount - 1, p + widthCount - 2];
			},
			(p: number) => {
				return [p - 1, p, p + widthCount, p - widthCount - 1];
			},
		],
		/*L*/
		[
			(p: number) => {
				return [p - widthCount, p, p + widthCount, p + widthCount + 1];
			},
			(p: number) => {
				p = (p - 1) % widthCount === 0 ? p + 1 : p;
				return [p - 1, p, p + 1, p - widthCount + 1];
			},
			(p: number) => {
				return [p - widthCount, p - widthCount + 1, p + 1, p + widthCount + 1];
			},
			(p: number) => {
				p = (p - 1) % widthCount === 0 ? p + 1 : p;
				return [p - 1 + widthCount, p - 1, p, p + 1];
			},
		],
		/*T*/
		[
			(p: number) => {
				p = (p - 2) % widthCount === 0 ? p + 1 : p;
				return [p - 2, p - 1, p, p - widthCount - 1];
			},
			(p: number) => {
				return [p - widthCount - 1, p - 1, p, p + widthCount - 1];
			},
			(p: number) => {
				p = (p - 2) % widthCount === 0 ? p + 1 : p;
				return [p - 2, p - 1, p, p + widthCount - 1];
			},
			(p: number) => {
				return [p - 1, p, p - widthCount, p + widthCount];
			},
		],
		/*O*/
		[
			(p: number) => {
				return [p - 1, p, p + widthCount, p + widthCount - 1];
			},
		],
		/*I*/
		[
			(p: number) => {
				return [p - widthCount, p, p + widthCount, p + widthCount + widthCount];
			},
			(p: number) => {
				p =
					(p - 1) % widthCount === 0 || (p - 2) % widthCount === 0 || (p - 3) % widthCount === 0
						? p + 3
						: p;
				return [p - 3, p - 2, p - 1, p];
			},
		],
	];
}
export default blockTypes;