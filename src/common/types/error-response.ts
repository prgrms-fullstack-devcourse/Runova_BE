export interface ErrorResponseBody {
  code: string; // 예: 'COMMUNITY.POST_NOT_FOUND'
  message: string; // 사용자 표시용 메시지
  details?: any; // 필드 에러, 추가정보(선택)
  path: string; // 요청 경로
  method: string; // GET/POST/...
  timestamp: string; // ISO
  requestId?: string; // (선택) X-Request-Id 등
}


