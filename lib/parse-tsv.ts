const parseTsv = (tsv: string) => {
    const lines = tsv.trim().split(/\r?\n/);

    const headers = lines[0].split('\t');

    return lines.slice(1).map(line => {
        const cells = line.split('\t').map(cell => cell.trim());

        const out: IStringMap<string> = {};

        cells.forEach((cell, idx) => out[headers[idx]?.toLowerCase() || idx] = cell);

        return out;
    });
};

export default parseTsv;
