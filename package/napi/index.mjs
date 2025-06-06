import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const { platform, arch } = process

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);
const native = require(`${__dirname}/rcli.${platform}-${arch}.node`);

export default native;
