import { ReactGridProps, State } from '../Model';
import { recalcVisibleRange, focusLocation } from '.';
import { defaultCellTemplates } from './defaultCellTemplates';
import { CellMatrixBuilder } from '../Model/CellMatrixBuilder';


export function getDerivedStateFromProps(props: ReactGridProps, state: State): State {

    const stateDeriverWithProps = stateDeriver(props);

    state = stateDeriverWithProps(state)(updateStateProps);

    state = stateDeriverWithProps(state)(appendCellTamplatesAndHighlights);

    state = stateDeriverWithProps(state)(updateCellMatrix);

    state = stateDeriverWithProps(state)(updateFocusedLocation);

    state = stateDeriverWithProps(state)(updateVisibleRange);

    state = stateDeriverWithProps(state)(setInitialFocusLocation);

    return state;
}

export const stateDeriver = (props: ReactGridProps) => (state: State) => (fn: (props: ReactGridProps, state: State) => State) => fn(props, state);

export const dataHasChanged = (props: ReactGridProps, state: State): boolean => {
    return !state.cellMatrix || props !== state.cellMatrix.props;
}

export function updateStateProps(props: ReactGridProps, state: State): State {
    if (state.props !== props) {
        state = { ...state, props };
    }
    return state;
}

function updateCellMatrix(props: ReactGridProps, state: State): State {
    if (dataHasChanged(props, state)) {
        const builder = new CellMatrixBuilder();
        return {
            ...state,
            cellMatrix: builder.setProps(props).fillRowsAndCols().fillSticky().fillScrollableRange()
                .setEdgeLocations().getCellMatrix()
        };
    }
    return state;
}

export function updateFocusedLocation(props: ReactGridProps, state: State): State {
    if (state.cellMatrix.columns.length > 0 && state.focusedLocation && !state.currentlyEditedCell) {
        state = { ...state, focusedLocation: state.cellMatrix.validateLocation(state.focusedLocation) };
    }
    return state;
}

function updateVisibleRange(props: ReactGridProps, state: State): State {
    if (state.visibleRange && dataHasChanged(props, state)) {
        state = recalcVisibleRange(state);
    }
    return state;
}

export function appendCellTamplatesAndHighlights(props: ReactGridProps, state: State): State {
    return {
        ...state,
        highlightLocations: props.highlights ?? [],
        cellTemplates: { ...defaultCellTemplates, ...props.customCellTemplates },
    }
}

export function setInitialFocusLocation(props: ReactGridProps, state: State): State {
    const locationToFocus = props.focusLocation;
    if (locationToFocus && !state.focusedLocation) {
        return focusLocation(state, state.cellMatrix.getLocationById(locationToFocus.rowId, locationToFocus.columnId))
    }
    return state;
}
