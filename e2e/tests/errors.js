const assert = require('chai').assert;
const createServer = require('../server-fixture');
const { openMockFile } = require('./_helpers');

const mockFileName = 'main.ts';

describe('Errors', () => {
    it('should return error for unknown property', () => {
        const server = createServer();
        openMockFile(server, mockFileName, 'function css(x) { return x; }; const q = css`boarder: 1px solid black;`');
        server.send({ command: 'semanticDiagnosticsSync', arguments: { file: 'main.ts' } });

        return server.close().then(() => {
            assert.strictEqual(server.responses.length, 3);
            const errorResponse = server.responses[2];
            assert.isTrue(errorResponse.success);
            assert.strictEqual(errorResponse.body.length, 1);
            const error = errorResponse.body[0];
            assert.strictEqual(error.text, 'Unknown property.');
            assert.strictEqual(error.start.line, 1);
            assert.strictEqual(error.start.offset, 46);
            assert.strictEqual(error.end.line, 1);
            assert.strictEqual(error.end.offset, 53);
        });
    });

    it('should not return errors for empty rulesets', () => {
        const server = createServer();
        openMockFile(server, mockFileName, 'function css(x) { return x; }; const q = css``');
        server.send({ command: 'semanticDiagnosticsSync', arguments: { file: 'main.ts' } });

        return server.close().then(() => {
            assert.strictEqual(server.responses.length, 3);
            const errorResponse = server.responses[2];
            assert.isTrue(errorResponse.success);
            assert.strictEqual(errorResponse.body.length, 0);
        });
    });

    it('should not return an error for a placeholder in a property', () => {
        const server = createServer();
        openMockFile(server, mockFileName, 'function css(strings, ...) { return ""; }; const q = css`color: ${"red"};`')
        server.send({ command: 'semanticDiagnosticsSync', arguments: { file: 'main.ts' } });

        return server.close().then(() => {
            assert.strictEqual(server.responses.length, 3);
            const errorResponse = server.responses[2];
            assert.isTrue(errorResponse.success);
            assert.strictEqual(errorResponse.body.length, 0);
        });
    });

    it('should not return an error for a placeholder in a property with a multiline string', () => {
        const server = createServer();
        openMockFile(server, mockFileName, [
            'function css(strings, ...) { return ""; }; const q = css`',
            '    color: ${"red"};',
            '`'].join('\n'));
        server.send({ command: 'semanticDiagnosticsSync', arguments: { file: 'main.ts' } });

        return server.close().then(() => {
            assert.strictEqual(server.responses.length, 3);
            const errorResponse = server.responses[2];
            assert.isTrue(errorResponse.success);
            assert.strictEqual(errorResponse.body.length, 0);
        });
    });
})
