export class ResponseResult<T = any> {
  status_code: number;
  message: string;
  data?: T;
  error?: any;

  constructor(partial: Partial<ResponseResult<T>>) {
    Object.assign(this, partial);
  }
}

export const ResponseSuccess = <T>(
  status_code = 200,
  message = 'Thành công',
  data: T,
): ResponseResult<T> => {
  return new ResponseResult<T>({
    status_code,
    message,
    data,
  });
};

export const ResponseError = (
  status_code = 500,
  message = 'Đã xảy ra lỗi',
  error: any = null,
): ResponseResult<null> => {
  return new ResponseResult<null>({
    status_code,
    message,
    error,
  });
};
