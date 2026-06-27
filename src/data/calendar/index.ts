import { ExamEvent } from './types';
import { nationalEvents } from './national';
import { kawaiEvents } from './kawai';
import { sundaiEvents } from './sundai';
import { toshinEvents } from './toshin';

export * from './types';

export const EXAM_MASTER_DATA: ExamEvent[] = [
  ...nationalEvents,
  ...kawaiEvents,
  ...sundaiEvents,
  ...toshinEvents,
];
