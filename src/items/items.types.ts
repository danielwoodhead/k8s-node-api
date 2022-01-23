/**
 * @tsoaModel
 * @example
 * {
 *   "id": 1,
 *   "name": "My item",
 *   "price": 10.5,
 *   "description": "My item description",
 *   "image": "http://image"
 * }
 */
export interface Item {
  /**
   * @isInt
   */
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface Items {
  [key: number]: Item;
}
