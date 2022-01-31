import {
  Controller,
  Get,
  Path,
  Res,
  Response,
  Route,
  Tags,
  TsoaResponse,
} from "tsoa";
import { HttpStatusCode } from "../common/httpStatusCode";
import {
  notFoundResponseArgs,
  ProblemDetails,
  ValidationProblemDetails,
} from "../common/problemDetails";
import * as ItemService from "./items.service";
import { Item } from "./items.types";

@Route("items")
@Tags("items")
export class ItemsController extends Controller {
  /**
   * @isInt id
   */
  @Get("{id}")
  @Response<ValidationProblemDetails>(HttpStatusCode.BAD_REQUEST, "Bad Request")
  public async getItem(
    @Path() id: number,
    @Res()
    notFoundResponse: TsoaResponse<HttpStatusCode.NOT_FOUND, ProblemDetails>
  ): Promise<Item> {
    const item: Item = await ItemService.find(id);

    if (!item) {
      return notFoundResponse(...notFoundResponseArgs("Item not found"));
    }

    return item;
  }
}
