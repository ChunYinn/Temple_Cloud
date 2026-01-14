/**
 * Centralized error messages for consistent user experience
 */
export const ERROR_MESSAGES = {
  AUTH: {
    REQUIRED: '請先登入',
    NO_PERMISSION: '您沒有權限執行此操作',
    NO_PERMISSION_TEMPLE: '您沒有權限管理這個廟宇',
    SESSION_EXPIRED: '登入已過期，請重新登入',
  },
  UPLOAD: {
    NO_FILE: '請選擇圖片檔案',
    INVALID_FORMAT: '請選擇有效的圖片格式 (JPG, PNG, WebP)',
    FILE_TOO_LARGE: '圖片大小不可超過 5MB',
    UPLOAD_FAILED: '上傳失敗',
    PROCESSING_FAILED: '圖片處理失敗',
    GALLERY_LIMIT: '相簿最多只能上傳 10 張圖片',
  },
  VALIDATION: {
    REQUIRED_FIELD: '此欄位為必填',
    INVALID_EMAIL: '請輸入有效的電子郵件',
    INVALID_PHONE: '請輸入有效的電話號碼',
    INVALID_URL: '請輸入有效的網址',
    INVALID_DATE: '請選擇有效的日期',
    INVALID_TIME: '請選擇有效的時間',
    NAME_TOO_SHORT: '名稱至少需要 2 個字元',
    NAME_TOO_LONG: '名稱不能超過 50 個字元',
    DESCRIPTION_TOO_LONG: '描述不能超過 500 個字元',
  },
  TEMPLE: {
    NOT_FOUND: '找不到廟宇',
    CREATE_FAILED: '廟宇建立失敗',
    UPDATE_FAILED: '廟宇更新失敗',
    DELETE_FAILED: '廟宇刪除失敗',
    SLUG_EXISTS: '此網址已被使用',
    INVALID_SLUG: '網址只能包含小寫字母、數字和連字號',
  },
  EVENT: {
    NOT_FOUND: '找不到活動',
    CREATE_FAILED: '活動建立失敗',
    UPDATE_FAILED: '活動更新失敗',
    DELETE_FAILED: '活動刪除失敗',
    REGISTRATION_CLOSED: '活動報名已結束',
    FULL_CAPACITY: '活動名額已滿',
  },
  SERVICE: {
    NOT_FOUND: '找不到服務項目',
    CREATE_FAILED: '服務項目建立失敗',
    UPDATE_FAILED: '服務項目更新失敗',
    DELETE_FAILED: '服務項目刪除失敗',
    INVALID_PRICE: '請輸入有效的金額',
  },
  ORDER: {
    NOT_FOUND: '找不到訂單',
    CREATE_FAILED: '訂單建立失敗',
    UPDATE_FAILED: '訂單更新失敗',
    DELETE_FAILED: '訂單刪除失敗',
    ALREADY_PAID: '此訂單已付款',
    PAYMENT_FAILED: '付款失敗，請稍後再試',
  },
  SERVER: {
    GENERIC: '伺服器錯誤，請稍後再試',
    DATABASE: '資料庫連線錯誤',
    NETWORK: '網路連線錯誤',
    TIMEOUT: '請求超時，請稍後再試',
  },
  SUCCESS: {
    SAVED: '儲存成功',
    CREATED: '建立成功',
    UPDATED: '更新成功',
    DELETED: '刪除成功',
    UPLOADED: '上傳成功',
    COPIED: '已複製到剪貼簿',
  },
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type ErrorMessage = typeof ERROR_MESSAGES[ErrorMessageKey][keyof typeof ERROR_MESSAGES[ErrorMessageKey]];