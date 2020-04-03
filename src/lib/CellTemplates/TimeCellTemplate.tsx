import * as React from 'react';
import { keyCodes } from '../Functions/keyCodes';
import { CellTemplate, Cell, Compatible, Uncertain, UncertainCompatible } from '../Model';
import { inNumericKey, isNavigationKey, isAlphaNumericKey } from './keyCodeCheckings'
import { getCellProperty } from '../Functions/getCellProperty';
import { getTimestamp, getFormattedTimeUnit, getDefaultDate } from './timeUtils';

export interface TimeCell extends Cell {
    type: 'time';
    time?: Date;
    format?: Intl.DateTimeFormat;
}

export class TimeCellTemplate implements CellTemplate<TimeCell> {

    static dayInMillis: number = 86400000;
    static defaultDate: string = getDefaultDate();

    getCompatibleCell(uncertainCell: Uncertain<TimeCell>): Compatible<TimeCell> {
        const time = uncertainCell.time ? getCellProperty(uncertainCell, 'time', 'object') : new Date(NaN);
        const timeFormat = uncertainCell.format || new Intl.DateTimeFormat(window.navigator.language);
        const value = time.getTime() % TimeCellTemplate.dayInMillis; // each day has 86400000 millis
        const text = !Number.isNaN(value) ? timeFormat.format(time) : '';
        return { ...uncertainCell, time, value, text }
    }

    handleKeyDown(cell: Compatible<TimeCell>, keyCode: number, ctrl: boolean, shift: boolean, alt: boolean): { cell: Compatible<TimeCell>, enableEditMode: boolean } {
        if (!ctrl && !alt && !shift && isAlphaNumericKey(keyCode))
            return { cell: this.getCompatibleCell({ ...cell }), enableEditMode: true }
        return { cell, enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER }
    }

    update(cell: Compatible<TimeCell>, cellToMerge: UncertainCompatible<TimeCell>): Compatible<TimeCell> {
        const timestamp = getTimestamp(cellToMerge.text);
        if (cellToMerge.text !== '' && !Number.isNaN(timestamp))
            return this.getCompatibleCell({ ...cell, time: new Date(timestamp) });
        return this.getCompatibleCell({ ...cell, time: new Date(cellToMerge.value) });
    }

    getClassName(cell: Compatible<TimeCell>, isInEditMode: boolean) {
        return cell.className ? cell.className : '';
    }

    render(cell: Compatible<TimeCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<TimeCell>, commit: boolean) => void): React.ReactNode {

        if (!isInEditMode)
            return cell.text;

        const hours = getFormattedTimeUnit(cell.time!.getHours());
        const minutes = getFormattedTimeUnit(cell.time!.getMinutes());

        return <input
            ref={input => {
                if (input) input.focus();
            }}
            type="time"
            defaultValue={`${hours}:${minutes}`}
            onChange={e => {
                const timestamp = getTimestamp(e.currentTarget.value);
                if (!Number.isNaN(timestamp)) onCellChanged(this.getCompatibleCell({ ...cell, time: new Date(timestamp) }), false);
            }}
            onBlur={e => {
                const timestamp = getTimestamp(e.currentTarget.value);
                if (!Number.isNaN(timestamp)) onCellChanged(this.getCompatibleCell({ ...cell, time: new Date(timestamp) }), true);
            }}
            onKeyDown={e => {
                if (inNumericKey(e.keyCode) || isNavigationKey(e.keyCode) || (e.keyCode === keyCodes.COMMA || e.keyCode === keyCodes.PERIOD)) e.stopPropagation();
                if (!inNumericKey(e.keyCode) && !isNavigationKey(e.keyCode) && (e.keyCode !== keyCodes.COMMA && e.keyCode !== keyCodes.PERIOD)) e.preventDefault();
            }}
            onCopy={e => e.stopPropagation()}
            onCut={e => e.stopPropagation()}
            onPaste={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
        />
    }
}