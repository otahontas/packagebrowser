/**
 * @template K,V
 * @extends {Map<K,V>}
 * Class that mimics Python's defaultDictionary class: Getting a value will return
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
   *
   * If value not founds, sets key to have deepcopy of default value as its value. Also
   * ensures to Typescript that a some value is always returned
   */
  get(key: K): V {
    if (!this.has(key)) {
      this.set(key, JSON.parse(JSON.stringify(this.defaultValue)));
    }
    return super.get(key) || this.defaultValue;
  }
}

export default DefaultMap;
