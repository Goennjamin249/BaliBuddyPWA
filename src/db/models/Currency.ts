/**
 * Currency Model for WatermelonDB
 * Stores currency exchange rates for offline conversion
 */

import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class Currency extends Model {
  static table = 'currencies';

  @text('code') code!: string;
  @text('name') name!: string;
  @text('symbol') symbol!: string;
  @field('rate_to_idr') rateToIdr!: number;
  @field('last_updated') lastUpdated!: number;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
