import { State, ClipboardEvent, Compatible, Cell } from '../Model';
import { getActiveSelectedRange, emptyCell } from '.';
import { pasteData } from './pasteData';

export function handlePaste(event: ClipboardEvent, state: State) {
    const activeSelectedRange = getActiveSelectedRange(state);
    if (!activeSelectedRange) {
        return state;
    }
    let pastedCell: Compatible<Cell> = emptyCell;
    const htmlData = event.clipboardData.getData('text/html');
    const document = new DOMParser().parseFromString(htmlData, 'text/html');
    // TODO Do we need selection mode here ?
    //const selectionMode = parsedData.body.firstElementChild && parsedData.body.firstElementChild.getAttribute('data-selection') as SelectionMode;
    // TODO quite insecure! maybe do some checks ?
    const hasReactGridAttribute = document.body.firstElementChild!.getAttribute('data-reactgrid') === 'reactgrid-content';
    if (hasReactGridAttribute) {
        const tableRows = document.body.firstElementChild!.firstElementChild!.children;
        const rawData = tableRows[0].children[0].getAttribute('data-reactgrid');
        const data = rawData && JSON.parse(rawData);
        pastedCell = data ? data : { type: 'text', text: tableRows[0].children[0].innerHTML, value: parseFloat(tableRows[0].children[0].innerHTML) }
    } else {
        const text = event.clipboardData.getData('text/plain');
        pastedCell = { type: 'text', text, value: parseFloat(text) }
    }
    event.preventDefault();
    return { ...pasteData(state, activeSelectedRange, pastedCell) };
}