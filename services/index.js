import batchMiddleware from './batchMiddleware';
import streamMiddleware from './streamMiddleware';

export default {
  batch: {
    id: 'batch',
    middleware: batchMiddleware
  },
  stream: {
    id: 'stream',
    middleware: streamMiddleware
  }
};
