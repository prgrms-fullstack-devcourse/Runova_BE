export const ErrorCode = {
  Common: {
    VALIDATION_FAILED: {
      code: "COMMON.VALIDATION_FAILED",
      message: "요청 형식이 올바르지 않습니다.",
      status: 400,
    },
    FORBIDDEN: {
      code: "COMMON.FORBIDDEN",
      message: "권한이 없습니다.",
      status: 403,
    },
    NOT_FOUND: {
      code: "COMMON.NOT_FOUND",
      message: "리소스를 찾을 수 없습니다.",
      status: 404,
    },
    CONFLICT: {
      code: "COMMON.CONFLICT",
      message: "충돌이 발생했습니다.",
      status: 409,
    },
    INTERNAL: {
      code: "COMMON.INTERNAL",
      message: "서버 내부 오류입니다.",
      status: 500,
    },
  },
  Auth: {
    UNAUTHORIZED: {
      code: "AUTH.UNAUTHORIZED",
      message: "인증이 필요합니다.",
      status: 401,
    },
    TOKEN_EXPIRED: {
      code: "AUTH.TOKEN_EXPIRED",
      message: "토큰이 만료되었습니다.",
      status: 401,
    },
    INVALID_TOKEN: {
      code: "AUTH.INVALID_TOKEN",
      message: "유효하지 않은 토큰입니다.",
      status: 401,
    },
  },
  Community: {
    POST_NOT_FOUND: {
      code: "COMMUNITY.POST_NOT_FOUND",
      message: "게시글을 찾을 수 없습니다.",
      status: 404,
    },
    COMMENT_NOT_FOUND: {
      code: "COMMUNITY.COMMENT_NOT_FOUND",
      message: "댓글을 찾을 수 없습니다.",
      status: 404,
    },
  },
} as const;
