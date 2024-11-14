/**
 * Resets specified properties of an object to their initial state.
 * This function is generic and can work with any type that has keys which can be indexed.
 *
 * The `path` parameter specifies which property(ies) to reset. It can be a single property key
 * or an array of keys. If a key represents a path to a nested property, it should be in dot notation.
 * For example, 'user.name' would reset the 'name' property in a nested 'user' object.
 *
 * If any part of the path does not exist in either the current or initial state, that path is skipped.
 *
 * @template T - The type of the state objects.
 * @param {T} currentState - The current state object.
 * @param {T} initialState - The initial state object, containing the values to reset to.
 * @param {keyof T | Array<keyof T>} path - The property key(s) to reset, can be a single key or an array of keys.
 * @returns {T} - The new state object with the specified properties reset.
 *
 * @example
 * // Given a state object
 * const currentState = { user: { name: 'Alice', age: 30 }, theme: 'dark' };
 * const initialState = { user: { name: 'Bob', age: 25 }, theme: 'light' };
 *
 * // Resetting a single property
 * const newState = resetStateProperty(currentState, initialState, 'theme');
 * // newState will be { user: { name: 'Alice', age: 30 }, theme: 'light' }
 *
 * // Resetting a nested property
 * const anotherState = resetStateProperty(currentState, initialState, 'user.name');
 * // anotherState will be { user: { name: 'Bob', age: 30 }, theme: 'dark' }
 */
export function resetStateProperty<T>(
  currentState: T,
  initialState: T,
  path: keyof T | (string & keyof T) | Array<keyof T | (string & keyof T)>
): T {
  if (typeof path === 'string') {
    path = [path]
  }

  const newState = { ...currentState }

  ;(path as any[]).forEach((p) => {
    const keys = p.split('.')
    let current: any = newState
    let initial: any = initialState

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || !initial[key]) {
        return // Path not valid or does not exist
      }
      current[key] = { ...current[key] }
      current = current[key]
      initial = initial[key]
    }

    const lastKey = keys[keys.length - 1]
    current[lastKey] = initial[lastKey]
  })

  return newState
}
