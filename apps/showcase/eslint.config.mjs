import next from 'eslint-config-next/core-web-vitals';
import { baseConfig } from '../../packages/config/eslint.base.mjs';

const config = [...next, ...baseConfig({ browser: true, node: true, react: true })];

export default config;
