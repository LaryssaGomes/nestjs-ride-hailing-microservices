import { HttpException, HttpStatus } from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

interface RpcErrorResponse {
  statusCode?: number;
  message?: string;
}

// Converte o erro serializado por uma RpcException do microservice em um HttpException com o status correto.
export function handleRpcErrors<T>(source: Observable<T>): Observable<T> {
  return source.pipe(
    catchError((error: RpcErrorResponse) => {
      const status = error?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error?.message ?? 'Internal server error';
      return throwError(() => new HttpException(message, status));
    }),
  );
}
