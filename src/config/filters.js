'use strict'

import mount from 'koa-mount';
import { jwtFilter } from '../api';

export default function configFilters (app) 
{
  app.use(mount('/', jwtFilter.routes()));
}
