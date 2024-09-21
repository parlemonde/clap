import type { translationObject, Comments, SingleTranslation } from './util';
import { parseHeader } from './util';
import { getLocalesForLanguage } from 'src/actions/get-locales';

const SYMBOLS = {
    quotes: /["']/,
    comments: /#/,
    whitespace: /\s/,
    key: /[\w\-[\]]/,
    keyNames: /^(?:msgctxt|msgid(?:_plural)?|msgstr(?:\[\d+])?)$/,
};

/**
 * State constants for parsing FSM
 */
const STATES = {
    none: 0x01,
    comments: 0x02,
    key: 0x03,
    string: 0x04,
};

/**
 * Value types for lexer
 */
const TYPES = {
    comments: 0x01,
    key: 0x02,
    string: 0x03,
};

interface ParsedNode {
    type: number;
    value: string;
    comments?: Comments;
    quote?: string;
}

function lexer(chunk: string): ParsedNode[] {
    const lex: ParsedNode[] = [];
    let escaped = false;
    let node: ParsedNode = {
        type: TYPES.string,
        value: '',
    };
    let state = STATES.none;
    let chr: string;
    let lineNumber = 1;

    for (let i = 0, len = chunk.length; i < len; i++) {
        chr = chunk.charAt(i);

        if (chr === '\n') {
            lineNumber += 1;
        }

        switch (state) {
            case STATES.none:
                if (chr.match(SYMBOLS.quotes)) {
                    node = {
                        type: TYPES.string,
                        value: '',
                        quote: chr,
                    };
                    lex.push(node);
                    state = STATES.string;
                } else if (chr.match(SYMBOLS.comments)) {
                    node = {
                        type: TYPES.comments,
                        value: '',
                    };
                    lex.push(node);
                    state = STATES.comments;
                } else if (!chr.match(SYMBOLS.whitespace)) {
                    node = {
                        type: TYPES.key,
                        value: chr,
                    };
                    lex.push(node);
                    state = STATES.key;
                }
                break;
            case STATES.comments:
                if (chr === '\n') {
                    state = STATES.none;
                } else if (chr !== '\r') {
                    node.value += chr;
                }
                break;
            case STATES.string:
                if (escaped) {
                    switch (chr) {
                        case 't':
                            node.value += '\t';
                            break;
                        case 'n':
                            node.value += '\n';
                            break;
                        case 'r':
                            node.value += '\r';
                            break;
                        default:
                            node.value += chr;
                    }
                    escaped = false;
                } else {
                    if (chr === node.quote) {
                        state = STATES.none;
                    } else if (chr === '\\') {
                        escaped = true;
                        break;
                    } else {
                        node.value += chr;
                    }
                    escaped = false;
                }
                break;
            case STATES.key:
                if (!chr.match(SYMBOLS.key)) {
                    if (!node.value.match(SYMBOLS.keyNames)) {
                        const err = new SyntaxError(
                            `Error parsing PO data: Invalid key name "${node.value}" at line ${lineNumber}. This can be caused by an unescaped quote character in a msgid or msgstr value.`,
                        );

                        // err.lineNumber = this.lineNumber;

                        throw err;
                    }
                    state = STATES.none;
                    i--;
                } else {
                    node.value += chr;
                }
                break;
        }
    }

    return lex;
}

/**
 * Join multi line strings
 */
function joinStringValues(tokens: ParsedNode[]): ParsedNode[] {
    const response: ParsedNode[] = [];
    let lastNode: ParsedNode | undefined;

    for (let i = 0, len = tokens.length; i < len; i++) {
        if (lastNode && tokens[i].type === TYPES.string && lastNode.type === TYPES.string) {
            lastNode.value += tokens[i].value;
        } else if (lastNode && tokens[i].type === TYPES.comments && lastNode.type === TYPES.comments) {
            lastNode.value += `\n${tokens[i].value}`;
        } else {
            response.push(tokens[i]);
            lastNode = tokens[i];
        }
    }

    return response;
}

type CommentKey = keyof Comments;

/**
 * Parse comments into separate comment blocks
 */
function parseComments(tokens: ParsedNode[]): void {
    // parse comments
    tokens.forEach((node: ParsedNode) => {
        let comment: {
            translator: Array<string>;
            extracted: Array<string>;
            reference: Array<string>;
            flag: Array<string>;
            previous: Array<string>;
        };
        let lines: Array<string>;

        if (node && node.type === TYPES.comments) {
            comment = {
                translator: [],
                extracted: [],
                reference: [],
                flag: [],
                previous: [],
            };

            lines = (node.value || '').split(/\n/);

            lines.forEach((line) => {
                switch (line.charAt(0) || '') {
                    case ':':
                        comment.reference.push(line.substr(1).trim());
                        break;
                    case '.':
                        comment.extracted.push(line.substr(1).replace(/^\s+/, ''));
                        break;
                    case ',':
                        comment.flag.push(line.substr(1).replace(/^\s+/, ''));
                        break;
                    case '|':
                        comment.previous.push(line.substr(1).replace(/^\s+/, ''));
                        break;
                    default:
                        comment.translator.push(line.replace(/^\s+/, ''));
                }
            });
            node.comments = {};
            (Object.keys(comment) as CommentKey[]).forEach((key) => {
                if (comment[key] && comment[key].length && node.comments) {
                    node.comments[key] = comment[key].join('\n');
                }
            });
        }
    });
}

type KeyNode = {
    key: string;
    value: string;
    comments?: Comments;
};

/**
 * Join gettext keys with values
 */
function handleKeys(tokens: ParsedNode[]): KeyNode[] {
    const response: KeyNode[] = [];
    let lastNode: KeyNode | undefined;

    for (let i = 0, len = tokens.length; i < len; i++) {
        if (tokens[i].type === TYPES.key) {
            lastNode = {
                key: tokens[i].value,
                value: '',
            };
            if (i && tokens[i - 1].type === TYPES.comments) {
                lastNode.comments = tokens[i - 1].comments;
            }
            response.push(lastNode);
        } else if (tokens[i].type === TYPES.string && lastNode) {
            lastNode.value += tokens[i].value;
        }
    }

    return response;
}

type ValueNode = SingleTranslation;

/**
 * Separate different values into individual translation objects
 */
function handleValues(tokens: KeyNode[]): ValueNode[] {
    const response = [];
    let lastNode: ValueNode | undefined;
    let curContext: string | undefined;
    let curComments: Comments | undefined;

    for (let i = 0, len = tokens.length; i < len; i++) {
        if (tokens[i].key.toLowerCase() === 'msgctxt') {
            curContext = tokens[i].value;
            curComments = tokens[i].comments;
        } else if (tokens[i].key.toLowerCase() === 'msgid') {
            lastNode = {
                msgid: tokens[i].value,
                msgstr: [],
            };

            if (curContext !== undefined) {
                lastNode.msgctxt = curContext;
            }

            if (curComments !== undefined) {
                lastNode.comments = curComments;
            }

            if (tokens[i].comments && !lastNode.comments) {
                lastNode.comments = tokens[i].comments;
            }

            curContext = undefined;
            curComments = undefined;
            response.push(lastNode);
        } else if (tokens[i].key.toLowerCase() === 'msgid_plural') {
            if (lastNode) {
                // eslint-disable-next-line camelcase
                lastNode.msgid_plural = tokens[i].value;
            }

            if (tokens[i].comments && lastNode && !lastNode.comments) {
                lastNode.comments = tokens[i].comments;
            }

            curContext = undefined;
            curComments = undefined;
        } else if (tokens[i].key.substr(0, 6).toLowerCase() === 'msgstr') {
            if (lastNode) {
                lastNode.msgstr = (lastNode.msgstr || '').concat(tokens[i].value);
            }

            if (tokens[i].comments && lastNode && !lastNode.comments) {
                lastNode.comments = tokens[i].comments;
            }

            curContext = undefined;
            curComments = undefined;
        }
    }

    return response;
}

/**
 * Compose a translation table from tokens object
 */
function normalize(charset: string, tokens: ValueNode[]): translationObject {
    const table: translationObject = {
        charset: charset,
        headers: undefined,
        translations: {},
    };
    let msgctxt: string;

    for (let i = 0, len = tokens.length; i < len; i++) {
        msgctxt = tokens[i].msgctxt || '';

        if (!table.translations[msgctxt]) {
            table.translations[msgctxt] = {};
        }

        if (!table.headers && !msgctxt && !tokens[i].msgid) {
            table.headers = parseHeader(tokens[i].msgstr[0]);
        }

        table.translations[msgctxt][tokens[i].msgid] = tokens[i];
    }

    return table;
}

/**
 * Parses a PO object into translation table
 *
 */
function parse(buffer: Buffer | string): translationObject {
    const fileContents = typeof buffer === 'string' ? buffer : buffer.toString();
    const charset = 'utf-8';
    const parsedNodes = joinStringValues(lexer(fileContents));
    parseComments(parsedNodes);
    return normalize(charset, handleValues(handleKeys(parsedNodes)));
}

export async function poToJson(filebuffer: Buffer): Promise<Record<string, string>> {
    const object: translationObject = parse(filebuffer);
    const translations: Record<string, string> = {};
    const newTranslations = object.translations;
    const frenchTranslations = await getLocalesForLanguage('fr');

    for (const key of Object.keys(frenchTranslations)) {
        if (key.endsWith('_plural')) {
            continue;
        }
        if (newTranslations[key] !== undefined && newTranslations[key][frenchTranslations[key]] !== undefined) {
            const data: SingleTranslation = newTranslations[key][frenchTranslations[key]];
            if ((data.msgstr[0] || '').length === 0) {
                continue;
            }
            translations[key] = data.msgstr[0] || '';
            if (data.msgid_plural) {
                translations[`${key}_plural`] = data.msgstr[1] || '';
            }
        }
    }

    return translations;
}
