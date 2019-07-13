class LhaArrayReader {

    static readonly SeekAbsolute = 0;
    static readonly SeekRelative = 1;

    offset = 0;
    subOffset = 0;
    size: number;

    constructor(public buffer: Uint8Array) {
        this.size = buffer.length;
    }

    readBits(bits: number) {
        const bitMasks = [1, 2, 4, 8, 16, 32, 64, 128];
        let byte = this.buffer[this.offset];
        let result = 0;

        for (let bitIndex = 0; bitIndex < bits; bitIndex++) {
            const bit = (byte & bitMasks[this.subOffset]) >> this.subOffset;
            result <<= 1;
            result = result | bit;
            this.subOffset--;
            if (this.subOffset < 0) {
                if (this.offset + 1 >= this.buffer.length)
                    return -1;

                byte = this.buffer[++this.offset];
                this.subOffset = 7;
            }
        }
        return result;
    }

    readUInt8() {
        if (this.offset + 1 >= this.buffer.length)
            return -1;
        return this.buffer[this.offset++];
    }

    readUInt16() {
        if (this.offset + 2 >= this.buffer.length)
            return -1;
        const value =
            (this.buffer[this.offset] & 0xFF) |
            ((this.buffer[this.offset + 1] << 8) & 0xFF00);
        this.offset += 2;
        return value;
    }

    readUInt32() {
        if (this.offset + 4 >= this.buffer.length)
            return -1;
        const value =
            (this.buffer[this.offset] & 0xFF) |
            ((this.buffer[this.offset + 1] << 8) & 0xFF00) |
            ((this.buffer[this.offset + 2] << 16) & 0xFF0000) |
            ((this.buffer[this.offset + 3] << 24) & 0xFF000000);
        this.offset += 4;
        return value;
    }

    readString(size: number) {
        if (this.offset + size >= this.buffer.length)
            return ""; // return -1;
        let result = "";
        for (let i = 0; i < size; i++)
            result += String.fromCharCode(this.buffer[this.offset++]);
        return result;
    }

    readLength() {
        let length = this.readBits(3);
        if (length == -1)
            return -1;
        if (length == 7) {
            while (this.readBits(1) != 0) {
                length++;
            }
        }
        return length;
    }

    seek(offset: number, mode: number) {
        switch (mode) {
            case LhaArrayReader.SeekAbsolute:
                this.offset = offset;
                this.subOffset = 7;
                break;
            case LhaArrayReader.SeekRelative:
                this.offset += offset;
                this.subOffset = 7;
                break;
        }
    }

    getPosition() {
        return this.offset;
    }
}

class LhaArrayWriter {
    offset = 0;
    data: Uint8Array

    constructor(public size: number) {
        this.data = new Uint8Array(size);
    }

    write(data: number) {
        this.data[this.offset++] = data;
    }
}

class LhaTree {
    static readonly LEAF = 1 << 15;

    tree: number[];
    allocated: number;
    nextEntry: number;

    setConstant(code: number) {
        this.tree[0] = code | LhaTree.LEAF;
    }

    expand() {
        const endOffset = this.allocated;
        while (this.nextEntry < endOffset) {
            this.tree[this.nextEntry] = this.allocated;
            this.allocated += 2;
            this.nextEntry++;
        }
    }

    addCodesWithLength(codeLengths: number[], codeLength: number) {
        let done = true;
        for (let i = 0; i < codeLengths.length; i++) {
            if (codeLengths[i] == codeLength) {
                const node = this.nextEntry++;
                this.tree[node] = i | LhaTree.LEAF;
            } else if (codeLengths[i] > codeLength) {
                done = false;
            }
        }
        return done;
    }

    build(codeLengths: number[], size: number) {
        this.tree = [];
        for (let i = 0; i < size; i++)
            this.tree[i] = LhaTree.LEAF;

        this.nextEntry = 0;
        this.allocated = 1;
        let codeLength = 0;
        do {
            this.expand();
            codeLength++;
        } while (!this.addCodesWithLength(codeLengths, codeLength));
    }

    readCode(reader) {
        let code = this.tree[0];
        while ((code & LhaTree.LEAF) == 0) {
            const bit = reader.readBits(1);
            code = this.tree[code + bit];
        }
        return code & ~LhaTree.LEAF;
    }
}

class LhaRingBuffer {
    data: number[] = [];
    offset = 0;

    constructor(public size: number) {
    }

    add(value: number) {
        this.data[this.offset] = value;
        this.offset = (this.offset + 1) % this.size;
    }

    get(offset: number, length: number) {
        const pos = this.offset + this.size - offset - 1;
        const result: number[] = [];
        for (let i = 0; i < length; i++) {
            const code = this.data[(pos + i) % this.size];
            result.push(code);
            this.add(code);
        }
        return result;
    }
}

export interface LhaHeader {
    headerSize?: number;
    packedType: string;
    packedSize: number;
    originalSize: number;
    datetime: number;
    attribute: number;
    level: number;
    filename?: string;
    crc?: number;
    os?: number;
    packedOffset?: number;
}

export type LhaReadCallback = (offset: number, size: number) => void;

export class LhaReader {
    reader: LhaArrayReader;
    offsetTree = new LhaTree();
    codeTree = new LhaTree();
    ringBuffer = new LhaRingBuffer(1 << 13); // lh4 specific.
    public entries: { [key: string]: LhaHeader; } = {};

    constructor(buffer: Uint8Array) {
        const reader = new LhaArrayReader(buffer);
        this.reader = reader;
        if (reader.readString(2) == "MZ") { // Check for SFX header, and skip it if it exists.
            const lastBlockSize = reader.readUInt16();
            const blockCount = reader.readUInt16();
            const offset = (blockCount - 1) * 512 + (lastBlockSize != 0 ? lastBlockSize : 512);
            reader.seek(offset, LhaArrayReader.SeekAbsolute);
        } else {
            reader.seek(0, LhaArrayReader.SeekAbsolute);
        }

        while (true) {
            const position = reader.getPosition();
            const size = reader.readUInt8();
            const checksum = reader.readUInt8();
            if (size <= 0) {
                break;
            }
            const header: LhaHeader = {
                packedType: reader.readString(5),
                packedSize: reader.readUInt32(),
                originalSize: reader.readUInt32(),
                datetime: reader.readUInt32(),
                attribute: reader.readUInt8(),
                level: reader.readUInt8(),
            };
            let nextPosition = 0;
            if (header.level === 0x00) {
                header.headerSize = size;
                header.filename = reader.readString(reader.readUInt8());
                header.crc = reader.readUInt16();
                header.packedOffset = position + 2 + header.headerSize;
                nextPosition = header.packedOffset + header.packedSize;
            } else if (header.level == 0x01) {
                header.headerSize = size;
                nextPosition = position + 2 + header.headerSize + header.packedSize;
                header.filename = reader.readString(reader.readUInt8());
                header.crc = reader.readUInt16();
                header.os = reader.readUInt8();
                let extSize = reader.readUInt16();
                while (0 < extSize) {
                    reader.seek(extSize - 2, LhaArrayReader.SeekRelative);
                    extSize = reader.readUInt16();
                }
                header.packedOffset = reader.getPosition();
                header.packedSize = nextPosition - header.packedOffset;
            } else if (header.level === 0x02) {
                header.headerSize = checksum << 8 | size;
                header.crc = reader.readUInt16();
                header.packedOffset = position + header.headerSize;
                nextPosition = header.packedOffset + header.packedSize;
                header.os = reader.readUInt8();
                let extSize = reader.readUInt16();
                while (0 < extSize) {
                    const headerId = reader.readUInt8();
                    if (headerId === 1) {
                        header.filename = reader.readString(extSize - 3);
                    } else {
                        reader.seek(extSize - 3, LhaArrayReader.SeekRelative);
                    }
                    extSize = reader.readUInt16();
                }
            }
            this.entries[header.filename.toLocaleLowerCase()] = header;
            reader.seek(nextPosition, LhaArrayReader.SeekAbsolute);
        }
    }

    readTempTable() {
        const reader = this.reader;
        const codeCount = Math.min(reader.readBits(5), 19);
        if (codeCount <= 0) {
            const constant = reader.readBits(5);
            this.offsetTree.setConstant(constant);
            return;
        }
        const codeLengths: number[] = [];
        for (let i = 0; i < codeCount; i++) {
            const codeLength = reader.readLength();
            codeLengths.push(codeLength);
            if (i == 2) { // The dreaded special bit that no-one (including me) seems to understand.
                let length = reader.readBits(2);
                while (length-- > 0) {
                    codeLengths.push(0);
                    i++;
                }
            }
        }
        this.offsetTree.build(codeLengths, 19 * 2);
    }

    readCodeTable() {
        const reader = this.reader;
        const codeCount = Math.min(reader.readBits(9), 510);
        if (codeCount <= 0) {
            const constant = reader.readBits(9);
            this.codeTree.setConstant(constant);
            return;
        }

        const codeLengths: number[] = [];
        for (let i = 0; i < codeCount;) {
            const code = this.offsetTree.readCode(reader);
            if (code <= 2) {
                let skip = 1;
                if (code == 1)
                    skip = reader.readBits(4) + 3;
                else if (code == 2)
                    skip = reader.readBits(9) + 20;
                while (--skip >= 0) {
                    codeLengths.push(0);
                    i++;
                }
            } else {
                codeLengths.push(code - 2);
                i++;
            }
        }
        this.codeTree.build(codeLengths, 510 * 2);
    }

    readOffsetTable() {
        const reader = this.reader;
        const codeCount = Math.min(reader.readBits(4), 14);
        if (codeCount <= 0) {
            const constant = reader.readBits(4);
            this.offsetTree.setConstant(constant);
            return;
        } else {
            const codeLengths: number[] = [];
            for (let i = 0; i < codeCount; i++) {
                const code = reader.readLength();
                codeLengths[i] = code;
            }
            this.offsetTree.build(codeLengths, 19 * 2);
        }
    }

    extractSync(id: string) {
        const entry = this.entries[id];
        if (!entry)
            return null;
        this.reader.seek(entry.packedOffset, LhaArrayReader.SeekAbsolute);
        const writer = new LhaArrayWriter(entry.originalSize);
        while (this.extractBlock(writer)) {
            if (writer.offset >= writer.size)
                break;
        }
        return writer.data;
    }

    extract(id: string, callback: LhaReadCallback) {
        const entry = this.entries[id];
        if (!entry)
            return null;

        this.reader.seek(entry.packedOffset, LhaArrayReader.SeekAbsolute);
        const writer = new LhaArrayWriter(entry.originalSize);
        const that = this;
        function step() { // This step solution was borrowed from ZIP-lib to prevent browser script timeout warnings.
            if (that.extractBlock(writer)) {
                if (callback)
                    callback(writer.offset, writer.size);
                if (writer.offset >= writer.size)
                    return;

                setTimeout(step, 1);
            }
        }
        step();
        return writer.data;
    }

    extractBlock(writer: LhaArrayWriter) {
        const reader = this.reader;
        const blockSize = reader.readBits(16);
        if (blockSize <= 0 || reader.offset >= reader.size)
            return false;

        this.readTempTable();
        this.readCodeTable();
        this.readOffsetTable();

        for (let i = 0; i < blockSize; i++) {
            const code = this.codeTree.readCode(reader);
            if (code < 256) {
                this.ringBuffer.add(code);
                writer.write(code);
            } else {
                const bits = this.offsetTree.readCode(reader);
                let offset = bits;
                if (bits >= 2) {
                    offset = reader.readBits(bits - 1);
                    offset = offset + (1 << (bits - 1));
                }

                const length = code - 256 + 3;
                const chunk = this.ringBuffer.get(offset, length);
                for (const j in chunk)
                    writer.write(chunk[j]); // TODO: Look at bulk-copying this.
            }
        }
        return true;
    }
}
