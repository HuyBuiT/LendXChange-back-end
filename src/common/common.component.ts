import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';
import { SortDirection } from './common.enum';

export interface Response<T> {
  statusCode: string;
  data: T;
}

export class PagingRequest {
  //TODO implement sorts
  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  pageNum = 1;

  @ApiPropertyOptional({ default: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  pageSize = 10;

  //TODO the sort direction is quite useless
  sorts: Record<string, SortDirection>;

  get pagination(): [number, number, Record<string, SortDirection>] {
    return [this.pageNum - 1, this.pageSize, this.sorts || null];
  }
}

export class PagingResponse<T> {
  pageData: T[];
  @ApiProperty()
  pageNum: number;
  @ApiProperty()
  total: number;
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PagingResponse) },
          {
            properties: {
              pageData: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiSortQuery = (...allias: string[]) => {
  // quite lmao
  const example = {};
  example[(allias && allias?.[0] + '.id') || 'allias'] = SortDirection.DESC;
  return applyDecorators(
    ApiQuery({
      required: false,
      name: 'sorts',
      style: 'deepObject',
      explode: true,
      type: 'object',
      schema: {
        type: 'object',
        additionalProperties: {
          type: 'string',
          enum: Object.values(SortDirection),
        },
        example: example,
      },
      description: `allias: [${allias}], directions: ${Object.values(
        SortDirection,
      )}. format sorts[allias.field]=ASC`,
    }),
  );
};
