export function loadState<T>(initialState: T, stateName: string) {
  try {
    let serializedState = localStorage.getItem(stateName);

    if (serializedState === null) {
      return initialState;
    }

    return JSON.parse(serializedState);
  } catch (err) {
    return initialState;
  }
}

export function saveState<T>(state: T, stateName: string) {
  try {
    let serializedState = JSON.stringify(state);
    localStorage.setItem(stateName, serializedState);
  } catch (err) {}
}
