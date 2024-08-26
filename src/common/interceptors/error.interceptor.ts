import {
  BadGatewayException,
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof AxiosError) {
          return throwError(
            () =>
              new BadGatewayException({
                error: {
                  statusCode: err.response.data?.statusCode || err.status,
                  errorMessage: err.response.data?.message || err.code,
                  path: err.request.path,
                },
              }),
          );
        }

        if (!(err instanceof HttpException)) {
          return throwError(
            () => new InternalServerErrorException(err.message),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
