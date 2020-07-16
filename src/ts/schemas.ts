'use strict';
import { schema } from 'normalizr';

const tilesSchema = new schema.Entity('tiles');
export const minefieldSchema = new schema.Array(tilesSchema);