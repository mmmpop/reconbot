import buffer from 'buffer';
import process from 'process';
import url from 'url';

// Hack to get mqtt package work with Webpack 5
window.Buffer = buffer.Buffer;
window.process = process;
window.url = url;

export {};