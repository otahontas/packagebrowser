/**
 * @template K,V
 * @extends {Map<K,V>}
 * Class that mimics Python's defaultdict class: Getting a value will return
 * default value if the value would be undefined.
 *
 * Example usage:
 * ```
 * const defaultValue: Type[] = []
 * const map = new DefaultMap(defaultValue)
 * map.get("notInMap").push(1)
 * ```
 * --> map now has key "notInMap" with value [1]
 *
 */
class DefaultMap<K, V> extends Map<K, V> {
  defaultValue: V;

  constructor(defaultValue: V) {
    super();
    this.defaultValue = defaultValue;
  }

  /**
   * If value for key is not found, sets the value to be a deep copy of the default
   * value. Also keeps typescript happy by ensuring undefined is never returned.
   */
  get(key: K): V {
    if (!this.has(key)) {
      this.set(key, JSON.parse(JSON.stringify(this.defaultValue)));
    }
    return super.get(key) || JSON.parse(JSON.stringify(this.defaultValue));
  }
}

export default DefaultMap;
