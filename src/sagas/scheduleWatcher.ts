import { delay } from 'redux-saga';
import { put, select } from 'redux-saga/effects';
import { RootState, Watcher, WatcherTimer } from '../types';
import {
  ScheduleWatcherTick,
  SetWatcherTimer,
  setWatcherTimer
} from '../actions/watcher';
import {
  acceptHitRequestFromWatcher,
  AcceptHitRequestFromWatcher
} from '../actions/accept';
import { getWatcher } from '../selectors/watchers';

export function* acceptHitAfterWatcherDelay(action: ScheduleWatcherTick) {
  try {
    const watcher: Watcher = yield select(getWatcher(action.id));

    const readyToAccept: boolean = yield waitForWatcherDelay(
      watcher.groupId,
      watcher.delay
    );

    if (readyToAccept) {
      return yield put<AcceptHitRequestFromWatcher>(
        acceptHitRequestFromWatcher(watcher.groupId)
      );
    }
  } catch (e) {
    console.warn(e);
  }
}

function* waitForWatcherDelay(watcherId: string, delayInSeconds: number) {
  try {
    const origin = Date.now();
    yield put<SetWatcherTimer>(
      setWatcherTimer(watcherId, delayInSeconds, origin)
    );

    yield delay(delayInSeconds * 1000);

    /**
     * It's possible that a watcher is deleted during the delay.
     */
    const watcher: Watcher | undefined = yield select((state: RootState) =>
      state.watchers.get(watcherId)
    );

    /**
     * It's possible that a watcher is cancelled during the delay.
     */
    const watcherTimer: WatcherTimer | undefined = yield select(
      (state: RootState) => state.watcherTimes.get(watcherId)
    );

    /**
     * If the origin of the watcher after the delay and the origin from the action
     * are not the same, that means the user cancelled the original watcher and
     * restarted it during the delay. In that case, return false.
     */

    if (watcher && watcherTimer && watcherTimer.origin === origin) {
      return yield true;
    } else {
      return yield false;
    }
  } catch (e) {
    console.warn(e);
    return false;
  }
}
