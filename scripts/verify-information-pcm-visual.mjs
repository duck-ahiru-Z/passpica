import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { formatBytes, getPcmDataSize } from '../src/lib/informationPcm.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/information/pcm-sampling-visual/page.tsx'), 'utf8');
const drill = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/information/calculation-drill/page.tsx'), 'utf8');
const portal = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/page.tsx'), 'utf8');

assert.equal(getPcmDataSize({ sampleRate: 44100, bitDepth: 16, channels: 2, seconds: 1 }), 176400);
assert.equal(getPcmDataSize({ sampleRate: 48000, bitDepth: 24, channels: 2, seconds: 5 }), 1440000);
assert.equal(getPcmDataSize({ sampleRate: 32000, bitDepth: 16, channels: 1, seconds: 10 }), 640000);
assert.equal(formatBytes(176400), '176.4 kB');
assert.equal(formatBytes(1440000), '1.44 MB');
assert.match(page, /標本化周波数 × 量子化ビット数 × チャンネル数 × 秒数 ÷ 8/);
assert.match(page, /role="img" aria-labelledby="wave-title wave-desc"/);
assert.match(page, /選択した標本化周波数の全標本数ではありません/);
assert.match(page, /aria-label="標本化周波数"/);
assert.match(page, /aria-label="量子化ビット数"/);
assert.match(page, /name="pcm-channels"/);
assert.match(page, /aria-label="記録時間"/);
assert.match(page, /ヘッダーなどの付加情報は含みません/);
assert.match(page, /href="\/learn\/information\/calculation-drill"/);
assert.match(drill, /href="\/learn\/information\/pcm-sampling-visual"/);
assert.match(portal, /link: '\/learn\/information\/pcm-sampling-visual'/);
console.log('PCM visual verified: bit-rate formula, channel/rate/duration scaling, accessible conceptual sampling diagram, caveats, and drill/portal links.');
