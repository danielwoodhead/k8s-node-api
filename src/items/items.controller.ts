import { Controller, Get, Path, Response, Route, Tags } from "tsoa";
import { ValidationError } from "../common/common.types";
import * as ItemService from "./items.service";
import { Item } from "./items.types";

@Route("items")
@Tags("items")
export class ItemsController extends Controller {
  /**
   * @isInt id
   */
  @Get("{id}")
  @Response<ValidationError>(400, "Validation Failed")
  @Response(404, "Not Found")
  public async getItem(@Path() id: number) {
    const item: Item = await ItemService.find(id);

    if (item) {
      return item;
    }

    this.setStatus(404);
  }
}
