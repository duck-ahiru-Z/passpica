import { MockExamData, NationalExamData } from './types';
import { nationalEvents } from './national';
import { kawaiEvents } from './kawai';
import { sundaiEvents } from './sundai';
import { toshinEvents } from './toshin';
import { yozemiEvents } from './yozemi';

export * from './types';

export const NATIONAL_MASTER_DATA: NationalExamData[] = nationalEvents;

export const MOCK_MASTER_DATA: MockExamData[] = [
  ...kawaiEvents,
  ...sundaiEvents,
  ...toshinEvents,
  ...yozemiEvents,
];
